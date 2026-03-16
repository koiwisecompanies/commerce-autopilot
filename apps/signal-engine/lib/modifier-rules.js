import { MODIFIER_WEIGHTS } from "./config.js";

export function getModifierCatalog() {
  return Object.entries(MODIFIER_WEIGHTS).map(([modifier, weight]) => ({
    modifier,
    weight
  }));
}

export function detectModifier(topic = "") {
  const lowered = String(topic).toLowerCase();

  let best = null;
  for (const [modifier, weight] of Object.entries(MODIFIER_WEIGHTS)) {
    if (lowered.includes(modifier)) {
      if (!best || weight > best.weight) {
        best = { modifier, weight };
      }
    }
  }

  return best || { modifier: "core", weight: 6 };
}

export function buildModifierCandidates(seed) {
  const modifiers = [
    "for beginners",
    "for small spaces",
    "for travel",
    "for apartments",
    "for work",
    "for everyday use",
    "for easy cleaning",
    "under 50",
    "under 100"
  ];

  return modifiers.map((modifier) => `best ${seed} ${modifier}`);
}
