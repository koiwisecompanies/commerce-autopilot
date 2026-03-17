import fs from "fs-extra";
import path from "node:path";
import { PATHS } from "./paths.js";

export async function writePrioritizationOutputs(payload) {
  await fs.ensureDir(PATHS.stateDir);
  await fs.ensureDir(PATHS.reportsDir);

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

  await fs.writeJSON(PATHS.guideState, payload.guidePriorities, { spaces: 2 });
  await fs.writeJSON(PATHS.familyState, payload.familyPriorities, { spaces: 2 });
  await fs.writeJSON(PATHS.categoryState, payload.categoryPriorities, { spaces: 2 });
  await fs.writeJSON(PATHS.modifierState, payload.modifierPriorities, { spaces: 2 });
  await fs.writeJSON(PATHS.audienceState, payload.audiencePriorities, { spaces: 2 });
  await fs.writeJSON(PATHS.packState, payload.packPriorities, { spaces: 2 });
  await fs.writeJSON(PATHS.actionState, payload.actionQueue, { spaces: 2 });
  await fs.writeJSON(PATHS.policyState, payload.actionQueue.policies, { spaces: 2 });
  await fs.writeJSON(PATHS.latestState, payload, { spaces: 2 });

  const datedReport = path.join(PATHS.reportsDir, `priorities-${timestamp}.json`);
  await fs.writeJSON(PATHS.latestReport, payload.report, { spaces: 2 });
  await fs.writeJSON(datedReport, payload.report, { spaces: 2 });

  return {
    latestState: PATHS.latestState,
    latestReport: PATHS.latestReport,
    datedReport
  };
}

export async function readLatestState() {
  const exists = await fs.pathExists(PATHS.latestState);
  if (!exists) return null;
  return fs.readJSON(PATHS.latestState);
}

export async function readLatestReport() {
  const exists = await fs.pathExists(PATHS.latestReport);
  if (!exists) return null;
  return fs.readJSON(PATHS.latestReport);
}
