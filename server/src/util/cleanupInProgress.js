/**
 * Cleans up old entries from in-progress tracking objects
 * @param {Object} inProgressWordFetch - Object tracking word-based fetches
 * @param {Object} inProgressStringFetch - Object tracking string-based fetches
 */
export function cleanupInProgress(inProgressWordFetch, inProgressStringFetch) {
  const currentTime = Date.now();
  const threeMinutesMs = 3 * 60 * 1000;
  const twentyMinutesMs = 20 * 60 * 1000;

  // Clean up inProgressWordFetch (entries older than 3 minutes)
  for (const key in inProgressWordFetch) {
    if (currentTime - inProgressWordFetch[key].timestamp > threeMinutesMs) {
      delete inProgressWordFetch[key];
    }
  }

  // Clean up inProgressStringFetch (entries older than 20 minutes)
  for (const key in inProgressStringFetch) {
    if (currentTime - inProgressStringFetch[key].timestamp > twentyMinutesMs) {
      delete inProgressStringFetch[key];
    }
  }
}
