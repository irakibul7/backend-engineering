import { describe, expect, it } from "vitest";
import {
  createInitialJourney,
  JOURNEY_STAGES,
  lookupRoute,
  nextJourney,
  parseIpv4,
  previousJourney,
  selectJourneyStage,
  type RouteInput,
} from "./model";

const routes = [
  { prefix: "0.0.0.0", prefixLength: 0, nextHop: "192.0.2.1", interfaceName: "eth0", metric: 100 },
  { prefix: "203.0.0.0", prefixLength: 8, nextHop: "198.51.100.1", interfaceName: "eth1", metric: 50 },
  { prefix: "203.0.113.0", prefixLength: 24, nextHop: "198.51.100.2", interfaceName: "eth2", metric: 20 },
  { prefix: "203.0.113.42", prefixLength: 32, nextHop: null, interfaceName: "eth3", metric: 10 },
] satisfies readonly RouteInput[];

describe("IPv4 parsing", () => {
  it("parses canonical addresses into unsigned 32-bit values", () => {
    expect(parseIpv4("203.0.113.42")).toEqual({
      ok: true,
      address: { text: "203.0.113.42", value: 3_405_803_818 },
    });
    expect(parseIpv4("255.255.255.255")).toEqual({
      ok: true,
      address: { text: "255.255.255.255", value: 4_294_967_295 },
    });
  });

  it.each([
    null,
    42,
    "203.0.113",
    "203.0.113.256",
    "203.0.113.-1",
    "203.0.113.042",
    " 203.0.113.42",
    "203.0.113.42 ",
  ])("rejects malformed or non-canonical input: %s", (input) => {
    expect(parseIpv4(input)).toMatchObject({ ok: false });
  });
});

describe("longest-prefix route lookup", () => {
  it("selects the most-specific route across overlapping /0, /8, /24, and /32 entries", () => {
    const result = lookupRoute("203.0.113.42", routes);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.selected.prefix.text).toBe("203.0.113.42");
    expect(result.selected.prefixLength).toBe(32);
    expect(result.candidates.map((route) => route.prefixLength)).toEqual([0, 8, 24, 32]);
    expect(result.reason).toBe("longest-prefix");
  });

  it("uses the smallest metric only when matching prefixes are equally specific", () => {
    const result = lookupRoute("198.51.100.25", [
      { prefix: "198.51.100.0", prefixLength: 24, nextHop: "192.0.2.2", interfaceName: "slow", metric: 80 },
      { prefix: "198.51.100.0", prefixLength: 24, nextHop: "192.0.2.3", interfaceName: "fast", metric: 10 },
    ]);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.selected.interfaceName).toBe("fast");
    expect(result.reason).toBe("metric-tiebreak");
  });

  it("handles high-bit prefixes without signed integer errors", () => {
    const result = lookupRoute("240.10.20.30", [
      { prefix: "0.0.0.0", prefixLength: 0, nextHop: "192.0.2.1", interfaceName: "default", metric: 100 },
      { prefix: "240.0.0.0", prefixLength: 8, nextHop: "192.0.2.2", interfaceName: "high", metric: 20 },
    ]);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.selected.interfaceName).toBe("high");
  });

  it("returns no-route when no prefix matches", () => {
    expect(lookupRoute("203.0.113.42", [
      { prefix: "198.51.100.0", prefixLength: 24, nextHop: null, interfaceName: "eth0", metric: 1 },
    ])).toEqual({ ok: false, reason: "no-route" });
  });

  it.each([
    { prefix: "203.0.113.1", prefixLength: 24, nextHop: null, interfaceName: "eth0", metric: 1 },
    { prefix: "203.0.113.0", prefixLength: 33, nextHop: null, interfaceName: "eth0", metric: 1 },
    { prefix: "203.0.113.0", prefixLength: 24, nextHop: "bad", interfaceName: "eth0", metric: 1 },
    { prefix: "203.0.113.0", prefixLength: 24, nextHop: null, interfaceName: "", metric: 1 },
    { prefix: "203.0.113.0", prefixLength: 24, nextHop: null, interfaceName: "eth0", metric: -1 },
  ] satisfies readonly RouteInput[])("rejects an invalid route fixture", (fixture) => {
    expect(lookupRoute("203.0.113.42", [fixture])).toMatchObject({ ok: false, reason: "invalid-route" });
  });

  it("bounds the route fixture", () => {
    const oversized = Array.from({ length: 65 }, (_, index) => ({
      prefix: "0.0.0.0",
      prefixLength: 0,
      nextHop: null,
      interfaceName: `eth${index}`,
      metric: index,
    }));

    expect(lookupRoute("203.0.113.42", oversized)).toEqual({ ok: false, reason: "too-many-routes" });
  });
});

describe("packet journey reducer", () => {
  it("moves forward, backward, and directly without accumulating animation state", () => {
    const initial = createInitialJourney();
    const transport = nextJourney(initial);
    const routed = selectJourneyStage(transport, "router-lookup");
    const previous = previousJourney(routed);

    expect(initial.stage).toBe("application-data");
    expect(transport.stage).toBe("transport-segment");
    expect(routed.stage).toBe("router-lookup");
    expect(previous).toEqual(selectJourneyStage(initial, "ethernet-frame"));
  });

  it("decrements TTL only at the explicit TTL stage and preserves the destination IP", () => {
    const initial = createInitialJourney();
    const before = selectJourneyStage(initial, "router-lookup");
    const after = selectJourneyStage(initial, "ttl-decrement");

    expect(before.ttl).toBe(64);
    expect(after.ttl).toBe(63);
    expect(after.destinationIp).toEqual(initial.destinationIp);
  });

  it("changes the link envelope after forwarding while keeping semantic state deterministic", () => {
    const initial = createInitialJourney();
    const forwarded = selectJourneyStage(initial, "forwarded-frame");

    expect(forwarded.currentLink).toBe(1);
    expect(forwarded.sourceMac).not.toBe(initial.sourceMac);
    expect(forwarded.destinationMac).not.toBe(initial.destinationMac);
    expect(selectJourneyStage(forwarded, "forwarded-frame")).toEqual(forwarded);
  });

  it("clamps at both journey boundaries", () => {
    const initial = createInitialJourney();
    const delivered = selectJourneyStage(initial, JOURNEY_STAGES.at(-1)!);

    expect(previousJourney(initial)).toEqual(initial);
    expect(nextJourney(delivered)).toEqual(delivered);
  });
});
