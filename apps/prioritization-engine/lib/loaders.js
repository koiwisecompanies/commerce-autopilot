import fs from "fs-extra";
import path from "node:path";
import { PATHS } from "./paths.js";
import { readJsonSafe, readTextSafe } from "./fs-utils.js";
import { normalizeLabel, toSlug, toTitle } from "./slug-utils.js";

function normalizeCategoryName(value) {
  return toTitle(String(value || "").replace(/[_-]+/g, " "));
}

function inferFamily(topic) {
  const normalized = normalizeLabel(topic)
    .replace(/\bbest\b/g, "")
    .replace(/\bfor\b.+$/g, "")
    .replace(/\bunder\s+\d+\b/g, "")
    .replace(/\bbudget\b/g, "")
    .replace(/\bwireless\b/g, "")
    .replace(/\bportable\b/g, "")
    .replace(/\bbeginner[s]?\b/g, "")
    .replace(/\bsmall\b/g, "")
    .replace(/\btravel\b/g, "")
    .replace(/\beveryday\b/g, "")
    .replace(/\buse\b/g, "")
    .replace(/\beasy cleaning\b/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return normalized || normalizeLabel(topic);
}

export async function loadSignalData() {
  const signals = await readJsonSafe(PATHS.signalMerged, []);
  return Array.isArray(signals) ? signals : [];
}

export async function loadFeedbackData() {
  const guide = await readJsonSafe(PATHS.feedbackGuide, { guides: [] });
  const category = await readJsonSafe(PATHS.feedbackCategory, { categories: [] });
  const modifier = await readJsonSafe(PATHS.feedbackModifier, { modifiers: [] });
  const audience = await readJsonSafe(PATHS.feedbackAudience, { audiences: [] });
  const actions = await readJsonSafe(PATHS.feedbackActions, { actionSignals: {} });
  const report = await readJsonSafe(PATHS.feedbackReport, {});
  return { guide, category, modifier, audience, actions, report };
}

export async function loadTopicPacks() {
  const exists = await fs.pathExists(PATHS.topicPacksDir);
  if (!exists) return [];

  const files = (await fs.readdir(PATHS.topicPacksDir))
    .filter((name) => name.endsWith(".txt"))
    .sort();

  const packs = [];
  for (const fileName of files) {
    const packName = fileName.replace(/\.txt$/, "");
    const fullPath = path.join(PATHS.topicPacksDir, fileName);
    const content = await readTextSafe(fullPath, "");
    const topics = content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    packs.push({
      packName,
      category: normalizeCategoryName(packName),
      filePath: fullPath,
      topics
    });
  }

  return packs;
}

export function buildSignalIndexes(signals) {
  const byFamily = new Map();
  const byCategory = new Map();
  const byModifier = new Map();
  const byAudience = new Map();

  for (const signal of signals) {
    const family = normalizeLabel(signal.topicFamily || inferFamily(signal.candidateTopic || ""));
    const category = normalizeCategoryName(signal.category || "unknown");
    const modifiers = Array.isArray(signal.modifiers) ? signal.modifiers : [];
    const audiences = Array.isArray(signal.audiences) ? signal.audiences : [];
    const record = {
      ...signal,
      family,
      category
    };

    if (!byFamily.has(family)) byFamily.set(family, []);
    byFamily.get(family).push(record);

    if (!byCategory.has(category)) byCategory.set(category, []);
    byCategory.get(category).push(record);

    for (const modifier of modifiers) {
      const key = normalizeLabel(modifier);
      if (!key) continue;
      if (!byModifier.has(key)) byModifier.set(key, []);
      byModifier.get(key).push(record);
    }

    for (const audience of audiences) {
      const key = normalizeLabel(audience);
      if (!key) continue;
      if (!byAudience.has(key)) byAudience.set(key, []);
      byAudience.get(key).push(record);
    }
  }

  return { byFamily, byCategory, byModifier, byAudience };
}

export function existingGuideSlugSet(feedbackGuide) {
  const guides = Array.isArray(feedbackGuide?.guides) ? feedbackGuide.guides : [];
  const slugs = new Set();
  for (const guide of guides) {
    slugs.add(toSlug(guide.slug || guide.title || ""));
    slugs.add(toSlug(guide.title || ""));
  }
  return slugs;
}

export function normalizePackTopics(packs) {
  return packs.flatMap((pack) =>
    pack.topics.map((topic) => ({
      packName: pack.packName,
      category: pack.category,
      topic,
      topicSlug: toSlug(topic),
      family: inferFamily(topic)
    }))
  );
}
