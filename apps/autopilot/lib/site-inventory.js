import fs from "fs-extra";
import { GUIDES_FILE } from "./config.js";

function normalizeCategory(value = "") {
  return String(value || "uncategorized").trim().toLowerCase();
}

export async function loadGuides() {
  const exists = await fs.pathExists(GUIDES_FILE);
  if (!exists) return [];
  const guides = await fs.readJSON(GUIDES_FILE);
  return Array.isArray(guides) ? guides : [];
}

export async function getInventorySummary() {
  const guides = await loadGuides();
  const categoryCounts = {};

  for (const guide of guides) {
    const category = normalizeCategory(guide.category);
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
  }

  const entries = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);
  const totalGuides = guides.length;
  const categoriesRepresented = entries.length;

  let dominantCategory = null;
  if (entries.length > 0 && totalGuides > 0) {
    dominantCategory = {
      name: entries[0][0],
      count: entries[0][1],
      share: entries[0][1] / totalGuides
    };
  }

  return {
    totalGuides,
    categoriesRepresented,
    categoryCounts,
    dominantCategory
  };
}

export function projectInventory(summary, category, additionalGuides) {
  const projectedCounts = { ...(summary.categoryCounts || {}) };
  const key = normalizeCategory(category);
  projectedCounts[key] = (projectedCounts[key] || 0) + additionalGuides;

  const totalGuides = Object.values(projectedCounts).reduce((sum, count) => sum + count, 0);
  const entries = Object.entries(projectedCounts).sort((a, b) => b[1] - a[1]);

  let dominantCategory = null;
  if (entries.length > 0 && totalGuides > 0) {
    dominantCategory = {
      name: entries[0][0],
      count: entries[0][1],
      share: entries[0][1] / totalGuides
    };
  }

  return {
    totalGuides,
    categoriesRepresented: entries.length,
    categoryCounts: projectedCounts,
    dominantCategory
  };
}

export function evaluateLaunchReadiness(summary, policy) {
  const warnings = [];

  if (summary.totalGuides < policy.minTotalGuides) {
    warnings.push(`Total guide count below launch target: ${summary.totalGuides}`);
  }

  if (summary.categoriesRepresented < policy.minCategoriesRepresented) {
    warnings.push(`Categories represented below launch target: ${summary.categoriesRepresented}`);
  }

  if (
    summary.dominantCategory &&
    summary.dominantCategory.share > policy.maxDominantCategoryShare
  ) {
    warnings.push(
      `Dominant category share too high: ${summary.dominantCategory.name} at ${(summary.dominantCategory.share * 100).toFixed(1)}%`
    );
  }

  return {
    launchSafe: warnings.length === 0,
    warnings
  };
}
