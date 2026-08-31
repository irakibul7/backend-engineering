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
- **Claim**: A statement carried by a token; it remains an untrusted policy input until the token and the application's validation profile succeed. See [JWT validation boundary](/chapters/identity-authentication-authorization/#jwt-validation-boundary).
- **Consistency**: Rules describing what reads may observe after writes.
- **Contract**: A versioned promise between components, expressed through schema, protocol, behavior, and failure semantics.
- **Deadline**: The latest time by which an operation remains useful; propagated across service boundaries.
- **Durability**: The guarantee that acknowledged state survives defined failures.
- **Idempotency**: The property that repeating an operation has the same intended effect as performing it once.
- **Invariant**: A condition that must remain true across valid state transitions.
- **Principal**: The subject plus the validated security context used by an authorization decision.
- **Revocation**: A state transition that makes previously accepted session or token material no longer acceptable. See [revocation, recovery, and audit](/chapters/identity-authentication-authorization/#revocation-recovery-and-audit).
- **Isolation**: The degree to which concurrent operations behave as if they ran separately.
- **Latency**: Time required for an operation, best described as a distribution rather than an average.
- **Observability**: The ability to infer internal system state from outputs such as logs, metrics, and traces.
- **Queueing**: Waiting introduced when arrival rate temporarily exceeds service capacity.
- **Retry budget**: A bound on additional load and time consumed by retry attempts.
- **Serialization**: Converting structured in-memory data into a transport or storage representation.
- **Session**: Server-recognized state that continues an authenticated interaction across requests and can expire, rotate, or be revoked. See [session lifecycle](/chapters/identity-authentication-authorization/#session-lifecycle).
- **Step-up authentication**: A new authentication event that raises assurance for a sensitive action or a bounded session interval.
- **Subject**: The entity named by an identity assertion, normally identified within an issuer's namespace.
- **Tenant**: An isolation boundary containing principals and resources for one organization; matching a role never bypasses it.
- **Statelessness**: Processing each request without relying on server-local conversational memory from previous requests.
- **Throughput**: Completed work per unit of time under defined conditions.
- **Trust boundary**: A point where data or control crosses between parties with different security assumptions.

This glossary will expand alongside authored chapters. Each definition must be short, original, and link to a deeper chapter section.
