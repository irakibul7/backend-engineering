# Chapter 06 specification: Layered Request Handling

Status: Approved by the user on 2026-08-31  
Prepared: 2026-08-31  
Specification task: `T-602F`  
Implementation task: `T-602G`  
Requirements: `LES-001`, `LES-004`, `LES-008`, `LES-009`, `A11Y-001`, `A11Y-003`, `A11Y-004`, `CON-006`

Implementation follows this approved specification through small tested slices.

## 1. Scope boundary

This specification governs one static educational chapter and isolated TypeScript examples. It does not add a server, API route, database, dependency-injection container, OpenTelemetry SDK, framework, or runtime request context to the Backend Engineering website.

The examples extend the fictional multi-tenant document service used in Chapters 04 and 05. A request publishes an existing document so the lesson can show transport adaptation, orchestration, persistence boundaries, cross-cutting middleware, request context, and failure mapping without pretending that a production database exists in this repository.

### In scope

- One original ten-section lesson with short, example-led explanations.
- A role matrix for handler, middleware, application service, domain logic, repository, request context, and composition root.
- A request lifecycle state machine with success, short-circuit, cancellation, and failure paths.
- Three original responsive visuals with equivalent text.
- One small dependency-free TypeScript example built from functions and explicit interfaces.
- Executable tests for dependency direction, orchestration, middleware order, short-circuiting, error translation, cancellation, and request isolation.
- A framework-adapter comparison that explains principles without making Express, NestJS, or another framework part of the product.
- Primary references, glossary additions, threat hypotheses, test strategy, and ADR impact.

### Explicit exclusions

- No chapter implementation or publication in this specification slice.
- No runtime API, HTTP listener, product middleware, database, ORM, queue, transaction manager, or remote service.
- No Express, NestJS, Fastify, dependency-injection container, OpenTelemetry package, or other dependency.
- No claim that every codebase needs the same number of layers or folder names.
- No “fat controller versus thin controller” slogan without an ownership test.
- No global mutable request bag, hidden service locator, or singleton that stores per-request data.
- No real tracing export, analytics change, authentication change, or production logging.
- No route, metadata, sitemap, progress denominator, style, or renderer change until implementation is approved.
- No copied prose, code, diagrams, layout, or artwork from the reference site.
- No Chapter 07 work.

## 2. Learning contract

### Promise

After the chapter, a learner should be able to take one request and answer:

1. Which code understands HTTP or another transport?
2. Which code coordinates the use case?
3. Which rules belong to the domain rather than the transport or datastore?
4. Which interface hides persistence details without becoming a generic query dump?
5. Which behavior legitimately wraps many requests as middleware?
6. Which values are request-scoped, and how are they isolated across asynchronous work?
7. Where are dependencies created, and which lifetime owns them?
8. Which layer maps each failure, deadline, cancellation, and transaction outcome?

The learner should be able to move a responsibility by explaining its evidence, dependencies, and reason to change—not by quoting a folder convention.

### Prerequisites

- HTTP response semantics from Chapter 01.
- Routing and request context from Chapter 02.
- Representation mapping from Chapter 03.
- Authentication and per-resource authorization from Chapter 04.
- Runtime validation and safe command construction from Chapter 05.

### Editorial thesis

Layers are ownership boundaries, not ceremony:

```text
transport request
  -> handler translates
  -> application service coordinates
  -> domain decides
  -> repository persists
  -> application service returns an outcome
  -> handler translates the outcome
  -> transport response
```

Middleware wraps this path for cross-cutting behavior. The composition root creates the collaborators. Request context carries a small execution-scoped envelope. Dependencies point inward toward stable application contracts; framework and datastore details remain adapters at the outside.

## 3. Running example

The chapter follows one operation:

```text
POST /documents/:documentId/publish
```

Trusted inputs available after earlier chapters:

