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

  if (connectionError) {
    responseStatus = 500;
    responseData = {
      success: false,
      msg: `DB Connection Error: ${connectionError}`,
    };
  } else {
    try {
      let { search_string } = req.body;
      let aggregatedJobs = [];

      if (typeof search_string !== "string" || !search_string.trim()) {
        responseStatus = 400;
        responseData = {
          ...responseData,
          success: false,
          msg: "You need to provide 'search_string' (non-empty string) in the request body.",
        };
      } else {
        search_string = search_string.toLowerCase();
        const { is_whole_string, cachedJobsPerSearchString } =
          await getCachedJobsBySearchString(
            connectedClient,
            search_string,
            is_auth,
          );

        if (cachedJobsPerSearchString.length > 0) {
          aggregatedJobs = [...cachedJobsPerSearchString];
        }

        if (
          !is_whole_string &&
          is_auth &&
          !inProgressStringFetch[search_string]
        ) {
          inProgressStringFetch[search_string] = {
            is_auth: true,
            is_whole_string: true,
            isBackgroundFetch: true,
            fetcher: linkedInScraperFetch,
            timestamp: Date.now(),
          };
          responseData.msg =
            "New vacancies will be available in our DB in 1-10 min; search for the same job title to find them.";
          fetchPersister(inProgressStringFetch, search_string);
        }

        const searchWords = search_string.split(/\s+/).filter(Boolean);

        if (searchWords.length > 0) {
          for (let i = 0; i < searchWords.length; i++) {
            const searchWord = searchWords[i];
            const cachedResult = await getCachedJobsBySearchString(
              connectedClient,
              searchWord,
              is_auth,
            );
            let fetchedJobs = [];
            if (cachedResult.cachedJobsPerSearchString.length > 0) {
              fetchedJobs = [...cachedResult.cachedJobsPerSearchString];
            } else if (!inProgressWordFetch[searchWord]) {
              inProgressWordFetch[searchWord] = {
                is_auth,
                is_whole_string: false,
                isBackgroundFetch: false,
                fetcher: rapidAPIfetch,
                timestamp: Date.now(),
              };
              fetchedJobs = await fetchPersister(
                inProgressWordFetch,
                searchWord,
              );
            }

            const aggregatedJobsIdsSet = new Set(
              aggregatedJobs.map((job) => job.id),
            );
            for (const job of fetchedJobs) {
              if (job.id && !aggregatedJobsIdsSet.has(job.id)) {
                aggregatedJobs.push(job);
                aggregatedJobsIdsSet.add(job.id);
              }
            }
          }
        }

        responseData = {
          ...responseData,
          success: true,
          result: aggregatedJobs,
        };
      }
    } catch (error) {
      logError(`searchJobs error: ${error}`);
      responseStatus = 500;
      responseData = {
        success: false,
        msg: "Unable to search for jobs, please try again later.",
      };
    }
  }
  if (endConnection) await endConnection();
  res.status(responseStatus).json(responseData);
}
