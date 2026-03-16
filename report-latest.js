import { readLatestTopicReport } from "./lib/report-service.js";

const report = await readLatestTopicReport();

if (!report) {
  console.log("No topic-engine report found.");
  process.exit(0);
}

console.log("Latest topic-engine report");
console.log("--------------------------");
console.log(`Mode: ${report.mode}`);
console.log(`Pack: ${report.packName}`);
console.log(`Seeds processed: ${report.seedsProcessed}`);
console.log(`Guides checked: ${report.guidesChecked}`);
console.log(`Generated candidates: ${report.totals.generated}`);
console.log(`Accepted topics: ${report.totals.accepted}`);
console.log(`Duplicates skipped: ${report.totals.duplicates}`);
console.log(`Low-score skipped: ${report.totals.lowScore}`);

if (report.outputFile) {
  console.log(`Output file: ${report.outputFile}`);
}
