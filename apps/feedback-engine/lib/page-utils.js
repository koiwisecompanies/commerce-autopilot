import fs from "fs";
import { SITE_GUIDES_FILE } from "./config.js";

function slugify(value = "") {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function titleFromSlug(slug = "") {
  return String(slug)
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const MODIFIERS = [
  "for-beginners",
  "under-50",
  "under-100",
  "for-apartments",
  "for-small-spaces",
  "for-travel",
  "for-work",
  "for-gaming",
  "for-remote-work",
  "for-seniors",
  "for-small-hands",
  "for-battery-life",
  "for-productivity",
  "for-back-support",
  "for-easy-cleaning",
  "for-everyday-use",
  "for-meal-prep",
  "for-countertop-use",
  "for-back-pain",
  "for-tall-people",
  "for-mac"
];

const AUDIENCE_RULES = [
  ["beginners", "for-beginners"],
  ["budget-buyers", "under-"],
  ["apartment-dwellers", "apartments"],
  ["travel-buyers", "travel"],
  ["office-workers", "for-work"],
  ["remote-workers", "remote-work"],
  ["gamers", "gaming"],
  ["space-limited-buyers", "small-spaces"],
  ["accessibility-buyers", "small-hands"],
  ["seniors", "seniors"],
  ["apple-users", "for-mac"]
];

let guidesIndexCache = null;

export function loadGuidesIndex() {
  if (guidesIndexCache) return guidesIndexCache;

  if (!fs.existsSync(SITE_GUIDES_FILE)) {
    guidesIndexCache = new Map();
    return guidesIndexCache;
  }

  const guides = JSON.parse(fs.readFileSync(SITE_GUIDES_FILE, "utf8"));
  const map = new Map();

  for (const guide of guides) {
    if (guide?.slug) {
      map.set(String(guide.slug), guide);
    }
  }

  guidesIndexCache = map;
  return guidesIndexCache;
}

export function detectModifierFromSlug(slug = "") {
  const lowered = String(slug).toLowerCase();
  const hit = MODIFIERS.find((modifier) => lowered.includes(modifier));
  return hit ? hit.replace(/-/g, " ") : "core";
}

export function detectAudienceFromSlug(slug = "") {
  const lowered = String(slug).toLowerCase();
  const match = AUDIENCE_RULES.find(([, token]) => lowered.includes(token));
  return match ? match[0] : "general";
}

export function detectTopicFamilyFromSlug(slug = "") {
  const lowered = String(slug).toLowerCase();
  let family = lowered.replace(/^best-/, "");

  for (const modifier of MODIFIERS) {
    family = family.replace(new RegExp(`-${modifier}$`), "");
  }

  family = family
    .replace(/-under-\d+$/, "")
    .replace(/-for-[a-z0-9-]+$/, "")
    .replace(/-/g, " ")
    .trim();

  return family || titleFromSlug(slug);
}

export function enrichGuideEvent(event) {
  const guidesIndex = loadGuidesIndex();

  if (!event.pageSlug) return event;

  const guide = guidesIndex.get(event.pageSlug);

  if (guide) {
    const category = guide.category || event.category || null;
    return {
      ...event,
      guideSlug: event.pageSlug,
      category,
      modifier: event.modifier || detectModifierFromSlug(event.pageSlug),
      audience: event.audience || detectAudienceFromSlug(event.pageSlug),
      topicFamily: event.topicFamily || detectTopicFamilyFromSlug(event.pageSlug),
      guideTitle: guide.title || titleFromSlug(event.pageSlug)
    };
  }

  return {
    ...event,
    guideSlug: event.pageSlug,
    modifier: event.modifier || detectModifierFromSlug(event.pageSlug),
    audience: event.audience || detectAudienceFromSlug(event.pageSlug),
    topicFamily: event.topicFamily || detectTopicFamilyFromSlug(event.pageSlug),
    guideTitle: titleFromSlug(event.pageSlug)
  };
}

export function eventPageIdentity(event) {
  if (event.pageType === "guide" && event.pageSlug) return `guide:${event.pageSlug}`;
  if (event.pageType === "category" && event.pageSlug) return `category:${event.pageSlug}`;
  return `${event.pageType}:${event.pagePath}`;
}

export function referrerBucket(referrerType = "") {
  const value = String(referrerType || "").toLowerCase();
  if (["direct", "internal", "external"].includes(value)) return value;
  return "unknown";
}

export function slugifyText(value = "") {
  return slugify(value);
}
