import { PRIORITY_CONFIG } from "./config.js";
import { avg, clamp, round } from "./fs-utils.js";
import { normalizeLabel, toSlug, toTitle } from "./slug-utils.js";

function meanSignal(records) {
  return avg(records.map((item) => item.mergedMarketSignalScore ?? item.avgMarketSignalScore ?? 0));
}

function meanFreshness(records) {
  return avg(records.map((item) => item.avgFreshnessScore ?? 0));
}

function meanConfidence(records) {
  return avg(records.map((item) => item.avgConfidenceScore ?? 0));
}

function supportScore(records) {
  return clamp(avg(records.map((item) => item.supportingSourceCount ?? 1)) * 25);
}

function inventoryCoverageRatio(currentCount, demandCount) {
  if (demandCount <= 0) return 1;
  return currentCount / demandCount;
}

function actionClassFromScore(score, kind = "general") {
  const t = PRIORITY_CONFIG.thresholds;

  if (kind === "guide") {
    if (score >= t.refreshNow) return "refresh_now";
    if (score >= t.promoteNow) return "promote_now";
    if (score >= t.inspect) return "inspect";
    if (score <= t.replace) return "replace";
    if (score <= t.suppress) return "suppress";
    return "hold";
  }

  if (kind === "opportunity") {
    if (score >= t.expandNow) return "expand_now";
    if (score >= t.promoteNow) return "promote_now";
    if (score >= t.inspect) return "inspect";
    if (score <= t.suppress) return "deprioritize";
    return "hold";
  }

  return score >= t.expandNow ? "expand_now" : score >= t.inspect ? "inspect" : "hold";
}

export function buildGuidePriorities(feedbackGuide, indexes, feedbackModifier, feedbackAudience) {
  const guides = Array.isArray(feedbackGuide?.guides) ? feedbackGuide.guides : [];
  const modifierMap = new Map(
    (feedbackModifier?.modifiers || []).map((item) => [normalizeLabel(item.modifier), item])
  );
  const audienceMap = new Map(
    (feedbackAudience?.audiences || []).map((item) => [normalizeLabel(item.audience), item])
  );

  return guides
    .map((guide) => {
      const familyKey = normalizeLabel(guide.topicFamily || guide.slug || "");
      const categoryKey = toTitle(guide.category || "unknown");
      const familySignals = indexes.byFamily.get(familyKey) || [];
      const categorySignals = indexes.byCategory.get(categoryKey) || [];
      const modifierFeedback = modifierMap.get(normalizeLabel(guide.modifier));
      const audienceFeedback = audienceMap.get(normalizeLabel(guide.audience));

      const health = clamp(guide.healthScore ?? 0);
      const intent = clamp((guide.commercialIntentScore ?? 0) * 1);
      const engagement = clamp((guide.engagementRate ?? 0) * 50);
      const actionRate = clamp((guide.actionRate ?? 0) * 100);
      const familySignal = clamp(meanSignal(familySignals));
      const categorySignal = clamp(meanSignal(categorySignals));
      const modifierLift = clamp((modifierFeedback?.actionRate ?? 0) * 100);
      const audienceLift = clamp((audienceFeedback?.actionRate ?? 0) * 100);

      const w = PRIORITY_CONFIG.guideWeights;
      const priorityScore = clamp(
        health * w.health +
        intent * w.commercialIntent +
        engagement * w.engagement +
        actionRate * w.actionRate +
        familySignal * w.familySignal +
        categorySignal * w.categorySignal +
        modifierLift * w.modifierLift +
        audienceLift * w.audienceLift
      );

      return {
        slug: guide.slug,
        title: guide.title,
        category: guide.category,
        modifier: guide.modifier,
        audience: guide.audience,
        topicFamily: guide.topicFamily,
        views: guide.views,
        healthScore: round(health),
        commercialIntentScore: round(intent),
        engagementScore: round(engagement),
        actionRateScore: round(actionRate),
        familySignalScore: round(familySignal),
        categorySignalScore: round(categorySignal),
        modifierLiftScore: round(modifierLift),
        audienceLiftScore: round(audienceLift),
        priorityScore: round(priorityScore),
        actionClass: actionClassFromScore(priorityScore, "guide")
      };
    })
    .sort((a, b) => b.priorityScore - a.priorityScore);
}

