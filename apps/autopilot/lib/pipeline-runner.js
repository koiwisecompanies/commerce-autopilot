import fs from "fs-extra";
import path from "path";
import {
  GENERATED_PACKS_DIR,
  TOPIC_REPORT_PATH,
  GENERATOR_REPORT_PATH,
  getThresholds,
  getLaunchPolicy
} from "./config.js";
import { writeAutopilotReport } from "./report-service.js";
import { writeRunState, clearRunState } from "./state-service.js";
import { getCurrentBranch, getLatestCommitHash, getWorkingTreeStatus } from "./git-service.js";
import { getInventorySummary, projectInventory, evaluateLaunchReadiness } from "./site-inventory.js";
import { runTopicBuild, runGeneratorBulk, runGitPublish } from "./stage-runner.js";

async function maybeReadJson(filePath) {
  const exists = await fs.pathExists(filePath);
  if (!exists) return null;
  return fs.readJSON(filePath);
}

function baseStage(name) {
  return {
    name,
    startedAt: null,
    finishedAt: null,
    ok: false,
    skipped: false,
    reason: null
  };
}

function stageStart(stage) {
  stage.startedAt = new Date().toISOString();
}

function stageEnd(stage, ok = true) {
  stage.finishedAt = new Date().toISOString();
  stage.ok = ok;
}

function skipStage(stage, reason) {
  stage.finishedAt = new Date().toISOString();
  stage.ok = true;
  stage.skipped = true;
  stage.reason = reason;
}

function failStage(stage, reason) {
  stage.finishedAt = new Date().toISOString();
  stage.ok = false;
  stage.reason = reason;
}

function duplicateRatio(topicTotals) {
  if (!topicTotals || !topicTotals.generated) return 0;
  return topicTotals.duplicates / topicTotals.generated;
}

function extractTopicTotals(report) {
  return report?.totals || {
    generated: 0,
    accepted: 0,
    duplicates: 0,
    lowScore: 0
  };
}

function extractGeneratorTotals(report) {
  return report?.totals || {
    received: 0,
    processed: 0,
    created: 0,
    skippedDuplicates: 0,
    failedValidation: 0
  };
}

async function hydrateFromExistingReports(report, packName, resumeFrom) {
  if (resumeFrom === "guideGeneration" || resumeFrom === "publish") {
    const topicReport = await maybeReadJson(TOPIC_REPORT_PATH);
    if (topicReport) {
      report.outputs.topicTotals = extractTopicTotals(topicReport);
      report.outputs.generatedPackPath =
        topicReport.outputFile || path.join(GENERATED_PACKS_DIR, `${packName}.txt`);
      skipStage(report.stages.topicBuild, "Resumed after previous topic build.");
    }
  }

  if (resumeFrom === "publish") {
    const generatorReport = await maybeReadJson(GENERATOR_REPORT_PATH);
    if (generatorReport) {
      report.outputs.generatorTotals = extractGeneratorTotals(generatorReport);
      skipStage(report.stages.guideGeneration, "Resumed after previous guide generation.");
    }
  }
}

