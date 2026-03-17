import fs from "fs-extra";
import path from "path";
import { RAW_DIR } from "./lib/config.js";
import { normalizeRawSignal } from "./lib/normalize-record.js";
import { buildCategorySummary } from "./lib/category-summary.js";
import { discoverModifiers } from "./lib/modifier-discovery.js";
import { discoverAudiences } from "./lib/audience-discovery.js";
import { writeNormalizedSignals, writeConnectorReport } from "./lib/report-service.js";

const rawLatest = path.join(RAW_DIR, "latest.json");
const exists = await fs.pathExists(rawLatest);

if (!exists) {
  console.error("No raw signal file found. Run: pnpm signals:pull");
  process.exit(1);
}

const rawPayload = await fs.readJSON(rawLatest);
const normalizedRecords = rawPayload.records.map((record) => normalizeRawSignal(record));

const categorySummary = buildCategorySummary(normalizedRecords);
const modifiers = discoverModifiers(normalizedRecords);
const audiences = discoverAudiences(normalizedRecords);

const normalizedPayload = {
  normalizedAt: new Date().toISOString(),
  sourcePullTimestamp: rawPayload.pulledAt,
  packs: rawPayload.packs,
  normalizedCount: normalizedRecords.length,
  categorySummary,
  modifiers,
  audiences,
  records: normalizedRecords
};

const normalizedFiles = await writeNormalizedSignals(normalizedPayload);

const report = {
  type: "normalize",
  normalizedAt: normalizedPayload.normalizedAt,
  normalizedCount: normalizedRecords.length,
  categorySummary,
  topModifiers: modifiers.slice(0, 10),
  topAudiences: audiences.slice(0, 10)
};

const reportFiles = await writeConnectorReport(report);

console.log("");
console.log("Signal normalize");
console.log("----------------");
console.log(`Normalized records: ${normalizedRecords.length}`);
console.log("");
console.log("Top categories:");
for (const item of categorySummary.slice(0, 8)) {
  console.log(`- ${item.category}: ${item.count} | avg=${item.avgMarketSignalScore}`);
}
console.log("");
console.log(`Normalized latest: ${normalizedFiles.latest}`);
console.log(`Report: ${reportFiles.latest}`);
