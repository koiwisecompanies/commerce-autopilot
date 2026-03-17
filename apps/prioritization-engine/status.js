import { readLatestState } from "./lib/report-service.js";

const state = await readLatestState();

if (!state) {
  console.log("No prioritization state found.");
  process.exit(0);
}

console.log("Prioritization status");
console.log("---------------------");
console.log(`Generated at: ${state.generatedAt}`);
console.log(`Guide priorities: ${state.guidePriorities.length}`);
console.log(`Family priorities: ${state.familyPriorities.length}`);
console.log(`Category priorities: ${state.categoryPriorities.length}`);
console.log(`Modifier priorities: ${state.modifierPriorities.length}`);
console.log(`Audience priorities: ${state.audiencePriorities.length}`);
console.log(`Pack priorities: ${state.packPriorities.length}`);
console.log("");
console.log(`Publish queue: ${state.actionQueue.publish.length}`);
console.log(`Refresh queue: ${state.actionQueue.refresh.length}`);
console.log(`Promote queue: ${state.actionQueue.promote.length}`);
console.log(`Inspect queue: ${state.actionQueue.inspect.length}`);
console.log(`Suppress queue: ${state.actionQueue.suppress.length}`);
console.log(`Replace queue: ${state.actionQueue.replace.length}`);
