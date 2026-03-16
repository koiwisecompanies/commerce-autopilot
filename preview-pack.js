import { buildPackTopics } from "./lib/topic-builder.js";
import { writeTopicReport } from "./lib/report-service.js";

const packName = process.argv[2];

if (!packName) {
  console.error("Please provide a pack name, for example: pnpm topic:preview kitchen");
  process.exit(1);
}

const result = await buildPackTopics(packName);

const report = {
  startedAt: new Date().toISOString(),
  mode: "preview",
  packName,
  seedsProcessed: result.seedsProcessed,
  guidesChecked: result.guidesChecked,
  totals: {
    generated: result.generated.length,
    accepted: result.accepted.length,
    duplicates: result.duplicates.length,
    lowScore: result.lowScore.length
  },
  accepted: result.accepted.slice(0, 25),
  duplicates: result.duplicates.slice(0, 10),
  lowScore: result.lowScore.slice(0, 10)
};

report.finishedAt = new Date().toISOString();
report.files = await writeTopicReport(report);

console.log("Topic preview");
console.log("-------------");
console.log(`Pack: ${packName}`);
console.log(`Seeds processed: ${report.seedsProcessed}`);
console.log(`Guides checked: ${report.guidesChecked}`);
console.log(`Generated candidates: ${report.totals.generated}`);
console.log(`Accepted topics: ${report.totals.accepted}`);
console.log(`Duplicates skipped: ${report.totals.duplicates}`);
console.log(`Low-score skipped: ${report.totals.lowScore}`);
console.log("");

console.log("Top accepted topics:");
for (const item of report.accepted.slice(0, 12)) {
  console.log(`- ${item.topic} [${item.category}] (score: ${item.score})`);
}

console.log("");
console.log(`Report: ${report.files.latest}`);
