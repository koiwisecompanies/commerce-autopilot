import fs from "fs-extra";
import path from "path";
import { GENERATED_PACKS_DIR } from "./config.js";

export async function writeGeneratedPack(packName, acceptedTopics) {
  await fs.ensureDir(GENERATED_PACKS_DIR);

  const filePath = path.join(GENERATED_PACKS_DIR, `${packName}.txt`);
  const body = acceptedTopics.map((item) => item.topic).join("\n") + "\n";

  await fs.writeFile(filePath, body, "utf8");

  return filePath;
}
