export type Order = Readonly<{
  orderId: string;
  totalMinor: bigint;
  placedAt: Date;
  labels: readonly string[];
}>;

type DecodeResult =
  | Readonly<{ ok: true; value: Order }>
  | Readonly<{ ok: false; issues: readonly string[] }>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isIsoTimestamp(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) return false;
  const parsed = new Date(value);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString() === value;
}

export function encodeOrder(order: Order): string {
  return JSON.stringify({
    schemaVersion: 1,
    orderId: order.orderId,
    totalMinor: order.totalMinor.toString(10),
    placedAt: order.placedAt.toISOString(),
    labels: [...order.labels],
  });
}

export function decodeOrder(payload: string): DecodeResult {
  let value: unknown;

  try {
    value = JSON.parse(payload);
  } catch {
    return { ok: false, issues: ["Payload is not valid JSON."] };
  }

  if (!isRecord(value)) return { ok: false, issues: ["Payload must be a JSON object."] };

  const issues: string[] = [];
  if (value.schemaVersion !== 1) issues.push("schemaVersion must be 1.");
  if (typeof value.orderId !== "string" || value.orderId.length === 0) issues.push("orderId must be a non-empty string.");
  if (typeof value.totalMinor !== "string" || !/^-?(0|[1-9]\d*)$/.test(value.totalMinor)) {
    issues.push("totalMinor must be a decimal integer string.");
  }
  if (!isIsoTimestamp(value.placedAt)) issues.push("placedAt must be an ISO 8601 timestamp.");
  if (!Array.isArray(value.labels) || !value.labels.every((label) => typeof label === "string")) {
    issues.push("labels must contain only strings.");
  }

  if (issues.length > 0) return { ok: false, issues };

  return {
    ok: true,
    value: {
      orderId: value.orderId as string,
      totalMinor: BigInt(value.totalMinor as string),
      placedAt: new Date(value.placedAt as string),
      labels: value.labels as string[],
    },
  };
}
