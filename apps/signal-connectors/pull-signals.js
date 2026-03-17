import { listSeedPacks, loadSeeds } from "./lib/seed-service.js";
import { getConnectorFunctions } from "./lib/connector-registry.js";
import { writeRawSignals, writeConnectorReport } from "./lib/report-service.js";

const requestedPack = process.argv[2] || null;
const connectorFns = getConnectorFunctions();

const packs = requestedPack ? [requestedPack] : await listSeedPacks();

if (packs.length === 0) {
  console.log("No seed packs found.");
  process.exit(0);
}

const rawSignals = [];
const connectorErrors = [];
const sourceCounts = {};

for (const packName of packs) {
  const seeds = await loadSeeds(packName);

  for (const seed of seeds) {
    for (const [sourceName, fn] of Object.entries(connectorFns)) {
      try {
        const results = await fn(packName, seed);
        rawSignals.push(...results);
        sourceCounts[sourceName] = (sourceCounts[sourceName] || 0) + results.length;
      } catch (error) {
        connectorErrors.push({
          packName,
          seed,
          source: sourceName,
          error: error.message
        });
      }
    }
  }
}

const rawPayload = {
  pulledAt: new Date().toISOString(),
  packs,
  rawSignalCount: rawSignals.length,
  sourceCounts,
  connectorErrors,
  records: rawSignals
};

const rawFiles = await writeRawSignals(rawPayload);

const report = {
  type: "pull",
  pulledAt: rawPayload.pulledAt,
  packs,
  rawSignalCount: rawSignals.length,
  sourceCounts,
  connectorErrorsCount: connectorErrors.length,
  connectorErrors
};

const reportFiles = await writeConnectorReport(report);

console.log("");
console.log("Signal pull");
console.log("-----------");
console.log(`Packs: ${packs.join(", ")}`);
console.log(`Raw signals: ${rawSignals.length}`);
console.log(`Connector errors: ${connectorErrors.length}`);
console.log("");

for (const [source, count] of Object.entries(sourceCounts)) {
  console.log(`- ${source}: ${count}`);
}
console.log("");
console.log(`Raw latest: ${rawFiles.latest}`);
console.log(`Report: ${reportFiles.latest}`);
