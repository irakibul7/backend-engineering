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

  it("finds a published chapter by one of its section headings", () => {
    const results = searchChapters(chapters, "round trips");

    expect(results[0]?.chapter.title).toBe("Representation and Serialization");
    expect(results[0]?.chapter.status).toBe("published");
  });

  it("finds Chapter 04 by a security concept inside the lesson", () => {
    const results = searchChapters(chapters, "step-up authentication");

    expect(results[0]?.chapter.title).toBe("Identity, Authentication, and Authorization");
    expect(results[0]?.chapter.status).toBe("published");
  });

  it("returns no results for an empty query", () => {
    expect(searchChapters(chapters, "   ")).toEqual([]);
  });
});
