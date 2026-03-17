function normalizeKey(value = "") {
  return String(value || "").trim().toLowerCase();
}

function avg(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function mergeSignals(records = []) {
  const map = new Map();

  for (const record of records) {
    const key = normalizeKey(record.candidateTopic);

    if (!map.has(key)) {
      map.set(key, {
        candidateTopic: record.candidateTopic,
        category: record.category,
        packNames: new Set(),
        seeds: new Set(),
        sources: new Set(),
        sourceTypes: new Set(),
        modifiers: new Set(),
        audiences: new Set(),
        rawTexts: [],
        urls: [],
        freshnessScores: [],
        confidenceScores: [],
        marketSignalScores: [],
        capturedAt: []
      });
    }

    const target = map.get(key);
    target.packNames.add(record.packName);
    target.seeds.add(record.seed);
    target.sources.add(record.source);
    target.sourceTypes.add(record.sourceType);
    target.modifiers.add(record.modifier);
    target.audiences.add(record.audience);
    target.rawTexts.push(record.rawText);
    if (record.url) target.urls.push(record.url);
    target.freshnessScores.push(record.freshnessScore);
    target.confidenceScores.push(record.confidenceScore);
    target.marketSignalScores.push(record.marketSignalScore);
    target.capturedAt.push(record.capturedAt);
  }

  const merged = [];

  for (const [, value] of map.entries()) {
    const supportingSourceCount = value.sources.size;
    const baseMarketScore = avg(value.marketSignalScores);
    const mergedMarketSignalScore = Math.round(
      Math.min(100, baseMarketScore + (supportingSourceCount - 1) * 6)
    );

    merged.push({
      candidateTopic: value.candidateTopic,
      category: value.category,
      packNames: Array.from(value.packNames),
      seeds: Array.from(value.seeds),
      sources: Array.from(value.sources),
      sourceTypes: Array.from(value.sourceTypes),
      modifiers: Array.from(value.modifiers),
      audiences: Array.from(value.audiences),
      supportingSourceCount,
      avgFreshnessScore: Math.round(avg(value.freshnessScores)),
      avgConfidenceScore: Math.round(avg(value.confidenceScores)),
      avgMarketSignalScore: Math.round(baseMarketScore),
      mergedMarketSignalScore,
      latestCapturedAt: value.capturedAt.sort().slice(-1)[0] || null,
      sampleRawTexts: value.rawTexts.slice(0, 5),
      urls: value.urls.slice(0, 5)
    });
  }

  return merged.sort((a, b) => b.mergedMarketSignalScore - a.mergedMarketSignalScore);
}
