import { logError } from "../util/logging.js";
import processJobPost from "../util/processJobPost.js";

export async function persistSearchResults(
  connectedClient,
  aggregated,
  searchWord,
  search_string,
  is_auth = null,
) {
  const normalizedJobs = [];

  try {
    await connectedClient.query(
      "INSERT INTO search_strings (search_string, search_date, is_auth) VALUES ($1, NOW(), $2) ON CONFLICT (search_string) DO UPDATE SET search_date = NOW(), is_auth = $2",
      [searchWord, is_auth],
    );

    if (search_string && search_string !== searchWord) {
      await connectedClient.query(
        "INSERT INTO search_strings (search_string, search_date, is_auth) VALUES ($1, NOW(), $2) ON CONFLICT (search_string) DO UPDATE SET search_date = NOW(), is_auth = $2",
        [search_string, is_auth],
      );
    }

    for (const job of aggregated) {
      if (!job.id) continue;

      try {
        const processedJob = processJobPost(job);
        normalizedJobs.push(processedJob);

        const checkJob = await connectedClient.query(
          "SELECT 1 FROM jobs WHERE id = $1",
          [job.id],
        );

        if (checkJob.rows.length === 0) {
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
          "INSERT INTO search_strings_jobs (search_string, job_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
          [searchWord, job.id],
        );

        if (search_string && search_string !== searchWord) {
          await connectedClient.query(
            "INSERT INTO search_strings_jobs (search_string, job_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
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

  return normalizedJobs;
}
