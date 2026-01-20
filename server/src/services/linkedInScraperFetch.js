const apifyBase = "https://api.apify.com/v2";
const pollIntervalMs = 3 * 1000;
const waitTimeoutMs = 10 * 60 * 1000;
const limit = 1000;
import { logInfo, logError } from "../util/logging.js";

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default async function linkedInScraperFetch(token, startUrl) {
  let items = [];
  const headers = {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };

  try {
    // Start scraper run
    const startRunsUrl = `${apifyBase}/acts/curious_coder~linkedin-jobs-scraper/runs`;
    const requestBody = {
      urls: [startUrl],
      scrapeCompany: true,
      count: 100,
    };
    const startResponse = await fetch(startRunsUrl, {
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

    let offset = 0;
    let fetching = true;
    while (fetching) {
      const dsUrl = `${apifyBase}/actor-runs/${encodeURIComponent(
        runId,
      )}/dataset/items?format=json&offset=${offset}&limit=${limit}`;
      const response = await fetch(dsUrl, { headers });
      if (!response.ok) throw new Error("Failed to fetch dataset items");
      const batch = await response.json();
      if (!Array.isArray(batch) || batch.length === 0) {
        fetching = false;
      } else {
        items.push(...batch);
        if (batch.length < limit) {
          fetching = false;
        } else {
          offset += batch.length;
        }
      }
    }
  } catch (error) {
    logError(`linkedInScraperFetch error: ${error}`);
  }
  return items;
}
