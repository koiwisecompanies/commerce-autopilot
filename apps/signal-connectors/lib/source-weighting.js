import { SOURCE_WEIGHTS, SOURCE_TYPES } from "./config.js";

export function getSourceWeight(source) {
  return SOURCE_WEIGHTS[source] ?? 0.5;
}

export function getSourceType(source) {
  return SOURCE_TYPES[source] ?? "unknown";
}

export function buildTrustScore(source) {
  return Math.round(getSourceWeight(source) * 100);
}
