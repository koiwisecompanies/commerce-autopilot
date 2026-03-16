export function inferCategoryFromSeed(seed = "") {
  const lower = seed.toLowerCase();

  if (
    ["blender", "air fryer", "espresso", "coffee", "toaster", "grinder", "mixer", "knife", "cookware", "juicer"]
      .some((term) => lower.includes(term))
  ) return "kitchen";

  if (
    ["mouse", "keyboard", "monitor", "laptop", "earbuds", "headphones", "tablet", "charger", "speaker", "router"]
      .some((term) => lower.includes(term))
  ) return "electronics";

  if (
    ["office chair", "standing desk", "desk lamp", "monitor arm", "laptop stand", "webcam", "desk"]
      .some((term) => lower.includes(term))
  ) return "home-office";

  if (
    ["dog", "cat", "harness", "leash", "feeder", "pet", "crate", "litter"]
      .some((term) => lower.includes(term))
  ) return "pets";

  if (
    ["car", "dash cam", "phone mount", "seat cover", "vacuum", "jump starter", "vehicle"]
      .some((term) => lower.includes(term))
  ) return "automotive";

  return "general";
}
