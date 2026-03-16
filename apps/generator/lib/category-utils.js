const categoryRules = [
  {
    category: "Kitchen",
    keywords: [
      "blender", "air fryer", "coffee", "espresso", "toaster", "knife",
      "cookware", "pan", "mixer", "juicer", "kitchen", "food processor"
    ]
  },
  {
    category: "Home Office",
    keywords: [
      "office chair", "standing desk", "desk", "monitor arm", "desk lamp",
      "webcam", "keyboard", "mouse pad", "laptop stand", "printer"
    ]
  },
  {
    category: "Pets",
    keywords: [
      "dog", "cat", "harness", "leash", "pet", "feeder", "litter",
      "water fountain", "scratcher", "crate"
    ]
  },
  {
    category: "Automotive",
    keywords: [
      "car", "dash cam", "phone mount", "seat organizer", "tire",
      "jump starter", "automotive", "vehicle", "windshield"
    ]
  },
  {
    category: "Electronics",
    keywords: [
      "gaming", "mouse", "keyboard", "earbuds", "headphones", "monitor",
      "laptop", "tablet", "phone", "charger", "speaker", "router"
    ]
  },
  {
    category: "Outdoors",
    keywords: [
      "camping", "tent", "backpack", "hiking", "sleeping bag", "lantern",
      "outdoor", "cooler", "trail"
    ]
  }
];

export function inferCategory(topic = "") {
  const lower = topic.toLowerCase();

  for (const rule of categoryRules) {
    if (rule.keywords.some((keyword) => lower.includes(keyword))) {
      return rule.category;
    }
  }

  return "General";
}
