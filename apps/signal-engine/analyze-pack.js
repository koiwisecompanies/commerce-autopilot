import { analyzePack } from "./lib/recommendation-service.js";
import { writeSignalReport, writeManifest, writeQueue, ensureSignalDirs } from "./lib/report-service.js";

const packName = process.argv[2];

if (!packName) {
  console.error('Usage: pnpm signal:analyze <pack>');
  process.exit(1);
}

await ensureSignalDirs();

const analysis = await analyzePack(packName);

const report = {
  type: "pack-analysis",
  ...analysis
};

const reportFiles = await writeSignalReport(report);

const manifestPath = await writeManifest(`${packName}-priority`, {
  packName,
  analyzedAt: analysis.analyzedAt,
  packScore: analysis.packScore,
  topTopics: analysis.topTopics,
  scoredTopics: analysis.scoredTopics
});

const queueFiles = {};
queueFiles.publishNow = await writeQueue(`${packName}-publish-now`, analysis.queues.publishNow);
queueFiles.holdForLater = await writeQueue(`${packName}-hold-for-later`, analysis.queues.holdForLater);
queueFiles.researchQueue = await writeQueue(`${packName}-research-queue`, analysis.queues.researchQueue);
queueFiles.delayCategory = await writeQueue(`${packName}-delay-category`, analysis.queues.delayCategory);
queueFiles.avoid = await writeQueue(`${packName}-avoid`, analysis.queues.avoid);

console.log("");
console.log("Signal analysis");
console.log("---------------");
console.log(`Pack: ${analysis.packName}`);
console.log(`Seeds: ${analysis.seeds.length}`);
console.log(`Candidates: ${analysis.candidateCount}`);
console.log(`Avg topic score: ${analysis.packScore.metrics.avgTopicScore}`);
console.log(`Pack score: ${analysis.packScore.metrics.finalPackScore}`);
console.log(`Publish-now topics: ${analysis.packScore.totals.publishNow}`);
console.log(`Hold-for-later topics: ${analysis.packScore.totals.holdForLater}`);
console.log(`Avoid topics: ${analysis.packScore.totals.avoid}`);
console.log("");
console.log("Top 10 topics:");
for (const item of analysis.topTopics.slice(0, 10)) {
  console.log(`- ${item.topic} (${item.scores.finalScore.toFixed(1)}) [${item.decision.action}]`);
}
console.log("");
console.log(`Report: ${reportFiles.latest}`);
console.log(`Manifest: ${manifestPath}`);
console.log(`Queues dir: apps/signal-engine/queues`);
