const apifyBase = "https://api.apify.com/v2";
const pollIntervalMs = 5 * 1000;
const waitTimeoutMs = 10 * 60 * 1000;
import { logInfo, logError } from "../util/logging.js";
if (!process.env.LINKEDIN_SCRAPER_KEY) {
  throw new Error("LINKEDIN_SCRAPER_KEY environment variable is not set");
}

export default async function linkedInScraperFetch() {
  const token = process.env.LINKEDIN_SCRAPER_KEY;
  const startUrl =
    "https://www.linkedin.com/jobs/search?keywords=web%20developer&location=Drenthe&geoId=100735123&trk=public_jobs_jobs-search-bar_search-submit&position=1&pageNum=0";
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
    const startTime = Date.now();
    let polling = true;

    while (polling) {
      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
      const response = await fetch(runUrl, { headers });
      if (!response.ok) throw new Error("Failed to fetch run status");
      const run = await response.json();
      const runStatus = run?.data?.status;
      logInfo(`Run ${runId} status: ${runStatus}`);
      switch (runStatus) {
        case "SUCCEEDED":
          polling = false;
          break;
        case "FAILED":
        case "ABORTED":
          throw new Error(`Apify run finished with status ${runStatus}`);
      }
      if (Date.now() - startTime > waitTimeoutMs) {
        throw new Error(`Timeout for run ${runId} to finish has ended`);
      }
    }

    // Collecting the data
    const dataFetchUrl = `${apifyBase}/actor-runs/${encodeURIComponent(
      runId,
    )}/dataset/items?format=json`;
    const response = await fetch(dataFetchUrl, { headers });
    if (!response.ok) throw new Error("Failed to fetch dataset items");
    return await response.json();
  } catch (error) {
    logError(`linkedInScraperFetch error: ${error}`);
  }
}
