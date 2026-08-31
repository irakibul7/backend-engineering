export type Ipv4Address = Readonly<{ value: number; text: string }>;

export type RouteInput = Readonly<{
  prefix: unknown;
  prefixLength: unknown;
  nextHop: unknown;
  interfaceName: unknown;
  metric: unknown;
}>;

export type Route = Readonly<{
  prefix: Ipv4Address;
  prefixLength: number;
  nextHop: Ipv4Address | null;
  interfaceName: string;
  metric: number;
}>;

export type RouteDecision = Readonly<{
  candidates: readonly Route[];
  selected: Route;
  reason: "longest-prefix" | "metric-tiebreak";
}>;

export type RouteLookupResult =
  | Readonly<{ ok: true } & RouteDecision>
  | Readonly<{
      ok: false;
      reason: "invalid-destination" | "invalid-route" | "too-many-routes" | "no-route";
      routeIndex?: number;
    }>;

export type Ipv4ParseResult =
  | Readonly<{ ok: true; address: Ipv4Address }>
  | Readonly<{ ok: false; reason: "not-a-string" | "non-canonical-ipv4" }>;

export const JOURNEY_STAGES = [
  "application-data",
  "transport-segment",
  "ip-packet",
  "next-hop-decision",
  "neighbor-resolution",
  "ethernet-frame",
  "router-lookup",
  "ttl-decrement",
  "forwarded-frame",
  "delivered",
] as const;

export type JourneyStage = (typeof JOURNEY_STAGES)[number];

export type PacketJourney = Readonly<{
  stage: JourneyStage;
  stageIndex: number;
  sourceIp: Ipv4Address;
  destinationIp: Ipv4Address;
  ttl: number;
  currentLink: 0 | 1 | 2;
  routeDecision: RouteDecision | null;
  neighborMac: string | null;
  sourceMac: string;
  destinationMac: string;
}>;

const MAX_ROUTES = 64;
const OCTET_PATTERN = /^(0|[1-9]\d{0,2})$/;
const INTERFACE_PATTERN = /^[a-zA-Z][a-zA-Z0-9._-]{0,31}$/;

export function parseIpv4(input: unknown): Ipv4ParseResult {
  if (typeof input !== "string") return { ok: false, reason: "not-a-string" };

  const parts = input.split(".");
  if (parts.length !== 4 || parts.some((part) => !OCTET_PATTERN.test(part))) {
    return { ok: false, reason: "non-canonical-ipv4" };
  }

  const octets = parts.map(Number);
  if (octets.some((octet) => octet > 255)) {
    return { ok: false, reason: "non-canonical-ipv4" };
  }

  const value = (
    octets[0] * 0x1000000
    + octets[1] * 0x10000
    + octets[2] * 0x100
    + octets[3]
  ) >>> 0;

  return { ok: true, address: { value, text: input } };
}

function prefixMask(prefixLength: number): number {
  if (prefixLength === 0) return 0;
  return (0xffffffff << (32 - prefixLength)) >>> 0;
}

function parseRoute(input: RouteInput): Route | null {
  const prefix = parseIpv4(input.prefix);
  const nextHop = input.nextHop === null ? null : parseIpv4(input.nextHop);
  const prefixLength = input.prefixLength;
  const metric = input.metric;

  if (!prefix.ok) return null;
  if (nextHop !== null && !nextHop.ok) return null;
  if (!Number.isInteger(prefixLength) || typeof prefixLength !== "number" || prefixLength < 0 || prefixLength > 32) return null;
  if (!Number.isInteger(metric) || typeof metric !== "number" || metric < 0 || metric > 65_535) return null;
  if (typeof input.interfaceName !== "string" || !INTERFACE_PATTERN.test(input.interfaceName)) return null;

  const mask = prefixMask(prefixLength);
  if (((prefix.address.value & mask) >>> 0) !== prefix.address.value) return null;

  return {
    prefix: prefix.address,
    prefixLength,
    nextHop: nextHop === null ? null : nextHop.address,
    interfaceName: input.interfaceName,
    metric,
  };
}

function routeMatches(destination: Ipv4Address, route: Route): boolean {
  const mask = prefixMask(route.prefixLength);
  return ((destination.value & mask) >>> 0) === route.prefix.value;
}

