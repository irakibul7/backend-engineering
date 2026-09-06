import type { LessonSection } from "../types";

export const layeredRequestSections: LessonSection[] = [
  {
    id: "one-request-many-jobs",
    number: "01",
    label: "Start here",
    title: "One request contains many jobs",
    introduction: "A request is easier to design when every decision has one clear owner.",
    paragraphs: [
      "Follow a request that publishes an existing document. Earlier boundaries have already matched the route, authenticated the principal, and validated the identifier and body. This chapter begins where application work starts.",
      "The handler translates transport data. The application service coordinates the use case. The domain decides whether the state may change. The repository persists through a narrow contract. Middleware wraps the path without becoming the path.",
    ],
    code: {
      filename: "publish-request.http",
      source: `POST /documents/document-7/publish
Authorization: Bearer <redacted>
traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01
Content-Type: application/json

{ "publishAt": null }`,
    },
    codeFirst: true,
    visuals: [
      {
        kind: "flow",
        label: "One request, six ownership boundaries",
        stages: [
          { title: "Request edge", detail: "Route, identity, validated input, deadline, and cancellation are ready." },
          { title: "Handler", detail: "Translate transport values into one application command." },
          { title: "Service", detail: "Coordinate load, authorization, decision, and persistence." },
          { title: "Domain", detail: "Accept or reject the publish state transition." },
          { title: "Repository", detail: "Load and save through domain-shaped operations." },
          { title: "Response edge", detail: "Translate the typed outcome into an HTTP response." },
        ],
        alternative: "The request edge establishes trusted transport facts. The handler maps them to a command. The application service coordinates the use case. The domain owns the state transition. The repository loads and saves through a narrow port. Finally, the handler maps the application outcome to an HTTP response.",
      },
    ],
    callout: {
      label: "Ownership rule",
      body: "Place a decision where the required evidence exists and where the surrounding code changes for the same reason.",
    },
  },
  {
    id: "handler-translates",
    number: "02",
    label: "Handler",
    title: "The handler translates",
    introduction: "A handler knows the transport contract, but it should not become the use case.",
    paragraphs: [
      "The publish handler reads the validated document ID, principal, body, and cancellation signal. It creates one transport-neutral command and calls one application operation.",
      "When the operation returns, the handler maps the typed outcome to status and response data. It does not query storage, enforce a publish transition, construct dependencies, or expose an unexpected error stack.",
    ],
    code: {
      filename: "publish-handler.ts",
      source: `export function createPublishHandler(
  publishDocument: PublishDocument,
) {
  return async (request: PublishHttpRequest) => {
    const outcome = await publishDocument({
      documentId: request.params.documentId,
      principal: request.principal,
      publishAt: request.body.publishAt,
      signal: request.context.signal,
    });

    return mapPublishOutcome(outcome);
  };
}`,
    },
    table: {
      caption: "Handler ownership test",
      columns: ["Belongs here", "Leaks another boundary"],
      rows: [
        ["Read an accepted route parameter", "Build an SQL or ORM query"],
        ["Create an application command", "Decide whether an archived document may publish"],
        ["Map a typed outcome to HTTP", "Instantiate the repository or tracing client"],
        ["Pass the cancellation signal", "Convert every failure into a generic 200 response"],
      ],
    },
  },
  {
    id: "service-coordinates",
    number: "03",
    label: "Service",
    title: "The service coordinates one use case",
    introduction: "An application service describes the operation in domain terms and stays unaware of HTTP.",
    paragraphs: [
      "Publishing requires several collaborators: load the document, authorize the principal against that document, ask the domain for a transition, and save with the version that was loaded. The service owns this order.",
      "Expected rejections are typed outcomes. Unexpected adapter failures still throw so an outer error boundary can record and map them safely.",
    ],
    code: {
      filename: "publish-document.ts",
      source: `export function createPublishDocument(deps: PublishDependencies) {
  return async (command: PublishDocumentCommand) => {
    command.signal.throwIfAborted();
    const document = await deps.documents.findById(
      command.documentId,
      command.signal,
    );

    if (!document) return { kind: "not-found" } as const;
    if (!deps.canPublish(command.principal, document)) {
      return { kind: "forbidden" } as const;
    }

    const transition = publishDraft(
      document,
      command.publishAt ?? deps.now(),
    );
    if (!transition.ok) return {
      kind: "invalid-transition",
      code: transition.code,
    } as const;

    const saved = await deps.documents.save(
      transition.document,
      document.version,
      command.signal,
    );
    return saved === "conflict"
      ? { kind: "conflict" } as const
      : { kind: "published", document: transition.document } as const;
  };
}`,
    },
    callout: {
      label: "Not a universal layer count",
      body: "A simple read may need only a handler and one dependency. Add an application service when the use case has coordination worth naming and testing.",
    },
  },
  {
    id: "domain-decides",
    number: "04",
    label: "Domain",
    title: "The domain decides what may change",
    introduction: "A business rule should still make sense after HTTP, the framework, and the datastore are removed.",
    paragraphs: [
      "The publish transition accepts only a draft. It returns a new published document and leaves the source unchanged. That rule can run in a unit test with no request object or repository.",
      "Authorization remains a separate decision because it needs the current principal and resource. The service coordinates both decisions without hiding either inside transport or persistence code.",
    ],
    code: {
      filename: "publish-domain.ts",
      source: `export function publishDraft(
  document: Document,
  publishedAt: number,
): DomainPublishResult {
  if (document.state !== "draft") {
    return {
      ok: false,
      code: "cannot-publish-" + document.state,
    };
  }

  return {
    ok: true,
    document: Object.freeze({
      ...document,
      state: "published",
      publishedAt,
      version: document.version + 1,
    }),
  };
}`,
    },
    table: {
      caption: "Publish transition table",
      columns: ["Current state", "Decision", "Repository call"],
      rows: [
        ["draft", "Create a new published value", "Save with the loaded version"],
        ["published", "Reject cannot-publish-published", "None"],
        ["archived", "Reject cannot-publish-archived", "None"],
      ],
    },
  },
  {
    id: "repository-speaks-domain",
    number: "05",
    label: "Repository",
    title: "A repository speaks application language",
    introduction: "The application should request capabilities, not reach through an abstraction to rebuild datastore queries.",
    paragraphs: [
      "The publish service needs findById and save with optimistic version evidence. Those operations hide whether the adapter uses SQL, an ORM, an in-memory fake, or a remote store.",
      "A repository that exposes arbitrary table names, query builders, or persistence rows pushes storage coupling back into the service. Keep the port narrow and map adapter records at its edge.",
    ],
    table: {
      caption: "Repository port versus storage leakage",
      columns: ["Application-shaped port", "Leaky alternative", "Why it matters"],
      rows: [
        ["findById(documentId, signal)", "query(table, filters)", "The use case names the capability it needs"],
        ["save(document, expectedVersion, signal)", "updateRow(rawRecord)", "Concurrency evidence stays explicit"],
        ["Document or null", "ORM entity with lazy relations", "Domain code does not depend on adapter behavior"],
      ],
    },
    callout: {
      label: "Port direction",
      body: "The application owns the repository contract. The datastore adapter depends on that contract—not the other way around.",
    },
  },
  {
    id: "middleware-wraps",
    number: "06",
    label: "Middleware",
    title: "Middleware wraps the path",
    introduction: "Middleware is control flow around a request operation, so order and return direction are part of its contract.",
    paragraphs: [
      "Before phases run from the outer middleware inward. After and finally phases unwind in reverse. A middleware may short-circuit by returning a response without calling next.",
      "Calling next twice can duplicate a write or response. Swallowing a failure can turn an error into a hanging request or false success. The example composer rejects a second call deterministically.",
    ],
    visuals: [
      {
        kind: "timeline",
        label: "Middleware enters inward and unwinds outward",
        phases: [
          { marker: "01", title: "Outer before", detail: "Create context, start timing, or apply coarse admission policy." },
          { marker: "02", title: "Inner before", detail: "Run the next ordered cross-cutting concern." },
          { marker: "03", title: "Handler and use case", detail: "Translate, coordinate, decide, and persist once." },
          { marker: "04", title: "Inner after", detail: "Observe the outcome or execute cleanup in finally." },
          { marker: "05", title: "Outer after", detail: "Finish the span, record safe timing, and close context." },
        ],
        alternative: "The outer middleware runs its before phase, followed by the inner middleware. The handler and use case run at the center. Control then returns through the inner after phase and finally the outer after phase. A short-circuit returns before reaching inner work, while cleanup still follows the applicable finally path.",
      },
    ],
    code: {
      filename: "middleware.ts",
      source: `export type Middleware<Request, Response> = (
  next: Handler<Request, Response>,
) => Handler<Request, Response>;

// The repository example composes from right to left and gives
// every middleware invocation an at-most-once guarded next().
const handler = composeMiddleware(publishHandler, [
  errorBoundary,
  requestContext,
  timing,
]);`,
    },
  },
  {
    id: "context-stays-scoped",
    number: "07",
    label: "Context",
    title: "Request context stays small and scoped",
    introduction: "Cross-cutting code needs correlation and lifetime facts without turning context into a hidden bag of dependencies.",
    paragraphs: [
      "A useful context contains a server-controlled request ID, trace relationship, deadline, cancellation signal, and a small allowlist of observability fields. Business commands still receive identity and resource facts explicitly.",
      "Node.js AsyncLocalStorage can carry a store through asynchronous work created inside run(). The platform documentation prefers run() over enterWith() for most cases because enterWith() can affect later event handlers. Missing context must be handled deliberately.",
    ],
    table: {
      caption: "Explicit inputs and request-scoped context",
      columns: ["Value", "Pass explicitly", "Context candidate", "Never propagate"],
      rows: [
        ["Document ID", "Yes—business command", "No", "—"],
        ["Principal for authorization", "Yes—decision input", "Logging may use a safe subject category", "Bearer token or credential"],
        ["Request ID and trace relationship", "Only when required by a port", "Yes", "Unparsed attacker-controlled baggage"],
        ["Deadline and AbortSignal", "Yes to cancellable I/O", "Yes", "Mutable global timeout state"],
      ],
    },
    code: {
      filename: "node-request-context.ts",
      source: `const requestContext = new AsyncLocalStorage<RequestContext>();

export function runRequest<T>(
  context: RequestContext,
  operation: () => T,
): T {
  return requestContext.run(Object.freeze(context), operation);
}

export function currentRequest(): RequestContext {
  const context = requestContext.getStore();
  if (!context) throw new Error("request-context-missing");
  return context;
}`,
    },
  },
  {
    id: "compose-at-the-edge",
    number: "08",
    label: "Composition",
    title: "Compose dependencies at the edge",
    introduction: "The code that uses a dependency should not also decide which concrete implementation to construct.",
    paragraphs: [
      "The composition root creates the repository adapter, injects it into the publish service, injects the service into the handler, and wraps the handler with ordered middleware. Application code never asks a global locator for hidden collaborators.",
      "Lifetimes are part of composition. Immutable configuration and client pools may live for the process. Request IDs and cancellation live for one request. A transaction lives only around the authoritative mutation it protects.",
    ],
    visuals: [
      {
        kind: "decision",
        label: "Where should this responsibility live?",
        question: "What evidence is required, and why will this code change?",
        outcomes: [
          { condition: "HTTP input or output", result: "Handler", detail: "Translate between transport and application types." },
          { condition: "Cross-cutting request control", result: "Middleware", detail: "Wrap the chain with explicit order and cleanup." },
          { condition: "Use-case coordination", result: "Application service", detail: "Order collaborators and return typed outcomes." },
          { condition: "Business invariant", result: "Domain", detail: "Decide without framework or datastore knowledge." },
          { condition: "Persistence capability", result: "Repository port", detail: "Express storage needs in application language." },
          { condition: "Correlation or lifetime", result: "Request context", detail: "Carry small immutable execution-scoped facts." },
          { condition: "Concrete adapter or lifetime", result: "Composition root", detail: "Build the graph at the outer edge." },
        ],
        alternative: "Transport translation belongs in the handler. Cross-cutting request control belongs in middleware. Use-case coordination belongs in the application service. Business invariants belong in the domain. Persistence capabilities belong behind repository ports. Correlation and lifetime facts belong in request context. Concrete adapters and lifetimes are selected by the composition root.",
      },
    ],
    code: {
      filename: "composition-root.ts",
      source: `const documents = createPostgresDocumentRepository(pool);
const publishDocument = createPublishDocument({
  documents,
  canPublish: authorizePublish,
  now: () => Date.now(),
});
const publishHandler = createPublishHandler(publishDocument);

export const handlePublish = composeMiddleware(
  publishHandler,
  [errorBoundary, requestContext, timing],
);`,
    },
  },
  {
    id: "fail-cancel-and-clean-up",
    number: "09",
    label: "Failure",
    title: "Failures keep their owner",
    introduction: "Expected outcomes, unexpected failures, cancellation, and transaction cleanup need different treatment.",
    paragraphs: [
      "Not found, forbidden, invalid transition, and version conflict are modeled application outcomes. The handler maps them intentionally. An unexpected adapter failure reaches the outer error boundary, which returns a generic 500 and records safe diagnostics.",
      "Cancellation is cooperative. Check before starting work, pass the signal to I/O, and stop later stages when it aborts. Cleanup and span completion belong in finally behavior; they must run on success, failure, and cancellation.",
    ],
    table: {
      caption: "Failure ownership and public mapping",
      columns: ["Failure", "Owner", "Public result", "Downstream work"],
      rows: [
        ["Invalid accepted input", "Handler/validation", "Stable 4xx problem", "Service not called"],
        ["Missing or non-disclosed forbidden document", "Application + handler policy", "404", "No domain mutation"],
        ["Invalid state transition", "Domain", "Stable 409 code", "Repository save not called"],
        ["Optimistic save race", "Repository/transaction", "409 conflict", "Caller may reload"],
        ["Deadline or cancellation", "Request lifetime + adapter", "Deployment timeout policy", "Stop cooperative work"],
        ["Unexpected adapter failure", "Outer error boundary", "Generic 500", "Run cleanup; hide internals"],
      ],
    },
    checklist: [
      "Pass one AbortSignal through every cancellable adapter call.",
      "Keep a transaction around authoritative mutation—not transport parsing or external calls.",
      "Run timing, context closure, and span completion in finally behavior.",
      "Never place credentials, personal data, or authorization claims in trace baggage.",
      "Do not convert an unexpected failure into a successful application outcome.",
    ],
  },
  {
    id: "test-the-seams",
    number: "10",
    label: "Verify",
    title: "Test the seams you designed",
    introduction: "A useful test fails when a responsibility crosses the wrong boundary—not when a private folder name changes.",
    paragraphs: [
      "Test the domain transition as a pure function, the application service with a repository fake, and the handler with a fake application operation. Then test middleware order, short-circuiting, double-next protection, failure propagation, cancellation, and concurrent context isolation.",
      "When production behavior is wrong, trace the last completed boundary: transport mapping, service coordination, domain decision, repository result, response mapping, or middleware unwind. The request ID connects safe evidence without making logs the source of truth.",
    ],
    checklist: [
      "The service has no HTTP or framework types.",
      "The handler calls one application operation and no repository.",
      "A domain rejection performs no save.",
      "Middleware before and after order is deterministic.",
      "A second next call fails before a duplicate effect.",
      "Two concurrent contexts never observe each other's request ID.",
      "Unexpected errors and aborted signals remain observable to their owner.",
    ],
    questions: [
      "Which part of your current handler would still exist if HTTP were replaced with a queue consumer?",
      "Does your service coordinate a use case, or merely rename one repository call?",
      "Can a repository implementation change without changing application commands or outcomes?",
      "Which middleware can short-circuit, and is its position in the chain tested?",
      "What request-scoped value could leak if it were stored in a mutable singleton?",
    ],
    references: [
      { title: "Node.js: Asynchronous context tracking", url: "https://nodejs.org/api/async_context.html" },
      { title: "OpenTelemetry specification: Context", url: "https://opentelemetry.io/docs/specs/otel/context/" },
      { title: "OpenTelemetry specification: Propagators API", url: "https://opentelemetry.io/docs/specs/otel/context/api-propagators/" },
      { title: "W3C Trace Context", url: "https://www.w3.org/TR/trace-context/" },
      { title: "Express: Using middleware", url: "https://expressjs.com/en/guide/using-middleware/" },
      { title: "Express 5: Error handling", url: "https://expressjs.com/en/5x/guide/error-handling/" },
      { title: "Martin Fowler: Service Layer", url: "https://martinfowler.com/eaaCatalog/serviceLayer.html" },
      { title: "Martin Fowler: Repository", url: "https://martinfowler.com/eaaCatalog/repository.html" },
      { title: "Martin Fowler: Dependency Composition", url: "https://martinfowler.com/articles/dependency-composition.html" },
      { title: "RFC 9457: Problem Details for HTTP APIs", url: "https://www.rfc-editor.org/rfc/rfc9457.html" },
    ],
  },
];
