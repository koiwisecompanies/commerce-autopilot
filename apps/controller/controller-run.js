import { PACKS } from "./lib/config.js";
import { runPack } from "./lib/pack-runner.js";

const args = process.argv.slice(2);
const command = args[0];

function printPackList() {
  console.log("Available packs:");
  for (const name of Object.keys(PACKS)) {
    console.log(`- ${name}`);
  }
}

if (!command) {
  console.log("Usage:");
  console.log("  pnpm run sample [--dry-run|--publish]");
  console.log("  pnpm run pack <pack-name> [--dry-run|--publish]");
  console.log("  pnpm run publish <pack-name>");
  process.exit(1);
}

let packName = null;
let rawArgs = args.slice(1);

if (command === "sample") {
  packName = "sample";
} else if (command === "pack") {
  packName = args[1];
  rawArgs = args.slice(2);
  if (!packName) {
    console.error("Please provide a pack name.");
    printPackList();
    process.exit(1);
  }
} else if (command === "publish") {
  packName = args[1];
  rawArgs = ["--publish"];
  if (!packName) {
    console.error("Please provide a pack name.");
    printPackList();
    process.exit(1);
  }
} else {
  console.error(`Unknown command: ${command}`);
  printPackList();
  process.exit(1);
}

const report = await runPack(packName, rawArgs);

console.log("");
console.log("Controller summary");
console.log("------------------");
console.log(`Pack: ${report.packName}`);
console.log(`Mode: ${report.mode}`);
console.log(`Success: ${report.ok ? "yes" : "no"}`);

if (report.generator?.generatorReport?.totals) {
  console.log(`Processed: ${report.generator.generatorReport.totals.processed}`);
  console.log(`Created: ${report.generator.generatorReport.totals.created}`);
  console.log(`Duplicates skipped: ${report.generator.generatorReport.totals.skippedDuplicates}`);
  console.log(`Validation failures: ${report.generator.generatorReport.totals.failedValidation}`);
}

if (report.publish) {
  if (report.publish.skipped) {
    console.log(`Publish: skipped (${report.publish.reason})`);
  } else if (report.publish.ok) {
    console.log(`Publish: pushed`);
    console.log(`Branch: ${report.publish.branch}`);
    console.log(`Commit: ${report.publish.hash}`);
  } else {
    console.log(`Publish: failed at ${report.publish.stage}`);
  }
}

if (report.error) {
  console.log(`Error: ${report.error}`);
}

console.log(`Report: ${report.files.latest}`);

if (!report.ok) {
  process.exit(1);
}
