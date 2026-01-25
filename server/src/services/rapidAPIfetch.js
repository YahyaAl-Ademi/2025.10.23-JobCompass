import { logError } from "../util/logging.js";
import processRapidAPIjob from "../util/processRapidAPIjob.js";

if (!process.env.X_RAPIDAPI_KEY) {
  throw new Error("X_RAPIDAPI_KEY environment variable is not set");
}

export default async function rapidAPIfetch(
  searchWord,
  is_auth,
  location = "Netherlands",
) {
  const aggregated = [];
  let currentIteration = 0;
  let maxIterations;
  let limit;
  if (is_auth) {
    limit = 100;
  } else {
    limit = 5;
    maxIterations = 1;
  }

  const options = {
    method: "GET",
    headers: {
      "x-rapidapi-key": process.env.X_RAPIDAPI_KEY,
      "x-rapidapi-host": "linkedin-job-search-api.p.rapidapi.com",
    },
  };

  let continueLoop = true;
  let currentOffset = 0;
  while (continueLoop) {
    const url = `https://linkedin-job-search-api.p.rapidapi.com/active-jb-7d?limit=${limit}&offset=${currentOffset}&title_filter=${encodeURIComponent(
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
        // Stop if apiResult.length === 0
        if (apiResult.length === 0) {
          continueLoop = false;
        }

        aggregated.push(
          ...apiResult
            .map((job) => processRapidAPIjob(job))
            .filter((job) => job !== null),
        );
      } else {
        logError(`Unexpected API response shape: ${JSON.stringify(apiResult)}`);
        continueLoop = false;
      }
    } catch (error) {
      logError(`Error fetching offset ${currentOffset}: ${error.message}`);
      // Continue with next offset instead of failing completely
    }

    currentOffset += limit;
    currentIteration++;

    // Stop if !is_auth && maxIterations is reached
    if (!is_auth && currentIteration >= maxIterations) {
      continueLoop = false;
    }
  }

  return aggregated;
}
