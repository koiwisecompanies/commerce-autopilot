import { buildSignalRecord } from "./signal-schema.js";
import { getSourceType, buildTrustScore } from "./source-weighting.js";
import { freshnessScoreFromTimestamp, decayScore } from "./freshness-rules.js";

function normalizeWhitespace(value = "") {
  return String(value).replace(/\s+/g, " ").trim();
}

function titleCase(value = "") {
  return normalizeWhitespace(value)
    .split(" ")
    .filter(Boolean)
    .map((word) => {
      if (/^\d+$/.test(word)) return word;
      if (word.length <= 3 && word === word.toUpperCase()) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

export function detectModifier(text = "") {
  const lowered = String(text).toLowerCase();
  const modifiers = [
    "for beginners",
    "under 50",
    "under 100",
    "for apartments",
    "for small spaces",
    "for travel",
    "for work",
    "for gaming",
    "for remote work",
    "for seniors",
    "for small hands",
    "for battery life",
    "for productivity",
    "for back support",
    "for easy cleaning",
    "for everyday use",
    "for meal prep",
    "for countertop use"
  ];

  const hit = modifiers.find((modifier) => lowered.includes(modifier));
  return hit || "core";
}

export function detectAudience(text = "") {
  const lowered = String(text).toLowerCase();

  const rules = [
    ["beginners", "for beginners"],
    ["budget-buyers", "under "],
    ["apartment-dwellers", "apartments"],
    ["travel-buyers", "travel"],
    ["office-workers", "for work"],
    ["remote-workers", "remote work"],
    ["gamers", "gaming"],
    ["space-limited-buyers", "small spaces"],
    ["accessibility-buyers", "small hands"],
    ["seniors", "seniors"]
  ];

  const match = rules.find(([, token]) => lowered.includes(token));
  return match ? match[0] : "general";
}

export function candidateTopicFromText(rawText = "") {
  const cleaned = normalizeWhitespace(rawText);

  if (!cleaned) return "";

  const lowered = cleaned.toLowerCase();
  if (lowered.startsWith("best ")) {
    return titleCase(cleaned);
  }

  return titleCase(`best ${cleaned}`);
}

export function normalizeRawSignal(raw) {
  const sourceType = getSourceType(raw.source);
  const candidateTopic = candidateTopicFromText(raw.rawText);
  const modifier = detectModifier(candidateTopic);
  const audience = detectAudience(candidateTopic);
  const freshnessScore = freshnessScoreFromTimestamp(raw.capturedAt);
  const confidenceScore = buildTrustScore(raw.source);
  const marketSignalScore = decayScore(
    Math.round((confidenceScore * 0.7) + (freshnessScore * 0.3)),
    raw.capturedAt
  );

  return buildSignalRecord({
    source: raw.source,
    sourceType,
    packName: raw.packName,
    category: raw.category,
    seed: raw.seed,
    rawText: normalizeWhitespace(raw.rawText),
    candidateTopic,
    modifier,
    audience,
    freshnessScore,
    confidenceScore,
    marketSignalScore,
    capturedAt: raw.capturedAt,
    url: raw.url || null
  });
}
