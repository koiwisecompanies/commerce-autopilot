import fs from "fs-extra";
import path from "path";
import { REPORTS_DIR } from "./lib/config.js";

const latest = path.join(REPORTS_DIR, "latest.json");
const exists = await fs.pathExists(latest);

if (!exists) {
  console.log("No signal-engine report found.");
  process.exit(0);
}

const report = await fs.readJSON(latest);

console.log("");
console.log("Signal Engine Report");
console.log("--------------------");
console.log(`Type: ${report.type || "unknown"}`);
console.log(`Generated at: ${report.generatedAt || report.analyzedAt || "unknown"}`);

if (report.packName) {
  console.log(`Pack: ${report.packName}`);
}

if (report.recommendedPack) {
  console.log(`Recommended pack: ${report.recommendedPack.packName}`);
}

if (report.packScore?.metrics) {
  console.log(`Pack score: ${report.packScore.metrics.finalPackScore}`);
  console.log(`Avg topic score: ${report.packScore.metrics.avgTopicScore}`);
}

if (report.topTopics?.length) {
  console.log("");
  console.log("Top topics:");
  for (const item of report.topTopics.slice(0, 10)) {
    console.log(`- ${item.topic} (${item.scores.finalScore.toFixed(1)}) [${item.decision.action}]`);
  }
}
