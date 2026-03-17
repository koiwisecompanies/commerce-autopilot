import fs from "fs-extra";
import path from "path";
import { REPORTS_DIR } from "./lib/config.js";

const latest = path.join(REPORTS_DIR, "latest.json");
const exists = await fs.pathExists(latest);

if (!exists) {
  console.log("No signal-connectors report found.");
  process.exit(0);
}

const report = await fs.readJSON(latest);

console.log("");
console.log("Signal Connectors Report");
console.log("------------------------");
console.log(`Type: ${report.type}`);
if (report.packs) {
  console.log(`Packs: ${report.packs.join(", ")}`);
}
if (report.rawSignalCount !== undefined) {
  console.log(`Raw signals: ${report.rawSignalCount}`);
}
if (report.normalizedCount !== undefined) {
  console.log(`Normalized records: ${report.normalizedCount}`);
}
if (report.mergedCount !== undefined) {
  console.log(`Merged signals: ${report.mergedCount}`);
}
if (report.connectorErrorsCount !== undefined) {
  console.log(`Connector errors: ${report.connectorErrorsCount}`);
}
if (report.topSignals?.length) {
  console.log("");
  console.log("Top signals:");
  for (const item of report.topSignals.slice(0, 10)) {
    console.log(`- ${item.candidateTopic} | score=${item.mergedMarketSignalScore}`);
  }
}