export async function runAutopilot({ packName, mode = "publish", resumeFrom = null }) {
  const thresholds = getThresholds(packName);
  const launchPolicy = getLaunchPolicy(packName);
  const inventoryBefore = await getInventorySummary();

  const report = {
    startedAt: new Date().toISOString(),
    packName,
    mode,
    ok: false,
    thresholds,
    launchPolicy,
    stages: {
      topicBuild: baseStage("topicBuild"),
      guideGeneration: baseStage("guideGeneration"),
      publish: baseStage("publish")
    },
    git: {
      before: {
        branch: await getCurrentBranch(),
        commit: await getLatestCommitHash(),
        workingTree: await getWorkingTreeStatus()
      },
      after: null
    },
    inventory: {
      before: inventoryBefore,
      after: null,
      launchReadiness: null
    },
    outputs: {
      generatedPackPath: null,
      topicTotals: null,
      generatorTotals: null,
      publishSummary: null
    },
    error: null
  };

  await writeRunState({
    startedAt: report.startedAt,
    packName,
    mode,
    currentStage: resumeFrom || "topicBuild"
  });

  try {
    if (resumeFrom) {
      await hydrateFromExistingReports(report, packName, resumeFrom);
    }

    if (!resumeFrom || resumeFrom === "topicBuild") {
      const stage = report.stages.topicBuild;
      stageStart(stage);

      const topicResult = await runTopicBuild(packName, true);
      report.outputs.generatedPackPath = topicResult.generatedPackPath;
      report.outputs.topicTotals = extractTopicTotals(topicResult.report);

      if (!topicResult.ok) {
        failStage(stage, "Topic build failed.");
        throw new Error("Topic build failed.");
      }

      const accepted = report.outputs.topicTotals.accepted;
      const dupRatio = duplicateRatio(report.outputs.topicTotals);

      if (accepted < thresholds.minAcceptedTopics) {
        failStage(stage, `Accepted topic count too low: ${accepted}`);
        throw new Error(`Accepted topic count too low: ${accepted}`);
      }

      if (accepted > thresholds.maxAcceptedTopics) {
        failStage(stage, `Accepted topic count too high: ${accepted}`);
        throw new Error(`Accepted topic count too high: ${accepted}`);
      }

      if (dupRatio > thresholds.maxDuplicateRatio) {
        failStage(stage, `Duplicate ratio too high: ${dupRatio.toFixed(2)}`);
        throw new Error(`Duplicate ratio too high: ${dupRatio.toFixed(2)}`);
      }

      stageEnd(stage, true);

      await writeRunState({
        startedAt: report.startedAt,
        packName,
        mode,
        currentStage: "guideGeneration",
        generatedPackPath: report.outputs.generatedPackPath
      });
    }

    if (!resumeFrom || resumeFrom === "guideGeneration") {
      const stage = report.stages.guideGeneration;
      stageStart(stage);

      const packFile =
        report.outputs.generatedPackPath || path.join(GENERATED_PACKS_DIR, `${packName}.txt`);
      const dryRun = mode === "preview";

      const generatorResult = await runGeneratorBulk(packFile, dryRun, true);
      report.outputs.generatorTotals = extractGeneratorTotals(generatorResult.report);

      if (!generatorResult.ok) {
        failStage(stage, "Guide generation failed.");
        throw new Error("Guide generation failed.");
      }

      stageEnd(stage, true);

      await writeRunState({
        startedAt: report.startedAt,
        packName,
        mode,
        currentStage: "publish",
        generatedPackPath: packFile
      });
    }

    const createdGuides = report.outputs.generatorTotals?.created || 0;

    if (mode === "preview") {
      skipStage(report.stages.publish, "Preview mode does not publish.");
      report.inventory.after = projectInventory(inventoryBefore, packName, createdGuides);
    } else {
      report.inventory.after = await getInventorySummary();

      if (mode === "generate") {
        skipStage(report.stages.publish, "Generate mode does not publish.");
      } else if (createdGuides < thresholds.minCreatedGuidesForPublish) {
        skipStage(
          report.stages.publish,
          `Created guide count too low for publish: ${createdGuides}`
        );
      } else {
        report.inventory.launchReadiness = evaluateLaunchReadiness(
          report.inventory.after,
          launchPolicy
        );

        if (mode === "launch" && !report.inventory.launchReadiness.launchSafe) {
          failStage(
            report.stages.publish,
            `Launch safeguards failed: ${report.inventory.launchReadiness.warnings.join(" | ")}`
          );
          throw new Error("Launch safeguards failed.");
        }

        const workingTree = await getWorkingTreeStatus();
        if (!workingTree.changed) {
          skipStage(report.stages.publish, "No working tree changes to publish.");
        } else {
          stageStart(report.stages.publish);

          const publishResult = await runGitPublish(packName, mode);
          report.outputs.publishSummary = publishResult;

          if (!publishResult.ok) {
            failStage(report.stages.publish, `Publish failed at ${publishResult.stage}`);
            throw new Error(`Publish failed at ${publishResult.stage}`);
          }

          if (publishResult.skipped) {
            skipStage(report.stages.publish, publishResult.reason);
          } else {
            stageEnd(report.stages.publish, true);
          }
        }
      }
    }

    if (!report.inventory.launchReadiness) {
      report.inventory.launchReadiness = evaluateLaunchReadiness(
        report.inventory.after,
        launchPolicy
      );
    }

    report.git.after = {
      branch: await getCurrentBranch(),
      commit: await getLatestCommitHash(),
      workingTree: await getWorkingTreeStatus()
    };

    report.ok = true;
  } catch (error) {
    report.ok = false;
    report.error = error.message;

    if (!report.inventory.after) {
      report.inventory.after = await getInventorySummary();
      report.inventory.launchReadiness = evaluateLaunchReadiness(
        report.inventory.after,
        launchPolicy
      );
    }
  }

  report.finishedAt = new Date().toISOString();
  report.files = await writeAutopilotReport(report);

  if (report.ok) {
    await clearRunState();
  }

  return report;
}
