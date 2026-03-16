import { readLatestReport } from "./lib/report-utils.js";

const report = await readLatestReport();

if (!report) {
  console.log("No latest report found.");
  process.exit(0);
}

console.log("Latest generation report");
console.log("------------------------");
console.log(`Started: ${report.startedAt}`);
console.log(`Finished: ${report.finishedAt}`);
console.log(`Source: ${report.source}`);
console.log(`Dry run: ${report.dryRun}`);
console.log(`Processed: ${report.totals.processed}`);
console.log(`Created: ${report.totals.created}`);
console.log(`Duplicates skipped: ${report.totals.skippedDuplicates}`);
console.log(`Validation failures: ${report.totals.failedValidation}`);
console.log("");

if (report.created.length) {
  console.log("Created guides:");
  for (const item of report.created) {
    console.log(`- ${item.slug} [${item.category}]`);
  }
  console.log("");
}

if (report.skippedDuplicates.length) {
  console.log("Skipped duplicates:");
  for (const item of report.skippedDuplicates) {
    console.log(`- ${item.slug}`);
  }
  console.log("");
}

if (report.failedValidation.length) {
  console.log("Validation failures:");
  for (const item of report.failedValidation) {
    console.log(`- ${item.topic || "(empty topic)"} -> ${item.errors.join("; ")}`);
  }
}