export function buildFamilyPriorities(signals, feedbackGuide) {
  const guideMap = new Map();
  for (const guide of feedbackGuide?.guides || []) {
    const key = normalizeLabel(guide.topicFamily || guide.slug || "");
    if (!guideMap.has(key)) guideMap.set(key, []);
    guideMap.get(key).push(guide);
  }

  const familyGroups = new Map();
  for (const signal of signals) {
    const key = normalizeLabel(signal.family || signal.topicFamily || "");
    if (!key) continue;
    if (!familyGroups.has(key)) familyGroups.set(key, []);
    familyGroups.get(key).push(signal);
  }

  const families = [];
  for (const [family, records] of familyGroups.entries()) {
    const guides = guideMap.get(family) || [];
    const marketSignal = clamp(meanSignal(records));
    const freshness = clamp(meanFreshness(records));
    const support = clamp(supportScore(records));
    const feedback = clamp(avg(guides.map((g) => (g.engagementRate ?? 0) * 50 + (g.actionRate ?? 0) * 50)));
    const coverageGap = clamp((1 - inventoryCoverageRatio(guides.length, Math.max(records.length / 3, 1))) * 100);
    const saturationPenalty = clamp(Math.max(guides.length - 3, 0) * 12);

    const w = PRIORITY_CONFIG.familyWeights;
    const priorityScore = clamp(
      marketSignal * w.marketSignal +
      freshness * w.freshness +
      support * w.support +
      feedback * w.feedback +
      coverageGap * w.coverageGap -
      saturationPenalty * w.saturationPenalty
    );

    families.push({
      family,
      marketSignalScore: round(marketSignal),
      freshnessScore: round(freshness),
      supportScore: round(support),
      feedbackScore: round(feedback),
      coverageGapScore: round(coverageGap),
      saturationPenalty: round(saturationPenalty),
      currentGuideCount: guides.length,
      signalCount: records.length,
      avgConfidenceScore: round(meanConfidence(records)),
      priorityScore: round(priorityScore),
      actionClass: actionClassFromScore(priorityScore, "opportunity")
    });
  }

  return families.sort((a, b) => b.priorityScore - a.priorityScore);
}

export function buildCategoryPriorities(signals, feedbackCategory, guidePriorities) {
  const feedbackMap = new Map(
    (feedbackCategory?.categories || []).map((item) => [toTitle(item.category), item])
  );

  const groups = new Map();
  for (const signal of signals) {
    const category = toTitle(signal.category || "Unknown");
    if (!groups.has(category)) groups.set(category, []);
    groups.get(category).push(signal);
  }

  const dominantShare = Math.max(...(feedbackCategory?.categories || []).map((item) => item.views || 0), 0);
  const priorities = [];

  for (const [category, records] of groups.entries()) {
    const feedback = feedbackMap.get(category);
    const guidesInCategory = guidePriorities.filter((item) => item.category === category);

    const marketSignal = clamp(meanSignal(records));
    const behavior = clamp(((feedback?.actionRate ?? 0) * 50) + ((feedback?.intent ?? 0) * 50));
    const commercialIntent = clamp(avg(guidesInCategory.map((g) => g.commercialIntentScore)));
    const underCoverage = clamp((1 - inventoryCoverageRatio(guidesInCategory.length, Math.max(records.length / 4, 1))) * 100);
    const dominancePenalty = clamp((feedback?.views ?? 0) === dominantShare && dominantShare > 0 ? 18 : 0);
    const freshness = clamp(meanFreshness(records));

    const w = PRIORITY_CONFIG.categoryWeights;
    const priorityScore = clamp(
      marketSignal * w.marketSignal +
      behavior * w.feedback +
      commercialIntent * w.commercialIntent +
      underCoverage * w.underCoverage +
      freshness * w.freshness -
      dominancePenalty * w.dominancePenalty
    );

    priorities.push({
      category,
      marketSignalScore: round(marketSignal),
      behaviorScore: round(behavior),
      commercialIntentScore: round(commercialIntent),
      underCoverageScore: round(underCoverage),
      dominancePenalty: round(dominancePenalty),
      freshnessScore: round(freshness),
      signalCount: records.length,
      trackedGuideCount: guidesInCategory.length,
      priorityScore: round(priorityScore),
      actionClass: actionClassFromScore(priorityScore, "opportunity")
    });
  }

  return priorities.sort((a, b) => b.priorityScore - a.priorityScore);
}

