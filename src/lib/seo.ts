import type { Chapter } from "../content/chapters";

export const SITE_URL = "https://backend.therakibul.me";
export const SITE_NAME = "Backend Engineering";
export const SOCIAL_IMAGE_URL = `${SITE_URL}/social-cover.png`;

export type SeoMetadata = Readonly<{
  path: string;
  title: string;
  description: string;
  type: "website" | "article";
  robots: "index, follow, max-image-preview:large" | "noindex, nofollow";
  jsonLd: Readonly<Record<string, unknown>>;
}>;

function canonicalPath(pathname: string) {
  if (pathname === "/") return "/";
  return `/${pathname.split("/").filter(Boolean).join("/")}/`;
}

function personSchema() {
  return {
    "@type": "Person",
    name: "Rakibul Islam",
    url: "https://therakibul.me",
  };
}

function lessonMetadata(chapter: Chapter): SeoMetadata {
  const path = `/chapters/${chapter.slug}/`;
  const minutes = chapter.duration.match(/\d+/)?.[0];
  return {
    path,
    title: `${chapter.title} — Backend Engineering`,
    description: chapter.summary,
    type: "article",
    robots: "index, follow, max-image-preview:large",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "TechArticle",
      headline: chapter.title,
      description: chapter.summary,
      url: `${SITE_URL}${path}`,
      author: personSchema(),
      isPartOf: { "@type": "WebSite", name: SITE_NAME, url: `${SITE_URL}/` },
      proficiencyLevel: "Beginner",
      ...(minutes ? { timeRequired: `PT${minutes}M` } : {}),
    },
  };
}

export function getSeoRoutes(publishedChapters: readonly Chapter[]): SeoMetadata[] {
  return [
    {
      path: "/",
      title: "Backend Engineering — Rakibul Islam",
      description: "A practical field guide to reliable backend systems, protocols, data, security, and production delivery by Rakibul Islam.",
      type: "website",
      robots: "index, follow, max-image-preview:large",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: SITE_NAME,
        url: `${SITE_URL}/`,
        description: "A practical field guide to reliable backend systems by Rakibul Islam.",
        author: personSchema(),
      },
    },
    {
      path: "/roadmap/",
      title: "Backend Engineering Roadmap — Rakibul Islam",
      description: "Explore the public Backend Engineering curriculum across APIs, durable data, reliability, security, scaling, delivery, and real-time systems.",
      type: "website",
      robots: "index, follow, max-image-preview:large",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Backend Engineering Roadmap",
        url: `${SITE_URL}/roadmap/`,
        isPartOf: { "@type": "WebSite", name: SITE_NAME, url: `${SITE_URL}/` },
        author: personSchema(),
      },
    },
    ...publishedChapters.map(lessonMetadata),
  ];
}

export function getSeoMetadata(pathname: string, publishedChapters: readonly Chapter[]): SeoMetadata {
  const path = canonicalPath(pathname);
  const metadata = getSeoRoutes(publishedChapters).find((route) => route.path === path);
  if (metadata) return metadata;

  return {
    path,
    title: `Page not found — ${SITE_NAME}`,
    description: "This Backend Engineering page is not available.",
    type: "website",
    robots: "noindex, nofollow",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: `Page not found — ${SITE_NAME}`,
      url: `${SITE_URL}${path}`,
    },
  };
}

function setMeta(selector: string, attribute: "name" | "property", key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.append(element);
  }
  element.content = content;
}

export function applyDocumentMetadata(pathname: string, publishedChapters: readonly Chapter[]) {
  const metadata = getSeoMetadata(pathname, publishedChapters);
  const canonicalUrl = `${SITE_URL}${metadata.path}`;

  document.title = metadata.title;
  setMeta('meta[name="description"]', "name", "description", metadata.description);
  setMeta('meta[name="robots"]', "name", "robots", metadata.robots);
  setMeta('meta[property="og:site_name"]', "property", "og:site_name", SITE_NAME);
  setMeta('meta[property="og:type"]', "property", "og:type", metadata.type);
  setMeta('meta[property="og:title"]', "property", "og:title", metadata.title);
  setMeta('meta[property="og:description"]', "property", "og:description", metadata.description);
  setMeta('meta[property="og:url"]', "property", "og:url", canonicalUrl);
  setMeta('meta[property="og:image"]', "property", "og:image", SOCIAL_IMAGE_URL);
  setMeta('meta[property="og:image:width"]', "property", "og:image:width", "1200");
  setMeta('meta[property="og:image:height"]', "property", "og:image:height", "630");
  setMeta('meta[property="og:image:alt"]', "property", "og:image:alt", "Backend Engineering field guide by Rakibul Islam");
  setMeta('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");
  setMeta('meta[name="twitter:title"]', "name", "twitter:title", metadata.title);
  setMeta('meta[name="twitter:description"]', "name", "twitter:description", metadata.description);
  setMeta('meta[name="twitter:image"]', "name", "twitter:image", SOCIAL_IMAGE_URL);

  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.append(canonical);
  }
  canonical.href = canonicalUrl;

  let structuredData = document.head.querySelector<HTMLScriptElement>("#route-structured-data");
  if (!structuredData) {
    structuredData = document.createElement("script");
    structuredData.id = "route-structured-data";
    structuredData.type = "application/ld+json";
    document.head.append(structuredData);
  }
  structuredData.text = JSON.stringify(metadata.jsonLd).replaceAll("<", "\\u003c");
}