- `documentId`: a validated identifier from the matched route;
- `principal`: an authenticated principal with tenant and subject identifiers;
- `requestId`: a server-generated correlation identifier;
- `deadline` and `signal`: request lifetime controls;
- `publishAt`: an optional validated publication time.

Expected application outcomes:

- published document;
- document not found;
- forbidden for this principal and tenant;
- invalid domain transition, such as publishing an archived document;
- persistence conflict;
- cancelled or deadline exceeded;
- unexpected adapter failure.

The example deliberately keeps HTTP status selection out of the application service and persistence query details out of the handler.

## 4. Lesson structure

| Section | Stable anchor | Plain-language question | Required evidence |
| --- | --- | --- | --- |
| 1 | `one-request-many-jobs` | What kinds of work happen inside one request? | Running publish request and ownership flow |
| 2 | `handler-translates` | What should the handler know? | HTTP-to-command and outcome-to-response examples |
| 3 | `service-coordinates` | What should the application service do? | Use-case orchestration sequence |
| 4 | `domain-decides` | Where do business rules live? | Publish transition comparison |
| 5 | `repository-speaks-domain` | What should a repository expose? | Persistence port versus generic data access table |
| 6 | `middleware-wraps` | When is behavior truly middleware? | Before, next, after, short-circuit, and error timeline |
| 7 | `context-stays-scoped` | What belongs in request context? | Explicit versus implicit context matrix and trace example |
| 8 | `compose-at-the-edge` | Where are dependencies and lifetimes chosen? | Dependency-direction and composition-root visual |
| 9 | `fail-cancel-and-clean-up` | Who owns failures, cancellation, and transaction cleanup? | Failure ownership table |
| 10 | `test-the-seams` | Which tests prove the boundaries? | Executable matrix, debugging checklist, and references |

Every section must use no more than two short body paragraphs before an example, visual, table, code block, or checklist. The running request must appear in section 1 and remain the basis of later examples.

## 5. Glossary

| Term | Chapter definition |
| --- | --- |
| Handler | A transport adapter that converts an accepted request into an application command and converts the application outcome into a response. |
| Middleware | Behavior that wraps a request operation and may continue, short-circuit, observe, or propagate failure under an explicit control-flow contract. |
| Application service | A transport-neutral use-case boundary that coordinates collaborators and returns typed application outcomes. |
| Domain rule | A business invariant or state transition that remains meaningful without HTTP, a framework, or a datastore implementation. |
| Repository | A persistence port exposing named domain/application operations while hiding storage-specific queries and records. |
| Port | A contract owned by the application core that describes a capability it needs. |
| Adapter | An outside implementation that translates a framework, datastore, clock, ID source, or external service to a port. |
| Dependency injection | Supplying a collaborator from outside the code that uses it instead of constructing or locating it internally. |
| Composition root | The outermost place that selects concrete adapters, creates the dependency graph, and assigns lifetimes. |
| Request context | A small execution-scoped envelope for correlation, tracing, deadline, cancellation, and controlled observability facts. |
| Correlation ID | A server-controlled identifier used to connect safe diagnostic events for one request or operation. |
| Deadline | The time after which new work for an operation should not begin or continue. |
| Cancellation | A signal that an operation should stop cooperative downstream work and clean up. |
| Short-circuit | Completing a middleware chain without calling the next operation. |

## 6. Role matrix

