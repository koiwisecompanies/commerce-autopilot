import fs from "fs-extra";
import path from "path";
import { NORMALIZED_DIR } from "./lib/config.js";
import { mergeSignals } from "./lib/merge-records.js";
import { buildCategorySummary } from "./lib/category-summary.js";
import { discoverModifiers } from "./lib/modifier-discovery.js";
import { discoverAudiences } from "./lib/audience-discovery.js";
import { writeMergedSignals, writeSnapshot, writeConnectorReport } from "./lib/report-service.js";

const normalizedLatest = path.join(NORMALIZED_DIR, "latest.json");
const exists = await fs.pathExists(normalizedLatest);

if (!exists) {
  console.error("No normalized signal file found. Run: pnpm signals:normalize");
  process.exit(1);
}

const normalizedPayload = await fs.readJSON(normalizedLatest);
const mergedRecords = mergeSignals(normalizedPayload.records);

const categorySummary = buildCategorySummary(mergedRecords);
const modifiers = discoverModifiers(mergedRecords);
const audiences = discoverAudiences(mergedRecords);

const mergedPayload = {
  mergedAt: new Date().toISOString(),
  sourceNormalizeTimestamp: normalizedPayload.normalizedAt,
  packs: normalizedPayload.packs,
  mergedCount: mergedRecords.length,
  categorySummary,
  modifiers,
  audiences,
  records: mergedRecords
};

const mergedFiles = await writeMergedSignals(mergedPayload);

const snapshot = {
  generatedAt: mergedPayload.mergedAt,
  mergedCount: mergedRecords.length,
  topSignals: mergedRecords.slice(0, 25),
  categorySummary,
  modifiers: modifiers.slice(0, 20),
  audiences: audiences.slice(0, 20)
};

const snapshotFiles = await writeSnapshot(snapshot);

const report = {
  type: "merge",
  mergedAt: mergedPayload.mergedAt,
  mergedCount: mergedRecords.length,
  topSignals: mergedRecords.slice(0, 10),
  categorySummary,
  topModifiers: modifiers.slice(0, 10),
  topAudiences: audiences.slice(0, 10)
};

const reportFiles = await writeConnectorReport(report);

console.log("");
console.log("Signal merge");
console.log("------------");
console.log(`Merged signals: ${mergedRecords.length}`);
console.log("");
console.log("Top merged signals:");
for (const item of mergedRecords.slice(0, 10)) {
  console.log(`- ${item.candidateTopic} | score=${item.mergedMarketSignalScore} | sources=${item.supportingSourceCount}`);
}
console.log("");
console.log(`Merged latest: ${mergedFiles.latest}`);
console.log(`Snapshot latest: ${snapshotFiles.latest}`);
console.log(`Report: ${reportFiles.latest}`);
