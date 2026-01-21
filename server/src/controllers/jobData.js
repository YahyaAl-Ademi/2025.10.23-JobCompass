import { logError } from "../util/logging.js";
import processRapidAPIjob from "../util/processRapidAPIjob.js";
import processScraperJob from "../util/processScraperJob.js";
import connectNeonDB from "../db/connectNeonDB.js";
import getCachedJobsBySearchString from "../services/getCachedJobsBySearchString.js";
import linkedInScraperFetch from "../services/linkedInScraperFetch.js";
import { persistJobSearch } from "../services/persistJobSearch.js";
import { rapidAPIfetch } from "../services/rapidAPIfetch.js";

const inProgressSearches = {};

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
            if (!inProgressSearches[search_string]) {
              inProgressSearches[search_string] = {
                status: true,
                is_complete_string: true,
                fetchedJobs: [],
              };
              console.log("inProgressSearches:", inProgressSearches);
            }
            if (
              !inProgressSearches[searchWord] &&
              searchWord !== search_string
            ) {
              inProgressSearches[searchWord] = {
                status: true,
                is_complete_string: false,
                fetchedJobs: [],
              };
              console.log("inProgressSearches:", inProgressSearches);
            }

            if (searchWords.length > 2 && i >= 2) {
              fetchedJobs = await new Promise((resolve) =>
                setTimeout(
                  () => resolve(rapidAPIfetch(searchWord, is_auth)),
                  (i - 1) * 700,
                ),
              );
              inProgressSearches[searchWord] = {
                ...inProgressSearches[searchWord],
                fetchedJobs,
              };
            } else {
              fetchedJobs = await rapidAPIfetch(searchWord, is_auth);
              inProgressSearches[searchWord] = {
                ...inProgressSearches[searchWord],
                fetchedJobs,
              };
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

        // Persist jobs from rapidAPI, then start and persist jobs from LinkedIn scraper
        (async () => {
          responseData.msg = "Some more jobs will be available in ten minutes.";

          if (Object.keys(inProgressSearches).length > 0) {
            Object.entries(inProgressSearches).forEach(
              async ([searchWord, search]) => {
                const {
                  connectedClient,
                  error: connectionError,
                  endConnection,
                } = await connectNeonDB();
                if (!connectionError) {
                  await persistJobSearch(
                    connectedClient,
                    search,
                    searchWord,
                    is_auth,
                    processRapidAPIjob,
                  );
                  if (endConnection) await endConnection();
                }
                {
                  const { is_complete_string } = search;
                  if (is_auth && is_complete_string) {
                    const scraperJobsToPersist =
                      await linkedInScraperFetch(searchWord);
                    if (scraperJobsToPersist.length > 0) {
                      const {
                        connectedClient,
                        error: connectionError,
                        endConnection,
                      } = await connectNeonDB();
                      if (!connectionError) {
                        await persistJobSearch(
                          connectedClient,
                          {
                            fetchedJobs: scraperJobsToPersist,
                            is_complete_string: true,
                          },
                          searchWord,
                          is_auth,
                          processScraperJob,
                        );
                      }
                      if (endConnection) await endConnection();
                    }
                  }
                }
                delete inProgressSearches[searchWord];
              },
            );
          }
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
