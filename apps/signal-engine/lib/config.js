import path from "path";

export const SIGNAL_ENGINE_DIR = path.resolve(".");
export const REPO_ROOT = path.resolve("../..");

export const REPORTS_DIR = path.resolve("./reports");
export const MANIFESTS_DIR = path.resolve("./manifests");
export const QUEUES_DIR = path.resolve("./queues");

export const SITE_GUIDES_PATH = path.resolve("../site/src/data/guides.json");
export const TOPIC_SEEDS_DIR = path.resolve("../topic-engine/seeds");

export const MODIFIER_WEIGHTS = {
  "for beginners": 16,
  "under 50": 18,
  "under 100": 16,
  "for apartments": 15,
  "for small spaces": 15,
  "for travel": 14,
  "for work": 13,
  "for gaming": 13,
  "for remote work": 14,
  "for seniors": 12,
  "for small hands": 12,
  "for battery life": 11,
  "for productivity": 11,
  "for back support": 11,
  "for easy cleaning": 12,
  "for everyday use": 10,
  "for meal prep": 11,
  "for countertop use": 10,
  "for beginners under 100": 18
};

export const AUDIENCE_PATTERNS = [
  { key: "beginners", label: "beginners", weight: 10 },
  { key: "budget-buyers", label: "under", weight: 9 },
  { key: "apartment-dwellers", label: "apartments", weight: 8 },
  { key: "travel-buyers", label: "travel", weight: 8 },
  { key: "office-workers", label: "work", weight: 7 },
  { key: "remote-workers", label: "remote work", weight: 9 },
  { key: "gamers", label: "gaming", weight: 8 },
  { key: "space-limited-buyers", label: "small spaces", weight: 8 },
  { key: "accessibility-buyers", label: "small hands", weight: 7 },
  { key: "seniors", label: "seniors", weight: 7 }
];

export const PACK_SCORE_WEIGHTS = {
  avgTopicScore: 0.45,
  publishNowRatio: 0.20,
  balanceGain: 0.20,
  saturationPenalty: 0.10,
  duplicatePenalty: 0.05
};

export const TOPIC_ACTION_THRESHOLDS = {
  publishNow: 72,
  holdForLater: 56,
  delayCategory: 42
};
