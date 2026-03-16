import fs from "fs-extra";
import path from "path";
import { REPORTS_DIR, MANIFESTS_DIR, QUEUES_DIR } from "./config.js";

function stamp(date = new Date()) {
  return date.toISOString().replace(/[:.]/g, "-");
}

export async function ensureSignalDirs() {
  await fs.ensureDir(REPORTS_DIR);
  await fs.ensureDir(MANIFESTS_DIR);
  await fs.ensureDir(QUEUES_DIR);
}

export async function writeLatestAndDated(baseDir, prefix, payload) {
  await fs.ensureDir(baseDir);
  const latest = path.join(baseDir, "latest.json");
  const dated = path.join(baseDir, `${prefix}-${stamp()}.json`);
  await fs.writeJSON(latest, payload, { spaces: 2 });
  await fs.writeJSON(dated, payload, { spaces: 2 });
  return { latest, dated };
}

export async function writeSignalReport(report) {
  return writeLatestAndDated(REPORTS_DIR, "signal-run", report);
}

export async function writeManifest(name, payload) {
  await fs.ensureDir(MANIFESTS_DIR);
  const file = path.join(MANIFESTS_DIR, `${name}.json`);
  await fs.writeJSON(file, payload, { spaces: 2 });
  return file;
}

export async function writeQueue(name, payload) {
  await fs.ensureDir(QUEUES_DIR);
  const file = path.join(QUEUES_DIR, `${name}.json`);
  await fs.writeJSON(file, payload, { spaces: 2 });
  return file;
}
