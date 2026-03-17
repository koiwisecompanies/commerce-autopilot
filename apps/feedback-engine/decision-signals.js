import fs from "fs";
import path from "path";
import { SUMMARIES_DIR } from "./lib/config.js";

const file = path.join(SUMMARIES_DIR, "action-signals.json");

if (!fs.existsSync(file)) {
  console.error("No action signals found. Run: pnpm feedback:summarize");
  process.exit(1);
}

const payload = JSON.parse(fs.readFileSync(file, "utf8"));

console.log("");
console.log("Decision signals");
console.log("----------------");
console.log("");

for (const [label, items] of Object.entries(payload.actionSignals)) {
  console.log(`${label}:`);
  if (!items.length) {
    console.log("- none");
    console.log("");
    continue;
  }

  for (const item of items.slice(0, 10)) {
    const name = item.title || item.slug || item.category || item.modifier || item.audience || "item";
    console.log(`- ${name}`);
  }
  console.log("");
}
