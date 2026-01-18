import { logError } from "../util/logging.js";
import { rapidAPIfetch } from "./rapidAPIfetch.js";
import processJobPost from "../util/processJobPost.js";
import connectNeonDB from "../db/connectNeonDB.js";
import { getCachedJobsBySearchString } from "../services/getCachedJobsBySearchString.js";

export async function searchJobs(req, res) {
  try {
    const { search_string } = req.body;
    const aggregatedJobsIdsSet = new Set();
    let aggregatedJobs = [];
    if (typeof search_string !== "string" || !search_string.trim()) {
      return res.status(400).json({
        success: false,
        msg: "You need to provide 'search_string' (non-empty string) in the request body.",
      });
    }

    // Check if search_string is cached
    const { connectedClient, endConnection } = await connectNeonDB();
    const cachedJobsPerSearchString = await getCachedJobsBySearchString(
      connectedClient,
      search_string,
    );
    if (cachedJobsPerSearchString.length > 0) {
      aggregatedJobs = cachedJobsPerSearchString;
    } else {
      const searchWords = search_string
        .split(new RegExp("[\\s\\-.'/]+"))
        .filter(Boolean);
      // Fetch results for all search words concurrently
      const fetchPromises = searchWords.map(async (searchWord, i) => {
        // Try to get cached jobs first
        const cachedJobs = await getCachedJobsBySearchString(
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
                    rapidAPIfetch(connectedClient, searchWord, search_string),
                  ),
                (i - 1) * 700,
              ),
            )
          : rapidAPIfetch(connectedClient, searchWord, search_string);
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
