import { logError } from "../util/logging.js";
import { rapidAPIfetch } from "../services/rapidAPIfetch.js";
import connectNeonDB from "../db/connectNeonDB.js";
import { getCachedJobsBySearchString } from "../services/getCachedJobsBySearchString.js";
import linkedInScraperFetch from "../services/linkedInScraperFetch.js";
import { persistJobSearch } from "../services/persistJobSearch.js";

export async function searchJobs(req, res) {
  let is_auth = req?.user?.id || null;
  const {
    connectedClient,
    error: connectionError,
    endConnection,
  } = await connectNeonDB();

  let responseStatus = 200;
  let responseData = { success: true, result: [], msg: "" };

  try {
    if (connectionError) {
      throw new Error(`DB Connection Error: ${connectionError}`);
    }

    const { search_string } = req.body;
    const aggregatedJobsIdsSet = new Set();
    let aggregatedJobs = [];

    if (typeof search_string !== "string" || !search_string.trim()) {
      responseStatus = 400;
      responseData = {
        ...responseData,
        success: false,
        msg: "You need to provide 'search_string' (non-empty string) in the request body.",
      };
    } else {
      // Check if search_string is cached
      const cachedJobsPerSearchString = await getCachedJobsBySearchString(
        connectedClient,
        search_string,
        is_auth,
      );
      if (cachedJobsPerSearchString.length > 0) {
        aggregatedJobs = cachedJobsPerSearchString;
      } else {
        const jobsToPersist = [];
        const searchWords = search_string
          .split(new RegExp("[\\s\\-.'/]+"))
          .filter(Boolean);
        // Fetch results for all search words concurrently
        const fetchPromises = searchWords.map(async (searchWord, i) => {
          // Try to get cached jobs first
          const cachedJobs = await getCachedJobsBySearchString(
            connectedClient,
            searchWord,
            is_auth,
          );

          let fetchedJobs;
          if (cachedJobs.length > 0) {
            fetchedJobs = cachedJobs;
          } else {
            // If not cached or DB error, use real search
            if (searchWords.length > 2 && i >= 2) {
              fetchedJobs = new Promise((resolve) =>
                setTimeout(
                  () =>
                    resolve(
                      rapidAPIfetch(
                        connectedClient,
                        searchWord,
                        search_string,
                        is_auth,
                      ),
                    ),
                  (i - 1) * 700,
                ),
              );
              jobsToPersist.push({ searchWord, search_string, fetchedJobs });
            } else {
              fetchedJobs = rapidAPIfetch(
                connectedClient,
                searchWord,
                search_string,
                is_auth,
              );
              jobsToPersist.push({ searchWord, search_string, fetchedJobs });
            }
          }
          return fetchedJobs;
        });

        // Deduplicate jobs
        const fetchedJobsArrays = await Promise.all(fetchPromises);
        for (const fetchedJobs of fetchedJobsArrays) {
          for (const job of fetchedJobs) {
            if (job.id && !aggregatedJobsIdsSet.has(job.id)) {
              aggregatedJobs.push(job);
              aggregatedJobsIdsSet.add(job.id);
            }
          }
        }

        // Persist jobs and start LinkedIn scraper
        (async () => {
          responseData.msg = "Some more jobs will be available in ten minutes.";
          if (jobsToPersist.length > 0) {
            await persistJobSearch(
              connectedClient,
              [...jobsToPersist],
              jobsToPersist[0].search_string,
              is_auth,
            );
            if (jobsToPersist.length > 1) {
              for (const jobsData of jobsToPersist) {
                const { searchWord, fetchedJobs } = jobsData;
                await persistJobSearch(
                  connectedClient,
                  fetchedJobs,
                  searchWord,
                  is_auth,
                );
              }
            }
          }
          linkedInScraperFetch(
            connectedClient,
            searchWords[0],
            search_string,
            is_auth,
          );
        })();
      }
      responseData = { ...responseData, success: true, result: aggregatedJobs };
    }
  } catch (error) {
    logError(`searchJobs error: ${error}`);
    responseStatus = 500;
    responseData = {
      success: false,
      msg: "Unable to search for jobs, please try again later.",
    };
  } finally {
    if (endConnection) await endConnection();
  }

  res.status(responseStatus).json(responseData);
}
