export type ChapterStatus = "published" | "coming-next" | "roadmap";

type VisualBase = {
  label: string;
  alternative: string;
};

type FlowVisual = VisualBase & {
  kind: "flow";
  stages: { title: string; detail: string }[];
};

type DecisionVisual = VisualBase & {
  kind: "decision";
  question: string;
  outcomes: { condition: string; result: string; detail: string }[];
};

type LadderVisual = VisualBase & {
  kind: "ladder";
  request: string;
  entries: { rank: string; pattern: string; result: string; selected?: boolean }[];
};

type TimelineVisual = VisualBase & {
  kind: "timeline";
  phases: { marker: string; title: string; detail: string }[];
};

export type LessonVisual = FlowVisual | DecisionVisual | LadderVisual | TimelineVisual;

export type LessonSection = {
  id: string;
  number: string;
  title: string;
  introduction: string;
  paragraphs: string[];
  callout?: { label: string; body: string };
  code?: { filename: string; source: string };
  visuals?: LessonVisual[];
  table?: { caption: string; columns: string[]; rows: string[][] };
  checklist?: string[];
  questions?: string[];
  references?: { title: string; url: string }[];
};

export type Chapter = {
  number: number;
  slug: string;
  title: string;
  duration: string;
  status: ChapterStatus;
  summary: string;
  promise: string;
  tags: string[];
  sections?: LessonSection[];
};

const httpSections: LessonSection[] = [
  {
    id: "protocol-contract",
    number: "01",
    title: "A protocol is a shared contract",
    introduction: "HTTP works because two programs agree on the meaning of a message before either program knows how the other is implemented.",
    paragraphs: [
      "A browser, mobile application, reverse proxy, and application service can all exchange requests because HTTP defines a common vocabulary: method, target, headers, body, and status. TCP carries ordered bytes. HTTP explains what those bytes mean.",
      "That separation is the first useful backend boundary. Transport answers whether bytes arrive. The application protocol answers what operation was requested, how metadata should be interpreted, and whether the result may be cached or retried.",
    ],
    callout: {
      label: "First principle",
      body: "A framework handler is not HTTP. It is one adapter that turns an HTTP message into application behavior.",
    },
  },
  {
    id: "request-lifecycle",
    number: "02",
    title: "Follow one request end to end",
    introduction: "A request becomes easier to debug when you can name every transformation between the client and the handler.",
    paragraphs: [
      "The client resolves a host, establishes a connection, negotiates encryption when HTTPS is used, sends an HTTP message, and waits. A proxy may terminate TLS, attach forwarding metadata, enforce a limit, or route the request before the application sees it.",
      "Inside the service, parsing should happen before validation, authorization before mutation, and serialization after the use case returns. Each boundary can reject the request with a different class of failure, which is why one generic 500 response hides useful information.",
    ],
    visuals: [
      {
        kind: "flow",
        label: "Request ownership from client to use case",
        stages: [
          { title: "Client", detail: "Chooses method, target, headers, and optional body." },
          { title: "Connection edge", detail: "Resolves the host, negotiates TLS, and accepts bytes." },
          { title: "HTTP boundary", detail: "Parses the message and enforces protocol limits." },
          { title: "Policy boundary", detail: "Validates input and authorizes the operation." },
          { title: "Use case", detail: "Runs domain behavior and returns a result." },
        ],
        alternative: "The client constructs an HTTP request, the connection edge establishes transport, the HTTP boundary parses the message, policy code validates and authorizes it, and only then does the application use case run.",
      },
    ],
    code: {
      filename: "server.ts",
      source: `import { createServer } from "node:http";

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", "http://service.local");

  if (request.method === "GET" && url.pathname === "/health") {
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify({ status: "ok" }));
    return;
  }

  response.writeHead(404, { "content-type": "application/problem+json" });
  response.end(JSON.stringify({ title: "Route not found", status: 404 }));
});

server.listen(3000);`,
    },
  },
  {
    id: "method-semantics",
    number: "03",
    title: "Methods carry operational semantics",
    introduction: "GET and POST are not merely route labels. Their standardized properties influence caches, retries, crawlers, and intermediaries.",
    paragraphs: [
      "A safe method is intended not to change server state. An idempotent method may be repeated with the same intended effect. These promises let infrastructure make decisions without understanding your business domain.",
      "GET is safe and idempotent. PUT and DELETE are not safe but are idempotent by definition. POST has no general idempotency promise, so payment and job-creation endpoints often accept a client-generated idempotency key.",
    ],
    checklist: [
      "Use GET only for retrieval and make it free of hidden mutations.",
      "Make PUT replace a known resource or document the narrower contract clearly.",
      "Protect retryable POST operations with an idempotency key and durable result record.",
    ],
  },
  {
    id: "representation",
    number: "04",
    title: "Headers describe the representation",
    introduction: "The body is just bytes until metadata explains how to interpret it.",
    paragraphs: [
      "Content-Type describes the representation being sent. Accept describes representations the client can consume. Content-Encoding describes a transformation such as compression. Confusing these fields produces failures that look like malformed JSON or corrupted text but are really contract mismatches.",
      "Treat content negotiation as part of the public API. Validate request media types, return 415 when the representation is unsupported, and send Vary when a cache must distinguish responses by a request header.",
    ],
    callout: {
      label: "Production consequence",
      body: "If a response changes with Accept-Encoding or Origin, the cache key must vary on that input or one user may receive a response prepared for another context.",
    },
  },
  {
    id: "caching",
    number: "05",
    title: "Caching is a freshness agreement",
    introduction: "An HTTP cache is correct only when the origin and intermediary agree about how long a stored response may be reused.",
    paragraphs: [
      "Cache-Control communicates freshness and sharing rules. Validators such as ETag let a stale cache ask whether its representation changed. A 304 response saves the body transfer while preserving the semantics of a normal successful lookup.",
      "Do not add cache headers only as a performance trick. First decide whether the response is public or private, what data may become stale, and which request properties select a different representation.",
    ],
    visuals: [
      {
        kind: "decision",
        label: "A cache freshness decision",
        question: "Can the stored response satisfy this request?",
        outcomes: [
          { condition: "Fresh", result: "Reuse", detail: "Serve the stored representation without contacting the origin." },
          { condition: "Stale + validator", result: "Revalidate", detail: "Send ETag or Last-Modified; 304 retains the body, 200 replaces it." },
          { condition: "Stale + no validator", result: "Refetch", detail: "Request and store a complete new representation." },
        ],
        alternative: "A fresh cached response is reused immediately. A stale response with a validator is conditionally revalidated, while a stale response without a validator requires a complete origin fetch.",
      },
    ],
    checklist: [
      "Mark personalized responses private or non-storeable.",
      "Use immutable caching only for content-addressed assets.",
      "Pair validators with a stable representation version.",
    ],
  },
  {
    id: "cors",
    number: "06",
    title: "CORS is a browser read policy",
    introduction: "CORS tells a browser whether frontend JavaScript may read a cross-origin response. It is not authentication and it does not stop a server-to-server client.",
    paragraphs: [
      "For some cross-origin requests, the browser sends an OPTIONS preflight describing the intended method and headers. The server replies with the origins, methods, headers, and credential mode it permits. Only then does the browser send the actual request.",
      "A strong configuration derives allowed origins from deployment configuration, returns a specific origin when credentials are enabled, and varies the response by Origin. Wildcards and reflected origins are different security decisions, not interchangeable conveniences.",
    ],
    code: {
      filename: "cors.ts",
      source: `const allowedOrigins = new Set([
  "https://therakibul.me",
  "https://backend.therakibul.me",
]);

export function corsHeaders(origin: string | undefined) {
  if (!origin || !allowedOrigins.has(origin)) return {};

  return {
    "access-control-allow-origin": origin,
    "access-control-allow-credentials": "true",
    vary: "Origin",
  };
}`,
    },
  },
];

