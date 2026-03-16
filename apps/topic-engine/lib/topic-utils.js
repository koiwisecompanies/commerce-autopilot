import slugify from "slugify";

export function normalizeWhitespace(value = "") {
  return value.replace(/\s+/g, " ").trim();
}

export function normalizeSeed(seed = "") {
  const cleaned = normalizeWhitespace(seed);
  if (!cleaned) return "";

  return cleaned
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function normalizeTopic(topic = "") {
  return normalizeWhitespace(topic)
    .split(" ")
    .map((word) => {
      if (/^\d+$/.test(word)) return word;
      if (word.length <= 3 && word === word.toUpperCase()) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

export function createSlug(value = "") {
  return slugify(value, { lower: true, strict: true, trim: true });
}
