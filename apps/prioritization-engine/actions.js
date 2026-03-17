import { readLatestState } from "./lib/report-service.js";

const state = await readLatestState();
if (!state) {
  console.log("No prioritization state found.");
  process.exit(0);
}

console.log("Action queues");
console.log("-------------");

function printGroup(name, items, formatter) {
  console.log(`${name}:`);
  if (!items.length) {
    console.log("- none");
    console.log("");
    return;
  }
  for (const item of items) {
    console.log(`- ${formatter(item)}`);
  }
  console.log("");
}

printGroup("Publish", state.actionQueue.publish.slice(0, 15), (item) => `${item.candidateTopic} | ${item.priorityScore}`);
printGroup("Refresh", state.actionQueue.refresh.slice(0, 15), (item) => `${item.title} | ${item.priorityScore}`);
printGroup("Promote", state.actionQueue.promote.slice(0, 15), (item) => `${item.title} | ${item.priorityScore}`);
printGroup("Inspect", state.actionQueue.inspect.slice(0, 15), (item) => `${item.title || item.category || item.family} | ${item.priorityScore}`);
printGroup("Suppress", state.actionQueue.suppress.slice(0, 15), (item) => `${item.title || item.family} | ${item.priorityScore}`);
printGroup("Replace", state.actionQueue.replace.slice(0, 15), (item) => `${item.title} | ${item.priorityScore}`);
printGroup("Family expansion", state.actionQueue.familyExpansion.slice(0, 15), (item) => `${item.family} | ${item.priorityScore}`);
printGroup("Pack expansion", state.actionQueue.packExpansion.slice(0, 15), (item) => `${item.packName} | ${item.priorityScore}`);
