/**
 * Retrieves cached jobs from the database for a given search word
 * @param {Object} connectedClient - Database client connection
 * @param {string} searchWord - The search word to look up
 * @param {string|null} is_auth - Optional user identifier (uuid used as a boolean-ish flag for authenticated requests now, retained for future search analytics); leave null/undefined for anonymous lookups
 * @returns {Promise<Array>} Array of job objects or empty array if not found
 */
export default async function getCachedJobsBySearchString(
  connectedClient,
  searchWord,
  is_auth,
) {
  // Check if the search word exists in search_strings table
  const checkWordResult = await connectedClient.query(
    "SELECT search_string FROM search_strings WHERE search_string = $1",
    [searchWord],
  );
  if (checkWordResult.rows.length > 0) {
    // Retrieve cached jobs
    const cachedJobsResult = await connectedClient.query(
      `SELECT j.* FROM jobs j
       JOIN search_strings_jobs swj ON j.id = swj.job_id
       JOIN search_strings ss ON swj.search_string = ss.search_string
       WHERE swj.search_string = $1 AND ($2::uuid IS NULL OR ss.is_auth IS NOT NULL)`,
      [searchWord, is_auth],
    );
    return cachedJobsResult.rows;
  }

  return [];
}
