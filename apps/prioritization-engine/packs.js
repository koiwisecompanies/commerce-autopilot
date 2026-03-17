import { readLatestState } from "./lib/report-service.js";

const state = await readLatestState();
if (!state) {
  console.log("No prioritization state found.");
  process.exit(0);
}

console.log("Pack priorities");
console.log("---------------");
for (const item of state.packPriorities.slice(0, 20)) {
  console.log(`- ${item.packName} | score=${item.priorityScore} | action=${item.actionClass} | topics=${item.topicCount}`);
}
