import { REPO_ROOT, DEFAULT_BRANCH, COMMIT_PREFIX } from "./config.js";
import { runCommand } from "./process-utils.js";

export async function getWorkingTreeStatus() {
  const result = await runCommand("git", ["status", "--porcelain"], {
    cwd: REPO_ROOT,
    echo: false
  });

  return {
    ok: result.ok,
    changed: result.stdout.trim().length > 0,
    raw: result.stdout
  };
}

export async function getCurrentBranch() {
  const result = await runCommand("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
    cwd: REPO_ROOT,
    echo: false
  });

  return result.stdout.trim() || DEFAULT_BRANCH;
}

export async function getLatestCommitHash() {
  const result = await runCommand("git", ["rev-parse", "--short", "HEAD"], {
    cwd: REPO_ROOT,
    echo: false
  });

  return result.ok ? result.stdout.trim() : null;
}

export async function commitAndPush({ packName, mode }) {
  const addResult = await runCommand("git", ["add", "."], {
    cwd: REPO_ROOT,
    echo: true
  });

  if (!addResult.ok) {
    return { ok: false, stage: "add", result: addResult };
  }

  const branch = await getCurrentBranch();
  const message = `${COMMIT_PREFIX}: ${packName} [${mode}] ${new Date().toISOString()}`;

  const commitResult = await runCommand("git", ["commit", "-m", message], {
    cwd: REPO_ROOT,
    echo: true
  });

  if (!commitResult.ok) {
    return { ok: false, stage: "commit", result: commitResult, branch };
  }

  const hash = await getLatestCommitHash();

  const pushResult = await runCommand("git", ["push", "origin", branch], {
    cwd: REPO_ROOT,
    echo: true
  });

  if (!pushResult.ok) {
    return { ok: false, stage: "push", result: pushResult, branch, hash };
  }

  return {
    ok: true,
    stage: "done",
    branch,
    hash,
    message
  };
}
