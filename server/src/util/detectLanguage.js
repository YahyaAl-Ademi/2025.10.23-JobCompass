/**
 * Detects whether job description text is primarily English or Dutch.
 * Used only on the backend (ingestion and optional backfill). Frontend uses job.language from API.
 * Word sets are closed: each English group has a Dutch counterpart (translation or similar frequency).
 */
const ENGLISH_WORDS = new Set([
  "you",
  "your",
  "yours",
  "he",
  "him",
  "she",
  "they",
  "them",
  "their",
  "her",
  "it",
  "us",
  "the",
  "a",
  "an",
  "one",
  "and",
  "but",
  "so",
  "with",
  "this",
  "that",
]);

const DUTCH_WORDS = new Set([
  "jij",
  "je",
  "uw",
  "jou",
  "jouw",
  "u",
  "jullie",
  "hij",
  "hem",
  "zij",
  "ze",
  "hen",
  "hun",
  "haar",
  "het",
  "ons",
  "de",
  "een",
  "en",
  "maar",
  "zo",
  "met",
  "dit",
  "deze",
  "dat",
  "die",
]);

const MIN_MATCHES = 2;

export default function detectLanguage(description) {
  const normalized =
    " " + description.toLowerCase().replace(/[^a-z0-9\s]/g, " ") + " ";

  let enCount = 0;
  for (const word of ENGLISH_WORDS) {
    if (normalized.includes(" " + word + " ")) enCount++;
  }

  let nlCount = 0;
  for (const word of DUTCH_WORDS) {
    if (normalized.includes(" " + word + " ")) nlCount++;
  }

  if (enCount < MIN_MATCHES && nlCount < MIN_MATCHES) return "English";
  return enCount >= nlCount ? "English" : "Dutch";
}
