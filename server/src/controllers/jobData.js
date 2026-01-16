import { logError } from "../util/logging.js";
import { realJobSearch } from "./realJobSearch.js";
import { fakeJobSearch } from "./fakeJobSearch.js";
import processJobPost from "../util/processJobPost.js";
import connectNeonDB from "../db/connectNeonDB.js";

const isSearchReal = true; // Set to true to enable real job search

export const searchJobs = async (req, res) => {
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

    const searchWords = search_terms
      .split(new RegExp("[\\s\\-.'/]+"))
      .filter(Boolean);
    // Fetch results for all search words concurrently
    const { connectedClient, endConnection } = await connectNeonDB();
    const fetchPromises = searchWords.map(async (jobWord, i) => {
      if (isSearchReal && connectedClient) {
        try {
          const checkWordResult = await connectedClient.query(
            "SELECT 1 FROM search_words WHERE search_word = $1",
            [jobWord],
          );

          if (checkWordResult.rows.length > 0) {
            // Retrieve cached jobs
            const cachedJobsResult = await connectedClient.query(
              `SELECT j.* FROM jobs j
               JOIN search_words_jobs swj ON j.id = swj.job_id
               WHERE swj.search_word = $1`,
              [jobWord],
            );
            return cachedJobsResult.rows;
          }
        } catch (dbError) {
          logError("Error checking cached jobs:", dbError);
          // Fall back to real search if DB fails
        }
      }

      // If not cached or isSearchReal is false, or DB error
      return isSearchReal
        ? searchWords.length > 2 && i >= 2
          ? new Promise((resolve) =>
              setTimeout(() => resolve(realJobSearch(jobWord)), (i - 1) * 700),
            )
          : realJobSearch(jobWord)
        : Promise.resolve(fakeJobSearch(jobWord));
    });

    const fetchedJobsArrays = await Promise.all(fetchPromises);
    if (endConnection) await endConnection();

    for (const fetchedJobs of fetchedJobsArrays) {
      for (const job of fetchedJobs) {
        if (job.id && !aggregatedJobsIdsSet.has(job.id)) {
          aggregatedJobs.push(processJobPost(job));
          aggregatedJobsIdsSet.add(job.id);
        }
      }
    }

    res.status(200).json({ success: true, result: aggregatedJobs });
  } catch (error) {
    logError("searchJobs error:", error);
    res.status(500).json({
      success: false,
      msg: "Unable to search for jobs, please try again later.",
    });
  }
};
