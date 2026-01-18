import { logError } from "../util/logging.js";

/**
 * Retrieves cached jobs from the database for a given search word
 * @param {Object} connectedClient - Database client connection
 * @param {string} searchWord - The search word to look up
 * @returns {Promise<Array>} Array of job objects or empty array if not found
 */
export const getCachedJobsBySearchString = async (
  connectedClient,
  searchWord,
) => {
  try {
    if (!connectedClient) {
      logError("No database connection available");
      return [];
    }

    const checkWordResult = await connectedClient.query(
      "SELECT 1 FROM search_words WHERE search_word = $1",
      [searchWord],
    );

    if (checkWordResult.rows.length > 0) {
      // Retrieve cached jobs
      const cachedJobsResult = await connectedClient.query(
        `SELECT j.* FROM jobs j
         JOIN search_words_jobs swj ON j.id = swj.job_id
         WHERE swj.search_word = $1`,
        [searchWord],
      );
      return cachedJobsResult.rows;
    }

    return [];
  } catch (dbError) {
    logError(`Error retrieving cached jobs for "${searchWord}": ${dbError}`);
    return [];
  }
};
