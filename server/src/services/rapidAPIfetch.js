import { logError } from "../util/logging.js";
import processRapidAPIjob from "../util/processRapidAPIjob.js";

if (!process.env.X_RAPIDAPI_KEY) {
  throw new Error("X_RAPIDAPI_KEY environment variable is not set");
}

export async function rapidAPIfetch(
  searchWord,
  is_auth,
  location = "Netherlands",
) {
  const aggregated = [];
  const offsets = [];
  let initialOffset = 0;

  let limit = 5;
  let maxIterations = 1;
  if (is_auth) {
    limit = 100;
    maxIterations = 12;
  }
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

  // Run requests sequentially and aggregate results
  for (const offset of offsets) {
    const url = `https://linkedin-job-search-api.p.rapidapi.com/active-jb-7d?limit=${limit}&offset=${offset}&title_filter=${encodeURIComponent(
      searchWord,
    )}&location_filter=${encodeURIComponent(location)}&description_type=text`;

    try {
      const apiResponse = await fetch(url, options);

      if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        logError(
          `Linkedin API Error status: ${apiResponse.status} - ${apiResponse.statusText}`,
        );
        logError(`Linkedin API Error: ${errorText}`);
        throw new Error(`Failed to fetch from Linkedin API: ${errorText}`);
      }

      const apiResult = await apiResponse.json();

      if (Array.isArray(apiResult)) {
        aggregated.push(
          ...apiResult
            .map((job) => processRapidAPIjob(job))
            .filter((job) => job !== null),
        );
      } else {
        logError(`Unexpected API response shape: ${JSON.stringify(apiResult)}`);
      }
    } catch (error) {
      logError(`Error fetching offset ${offset}: ${error.message}`);
      // Continue with next offset instead of failing completely
    }
  }

  return aggregated;
}
