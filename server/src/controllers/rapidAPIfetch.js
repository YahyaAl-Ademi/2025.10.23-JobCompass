import { logError } from "../util/logging.js";
import { persistSearchResults } from "../services/persistSearchResults.js";

export async function rapidAPIfetch(
  connectedClient,
  searchWord,
  search_string,
  is_auth = false,
  location = "Netherlands",
) {
  const aggregated = [];
  const offsets = [];
  let initialOffset = 0;

  let limit = 5;
  let maxIterations = 1;
  if (is_auth) {
    limit = 25;
    maxIterations = 4;
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
      aggregated.push(...apiResult);
    } else {
      logError(`Unexpected API response shape: ${JSON.stringify(apiResult)}`);
    }
  });

  return await persistSearchResults(
    connectedClient,
    aggregated,
    searchWord,
    search_string,
    is_auth,
  );
}
