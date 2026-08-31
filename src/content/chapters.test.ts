import { describe, expect, it } from "vitest";
import { chapterBySlug, chapterHref, launchChapters, publishedChapters } from "./chapters";

describe("chapter publication model", () => {
  it("keeps all six launch entries while exposing only complete lessons", () => {
    expect(launchChapters).toHaveLength(6);
    expect(publishedChapters.map((chapter) => chapter.number)).toEqual([1, 2, 3, 4]);
    expect(publishedChapters.every((chapter) => chapter.sections?.length)).toBe(true);
  });

  it("does not resolve an unfinished chapter as a lesson route", () => {
    const upcoming = launchChapters.find((chapter) => chapter.number === 5);
    expect(upcoming).toBeDefined();
    expect(chapterHref(upcoming!)).toBe("/#validation-at-trust-boundaries");
    expect(chapterBySlug("validation-at-trust-boundaries")).toBeUndefined();
  });

  it("publishes Chapter 03 with the complete editorial contract", () => {
    const chapter = chapterBySlug("representation-and-serialization");

    expect(chapter).toBeDefined();
    expect(chapter?.sections).toHaveLength(8);
    expect(new Set(chapter?.sections?.map((section) => section.id)).size).toBe(8);
    expect(chapter?.sections?.some((section) => section.visuals?.some((visual) => visual.alternative))).toBe(true);
    expect(chapter?.sections?.some((section) => section.table?.caption.includes("Compatibility matrix"))).toBe(true);
    expect(chapter?.sections?.some((section) => section.code?.filename === "serialization.ts")).toBe(true);
    expect(chapter?.sections?.flatMap((section) => section.questions ?? [])).toHaveLength(4);

    const references = chapter?.sections?.flatMap((section) => section.references ?? []) ?? [];
    expect(references).toHaveLength(6);
    expect(references.every((reference) => reference.url.startsWith("https://"))).toBe(true);
  });

  it("publishes Chapter 04 with its reviewed security-learning contract", () => {
    const chapter = chapterBySlug("identity-authentication-authorization");

    expect(chapter).toBeDefined();
    expect(chapter?.sections).toHaveLength(8);
    expect(chapter?.sections?.flatMap((section) => section.visuals ?? [])).toHaveLength(3);
    expect(chapter?.sections?.some((section) => section.table?.caption.includes("authorization matrix"))).toBe(true);
    expect(chapter?.sections?.some((section) => section.code?.filename === "session-policy.ts")).toBe(true);
    expect(chapter?.sections?.some((section) => section.code?.filename === "authorization.ts")).toBe(true);
    expect(chapter?.sections?.flatMap((section) => section.questions ?? [])).toHaveLength(4);

    const references = chapter?.sections?.flatMap((section) => section.references ?? []) ?? [];
    expect(references).toHaveLength(6);
    expect(references.every((reference) => reference.url.startsWith("https://"))).toBe(true);
  });

  it("keeps every lesson table structurally valid", () => {
    for (const chapter of publishedChapters) {
      for (const section of chapter.sections ?? []) {
        if (!section.table) continue;
        expect(section.table.columns.length).toBeGreaterThan(1);
        expect(section.table.rows.every((row) => row.length === section.table?.columns.length)).toBe(true);
      }
    }
  });

  it("gives every published chapter at least two accessible explanatory visuals", () => {
    for (const chapter of publishedChapters) {
      const visuals = chapter.sections?.flatMap((section) => section.visuals ?? []) ?? [];

      expect(visuals.length, chapter.title).toBeGreaterThanOrEqual(2);
      expect(visuals.every((visual) => visual.label.trim().length > 0), chapter.title).toBe(true);
      expect(visuals.every((visual) => visual.alternative.trim().length > 40), chapter.title).toBe(true);
      expect(new Set(visuals.map((visual) => visual.label)).size, chapter.title).toBe(visuals.length);
    }
  });
});
