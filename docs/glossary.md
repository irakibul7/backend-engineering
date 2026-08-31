# Project glossary

## Product terms

- **Catalog**: The ordered home-page list of published chapters.
- **Chapter**: A self-contained long-form backend field manual.
- **Section**: A deep-linkable subdivision of a chapter.
- **Study note**: Private Markdown associated with one chapter or the complete series.
- **Completion**: A learner-controlled local flag; it is not inferred from scroll position.
- **Original theme**: The warm editorial paper palette inspired by the reference's reading mode.
- **Search document**: Build-generated searchable metadata for a chapter, section, or glossary term.
- **Published**: Content included in navigation, search, sitemap, and production build.
- **Draft**: Content available only to development or preview builds.
- **Primary source**: A specification, official documentation page, standards document, or original research paper.

## Backend terms used across chapters

- **Assurance**: The confidence attached to an authentication result, based on the authenticator and ceremony used; sensitive actions can require a higher level through [step-up authentication](/chapters/identity-authentication-authorization/#authenticators-and-assurance).
- **Authentication**: Establishing confidence that a claimant controls one or more authenticators bound to a subject; it does not itself grant access to a resource. See [four separate questions](/chapters/identity-authentication-authorization/#four-separate-questions).
- **Authorization**: A policy decision about whether a principal may perform an action on a resource under the current context. See [authorization per resource](/chapters/identity-authentication-authorization/#authorization-per-resource).
- **Backpressure**: A mechanism that slows or rejects incoming work when a downstream consumer cannot keep up.
- **Bearer token**: A credential whose possession is sufficient for use unless the protocol adds sender constraints. See [cookies and bearer tokens](/chapters/identity-authentication-authorization/#cookies-and-bearer-tokens).
- **Canonicalization**: Selecting one documented representation from values treated as equivalent for comparison, indexing, or storage. See [transform with a reason](/chapters/validation-at-trust-boundaries/#transform-with-a-reason).
- **Claim**: A statement carried by a token; it remains an untrusted policy input until the token and the application's validation profile succeed. See [JWT validation boundary](/chapters/identity-authentication-authorization/#jwt-validation-boundary).
- **Coercion**: Converting one runtime type into another, such as a numeric string into a number; command boundaries should do this only when the public contract explicitly permits it.
- **Consistency**: Rules describing what reads may observe after writes.
- **Contract**: A versioned promise between components, expressed through schema, protocol, behavior, and failure semantics.
- **Deadline**: The latest time by which an operation remains useful; propagated across service boundaries.
- **DTO**: A data-transfer object constructed at a boundary with only the fields and runtime types admitted by that contract. See [reduce client authority](/chapters/validation-at-trust-boundaries/#reduce-client-authority).
- **Durability**: The guarantee that acknowledged state survives defined failures.
- **Idempotency**: The property that repeating an operation has the same intended effect as performing it once.
- **Invariant**: A condition that must remain true across valid state transitions.
- **Principal**: The subject plus the validated security context used by an authorization decision.
- **Revocation**: A state transition that makes previously accepted session or token material no longer acceptable. See [revocation, recovery, and audit](/chapters/identity-authentication-authorization/#revocation-recovery-and-audit).
- **Isolation**: The degree to which concurrent operations behave as if they ran separately.
- **Latency**: Time required for an operation, best described as a distribution rather than an average.
- **Mass assignment**: Binding client-controlled fields directly onto an internal model, which can grant the client authority over fields it must not control. See [reduce client authority](/chapters/validation-at-trust-boundaries/#reduce-client-authority).
- **Normalization**: A deliberate field-specific transformation into a documented representation. See [transform with a reason](/chapters/validation-at-trust-boundaries/#transform-with-a-reason).
- **Observability**: The ability to infer internal system state from outputs such as logs, metrics, and traces.
- **Parsing**: Converting bytes or text according to a representation's syntax without proving application shape or meaning. See [parsing is not validation](/chapters/validation-at-trust-boundaries/#parsing-is-not-validation).
- **Problem Details**: The RFC 9457 object format for machine-readable HTTP API error details.
- **Prototype pollution**: Changing an object's prototype chain through unsafe attacker-controlled property assignment or merge behavior.
- **Queueing**: Waiting introduced when arrival rate temporarily exceeds service capacity.
- **Retry budget**: A bound on additional load and time consumed by retry attempts.
- **Serialization**: Converting structured in-memory data into a transport or storage representation.
- **Runtime validation**: Checking the value that actually arrived while the program runs, rather than relying on a static type annotation.
- **Sanitization**: Transforming content for safety in a particular output or interpreter context; it is not a synonym for input validation.
- **Semantic validation**: Checking whether structurally valid values make sense together and in the current domain context. See [three kinds of validation](/chapters/validation-at-trust-boundaries/#three-kinds-of-validation).
- **Session**: Server-recognized state that continues an authenticated interaction across requests and can expire, rotate, or be revoked. See [session lifecycle](/chapters/identity-authentication-authorization/#session-lifecycle).
- **Step-up authentication**: A new authentication event that raises assurance for a sensitive action or a bounded session interval.
- **Subject**: The entity named by an identity assertion, normally identified within an issuer's namespace.
- **Tenant**: An isolation boundary containing principals and resources for one organization; matching a role never bypasses it.
- **Statelessness**: Processing each request without relying on server-local conversational memory from previous requests.
- **Structural validation**: Checking root kind, allowed keys, required fields, primitive types, formats, sizes, and ranges before constructing a DTO.
- **Throughput**: Completed work per unit of time under defined conditions.
- **Trust boundary**: A point where data or control crosses between parties with different security assumptions.

This glossary will expand alongside authored chapters. Each definition must be short, original, and link to a deeper chapter section.
