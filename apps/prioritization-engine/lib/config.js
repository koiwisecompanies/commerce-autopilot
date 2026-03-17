export const PRIORITY_CONFIG = {
  guideWeights: {
    health: 0.18,
    commercialIntent: 0.18,
    engagement: 0.16,
    actionRate: 0.14,
    familySignal: 0.12,
    categorySignal: 0.1,
    modifierLift: 0.06,
    audienceLift: 0.06
  },
  familyWeights: {
    marketSignal: 0.28,
    freshness: 0.12,
    support: 0.1,
    feedback: 0.18,
    coverageGap: 0.2,
    saturationPenalty: 0.12
  },
  categoryWeights: {
    marketSignal: 0.24,
    feedback: 0.2,
    commercialIntent: 0.16,
    underCoverage: 0.16,
    dominancePenalty: 0.12,
    freshness: 0.12
  },
  modifierWeights: {
    marketSignal: 0.28,
    actionRate: 0.24,
    underUseBonus: 0.24,
    overUsePenalty: 0.12,
    freshness: 0.12
  },
  audienceWeights: {
    marketSignal: 0.24,
    actionRate: 0.28,
    engagement: 0.2,
    underCoverage: 0.16,
    freshness: 0.12
  },
  packWeights: {
    categoryPriority: 0.3,
    familyOpportunity: 0.2,
    inventoryGap: 0.18,
    feedbackReward: 0.18,
    dominancePenalty: 0.14
  },
  thresholds: {
    expandNow: 72,
    refreshNow: 68,
    promoteNow: 66,
    inspect: 45,
    suppress: 30,
    replace: 26
  },
  queueLimits: {
    publish: 25,
    refresh: 20,
    promote: 15,
    inspect: 15,
    suppress: 15,
    replace: 10
  },
  launchPolicy: {
    dominantCategoryShare: 0.58
  }
};
