import { readLatestState } from "./lib/report-service.js";

const state = await readLatestState();
if (!state) {
  console.log("No prioritization state found.");
  process.exit(0);
}

console.log("Family priorities");
console.log("-----------------");
for (const item of state.familyPriorities.slice(0, 20)) {
  console.log(`- ${item.family} | score=${item.priorityScore} | action=${item.actionClass} | guides=${item.currentGuideCount} | signals=${item.signalCount}`);
}
