import { logError } from "../util/logging.js";
import { rapidAPIfetch } from "./rapidAPIfetch.js";
import processJobPost from "../util/processJobPost.js";
import connectNeonDB from "../db/connectNeonDB.js";
import { getCachedJobsBySearchWords } from "../services/getCachedJobsBySearchWords.js";

export async function searchJobs(req, res) {
  try {
    const { search_terms } = req.body;
    const aggregatedJobsIdsSet = new Set();
    let aggregatedJobs = [];
    if (typeof search_terms !== "string" || !search_terms.trim()) {
      return res.status(400).json({
        success: false,
        msg: "You need to provide 'search_terms' (non-empty string) in the request body.",
      });
    }

    // Check if search_terms is cached
    const { connectedClient, endConnection } = await connectNeonDB();
    const cachedJobsForSearchTerms = await getCachedJobsBySearchWords(
      connectedClient,
      search_terms,
    );
    if (cachedJobsForSearchTerms.length > 0) {
      aggregatedJobs = cachedJobsForSearchTerms;
    } else {
      const searchWords = search_terms
        .split(new RegExp("[\\s\\-.'/]+"))
        .filter(Boolean);
      // Fetch results for all search words concurrently
      const fetchPromises = searchWords.map(async (searchWord, i) => {
        // Try to get cached jobs first
        const cachedJobs = await getCachedJobsBySearchWords(
          connectedClient,
          searchWord,
        );
        if (cachedJobs.length > 0) {
          return cachedJobs;
        }
        // If not cached or DB error, use real search
        return searchWords.length > 2 && i >= 2
          ? new Promise((resolve) =>
              setTimeout(
                () =>
                  resolve(
                    rapidAPIfetch(connectedClient, searchWord, search_terms),
                  ),
                (i - 1) * 700,
              ),
            )
          : rapidAPIfetch(connectedClient, searchWord, search_terms);
      });

      const fetchedJobsArrays = await Promise.all(fetchPromises);
      for (const fetchedJobs of fetchedJobsArrays) {
        for (const job of fetchedJobs) {
          if (job.id && !aggregatedJobsIdsSet.has(job.id)) {
            aggregatedJobs.push(processJobPost(job));
            aggregatedJobsIdsSet.add(job.id);
          }
        }
      }
    }
    if (endConnection) await endConnection();
    res.status(200).json({ success: true, result: aggregatedJobs });
  } catch (error) {
    logError(`searchJobs error: ${error}`);
    res.status(500).json({
      success: false,
      msg: "Unable to search for jobs, please try again later.",
    });
  }
}
