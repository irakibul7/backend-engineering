import type { LessonSection } from "../types";

export const httpSections: LessonSection[] = [
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
