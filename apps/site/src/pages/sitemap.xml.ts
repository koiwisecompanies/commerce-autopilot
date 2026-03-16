import { getAllGuides } from "../lib/guides.js";
import { getAllCategories } from "../lib/categories.js";
import { getGuideUrl, getCategoryUrl } from "../lib/routes.js";

export async function GET() {
  const guides = getAllGuides();
  const categories = getAllCategories();

  const urls = [
    "/",
    "/guides",
    ...categories.map((category) => getCategoryUrl(category.slug)),
    ...guides.map((guide) => getGuideUrl(guide.slug))
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>http://localhost:4321${url}</loc>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8"
    }
  });
}
