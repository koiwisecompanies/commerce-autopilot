import { readLatestControllerReport } from "./lib/report-service.js";
import { getWorkingTreeStatus, getCurrentBranch, getLatestCommitHash } from "./lib/git-service.js";
import fs from "fs-extra";
import path from "path";

const latestGeneratorReportPath = path.resolve("../generator/reports/latest-run.json");
const controllerReport = await readLatestControllerReport();
const workingTree = await getWorkingTreeStatus();
const branch = await getCurrentBranch();
const hash = await getLatestCommitHash();

let generatorReport = null;
if (await fs.pathExists(latestGeneratorReportPath)) {
  generatorReport = await fs.readJSON(latestGeneratorReportPath);
}

console.log("Controller status");
console.log("-----------------");
console.log(`Branch: ${branch}`);
console.log(`Latest commit: ${hash || "none"}`);
console.log(`Working tree clean: ${workingTree.changed ? "no" : "yes"}`);
console.log("");

if (controllerReport) {
  console.log("Latest controller run:");
  console.log(`- Pack: ${controllerReport.packName}`);
  console.log(`- Mode: ${controllerReport.mode}`);
  console.log(`- Success: ${controllerReport.ok ? "yes" : "no"}`);
  console.log(`- Started: ${controllerReport.startedAt}`);
  console.log(`- Finished: ${controllerReport.finishedAt}`);
  console.log("");
} else {
  console.log("No controller run report found.");
  console.log("");
}

if (generatorReport?.totals) {
  console.log("Latest generator run:");
  console.log(`- Source: ${generatorReport.source}`);
  console.log(`- Processed: ${generatorReport.totals.processed}`);
  console.log(`- Created: ${generatorReport.totals.created}`);
  console.log(`- Duplicates skipped: ${generatorReport.totals.skippedDuplicates}`);
  console.log(`- Validation failures: ${generatorReport.totals.failedValidation}`);
} else {
  console.log("No generator report found.");
}
