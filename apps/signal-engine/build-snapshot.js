import { listAvailablePacks } from "./lib/seed-service.js";
import { analyzePack, recommendNextPacks } from "./lib/recommendation-service.js";
import { buildInventory } from "./lib/site-inventory.js";
import { writeSignalReport, writeManifest, ensureSignalDirs } from "./lib/report-service.js";

await ensureSignalDirs();

const packs = await listAvailablePacks();
const inventory = await buildInventory();
const recommendation = await recommendNextPacks();

const analyses = [];
for (const packName of packs) {
  analyses.push(await analyzePack(packName));
}

const snapshot = {
  generatedAt: new Date().toISOString(),
  inventory: {
    totalGuides: inventory.totalGuides,
    categoryCounts: inventory.categoryCounts,
    dominantCategory: inventory.dominantCategory,
    modifierCounts: inventory.modifierCounts,
    audienceCounts: inventory.audienceCounts
  },
  recommendation,
  topSitewideTopics: analyses
    .flatMap((item) => item.topTopics.map((topic) => ({ ...topic, packName: item.packName })))
    .sort((a, b) => b.scores.finalScore - a.scores.finalScore)
    .slice(0, 25),
  packSummaries: analyses.map((item) => ({
    packName: item.packName,
    packScore: item.packScore,
    topTopics: item.topTopics.slice(0, 5)
  }))
};

const reportFiles = await writeSignalReport({
  type: "market-snapshot",
  ...snapshot
});

const manifestPath = await writeManifest("recommendation-snapshot", snapshot);

console.log("");
console.log("Signal snapshot");
console.log("---------------");
console.log(`Total guides: ${snapshot.inventory.totalGuides}`);
console.log(`Dominant category: ${snapshot.inventory.dominantCategory?.name || "none"}`);
console.log(`Recommended next pack: ${snapshot.recommendation.recommendedPack?.packName || "none"}`);
console.log("");
console.log("Top sitewide topics:");
for (const item of snapshot.topSitewideTopics.slice(0, 10)) {
  console.log(`- ${item.topic} (${item.packName}) ${item.scores.finalScore.toFixed(1)}`);
}
console.log("");
console.log(`Report: ${reportFiles.latest}`);
console.log(`Manifest: ${manifestPath}`);
