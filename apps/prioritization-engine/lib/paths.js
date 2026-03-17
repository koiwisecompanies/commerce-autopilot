import path from "node:path";

const APP_ROOT = process.cwd();
const REPO_ROOT = path.resolve(APP_ROOT, "../..");

export const PATHS = {
  repoRoot: REPO_ROOT,
  appRoot: APP_ROOT,

  signalMerged: path.join(REPO_ROOT, "apps/signal-connectors/data/merged/latest.json"),
  signalReport: path.join(REPO_ROOT, "apps/signal-connectors/reports/latest.json"),

  feedbackGuide: path.join(REPO_ROOT, "apps/feedback-engine/summaries/guide-feedback.json"),
  feedbackCategory: path.join(REPO_ROOT, "apps/feedback-engine/summaries/category-feedback.json"),
  feedbackModifier: path.join(REPO_ROOT, "apps/feedback-engine/summaries/modifier-feedback.json"),
  feedbackAudience: path.join(REPO_ROOT, "apps/feedback-engine/summaries/audience-feedback.json"),
  feedbackActions: path.join(REPO_ROOT, "apps/feedback-engine/summaries/action-signals.json"),
  feedbackReport: path.join(REPO_ROOT, "apps/feedback-engine/reports/latest.json"),

  topicPacksDir: path.join(REPO_ROOT, "apps/topic-engine/generated-packs"),

  stateDir: path.join(APP_ROOT, "state"),
  reportsDir: path.join(APP_ROOT, "reports"),

  guideState: path.join(APP_ROOT, "state/guide-priorities.json"),
  familyState: path.join(APP_ROOT, "state/family-priorities.json"),
  categoryState: path.join(APP_ROOT, "state/category-priorities.json"),
  modifierState: path.join(APP_ROOT, "state/modifier-priorities.json"),
  audienceState: path.join(APP_ROOT, "state/audience-priorities.json"),
  packState: path.join(APP_ROOT, "state/pack-priorities.json"),
  actionState: path.join(APP_ROOT, "state/action-queue.json"),
  policyState: path.join(APP_ROOT, "state/policy-signals.json"),
  latestState: path.join(APP_ROOT, "state/latest-priorities.json"),
  latestReport: path.join(APP_ROOT, "reports/latest.json")
};
