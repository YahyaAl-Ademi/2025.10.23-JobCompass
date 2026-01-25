import { persistJobSearch } from "./persistJobSearch.js";
import { logError } from "../util/logging.js";

export async function fetchPersister(inProgressSearches, search_term) {
  const { isBackgroundFetch, fetcher, is_auth, is_whole_string } =
    inProgressSearches[search_term];
  let fetchedJobs;

  if (isBackgroundFetch) {
    (async () => {
      try {
        fetchedJobs = await fetcher(search_term);
        await persistJobSearch(
          fetchedJobs,
          search_term,
          is_auth,
          is_whole_string,
        );
      } catch (error) {
        logError(
          `Background fetch failed for search term '${search_term}': ${error.message}`,
        );
      } finally {
        delete inProgressSearches[search_term];
      }
    })();
  } else {
    fetchedJobs = await fetcher(search_term);
    (async () => {
      try {
        await persistJobSearch(
          fetchedJobs,
          search_term,
          is_auth,
          is_whole_string,
        );
      } catch (error) {
        logError(
          `Background persistence failed for search term '${search_term}': ${error.message}`,
        );
      } finally {
        delete inProgressSearches[search_term];
      }
    })();
    return fetchedJobs;
  }
}
