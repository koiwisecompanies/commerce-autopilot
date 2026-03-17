import fs from "fs";
import path from "path";
import { SUMMARIES_DIR, REPORTS_DIR, STATE_DIR } from "./config.js";

function stamp(date = new Date()) {
  return date.toISOString().replace(/[:.]/g, "-");
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

export function writeSummaryFiles(baseName, payload) {
  ensureDir(SUMMARIES_DIR);
  const latest = path.join(SUMMARIES_DIR, `${baseName}.json`);
  const dated = path.join(SUMMARIES_DIR, `${baseName}-${stamp()}.json`);
  fs.writeFileSync(latest, JSON.stringify(payload, null, 2) + "\n");
  fs.writeFileSync(dated, JSON.stringify(payload, null, 2) + "\n");
  return { latest, dated };
}

export function writeReport(payload) {
  ensureDir(REPORTS_DIR);
  const latest = path.join(REPORTS_DIR, "latest.json");
  const dated = path.join(REPORTS_DIR, `feedback-report-${stamp()}.json`);
  fs.writeFileSync(latest, JSON.stringify(payload, null, 2) + "\n");
  fs.writeFileSync(dated, JSON.stringify(payload, null, 2) + "\n");
  return { latest, dated };
}

export function writeState(payload) {
  ensureDir(STATE_DIR);
  const latest = path.join(STATE_DIR, "latest-summary.json");
  fs.writeFileSync(latest, JSON.stringify(payload, null, 2) + "\n");
  return latest;
}
