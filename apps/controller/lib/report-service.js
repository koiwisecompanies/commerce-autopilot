import fs from "fs-extra";
import path from "path";
import { CONTROLLER_REPORTS_DIR } from "./config.js";

function timestampForFilename(date = new Date()) {
  return date.toISOString().replace(/[:.]/g, "-");
}

export async function writeControllerReport(report) {
  await fs.ensureDir(CONTROLLER_REPORTS_DIR);

  const latest = path.join(CONTROLLER_REPORTS_DIR, "latest-run.json");
  const dated = path.join(
    CONTROLLER_REPORTS_DIR,
    `controller-run-${timestampForFilename()}.json`
  );

  await fs.writeJSON(latest, report, { spaces: 2 });
  await fs.writeJSON(dated, report, { spaces: 2 });

  return { latest, dated };
}

export async function readLatestControllerReport() {
  const latest = path.join(CONTROLLER_REPORTS_DIR, "latest-run.json");
  const exists = await fs.pathExists(latest);
  if (!exists) return null;
  return fs.readJSON(latest);
}
