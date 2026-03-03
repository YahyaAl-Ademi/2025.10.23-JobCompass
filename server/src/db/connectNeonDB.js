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
    logError(`DB Connection Error: ${err}`);
    await client
      .end()
      .catch((e) => logError(`Error during failed connection cleanup: ${e}`));
  }

  return { error, connectedClient, endConnection };
}
