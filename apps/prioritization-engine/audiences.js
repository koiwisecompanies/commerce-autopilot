import { readLatestState } from "./lib/report-service.js";

const state = await readLatestState();
if (!state) {
  console.log("No prioritization state found.");
  process.exit(0);
}

console.log("Audience priorities");
console.log("-------------------");
for (const item of state.audiencePriorities.slice(0, 20)) {
  console.log(`- ${item.audience} | score=${item.priorityScore} | action=${item.actionClass} | guides=${item.guideCount} | signals=${item.signalCount}`);
}
