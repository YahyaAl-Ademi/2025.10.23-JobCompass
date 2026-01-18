import { logError } from "../util/logging.js";
import connectNeonDB from "../db/connectNeonDB.js";

/**
 * Retrieves cached jobs from the database for a given search word
 * @param {Object} connectedClient - Database client connection
 * @param {string} searchWord - The search word to look up
 * @returns {Promise<Array>} Array of job objects or empty array if not found
 */
export const getCachedJobsBySearchWord = async (connectedClient, searchWord) => {
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

/**
 * Retrieves a specific entry from the database by ID and table name
 * @param {Object} connectedClient - Database client connection
 * @param {string} tableName - The name of the table to query
 * @param {number} id - The ID of the entry to retrieve
 * @returns {Promise<Object|null>} The entry object or null if not found
 */
export const getEntryById = async (connectedClient, tableName, id) => {
  try {
    if (!connectedClient) {
      logError("No database connection available");
      return null;
    }

    const result = await connectedClient.query(
      `SELECT * FROM ${tableName} WHERE id = $1`,
      [id],
    );

    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (dbError) {
    logError(
      `Error retrieving entry from "${tableName}" with id ${id}: ${dbError}`,
    );
    return null;
  }
};

/**
 * Retrieves all entries from a specified table with optional filtering
 * @param {string} tableName - The name of the table to query
 * @param {Object} whereClause - Optional WHERE conditions {column: value}
 * @returns {Promise<Array>} Array of entries or empty array if none found
 */Object} connectedClient - Database client connection
 * @param {string} tableName - The name of the table to query
 * @param {Object} whereClause - Optional WHERE conditions {column: value}
 * @returns {Promise<Array>} Array of entries or empty array if none found
 */
export const getAllEntries = async (connectedClient, tableName, whereClause = null) => {
  try {
    if (!connectedClient) {
      logError("No database connection available");
      return [];
    }

    let query = `SELECT * FROM ${tableName}`;
    const values = [];
    let paramIndex = 1;

    if (whereClause && Object.keys(whereClause).length > 0) {
      const conditions = Object.entries(whereClause)
        .map(([column, value]) => {
          values.push(value);
          return `${column} = $${paramIndex++}`;
        })
        .join(" AND ");

      query += ` WHERE ${conditions}`;
    }

    const result = await connectedClient.query(query, values);
    return result.rows;
  } catch (dbError) {
    logError(`Error retrieving entries from "${tableName}": ${dbError}`);
    return []