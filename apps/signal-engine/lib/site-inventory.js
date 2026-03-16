import fs from "fs-extra";
import { SITE_GUIDES_PATH } from "./config.js";

function normalize(value = "") {
  return String(value || "").trim().toLowerCase();
}

export async function loadGuides() {
  const exists = await fs.pathExists(SITE_GUIDES_PATH);
  if (!exists) return [];
  const guides = await fs.readJSON(SITE_GUIDES_PATH);
  return Array.isArray(guides) ? guides : [];
}

export async function buildInventory() {
  const guides = await loadGuides();

  const categoryCounts = {};
  const titleSet = new Set();
  const slugSet = new Set();
  const modifierCounts = {};
  const audienceCounts = {};

  for (const guide of guides) {
    const category = normalize(guide.category || "uncategorized");
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;

    if (guide.title) titleSet.add(normalize(guide.title));
    if (guide.slug) slugSet.add(normalize(guide.slug));

    const haystack = `${normalize(guide.title)} ${normalize(guide.description)}`;

    const modifierKeys = [
      "for beginners",
      "under 50",
      "under 100",
      "for apartments",
      "for small spaces",
      "for travel",
      "for work",
      "for gaming",
      "for remote work",
      "for seniors",
      "for small hands",
      "for battery life",
      "for productivity",
      "for back support",
      "for easy cleaning",
      "for everyday use",
      "for meal prep",
      "for countertop use"
    ];

    for (const modifier of modifierKeys) {
      if (haystack.includes(modifier)) {
        modifierCounts[modifier] = (modifierCounts[modifier] || 0) + 1;
      }
    }

    const audienceRules = [
      ["beginners", "beginners"],
      ["budget-buyers", "under"],
      ["apartment-dwellers", "apartments"],
      ["travel-buyers", "travel"],
      ["office-workers", "work"],
      ["remote-workers", "remote work"],
      ["gamers", "gaming"],
      ["space-limited-buyers", "small spaces"],
      ["accessibility-buyers", "small hands"],
      ["seniors", "seniors"]
    ];

    for (const [audience, token] of audienceRules) {
      if (haystack.includes(token)) {
        audienceCounts[audience] = (audienceCounts[audience] || 0) + 1;
      }
    }
  }

  const totalGuides = guides.length;
  const entries = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);

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
    categoryCounts,
    categoriesRepresented: entries.length,
    dominantCategory,
    titleSet,
    slugSet,
    modifierCounts,
    audienceCounts
  };
}
