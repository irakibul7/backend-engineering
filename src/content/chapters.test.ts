import { describe, expect, it } from "vitest";
import { chapterBySlug, chapterHref, launchChapters, publishedChapters } from "./chapters";

describe("chapter publication model", () => {
  it("keeps all six launch entries while exposing only complete lessons", () => {
    expect(launchChapters).toHaveLength(6);
    expect(publishedChapters.map((chapter) => chapter.number)).toEqual([1, 2]);
    expect(publishedChapters.every((chapter) => chapter.sections?.length)).toBe(true);
  });

  it("does not resolve an unfinished chapter as a lesson route", () => {
    const upcoming = launchChapters.find((chapter) => chapter.number === 3);
    expect(upcoming).toBeDefined();
    expect(chapterHref(upcoming!)).toBe("/#representation-and-serialization");
    expect(chapterBySlug("representation-and-serialization")).toBeUndefined();
  });
});
