import slugify from "slugify";

export function normalizeWhitespace(value = "") {
  return value.replace(/\s+/g, " ").trim();
}

export function normalizeTopic(rawTopic = "") {
  const cleaned = normalizeWhitespace(rawTopic);

  if (!cleaned) return "";

  const words = cleaned.split(" ").filter(Boolean);
  const normalized = words
    .map((word) => {
      if (word.length <= 3 && word === word.toUpperCase()) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");

  return normalized;
}

export function createSlug(topic = "") {
  return slugify(topic, { lower: true, strict: true, trim: true });
}

export function parseCommaSeparatedTopics(raw = "") {
  return raw
    .split(",")
    .map((item) => normalizeTopic(item))
    .filter(Boolean);
}

export function validateTopic(topic = "") {
  const errors = [];

  if (!topic) errors.push("Topic is empty.");
  if (topic.length < 8) errors.push("Topic is too short.");
  if (topic.split(" ").length < 2) errors.push("Topic should contain at least two words.");

  const slug = createSlug(topic);
  if (!slug) errors.push("Slug could not be generated.");

  return {
    valid: errors.length === 0,
    errors,
    slug
  };
}
