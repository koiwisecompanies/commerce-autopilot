function normalize(value = "") {
  return String(value || "").trim().toLowerCase();
}

export function scoreDuplicateRisk(topic, inventory) {
  const lowered = normalize(topic);

  if (inventory.titleSet.has(lowered)) {
    return 100;
  }

  let nearMatches = 0;
  for (const existingTitle of inventory.titleSet) {
    if (
      existingTitle.includes(lowered) ||
      lowered.includes(existingTitle) ||
      overlapRatio(lowered, existingTitle) > 0.72
    ) {
      nearMatches += 1;
    }
  }

  return Math.min(nearMatches * 18, 90);
}

export function scoreCategorySaturation(category, inventory) {
  const total = inventory.totalGuides || 0;
  const count = inventory.categoryCounts[normalize(category)] || 0;
  if (total === 0) return 0;
  const share = count / total;
  return Math.min(Math.round(share * 100), 100);
}

function overlapRatio(a, b) {
  const aTokens = new Set(normalize(a).split(/\s+/).filter(Boolean));
  const bTokens = new Set(normalize(b).split(/\s+/).filter(Boolean));

  if (aTokens.size === 0 || bTokens.size === 0) return 0;

  let shared = 0;
  for (const token of aTokens) {
    if (bTokens.has(token)) shared += 1;
  }

  return shared / Math.max(aTokens.size, bTokens.size);
}