| Role | Owns | Accepts | Returns | Must not own |
| --- | --- | --- | --- | --- |
| Handler | Transport decoding already permitted by earlier boundaries, command mapping, response mapping | Validated route/body data and trusted request facts | Transport response | Domain policy, SQL/ORM calls, dependency construction |
| Middleware | Cross-cutting work around the request path | Request plus `next` operation | Continue, short-circuit, or propagated failure | Use-case-specific branching, arbitrary shared mutation |
| Application service | One use case, collaborator coordination, application-level outcome | Transport-neutral command and trusted principal/context | Typed application outcome | HTTP status, framework request/response objects, database row shape |
| Domain logic | Invariants and state transitions | Domain values/entities | New domain state or domain rejection | HTTP, tracing SDK, repository implementation |
| Repository port | Persistence operations expressed in domain language | Domain identifiers and values | Domain records or persistence outcomes | HTTP response mapping, authorization policy, generic unrestricted queries |
| Request context | Small execution-scoped correlation and lifetime envelope | Server-established request ID, trace context, deadline, signal | Read-only scoped facts | Request body, mutable business state, secrets, arbitrary dependency lookup |
| Composition root | Concrete wiring and lifetimes | Configuration and adapter factories | Ready handler/application graph | Business rules or per-request branching |

### Ownership test

A responsibility belongs in a layer when both statements are true:

1. The layer has the evidence required to make the decision.
2. The decision changes for the same reason as the rest of that layer.

If a handler changes because a database column was renamed, or a repository changes because an HTTP status changed, the boundary is leaking.

## 7. Request lifecycle state machine

```text
received
  |
  | create isolated request context
  v
context active
  |
  | middleware before phase
  +---------------------------> short-circuited response
  |
  | call next exactly once
  v
handler translating
  |
  | construct transport-neutral command
  v
service coordinating
  |
  | load, authorize, decide, persist
  +---------------------------> typed application rejection
  |
  v
application outcome
  |
  | handler maps outcome
  v
transport response
  |
  | middleware after/finally phase
  v
context closed
```

At any active stage, cancellation or a deadline may stop new work. Cleanup and span completion must run in `finally`-equivalent behavior. A middleware function must either return a response, propagate a failure, or invoke the next operation exactly once. It must never continue after a short-circuit response.

## 8. Data and type model

The executable example will use small structural contracts:

```ts
type PublishDocumentCommand = Readonly<{
  documentId: string;
  principal: Readonly<{ subjectId: string; tenantId: string }>;
  publishAt: number | null;
  signal: AbortSignal;
}>;

type RequestContext = Readonly<{
  requestId: string;
  traceId: string | null;
  deadline: number;
  signal: AbortSignal;
}>;

type PublishOutcome =
  | Readonly<{ kind: "published"; document: PublishedDocument }>
  | Readonly<{ kind: "not-found" }>
  | Readonly<{ kind: "forbidden" }>
  | Readonly<{ kind: "invalid-transition"; code: string }>
  | Readonly<{ kind: "conflict" }>;

type DocumentRepository = Readonly<{
  findById(documentId: string, signal: AbortSignal): Promise<Document | null>;
  save(document: Document, expectedVersion: number, signal: AbortSignal): Promise<"saved" | "conflict">;
}>;
```

### Type rules

- Handler input types are adapter-owned and cannot cross into the application service.
- Application commands and outcomes contain no HTTP status, header, framework request, or ORM row.
- Repository ports use domain/application types and named operations.
- Request context is immutable and contains only cross-cutting execution facts.
- Dependencies are explicit parameters to a factory or constructor.
- No `any`, type assertion that replaces runtime evidence, or global service lookup.

## 9. Dependency direction and composition

The implementation example will use manual composition:

```text
composition root
  -> creates repository adapter
  -> creates publish application service with repository + clock
  -> creates handler with publish service + response mapper
  -> wraps handler with ordered middleware
```

The application service depends on the `DocumentRepository` contract, not its in-memory or database implementation. The composition root depends on concrete adapters and is the only place allowed to choose them.

### Lifetimes

| Lifetime | Appropriate examples | Risk if wrong |
| --- | --- | --- |
| Process | Immutable configuration, stateless client pool, clock implementation | Per-request data leaks across users |
| Request | Request ID, trace/span handle, deadline, cancellation signal | Context disappears or outlives request |
| Operation | Transaction/unit of work, temporary domain command | Transaction is shared or held too long |

The chapter will not present a dependency-injection container as a prerequisite. Manual factories make the dependency graph visible and keep the example executable.

