const SITE_NAME = "Smart Product Picks";
const SITE_URL = "http://localhost:4321";

export function buildPageTitle(title) {
  return `${title} | ${SITE_NAME}`;
}

export function absoluteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}

export function buildMetadata({
  title,
  description,
  path = "/",
  type = "website"
}) {
  const fullTitle = buildPageTitle(title);
  const canonical = absoluteUrl(path);

  return {
    title: fullTitle,
    description,
    canonical,
    openGraph: {
      title: fullTitle,
      description,
      url: canonical,
      type
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description
    }
  };
}
