import { buildModifierCandidates } from "./modifier-rules.js";

export function buildCandidates(packName, seeds) {
  const direct = seeds.map((seed) => `best ${seed}`);
  const modified = seeds.flatMap((seed) => buildModifierCandidates(seed));

  const packSpecific = buildPackSpecificCandidates(packName, seeds);

  const all = [...direct, ...modified, ...packSpecific]
    .map((topic) => topic.trim().replace(/\s+/g, " "))
    .filter(Boolean);

  const seen = new Set();
  const unique = [];

  for (const topic of all) {
    const key = topic.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(topic);
    }
  }

  return unique;
}

function buildPackSpecificCandidates(packName, seeds) {
  const items = [];

  if (packName === "electronics") {
    for (const seed of seeds) {
      items.push(`best ${seed} for gaming`);
      items.push(`best ${seed} for work`);
      items.push(`best ${seed} for battery life`);
      items.push(`best budget ${seed}`);
      items.push(`best ${seed} under 50`);
    }
  }

  if (packName === "home-office") {
    for (const seed of seeds) {
      items.push(`best ${seed} for remote work`);
      items.push(`best ${seed} for productivity`);
      items.push(`best ${seed} for back support`);
      items.push(`best budget ${seed}`);
      items.push(`best ${seed} under 50`);
    }
  }

  if (packName === "kitchen") {
    for (const seed of seeds) {
      items.push(`best ${seed} for meal prep`);
      items.push(`best ${seed} for easy cleaning`);
      items.push(`best ${seed} for countertop use`);
      items.push(`best budget ${seed}`);
      items.push(`best ${seed} under 50`);
    }
  }

  if (packName === "pets") {
    for (const seed of seeds) {
      items.push(`best ${seed} for apartments`);
      items.push(`best ${seed} for travel`);
      items.push(`best ${seed} for beginners`);
      items.push(`best budget ${seed}`);
      items.push(`best ${seed} for everyday use`);
    }
  }

  if (packName === "automotive") {
    for (const seed of seeds) {
      items.push(`best ${seed} for beginners`);
      items.push(`best ${seed} for travel`);
      items.push(`best ${seed} for everyday use`);
      items.push(`best budget ${seed}`);
      items.push(`best ${seed} under 100`);
    }
  }

  return items;
}