## 10. Middleware contract

The lesson models middleware as higher-order functions:

```ts
type Handler<Request, Response> = (request: Request) => Promise<Response>;

type Middleware<Request, Response> = (
  next: Handler<Request, Response>,
) => Handler<Request, Response>;
```

Required behaviors:

- registration order and execution order are explicit;
- before phases run outer-to-inner;
- after/finally phases run inner-to-outer;
- a short-circuit does not call `next`;
- a middleware calls `next` at most once;
- thrown or rejected failures remain observable to the error boundary;
- cancellation reaches downstream I/O through `AbortSignal`;
- request context is created and closed around the complete chain.

Good middleware examples are correlation, structured timing, coarse admission control, authentication adapters, and safe error boundaries. “Load this document and decide whether it may be published” is use-case work and stays out of generic middleware.

## 11. Request context and tracing

The conceptual context contains request ID, trace relationship, deadline, cancellation signal, and a small set of controlled observability fields. Business commands receive identity and resource facts explicitly even if an adapter also exposes them to logging instrumentation.

The implementation slice may demonstrate Node.js `AsyncLocalStorage.run()` in a lesson code block, but the executable core remains environment-independent. The lesson must state:

- `run()` scopes the store to asynchronous work created within its callback;
- `enterWith()` can unintentionally affect later handlers and is not the default;
- missing context is a modeled failure for APIs that require it;
- incoming trace headers are untrusted and require standard parsing;
- baggage must not contain credentials, tokens, personal data, or authorization claims;
- internal context is not automatically safe to propagate to external services.

## 12. Failure ownership

| Failure | Internal owner | Application outcome | Transport mapping |
| --- | --- | --- | --- |
| Invalid transport input | Handler/earlier validation boundary | No service call | Stable 4xx problem |
| Missing document | Application service via repository result | `not-found` | Non-disclosing 404 policy |
| Tenant/resource denial | Authorization seam called by service | `forbidden` | Coarse 403/404 policy |
| Invalid publish transition | Domain | `invalid-transition` | Stable 409/422 policy |
| Concurrent save conflict | Repository/transaction adapter | `conflict` | 409 Conflict |
| Deadline or cancellation | Request lifetime boundary and adapters | Cancellation | Deployment-specific timeout result; stop work |
| Unexpected adapter error | Error boundary | Internal failure | Generic 500; safe structured log |

The service returns typed expected outcomes. Unexpected failures are not converted to false success or leaked as stack traces. The handler maps application outcomes to transport responses in one explicit table.

## 13. Threat model

| Hypothesis | Failure mode | Required control and test |
| --- | --- | --- |
| Middleware order is wrong | Handler runs before authentication/admission policy | Composition-order test and visible chain diagram |
| `next` runs twice | Duplicate write, response, or event | At-most-once guard in example composer and rejection test |
| Error is swallowed | Request hangs or false 2xx is returned | Failure-propagation test and final error boundary |
| Request context leaks | One request receives another request ID or principal | Concurrent isolation test; immutable per-request store |
| Global service locator hides dependencies | Tests or deployments use unexpected concrete adapters | Explicit composition root and dependency graph test |
| Handler passes framework objects inward | Business logic becomes transport-coupled | Type-level contract and transport-free service test |
| Repository exposes unrestricted persistence shape | Domain and transport depend on schema details | Named repository operations and mapping test |
| Cancellation is ignored | Work continues after client/deadline termination | Aborted-signal tests for service and repository seam |
| Error mapper leaks internals | Stack, SQL, path, or secret reaches client | Safe response snapshot tests |
| Transaction scope is too broad | Locks span transport work or external calls | Transaction boundary documented around authoritative mutation only |
| Trace baggage carries sensitive data | Data propagates to logs or third parties | Allowlisted context fields and negative test cases |

No secrets or credentials are introduced by this slice.

## 14. Original visual plan

### Visual A: One request, six owners

