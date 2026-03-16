import { loadGuides } from "./lib/guide-store.js";

const guides = await loadGuides();

console.log(`Total guides: ${guides.length}`);
console.log("");

for (const guide of guides) {
  console.log(`- ${guide.title} -> /guides/${guide.slug} [${guide.category}]`);
}
