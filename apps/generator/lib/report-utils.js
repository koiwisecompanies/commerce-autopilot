import fs from "fs-extra";
import path from "path";

const reportsDir = path.resolve("./reports");
const latestReportFile = path.join(reportsDir, "latest-run.json");

function timestampForFilename(date = new Date()) {
  return date.toISOString().replace(/[:.]/g, "-");
}

export async function writeRunReport(report) {
  await fs.ensureDir(reportsDir);

  const datedFile = path.join(reportsDir, `run-${timestampForFilename()}.json`);

  await fs.writeJSON(latestReportFile, report, { spaces: 2 });
  await fs.writeJSON(datedFile, report, { spaces: 2 });

  return {
    latestReportFile,
    datedFile
  };
}

export async function readLatestReport() {
  const exists = await fs.pathExists(latestReportFile);
  if (!exists) return null;
  return fs.readJSON(latestReportFile);
}
