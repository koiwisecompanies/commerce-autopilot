export function freshnessScoreFromTimestamp(capturedAt) {
  if (!capturedAt) return 50;

  const captured = new Date(capturedAt).getTime();
  const now = Date.now();
  const ageHours = Math.max(0, (now - captured) / (1000 * 60 * 60));

  if (ageHours <= 1) return 100;
  if (ageHours <= 6) return 95;
  if (ageHours <= 24) return 90;
  if (ageHours <= 48) return 82;
  if (ageHours <= 168) return 65;
  return 45;
}

export function decayScore(baseScore, capturedAt) {
  const freshness = freshnessScoreFromTimestamp(capturedAt);
  return Math.round(baseScore * (freshness / 100));
}
