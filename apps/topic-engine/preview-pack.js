import { buildPackTopics } from "./lib/topic-builder.js";
import { writeTopicReport } from "./lib/report-service.js";

const packName = process.argv[2];

if (!packName) {
  console.error("Usage: pnpm topic:preview <pack>");
  process.exit(1);
}

const result = await buildPackTopics(packName);

const report = {
  mode: "preview",
  packName,
  seedsProcessed: result.seedsProcessed,
  guidesChecked: result.guidesChecked,
  totals: {
    generated: result.generated.length,
    accepted: result.accepted.length,
    duplicates: result.duplicates.length,
    lowScore: result.lowScore.length
  }
};

report.files = await writeTopicReport(report);

console.log("Topic preview");
console.log("-------------");
console.log(`Pack: ${packName}`);
console.log(`Seeds processed: ${report.seedsProcessed}`);
console.log(`Generated candidates: ${report.totals.generated}`);
console.log(`Accepted topics: ${report.totals.accepted}`);
console.log(`Duplicates skipped: ${report.totals.duplicates}`);
console.log(`Low-score skipped: ${report.totals.lowScore}`);
