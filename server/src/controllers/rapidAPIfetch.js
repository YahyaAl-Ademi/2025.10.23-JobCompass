import { logError } from "../util/logging.js";
import processJobPost from "../util/processJobPost.js";

export async function rapidAPIfetch(
  connectedClient,
  searchWord,
  search_string = null,
  location = "Netherlands",
  limit = 5,
  maxIterations = 1,
  initialOffset = 0,
) {
  const aggregated = [];

  const offsets = [];
  for (let i = 0; i < maxIterations; i++) {
    offsets.push(initialOffset + i * limit);
  }
  const options = {
    method: "GET",
    headers: {
      "x-rapidapi-key": process.env.X_RAPIDAPI_KEY,
      "x-rapidapi-host": "linkedin-job-search-api.p.rapidapi.com",
    },
  };

  const fetchPromises = offsets.map((offset) => {
    const url = `https://linkedin-job-search-api.p.rapidapi.com/active-jb-7d?limit=${limit}&offset=${offset}&title_filter=${encodeURIComponent(
      searchWord,
    )}&location_filter=${encodeURIComponent(location)}&description_type=text`;

    return fetch(url, options).then(async (apiResponse) => {
      if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        logError(
          `Linkedin API Error status: ${apiResponse.status} - ${apiResponse.statusText}`,
        );
        logError(`Linkedin API Error: ${errorText}`);
        throw new Error(`Failed to fetch from Linkedin API: ${errorText}`);
      }
      return apiResponse.json();
    });
  });

  // Run all requests concurrently and aggregate results
  const results = await Promise.all(fetchPromises);

  results.forEach((apiResult) => {
    if (Array.isArray(apiResult)) {
      aggregated.push(...apiResult);
    } else {
      logError(`Unexpected API response shape: ${JSON.stringify(apiResult)}`);
    }
  });

  // Background persistence uses provided DB connection
  if (connectedClient) {
    (async () => {
      try {
        await connectedClient.query(
          "INSERT INTO search_words (search_word, search_date) VALUES ($1, NOW()) ON CONFLICT (search_word) DO UPDATE SET search_date = NOW()",
          [searchWord],
        );

        if (search_string && search_string !== searchWord) {
          await connectedClient.query(
            "INSERT INTO search_words (search_word, search_date) VALUES ($1, NOW()) ON CONFLICT (search_word) DO UPDATE SET search_date = NOW()",
            [search_string],
          );
        }

        for (const job of aggregated) {
          if (!job.id) continue;

          try {
            const checkJob = await connectedClient.query(
              "SELECT 1 FROM jobs WHERE id = $1",
              [job.id],
            );

            if (checkJob.rows.length === 0) {
              const processedJob = processJobPost(job);
              await connectedClient.query(
                `INSERT INTO jobs (
                  id, date_posted, title, organization, organization_url,
                  employment_type, url, organization_logo, display_location,
                  work_mode, seniority, description_text, normalized_description
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
                [
                  processedJob.id,
                  processedJob.date_posted,
                  processedJob.title,
                  processedJob.organization,
                  processedJob.organization_url,
                  processedJob.employment_type,
                  processedJob.url,
                  processedJob.organization_logo,
                  processedJob.display_location,
                  processedJob.work_mode,
                  processedJob.seniority,
                  processedJob.description_text,
                  processedJob.normalized_description,
                ],
              );
            }

            await connectedClient.query(
              "INSERT INTO search_words_jobs (search_word, job_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
              [searchWord, job.id],
            );

            if (search_string && search_string !== searchWord) {
              await connectedClient.query(
                "INSERT INTO search_words_jobs (search_word, job_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
                [search_string, job.id],
              );
            }
          } catch (jobErr) {
            logError(`Error persisting job ${job.id}: ${jobErr}`);
          }
        }
      } catch (err) {
        logError(`Background persistence overall error: ${err}`);
      }
    })();
  } else {
    logError("Background persistence skipped: no connectedClient provided.");
  }

  return aggregated;
}
