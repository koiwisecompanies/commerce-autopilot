import fs from "fs-extra";
import { STATE_DIR, STATE_FILE } from "./config.js";

export async function writeRunState(state) {
  await fs.ensureDir(STATE_DIR);
  await fs.writeJSON(STATE_FILE, state, { spaces: 2 });
  return STATE_FILE;
}

export async function readRunState() {
  const exists = await fs.pathExists(STATE_FILE);
  if (!exists) return null;
  return fs.readJSON(STATE_FILE);
}

export async function clearRunState() {
  const exists = await fs.pathExists(STATE_FILE);
  if (exists) {
    await fs.remove(STATE_FILE);
  }
}
