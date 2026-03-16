import { detectModifier } from "./modifier-rules.js";
import { detectAudience } from "./audience-rules.js";
import { scoreDemand } from "./demand-rules.js";
import { scoreIntent } from "./intent-rules.js";
import { scoreDuplicateRisk, scoreCategorySaturation } from "./saturation-rules.js";
import { scoreCategoryOpportunity } from "./category-opportunity.js";
import { computeBalanceBonus } from "./portfolio-balance.js";
import { classifyTopic } from "./classify-topic.js";

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

export function scoreTopic(topic, packName, inventory) {
  const modifier = detectModifier(topic);
  const audience = detectAudience(topic);

  const demandScore = scoreDemand(topic);
  const intentScore = scoreIntent(topic);
  const categoryOpportunity = scoreCategoryOpportunity(packName, inventory);
  const duplicateRisk = scoreDuplicateRisk(topic, inventory);
  const saturationPenalty = scoreCategorySaturation(packName, inventory);
  const categoryBalanceBonus = computeBalanceBonus(packName, inventory);
  const modifierBonus = modifier.weight;
  const audienceBonus = audience.weight;

  const finalScore = clamp(
    0.24 * demandScore +
      0.22 * intentScore +
      0.18 * categoryOpportunity +
      0.10 * modifierBonus +
      0.08 * audienceBonus +
      categoryBalanceBonus -
      0.12 * duplicateRisk -
      0.08 * saturationPenalty
  );

  const decision = classifyTopic(finalScore, duplicateRisk, saturationPenalty, categoryBalanceBonus);

  return {
    topic,
    packName,
    category: packName,
    modifier: modifier.modifier,
    audience: audience.key,
    scores: {
      demandScore,
      intentScore,
      categoryOpportunity,
      modifierBonus,
      audienceBonus,
      categoryBalanceBonus,
      duplicateRisk,
      saturationPenalty,
      finalScore
    },
    decision
  };
}
