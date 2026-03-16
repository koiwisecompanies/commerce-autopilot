import { AUDIENCE_PATTERNS } from "./config.js";

export function detectAudience(topic = "") {
  const lowered = String(topic).toLowerCase();

  for (const item of AUDIENCE_PATTERNS) {
    if (lowered.includes(item.label)) {
      return {
        key: item.key,
        label: item.label,
        weight: item.weight
      };
    }
  }

  return {
    key: "general",
    label: "general",
    weight: 4
  };
}
