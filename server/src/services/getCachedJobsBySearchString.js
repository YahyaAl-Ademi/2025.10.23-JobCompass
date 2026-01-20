import { logError } from "../util/logging.js";

/**
 * Retrieves cached jobs from the database for a given search word
 * @param {Object} connectedClient - Database client connection
 * @param {string} searchWord - The search word to look up
 * @param {string|null} is_auth - Optional user identifier (uuid used as a boolean-ish flag for authenticated requests now, retained for future search analytics); leave null/undefined for anonymous lookups
 * @returns {Promise<Array>} Array of job objects or empty array if not found
 */
export const getCachedJobsBySearchString = async (
  connectedClient,
  searchWord,
  is_auth,
) => {
  try {
    if (!connectedClient) {
      logError("No database connection available");
      return [];
    }

    const checkWordResult = await connectedClient.query(
      "SELECT 1 FROM search_strings WHERE search_string = $1 AND ($2 IS NULL OR is_auth IS NOT NULL)",
      [searchWord, is_auth],
    );
    if (checkWordResult.rows.length > 0) {
      // Retrieve cached jobs
      const cachedJobsResult = await connectedClient.query(
        `SELECT j.* FROM jobs j
         JOIN search_strings_jobs swj ON j.id = swj.job_id
         JOIN search_strings ss ON swj.search_string = ss.search_string
         WHERE swj.search_string = $1 AND ($2 IS NULL OR ss.is_auth IS NOT NULL)`,
        [searchWord, is_auth],
      );
      return cachedJobsResult.rows;
    }

    return [];
  } catch (dbError) {
    logError(`Error retrieving cached jobs for "${searchWord}": ${dbError}`);
    return [];
  }
};
