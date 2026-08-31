# Chapter 05 specification: Validation at Trust Boundaries

Status: Approved and implemented  
Prepared: 2026-08-31  
Specification task: `T-602D`  
Implementation task: `T-602E`  
Requirements: `LES-001`, `LES-004`, `LES-008`, `LES-009`, `A11Y-001`, `A11Y-003`, `CON-005`

Review decision: Approved by the user on 2026-08-31. Implementation evidence is recorded in `docs/validation/chapter-05-validation.md`.

## 1. Scope boundary

This specification governs an educational chapter and isolated, pure TypeScript examples. It does **not** add a form, request listener, body parser, schema dependency, database, runtime API, or server to the Backend Engineering website. The product remains the static, account-free application described in `spec.md`, `openapi.yaml`, and `docs/threat-model.md`.

The examples model a fictional multi-tenant document service so that a request can cross concrete validation boundaries. They demonstrate policies and failure handling; they are not a production framework or a drop-in validation package.

### In scope

- One original, ten-section lesson with stable anchors and primary references.
- At least three original explanatory visuals with captions and equivalent text.
- One small pure TypeScript validation pipeline that accepts `unknown`.
- One allowlisted update-mapping seam, either in the same example module or a second small module.
- An executable failure taxonomy and table-driven boundary tests.
- Tests for strict object shape, resource limits, explicit normalization, semantic conflicts, unknown fields, and server-owned fields.
- Glossary additions needed by the lesson.
- Search, metadata, sitemap, progress-count, and previous/next integration only in the later implementation slice.
- Chapter-specific accessibility, responsive, content, and browser evidence only in the later implementation slice.

### Explicit exclusions

- No product form, API endpoint, network listener, database, authentication, authorization service, or persistence layer.
- No dependency choice or package installation during this specification slice.
- No claim that TypeScript types validate runtime values.
- No universal input sanitizer, implicit coercion, mutation of the caller's value, or direct spreading of untrusted objects.
- No hand-written JSON parser, Unicode algorithm, URL parser, email parser, HTML sanitizer, or regular-expression engine.
- No promise that one schema can enforce resource authorization, uniqueness, referential integrity, or every business invariant.
- No chapter route, publication-state, sitemap, metadata, progress denominator, style, or renderer change in this specification slice.
- No copied prose, code, diagrams, layout, or artwork from the reference site.
- No additional implementation language in this slice.

## 2. Learning contract

### Promise

After the chapter, a learner should be able to trace an external request through these distinct questions:

1. Is this media type supported, and can the system afford to receive and parse it?
2. Can the bytes be decoded into a value under the selected representation rules?
3. Does the decoded `unknown` value have the exact permitted structure and primitive types?
4. Which field-specific normalization rules, if any, create the canonical candidate?
5. Does that candidate satisfy cross-field and domain rules in the current trusted context?
6. Is the principal authorized to request the operation on the resolved resource?
7. Can the authoritative store preserve the invariant at commit time?

The learner should be able to explain why success at one boundary cannot stand in for success at a later boundary.

### Prerequisites

- HTTP request and response semantics from Chapter 01.
- Routing and request context from Chapter 02.
- Representation decoding and schema evolution from Chapter 03.
- Principal and per-resource policy separation from Chapter 04.

### Editorial thesis

Validation is not one boolean at the edge. It is a sequence that reduces uncertainty while preserving the distinction between untrusted evidence and trusted application state:

```text
bounded bytes
  -> parsed unknown value
  -> structurally valid DTO
  -> explicitly normalized candidate
  -> semantically valid command
  -> authorized operation
  -> persisted invariant
```

Parsing is not validation. Validation is not sanitization. Normalization is not authorization. A static TypeScript annotation is not a runtime proof. A database constraint is the final concurrency-safe backstop for invariants it owns, not a replacement for useful request feedback.

## 3. Lesson structure

