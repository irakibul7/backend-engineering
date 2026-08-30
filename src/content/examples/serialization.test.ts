import { describe, expect, it } from "vitest";
import { decodeOrder, encodeOrder, type Order } from "./serialization";

const order: Order = {
  orderId: "ord_2048",
  totalMinor: 9_007_199_254_740_993n,
  placedAt: new Date("2026-08-30T10:15:00.000Z"),
  labels: ["priority", "gift"],
};

describe("serialization boundary example", () => {
  it("round-trips values that JSON cannot represent directly", () => {
    const encoded = encodeOrder(order);

    expect(JSON.parse(encoded)).toMatchObject({
      schemaVersion: 1,
      totalMinor: "9007199254740993",
      placedAt: "2026-08-30T10:15:00.000Z",
    });
    expect(decodeOrder(encoded)).toEqual({ ok: true, value: order });
  });

  it("reports malformed JSON without throwing across the boundary", () => {
    expect(decodeOrder('{"orderId":')).toEqual({
      ok: false,
      issues: ["Payload is not valid JSON."],
    });
  });

  it("rejects syntactically valid JSON with an invalid contract", () => {
    expect(decodeOrder(JSON.stringify({
      schemaVersion: 1,
      orderId: "ord_2048",
      totalMinor: 42,
      placedAt: "yesterday",
      labels: ["valid", 7],
    }))).toEqual({
      ok: false,
      issues: [
        "totalMinor must be a decimal integer string.",
        "placedAt must be an ISO 8601 timestamp.",
        "labels must contain only strings.",
      ],
    });
  });

  it("accepts additive unknown fields for forward-compatible JSON readers", () => {
    const wireValue = JSON.parse(encodeOrder(order));
    wireValue.fulfillmentZone = "asia-south";

    expect(decodeOrder(JSON.stringify(wireValue))).toEqual({ ok: true, value: order });
  });

  it("rejects unsupported schema versions before constructing a domain value", () => {
    const wireValue = JSON.parse(encodeOrder(order));
    wireValue.schemaVersion = 2;

    expect(decodeOrder(JSON.stringify(wireValue))).toEqual({
      ok: false,
      issues: ["schemaVersion must be 1."],
    });
  });
});