export function buildModifierPriorities(signals, feedbackModifier, guidePriorities) {
  const feedbackMap = new Map(
    (feedbackModifier?.modifiers || []).map((item) => [normalizeLabel(item.modifier), item])
  );

  const groups = new Map();
  for (const signal of signals) {
    for (const modifier of signal.modifiers || []) {
      const key = normalizeLabel(modifier);
      if (!key) continue;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(signal);
    }
  }

  const priorities = [];
  for (const [modifier, records] of groups.entries()) {
    const feedback = feedbackMap.get(modifier);
    const guidesUsingModifier = guidePriorities.filter((item) => normalizeLabel(item.modifier) === modifier);
    const marketSignal = clamp(meanSignal(records));
    const actionRate = clamp((feedback?.actionRate ?? 0) * 100);
    const underUseBonus = clamp((1 - inventoryCoverageRatio(guidesUsingModifier.length, Math.max(records.length / 5, 1))) * 100);
    const overUsePenalty = clamp(Math.max(guidesUsingModifier.length - 5, 0) * 8);
    const freshness = clamp(meanFreshness(records));

    const w = PRIORITY_CONFIG.modifierWeights;
    const priorityScore = clamp(
      marketSignal * w.marketSignal +
      actionRate * w.actionRate +
      underUseBonus * w.underUseBonus +
      freshness * w.freshness -
      overUsePenalty * w.overUsePenalty
    );

    priorities.push({
      modifier,
      marketSignalScore: round(marketSignal),
      actionRateScore: round(actionRate),
      underUseBonus: round(underUseBonus),
      overUsePenalty: round(overUsePenalty),
      freshnessScore: round(freshness),
      signalCount: records.length,
      guideCount: guidesUsingModifier.length,
      priorityScore: round(priorityScore),
      actionClass: actionClassFromScore(priorityScore, "opportunity")
    });
  }

  return priorities.sort((a, b) => b.priorityScore - a.priorityScore);
}

export function buildAudiencePriorities(signals, feedbackAudience, guidePriorities) {
  const feedbackMap = new Map(
    (feedbackAudience?.audiences || []).map((item) => [normalizeLabel(item.audience), item])
  );

  const groups = new Map();
  for (const signal of signals) {
    for (const audience of signal.audiences || []) {
      const key = normalizeLabel(audience);
      if (!key) continue;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(signal);
    }
  }

  const priorities = [];
  for (const [audience, records] of groups.entries()) {
    const feedback = feedbackMap.get(audience);
    const guidesUsingAudience = guidePriorities.filter((item) => normalizeLabel(item.audience) === audience);

    const marketSignal = clamp(meanSignal(records));
    const actionRate = clamp((feedback?.actionRate ?? 0) * 100);
    const engagement = clamp((feedback?.views ?? 0) * 35);
    const underCoverage = clamp((1 - inventoryCoverageRatio(guidesUsingAudience.length, Math.max(records.length / 5, 1))) * 100);
    const freshness = clamp(meanFreshness(records));

    const w = PRIORITY_CONFIG.audienceWeights;
    const priorityScore = clamp(
      marketSignal * w.marketSignal +
      actionRate * w.actionRate +
      engagement * w.engagement +
      underCoverage * w.underCoverage +
      freshness * w.freshness
    );

    priorities.push({
      audience,
      marketSignalScore: round(marketSignal),
      actionRateScore: round(actionRate),
      engagementScore: round(engagement),
      underCoverageScore: round(underCoverage),
      freshnessScore: round(freshness),
      signalCount: records.length,
      guideCount: guidesUsingAudience.length,
      priorityScore: round(priorityScore),
      actionClass: actionClassFromScore(priorityScore, "opportunity")
    });
  }

  return priorities.sort((a, b) => b.priorityScore - a.priorityScore);
}