- Type: responsive flow.
- Purpose: show handler, application service, domain, repository, outcome mapper, and response without placing middleware inside the use-case chain.
- Desktop: compact horizontal ownership steps.
- Narrow container and 320 px: numbered vertical rail.
- Equivalent text: role matrix and ordered lifecycle.

### Visual B: Middleware wraps the path

- Type: responsive timeline.
- Purpose: show outer-before → inner-before → handler → inner-after → outer-after, plus short-circuit and error routes.
- Desktop: five ordered phases with return direction stated in labels.
- Narrow container and 320 px: vertical timeline; no crossing connectors.
- Equivalent text: middleware contract in section 10.

### Visual C: Where should this code live?

- Type: responsive decision visual.
- Purpose: route a responsibility by required evidence and reason to change.
- Outcomes: handler, middleware, service, domain, repository, context, or composition root.
- Narrow container and 320 px: stacked decision cards.
- Equivalent text: role matrix and ownership test.

All visuals use the existing accessible renderer unless the approved content proves a new visual type is necessary. Diagram transcripts remain collapsed by default and available through `Read diagram as text`.

## 15. TypeScript example seams

Planned files:

- `src/content/examples/layered-request.ts`
  - domain document transition;
  - `DocumentRepository` port;
  - `createPublishDocument()` application-service factory;
  - transport-neutral handler adapter;
  - middleware composer with at-most-once `next` behavior;
  - explicit request context and cancellation propagation.
- `src/content/examples/layered-request.test.ts`
  - in-memory repository adapter;
  - deterministic clock and IDs;
  - table-driven application outcomes;
  - middleware ordering, short-circuit, double-next, error, cancellation, and isolation cases.

The example may be split into two modules only if the single file becomes harder to explain. No dependency will be installed for code that can be expressed clearly with TypeScript and platform types.

## 16. Test strategy

### Unit and contract matrix

| Case | Expected result | Boundary proved |
| --- | --- | --- |
| Valid draft owned by principal | Published outcome and one save | Service + domain + repository port |
| Missing document | `not-found`; no save | Service orchestration |
| Cross-tenant or unauthorized document | `forbidden`; no mutation | Authorization seam |
| Archived document | Stable invalid-transition code | Domain |
| Save conflict | `conflict` outcome | Repository adapter mapping |
| Handler receives valid adapter request | One command, one service call, mapped 2xx | Handler |
| Expected application rejection | Stable mapped 4xx | Handler response mapping |
| Unexpected failure | Propagates to error boundary; no stack in response | Error boundary |
| Two middleware functions succeed | Before order outer→inner; after order inner→outer | Middleware composition |
| Middleware short-circuits | Handler and inner middleware not called | Middleware control flow |
| Middleware calls `next` twice | Deterministic failure before duplicate effect | Middleware safety |
| Signal is already aborted | No repository work begins | Cancellation |
| Signal aborts during repository work | Adapter observes cancellation; no later step runs | Cancellation propagation |
| Two concurrent request contexts | Each observes only its own request ID | Context isolation |
| Alternate repository fake | Service behavior unchanged | Dependency inversion |

### Content and build acceptance

- Ten unique stable section anchors.
- Three named visuals with non-color meaning and equivalent text.
- No section exceeds the agreed short-paragraph rhythm before concrete evidence.
- Role and failure tables have consistent column counts.
- Primary references use HTTPS and open safely.
- Chapter remains absent from route resolution, sitemap, metadata output, and reading-progress denominator until implementation approval.

### Later implementation verification

- Strict TypeScript and ESLint with zero warnings.
- Full unit suite and focused example tests.
- Production build and hosting tests.
- Search, metadata, sitemap, and progress integration.
- Desktop, `390 × 844`, and `320 × 700` visual checks.
- No page or diagram overflow.
- Axe WCAG 2 A/AA and keyboard path.
- Broken internal/external links.
- Zero unexpected browser console warnings or errors.

