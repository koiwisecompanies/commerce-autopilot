import { readLatestReport } from "./lib/report-service.js";

const report = await readLatestReport();

if (!report) {
  console.log("No prioritization report found.");
  process.exit(0);
}

console.log("Prioritization report");
console.log("---------------------");
console.log(`Generated at: ${report.generatedAt}`);
console.log(`Merged signals: ${report.inputs.mergedSignals}`);
console.log(`Feedback guides: ${report.inputs.feedbackGuides}`);
console.log(`Topic packs: ${report.inputs.topicPacks}`);
console.log("");
console.log(`Top guide: ${report.summary.topGuide?.title || "n/a"}`);
console.log(`Top family: ${report.summary.topFamily?.family || "n/a"}`);
console.log(`Top category: ${report.summary.topCategory?.category || "n/a"}`);
console.log(`Top modifier: ${report.summary.topModifier?.modifier || "n/a"}`);
console.log(`Top audience: ${report.summary.topAudience?.audience || "n/a"}`);
console.log(`Top pack: ${report.summary.topPack?.packName || "n/a"}`);
console.log("");
console.log(`Publish queue: ${report.summary.publishQueueSize}`);
console.log(`Refresh queue: ${report.summary.refreshQueueSize}`);
console.log(`Promote queue: ${report.summary.promoteQueueSize}`);
console.log(`Inspect queue: ${report.summary.inspectQueueSize}`);
