function normalize(value = "") {
  return String(value || "").trim().toLowerCase();
}

export function scoreCategoryOpportunity(category, inventory) {
  const key = normalize(category);
  const total = inventory.totalGuides || 0;
  const count = inventory.categoryCounts[key] || 0;

  if (total === 0) return 90;

  const share = count / total;

  if (share < 0.05) return 92;
  if (share < 0.10) return 84;
  if (share < 0.15) return 74;
  if (share < 0.25) return 60;
  if (share < 0.40) return 45;
  return 20;
}
