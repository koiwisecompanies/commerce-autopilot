import { readRunState } from "./lib/state-service.js";
import { runAutopilot } from "./lib/pipeline-runner.js";

const state = await readRunState();

if (!state) {
  console.log("No resumable autopilot state found.");
  process.exit(0);
}

console.log("Resuming autopilot run");
console.log("----------------------");
console.log(`Pack: ${state.packName}`);
console.log(`Mode: ${state.mode}`);
console.log(`Stage: ${state.currentStage}`);

const report = await runAutopilot({
  packName: state.packName,
  mode: state.mode,
  resumeFrom: state.currentStage
});

console.log("");
console.log(`Resumed run success: ${report.ok ? "yes" : "no"}`);
console.log(`Report: ${report.files.latest}`);

if (!report.ok) {
  process.exit(1);
}
