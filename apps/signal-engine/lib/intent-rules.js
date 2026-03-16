export function scoreIntent(topic = "") {
  const lowered = String(topic).toLowerCase();
  let score = 20;

  if (lowered.startsWith("best ")) score += 22;
  if (lowered.includes(" under ")) score += 18;
  if (lowered.includes(" for beginners")) score += 10;
  if (lowered.includes(" for work")) score += 8;
  if (lowered.includes(" for gaming")) score += 8;
  if (lowered.includes(" for travel")) score += 8;
  if (lowered.includes(" for apartments")) score += 8;
  if (lowered.includes(" easy cleaning")) score += 7;
  if (lowered.includes(" back support")) score += 7;
  if (lowered.includes(" battery life")) score += 7;

  return Math.min(score, 100);
}
