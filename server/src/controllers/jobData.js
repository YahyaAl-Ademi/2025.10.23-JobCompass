import { logError } from "../util/logging.js";
import { cleanupInProgress } from "../util/cleanupInProgress.js";
import connectNeonDB from "../db/connectNeonDB.js";
import getCachedJobsBySearchString from "../services/getCachedJobsBySearchString.js";
import linkedInScraperFetch from "../services/linkedInScraperFetch.js";
import { rapidAPIfetch } from "../services/rapidAPIfetch.js";
import { fetchPersister } from "../services/fetchPersister.js";

const inProgressStringFetch = {};
const inProgressWordFetch = {};

export async function searchJobs(req, res) {
  let is_auth = req?.user?.id || null;

  // Cleanup old entries from in-progress tracking
  cleanupInProgress(inProgressWordFetch, inProgressStringFetch);

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
    let aggregatedJobs = [];

    if (typeof search_string !== "string" || !search_string.trim()) {
      responseStatus = 400;
      responseData = {
        ...responseData,
        success: false,
        msg: "You need to provide 'search_string' (non-empty string) in the request body.",
      };
    } else {
      // Check if the whole search_string is cached
      const cachedJobsPerSearchString = await getCachedJobsBySearchString(
        connectedClient,
        search_string,
        is_auth,
      );
      if (cachedJobsPerSearchString.length > 0) {
        aggregatedJobs = [...cachedJobsPerSearchString];
      } else {
        if (is_auth) {
          // Persist jobs from rapidAPI, then start and persist jobs from LinkedIn scraper
          inProgressStringFetch[search_string] = {
            fetchedJobs: [],
            is_auth: is_auth,
            timestamp: Date.now(),
          };
          responseData.msg =
            "New vacancies will be available in our DB in 1-10 min; search for the same job title to find them.";
          fetchPersister(
            inProgressStringFetch,
            search_string,
            linkedInScraperFetch,
          );
        }
      }

      const searchWords = search_string
        .split(new RegExp("[\\s\\-.'/]+"))
        .filter(Boolean);
      // Fetch results for all search words concurrently
      if (searchWords.length > 1) {
        const fetchPromises = searchWords.map(async (searchWord, i) => {
          // Try to get cached jobs first
          const cachedJobs = await getCachedJobsBySearchString(
            connectedClient,
            searchWord,
            is_auth,
          );
          let fetchedJobs;
          if (cachedJobs.length > 0) {
            fetchedJobs = [...cachedJobs];
          } else {
            // If not cached, use real search
            inProgressWordFetch[searchWord] = {
              fetchedJobs: [],
              is_auth: is_auth,
              timestamp: Date.now(),
            };
            if (searchWords.length > 2 && i >= 2) {
              fetchedJobs = await new Promise((resolve) =>
                setTimeout(
                  () => resolve(rapidAPIfetch(searchWord, is_auth)),
                  (i - 1) * 700,
                ),
              );
              inProgressWordFetch[searchWord].fetchedJobs = [...fetchedJobs];
              fetchPersister(inProgressWordFetch, searchWord);
            } else {
              fetchedJobs = await rapidAPIfetch(searchWord, is_auth);
              inProgressWordFetch[searchWord].fetchedJobs = [...fetchedJobs];
              fetchPersister(inProgressWordFetch, searchWord);
            }
          }
          return fetchedJobs;
        });
        // Deduplicate jobs
        const aggregatedJobsIdsSet = new Set(
          aggregatedJobs.map((job) => job.id),
        );
        const fetchedJobsArrays = await Promise.all(fetchPromises);
        for (const fetchedJobs of fetchedJobsArrays) {
          for (const job of fetchedJobs) {
            if (job.id && !aggregatedJobsIdsSet.has(job.id)) {
              aggregatedJobs.push(job);
              aggregatedJobsIdsSet.add(job.id);
            }
          }
        }
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