| Section | Stable anchor | Question answered | Required evidence |
| --- | --- | --- | --- |
| 1 | `follow-one-request` | What is suspicious about one realistic request? | Running JSON example and six-question flow |
| 2 | `parsing-is-not-validation` | What does successful JSON parsing prove? | Three parsing examples and the `unknown` seam |
| 3 | `three-kinds-of-validation` | How do type, syntax, and meaning differ? | One slug traced through all three checks |
| 4 | `transform-with-a-reason` | When may the service change a value? | Normalization, coercion, and encoding comparison |
| 5 | `reduce-client-authority` | Which fields may the client control? | Input-authority ladder and server-owned-field rejection |
| 6 | `bound-the-work` | What must be limited before expensive decoding? | Short transport and parser limit checklist |
| 7 | `place-each-rule` | Which boundary has enough evidence for each rule? | Failure-ownership decision visual |
| 8 | `return-useful-errors` | How can a 4xx response be useful and safe? | Problem Details example and status table |
| 9 | `build-the-pipeline` | How do trusted types move through code? | Small executable TypeScript pipeline |
| 10 | `test-the-boundaries` | Which cases prove the boundary contract? | Test checklist, design questions, and primary references |

Each section answers one plain-language question. The chapter uses one request throughout, places examples directly after claims, and keeps prose blocks short. Product headings remain implementation-language neutral; the code block itself may identify TypeScript.

## 4. Glossary

| Term | Chapter definition |
| --- | --- |
| Trust boundary | A point where data or control crosses between parties or components with different assurance. |
| Runtime validation | A check performed on the value that actually arrived while the program is running. |
| Parsing | Converting bytes or text according to representation syntax; successful parsing does not prove the application shape or meaning. |
| Structural validation | Checking container kind, permitted keys, required fields, primitive types, sizes, formats, and enumerated values. |
| Semantic validation | Checking whether structurally valid values make sense together and in the relevant business context. |
| Normalization | A deliberate field-specific transformation into one documented representation, such as Unicode NFC or a canonical slug case. |
| Canonicalization | Selecting a stable representative from multiple equivalent forms for comparison, indexing, or storage. |
| Coercion | Converting one runtime type to another, such as the string `"30"` to the number `30`; this chapter rejects implicit coercion. |
| Sanitization | Transforming content to make it safe for a particular output or interpreter context; it is not a synonym for validation. |
| DTO | A data-transfer object containing only the fields and types admitted by a boundary contract. |
| Allowlist | An explicit set of accepted values, keys, operations, or formats; everything else is rejected. |
| Mass assignment | Binding client-supplied fields directly onto an internal model, potentially changing fields the client must not control. |
| Prototype pollution | Modification of an object's prototype chain through attacker-controlled keys or unsafe merge behavior. |
| Invariant | A condition that must remain true for authoritative domain state, including across concurrent operations. |
| Problem Details | The RFC 9457 object format for machine-readable HTTP API error details. |

## 5. Sample request and trust boundaries

The fictional service creates a document from JSON. The public request may supply only:

- `title`: a human-readable title;
- `slug`: a URL segment chosen by the caller;
- `tags`: an optional list of labels;
- `visibility`: either `private` or `tenant`;
- `retentionDays`: an optional finite integer within the documented range.

The client may never assign `id`, `tenantId`, `ownerSubjectId`, `createdAt`, `updatedAt`, `classification`, or authorization roles. Those values come from trusted server context or later domain policy.

The boundaries are:

1. The transport/runtime enforces supported media, actual decoded byte limits, deadlines, and bounded parser work.
2. The representation parser returns an `unknown` value or a syntax failure.
3. The structural validator creates a fresh DTO from own, allowlisted properties only.
4. The normalizer applies documented transformations to named fields and detects collisions introduced by them.
5. Domain validation combines the candidate with trusted tenant, principal, resource, and repository evidence.
6. Authorization independently decides whether the principal may perform the operation.
7. The datastore transaction enforces authoritative uniqueness, reference, and concurrency constraints.

The request body, headers, route parameters, decoded objects, nested properties, property names, array sizes, and claimed identifiers remain untrusted until the boundary responsible for that evidence accepts them.

### Ordering qualification

