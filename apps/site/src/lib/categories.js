import guides from "../data/guides.json";
import { slugifyCategory } from "./routes.js";

const categoryDescriptions = {
  electronics: {
    title: "Electronics Buying Guides",
    description: "Explore electronics buying guides covering mice, keyboards, monitors, audio gear, and more."
  },
  kitchen: {
    title: "Kitchen Buying Guides",
    description: "Browse practical kitchen buying guides for blenders, coffee gear, and other countertop essentials."
  },
  pets: {
    title: "Pet Buying Guides",
    description: "Discover pet buying guides for dog and cat products focused on comfort, safety, and convenience."
  },
  automotive: {
    title: "Automotive Buying Guides",
    description: "Find automotive buying guides for safer driving, in-car organization, and vehicle accessories."
  },
  "home-office": {
    title: "Home Office Buying Guides",
    description: "Compare home office buying guides for chairs, desks, lamps, and remote-work essentials."
  },
  outdoors: {
    title: "Outdoors Buying Guides",
    description: "Review outdoor and travel buying guides for hiking, camping, and on-the-go gear."
  },
  general: {
    title: "General Buying Guides",
    description: "Browse general buying guides across multiple shopper-intent topics."
  }
};

export function getAllCategories() {
  const map = new Map();

  for (const guide of guides) {
    const name = guide.category || "General";
    const slug = slugifyCategory(name);

    if (!map.has(slug)) {
      const meta = categoryDescriptions[slug] || {
        title: `${name} Buying Guides`,
        description: `Browse buyer-intent guides in the ${name} category.`
      };

      map.set(slug, {
        name,
        slug,
        title: meta.title,
        description: meta.description,
        count: 0
      });
    }

    map.get(slug).count += 1;
  }

  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export function getCategoryBySlug(categorySlug) {
  return getAllCategories().find((category) => category.slug === categorySlug) || null;
}

export function getGuidesByCategorySlug(categorySlug) {
  return guides
    .filter((guide) => slugifyCategory(guide.category || "General") === categorySlug)
    .sort((a, b) => a.title.localeCompare(b.title));
}
