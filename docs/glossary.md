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

- **Backpressure**: A mechanism that slows or rejects incoming work when a downstream consumer cannot keep up.
- **Consistency**: Rules describing what reads may observe after writes.
- **Contract**: A versioned promise between components, expressed through schema, protocol, behavior, and failure semantics.
- **Deadline**: The latest time by which an operation remains useful; propagated across service boundaries.
- **Durability**: The guarantee that acknowledged state survives defined failures.
- **Idempotency**: The property that repeating an operation has the same intended effect as performing it once.
- **Invariant**: A condition that must remain true across valid state transitions.
- **Isolation**: The degree to which concurrent operations behave as if they ran separately.
- **Latency**: Time required for an operation, best described as a distribution rather than an average.
- **Observability**: The ability to infer internal system state from outputs such as logs, metrics, and traces.
- **Queueing**: Waiting introduced when arrival rate temporarily exceeds service capacity.
- **Retry budget**: A bound on additional load and time consumed by retry attempts.
- **Serialization**: Converting structured in-memory data into a transport or storage representation.
- **Statelessness**: Processing each request without relying on server-local conversational memory from previous requests.
- **Throughput**: Completed work per unit of time under defined conditions.
- **Trust boundary**: A point where data or control crosses between parties with different security assumptions.

This glossary will expand alongside authored chapters. Each definition must be short, original, and link to a deeper chapter section.
