/**
 * Backfill jobs.language using normalized_description.
 * Run from server directory: node scripts/backfillJobLanguage.js
 * Ensure DATABASE_URL is set (e.g. via .env).
 */
import "dotenv/config";
import connectNeonDB from "../src/db/connectNeonDB.js";
import detectLanguage from "../src/util/detectLanguage.js";
import { logError, logInfo } from "../src/util/logging.js";

async function backfillJobLanguage() {
  const { connectedClient, error, endConnection } = await connectNeonDB();
  if (error || !connectedClient) {
    logError(error || new Error("No database client"));
    process.exitCode = 1;
    return;
  }
  try {
    const res = await connectedClient.query(
      "SELECT id, normalized_description FROM jobs WHERE normalized_description IS NOT NULL",
    );
    let updated = 0;
    for (const row of res.rows) {
      const language = detectLanguage(row.normalized_description);
      await connectedClient.query(
        "UPDATE jobs SET language = $1 WHERE id = $2",
        [language, row.id],
      );
      updated++;
    }
    logInfo(`Backfill complete: ${updated} jobs updated with language.`);
  } catch (err) {
    logError(err);
    process.exitCode = 1;
  } finally {
    await endConnection();
  }
}

backfillJobLanguage();