export function lookupRoute(destinationInput: unknown, routeInputs: readonly RouteInput[]): RouteLookupResult {
  const destination = parseIpv4(destinationInput);
  if (!destination.ok) return { ok: false, reason: "invalid-destination" };
  if (routeInputs.length > MAX_ROUTES) return { ok: false, reason: "too-many-routes" };

  const routes: Route[] = [];
  for (const [routeIndex, input] of routeInputs.entries()) {
    const route = parseRoute(input);
    if (!route) return { ok: false, reason: "invalid-route", routeIndex };
    routes.push(route);
  }

  const candidates = routes.filter((route) => routeMatches(destination.address, route));
  if (candidates.length === 0) return { ok: false, reason: "no-route" };

  const greatestPrefixLength = Math.max(...candidates.map((route) => route.prefixLength));
  const mostSpecific = candidates.filter((route) => route.prefixLength === greatestPrefixLength);
  const selected = mostSpecific.reduce((best, route) => route.metric < best.metric ? route : best);

  return {
    ok: true,
    candidates,
    selected,
    reason: mostSpecific.length > 1 ? "metric-tiebreak" : "longest-prefix",
  };
}

export const DOCUMENTATION_ROUTES = [
  { prefix: "0.0.0.0", prefixLength: 0, nextHop: "192.0.2.1", interfaceName: "eth0", metric: 100 },
  { prefix: "203.0.113.0", prefixLength: 24, nextHop: "198.51.100.1", interfaceName: "eth1", metric: 20 },
  { prefix: "203.0.113.42", prefixLength: 32, nextHop: "198.51.100.254", interfaceName: "eth2", metric: 10 },
] as const satisfies readonly RouteInput[];

function requiredAddress(text: string): Ipv4Address {
  const result = parseIpv4(text);
  if (!result.ok) throw new Error(`Invalid application-owned IPv4 fixture: ${text}`);
  return result.address;
}

function requiredRouteDecision(): RouteDecision {
  const result = lookupRoute("203.0.113.42", DOCUMENTATION_ROUTES);
  if (!result.ok) throw new Error(`Invalid application-owned route fixture: ${result.reason}`);
  return result;
}

function journeyAt(stage: JourneyStage): PacketJourney {
  const stageIndex = JOURNEY_STAGES.indexOf(stage);
  const hasNeighbor = stageIndex >= JOURNEY_STAGES.indexOf("neighbor-resolution");
  const hasRoute = stageIndex >= JOURNEY_STAGES.indexOf("router-lookup");
  const decremented = stageIndex >= JOURNEY_STAGES.indexOf("ttl-decrement");
  const forwarded = stageIndex >= JOURNEY_STAGES.indexOf("forwarded-frame");
  const delivered = stage === "delivered";

  return {
    stage,
    stageIndex,
    sourceIp: requiredAddress("192.0.2.10"),
    destinationIp: requiredAddress("203.0.113.42"),
    ttl: decremented ? 63 : 64,
    currentLink: delivered ? 2 : forwarded ? 1 : 0,
    routeDecision: hasRoute ? requiredRouteDecision() : null,
    neighborMac: hasNeighbor ? "02:00:00:00:01:01" : null,
    sourceMac: forwarded ? "02:00:00:00:01:01" : "02:00:00:00:00:10",
    destinationMac: forwarded ? "02:00:00:00:02:01" : "02:00:00:00:01:01",
  };
}

export function createInitialJourney(): PacketJourney {
  return journeyAt(JOURNEY_STAGES[0]);
}

export function selectJourneyStage(_current: PacketJourney, stage: JourneyStage): PacketJourney {
  return journeyAt(stage);
}

export function nextJourney(current: PacketJourney): PacketJourney {
  const nextIndex = Math.min(current.stageIndex + 1, JOURNEY_STAGES.length - 1);
  return journeyAt(JOURNEY_STAGES[nextIndex]);
}

export function previousJourney(current: PacketJourney): PacketJourney {
  const previousIndex = Math.max(current.stageIndex - 1, 0);
  return journeyAt(JOURNEY_STAGES[previousIndex]);
}
