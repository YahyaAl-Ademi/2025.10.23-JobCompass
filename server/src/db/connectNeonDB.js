import { Client } from "pg";
import { logError } from "../util/logging.js";

export default async function connectNeonDB() {
  let error = null;
  let connectedClient = null;

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  async function endConnection() {
    if (connectedClient) {
      try {
        await connectedClient.end();
      } catch (err) {
        logError(`Error closing database connection: ${err.message}`);
      }
    }
  }

  try {
    await client.connect();
    connectedClient = client;
  } catch (err) {
    error = err;
    logError(`Database connection error: ${err.message}`);
    await client
      .end()
      .catch((e) =>
        logError(`Error during failed connection cleanup: ${e.message}`),
      );
  }

  return { error, connectedClient, endConnection };
}
