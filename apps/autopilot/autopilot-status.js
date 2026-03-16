import { getAutopilotStatus } from "./lib/status-service.js";

const status = await getAutopilotStatus();

console.log("Autopilot status");
console.log("----------------");
console.log(`Branch: ${status.git.branch}`);
console.log(`Latest commit: ${status.git.commit}`);
console.log(`Working tree clean: ${status.git.workingTree.changed ? "no" : "yes"}`);
console.log("");

if (status.currentState) {
  console.log("Current resumable state:");
  console.log(`- Pack: ${status.currentState.packName}`);
  console.log(`- Mode: ${status.currentState.mode}`);
  console.log(`- Stage: ${status.currentState.currentStage}`);
  console.log("");
} else {
  console.log("No active resumable state.");
  console.log("");
}

if (status.latestAutopilot) {
  console.log("Latest autopilot run:");
  console.log(`- Pack: ${status.latestAutopilot.packName}`);
  console.log(`- Mode: ${status.latestAutopilot.mode}`);
  console.log(`- Success: ${status.latestAutopilot.ok ? "yes" : "no"}`);
  console.log("");
}

if (status.latestTopicEngine?.totals) {
  console.log("Latest topic-engine run:");
  console.log(`- Pack: ${status.latestTopicEngine.packName}`);
  console.log(`- Accepted: ${status.latestTopicEngine.totals.accepted}`);
  console.log(`- Generated: ${status.latestTopicEngine.totals.generated}`);
  console.log("");
}

if (status.latestGenerator?.totals) {
  console.log("Latest generator run:");
  console.log(`- Processed: ${status.latestGenerator.totals.processed}`);
  console.log(`- Created: ${status.latestGenerator.totals.created}`);
  console.log("");
}

if (status.latestController) {
  console.log("Latest controller run:");
  console.log(`- Pack: ${status.latestController.packName}`);
  console.log(`- Mode: ${status.latestController.mode}`);
  console.log(`- Success: ${status.latestController.ok ? "yes" : "no"}`);
  console.log("");
}

console.log("Site inventory:");
console.log(`- Total guides: ${status.inventory.totalGuides}`);
console.log(`- Categories represented: ${status.inventory.categoriesRepresented}`);
for (const [category, count] of Object.entries(status.inventory.categoryCounts)) {
  console.log(`- ${category}: ${count}`);
}
console.log("");

console.log("Launch readiness:");
console.log(`- Launch-safe: ${status.launchReadiness.launchSafe ? "yes" : "no"}`);
if (status.launchReadiness.warnings.length > 0) {
  for (const warning of status.launchReadiness.warnings) {
    console.log(`- Warning: ${warning}`);
  }
}
