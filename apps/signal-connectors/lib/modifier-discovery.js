export function discoverModifiers(records = []) {
  const counts = {};

  for (const record of records) {
    const modifier = record.modifier || "core";
    counts[modifier] = (counts[modifier] || 0) + 1;
  }

  return Object.entries(counts)
    .map(([modifier, count]) => ({ modifier, count }))
    .sort((a, b) => b.count - a.count);
}
