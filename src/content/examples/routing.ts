export type RouteDefinition = Readonly<{
  id: string;
  method: string;
  pattern: string;
}>;

export type DispatchResult =
  | Readonly<{ kind: "matched"; routeId: string; params: Readonly<Record<string, string>>; headOnly: boolean }>
  | Readonly<{ kind: "method-not-allowed"; allowedMethods: readonly string[] }>
  | Readonly<{ kind: "not-found" }>;

type PathMatch = Readonly<{
  route: RouteDefinition;
  params: Readonly<Record<string, string>>;
  score: number;
}>;

function segments(value: string) {
  if (value === "/") return [];
  return value.replace(/^\/+|\/+$/g, "").split("/");
}

function matchPath(route: RouteDefinition, pathname: string): PathMatch | undefined {
  const patternSegments = segments(route.pattern);
  const pathSegments = segments(pathname);
  if (patternSegments.length !== pathSegments.length) return undefined;

  const params: Record<string, string> = {};
  let score = 0;

  for (let index = 0; index < patternSegments.length; index += 1) {
    const expected = patternSegments[index];
    const actual = pathSegments[index];

    if (expected.startsWith(":")) {
      const name = expected.slice(1);
      if (!name || name in params) return undefined;

      try {
        params[name] = decodeURIComponent(actual);
      } catch {
        return undefined;
      }
      score += 1;
      continue;
    }

    if (expected !== actual) return undefined;
    score += 10;
  }

  return { route, params, score };
}

function allowedMethods(matches: readonly PathMatch[]) {
  const allowed = new Set(matches.map(({ route }) => route.method.toUpperCase()));
  if (allowed.has("GET")) allowed.add("HEAD");
  return [...allowed].sort();
}

export function dispatch(
  routes: readonly RouteDefinition[],
  requestMethod: string,
  pathname: string,
): DispatchResult {
  const matches = routes
    .map((route) => matchPath(route, pathname))
    .filter((match): match is PathMatch => match !== undefined)
    .sort((left, right) => right.score - left.score);

  if (matches.length === 0) return { kind: "not-found" };

  const mostSpecific = matches.filter((match) => match.score === matches[0].score);
  const method = requestMethod.toUpperCase();
  const selected = mostSpecific.find(({ route }) => {
    const routeMethod = route.method.toUpperCase();
    return routeMethod === method || (method === "HEAD" && routeMethod === "GET");
  });

  if (!selected) {
    return { kind: "method-not-allowed", allowedMethods: allowedMethods(mostSpecific) };
  }

  return {
    kind: "matched",
    routeId: selected.route.id,
    params: selected.params,
    headOnly: method === "HEAD",
  };
}
