import fs from "fs-extra";
import {
  TOPIC_REPORT_PATH,
  GENERATOR_REPORT_PATH,
  CONTROLLER_REPORT_PATH
} from "./config.js";
import { readLatestAutopilotReport } from "./report-service.js";
import { readRunState } from "./state-service.js";
import { getCurrentBranch, getLatestCommitHash, getWorkingTreeStatus } from "./git-service.js";
import { getInventorySummary, evaluateLaunchReadiness } from "./site-inventory.js";
import { getLaunchPolicy } from "./config.js";

async function maybeReadJson(filePath) {
  const exists = await fs.pathExists(filePath);
  if (!exists) return null;
  return fs.readJSON(filePath);
}

export async function getAutopilotStatus() {
  const inventory = await getInventorySummary();

  return {
    git: {
      branch: await getCurrentBranch(),
      commit: await getLatestCommitHash(),
      workingTree: await getWorkingTreeStatus()
    },
    currentState: await readRunState(),
    latestAutopilot: await readLatestAutopilotReport(),
    latestTopicEngine: await maybeReadJson(TOPIC_REPORT_PATH),
    latestGenerator: await maybeReadJson(GENERATOR_REPORT_PATH),
    latestController: await maybeReadJson(CONTROLLER_REPORT_PATH),
    inventory,
    launchReadiness: evaluateLaunchReadiness(inventory, getLaunchPolicy("default"))
  };
}