## 17. Primary sources

1. Node.js, Asynchronous context tracking: `https://nodejs.org/api/async_context.html`
2. OpenTelemetry specification, Context: `https://opentelemetry.io/docs/specs/otel/context/`
3. OpenTelemetry specification, Propagators API: `https://opentelemetry.io/docs/specs/otel/context/api-propagators/`
4. W3C Recommendation, Trace Context: `https://www.w3.org/TR/trace-context/`
5. Express, Using middleware: `https://expressjs.com/en/guide/using-middleware/`
6. Express 5, Error handling: `https://expressjs.com/en/5x/guide/error-handling/`
7. Martin Fowler, Service Layer: `https://martinfowler.com/eaaCatalog/serviceLayer.html`
8. Martin Fowler, Repository: `https://martinfowler.com/eaaCatalog/repository.html`
9. Martin Fowler, Dependency Composition: `https://martinfowler.com/articles/dependency-composition.html`
10. RFC 9457, Problem Details for HTTP APIs: `https://www.rfc-editor.org/rfc/rfc9457.html`

Framework documentation is evidence for concrete control-flow behavior, not authority for the chapter's architecture. Pattern references supply vocabulary; the role matrix and examples remain original and are tested against this project's learning contract.

## 18. OpenAPI, threat-model, and ADR impact

### OpenAPI

No change. `openapi.yaml` continues to document that the website exposes no runtime API. The fictional publish route is lesson material only and must not appear as a deployed operation.

### Product threat model

No new production data flow, trust boundary, storage, or dependency is introduced by the specification. Chapter-specific educational threats are contained in section 13. The product threat model requires no change until an implementation proposes actual runtime behavior.

### ADRs

No new ADR is required for the specification. Manual composition, pure TypeScript examples, and static content follow ADR-0001 and the current product architecture. A future proposal to add a DI container, tracing SDK, server runtime, or remote context would require a separate ADR and specification change.

## 19. Implementation task slices

### T-602G.1 — Executable domain and service seam

- Requirements: `CON-006`, `LES-008`
- Acceptance: typed publish outcomes, repository port, orchestration tests, domain transition tests, and cancellation checks pass.
- Files in scope: `layered-request.ts`, focused tests.
- Exclusions: React, chapter content, routes, dependencies, real I/O.

### T-602G.2 — Middleware and context seam

- Requirements: `CON-006`, `LES-008`
- Acceptance: order, unwind, short-circuit, double-next, failure propagation, and concurrent context-isolation tests pass.
- Files in scope: same example module/tests or one approved focused split.
- Exclusions: framework package, OpenTelemetry SDK, global mutable context, product middleware.

### T-602G.3 — Publish the lesson

- Requirements: `LES-001`, `LES-004`, `LES-009`, `A11Y-001`, `A11Y-003`, `A11Y-004`, `CON-006`
- Acceptance: approved ten-section content, three responsive visuals, code, tables, references, glossary, search, SEO, sitemap, and progress integration pass the complete quality gate.
- Files in scope: typed Chapter 06 content, minimal renderer/style changes proven necessary, glossary, tests, evidence.
- Exclusions: runtime API, dependencies, Chapter 07, unrelated redesign.

## 20. Human review checklist

Approve implementation only if:

1. Layers are justified by ownership and change boundaries rather than folder rules.
2. Handler, service, domain, repository, middleware, context, and composition-root responsibilities are distinct.
3. The running publish request is understandable without framework knowledge.
4. Expected outcomes are typed while unexpected failures still reach an error boundary.
5. Middleware order, short-circuiting, unwind, and cancellation are explicit.
6. Request context is small, immutable, isolated, and not a hidden dependency container.
7. Repository operations speak application/domain language and do not leak datastore rows.
8. The three visuals remain useful at 320 px and do not copy the reference.
9. Primary sources support the technical claims.
10. The website remains static, account-free, and without a runtime API.
