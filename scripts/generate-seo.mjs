#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { publishedChapters } from "../src/content/chapters.ts";
import { getSeoRoutes, SITE_NAME, SITE_URL, SOCIAL_IMAGE_URL } from "../src/lib/seo.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const clientDirectory = path.join(root, "dist", "client");
const indexPath = path.join(clientDirectory, "index.html");
const indexTemplate = await readFile(indexPath, "utf8");
const generatedOn = new Date().toISOString().slice(0, 10);

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function renderSeo(metadata) {
  const canonicalUrl = `${SITE_URL}${metadata.path}`;
  const structuredData = JSON.stringify(metadata.jsonLd).replaceAll("<", "\\u003c");
  return `<!-- SEO:START -->
    <meta name="description" content="${escapeHtml(metadata.description)}" />
    <meta name="robots" content="${metadata.robots}" />
    <link rel="canonical" href="${canonicalUrl}" />
    <meta property="og:site_name" content="${SITE_NAME}" />
    <meta property="og:type" content="${metadata.type}" />
    <meta property="og:title" content="${escapeHtml(metadata.title)}" />
    <meta property="og:description" content="${escapeHtml(metadata.description)}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:image" content="${SOCIAL_IMAGE_URL}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="Backend Engineering field guide by Rakibul Islam" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(metadata.title)}" />
    <meta name="twitter:description" content="${escapeHtml(metadata.description)}" />
    <meta name="twitter:image" content="${SOCIAL_IMAGE_URL}" />
    <meta name="twitter:image:alt" content="Backend Engineering field guide by Rakibul Islam" />
    <script id="route-structured-data" type="application/ld+json">${structuredData}</script>
    <title>${escapeHtml(metadata.title)}</title>
    <!-- SEO:END -->`;
}

function routeFile(pathname) {
  if (pathname === "/") return indexPath;
  return path.join(clientDirectory, ...pathname.split("/").filter(Boolean), "index.html");
}

const routes = getSeoRoutes(publishedChapters);
for (const metadata of routes) {
  const output = indexTemplate.replace(/<!-- SEO:START -->[\s\S]*?<!-- SEO:END -->/, renderSeo(metadata));
  const file = routeFile(metadata.path);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, output, "utf8");
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map((route) => `  <url>
    <loc>${SITE_URL}${route.path}</loc>
    <lastmod>${generatedOn}</lastmod>
  </url>`).join("\n")}
</urlset>
`;

const robots = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;

await writeFile(path.join(clientDirectory, "sitemap.xml"), sitemap, "utf8");
await writeFile(path.join(clientDirectory, "robots.txt"), robots, "utf8");

console.log(`Generated SEO files for ${routes.length} public routes.`);
