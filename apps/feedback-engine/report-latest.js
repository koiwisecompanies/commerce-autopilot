import fs from "fs";
import path from "path";
import { REPORTS_DIR } from "./lib/config.js";

const file = path.join(REPORTS_DIR, "latest.json");

if (!fs.existsSync(file)) {
  console.log("No feedback report found.");
  process.exit(0);
}

const report = JSON.parse(fs.readFileSync(file, "utf8"));

console.log("");
console.log("Feedback report");
console.log("---------------");
console.log(`Generated at: ${report.generatedAt}`);
console.log(`Events: ${report.totals.events}`);
console.log(`Sessions: ${report.totals.sessions}`);
console.log(`Guides tracked: ${report.totals.guidesTracked}`);
console.log("");

console.log("Top winners:");
for (const item of report.topWinners.slice(0, 10)) {
  console.log(`- ${item.title} | health=${item.healthScore} | intent=${item.commercialIntentScore}`);
}
