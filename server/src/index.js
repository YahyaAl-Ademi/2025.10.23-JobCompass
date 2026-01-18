// Load our .env variables as early as possible so other modules that read
// process.env at module-evaluation time receive the values.
import "dotenv/config";
import express from "express";
import cron from "node-cron";

import app from "./app.js";
import { logInfo, logError } from "./util/logging.js";
import connectNeonDB from "./db/connectNeonDB.js";

const port = process.env.PORT;
if (port == null) {
  logError(new Error("Cannot find a PORT number, did you create a .env file?"));
}

async function cleanupDatabase() {
  const { error, connectedClient, endConnection } = await connectNeonDB();
  if (error) {
    logError(`DB connection error: ${error.message}`);
    return;
  }
  try {
    await connectedClient.query(
      "DELETE FROM jobs WHERE date_posted < NOW() - INTERVAL '1 month'",
    );
    await connectedClient.query(
      "DELETE FROM search_strings WHERE search_date < NOW() - INTERVAL '1 week'",
    );
  } catch (error) {
    logError(`Unexpected error during database cleanup: ${error.message}`);
  } finally {
    await endConnection();
  }
}

// Schedule cleanup in format "33 20 * * 6", where:
// 30 = 30th minute
// 20 = 20th hour (8 PM in 24-hour format)
// * = every day of month
// * = every month
// 6 = Saturday (0=Sunday... 6=Saturday, * = every day of week)
cron.schedule(
  "0 0 * * *",
  () => {
    logInfo("Starting daily database cleanup...");
    cleanupDatabase();
  },
  {
    scheduled: true,
    timezone: "UTC",
  },
);

const startServer = async () => {
  try {
    app.listen(port, () => {
      logInfo(`Server started on port ${port}`);
    });
  } catch (error) {
    logError(error);
  }
};

/****** Host our client code for Heroku *****/
/**
 * We only want to host our client code when in production mode as we then want to use the production build that is built in the dist folder.
 * When not in production, don't host the files, but the development version of the app can connect to the backend itself.
 */
if (process.env.NODE_ENV === "production") {
  app.use(
    express.static(new URL("../../client/dist", import.meta.url).pathname),
  );
  // Redirect * requests to give the client data
  app.get("/*file", (req, res) =>
    res.sendFile(
      new URL("../../client/dist/index.html", import.meta.url).pathname,
    ),
  );
}

/****** Removed test router import and mounting. The `testRouter.js` file was deleted and is no longer used. ******/

// Start the server
startServer();
