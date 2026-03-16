import path from "path";
import { loadTopicsFromFile, runGeneration } from "./lib/generation-engine.js";

const sampleFile = path.resolve("./data/sample-topics.txt");
const topics = await loadTopicsFromFile(sampleFile);

const report = await runGeneration({
  topics,
  source: "sample-pack",
  dryRun: false
});

for (const item of report.created) {
  console.log(`Guide created: ${item.slug} [${item.category}]`);
}

for (const item of report.skippedDuplicates) {
  console.log(`Skipped duplicate: ${item.slug}`);
}

for (const item of report.failedValidation) {
  console.log(`Validation failed: ${item.topic || "(empty topic)"} -> ${item.errors.join("; ")}`);
}

console.log(`Processed: ${report.totals.processed}`);
console.log(`Created: ${report.totals.created}`);
console.log(`Duplicates skipped: ${report.totals.skippedDuplicates}`);
console.log(`Validation failures: ${report.totals.failedValidation}`);
console.log(`Report written: ${report.files.latestReportFile}`);
