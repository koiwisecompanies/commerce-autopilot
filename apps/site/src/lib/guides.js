import guides from "../data/guides.json";
import { slugifyCategory } from "./routes.js";

export function getAllGuides() {
  return [...guides];
}

export function getGuideBySlug(slug) {
  return guides.find((guide) => guide.slug === slug) || null;
}

export function getFeaturedGuides(limit = 3) {
  return guides.filter((guide) => guide.featured).slice(0, limit);
}

export function getLatestGuides(limit = 6) {
  return [...guides].slice(-limit).reverse();
}

export function getRelatedGuides(currentGuide, limit = 3) {
  const currentCategorySlug = slugifyCategory(currentGuide.category || "General");

  const sameCategory = guides.filter(
    (guide) =>
      guide.slug !== currentGuide.slug &&
      slugifyCategory(guide.category || "General") === currentCategorySlug
  );

  const fallback = guides.filter((guide) => guide.slug !== currentGuide.slug);

  const combined = [...sameCategory, ...fallback];
  const seen = new Set();
  const unique = [];

  for (const guide of combined) {
    if (!seen.has(guide.slug)) {
      seen.add(guide.slug);
      unique.push(guide);
    }
  }

  return unique.slice(0, limit);
}
