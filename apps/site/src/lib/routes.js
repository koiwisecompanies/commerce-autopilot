export function getGuideUrl(slug) {
  return `/guides/${slug}`;
}

export function slugifyCategory(category = "") {
  return category
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export function getCategoryUrl(categorySlug) {
  return `/categories/${categorySlug}`;
}

export function getOutboundUrl(merchant = "merchant", slug = "product") {
  return `/out/${merchant}/${slug}`;
}
