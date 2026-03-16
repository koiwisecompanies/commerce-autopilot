import { buildPackTopics } from "./lib/topic-builder.js";
import { writeGeneratedPack } from "./lib/pack-writer.js";
import { writeTopicReport } from "./lib/report-service.js";

const packName = process.argv[2];

if (!packName) {
  console.error("Usage: pnpm topic:build <pack>");
  process.exit(1);
}

const result = await buildPackTopics(packName);
const outputFile = await writeGeneratedPack(packName, result.accepted);

const report = {
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
  outputFile
};

report.files = await writeTopicReport(report);

console.log("Topic pack built");
console.log("----------------");
console.log(`Pack: ${packName}`);
console.log(`Accepted topics written: ${report.totals.accepted}`);
console.log(`Output file: ${outputFile}`);
