import type { LessonSection } from "../types";

export const routingSections: LessonSection[] = [
  {
    id: "route-as-decision-table",
    number: "01",
    title: "A route is a decision rule",
    introduction: "Routing turns request control data into one deliberate handler choice. The useful mental model is a decision table, not a folder of callbacks.",
    paragraphs: [
      "A request arrives with a method and a target. The router parses the target, compares its pathname with known patterns, applies a precedence policy, and then checks which methods the winning path accepts. Only after those decisions should it invoke application code.",
      "Keeping path selection separate from method selection preserves information. If no path matches, the resource is unknown. If a path matches but the method does not, the resource is known and the client chose an unsupported operation. Those failures have different HTTP meanings and different debugging signals.",
    ],
    callout: {
      label: "First principle",
      body: "A router is a deterministic function from method plus parsed pathname to either one handler, a method rejection, or no route.",
    },
  },
  {
    id: "parse-before-match",
    number: "02",
    title: "Parse the target before matching",
    introduction: "The request target can contain a path, query, and encoded characters. Matching the raw string makes unrelated concerns collide.",
    paragraphs: [
      "In a Node.js server, request.url is normally relative. Construct a WHATWG URL with a trusted base, route on url.pathname, and read url.searchParams separately. Then /orders/42 and /orders/42?expand=items select the same route while still carrying different query input.",
      "Parsing is not validation. Parameters remain untrusted strings. Decode each path value exactly once, reject malformed encoding, and never concatenate a routed value into a filesystem path. Normalization choices such as trailing slashes and case sensitivity are public API policy and should be decided before routes are registered.",
    ],
    code: {
      filename: "request-target.ts",
      source: `export function parseRequestTarget(target: string | undefined) {
  const url = new URL(target ?? "/", "http://service.local");

  return {
    pathname: url.pathname,
    query: url.searchParams,
  };
}`,
    },
  },
  {
    id: "specificity-and-precedence",
    number: "03",
    title: "Precedence is part of the API contract",
    introduction: "Two patterns can match the same pathname. A production router must resolve that ambiguity by policy rather than by accident.",
    paragraphs: [
      "For /users/me, both /users/me and /users/:userId are plausible matches. A clear policy ranks literal segments above parameter segments and parameters above a wildcard. The most specific path wins before method dispatch, so adding an unrelated registration cannot silently redirect traffic.",
      "Registration order can still be an intentional policy, but then it becomes a risky part of the public contract. Prefer rejecting equally specific collisions during startup. Failing before the server accepts traffic is cheaper than discovering that one handler shadows another in production.",
    ],
    visuals: [
      {
        kind: "ladder",
        label: "Route specificity for GET /users/me",
        request: "GET /users/me",
        entries: [
          { rank: "01", pattern: "/users/me", result: "Two literal segments", selected: true },
          { rank: "02", pattern: "/users/:userId", result: "One literal, one parameter" },
          { rank: "03", pattern: "/users/*", result: "One literal, one wildcard" },
        ],
        alternative: "For GET slash users slash me, the literal route ranks first, the parameter route ranks second, and the wildcard ranks third. The literal route is selected because it is the most specific match.",
      },
    ],
    checklist: [
      "Give every route a stable route ID for logs and metrics.",
      "Rank literal segments above parameters and wildcards.",
      "Fail startup when the same method and effective pattern collide.",
      "Test static-versus-parameter overlaps such as /users/me and /users/:userId.",
    ],
  },
  {
    id: "parameters-are-input",
    number: "04",
    title: "Path parameters are still untrusted input",
    introduction: "A successful pattern match proves only that the request has the expected shape. It proves nothing about the value or the resource behind it.",
    paragraphs: [
      "A parameter matcher should return a plain record such as { userId: \"42\" }. The boundary layer can then validate syntax, the application layer can apply business rules, and the repository can determine whether the resource exists. Combining these steps inside the router makes 400, 404, and authorization failures hard to distinguish.",
      "Keep parameter names unique within a pattern and define whether empty segments are legal. Decode failures belong at the request boundary. Domain parsing belongs after dispatch, where an error can mention the selected route without logging sensitive raw input.",
    ],
    callout: {
      label: "Boundary rule",
      body: "Matched is not valid, authorized, or found. It means only that the pathname selected a route shape.",
    },
  },
  {
    id: "method-dispatch",
    number: "05",
    title: "Separate 404 from 405",
    introduction: "Method dispatch should preserve the difference between an unknown target and a known target that rejects the requested operation.",
    paragraphs: [
      "After selecting the most specific path, look for the requested method among that path's handlers. If none accepts it, return 405 Method Not Allowed and include an Allow header listing the methods the target supports. If no pattern matched at all, return 404 Not Found.",
      "HEAD can deliberately reuse GET selection while suppressing the response body. Make that policy explicit and include HEAD in Allow when GET supplies the representation. Do not let a less-specific parameter route capture a method rejected by a more-specific literal route.",
    ],
    visuals: [
      {
        kind: "decision",
        label: "Preserving 404 and 405 during dispatch",
        question: "What did the routing decision establish?",
        outcomes: [
          { condition: "No path pattern", result: "404 Not Found", detail: "The target is not represented by the route table." },
          { condition: "Path, no method", result: "405 + Allow", detail: "The target exists, but this operation is unsupported." },
          { condition: "Path + method", result: "Invoke handler", detail: "Attach route ID and parameters to request context." },
        ],
        alternative: "No matching path produces 404. A matching path without the requested method produces 405 and an Allow header. A matching path and method invokes exactly one handler.",
      },
    ],
    code: {
      filename: "routing.ts",
      source: `const result = dispatch(routes, request.method ?? "GET", url.pathname);

if (result.kind === "method-not-allowed") {
  response.writeHead(405, { allow: result.allowedMethods.join(", ") });
  response.end();
  return;
}

if (result.kind === "not-found") {
  response.writeHead(404).end();
  return;
}

await handlers[result.routeId](result.params);`,
    },
  },
  {
    id: "request-context",
    number: "06",
    title: "Carry context without global state",
    introduction: "Once dispatch selects a route, downstream code needs request-scoped facts without threading a growing argument through every function.",
    paragraphs: [
      "Create a small immutable context containing a request ID, start time, route ID, and matched parameters. Authentication can add a principal later at the boundary that establishes identity. Keep request bodies, credentials, and other large or sensitive values out of ambient context.",
      "Node.js AsyncLocalStorage can propagate that store through callbacks and promise chains. Use run() to scope the value to one request and automatically restore the previous context afterward. This keeps concurrent requests isolated while allowing logs to read correlation data close to the event they record.",
    ],
    code: {
      filename: "request-context.ts",
      source: `import { AsyncLocalStorage } from "node:async_hooks";

type RequestContext = Readonly<{
  requestId: string;
  routeId: string;
  startedAt: number;
}>;

const requestContext = new AsyncLocalStorage<RequestContext>();

export function withRequestContext<T>(
  context: RequestContext,
  work: () => T,
) {
  return requestContext.run(context, work);
}`,
    },
  },
  {
    id: "debug-the-decision",
    number: "07",
    title: "Debug the routing decision",
    introduction: "Useful router telemetry explains which decision failed without turning logs into a copy of private request data.",
    paragraphs: [
      "Record the normalized method, stable route ID, route template, response status, and elapsed time. Count not-found requests separately from method rejections. A spike in 404 can indicate a broken client path or deploy mismatch; a spike in 405 usually indicates a client and server disagree about the operation contract.",
      "Prefer the template /users/:userId over the concrete pathname /users/8472 in metrics. Templates control cardinality and reduce accidental data exposure. When a route does not match, log only a safely bounded representation of the target and keep query values out of default logs.",
    ],
    checklist: [
      "Confirm the request target was parsed and matching uses pathname only.",
      "Inspect the winning pattern and its specificity score.",
      "Distinguish no path match from a method mismatch.",
      "Verify 405 responses include the correct Allow methods.",
      "Trace the request ID across every asynchronous boundary.",
      "Check that metrics use route templates rather than concrete identifiers.",
    ],
    references: [
      { title: "RFC 9110: HTTP Semantics", url: "https://www.rfc-editor.org/rfc/rfc9110.html" },
      { title: "Node.js URL API", url: "https://nodejs.org/api/url.html" },
      { title: "Node.js HTTP API", url: "https://nodejs.org/api/http.html" },
      { title: "Node.js asynchronous context tracking", url: "https://nodejs.org/api/async_context.html" },
      { title: "Express routing guide", url: "https://expressjs.com/en/guide/routing/" },
    ],
  },
];
