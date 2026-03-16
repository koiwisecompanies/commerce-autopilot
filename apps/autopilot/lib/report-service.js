import fs from "fs-extra";
import path from "path";
import { REPORTS_DIR } from "./config.js";

function timestampForFilename(date = new Date()) {
  return date.toISOString().replace(/[:.]/g, "-");
}

export async function writeAutopilotReport(report) {
  await fs.ensureDir(REPORTS_DIR);

  const latest = path.join(REPORTS_DIR, "latest-run.json");
  const dated = path.join(REPORTS_DIR, `autopilot-run-${timestampForFilename()}.json`);

  await fs.writeJSON(latest, report, { spaces: 2 });
  await fs.writeJSON(dated, report, { spaces: 2 });

  return { latest, dated };
}

export async function readLatestAutopilotReport() {
  const latest = path.join(REPORTS_DIR, "latest-run.json");
  const exists = await fs.pathExists(latest);
  if (!exists) return null;
  return fs.readJSON(latest);
}
