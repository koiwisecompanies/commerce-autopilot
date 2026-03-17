import { readLatestState } from "./lib/report-service.js";

const state = await readLatestState();
if (!state) {
  console.log("No prioritization state found.");
  process.exit(0);
}

console.log("Category priorities");
console.log("-------------------");
for (const item of state.categoryPriorities.slice(0, 20)) {
  console.log(`- ${item.category} | score=${item.priorityScore} | action=${item.actionClass} | tracked=${item.trackedGuideCount} | signals=${item.signalCount}`);
}
