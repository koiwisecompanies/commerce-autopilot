import path from "path";

export const TOPIC_ENGINE_ROOT = path.resolve(".");
export const SEEDS_DIR = path.resolve("./seeds");
export const GENERATED_PACKS_DIR = path.resolve("./generated-packs");
export const REPORTS_DIR = path.resolve("./reports");
export const GUIDES_FILE = path.resolve("../site/src/data/guides.json");

export const PACKS = {
  kitchen: path.resolve("./seeds/kitchen.txt"),
  electronics: path.resolve("./seeds/electronics.txt"),
  "home-office": path.resolve("./seeds/home-office.txt"),
  pets: path.resolve("./seeds/pets.txt"),
  automotive: path.resolve("./seeds/automotive.txt")
};
