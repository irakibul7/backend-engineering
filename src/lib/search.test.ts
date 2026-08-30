import { describe, expect, it } from "vitest";
import { chapters } from "../content/chapters";
import { searchChapters } from "./search";

describe("searchChapters", () => {
  it("ranks a title match ahead of incidental text", () => {
    const results = searchChapters(chapters, "caching");

    expect(results[0]?.chapter.title).toBe("Caching as Controlled Staleness");
  });

  it("finds roadmap topics by technology tag", () => {
    const results = searchChapters(chapters, "Kafka");

    expect(results[0]?.chapter.number).toBe(23);
    expect(results[0]?.chapter.status).toBe("roadmap");
  });

  it("returns no results for an empty query", () => {
    expect(searchChapters(chapters, "   ")).toEqual([]);
  });
});
