/**
 * Backfill jobs.language using normalized_description (batched updates).
 * Run from server directory: node scripts/backfillJobLanguage.js
 * Ensure DATABASE_URL is set (e.g. via .env).
 */
import "dotenv/config";
import connectNeonDB from "../src/db/connectNeonDB.js";
import detectLanguage from "../src/util/detectLanguage.js";
import { logError, logInfo } from "../src/util/logging.js";

const BATCH_SIZE = 500;

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
    for (let i = 0; i < res.rows.length; i += BATCH_SIZE) {
      const batch = res.rows.slice(i, i + BATCH_SIZE);
      const pairs = batch.map((row) => [
        row.id,
        detectLanguage(row.normalized_description),
      ]);
      const values = pairs.flat();
      const placeholders = pairs
        .map((_, idx) => `($${idx * 2 + 1}, $${idx * 2 + 2})`)
        .join(", ");
      await connectedClient.query(
        `UPDATE jobs AS j SET language = v.lang
         FROM (VALUES ${placeholders}) AS v(id, lang)
         WHERE j.id = v.id`,
        values,
      );
      updated += batch.length;
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
