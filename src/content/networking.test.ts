import { describe, expect, it } from "vitest";
import { chapterBySlug, publishedChapters } from "./chapters";
import { chapters as catalog } from "./catalog";
import { loadLesson } from "./loadLesson";
import { NETWORK_SCENARIOS } from "../networking/scenarios";

const anchors = ["from-signal-to-frame", "hubs-flood-switches-learn", "why-mac-does-not-scale", "ip-prefixes-and-subnets", "local-or-next-hop", "arp-resolves-a-neighbor", "encapsulation-without-magic", "same-subnet-delivery", "cross-network-delivery", "router-forwarding", "routing-table-as-source-of-truth", "longest-prefix-wins", "when-the-default-route-fails", "from-lan-to-autonomous-systems", "a-container-network-lab", "observe-debug-and-reason"];

describe("Chapter 07 publication contract", () => {
  it("contains every approved anchor with independent early evidence and primary references", () => {
    const chapter = chapterBySlug("networking-and-packet-routing")!;
    expect(chapter.number).toBe(7);
    expect(chapter.sections?.map(section => section.id)).toEqual(anchors);
    for (const section of chapter.sections!) {
      expect(section.paragraphs.length).toBeLessThanOrEqual(2);
      expect(section.table?.rows.length).toBeGreaterThan(0);
      expect(section.references?.length).toBeGreaterThan(0);
    }
  });
  it("keeps every interactive state available in static evidence", () => {
    const text = JSON.stringify(chapterBySlug("networking-and-packet-routing")?.sections);
    for (const scenario of NETWORK_SCENARIOS) for (const step of scenario.steps) expect(text).toContain(step.body);
  });
  it("separates metadata from lesson bodies without losing progress or search anchors", async () => {
    expect(catalog.every(chapter => chapter.sections === undefined)).toBe(true);
    for (const chapter of publishedChapters) {
      const loaded = await loadLesson(chapter.slug);
      expect(loaded?.sections).toEqual(chapter.sections);
      expect(catalog.find(item => item.slug === chapter.slug)?.sectionIndex).toEqual(chapter.sections?.map(({id,title}) => ({id,title})));
    }
    expect(await loadLesson("not-a-chapter")).toBeUndefined();
  });
});
