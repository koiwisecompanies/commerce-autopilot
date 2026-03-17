export function discoverAudiences(records = []) {
  const counts = {};

  for (const record of records) {
    const audience = record.audience || "general";
    counts[audience] = (counts[audience] || 0) + 1;
  }

  return Object.entries(counts)
    .map(([audience, count]) => ({ audience, count }))
    .sort((a, b) => b.count - a.count);
}
