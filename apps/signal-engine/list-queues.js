import fs from "fs-extra";
import path from "path";
import { QUEUES_DIR } from "./lib/config.js";

const exists = await fs.pathExists(QUEUES_DIR);

if (!exists) {
  console.log("No queues directory found.");
  process.exit(0);
}

const files = (await fs.readdir(QUEUES_DIR)).filter((file) => file.endsWith(".json")).sort();

if (files.length === 0) {
  console.log("No queue files found.");
  process.exit(0);
}

console.log("");
console.log("Signal queues");
console.log("-------------");

for (const file of files) {
  const fullPath = path.join(QUEUES_DIR, file);
  const data = await fs.readJSON(fullPath);
  const count = Array.isArray(data) ? data.length : 0;
  console.log(`- ${file}: ${count}`);
}
