import connectNeonDB from "../db/connectNeonDB.js";
import { persistJobSearch } from "./persistJobSearch.js";

export function fetchPersister(
  search_string,
  is_auth,
  inProgressSearches,
  fetcher,
) {
  (async () => {
    let fetchedJobs;
    if (fetcher) {
      fetchedJobs = await fetcher(search_string);
    } else {
      fetchedJobs = inProgressSearches?.[search_string]?.fetchedJobs;
    }

    const {
      connectedClient,
      error: connectionError,
      endConnection,
    } = await connectNeonDB();

    if (!connectionError) {
      await persistJobSearch(
        connectedClient,
        fetchedJobs,
        search_string,
        is_auth,
      );
      if (endConnection) await endConnection();
    }

    delete inProgressSearches[search_string];
  })();
}