The pipeline is conceptual, not a mandate that every system perform every check in exactly one linear function. Cheap coarse authorization and rate limiting may precede body parsing to protect resources. Resource-specific authorization follows validated identifiers and authoritative resource loading. The chapter must make that distinction explicit.

## 6. Validation state machine

```text
received
  |
  | supported media + bounded work
  v
bounded representation
  |
  | syntax parse
  v
parsed unknown
  |
  | strict structural validation
  v
valid DTO
  |
  | explicit field normalization
  v
canonical candidate
  |
  | semantic/context validation
  v
domain command
  |
  | resource authorization
  v
authorized command
  |
  | transactional constraints
  v
committed state
```

Every transition has one success output and a typed rejection. A later transition consumes only the trusted output of its predecessor; it does not reach back into the original object for convenient fields.

Normative transition rules:

- Select and validate the representation from the actual request context; do not infer JSON merely because the bytes resemble JSON.
- Enforce actual received/decompressed byte limits rather than trusting only a declared `Content-Length`.
- Configure bounded depth, property count, array length, string length, number range, and processing time appropriate to the endpoint.
- Treat the parser result as `unknown`, including when a framework's generic type assertion suggests otherwise.
- Require a non-null, non-array object with an expected prototype policy before reading request fields.
- Reject unknown keys for command inputs unless the versioned contract explicitly defines forward-compatible extension fields.
- Reject wrong primitive types instead of silently coercing them.
- Construct a fresh DTO from own, named properties. Never spread or recursively merge the untrusted object into a domain model.
- Normalize only fields with a documented policy; validate length and collisions again when normalization can change them.
- Keep client data separate from trusted context such as `tenantId` and `ownerSubjectId`.
- Perform authorization as its own decision after sufficient identity and resource evidence exists.
- Recheck storage-owned invariants inside the transaction and map conflicts without exposing internals.

## 7. Data model

The executable example should expose only the types needed to make trust transitions visible:

```ts
type ValidationIssue = Readonly<{
  path: string;
  code:
    | "invalid-root"
    | "missing-field"
    | "unknown-field"
    | "invalid-type"
    | "invalid-format"
    | "out-of-range"
    | "too-many-items"
    | "normalization-conflict"
    | "semantic-conflict";
  message: string;
}>;

type DocumentInput = Readonly<{
  title: string;
  slug: string;
  tags: readonly string[];
  visibility: "private" | "tenant";
  retentionDays: number | null;
}>;

type DocumentCommand = Readonly<{
  title: string;
  canonicalSlug: string;
  tags: readonly string[];
  visibility: "private" | "tenant";
  retentionDays: number | null;
}>;

type ValidationResult<T> =
  | Readonly<{ ok: true; value: T }>
  | Readonly<{ ok: false; issues: readonly ValidationIssue[] }>;

type TrustedRequestContext = Readonly<{
  tenantId: string;
  ownerSubjectId: string;
}>;
```

`DocumentInput` is constructed only after structural validation. `DocumentCommand` is constructed only after normalization and semantic validation. Neither type contains server-owned fields. `TrustedRequestContext` is passed separately and must not be assembled from the request body.

The chapter must not use a type assertion such as `JSON.parse(text) as DocumentInput` as evidence. A production schema tool may create an equivalent runtime contract, but the educational example remains dependency-free and small enough to inspect.

## 8. Failure taxonomy

