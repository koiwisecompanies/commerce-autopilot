import { listAvailablePacks, loadSeeds } from "./seed-service.js";
import { buildCandidates } from "./topic-candidate-builder.js";
import { scoreTopic } from "./score-topic.js";
import { scorePack } from "./score-pack.js";
import { buildInventory } from "./site-inventory.js";

function topByScore(items, limit = 20) {
  return [...items]
    .sort((a, b) => b.scores.finalScore - a.scores.finalScore)
    .slice(0, limit);
}

export async function analyzePack(packName) {
  const inventory = await buildInventory();
  const seeds = await loadSeeds(packName);
  const candidates = buildCandidates(packName, seeds);
  const scoredTopics = candidates.map((topic) => scoreTopic(topic, packName, inventory));
  const sortedTopics = [...scoredTopics].sort((a, b) => b.scores.finalScore - a.scores.finalScore);
  const packScore = scorePack(packName, sortedTopics, inventory);

  const queues = {
    publishNow: sortedTopics.filter((item) => item.decision.action === "publish-now"),
    holdForLater: sortedTopics.filter((item) => item.decision.action === "hold-for-later"),
    researchQueue: sortedTopics.filter((item) => item.decision.action === "research-queue"),
    delayCategory: sortedTopics.filter((item) => item.decision.action === "delay-category"),
    avoid: sortedTopics.filter((item) => item.decision.action.startsWith("reject"))
  };

  return {
    analyzedAt: new Date().toISOString(),
    packName,
    seeds,
    candidateCount: candidates.length,
    inventory: {
      totalGuides: inventory.totalGuides,
      categoryCounts: inventory.categoryCounts,
      dominantCategory: inventory.dominantCategory
    },
    packScore,
    topTopics: topByScore(sortedTopics, 20),
    scoredTopics: sortedTopics,
    queues
  };
}

export async function recommendNextPacks() {
  const packs = await listAvailablePacks();
  const inventory = await buildInventory();
  const results = [];

  for (const packName of packs) {
    const seeds = await loadSeeds(packName);
    const candidates = buildCandidates(packName, seeds);
    const scoredTopics = candidates.map((topic) => scoreTopic(topic, packName, inventory));
    const packScore = scorePack(packName, scoredTopics, inventory);

    results.push({
      packName,
      seedsCount: seeds.length,
      ...packScore
    });
  }

  const ranked = results.sort((a, b) => b.metrics.finalPackScore - a.metrics.finalPackScore);

  return {
    generatedAt: new Date().toISOString(),
    inventory: {
      totalGuides: inventory.totalGuides,
      categoryCounts: inventory.categoryCounts,
      dominantCategory: inventory.dominantCategory
    },
    recommendedPack: ranked[0] || null,
    rankedPacks: ranked
  };
}
