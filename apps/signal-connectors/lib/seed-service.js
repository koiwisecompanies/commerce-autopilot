import fs from "fs-extra";
import path from "path";
import { TOPIC_ENGINE_SEEDS_DIR } from "./config.js";

export async function listSeedPacks() {
  const exists = await fs.pathExists(TOPIC_ENGINE_SEEDS_DIR);
  if (!exists) return [];

  const files = await fs.readdir(TOPIC_ENGINE_SEEDS_DIR);

  return files
    .filter((file) => file.endsWith(".txt"))
    .map((file) => file.replace(/\.txt$/, ""))
    .sort();
}

export async function loadSeeds(packName) {
  const file = path.join(TOPIC_ENGINE_SEEDS_DIR, `${packName}.txt`);
  const exists = await fs.pathExists(file);

  if (!exists) {
    throw new Error(`Seed file not found for pack: ${packName}`);
  }

  const text = await fs.readFile(file, "utf8");

  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}
