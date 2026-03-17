import fs from "fs";
import { SIGNAL_MERGED_FILE } from "./config.js";
import { slugifyText } from "./page-utils.js";

export function loadSignalContext() {
  if (!fs.existsSync(SIGNAL_MERGED_FILE)) {
    return {
      categoryMap: new Map(),
      guideMap: new Map()
    };
  }

  const payload = JSON.parse(fs.readFileSync(SIGNAL_MERGED_FILE, "utf8"));
  const categoryMap = new Map();
  const guideMap = new Map();

  for (const item of payload.categorySummary || []) {
    categoryMap.set(item.category, item);
  }

  for (const item of payload.records || []) {
    const key = slugifyText(item.candidateTopic.replace(/^best\s+/i, ""));
    guideMap.set(key, item);
  }

  return { categoryMap, guideMap };
}
