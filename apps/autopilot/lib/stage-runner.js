import fs from "fs-extra";
import path from "path";
import {
  TOPIC_ENGINE_DIR,
  GENERATOR_DIR,
  TOPIC_REPORT_PATH,
  GENERATOR_REPORT_PATH,
  GENERATED_PACKS_DIR
} from "./config.js";
import { runCommand } from "./process-utils.js";
import { commitAndPush } from "./git-service.js";

async function maybeReadJson(filePath) {
  const exists = await fs.pathExists(filePath);
  if (!exists) return null;
  return fs.readJSON(filePath);
}

export async function runTopicBuild(packName, echo = true) {
  const result = await runCommand("node", ["build-pack.js", packName], {
    cwd: TOPIC_ENGINE_DIR,
    echo
  });

  const report = await maybeReadJson(TOPIC_REPORT_PATH);
  const generatedPackPath = path.join(GENERATED_PACKS_DIR, `${packName}.txt`);

  return {
    ok: result.ok,
    code: result.code,
    stdout: result.stdout,
    stderr: result.stderr,
    report,
    generatedPackPath
  };
}

export async function runGeneratorBulk(packFile, dryRun = false, echo = true) {
  const args = ["generate-bulk.js", packFile];
  if (dryRun) args.push("--dry-run");

  const result = await runCommand("node", args, {
    cwd: GENERATOR_DIR,
    echo
  });

  const report = await maybeReadJson(GENERATOR_REPORT_PATH);

  return {
    ok: result.ok,
    code: result.code,
    stdout: result.stdout,
    stderr: result.stderr,
    report
  };
}

export async function runGitPublish(packName, mode) {
  const message = `Autopilot publish: ${packName} [${mode}] ${new Date().toISOString()}`;
  return commitAndPush(message);
}
