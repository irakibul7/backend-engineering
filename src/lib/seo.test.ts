import { afterEach, describe, expect, it } from "vitest";
import { publishedChapters } from "../content/chapters";
import { applyDocumentMetadata, getSeoMetadata, getSeoRoutes, SITE_URL } from "./seo";

describe("SEO metadata", () => {
  afterEach(() => document.head.querySelector("#route-structured-data")?.remove());

  it("generates indexable canonical metadata for every public route", () => {
    const routes = getSeoRoutes(publishedChapters);

    expect(routes.map((route) => route.path)).toEqual([
      "/",
      "/roadmap/",
      "/chapters/http-as-a-state-machine/",
      "/chapters/routing-and-request-dispatch/",
      "/chapters/representation-and-serialization/",
      "/chapters/identity-authentication-authorization/",
    ]);
    expect(routes.every((route) => route.robots.startsWith("index"))).toBe(true);
  });

  it("marks unknown and unfinished lesson routes noindex", () => {
    expect(getSeoMetadata("/chapters/validation-at-trust-boundaries", publishedChapters)).toMatchObject({
      robots: "noindex, nofollow",
      title: "Page not found — Backend Engineering",
    });
  });

  it("updates route-specific document metadata after client navigation", () => {
    applyDocumentMetadata("/chapters/routing-and-request-dispatch", publishedChapters);

    expect(document.title).toBe("Routing and Request Dispatch — Backend Engineering");
    expect(document.head.querySelector('link[rel="canonical"]')).toHaveAttribute("href", `${SITE_URL}/chapters/routing-and-request-dispatch/`);
    expect(document.head.querySelector('meta[property="og:type"]')).toHaveAttribute("content", "article");
    expect(document.head.querySelector('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image");
    expect(document.head.querySelector("#route-structured-data")?.textContent).toContain("TechArticle");
  });
});
