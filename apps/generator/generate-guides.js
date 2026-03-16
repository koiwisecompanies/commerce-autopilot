import fs from "fs-extra";
import slugify from "slugify";

const guidesFile = "../site/src/data/guides.json";

async function generateGuide(topic) {
  const slug = slugify(topic, { lower: true, strict: true });

  const newGuide = {
    slug,
    title: topic,
    description: `Discover the best ${topic.toLowerCase()} available right now.`,
    intro: `Below are some of the best ${topic.toLowerCase()} worth considering.`,
    buyingGuide: `When choosing ${topic.toLowerCase()}, consider quality, durability, user reviews, and price.`,
    faqQuestion: `What should I look for when buying ${topic.toLowerCase()}?`,
    faqAnswer: `Focus on quality, reliability, and verified customer reviews.`,
    products: [
      {
        title: "Top Pick Option 1",
        description: "A highly rated option with strong customer feedback.",
        link: "#"
      },
      {
        title: "Top Pick Option 2",
        description: "A popular choice known for durability and performance.",
        link: "#"
      },
      {
        title: "Top Pick Option 3",
        description: "A budget-friendly option with solid reviews.",
        link: "#"
      }
    ]
  };

  const guides = await fs.readJSON(guidesFile);

  const alreadyExists = guides.some((guide) => guide.slug === slug);
  if (alreadyExists) {
    console.log(`Guide already exists: ${slug}`);
    return;
  }

  guides.push(newGuide);
  await fs.writeJSON(guidesFile, guides, { spaces: 2 });

  console.log("Guide created:", slug);
}

const topic = process.argv.slice(2).join(" ").trim();

if (!topic) {
  console.error('Please provide a topic, for example: node generate-guides.js "Best Budget Office Chair"');
  process.exit(1);
}

generateGuide(topic);
