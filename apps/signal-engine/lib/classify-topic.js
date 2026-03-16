import { TOPIC_ACTION_THRESHOLDS } from "./config.js";

export function classifyTopic(finalScore, duplicateRisk, saturationPenalty, categoryBalanceBonus) {
  if (duplicateRisk >= 90) {
    return {
      action: "reject-duplicate-risk",
      reason: "Too close to an existing guide."
    };
  }

  if (saturationPenalty >= 65 && categoryBalanceBonus < 0) {
    return {
      action: "delay-category",
      reason: "Category is already too dominant."
    };
  }

  if (finalScore >= TOPIC_ACTION_THRESHOLDS.publishNow) {
    return {
      action: "publish-now",
      reason: "Strong topic with commercial and portfolio value."
    };
  }

  if (finalScore >= TOPIC_ACTION_THRESHOLDS.holdForLater) {
    return {
      action: "hold-for-later",
      reason: "Useful topic but not urgent."
    };
  }

  if (finalScore >= TOPIC_ACTION_THRESHOLDS.delayCategory) {
    return {
      action: "research-queue",
      reason: "Moderate opportunity, better saved for later."
    };
  }

  return {
    action: "reject-low-value",
    reason: "Low strategic value compared to stronger candidates."
  };
}
