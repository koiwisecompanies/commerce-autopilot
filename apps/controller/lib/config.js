import path from "path";

export const REPO_ROOT = path.resolve("../..");
export const GENERATOR_DIR = path.resolve("../generator");
export const CONTROLLER_REPORTS_DIR = path.resolve("./reports");
export const DEFAULT_BRANCH = "master";

export const PACKS = {
  sample: path.resolve("../generator/data/sample-topics.txt"),
  "home-office": path.resolve("../generator/data/home-office-topics.txt"),
  kitchen: path.resolve("../generator/data/kitchen-topics.txt"),
  pets: path.resolve("../generator/data/pet-topics.txt")
};

export const COMMIT_PREFIX = "Controller publish";
