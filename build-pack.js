import { buildPackTopics } from "./lib/topic-builder.js";
import { writeGeneratedPack } from "./lib/pack-writer.js";
import { writeTopicReport } from "./lib/report-service.js";

const packName = process.argv[2];

if (!packName) {
  console.error("Please provide a pack name, for example: pnpm topic:build kitchen");
  process.exit(1);
}

const result = await buildPackTopics(packName);
const outputFile = await writeGeneratedPack(packName, result.accepted);

const report = {
  startedAt: new Date().toISOString(),
  mode: "build",
  packName,
  seedsProcessed: result.seedsProcessed,
  guidesChecked: result.guidesChecked,
  totals: {
    generated: result.generated.length,
    accepted: result.accepted.length,
    duplicates: result.duplicates.length,
    lowScore: result.lowScore.length
  },
  outputFile,
  accepted: result.accepted.slice(0, 50),
  duplicates: result.duplicates.slice(0, 20),
  lowScore: result.lowScore.slice(0, 20)
};

report.finishedAt = new Date().toISOString();
report.files = await writeTopicReport(report);

console.log("Topic pack built");
console.log("----------------");
console.log(`Pack: ${packName}`);
console.log(`Seeds processed: ${report.seedsProcessed}`);
console.log(`Generated candidates: ${report.totals.generated}`);
console.log(`Accepted topics written: ${report.totals.accepted}`);
console.log(`Duplicates skipped: ${report.totals.duplicates}`);
console.log(`Low-score skipped: ${report.totals.lowScore}`);
console.log(`Output file: ${outputFile}`);
console.log(`Report: ${report.files.latest}`);
