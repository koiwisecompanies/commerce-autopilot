import { readLatestState } from "./lib/report-service.js";

const state = await readLatestState();
if (!state) {
  console.log("No prioritization state found.");
  process.exit(0);
}

const policies = state.actionQueue.policies;

function printSimple(name, items, key) {
  console.log(`${name}:`);
  if (!items.length) {
    console.log("- none");
    console.log("");
    return;
  }
  for (const item of items) {
    console.log(`- ${item[key]} | ${item.priorityScore}`);
  }
  console.log("");
}

console.log("Policy signals");
console.log("--------------");
printSimple("Boost modifiers", policies.boostModifiers, "modifier");
printSimple("Weaken modifiers", policies.weakenModifiers, "modifier");
printSimple("Boost audiences", policies.boostAudiences, "audience");
printSimple("Weaken audiences", policies.weakenAudiences, "audience");
printSimple("Accelerate categories", policies.accelerateCategories, "category");
printSimple("Inspect categories", policies.inspectCategories, "category");
