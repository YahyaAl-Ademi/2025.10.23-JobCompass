const apifyBase = "https://api.apify.com/v2";
const DEFAULT_POLL_INTERVAL_MS = 3000;
const pollIntervalMs = DEFAULT_POLL_INTERVAL_MS;
const waitTimeoutMs = 7 * 60 * 1000;
const limit = 1000;

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson(url, headers, fetchOptions = {}) {
  const res = await fetch(url, { headers, ...fetchOptions });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const err = new Error(
      `Request failed ${res.status} ${res.statusText}: ${text}`,
    );
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export default async function LinkedInScraperFetch(token, startUrl) {
  let items = [];
  try {
    const headers = {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    };

    const startRunsUrl = `${apifyBase}/acts/curious_coder~linkedin-jobs-scraper/runs`;
    const body = JSON.stringify({
      urls: [startUrl],
      scrapeCompany: true,
      count: 100,
    });

    // Ensure Content-Type header is set and avoid accidentally overwriting headers
    const postHeaders = Object.assign({}, headers, {
      "Content-Type": "application/json",
    });
    const startResp = await fetchJson(startRunsUrl, headers, {
      method: "POST",
      body,
      headers: postHeaders,
    });
    const runId = startResp.id || startResp.runId || startResp.data?.id;
    if (!runId) {
      throw new Error("Unable to determine run id from start response");
    }

    const runUrl = `${apifyBase}/acts/curious_coder~linkedin-jobs-scraper/runs/${encodeURIComponent(
      runId,
    )}`;

    // Request poll for completion
    const endStates = new Set(["SUCCEEDED", "FAILED", "ABORTED"]);
    const startTime = Date.now();
    let run = null;
    let polling = true;
    while (polling) {
      const current = await fetchJson(runUrl, headers);
      const status = current?.data?.status;
      console.log(`Run ${runId} status:`, status);
      if (endStates.has(status)) {
        run = current;
        polling = false;
      } else if (waitTimeoutMs && Date.now() - startTime > waitTimeoutMs) {
        throw new Error(`Timeout waiting for run ${runId} to finish`);
      } else {
        await sleep(pollIntervalMs);
      }
    }

    if (run.data.status !== "SUCCEEDED") {
      const err = new Error(
        `Apify run finished with status ${run.data.status}`,
      );
      err.run = run;
      throw err;
    }

    let offset = 0;
    let fetching = true;
    while (fetching) {
      const dsUrl = `${apifyBase}/actor-runs/${encodeURIComponent(
        runId,
      )}/dataset/items?format=json&offset=${offset}&limit=${limit}`;
      const batch = await fetchJson(dsUrl, headers);
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
    return { data: undefined, error };
  }
  return { data: items, error: undefined };
}
