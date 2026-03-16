function normalize(value = "") {
  return String(value || "").trim().toLowerCase();
}

export function computeBalanceBonus(category, inventory) {
  const key = normalize(category);
  const total = inventory.totalGuides || 0;
  const count = inventory.categoryCounts[key] || 0;

  if (total === 0) return 16;

  const dominantShare = inventory.dominantCategory?.share || 0;
  const currentShare = count / total;

  if (currentShare < 0.08) return 18;
  if (currentShare < 0.15) return 12;
  if (currentShare < 0.25) return 6;
  if (dominantShare > 0.60 && inventory.dominantCategory?.name === key) return -20;
  if (currentShare > 0.45) return -12;

  return 0;
}

export function estimateBalanceGain(category, inventory, newCount = 0) {
  const key = normalize(category);
  const total = inventory.totalGuides || 0;
  const count = inventory.categoryCounts[key] || 0;

  if (newCount <= 0) return 0;
  if (total === 0) return 15;

  const beforeShare = count / total;
  const afterShare = (count + newCount) / (total + newCount);

  if (beforeShare < 0.08 && afterShare < 0.20) return 14;
  if (beforeShare < 0.15 && afterShare < 0.25) return 10;
  if (inventory.dominantCategory?.name === key && beforeShare > 0.45) return -10;

  return 3;
}