| Failure class | Example | Owning boundary | Public response guidance | Required test |
| --- | --- | --- | --- | --- |
| Unsupported media | `text/plain` sent to a JSON-only endpoint | Transport/representation selection | `415 Unsupported Media Type` | Media allowlist |
| Excessive content | Actual body exceeds endpoint limit | Transport/resource guard | `413 Content Too Large` | Declared and streaming-size cases |
| Malformed syntax | Truncated JSON or invalid token | Parser | `400 Bad Request` | Parser rejection |
| Ambiguous representation | Duplicate JSON member names | Representation policy | Reject before command creation | Duplicate-key policy test at parser adapter |
| Invalid root | `null`, array, string, or number | Structural validator | Validation problem | Root-kind table |
| Missing field | No `title` | Structural validator | Stable issue path/code | Required-field table |
| Unknown field | Client sends `tenantId` or `isAdmin` | Structural validator | Stable issue path/code | Unknown/server-owned key table |
| Wrong type | `retentionDays: "30"` | Structural validator | Reject without coercion | Exact-type table |
| Invalid number | `NaN`, `Infinity`, fraction, or range violation in direct JS input | Structural validator | Stable issue path/code | Numeric edge table |
| Excessive collection | Too many tags or an oversized tag | Structural validator | Stable issue path/code | Boundary values |
| Normalization collision | Two tags become equal after documented normalization | Normalizer | Normalization conflict | Collision table |
| Semantic conflict | Field combination violates domain policy | Domain validator | Domain issue without internals | Cross-field table |
| Authorization denial | Valid command targets a forbidden tenant/resource | Authorization policy | Coarse non-disclosing denial | Separate policy test |
| Persistence conflict | Canonical slug becomes non-unique during a race | Transaction/store | Conflict response | Concurrent integration test in a real service |

The chapter may use RFC 9457 as the response envelope example, with an extension array of stable issues. Human-readable `detail` and issue messages are not stable program identifiers. Paths and codes must not expose secrets, database structure, authorization reasoning, or raw rejected values.

## 9. Normalization policy

Normalization must be opt-in per field and documented next to the invariant it serves.

| Field | Proposed example policy | Explicit non-policy |
| --- | --- | --- |
| `title` | Validate as a bounded string; normalize Unicode to NFC; preserve meaningful internal whitespace | Do not strip markup as an XSS defense or silently rewrite the title's case |
| `slug` | Require a narrow ASCII grammar, lowercase it, and enforce length again | Do not transliterate arbitrary text or guess a slug from malformed input |
| `tags` | Validate each bounded string, apply the documented case/Unicode policy, then reject normalized duplicates | Do not accept arbitrary objects or silently drop invalid entries |
| `visibility` | Exact enum match | Do not lowercase or coerce near matches |
| `retentionDays` | Exact finite integer in range or absent | Do not parse numeric strings, truncate fractions, or turn empty text into `null` |

The chapter must state that Unicode normalization forms solve canonical-equivalence problems, not all visual-confusability or identifier-security problems. If normalization changes a uniqueness key, collision detection belongs after normalization and authoritative uniqueness still belongs at commit time.

## 10. Safe update mapping

The implementation example must demonstrate these rules:

1. Enumerate allowed client keys.
2. Read only own properties from an accepted object representation.
3. Reject unknown keys, including server-owned names and magic prototype-related names.
4. Validate each allowed value before constructing the DTO.
5. Create a fresh null-prototype or ordinary internal object from named fields; do not recursively merge input.
6. Add trusted context in a separate command-construction step.
7. Keep authorization and persistence after the command is valid.

This is both a mass-assignment defense and a way to make the public contract reviewable. Rejecting `tenantId` in the body does not prove the caller belongs to the trusted `tenantId`; Chapter 04's authorization boundary still applies.

## 11. Threat hypotheses

These are threats to the fictional service model, not findings against the static Backend Engineering website.