export function buildPackPriorities(packs, categoryPriorities, familyPriorities, guidePriorities) {
  const categoryMap = new Map(categoryPriorities.map((item) => [normalizeLabel(item.category), item]));
  const familyMap = new Map(familyPriorities.map((item) => [normalizeLabel(item.family), item]));

  const packPriorities = packs.map((pack) => {
    const categoryPriority = categoryMap.get(normalizeLabel(pack.category));
    const relatedFamilies = pack.topics
      .map((topic) => familyMap.get(normalizeLabel(topic.replace(/^best\s+/i, "").replace(/\s+for\s+.+$/i, "").trim())))
      .filter(Boolean);

    const avgFamilyOpportunity = avg(relatedFamilies.map((item) => item.priorityScore));
    const existingGuides = guidePriorities.filter((item) => normalizeLabel(item.category) === normalizeLabel(pack.category));
    const inventoryGap = clamp((1 - inventoryCoverageRatio(existingGuides.length, Math.max(pack.topics.length / 2, 1))) * 100);
    const feedbackReward = clamp(avg(existingGuides.map((item) => item.priorityScore)));
    const dominancePenalty = normalizeLabel(categoryPriority?.actionClass) === "inspect" ? 12 : 0;

    const w = PRIORITY_CONFIG.packWeights;
    const priorityScore = clamp(
      (categoryPriority?.priorityScore ?? 0) * w.categoryPriority +
      avgFamilyOpportunity * w.familyOpportunity +
      inventoryGap * w.inventoryGap +
      feedbackReward * w.feedbackReward -
      dominancePenalty * w.dominancePenalty
    );

    return {
      packName: pack.packName,
      category: pack.category,
      topicCount: pack.topics.length,
      relatedFamilyCount: relatedFamilies.length,
      categoryPriorityScore: round(categoryPriority?.priorityScore ?? 0),
      familyOpportunityScore: round(avgFamilyOpportunity),
      inventoryGapScore: round(inventoryGap),
      feedbackRewardScore: round(feedbackReward),
      dominancePenalty: round(dominancePenalty),
      priorityScore: round(priorityScore),
      actionClass: actionClassFromScore(priorityScore, "opportunity")
    };
  });

  return packPriorities.sort((a, b) => b.priorityScore - a.priorityScore);
}

export function buildPublishCandidates(signals, existingGuideSlugs, familyPriorities, modifierPriorities, audiencePriorities) {
  const familyMap = new Map(familyPriorities.map((item) => [normalizeLabel(item.family), item]));
  const modifierMap = new Map(modifierPriorities.map((item) => [normalizeLabel(item.modifier), item]));
  const audienceMap = new Map(audiencePriorities.map((item) => [normalizeLabel(item.audience), item]));

  return signals
    .filter((signal) => {
      const slug = toSlug(signal.candidateTopic || "");
      return slug && !existingGuideSlugs.has(slug);
    })
    .map((signal) => {
      const familyKey = normalizeLabel(signal.family || signal.topicFamily || "");
      const modifierBoost = avg((signal.modifiers || []).map((item) => modifierMap.get(normalizeLabel(item))?.priorityScore ?? 0));
      const audienceBoost = avg((signal.audiences || []).map((item) => audienceMap.get(normalizeLabel(item))?.priorityScore ?? 0));
      const familyScore = familyMap.get(familyKey)?.priorityScore ?? 0;
      const baseSignal = clamp(signal.mergedMarketSignalScore ?? signal.avgMarketSignalScore ?? 0);
      const freshness = clamp(signal.avgFreshnessScore ?? 0);
      const confidence = clamp(signal.avgConfidenceScore ?? 0);
      const support = clamp((signal.supportingSourceCount ?? 1) * 25);

      const priorityScore = clamp(
        baseSignal * 0.32 +
        freshness * 0.12 +
        confidence * 0.12 +
        support * 0.1 +
        familyScore * 0.18 +
        modifierBoost * 0.08 +
        audienceBoost * 0.08
      );

      return {
        candidateTopic: signal.candidateTopic,
        slug: toSlug(signal.candidateTopic),
        category: signal.category,
        packNames: signal.packNames || [],
        family: signal.family || signal.topicFamily,
        modifiers: signal.modifiers || [],
        audiences: signal.audiences || [],
        signalScore: round(baseSignal),
        freshnessScore: round(freshness),
        confidenceScore: round(confidence),
        familyPriorityScore: round(familyScore),
        modifierBoostScore: round(modifierBoost),
        audienceBoostScore: round(audienceBoost),
        supportingSourceCount: signal.supportingSourceCount ?? 1,
        priorityScore: round(priorityScore),
        actionClass: actionClassFromScore(priorityScore, "opportunity")
      };
    })
    .sort((a, b) => b.priorityScore - a.priorityScore);
}
