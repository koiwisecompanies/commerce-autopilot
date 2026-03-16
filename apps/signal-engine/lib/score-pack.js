import { PACK_SCORE_WEIGHTS } from "./config.js";
import { estimateBalanceGain } from "./portfolio-balance.js";

function avg(values) {
  if (!values.length) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

export function scorePack(packName, scoredTopics, inventory) {
  const total = scoredTopics.length;
  const publishNow = scoredTopics.filter((item) => item.decision.action === "publish-now");
  const hold = scoredTopics.filter((item) => item.decision.action === "hold-for-later");
  const avoid = scoredTopics.filter((item) => item.decision.action.startsWith("reject"));
  const avgTopicScore = avg(scoredTopics.map((item) => item.scores.finalScore));
  const avgDuplicatePenalty = avg(scoredTopics.map((item) => item.scores.duplicateRisk));
  const avgSaturationPenalty = avg(scoredTopics.map((item) => item.scores.saturationPenalty));
  const balanceGain = estimateBalanceGain(packName, inventory, publishNow.length);

  const publishNowRatio = total ? publishNow.length / total : 0;

  const finalPackScore =
    PACK_SCORE_WEIGHTS.avgTopicScore * avgTopicScore +
    PACK_SCORE_WEIGHTS.publishNowRatio * (publishNowRatio * 100) +
    PACK_SCORE_WEIGHTS.balanceGain * (balanceGain * 5) -
    PACK_SCORE_WEIGHTS.saturationPenalty * avgSaturationPenalty -
    PACK_SCORE_WEIGHTS.duplicatePenalty * avgDuplicatePenalty;

  return {
    packName,
    totals: {
      total,
      publishNow: publishNow.length,
      holdForLater: hold.length,
      avoid: avoid.length
    },
    metrics: {
      avgTopicScore: Number(avgTopicScore.toFixed(2)),
      avgDuplicatePenalty: Number(avgDuplicatePenalty.toFixed(2)),
      avgSaturationPenalty: Number(avgSaturationPenalty.toFixed(2)),
      publishNowRatio: Number(publishNowRatio.toFixed(3)),
      estimatedBalanceGain: balanceGain,
      finalPackScore: Number(finalPackScore.toFixed(2))
    }
  };
}
