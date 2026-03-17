import path from "path";

export const CONNECTORS_ROOT = path.resolve(".");
export const TOPIC_ENGINE_SEEDS_DIR = path.resolve("../topic-engine/seeds");

export const DATA_DIR = path.resolve("./data");
export const RAW_DIR = path.resolve("./data/raw");
export const NORMALIZED_DIR = path.resolve("./data/normalized");
export const MERGED_DIR = path.resolve("./data/merged");
export const SNAPSHOTS_DIR = path.resolve("./data/snapshots");
export const REPORTS_DIR = path.resolve("./reports");

export const GOOGLE_SUGGEST_URL = "https://suggestqueries.google.com/complete/search";
export const DDG_SUGGEST_URL = "https://duckduckgo.com/ac/";
export const REDDIT_SEARCH_URL = "https://www.reddit.com/search.json";
export const HN_SEARCH_URL = "https://hn.algolia.com/api/v1/search";

export const SOURCE_WEIGHTS = {
  google_suggest: 0.95,
  duckduckgo_suggest: 0.82,
  youtube_suggest: 0.88,
  reddit_discussion: 0.72,
  hackernews_discussion: 0.68
};

export const SOURCE_TYPES = {
  google_suggest: "search-query",
  duckduckgo_suggest: "search-query",
  youtube_suggest: "video-query",
  reddit_discussion: "discussion",
  hackernews_discussion: "tech-discussion"
};

export const CONNECTOR_TIMEOUT_MS = 12000;
export const MAX_RESULTS_PER_SOURCE = 10;

export const DEFAULT_CATEGORY_FROM_PACK = {
  kitchen: "kitchen",
  electronics: "electronics",
  "home-office": "home-office",
  pets: "pets",
  automotive: "automotive"
};
