import { inferCategory } from "./category-utils.js";
import { createSlug } from "./topic-utils.js";

function buildDescription(topic) {
  return `Discover the best ${topic.toLowerCase()} available right now.`;
}

function buildIntro(topic) {
  return `Below are some of the best ${topic.toLowerCase()} worth considering if you want a fast, focused buying guide.`;
}

function buildBuyingGuide(topic) {
  return `When choosing ${topic.toLowerCase()}, focus on build quality, ease of use, price-to-value, real customer feedback, and whether the product fits the specific use case implied by the search query.`;
}

function buildFaqQuestion(topic) {
  return `What should I look for when buying ${topic.toLowerCase()}?`;
}

function buildFaqAnswer(topic) {
  return `Focus on product quality, reliability, real-world usability, and whether the option matches your budget and intended use.`;
}

function buildProducts(topic) {
  return [
    {
      title: "Top Pick Option 1",
      description: `A highly rated option for shoppers researching ${topic.toLowerCase()}.`,
      link: "#"
    },
    {
      title: "Top Pick Option 2",
      description: `A strong value choice with balanced features and broad appeal.`,
      link: "#"
    },
    {
      title: "Top Pick Option 3",
      description: `A budget-friendlier option for buyers who still want solid performance.`,
      link: "#"
    }
  ];
}

export function buildGuide(topic) {
  const slug = createSlug(topic);
  const category = inferCategory(topic);

  return {
    slug,
    title: topic,
    description: buildDescription(topic),
    intro: buildIntro(topic),
    buyingGuide: buildBuyingGuide(topic),
    faqQuestion: buildFaqQuestion(topic),
    faqAnswer: buildFaqAnswer(topic),
    category,
    featured: false,
    products: buildProducts(topic)
  };
}
