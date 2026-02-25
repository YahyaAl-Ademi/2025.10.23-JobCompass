/**
 * Normalizes a URL by ensuring it has a proper protocol
 * @param {string} url - The URL to normalize
 * @returns {string} - The normalized URL with https:// protocol
 */
export default function normalizeUrl(url) {
  if (!url) return "";
  return url.startsWith("http") ? url : `https://${url}`;
}

/**
 * Strips everything from ?refId= onwards so the same job role is not treated as
 * multiple jobs when optional query params (refId, trackingId, position, pageNum) differ.
 * @param {string} url - Job URL (e.g. LinkedIn)
 * @returns {string} - URL without refId and following query params
 */
export function stripRefIdFromUrl(url) {
  if (!url || typeof url !== "string") return "";
  const i = url.toLowerCase().indexOf("?");
  if (i === -1) return url;
  return url.slice(0, i);
}
