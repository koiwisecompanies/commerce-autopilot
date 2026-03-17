import fs from "fs";
import path from "path";
import { SUMMARIES_DIR } from "./lib/config.js";

const file = path.join(SUMMARIES_DIR, "category-feedback.json");

if (!fs.existsSync(file)) {
  console.error("No category feedback found. Run: pnpm feedback:summarize");
  process.exit(1);
}

const payload = JSON.parse(fs.readFileSync(file, "utf8"));

console.log("");
console.log("Category performance");
console.log("--------------------");

for (const item of payload.categories.slice(0, 20)) {
  console.log(`- ${item.category} | views=${item.views} | actionRate=${item.actionRate} | intent=${item.highIntentRate} | market=${item.marketSignal ?? "n/a"}`);
}
