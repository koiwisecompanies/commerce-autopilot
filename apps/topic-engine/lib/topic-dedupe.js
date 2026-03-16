import fs from "fs-extra";
import { GUIDES_FILE } from "./config.js";
import { createSlug } from "./topic-utils.js";

export async function loadExistingGuides() {
  const exists = await fs.pathExists(GUIDES_FILE);
  if (!exists) return [];

  const guides = await fs.readJSON(GUIDES_FILE);
  return Array.isArray(guides) ? guides : [];
}

export function buildExistingIndexes(guides = []) {
  const slugSet = new Set(guides.map((g) => createSlug(g.slug || g.title || "")));
  const titleSet = new Set(guides.map((g) => String(g.title || "").toLowerCase()));
  return { slugSet, titleSet };
}

export function isDuplicateTopic(topic, indexes, seenSlugs) {
  const slug = createSlug(topic);
  const lowerTitle = topic.toLowerCase();

  return (
    indexes.slugSet.has(slug) ||
    indexes.titleSet.has(lowerTitle) ||
    seenSlugs.has(slug)
  );
}
