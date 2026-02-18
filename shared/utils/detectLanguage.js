/**
 * Shared language detection for job descriptions (EN/NL).
 * Used by both server (ingestion, backfill) and client (filter fallback).
 * Single source of truth to avoid duplication (DRY).
 */

const ENGLISH_WORDS = new Set([
  "you",
  "your",
  "he",
  "him",
  "she",
  "her",
  "it",
  "us",
  "they",
  "them",
  "their",
  "the",
  "a",
  "an",
  "and",
  "but",
  "this",
  "with",
  "that",
  "would",
  "could",
  "which",
  "when",
]);

const DUTCH_WORDS = new Set([
  "jij",
  "je",
  "jou",
  "jouw",
  "u",
  "uw",
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
  "dat",
  "zijn",
  "hebben",
  "worden",
]);

const MIN_MATCHES = 2;

/**
 * Detects whether text is primarily English or Dutch by counting whole-word
 * matches against common function words. Uses a minimum match threshold to
 * reduce false positives from code/URLs/short snippets.
 * @param {string} description - Job description (e.g. normalized_description)
 * @returns {"English"|"Dutch"} The language with the most matches; "English" on tie or low confidence
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

  if (enCount < MIN_MATCHES && nlCount < MIN_MATCHES) return "English";
  return nlCount > enCount ? "Dutch" : "English";
}
