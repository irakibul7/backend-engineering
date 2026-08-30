#!/usr/bin/env node
import { chapters, publishedChapters } from "../src/content/chapters.ts";
import { getSeoRoutes, SITE_URL } from "../src/lib/seo.ts";

const baseUrl = new URL(process.argv[2] ?? "http://127.0.0.1:4176/");
const internalPaths = [
  ...getSeoRoutes(publishedChapters).map((route) => route.path),
  "/favicon.svg",
  "/favicon-32x32.png",
  "/apple-touch-icon.png",
  "/icon-192.png",
  "/icon-512.png",
  "/manifest.webmanifest",
  "/social-cover.png",
  "/sitemap.xml",
  "/robots.txt",
];

const externalUrls = new Set([
  ...chapters.flatMap((chapter) => chapter.sections?.flatMap((section) => section.references?.map((reference) => reference.url) ?? []) ?? []),
]);

const urls = [
  ...internalPaths.map((pathname) => new URL(pathname, baseUrl).href),
  ...externalUrls,
];

const results = await Promise.all(urls.map(async (url) => {
  try {
    const response = await fetch(url, {
      headers: { "user-agent": "BackendEngineeringLinkCheck/1.0" },
      redirect: "follow",
      signal: AbortSignal.timeout(20_000),
    });
    return { url, status: response.status, ok: response.status < 400 };
  } catch (error) {
    return { url, status: 0, ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}));

const failures = results.filter((result) => !result.ok);
for (const result of results) {
  console.log(`${result.ok ? "PASS" : "FAIL"} ${result.status || "ERR"} ${result.url}${result.error ? ` — ${result.error}` : ""}`);
}

if (failures.length > 0) {
  console.error(`${failures.length} broken link${failures.length === 1 ? "" : "s"} detected.`);
  process.exitCode = 1;
} else {
  console.log(`Verified ${results.length} links with no failures. Canonical origin: ${SITE_URL}`);
}