| ID | Hypothesis | Control required by the chapter | Verification seam |
| --- | --- | --- | --- |
| `C05-TM-01` | Oversized, deeply nested, compressed, or high-cardinality input consumes memory/CPU before validation. | Transport, decompression, parser-depth, collection, and time budgets. | Boundary and load tests at the real adapter. |
| `C05-TM-02` | The service parses an unsupported or ambiguously selected representation. | Media-type allowlist and explicit parser selection. | `415` and parser-adapter tests. |
| `C05-TM-03` | Syntax-valid JSON with `null`, arrays, wrong primitives, or unknown fields enters domain logic. | `unknown` input, exact structural checks, fail-closed keys. | Table-driven runtime tests. |
| `C05-TM-04` | Implicit coercion turns ambiguous invalid data into an accepted command. | Exact types and explicit field conversions only where the contract defines them. | Numeric, Boolean, empty, and whitespace cases. |
| `C05-TM-05` | Unsafe assignment or merge lets a client change tenant/owner/admin fields or prototype state. | Allowlisted mapping, own-property checks, no untrusted spread/deep merge. | Server-owned and magic-key corpus. |
| `C05-TM-06` | Case or Unicode normalization creates identifier/tag collisions. | Field-specific canonicalization and post-normalization collision checks. | Canonically equivalent and case-collision cases. |
| `C05-TM-07` | A pathological validation expression consumes excessive CPU. | Bounded input and reviewed linear-time patterns or maintained parsers. | ReDoS corpus and timing budget in a real service. |
| `C05-TM-08` | A value becomes invalid between request validation and commit. | Transactional constraints and conflict handling. | Concurrent integration test in a real store. |
| `C05-TM-09` | Structurally valid resource IDs bypass object or tenant authorization. | Independent resource loading and authorization after validation. | Authorization matrix from Chapter 04. |
| `C05-TM-10` | Errors or logs expose raw payloads, sensitive values, or internal schema details. | Stable coarse codes, redaction, size limits, and safe diagnostics. | Logging/privacy review. |

## 12. Original visual specifications

All visuals use the existing content model and responsive renderer unless implementation proves a genuinely new renderer is necessary. Every visual responds to its own container width, not only the viewport. At narrow widths it becomes a vertical sequence or labeled rows before text compresses. No diagram-level horizontal scrolling is permitted.

### Visual A: From bytes to a committed invariant

- Type: flow.
- Purpose: show how evidence becomes narrower and more trusted at each boundary.
- Desktop: seven compact stages connected left to right when the container can preserve readable labels.
- Narrow container and 320 px: a vertical rail with one full-width stage per row.
- Non-color meaning: every node includes its state name and proof; connectors include the transition action.
- Equivalent text: the numbered state sequence and the plain-language questions in sections 1 through 7.
- Caption: "Each boundary proves one class of claim; no earlier success substitutes for a later decision."

### Visual B: Who owns this rejection?

- Type: decision rows.
- Purpose: distinguish transport, parser, structure, normalization, domain, authorization, and storage responsibilities.
- Desktop: one question column, one owner column, and one result column.
- Narrow container and 320 px: stacked decision cards with question, evidence, owner, and response in reading order.
- Non-color meaning: explicit `REJECT`, `CONTINUE`, and `RETRY/CONFLICT` words plus boundary names.
- Equivalent text: the failure taxonomy table in section 8.
- Caption: "Put each rule at the earliest boundary that has enough evidence, then preserve authoritative checks downstream."

### Visual C: Trust grows while input authority shrinks

- Type: annotated comparison ladder.
- Purpose: contrast what the client may propose with what only trusted context and storage may decide.
- Desktop: three columns for client proposal, constructed command, and authoritative record.
- Narrow container and 320 px: three vertically stacked groups; server-owned fields appear only in the latter groups.
- Non-color meaning: group headings and `client-controlled`, `server-derived`, and `store-enforced` labels.
- Equivalent text: the field lists in sections 1, 5, and 10.
- Caption: "A valid client payload still cannot assign identity, tenant, authorization, or storage-owned state."

## 13. TypeScript example seams

Planned implementation files are deliberately small and dependency-free:

- `src/content/examples/validation-pipeline.ts`
  - `validateDocumentInput(input: unknown): ValidationResult<DocumentInput>`
  - `normalizeDocumentInput(input: DocumentInput): ValidationResult<DocumentCommand>`
  - pure helpers for own-property checks, record recognition, bounded strings, exact enums, finite integers, and issue construction;
  - no I/O, global state, mutation, assertions, or coercion.
- `src/content/examples/validation-pipeline.test.ts`
  - table-driven examples from section 14;
  - deterministic property-order-independent results;
  - proof that returned commands do not alias caller-owned arrays/objects.
- Optional only if the first file becomes unclear: `src/content/examples/safe-update-mapping.ts` and its focused tests.

The executable seam begins after HTTP media and byte-limit enforcement because the static repository has no server adapter. Transport/decompression and transactional tests remain described as production integration responsibilities and must not be faked as unit coverage.

