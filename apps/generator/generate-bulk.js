import path from "path";
import { loadTopicsFromFile, runGeneration } from "./lib/generation-engine.js";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const fileArg = args.find((arg) => arg !== "--dry-run");

if (!fileArg) {
  console.error("Please provide a topic file, for example: pnpm generate:bulk data/sample-topics.txt");
  process.exit(1);
}

const filePath = path.resolve(fileArg);
const topics = await loadTopicsFromFile(filePath);

const report = await runGeneration({
  topics,
  source: `bulk-file:${filePath}`,
  dryRun
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
