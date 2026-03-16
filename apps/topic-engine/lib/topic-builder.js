import fs from "fs-extra";
import { PACKS } from "./config.js";
import { CORE_PATTERNS, CATEGORY_PATTERNS } from "./patterns.js";
import { inferCategoryFromSeed } from "./category-rules.js";
import { normalizeSeed, normalizeTopic, createSlug } from "./topic-utils.js";
import { scoreTopic, isTopicAcceptable } from "./topic-scorer.js";
import { loadExistingGuides, buildExistingIndexes, isDuplicateTopic } from "./topic-dedupe.js";

export async function loadSeedsForPack(packName) {
  const seedFile = PACKS[packName];
  if (!seedFile) {
    throw new Error(`Unknown pack: ${packName}`);
  }

  const raw = await fs.readFile(seedFile, "utf8");

  return raw
    .split(/\r?\n/)
    .map((line) => normalizeSeed(line))
    .filter(Boolean);
}

function expandSeed(seed, category) {
  const patterns = [
    ...CORE_PATTERNS,
    ...(CATEGORY_PATTERNS[category] || CATEGORY_PATTERNS.general)
  ];

  return patterns.map((pattern) =>
    normalizeTopic(pattern.replaceAll("{seed}", seed))
  );
}

export async function buildPackTopics(packName) {
  const seeds = await loadSeedsForPack(packName);
  const guides = await loadExistingGuides();
  const indexes = buildExistingIndexes(guides);

  const seenSlugs = new Set();
  const accepted = [];
  const duplicates = [];
  const lowScore = [];
  const generated = [];

  for (const seed of seeds) {
    const category = inferCategoryFromSeed(seed);
    const candidates = expandSeed(seed, category);

    for (const topic of candidates) {
      const slug = createSlug(topic);
      const score = scoreTopic(topic, category);

      generated.push({
        seed,
        category,
        topic,
        slug,
        score
      });

      if (isDuplicateTopic(topic, indexes, seenSlugs)) {
        duplicates.push({ seed, category, topic, slug, score });
        continue;
      }

      if (!isTopicAcceptable(score)) {
        lowScore.push({ seed, category, topic, slug, score });
        continue;
      }

      seenSlugs.add(slug);
      accepted.push({ seed, category, topic, slug, score });
    }
  }

  accepted.sort((a, b) => b.score - a.score || a.topic.localeCompare(b.topic));

  return {
    packName,
    seedsProcessed: seeds.length,
    guidesChecked: guides.length,
    generated,
    accepted,
    duplicates,
    lowScore
  };
}