## 14. Test strategy and acceptance matrix

### Pure TypeScript matrix

| Case | Expected outcome | Boundary |
| --- | --- | --- |
| Minimal valid object | Fresh `DocumentCommand` with defaults | Structural + normalization |
| `null`, array, string, number | `invalid-root` | Structural |
| Missing `title`, `slug`, or `visibility` | `missing-field` at stable path | Structural |
| Extra `tenantId`, `ownerSubjectId`, `isAdmin`, `__proto__`, `constructor`, or `prototype` | `unknown-field`; no prototype change | Structural/mapping |
| `retentionDays: "30"`, `true`, fraction, `NaN`, or `Infinity` | Reject without coercion | Structural |
| Values exactly at every documented limit | Accept | Structural |
| Values one unit beyond every limit | Reject with stable code | Structural |
| Too many tags or duplicate tags | Reject | Structural/normalization |
| Tags distinct before but equal after normalization | `normalization-conflict` | Normalization |
| Invalid slug grammar or post-normalization length | Reject | Structural/normalization |
| Domain-invalid field combination | `semantic-conflict` | Semantic |
| Object with inherited allowed-looking properties | Inherited values ignored/rejected; never accepted as own input | Structural/mapping |
| Caller mutates the original array after success | Returned command remains unchanged | Mapping |
| Same fields in different property order | Identical value and deterministic issue order | Validator contract |

### Property and fuzz-oriented checks

- The validator never throws for JSON-compatible values within the unit-test resource envelope.
- Success always produces values satisfying the documented command predicate.
- Unknown keys can never appear in the output.
- Normalization is idempotent for every accepted command field.
- Validation never mutates the supplied object or nested arrays.
- Issue paths and codes remain stable even when human-readable messages change.

### Content and build tests for the later implementation slice

- Chapter schema validation and deterministic Chapter 05 publication order.
- At least three visuals, each with a caption and equivalent text.
- Stable anchors and search-index coverage for parsing, runtime validation, normalization, coercion, sanitization, DTO, mass assignment, prototype pollution, invariant, and Problem Details.
- Chapter-specific canonical, Open Graph/Twitter metadata, JSON-LD, sitemap entry, and previous/next navigation.
- Homepage progress denominator changes from four to five published chapters; existing local completion data remains valid.
- All external references pass the broken-link check.

### Browser and accessibility acceptance for the later implementation slice

- Desktop, 390 x 844, and 320 x 700 have no page-level or diagram-level horizontal overflow.
- Every visual reflows based on its actual container width, including within the lesson's narrower main column.
- No clipped nodes, overlapping connectors, compressed explanations, or inaccessible information conveyed by color alone.
- Tables, code-copy controls, contents navigation, notes, completion control, and previous/next navigation are keyboard accessible.
- Automated accessibility scan reports zero violations on the new route.
- Light, dark, and editorial themes preserve contrast and non-color meaning.
- The route is a readable prerendered document before client JavaScript.
- Browser console contains zero unexpected warnings or errors.

### Repository quality gate for the later implementation slice

Run the full repository contract from `AGENTS.md` and `docs/test-strategy.md`, including formatting, lint, strict types, unit tests, content validation, production build, hosting tests, search/persistence integration, responsive Playwright, accessibility, keyboard paths, broken links, metadata, sitemap, robots, performance budget, and console checks.

## 15. Debugging checklist and design questions

The published lesson must end with a checklist that asks:

1. Which exact boundary rejected or accepted the value?
2. What was the last trusted type before failure?
3. Was the actual media type and received/decompressed size checked?
4. Did parsing succeed while the root shape remained wrong?
5. Did a framework or assertion erase `unknown` without runtime proof?
6. Were unknown or inherited properties admitted?
7. Was a wrong primitive silently coerced?
8. Did normalization change length, equality, or uniqueness?
9. Does the rule need trusted context, authorization, or database evidence unavailable to the schema?
10. Could concurrent state invalidate the earlier decision before commit?
11. Are public errors stable and useful without echoing raw input or internal details?
12. Do resource/time limits protect both success and failure paths?

