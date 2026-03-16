import { PACKS } from "./config.js";
import { runGeneratorPack } from "./generator-service.js";
import { getWorkingTreeStatus, commitAndPush } from "./git-service.js";
import { writeControllerReport } from "./report-service.js";

function parseMode(rawArgs = []) {
  if (rawArgs.includes("--dry-run")) return "dry-run";
  if (rawArgs.includes("--publish")) return "publish";
  return "generate-only";
}

export async function runPack(packName, rawArgs = []) {
  const startedAt = new Date().toISOString();
  const mode = parseMode(rawArgs);

  const report = {
    startedAt,
    packName,
    mode,
    packFile: null,
    generator: null,
    workingTreeBefore: null,
    workingTreeAfter: null,
    publish: null,
    ok: false,
    error: null
  };

  try {
    const packFile = PACKS[packName];
    if (!packFile) {
      throw new Error(`Unknown pack: ${packName}`);
    }

    report.packFile = packFile;
    report.workingTreeBefore = await getWorkingTreeStatus();

    const generatorResult = await runGeneratorPack(packFile, {
      dryRun: mode === "dry-run"
    });

    report.generator = {
      ok: generatorResult.ok,
      code: generatorResult.code,
      generatorReport: generatorResult.generatorReport
    };

    if (!generatorResult.ok) {
      throw new Error("Generator run failed.");
    }

    report.workingTreeAfter = await getWorkingTreeStatus();

    if (mode === "publish") {
      const createdCount =
        generatorResult.generatorReport?.totals?.created ?? 0;

      if (createdCount === 0 || !report.workingTreeAfter.changed) {
        report.publish = {
          skipped: true,
          reason: "No new changes to publish."
        };
      } else {
        const publishResult = await commitAndPush({
          packName,
          mode
        });

        report.publish = publishResult;

        if (!publishResult.ok) {
          throw new Error(`Publish failed during ${publishResult.stage}.`);
        }
      }
    } else {
      report.publish = {
        skipped: true,
        reason: mode === "dry-run" ? "Dry run mode." : "Generate-only mode."
      };
    }

    report.ok = true;
  } catch (error) {
    report.ok = false;
    report.error = error.message;
  }

  report.finishedAt = new Date().toISOString();
  report.files = await writeControllerReport(report);

  return report;
}
