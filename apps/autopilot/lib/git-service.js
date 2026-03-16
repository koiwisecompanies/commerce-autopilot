import { REPO_ROOT } from "./config.js";
import { runCommand } from "./process-utils.js";

export async function getCurrentBranch() {
  const result = await runCommand("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
    cwd: REPO_ROOT
  });
  return result.ok ? result.stdout.trim() : null;
}

export async function getLatestCommitHash() {
  const result = await runCommand("git", ["rev-parse", "--short", "HEAD"], {
    cwd: REPO_ROOT
  });
  return result.ok ? result.stdout.trim() : null;
}

export async function getWorkingTreeStatus() {
  const result = await runCommand("git", ["status", "--porcelain"], {
    cwd: REPO_ROOT
  });

  return {
    ok: result.ok,
    changed: result.stdout.trim().length > 0,
    raw: result.stdout
  };
}

export async function commitAndPush(commitMessage) {
  const workingTree = await getWorkingTreeStatus();

  if (!workingTree.changed) {
    return {
      ok: true,
      skipped: true,
      reason: "No working tree changes to publish."
    };
  }

  const addResult = await runCommand("git", ["add", "."], {
    cwd: REPO_ROOT,
    echo: true
  });

  if (!addResult.ok) {
    return {
      ok: false,
      stage: "git-add",
      result: addResult
    };
  }

  const commitResult = await runCommand("git", ["commit", "-m", commitMessage], {
    cwd: REPO_ROOT,
    echo: true
  });

  if (!commitResult.ok) {
    return {
      ok: false,
      stage: "git-commit",
      result: commitResult
    };
  }

  const branch = await getCurrentBranch();
  const commit = await getLatestCommitHash();

  const pushResult = await runCommand("git", ["push", "origin", branch], {
    cwd: REPO_ROOT,
    echo: true
  });

  if (!pushResult.ok) {
    return {
      ok: false,
      stage: "git-push",
      result: pushResult,
      branch,
      commit
    };
  }

  return {
    ok: true,
    skipped: false,
    branch,
    commit,
    message: commitMessage
  };
}
