export function scoreGuide(metrics) {
  const views = metrics.views || 0;
  const sessions = metrics.sessions || 1;

  const engagementRate = safeRate(
    metrics.deepEngagementSessions + metrics.readCompleteSessions,
    sessions
  );

  const actionRate = safeRate(
    metrics.outboundClicks + metrics.ctaClicks + metrics.recommendationClicks,
    Math.max(views, 1)
  );

  const bounceRate = safeRate(metrics.bounceLikeSessions, sessions);
  const multiPageRate = safeRate(metrics.multiPageSessions, sessions);
  const highIntentRate = safeRate(metrics.highIntentSessions, sessions);

  const healthScore = clamp(
    Math.round(
      30 +
      engagementRate * 35 +
      multiPageRate * 20 +
      actionRate * 20 -
      bounceRate * 25
    ),
    0,
    100
  );

  const commercialIntentScore = clamp(
    Math.round(
      20 +
      highIntentRate * 45 +
      safeRate(metrics.outboundClicks, Math.max(views, 1)) * 30 +
      safeRate(metrics.ctaClicks, Math.max(views, 1)) * 20
    ),
    0,
    100
  );

  let actionClass = "monitor";

  if (views >= 2 && healthScore >= 70 && commercialIntentScore >= 55) {
    actionClass = "winner";
  } else if (views >= 3 && engagementRate >= 0.35 && actionRate < 0.12) {
    actionClass = "friction_point";
  } else if (views <= 2 && commercialIntentScore >= 50) {
    actionClass = "quiet_opportunity";
  } else if (views >= 3 && healthScore < 25 && actionRate === 0) {
    actionClass = "misfire";
  } else if (healthScore >= 65 && multiPageRate >= 0.25) {
    actionClass = "expand_candidate";
  }

  return {
    engagementRate: round2(engagementRate),
    actionRate: round2(actionRate),
    bounceRate: round2(bounceRate),
    multiPageRate: round2(multiPageRate),
    highIntentRate: round2(highIntentRate),
    healthScore,
    commercialIntentScore,
    actionClass
  };
}

function safeRate(num, den) {
  if (!den) return 0;
  return num / den;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function round2(value) {
  return Number(value.toFixed(2));
}
