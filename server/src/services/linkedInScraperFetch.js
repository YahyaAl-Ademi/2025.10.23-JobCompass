const apifyBase = "https://api.apify.com/v2";
const pollIntervalMs = 3 * 1000;
const waitTimeoutMs = 10 * 60 * 1000;
import { logInfo, logError } from "../util/logging.js";

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default async function linkedInScraperFetch(token, startUrl) {
  const headers = {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };

  try {
    // Start scraper run
    const startRunUrl = `${apifyBase}/acts/curious_coder~linkedin-jobs-scraper/runs`;
    const requestBody = {
      urls: [startUrl],
      scrapeCompany: true,
    };
    const startResponse = await fetch(startRunUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    });
    if (!startResponse.ok) throw new Error("Failed to start LinkedIn scraper");
    const startResp = await startResponse.json();

    const runId = startResp?.data?.id;
    if (!runId) {
      throw new Error("Unable to determine run id from start response");
    }
    const runUrl = `${apifyBase}/acts/curious_coder~linkedin-jobs-scraper/runs/${encodeURIComponent(
      runId,
    )}`;

    // Polling requests for completion
    const endStates = new Set(["SUCCEEDED", "FAILED", "ABORTED"]);
    const startTime = Date.now();
    let run;
    let polling = true;
    while (polling) {
      const response = await fetch(runUrl, { headers });
      if (!response.ok) throw new Error("Failed to fetch run status");
      run = await response.json();
      const status = run?.data?.status;
      logInfo(`Run ${runId} status: ${status}`);
      if (endStates.has(status)) {
        polling = false;
      } else if (Date.now() - startTime > waitTimeoutMs) {
        throw new Error(
          `Timeout waiting for run ${runId} to finish is expired`,
        );
      } else {
        await sleep(pollIntervalMs);
      }
    }

    if (run.data.status !== "SUCCEEDED") {
      throw new Error(`Apify run finished with status ${run.data.status}`);
    }

    // Collecting the data
    let fetching = true;
    while (fetching) {
      const dataFetchUrl = `${apifyBase}/actor-runs/${encodeURIComponent(
        runId,
      )}/dataset/items?format=json`;
      const response = await fetch(dataFetchUrl, { headers });
      if (!response.ok) throw new Error("Failed to fetch dataset items");
      return await response.json();
    }
  } catch (error) {
    logError(`linkedInScraperFetch error: ${error}`);
  }
}
