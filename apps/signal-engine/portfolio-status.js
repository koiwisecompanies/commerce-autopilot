import { buildInventory } from "./lib/site-inventory.js";
import { recommendNextPacks } from "./lib/recommendation-service.js";

const inventory = await buildInventory();
const recommendation = await recommendNextPacks();

console.log("");
console.log("Portfolio status");
console.log("----------------");
console.log(`Total guides: ${inventory.totalGuides}`);
console.log(`Categories represented: ${inventory.categoriesRepresented}`);

if (inventory.dominantCategory) {
  console.log(
    `Dominant category: ${inventory.dominantCategory.name} (${(inventory.dominantCategory.share * 100).toFixed(1)}%)`
  );
}

console.log("");
console.log("Category counts:");
for (const [category, count] of Object.entries(inventory.categoryCounts)) {
  console.log(`- ${category}: ${count}`);
}

console.log("");
console.log("Recommended next packs:");
for (const pack of recommendation.rankedPacks.slice(0, 5)) {
  console.log(`- ${pack.packName}: ${pack.metrics.finalPackScore}`);
}
