import path from "path";
import fs from "fs-extra";
import { GENERATOR_DIR } from "./config.js";
import { runCommand } from "./process-utils.js";

export async function runGeneratorPack(packFile, { dryRun = false } = {}) {
  const args = ["generate-bulk.js", packFile];
  if (dryRun) args.push("--dry-run");

  const result = await runCommand("node", args, {
    cwd: GENERATOR_DIR,
    echo: true
  });

  const latestReportPath = path.join(GENERATOR_DIR, "reports", "latest-run.json");
  let generatorReport = null;

  if (await fs.pathExists(latestReportPath)) {
    generatorReport = await fs.readJSON(latestReportPath);
  }

  return {
    ...result,
    generatorReport
  };
}
