import { recommendNextPacks } from "./lib/recommendation-service.js";
import { writeSignalReport, writeManifest, ensureSignalDirs } from "./lib/report-service.js";

await ensureSignalDirs();

const recommendation = await recommendNextPacks();

const report = {
  type: "pack-recommendation",
  ...recommendation
};

const reportFiles = await writeSignalReport(report);
const manifestPath = await writeManifest("recommended-next-packs", recommendation);

console.log("");
console.log("Pack recommendation");
console.log("-------------------");

if (!recommendation.recommendedPack) {
  console.log("No packs found.");
  process.exit(0);
}

console.log(`Recommended next pack: ${recommendation.recommendedPack.packName}`);
console.log(`Final pack score: ${recommendation.recommendedPack.metrics.finalPackScore}`);
console.log("");

console.log("Ranked packs:");
for (const pack of recommendation.rankedPacks) {
  console.log(
    `- ${pack.packName}: ${pack.metrics.finalPackScore} | publish-now=${pack.totals.publishNow} | avg-topic=${pack.metrics.avgTopicScore}`
  );
}
console.log("");
console.log(`Report: ${reportFiles.latest}`);
console.log(`Manifest: ${manifestPath}`);