const routingSections: LessonSection[] = [
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

const serializationSections: LessonSection[] = [
  {
    id: "values-stop-at-the-boundary",
    number: "01",
    title: "Values stop at the process boundary",
    introduction: "Memory cannot travel across a socket or survive a process restart. Only bytes cross the boundary, so both sides need an agreed way to recover meaning from them.",
    paragraphs: [
      "Inside one process, an order may contain a bigint, a Date, a map, methods, and references to other objects. None of those runtime properties has an automatic network meaning. A serializer maps selected domain values into a representation; an encoder turns that representation into bytes. The receiver reverses those steps under its own version of the contract.",
      "This chapter assumes familiarity with HTTP messages and request routing. Its promise is narrower: given a value and two independently deployed programs, identify what meaning can be preserved, what can be lost, and which changes can be rolled out safely.",
    ],
    visuals: [
      {
        kind: "flow",
        label: "The representation boundary",
        stages: [
          { title: "Domain value", detail: "Useful runtime types and invariants." },
          { title: "Wire model", detail: "Only fields and meanings in the public contract." },
          { title: "Encoded bytes", detail: "UTF-8 text or a defined binary format." },
          { title: "Parser", detail: "Recovers syntax into an untrusted value." },
          { title: "Validated value", detail: "Checks the contract before domain construction." },
        ],
        alternative: "A domain value is mapped to a wire model, encoded as UTF-8 or binary bytes, parsed by another process, validated, and reconstructed as a new domain value.",
      },
    ],
    callout: {
      label: "First principle",
      body: "Serialization does not move an object. It creates bytes from which another program may construct a new value under a shared contract.",
    },
  },
  {
    id: "json-is-not-your-type-system",
    number: "02",
    title: "JSON is syntax, not your type system",
    introduction: "JSON has objects, arrays, strings, numbers, booleans, and null. Your application almost certainly has more kinds of values and stronger rules.",
    paragraphs: [
      "RFC 8259 defines a deliberately small interchange grammar and requires UTF-8 for JSON exchanged outside a closed ecosystem. It does not define dates, decimal money, 64-bit integer semantics, maps with non-string keys, byte arrays, or class identity. Those meanings belong to the application contract, not to the braces and commas.",
      "Interoperability narrows the grammar further. Object names should be unique because parsers disagree about duplicates. Integers outside the exactly interoperable binary64 range can silently change value, so identifiers and large integer amounts should be encoded as strings when exactness matters.",
    ],
    table: {
      caption: "Common runtime values and deliberate JSON representations",
      columns: ["Domain value", "Wire representation", "Required contract"],
      rows: [
        ["Timestamp", "RFC 3339 string", "Timezone and accepted precision"],
        ["Money", "Integer minor units as a string", "Currency and scale"],
        ["Binary data", "Base64 string", "Alphabet, padding, and size limit"],
        ["Absent value", "Omitted member or null", "The two states must not be conflated"],
      ],
    },
  },
  {
    id: "round-trips-are-designed",
    number: "03",
    title: "Round trips must be designed",
    introduction: "JSON.stringify is deterministic enough for many APIs, but it is not a lossless snapshot of a JavaScript object graph.",
    paragraphs: [
      "ECMAScript specifies that undefined and functions disappear from objects, become null in arrays, and produce no JSON text as top-level values. Non-finite numbers become null. BigInt throws unless the application supplies a conversion, while objects may replace themselves through toJSON. A successful call therefore proves only that text was produced, not that the original meaning survived.",
      "A safer encoder builds a dedicated wire value. The example converts minor units to a decimal string, converts the timestamp explicitly, copies the labels, and includes a schema version. The domain type remains convenient inside the process while the wire type remains portable across it.",
    ],
    code: {
      filename: "serialization.ts",
      source: `type Order = Readonly<{
  orderId: string;
  totalMinor: bigint;
  placedAt: Date;
  labels: readonly string[];
}>;

export function encodeOrder(order: Order): string {
  return JSON.stringify({
    schemaVersion: 1,
    orderId: order.orderId,
    totalMinor: order.totalMinor.toString(10),
    placedAt: order.placedAt.toISOString(),
    labels: [...order.labels],
  });
}`,
    },
  },
  {
    id: "decode-in-stages",
    number: "04",
    title: "Decode untrusted bytes in stages",
    introduction: "Parsing answers whether bytes follow a syntax. Validation answers whether the resulting value follows your contract. Construction gives that validated value domain meaning.",
    paragraphs: [
      "Keep those operations separate so each failure is observable. First enforce transport limits and character encoding. Then parse into unknown, require the expected top-level shape, validate every field, and only then construct Date, BigInt, or domain-specific values. A TypeScript assertion changes the compiler's belief; it does not validate a production payload.",
      "The decoder accepts unknown additive fields but rejects an unsupported schema version. That is one explicit compatibility policy. Another service may reject every unknown member for security or regulatory reasons, but the choice must be documented and tested rather than inherited accidentally from a library default.",
    ],
    code: {
      filename: "decode-order.ts",
      source: `export function decodeOrder(payload: string): DecodeResult {
  let value: unknown;

  try {
    value = JSON.parse(payload);
  } catch {
    return { ok: false, issues: ["Payload is not valid JSON."] };
  }

  if (!isRecord(value)) {
    return { ok: false, issues: ["Payload must be a JSON object."] };
  }

  const issues = validateWireOrder(value);
  if (issues.length > 0) return { ok: false, issues };
  return { ok: true, value: toDomainOrder(value) };
}`,
    },
    checklist: [
      "Bound the number of bytes before parsing.",
      "Parse into unknown rather than asserting a domain type.",
      "Report structural failures without echoing secret payload data.",
      "Construct domain values only after the complete wire value is valid.",
    ],
  },
  {
    id: "schema-evolution",
    number: "05",
    title: "Schema evolution is a deployment problem",
    introduction: "A schema change is safe only when old and new readers can coexist with old and new writers during the rollout you actually use.",
    paragraphs: [
      "Compatibility has direction. Backward compatibility means a new reader can consume old data. Forward compatibility means an old reader can consume new data. Distributed deployments usually need both for a period because instances, queues, caches, and stored records do not change version at the same moment.",
      "Treat the matrix below as a rollout starting point, not a substitute for contract tests. JSON safety depends on required-field and unknown-field policy. Protobuf binary safety depends on stable field numbers and wire types; an API can remain wire-compatible while generated application code still needs changes.",
    ],
    visuals: [
      {
        kind: "timeline",
        label: "A compatibility-first schema rollout",
        phases: [
          { marker: "T1", title: "Expand readers", detail: "Deploy code that accepts both the current and next representation." },
          { marker: "T2", title: "Change writers", detail: "Emit the new field or shape only after tolerant readers are live." },
          { marker: "T3", title: "Observe", detail: "Use contract tests and telemetry to confirm the old shape is no longer required." },
          { marker: "T4", title: "Contract", detail: "Remove the legacy read path and reserve retired identifiers." },
        ],
        alternative: "A safe schema rollout first expands readers, then changes writers, observes mixed-version traffic until the old representation is unused, and only then removes the legacy path.",
      },
    ],
    table: {
      caption: "Compatibility matrix for common schema changes",
      columns: ["Change", "JSON", "Protobuf binary", "Safer rollout"],
      rows: [
        ["Add optional field", "Usually safe if old readers ignore unknown members", "Wire-safe; old readers retain or skip the unknown field", "Deploy readers before writers"],
        ["Rename field", "Breaking when the key changes", "Wire-safe only if the field number stays; generated API still changes", "Read both names, write the old name, then migrate"],
        ["Change number to string", "Breaking without a dual-read period", "Unsafe when the wire type changes", "Add a new field and migrate"],
        ["Remove field", "Conditional on every reader treating it as optional", "Wire-safe, but the number and name must be reserved", "Stop reading, stop writing, then reserve"],
        ["Reuse identifier", "Unsafe because old and new meanings collide", "Never reuse a field number", "Allocate a new identifier"],
      ],
    },
    callout: {
      label: "Rollout rule",
      body: "Expand what readers accept before writers emit the new shape; remove the old shape only after every dependent reader has moved.",
    },
  },
  {
    id: "binary-formats-and-protobuf",
    number: "06",
    title: "Binary does not automatically mean better",
    introduction: "A binary format trades human readability for properties such as compactness, typed fields, and faster generated codecs. The right choice depends on the boundary.",
    paragraphs: [
      "A Protobuf binary message encodes records using a field number, wire type, and payload. The schema supplies the field name and declared type that are absent from the bytes. This lets an older parser skip fields it does not know and makes additive evolution practical, but it also makes field numbers permanent protocol identifiers.",
      "Proto3 preserves unknown binary fields when a message is parsed and serialized again. Those fields can still disappear if the message is converted to JSON or copied field by field. Binary compatibility therefore depends on the entire transformation path, not merely on the first parser accepting the bytes.",
    ],
    checklist: [
      "Choose JSON when inspectability and broad client support dominate.",
      "Choose a schema-first binary format when message volume, typed contracts, and controlled clients justify the tooling.",
      "Version the schema in source control and run compatibility checks in CI.",
      "Reserve deleted Protobuf field numbers and names permanently.",
    ],
  },
  {
    id: "representation-decisions",
    number: "07",
    title: "Choose a representation by constraints",
    introduction: "Format selection is a systems decision involving consumers, evolution, latency, storage lifetime, debuggability, and security—not a benchmark contest.",
    paragraphs: [
      "Start with the least powerful representation that preserves the required meaning. Public HTTP APIs often benefit from JSON's ubiquity. Internal high-volume RPC may benefit from generated Protobuf codecs. Logs need stable, queryable fields. Signed payloads need a canonical byte representation because semantically equivalent JSON texts can have different whitespace or member order.",
      "Record content type, size limits, schema ownership, compatibility direction, unknown-field policy, numeric and timestamp rules, and deprecation process beside the contract. Compression is a separate transport decision; it does not repair an ambiguous schema or make an unsafe change compatible.",
    ],
    checklist: [
      "List every producer, consumer, and stored copy of the representation.",
      "Define maximum message size and nesting depth.",
      "Specify exact encodings for timestamps, money, identifiers, and bytes.",
      "Test old-reader/new-writer and new-reader/old-writer combinations.",
      "Canonicalize before hashing or signing; do not sign incidental JSON output.",
    ],
  },
  {
    id: "debug-the-wire-contract",
    number: "08",
    title: "Debug the wire contract",
    introduction: "When decoded data looks wrong, inspect each transformation boundary before blaming the business logic that consumed it.",
    paragraphs: [
      "Capture content type, byte length, schema version, decoder version, and a bounded correlation identifier. Compare the raw bytes with the declared encoding, reproduce parsing with the same library version, and inspect the first field whose representation differs from the contract. Avoid placing complete bodies in logs; payloads often contain credentials or personal data.",
      "The most useful tests keep fixtures produced by both the current and previous schema. Round-trip tests catch lossy mappings. Golden-byte tests catch unintended encoder changes. Cross-version contract tests catch the rollout failures that unit tests against one version cannot see.",
    ],
    checklist: [
      "Confirm the Content-Type and character encoding match the actual bytes.",
      "Check for truncation, compression, framing, and size-limit failures before parsing.",
      "Compare numeric, timestamp, null, absent, and unknown-field policies.",
      "Reproduce with old and new readers against the same captured fixture.",
      "Log schema identifiers and issue codes, never unrestricted payload bodies.",
    ],
    questions: [
      "Which domain values in your current API cannot round-trip through plain JSON without an explicit mapping?",
      "Can an old reader consume a payload from the next deployment, and how is that claim tested?",
      "What data would be lost if a Protobuf message passed through a JSON intermediary?",
      "Which exact bytes are signed when two equivalent representations use different member ordering?",
    ],
    references: [
      { title: "RFC 8259: The JavaScript Object Notation Data Interchange Format", url: "https://www.rfc-editor.org/rfc/rfc8259.html" },
      { title: "RFC 7493: The I-JSON Message Format", url: "https://www.rfc-editor.org/rfc/rfc7493.html" },
      { title: "ECMAScript specification: JSON object", url: "https://tc39.es/ecma262/multipage/structured-data.html#sec-json-object" },
      { title: "Protocol Buffers: Encoding", url: "https://protobuf.dev/programming-guides/encoding/" },
      { title: "Protocol Buffers: Proto 3 language guide", url: "https://protobuf.dev/programming-guides/proto3/" },
      { title: "Protocol Buffers: ProtoJSON format", url: "https://protobuf.dev/programming-guides/json/" },
    ],
  },
];

const identitySections: LessonSection[] = [
  {
    id: "four-separate-questions",
    number: "01",
    title: "One request crosses four security boundaries",
    introduction: "A service cannot safely answer ‘may this request continue?’ with one vague authenticated flag. It needs separate evidence about identity, authentication, session state, and the requested resource.",
    paragraphs: [
      "Identity names a subject. Authentication establishes confidence that a claimant controls an authenticator bound to that subject. A session or token carries the result across requests. Authorization decides whether the resulting principal may perform one action on one resource under the current conditions. Each answer becomes an input to the next boundary, but none replaces it.",
      "Consider a valid session for a member of tenant A requesting document 42. The session can identify the member without proving that document 42 belongs to tenant A, that the member owns it, or that the current assurance is high enough to delete it. The service must load trusted resource attributes and evaluate policy after credential validation, on every request.",
    ],
    visuals: [
      {
        kind: "flow",
        label: "Four decisions on one request",
        stages: [
          { title: "Identity", detail: "Name the subject with an issuer-scoped identifier." },
          { title: "Authentication", detail: "Verify control of a bound authenticator." },
          { title: "Session or token", detail: "Validate current state, scope, type, and time." },
          { title: "Resource context", detail: "Load tenant, owner, classification, and action." },
          { title: "Authorization", detail: "Return an explicit allow or deny decision." },
        ],
        alternative: "The service identifies a subject, verifies authentication evidence, validates the current session or token, loads trusted attributes for the requested resource, and only then makes an explicit authorization decision.",
      },
    ],
    callout: {
      label: "Boundary rule",
      body: "Authentication establishes who is present with some assurance. Authorization still has to decide what that principal may do to this resource now.",
    },
  },
  {
    id: "authenticators-and-assurance",
    number: "02",
    title: "Authenticators provide different kinds of assurance",
    introduction: "An authentication ceremony proves control of an authenticator, not the claimant's honesty, device safety, or permission to access every resource.",
    paragraphs: [
      "Passwords are shared secrets that users can reveal to a convincing impostor and attackers can replay. OTP authenticators reduce dependence on one static secret, but manually entered OTPs remain phishable and replayable during their validity window. Public-key authenticators can bind proof to the verifier's origin, which is why phishing resistance is a property of the protocol rather than the presence of a second screen.",
      "Choose assurance from risk. A low-impact read may accept a baseline session, while exporting sensitive data, deleting a resource, or changing membership may require a recent phishing-resistant step-up. The application should record the resulting assurance and its bounded lifetime rather than infer strength from a role name.",
    ],
    table: {
      caption: "Qualitative authenticator comparison",
      columns: ["Authenticator", "Primary proof", "Replay/phishing concern", "Production implication"],
      rows: [
        ["Password", "Knowledge of a shared secret", "Replayable and readily phished", "Block breached/common values, rate-limit attempts, and never log the secret"],
        ["One-time password", "Possession plus a short-lived code", "A live code can still be relayed or phished", "Accept once, bound its lifetime, and do not label OTP alone phishing-resistant"],
        ["Public-key authenticator", "Possession of a private key and protocol proof", "Can be verifier-name bound", "Prefer for higher-assurance and phishing-resistant flows"],
      ],
    },
    checklist: [
      "Use generic authentication failures so account existence is not disclosed unnecessarily.",
      "Rate-limit failed attempts and monitor abuse without storing supplied credentials.",
      "Treat recovery and authenticator replacement as high-risk authentication events.",
      "Require a fresh step-up for sensitive actions rather than trusting an old login forever.",
    ],
  },
  {
    id: "session-lifecycle",
    number: "03",
    title: "A session is a revocable state machine",
    introduction: "Authentication is an event. A session is the changing server-side policy that decides whether its result can still be used.",
    paragraphs: [
      "A browser receives an opaque, high-entropy bearer value while the service stores only a lookup digest and session metadata. Authentication creates a fresh identifier instead of promoting an anonymous identifier supplied by the browser. Privilege changes rotate it again and invalidate the predecessor, closing the session-fixation path.",
      "Idle and absolute deadlines answer different questions. The idle deadline limits unattended use; the absolute deadline bounds the total lifetime even when requests continue. Logout, compromise response, recovery, and administrative action can revoke earlier. Every lookup must reject expired, revoked, and replaced records before refreshing activity.",
    ],
    visuals: [
      {
        kind: "timeline",
        label: "A session changes state over time",
        phases: [
          { marker: "S0", title: "Anonymous", detail: "No authenticated session exists; browser input has no privileged meaning." },
          { marker: "S1", title: "Active", detail: "Authentication issues a fresh browser value and stores its lookup digest." },
          { marker: "S2", title: "Elevated", detail: "Step-up raises assurance for a bounded period and rotates the identifier." },
          { marker: "S3", title: "Expired", detail: "Idle or absolute time reaches its limit; use fails closed." },
          { marker: "S4", title: "Replaced", detail: "A rotated predecessor remains unusable even if copied earlier." },
          { marker: "S5", title: "Revoked", detail: "Logout, recovery, or compromise response terminates acceptance." },
        ],
        alternative: "A user begins anonymous, receives a fresh active session after authentication, may temporarily step up to elevated assurance, and eventually reaches an unusable expired, replaced, or revoked state. Rotation never makes the predecessor active again.",
      },
    ],
    code: {
      filename: "session-policy.ts",
      source: `export function inspectSession(
  record: SessionRecord,
  now: number,
  idleTimeoutMs: number,
): SessionInspection {
  if (record.revokedAt !== null) {
    return { ok: false, reason: "revoked" };
  }
  if (record.replacedByDigest !== null) {
    return { ok: false, reason: "replaced" };
  }
  if (now >= record.expiresAt) {
    return { ok: false, reason: "absolute-expired" };
  }
  if (now - record.lastSeenAt >= idleTimeoutMs) {
    return { ok: false, reason: "idle-expired" };
  }
  return { ok: true };
}`,
    },
    callout: {
      label: "Example boundary",
      body: "The executable example models lifecycle policy with an injected clock and identifier factory. It deliberately does not implement credential verification, cookies, storage, or cryptography.",
    },
  },
  {
    id: "cookies-and-bearer-tokens",
    number: "04",
    title: "Credential transport changes the threat model",
    introduction: "Cookies and bearer authorization headers can both transport session material. Their delivery rules expose different default failure paths.",
    paragraphs: [
      "A browser automatically attaches a matching cookie according to its domain, path, Secure, and SameSite rules. HttpOnly prevents ordinary script from reading the value but does not stop injected script from sending same-origin requests. Automatic attachment also creates cross-site request-forgery concerns, so SameSite is defense-in-depth rather than a complete substitute for a deliberate CSRF design.",
      "Application code usually attaches a bearer token explicitly. That reduces automatic cross-site sending but makes any script-accessible storage part of the token-theft boundary. Possession normally enables replay, so minimize scope and lifetime, protect transport and storage, and design rotation, revocation, or sender constraint before choosing the format.",
    ],
    table: {
      caption: "Cookie and bearer-token transport responsibilities",
      columns: ["Question", "Secure cookie session", "Explicit bearer token"],
      rows: [
        ["Who attaches it?", "Browser for matching requests", "Client application code"],
        ["Primary browser concern", "CSRF plus same-origin action through XSS", "Theft from script-accessible storage plus XSS"],
        ["Important controls", "Secure, HttpOnly, SameSite, narrow scope, CSRF design", "Short lifetime, narrow audience/scope, protected storage, rotation or sender constraint"],
        ["Revocation shape", "Server-side session status can fail immediately", "Self-contained tokens need bounded life or an online status strategy"],
      ],
    },
    callout: {
      label: "Format is not the policy",
      body: "An opaque cookie can be poorly managed, and a signed token can be over-trusted. Decide lifecycle, transport, scope, and revocation before choosing a credential format.",
    },
  },
  {
    id: "jwt-validation-boundary",
    number: "05",
    title: "A JWT is a claims container, not session magic",
    introduction: "Base64url decoding reveals attacker-controlled fields. Trust begins only after cryptographic verification and the complete application validation profile succeed.",
    paragraphs: [
      "A maintained security library should parse the compact token, reject algorithms outside an explicit allowlist, verify the signature with key material bound to the configured issuer, and enforce structural limits. Application policy must then validate issuer, audience, token type, subject, expiry, not-before time, and mutually exclusive rules for different token kinds. A token for another API or an ID token used as an access token must fail even when its signature is valid.",
      "The example type is intentionally named VerifiedTokenEnvelope: it represents the boundary after library verification, not an object produced by decoding. The helper keeps only allowlisted roles and converts claims into a minimal principal. Resource authorization still occurs afterward because neither a valid signature nor an admin-looking claim proves access to a particular tenant object.",
    ],
    code: {
      filename: "verified-token-policy.ts",
      source: `export function validateVerifiedToken(
  envelope: VerifiedTokenEnvelope,
  policy: TokenPolicy,
  nowSeconds: number,
): TokenValidation {
  const { claims } = envelope;
  if (!policy.algorithms.includes(envelope.algorithm)) {
    return { ok: false, reason: "unexpected-algorithm" };
  }
  if (claims.iss !== policy.issuer) {
    return { ok: false, reason: "wrong-issuer" };
  }
  if (!Array.isArray(claims.aud) ||
      !claims.aud.includes(policy.audience)) {
    return { ok: false, reason: "wrong-audience" };
  }
  if (claims.typ !== policy.type) {
    return { ok: false, reason: "wrong-token-type" };
  }
  return validateTimesAndBuildPrincipal(claims, policy, nowSeconds);
}`,
    },
    checklist: [
      "Configure accepted algorithms; never select trust from an unverified header alone.",
      "Bind verification keys to the expected issuer and validate the intended audience.",
      "Give access, identity, logout, and security-event tokens mutually exclusive validation profiles.",
      "Reject missing or invalid time and subject claims required by your profile.",
      "Never put secrets in a JWT payload; signing does not encrypt its claims.",
    ],
  },
  {
    id: "authorization-per-resource",
    number: "06",
    title: "Authorization is a resource decision",
    introduction: "A role can narrow policy candidates, but the final decision usually needs the action, tenant, resource owner, classification, and current assurance.",
    paragraphs: [
      "The example begins by denying an absent principal and then rejects a tenant mismatch before inspecting ownership or roles. This order prevents an administrator in tenant B from becoming an administrator in tenant A. It also demonstrates why object identifiers from the URL are not authorization evidence: the service must load the resource and compare trusted attributes.",
      "RBAC groups permissions and remains useful for broad responsibilities. ABAC considers subject, resource, action, and environmental attributes. ReBAC captures relationships such as owner-of or member-of. Real policies often combine all three. The essential properties are explicit inputs, deny by default, one enforcement path, and tests for every matrix cell.",
    ],
    visuals: [
      {
        kind: "decision",
        label: "Authorization narrows toward allow",
        question: "May this principal perform this action on this resource now?",
        outcomes: [
          { condition: "Principal absent", result: "Deny", detail: "No authentication context can satisfy a protected operation." },
          { condition: "Tenant differs", result: "Deny", detail: "Reject before role or ownership evaluation." },
          { condition: "No relationship or role rule", result: "Deny", detail: "An unmatched policy never inherits access." },
          { condition: "Assurance too low", result: "Deny", detail: "Sensitive reads and destructive actions require step-up." },
          { condition: "Every gate passes", result: "Allow", detail: "Return the exact policy reason for safe internal audit." },
        ],
        alternative: "Authorization starts with deny. A protected request can reach allow only when a principal exists, the tenant matches, a specific ownership or role rule matches the action and resource, and the current assurance satisfies the operation.",
      },
    ],
    code: {
      filename: "authorization.ts",
      source: `export function authorize(
  { principal, action, resource }: AuthorizationRequest,
): AuthorizationDecision {
  if (!principal) return deny("anonymous");
  if (principal.tenantId !== resource.tenantId) {
    return deny("tenant-mismatch");
  }

  const rule = matchOwnerRoleOrRelationship(
    principal,
    action,
    resource,
  );
  if (!rule) return deny("no-matching-policy");
  if (rule.needsStepUp && principal.assurance !== "elevated") {
    return deny("insufficient-assurance");
  }
  return { allowed: true, reason: rule.reason };
}`,
    },
    table: {
      caption: "Executable authorization matrix for a same-tenant resource",
      columns: ["Principal/context", "Read standard", "Read restricted", "Update", "Delete", "Manage members"],
      rows: [
        ["Anonymous", "Deny", "Deny", "Deny", "Deny", "Deny"],
        ["Member, not owner", "Deny", "Deny", "Deny", "Deny", "Deny"],
        ["Resource owner", "Allow", "Step-up", "Allow", "Step-up", "Deny"],
        ["Support", "Allow", "Deny", "Deny", "Deny", "Deny"],
        ["Tenant admin", "Allow", "Step-up", "Allow", "Step-up", "Step-up"],
        ["Any cross-tenant principal", "Deny", "Deny", "Deny", "Deny", "Deny"],
      ],
    },
  },
  {
    id: "revocation-recovery-and-audit",
    number: "07",
    title: "Security state must be able to move backward",
    introduction: "Systems that can create trust but cannot quickly reduce it turn one stolen credential or mistaken grant into a long-lived incident.",
    paragraphs: [
      "Revocation is a propagation problem. A server-side session can consult current state on each request, while a self-contained access token may remain accepted until expiry unless the service adds an online status or version check. Short token lifetimes reduce the window but do not replace refresh-token rotation, reuse detection, or incident procedures where those risks apply.",
      "Recovery, password change, authenticator replacement, membership removal, and role reduction should identify which sessions and tokens become stale. Audit events need stable subject, tenant, action, resource, decision, policy version, and correlation identifiers—but never passwords, OTPs, session bearer values, complete tokens, or sensitive resource bodies.",
    ],
    table: {
      caption: "State changes and the evidence they should invalidate",
      columns: ["Event", "State transition", "Operational evidence"],
      rows: [
        ["Logout", "Revoke the active session", "Session identifier category, subject, time, outcome"],
        ["Privilege change", "Rotate session and recompute authorization", "Old/new policy version and administrative actor"],
        ["Account recovery", "Revoke affected sessions and require renewed assurance", "Recovery method, notifications, revocation completion"],
        ["Refresh-token replay", "Revoke the token family and investigate", "Family identifier, reuse signal, affected client—never raw token"],
        ["Tenant membership removal", "Deny future resource decisions immediately", "Membership version and enforcement timestamp"],
      ],
    },
    checklist: [
      "Define which events revoke one session, every session, or a token family.",
      "Test propagation delay instead of assuming a revocation write is instantly visible everywhere.",
      "Version authorization policy so an audit decision can be reconstructed.",
      "Keep credential material and sensitive resource content out of logs and traces.",
    ],
  },
  {
    id: "debugging-and-design-review",
    number: "08",
    title: "Debug the boundary that made the decision",
    introduction: "An unexpected 401, 403, or allow result becomes tractable when authentication evidence, session state, resource context, and policy output are inspected separately.",
    paragraphs: [
      "Start with the request correlation identifier and the credential transport mechanism, not the raw credential. Confirm whether authentication failed, the session or token was expired or revoked, the issuer/audience/type profile matched, and a minimal principal was created. Then inspect the trusted resource tenant, owner, classification, requested action, assurance, and policy version used by authorization.",
      "Keep public failures deliberately small. A service may map missing and unauthorized resources to the same response to avoid confirming existence, while internal audit records a safe decision category. Reproduce with deterministic policy fixtures and a controlled clock; do not paste production tokens into logs, tickets, tests, or decoding websites.",
    ],
    checklist: [
      "Distinguish missing credentials, invalid credentials, expired state, and insufficient permission internally.",
      "Confirm the verification key belongs to the expected issuer and the audience names this service.",
      "Load the resource independently and compare its tenant and owner with the principal.",
      "Check idle, absolute, elevated-assurance, and revocation times with one documented clock policy.",
      "Re-run the exact authorization matrix row using sanitized identifiers and the deployed policy version.",
    ],
    questions: [
      "Which decisions in your current service are hidden inside a single authenticated boolean?",
      "What event rotates a session identifier, and can the predecessor still be accepted anywhere?",
      "Can a valid token issued for another audience or token type reach your handlers?",
      "Which test proves that an administrator from one tenant cannot read a guessed resource ID from another tenant?",
    ],
    references: [
      { title: "NIST SP 800-63B-4: Authentication and Authenticator Management", url: "https://pages.nist.gov/800-63-4/sp800-63b.html" },
      { title: "RFC 9700: Best Current Practice for OAuth 2.0 Security", url: "https://www.rfc-editor.org/rfc/rfc9700.html" },
      { title: "RFC 8725: JSON Web Token Best Current Practices", url: "https://www.rfc-editor.org/rfc/rfc8725.html" },
      { title: "OWASP Authentication Cheat Sheet", url: "https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html" },
      { title: "OWASP Session Management Cheat Sheet", url: "https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html" },
      { title: "OWASP Authorization Cheat Sheet", url: "https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html" },
    ],
  },
];

export const chapters: Chapter[] = [
  {
    number: 1,
    slug: "http-as-a-state-machine",
    title: "HTTP as a State Machine",
    duration: "35 min",
    status: "published",
    summary: "Requests, representations, method semantics, caching, and CORS from the protocol boundary inward.",
    promise: "Trace a request from bytes to semantics without hiding behind framework vocabulary.",
    tags: ["HTTP", "CORS", "caching", "protocols"],
    sections: httpSections,
  },
  {
    number: 2,
    slug: "routing-and-request-dispatch",
    title: "Routing and Request Dispatch",
    duration: "28 min",
    status: "published",
    summary: "Path matching, method dispatch, precedence, parameters, and request context.",
    promise: "Derive a router from matching rules and make ambiguity observable.",
    tags: ["routing", "handlers", "request context"],
    sections: routingSections,
  },
  {
    number: 3,
    slug: "representation-and-serialization",
    title: "Representation and Serialization",
    duration: "30 min",
    status: "published",
    summary: "How values cross process boundaries through JSON, schemas, compatibility rules, and binary formats.",
    promise: "Choose a representation by contract and evolution cost, not familiarity.",
    tags: ["JSON", "serialization", "schemas", "Protobuf"],
    sections: serializationSections,
  },
  {
    number: 4,
    slug: "identity-authentication-authorization",
    title: "Identity, Authentication, and Authorization",
    duration: "42 min",
    status: "published",
    summary: "Identity proof, session lifecycle, token validation, per-resource policy, tenant isolation, and revocation.",
    promise: "Separate who a caller is, how that was proved, and what the caller may do now.",
    tags: ["authentication", "authorization", "sessions", "JWT", "RBAC", "ABAC", "ReBAC", "step-up"],
    sections: identitySections,
  },
  {
    number: 5,
    slug: "validation-at-trust-boundaries",
    title: "Validation at Trust Boundaries",
    duration: "26 min",
    status: "coming-next",
    summary: "Parsing, validation, normalization, business invariants, and safe error reporting.",
    promise: "Put each validation rule at the boundary that owns it.",
    tags: ["validation", "security", "schemas"],
  },
  {
    number: 6,
    slug: "layered-request-handling",
    title: "Layered Request Handling",
    duration: "32 min",
    status: "coming-next",
    summary: "Handlers, services, repositories, middleware, dependencies, and request-scoped context.",
    promise: "Separate layers by reasons to change rather than arbitrary folders.",
    tags: ["architecture", "middleware", "services", "repositories"],
  },
  {
    number: 7,
    slug: "resource-oriented-api-design",
    title: "Resource-Oriented API Design",
    duration: "Roadmap",
    status: "roadmap",
    summary: "Resources, invariants, idempotency, pagination, errors, and contract evolution.",
    promise: "Design APIs from domain behavior before choosing endpoint shapes.",
    tags: ["REST", "OpenAPI", "contracts"],
  },
  {
    number: 8,
    slug: "durable-data-and-transactions",
    title: "Durable Data and Transactions",
    duration: "Roadmap",
    status: "roadmap",
    summary: "Indexes, isolation, consistency, transactions, and query planning.",
    promise: "Reason from storage guarantees to application correctness.",
    tags: ["PostgreSQL", "transactions", "indexes"],
  },
  {
    number: 9,
    slug: "caching-as-controlled-staleness",
    title: "Caching as Controlled Staleness",
    duration: "Roadmap",
    status: "roadmap",
    summary: "Cache placement, invalidation, stampede control, and consistency trade-offs.",
    promise: "Treat every cache as an explicit staleness budget.",
    tags: ["Redis", "caching", "consistency"],
  },
  {
    number: 10,
    slug: "deferred-work-and-job-queues",
    title: "Deferred Work and Job Queues",
    duration: "Roadmap",
    status: "roadmap",
    summary: "Retries, ordering, idempotency, scheduling, and worker lifecycle.",
    promise: "Move work off the request path without losing delivery semantics.",
    tags: ["queues", "workers", "BullMQ"],
  },
  {
    number: 11,
    slug: "search-beyond-sql-like",
    title: "Search Beyond SQL LIKE",
    duration: "Roadmap",
    status: "roadmap",
    summary: "Inverted indexes, analyzers, relevance, and synchronization.",
    promise: "Understand what a search engine stores before tuning relevance.",
    tags: ["Elasticsearch", "search", "indexing"],
  },
  {
    number: 12,
    slug: "failure-semantics-and-resilience",
    title: "Failure Semantics and Resilience",
    duration: "Roadmap",
    status: "roadmap",
    summary: "Deadlines, retries, circuit breakers, bulkheads, and graceful degradation.",
    promise: "Design the failure path before production designs it for you.",
    tags: ["resilience", "retries", "fault tolerance"],
  },
  {
    number: 13,
    slug: "service-to-service-contracts",
    title: "Service-to-Service Contracts",
    duration: "Roadmap",
    status: "roadmap",
    summary: "HTTP, gRPC, messaging, deadlines, and schema evolution.",
    promise: "Choose a protocol by coupling and delivery needs.",
    tags: ["gRPC", "microservices", "Protobuf"],
  },
  {
    number: 14,
    slug: "configuration-as-a-runtime-contract",
    title: "Configuration as a Runtime Contract",
    duration: "Roadmap",
    status: "roadmap",
    summary: "Deploy-time configuration, secrets, validation, flags, and rotation.",
    promise: "Make invalid configuration fail before traffic arrives.",
    tags: ["configuration", "secrets", "feature flags"],
  },
  {
    number: 15,
    slug: "observability-from-signals-to-decisions",
    title: "Observability from Signals to Decisions",
    duration: "Roadmap",
    status: "roadmap",
    summary: "Logs, metrics, traces, SLOs, and actionable alerts.",
    promise: "Start with debugging questions and derive the telemetry you need.",
    tags: ["OpenTelemetry", "logging", "metrics", "tracing"],
  },
  {
    number: 16,
    slug: "graceful-lifecycle-management",
    title: "Graceful Lifecycle Management",
    duration: "Roadmap",
    status: "roadmap",
    summary: "Startup, readiness, draining, cancellation, and shutdown.",
    promise: "Treat process lifecycle as part of request correctness.",
    tags: ["shutdown", "Kubernetes", "reliability"],
  },
  {
    number: 17,
    slug: "backend-security-by-trust-boundary",
    title: "Backend Security by Trust Boundary",
    duration: "Roadmap",
    status: "roadmap",
    summary: "Threat modeling inputs, identity, data, dependencies, and infrastructure.",
    promise: "Secure transitions between trust zones instead of memorizing vulnerability names.",
    tags: ["security", "OWASP", "threat modeling"],
  },
  {
    number: 18,
    slug: "scaling-the-request-path",
    title: "Scaling the Request Path",
    duration: "Roadmap",
    status: "roadmap",
    summary: "Profiling, capacity, queues, load balancing, and horizontal scale.",
    promise: "Find the bottleneck before adding machines.",
    tags: ["scaling", "performance", "load balancing"],
  },
  {
    number: 19,
    slug: "scaling-data-and-state",
    title: "Scaling Data and State",
    duration: "Roadmap",
    status: "roadmap",
    summary: "Replicas, partitioning, sharding, consistency, and migration.",
    promise: "Scale state without losing the invariants that make it useful.",
    tags: ["sharding", "replication", "consistency"],
  },
  {
    number: 20,
    slug: "concurrency-parallelism-backpressure",
    title: "Concurrency, Parallelism, and Backpressure",
    duration: "Roadmap",
    status: "roadmap",
    summary: "Event loops, worker pools, CPU-bound work, I/O, and bounded load.",
    promise: "Match the execution model to the work and its capacity limit.",
    tags: ["concurrency", "event loop", "backpressure"],
  },
  {
    number: 21,
    slug: "containers-and-delivery-systems",
    title: "Containers and Delivery Systems",
    duration: "Roadmap",
    status: "roadmap",
    summary: "Images, orchestration, health checks, CI/CD, and safe rollout.",
    promise: "Make a release reproducible before making it frequent.",
    tags: ["Docker", "Kubernetes", "CI/CD"],
  },
  {
    number: 22,
    slug: "tests-as-executable-boundaries",
    title: "Tests as Executable Boundaries",
    duration: "Roadmap",
    status: "roadmap",
    summary: "Unit, integration, contract, E2E, property, and load tests by risk.",
    promise: "Choose tests by the boundary that can fail.",
    tags: ["testing", "contracts", "Playwright"],
  },
  {
    number: 23,
    slug: "messaging-and-event-streams",
    title: "Messaging and Event Streams",
    duration: "Roadmap",
    status: "roadmap",
    summary: "Queues, logs, delivery, ordering, replay, schemas, and consumer groups.",
    promise: "Separate message transport from the business guarantee you need.",
    tags: ["Kafka", "messaging", "events"],
  },
  {
    number: 24,
    slug: "real-time-connections",
    title: "Real-Time Connections",
    duration: "Roadmap",
    status: "roadmap",
    summary: "WebSocket and SSE lifecycles, presence, fan-out, ordering, and reconnects.",
    promise: "Design the connection lifecycle, not only the happy-path message.",
    tags: ["WebSockets", "SSE", "real-time"],
  },
];

export const publishedChapters = chapters.filter((chapter) => chapter.status === "published");
export const launchChapters = chapters.filter((chapter) => chapter.number <= 6);
export const roadmapChapters = chapters.filter((chapter) => chapter.status === "roadmap");

export function chapterHref(chapter: Chapter) {
  if (chapter.status === "published") return `/chapters/${chapter.slug}/`;
  if (chapter.status === "coming-next") return `/#${chapter.slug}`;
  return `/roadmap/#${chapter.slug}`;
}

export function chapterBySlug(slug: string) {
  return publishedChapters.find((chapter) => chapter.slug === slug);
}
