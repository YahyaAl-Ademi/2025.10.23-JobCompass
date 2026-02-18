const ENGLISH_WORDS = new Set([
  "you",
  "he",
  "him",
  "she",
  "her",
  "it",
  "us",
  "they",
  "them",
  "the",
  "a",
  "an",
  "and",
  "but",
  "this",
  "with",
]);

const DUTCH_WORDS = new Set([
  "jij",
  "je",
  "u",
  "jou",
  "hij",
  "hem",
  "zij",
  "ze",
  "haar",
  "het",
  "ons",
  "jullie",
  "hen",
  "hun",
  "de",
  "en",
  "maar",
  "dit",
  "deze",
  "met",
]);

/**
 * Detects whether job description text is primarily English or Dutch
 * by counting matches against common function words.
 * @param {string} description - Normalized job description (e.g. job.normalized_description)
 * @returns {"English"|"Dutch"} The language with the most word matches; "English" on tie or empty
 */
export default function detectLanguage(description) {
  const text = typeof description === "string" ? description : "";
  if (!text.trim()) return "English";

  const normalized =
    " " + text.toLowerCase().replace(/[^a-z0-9\s]/g, " ") + " ";

  let enCount = 0;
  for (const word of ENGLISH_WORDS) {
    if (normalized.includes(" " + word + " ")) enCount++;
  }

  let nlCount = 0;
  for (const word of DUTCH_WORDS) {
    if (normalized.includes(" " + word + " ")) nlCount++;
  }

  return nlCount > enCount ? "Dutch" : "English";
}
