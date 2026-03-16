import fs from "fs-extra";
import path from "path";

const reportPath = path.resolve("./reports/latest-run.json");

const exists = await fs.pathExists(reportPath);

if (!exists) {
  console.log("No topic-engine report found.");
  process.exit(0);
}

const report = await fs.readJSON(reportPath);

console.log("");
console.log("Topic Engine Report");
console.log("-------------------");
console.log(`Pack: ${report.packName}`);
console.log(`Seeds processed: ${report.seedsProcessed}`);
console.log(`Guides checked: ${report.guidesChecked}`);
console.log("");
console.log("Totals:");
console.log(`- Generated: ${report.totals.generated}`);
console.log(`- Accepted: ${report.totals.accepted}`);
console.log(`- Duplicates: ${report.totals.duplicates}`);
console.log(`- Low score: ${report.totals.lowScore}`);
console.log("");
