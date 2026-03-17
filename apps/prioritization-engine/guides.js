import { readLatestState } from "./lib/report-service.js";

const state = await readLatestState();
if (!state) {
  console.log("No prioritization state found.");
  process.exit(0);
}

console.log("Guide priorities");
console.log("----------------");
for (const item of state.guidePriorities.slice(0, 20)) {
  console.log(`- ${item.title} | score=${item.priorityScore} | action=${item.actionClass} | category=${item.category}`);
}
