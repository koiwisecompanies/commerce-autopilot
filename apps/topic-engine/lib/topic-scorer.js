export function scoreTopic(topic = "", category = "general") {
  const lower = topic.toLowerCase();
  let score = 0;

  if (lower.startsWith("best ")) score += 20;
  if (lower.includes(" for ")) score += 12;
  if (lower.includes(" under ")) score += 10;
  if (lower.includes(" budget ")) score += 10;
  if (lower.includes(" beginners")) score += 8;
  if (lower.includes(" small ")) score += 6;
  if (lower.includes(" travel")) score += 6;
  if (lower.includes(" work")) score += 5;
  if (lower.includes(" gaming")) score += 5;

  const words = topic.split(" ").filter(Boolean).length;
  if (words >= 3 && words <= 9) score += 10;
  if (words > 11) score -= 8;

  if (topic.length < 18) score -= 8;
  if (topic.length > 90) score -= 10;

  if (category !== "general") score += 5;

  if (lower.includes("best best")) score -= 20;
  if (/(for for|under under)/.test(lower)) score -= 20;

  return score;
}

export function isTopicAcceptable(score) {
  return score >= 25;
}
