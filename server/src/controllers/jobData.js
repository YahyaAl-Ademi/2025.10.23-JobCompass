import { logError } from "../util/logging.js";
import connectNeonDB from "../db/connectNeonDB.js";
import getCachedJobsBySearchString from "../services/getCachedJobsBySearchString.js";
import linkedInScraperFetch from "../services/linkedInScraperFetch.js";
import { rapidAPIfetch } from "../services/rapidAPIfetch.js";
import { fetchPersister } from "../services/fetchPersister.js";

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
          responseData.msg =
            "We have found more vacancies. They will be available in our database for one to ten minutes; use the same job title in the search to find them.";
          fetchPersister(
            search_string,
            is_auth,
            inProgressSearches,
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
            // If not cached or DB error, use real search
            inProgressSearches[searchWord] = { fetchedJobs: [] };
            if (searchWords.length > 2 && i >= 2) {
              fetchedJobs = await new Promise((resolve) =>
                setTimeout(
                  () => resolve(rapidAPIfetch(searchWord, is_auth)),
                  (i - 1) * 700,
                ),
              );
              inProgressSearches[searchWord].fetchedJobs = [...fetchedJobs];
              fetchPersister(searchWord, is_auth, inProgressSearches);
            } else {
              fetchedJobs = await rapidAPIfetch(searchWord, is_auth);
              inProgressSearches[searchWord].fetchedJobs = [...fetchedJobs];
              fetchPersister(searchWord, is_auth, inProgressSearches);
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
