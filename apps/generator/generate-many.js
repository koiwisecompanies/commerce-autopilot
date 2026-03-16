import { loadTopicsFromCsv, runGeneration } from "./lib/generation-engine.js";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const csv = args.filter((arg) => arg !== "--dry-run").join(" ").trim();

if (!csv) {
  console.error('Please provide a comma-separated topic list, for example: pnpm generate:many "Best Desk Lamp, Best Office Chair, Best Monitor Arm"');
  process.exit(1);
}

const topics = loadTopicsFromCsv(csv);

const report = await runGeneration({
  topics,
  source: "csv-inline",
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
