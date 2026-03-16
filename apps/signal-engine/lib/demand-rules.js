export function scoreDemand(topic = "") {
  const lowered = String(topic).toLowerCase();
  let score = 30;

  if (lowered.startsWith("best ")) score += 15;
  if (lowered.includes(" under ")) score += 14;
  if (lowered.includes(" for ")) score += 10;
  if (lowered.includes(" beginner")) score += 8;
  if (lowered.includes(" travel")) score += 7;
  if (lowered.includes(" apartment")) score += 7;
  if (lowered.includes(" small spaces")) score += 7;
  if (lowered.includes(" work")) score += 6;
  if (lowered.includes(" gaming")) score += 6;

  return Math.min(score, 100);
}
