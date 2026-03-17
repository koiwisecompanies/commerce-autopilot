import path from "path";

export const FEEDBACK_ROOT = path.resolve(".");
export const EVENTS_DIR = path.resolve("./events");
export const SUMMARIES_DIR = path.resolve("./summaries");
export const REPORTS_DIR = path.resolve("./reports");
export const STATE_DIR = path.resolve("./state");

export const SITE_GUIDES_FILE = path.resolve("../site/src/data/guides.json");
export const SIGNAL_MERGED_FILE = path.resolve("../signal-connectors/data/merged/latest.json");

export const RAPID_DUPLICATE_WINDOW_MS = 2000;
export const HIGH_INTENT_CLICK_EVENTS = new Set([
  "outbound_click",
  "cta_click",
  "recommendation_click"
]);
