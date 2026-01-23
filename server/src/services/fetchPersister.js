import connectNeonDB from "../db/connectNeonDB.js";
import { persistJobSearch } from "./persistJobSearch.js";

export function fetchPersister(inProgressSearches, search_term, fetcher) {
  (async () => {
    const is_auth = inProgressSearches?.[search_term]?.is_auth;
    let fetchedJobs;
    if (fetcher) {
      fetchedJobs = await fetcher(search_term);
    } else {
      fetchedJobs = inProgressSearches?.[search_term]?.fetchedJobs;
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
        search_term,
        is_auth,
      );
      if (endConnection) await endConnection();
    }

    delete inProgressSearches[search_term];
  })();
}
