import fs from "fs-extra";
import path from "path";
import {
  RAW_DIR,
  NORMALIZED_DIR,
  MERGED_DIR,
  SNAPSHOTS_DIR,
  REPORTS_DIR
} from "./config.js";

function stamp(date = new Date()) {
  return date.toISOString().replace(/[:.]/g, "-");
}

async function writeLatestAndDated(dir, prefix, payload) {
  await fs.ensureDir(dir);
  const latest = path.join(dir, "latest.json");
  const dated = path.join(dir, `${prefix}-${stamp()}.json`);
  await fs.writeJSON(latest, payload, { spaces: 2 });
  await fs.writeJSON(dated, payload, { spaces: 2 });
  return { latest, dated };
}

export async function writeRawSignals(payload) {
  return writeLatestAndDated(RAW_DIR, "raw-signals", payload);
}

export async function writeNormalizedSignals(payload) {
  return writeLatestAndDated(NORMALIZED_DIR, "normalized-signals", payload);
}

export async function writeMergedSignals(payload) {
  return writeLatestAndDated(MERGED_DIR, "merged-signals", payload);
}

export async function writeSnapshot(payload) {
  return writeLatestAndDated(SNAPSHOTS_DIR, "signal-snapshot", payload);
}

export async function writeConnectorReport(payload) {
  return writeLatestAndDated(REPORTS_DIR, "connector-report", payload);
}
