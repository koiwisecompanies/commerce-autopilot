import { loadFeedbackData, loadSignalData, loadTopicPacks, buildSignalIndexes, existingGuideSlugSet } from "./lib/loaders.js";
import { buildActionQueue } from "./lib/action-engine.js";
import {
  buildAudiencePriorities,
  buildCategoryPriorities,
  buildFamilyPriorities,
  buildGuidePriorities,
  buildModifierPriorities,
  buildPackPriorities,
  buildPublishCandidates
} from "./lib/scorers.js";
import { writePrioritizationOutputs } from "./lib/report-service.js";
import { PRIORITY_CONFIG } from "./lib/config.js";

const signals = await loadSignalData();
const feedback = await loadFeedbackData();
const packs = await loadTopicPacks();

const indexes = buildSignalIndexes(signals);
const guidePriorities = buildGuidePriorities(feedback.guide, indexes, feedback.modifier, feedback.audience);
const familyPriorities = buildFamilyPriorities(signals, feedback.guide);
const categoryPriorities = buildCategoryPriorities(signals, feedback.category, guidePriorities);
const modifierPriorities = buildModifierPriorities(signals, feedback.modifier, guidePriorities);
const audiencePriorities = buildAudiencePriorities(signals, feedback.audience, guidePriorities);
const packPriorities = buildPackPriorities(packs, categoryPriorities, familyPriorities, guidePriorities);

const existingSlugs = existingGuideSlugSet(feedback.guide);
const publishCandidates = buildPublishCandidates(
  signals,
  existingSlugs,
  familyPriorities,
  modifierPriorities,
  audiencePriorities
);

const actionQueue = buildActionQueue({
  guidePriorities,
  publishCandidates,
  familyPriorities,
  categoryPriorities,
  modifierPriorities,
  audiencePriorities,
  packPriorities
});

const dominantCategory = categoryPriorities[0] || null;
const report = {
  generatedAt: new Date().toISOString(),
  inputs: {
    mergedSignals: signals.length,
    feedbackGuides: feedback.guide?.guides?.length || 0,
    feedbackCategories: feedback.category?.categories?.length || 0,
    feedbackModifiers: feedback.modifier?.modifiers?.length || 0,
    feedbackAudiences: feedback.audience?.audiences?.length || 0,
    topicPacks: packs.length
  },
  summary: {
    topGuide: guidePriorities[0] || null,
    topFamily: familyPriorities[0] || null,
    topCategory: dominantCategory,
    topModifier: modifierPriorities[0] || null,
    topAudience: audiencePriorities[0] || null,
    topPack: packPriorities[0] || null,
    publishQueueSize: actionQueue.publish.length,
    refreshQueueSize: actionQueue.refresh.length,
    promoteQueueSize: actionQueue.promote.length,
    inspectQueueSize: actionQueue.inspect.length
  },
  thresholds: PRIORITY_CONFIG.thresholds,
  queues: actionQueue
};

const payload = {
  generatedAt: report.generatedAt,
  guidePriorities,
  familyPriorities,
  categoryPriorities,
  modifierPriorities,
  audiencePriorities,
  packPriorities,
  publishCandidates,
  actionQueue,
  report
};

const files = await writePrioritizationOutputs(payload);

console.log("Prioritization build");
console.log("--------------------");
console.log(`Signals loaded: ${signals.length}`);
console.log(`Tracked guides: ${feedback.guide?.guides?.length || 0}`);
console.log(`Topic packs: ${packs.length}`);
console.log("");
console.log("Top action queues:");
console.log(`- Publish: ${actionQueue.publish.length}`);
console.log(`- Refresh: ${actionQueue.refresh.length}`);
console.log(`- Promote: ${actionQueue.promote.length}`);
console.log(`- Inspect: ${actionQueue.inspect.length}`);
console.log(`- Suppress: ${actionQueue.suppress.length}`);
console.log(`- Replace: ${actionQueue.replace.length}`);
console.log("");
if (guidePriorities[0]) {
  console.log(`Top guide: ${guidePriorities[0].title} | ${guidePriorities[0].priorityScore} | ${guidePriorities[0].actionClass}`);
}
if (familyPriorities[0]) {
  console.log(`Top family: ${familyPriorities[0].family} | ${familyPriorities[0].priorityScore} | ${familyPriorities[0].actionClass}`);
}
if (categoryPriorities[0]) {
  console.log(`Top category: ${categoryPriorities[0].category} | ${categoryPriorities[0].priorityScore} | ${categoryPriorities[0].actionClass}`);
}
if (packPriorities[0]) {
  console.log(`Top pack: ${packPriorities[0].packName} | ${packPriorities[0].priorityScore} | ${packPriorities[0].actionClass}`);
}
console.log("");
console.log(`State: ${files.latestState}`);
console.log(`Report: ${files.latestReport}`);
