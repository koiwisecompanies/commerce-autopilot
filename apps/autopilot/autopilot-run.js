import { runAutopilot } from "./lib/pipeline-runner.js";

const mode = process.argv[2];
const packName = process.argv[3];

if (!mode || !packName) {
  console.error("Usage:");
  console.error("  pnpm autopilot:preview <pack>");
  console.error("  pnpm autopilot:generate <pack>");
  console.error("  pnpm autopilot:publish <pack>");
  console.error("  pnpm autopilot:launch <pack>");
  process.exit(1);
}

const report = await runAutopilot({ packName, mode });

console.log("");
console.log("Autopilot summary");
console.log("-----------------");
console.log(`Pack: ${report.packName}`);
console.log(`Mode: ${report.mode}`);
console.log(`Success: ${report.ok ? "yes" : "no"}`);
console.log("");

if (report.outputs.topicTotals) {
  console.log("Topic stage:");
  console.log(`- Accepted topics: ${report.outputs.topicTotals.accepted}`);
  console.log(`- Generated candidates: ${report.outputs.topicTotals.generated}`);
  console.log(`- Duplicates skipped: ${report.outputs.topicTotals.duplicates}`);
  console.log(`- Low-score skipped: ${report.outputs.topicTotals.lowScore}`);
  console.log("");
}

if (report.outputs.generatorTotals) {
  console.log("Generator stage:");
  console.log(`- Processed: ${report.outputs.generatorTotals.processed}`);
  console.log(`- Created: ${report.outputs.generatorTotals.created}`);
  console.log(`- Duplicates skipped: ${report.outputs.generatorTotals.skippedDuplicates}`);
  console.log(`- Validation failures: ${report.outputs.generatorTotals.failedValidation}`);
  console.log("");
}

console.log("Publish stage:");
if (report.stages.publish.skipped) {
  console.log(`- Skipped: yes (${report.stages.publish.reason})`);
} else {
  console.log(`- Success: ${report.stages.publish.ok ? "yes" : "no"}`);
}
console.log("");

console.log("Inventory after run:");
console.log(`- Total guides: ${report.inventory.after.totalGuides}`);
console.log(`- Categories represented: ${report.inventory.after.categoriesRepresented}`);
if (report.inventory.after.dominantCategory) {
  console.log(
    `- Dominant category: ${report.inventory.after.dominantCategory.name} (${(report.inventory.after.dominantCategory.share * 100).toFixed(1)}%)`
  );
}
console.log("");

console.log("Launch readiness:");
console.log(`- Launch-safe: ${report.inventory.launchReadiness.launchSafe ? "yes" : "no"}`);
if (report.inventory.launchReadiness.warnings.length > 0) {
  for (const warning of report.inventory.launchReadiness.warnings) {
    console.log(`- Warning: ${warning}`);
  }
}
console.log("");

console.log("Git:");
console.log(`- Before commit: ${report.git.before.commit}`);
if (report.git.after) {
  console.log(`- After commit: ${report.git.after.commit}`);
}
console.log("");

if (report.error) {
  console.log(`Error: ${report.error}`);
}

console.log(`Report: ${report.files.latest}`);

if (!report.ok) {
  process.exit(1);
}
