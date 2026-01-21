import { logError } from "../util/logging.js";
import { processRapidAPIjob } from "../util/processRapidAPIjob.js";

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
    limit = 7;
    maxIterations = 1;
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
      aggregated.push(...apiResult.map((job) => processRapidAPIjob(job)));
    } else {
      logError(`Unexpected API response shape: ${JSON.stringify(apiResult)}`);
    }
  });

  return aggregated;
}
