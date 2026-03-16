import path from "path";

export const AUTOPILOT_ROOT = path.resolve(".");
export const REPO_ROOT = path.resolve("../..");

export const REPORTS_DIR = path.resolve("./reports");
export const STATE_DIR = path.resolve("./state");
export const STATE_FILE = path.join(STATE_DIR, "current-run.json");

export const TOPIC_ENGINE_DIR = path.resolve("../topic-engine");
export const GENERATOR_DIR = path.resolve("../generator");
export const SITE_DIR = path.resolve("../site");

export const TOPIC_REPORT_PATH = path.resolve("../topic-engine/reports/latest-run.json");
export const GENERATOR_REPORT_PATH = path.resolve("../generator/reports/latest-run.json");
export const CONTROLLER_REPORT_PATH = path.resolve("../controller/reports/latest-run.json");
export const AUTOPILOT_REPORT_PATH = path.resolve("./reports/latest-run.json");

export const GENERATED_PACKS_DIR = path.resolve("../topic-engine/generated-packs");
export const GUIDES_FILE = path.resolve("../site/src/data/guides.json");

export const PACK_THRESHOLDS = {
  default: {
    minAcceptedTopics: 3,
    maxAcceptedTopics: 200,
    maxDuplicateRatio: 0.80,
    minCreatedGuidesForPublish: 1
  },
  kitchen: {
    minAcceptedTopics: 3,
    maxAcceptedTopics: 200,
    maxDuplicateRatio: 0.80,
    minCreatedGuidesForPublish: 1
  },
  electronics: {
    minAcceptedTopics: 3,
    maxAcceptedTopics: 250,
    maxDuplicateRatio: 0.80,
    minCreatedGuidesForPublish: 1
  },
  "home-office": {
    minAcceptedTopics: 3,
    maxAcceptedTopics: 200,
    maxDuplicateRatio: 0.80,
    minCreatedGuidesForPublish: 1
  },
  pets: {
    minAcceptedTopics: 3,
    maxAcceptedTopics: 200,
    maxDuplicateRatio: 0.80,
    minCreatedGuidesForPublish: 1
  },
  automotive: {
    minAcceptedTopics: 3,
    maxAcceptedTopics: 200,
    maxDuplicateRatio: 0.80,
    minCreatedGuidesForPublish: 1
  }
};

export const LAUNCH_POLICY = {
  default: {
    minTotalGuides: 12,
    minCategoriesRepresented: 3,
    maxDominantCategoryShare: 0.70
  }
};

export function getThresholds(packName) {
  return PACK_THRESHOLDS[packName] || PACK_THRESHOLDS.default;
}

export function getLaunchPolicy(packName) {
  return LAUNCH_POLICY[packName] || LAUNCH_POLICY.default;
}