Knowledge checks must include at least these design questions:

- Where should an email's syntax, deliverability, ownership, and uniqueness each be decided?
- When is rejecting unknown fields safer than ignoring them, and when could versioned extensions justify a different policy?
- Why can normalization both reduce ambiguity and introduce a collision?
- Why does a valid `tenantId` string not authorize the request for that tenant?
- Which invariants must still be checked by a transaction after request validation passes?

## 16. ADR and contract decisions

No new application architecture decision is proposed.

- ADR-0001 remains intact: Chapter 05 will be typed static content and prerendered like existing chapters.
- ADR-0002 remains intact: no remote progress, account, or service state is added.
- ADR-0003 remains intact: prose, examples, and visuals must be original and primary-source reviewed.
- ADR-0004 remains intact: the canonical domain and deployment contract do not change.
- `openapi.yaml` remains unchanged because this chapter adds no product runtime API.
- `docs/threat-model.md` remains unchanged because section 11 models a fictional service and does not describe vulnerabilities in the static site.

A separate ADR, OpenAPI change, and product threat-model update are mandatory if a future task proposes a real request endpoint, parser/schema dependency as application infrastructure, server-side data, or database.

## 17. Primary-source basis

Reviewed 2026-08-31:

- [RFC 9110: HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.html) — content metadata and the semantics of `400`, `409`, `413`, `415`, and `422` responses.
- [RFC 8259: The JavaScript Object Notation Data Interchange Format](https://www.rfc-editor.org/rfc/rfc8259.html) — JSON grammar, number interoperability, Unicode strings, object-member uniqueness, and parser limits.
- [RFC 9457: Problem Details for HTTP APIs](https://www.rfc-editor.org/rfc/rfc9457.html) — standard problem fields, extension members, and safe client-facing error representation.
- [JSON Schema Draft 2020-12: Validation vocabulary](https://json-schema.org/draft/2020-12/json-schema-validation) — structural validation keywords, assertions, annotations, and format vocabulary.
- [JSON Schema Draft 2020-12: Core vocabulary](https://json-schema.org/draft/2020-12/json-schema-core) — schema processing model and vocabulary behavior.
- [Unicode Standard Annex #15: Unicode Normalization Forms](https://unicode.org/reports/tr15/) — NFC/NFD/NFKC/NFKD semantics, stability, and normalization boundaries.
- [OWASP Input Validation Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html) — early server-side validation, syntactic/semantic separation, allowlists, Unicode, length limits, and ReDoS awareness.
- [OWASP Mass Assignment Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Mass_Assignment_Cheat_Sheet.html) — DTOs and allowlisted fields as defenses against unintended client-controlled assignment.
- [OWASP Prototype Pollution Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Prototype_Pollution_Prevention_Cheat_Sheet.html) — unsafe dynamic assignment and prototype-chain defenses.

## 18. Human review gate

Implementation may start only after review confirms:

1. The six-question request flow is accurate and understandable without implying that every framework must use one exact function order.
2. Parsing, structural validation, normalization, sanitization, coercion, semantic validation, authorization, and persistence constraints remain clearly distinct.
3. The fictional request exposes enough complexity to teach the topic without turning the chapter into a framework or schema-library tutorial.
4. The unknown-key and server-owned-field policy is appropriate, including the deliberate rejection of implicit coercion and unsafe merge behavior.
5. The failure taxonomy assigns errors to the earliest boundary with enough evidence while preserving downstream authoritative checks.
6. The threat hypotheses cover resource exhaustion, format confusion, mass assignment, prototype pollution, normalization collisions, ReDoS, authorization, concurrency, and diagnostic leakage without presenting speculative issues as product findings.
7. The three visuals are original, useful, and specified for desktop, narrow containers, and 320 px without horizontal scrolling.
8. The proposed TypeScript surface and test matrix are small enough for one explainable, tested implementation commit.
9. The website remains static and Chapter 05 remains `Coming next` until a separate implementation approval.

Gate outcome: approved on 2026-08-31. `T-602E` implemented the reviewed contract without adding a product API, parser dependency, database, authentication, or remote state.
