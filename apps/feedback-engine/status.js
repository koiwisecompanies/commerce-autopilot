import fs from "fs";
import path from "path";
import { EVENTS_DIR, STATE_DIR } from "./lib/config.js";

const eventFiles = fs.existsSync(EVENTS_DIR)
  ? fs.readdirSync(EVENTS_DIR).filter((file) => file.endsWith(".jsonl"))
  : [];

const latestState = path.join(STATE_DIR, "latest-summary.json");

console.log("");
console.log("Feedback engine status");
console.log("----------------------");
console.log(`Event files: ${eventFiles.length}`);

if (eventFiles.length > 0) {
  for (const file of eventFiles) {
    console.log(`- ${file}`);
  }
}

if (fs.existsSync(latestState)) {
  const state = JSON.parse(fs.readFileSync(latestState, "utf8"));
  console.log("");
  console.log(`Last summary: ${state.generatedAt}`);
  console.log(`Events: ${state.totals.events}`);
  console.log(`Sessions: ${state.totals.sessions}`);
  console.log(`Guides tracked: ${state.totals.guidesTracked}`);
} else {
  console.log("");
  console.log("No summary has been generated yet.");
}
