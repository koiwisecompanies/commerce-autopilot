import fs from "fs-extra";
import path from "path";
import { MERGED_DIR } from "./lib/config.js";

const mergedLatest = path.join(MERGED_DIR, "latest.json");
const exists = await fs.pathExists(mergedLatest);

if (!exists) {
  console.error("No merged signal file found. Run: pnpm signals:merge");
  process.exit(1);
}

const payload = await fs.readJSON(mergedLatest);

console.log("");
console.log("Signal summary");
console.log("--------------");
console.log(`Merged signals: ${payload.mergedCount}`);
console.log("");

console.log("Category summary:");
for (const item of payload.categorySummary.slice(0, 10)) {
  console.log(`- ${item.category}: ${item.count} | avg signal ${item.avgMarketSignalScore}`);
}

console.log("");
console.log("Top modifiers:");
for (const item of payload.modifiers.slice(0, 10)) {
  console.log(`- ${item.modifier}: ${item.count}`);
}

console.log("");
console.log("Top audiences:");
for (const item of payload.audiences.slice(0, 10)) {
  console.log(`- ${item.audience}: ${item.count}`);
}

console.log("");
console.log("Top merged signals:");
for (const item of payload.records.slice(0, 10)) {
  console.log(`- ${item.candidateTopic} | score=${item.mergedMarketSignalScore} | sources=${item.supportingSourceCount}`);
}
