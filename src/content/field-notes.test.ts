import { readFileSync } from "node:fs";
import { describe, it, expect } from "vitest";
import { publishedChapters, chapters } from "./chapters";
import { loadLesson } from "./loadLesson";
import { chapters as catalog } from "./catalog";
import { getSeoMetadata } from "../lib/seo";

describe("Field Notes editorial and publication contract", () => {
  for (const chapter of publishedChapters.filter((item) => item.number >= 26)) {
    it(`${chapter.slug} has complete readable content and matching lazy metadata`, async () => {
      expect(chapter.sections).toHaveLength(9);
      expect((await loadLesson(chapter.slug))?.sections).toEqual(chapter.sections);
      expect(catalog.find((item) => item.slug === chapter.slug)?.sectionIndex)
        .toEqual(chapter.sections?.map(({ id, title }) => ({ id, title })));
      const words = chapter.sections!.flatMap((section) => section.paragraphs).join(" ").split(/\s+/).length;
      expect(words).toBeGreaterThan(1200);
      expect(chapter.sections!.filter((section) => section.code).length).toBeGreaterThanOrEqual(3);
      expect(chapter.sections!.flatMap((section) => section.questions ?? []).length).toBeGreaterThanOrEqual(3);
      expect(chapter.sections!.flatMap((section) => section.references ?? []).every((reference) => reference.url.startsWith("https://"))).toBe(true);
      expect(getSeoMetadata(`/chapters/${chapter.slug}/`, publishedChapters).jsonLd).toMatchObject({
        "@type": "TechArticle", author: { name: "Rakibul Islam", url: "https://therakibul.me" },
      });
    });
  }

  it("every learning resource targets a published section, roadmap, or authored lab file", () => {
    for (const chapter of chapters) for (const section of chapter.sections ?? []) for (const link of section.links ?? []) {
      const url = new URL(link.url, "https://backend.therakibul.me");
      if (url.pathname.startsWith("/labs/")) expect(readFileSync(`public${url.pathname}`, "utf8").length).toBeGreaterThan(100);
      else if (url.pathname !== "/roadmap/") {
        const target = publishedChapters.find((item) => `/chapters/${item.slug}/` === url.pathname);
        expect(target, link.url).toBeDefined();
        if (url.hash) expect(target?.sections?.some((item) => item.id === url.hash.slice(1))).toBe(true);
      }
    }
  });

  it("published implementation excerpts match the downloadable source", () => {
    const source = readFileSync("public/labs/field-notes/store.mjs", "utf8");
    for (const chapter of publishedChapters) for (const section of chapter.sections ?? []) {
      if (section.code?.filename.startsWith("store.mjs")) expect(source).toContain(section.code.source);
    }
  });
});
