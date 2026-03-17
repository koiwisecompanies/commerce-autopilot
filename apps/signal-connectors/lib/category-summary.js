export function buildCategorySummary(records = []) {
  const map = {};

  for (const record of records) {
    const category = record.category || "unknown";

    if (!map[category]) {
      map[category] = {
        category,
        count: 0,
        avgMarketSignalScore: 0,
        scores: []
      };
    }

    map[category].count += 1;
    const score = record.mergedMarketSignalScore ?? record.marketSignalScore ?? 0;
    map[category].scores.push(score);
  }

  return Object.values(map)
    .map((item) => ({
      category: item.category,
      count: item.count,
      avgMarketSignalScore: Math.round(
        item.scores.reduce((sum, value) => sum + value, 0) / item.scores.length
      )
    }))
    .sort((a, b) => b.avgMarketSignalScore - a.avgMarketSignalScore);
}
