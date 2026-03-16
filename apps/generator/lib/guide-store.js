import fs from "fs-extra";
import path from "path";

const guidesFile = path.resolve("../site/src/data/guides.json");

export async function loadGuides() {
  const exists = await fs.pathExists(guidesFile);
  if (!exists) {
    throw new Error(`Guides file not found: ${guidesFile}`);
  }

  const guides = await fs.readJSON(guidesFile);
  if (!Array.isArray(guides)) {
    throw new Error("Guides data is not an array.");
  }

  return guides;
}

export async function saveGuides(guides) {
  await fs.writeJSON(guidesFile, guides, { spaces: 2 });
}

export function hasDuplicateBySlug(guides, slug) {
  return guides.some((guide) => guide.slug === slug);
}

export function hasDuplicateByTitle(guides, title) {
  const lower = title.toLowerCase();
  return guides.some((guide) => String(guide.title || "").toLowerCase() === lower);
}
