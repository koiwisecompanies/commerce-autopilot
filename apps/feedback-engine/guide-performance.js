import fs from "fs";
import path from "path";
import { SUMMARIES_DIR } from "./lib/config.js";

const file = path.join(SUMMARIES_DIR, "guide-feedback.json");

if (!fs.existsSync(file)) {
  console.error("No guide feedback found. Run: pnpm feedback:summarize");
  process.exit(1);
}

const payload = JSON.parse(fs.readFileSync(file, "utf8"));

console.log("");
console.log("Guide performance");
console.log("-----------------");

for (const guide of payload.guides.slice(0, 20)) {
  console.log(`- ${guide.title} | views=${guide.views} | health=${guide.healthScore} | intent=${guide.commercialIntentScore} | class=${guide.actionClass}`);
}
