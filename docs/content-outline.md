# Original curriculum outline

The sequence intentionally covers the same general backend learning journey as the reference, but every chapter will use original structure, prose, examples, diagrams, and citations.

Publication status: chapters 01–06 are fully authored. The approved curriculum direction inserts Networking and Packet Routing as proposed Chapter 07; Chapters 08–25 form the shifted public roadmap. The Chapter 07 coverage amendment and expanded technical proof are approved. The current runtime catalog remains unchanged until the public implementation slice passes its own review gate.

Chapter 05 follows the approved implementation contract in `docs/chapter-05-validation-spec.md`; verification evidence is recorded in `docs/validation/chapter-05-validation.md`.

Chapter 06 follows the approved implementation contract in `docs/chapter-06-layered-handling-spec.md`; verification evidence is recorded in `docs/validation/chapter-06-layered-handling.md`.

Chapter 07 follows the approved contract in `docs/chapter-07-networking-spec.md`. Visual direction 2, the Protocol Layer Observatory, was selected on 2026-08-31 as one centerpiece. The approved coverage amendment requires sixteen original sections and separate responsive evidence for link delivery, hub/switch behavior, subnetting, ARP, local and routed journeys, route repair, autonomous systems, and operations. The isolated expanded proof now covers eight modules and forty states; no route or runtime numbering changes occur before public implementation approval.

| No. | Status | Working title | First-principles promise | Core evidence |
| --- | --- | --- | --- | --- |
| 01 | Published | HTTP as a State Machine | Trace a request from bytes to semantics and explain HTTP properties without framework vocabulary. | RFC 9110/9112 and TypeScript server |
| 02 | Published | Routing and Request Dispatch | Derive routing from path matching, method dispatch, precedence, and request context. | TypeScript router implementation and ambiguity tests |
| 03 | Published | Representation and Serialization | Explain how data crosses process boundaries and where JSON, Protobuf, and schema evolution fail. | TypeScript encoders and compatibility matrix |
| 04 | Published | Identity, Authentication, and Authorization | Separate identity proof, session state, token validation, and per-resource policy decisions. | Session state machine, safe JWT validation boundary, executable authorization matrix, and threat hypotheses |
| 05 | Published | Validation at Trust Boundaries | Model parsing, validation, normalization, and safe transformation as distinct steps. | TypeScript failure taxonomy and schema tests |
| 06 | Published | Layered Request Handling | Derive handlers, services, repositories, middleware, and request-scoped context from change boundaries. | TypeScript dependency flow and tracing example |
| 07 | Proposed | Networking and Packet Routing | Build networking from local signals and frames through switching, subnets, ARP, routing tables, route repair, and inter-domain reachability. | Deterministic TypeScript network scenarios, eight responsive evidence modules, and accessible 3D protocol-layer and routed-topology views |
| 08 | Roadmap | Resource-Oriented API Design | Design predictable REST APIs from resources, invariants, idempotency, and evolution constraints. | OpenAPI examples and contract tests |
| 09 | Roadmap | Durable Data and Transactions | Explain indexes, isolation, consistency, and transactions from storage guarantees. | PostgreSQL plans and concurrency cases |
| 10 | Roadmap | Caching as Controlled Staleness | Treat caching as a consistency trade-off, not a speed switch. | Cache-aside, invalidation, stampede control |
| 11 | Roadmap | Deferred Work and Job Queues | Decide what leaves the request path and how retries, ordering, and idempotency interact. | Worker lifecycle and retry tests |
| 12 | Roadmap | Search Beyond SQL LIKE | Derive inverted indexes, analyzers, relevance, and synchronization trade-offs. | Elasticsearch indexing pipeline |
| 13 | Roadmap | Failure Semantics and Resilience | Build error taxonomies, deadlines, retries, circuit breakers, and graceful degradation. | Failure matrix and chaos cases |
| 14 | Roadmap | Service-to-Service Contracts | Compare HTTP, gRPC, messaging, and schema evolution based on coupling and delivery needs. | Protobuf contracts and deadlines |
| 15 | Roadmap | Configuration as a Runtime Contract | Separate deploy-time config, secrets, feature flags, and dynamic configuration. | Validation and rotation paths |
| 16 | Roadmap | Observability from Signals to Decisions | Connect logs, metrics, traces, SLOs, and alerts to debugging questions. | OpenTelemetry trace walkthrough |
| 17 | Roadmap | Graceful Lifecycle Management | Explain startup, readiness, draining, cancellation, and shutdown as one lifecycle. | Kubernetes termination timeline |
| 18 | Roadmap | Backend Security by Trust Boundary | Threat-model inputs, identity, data, dependencies, and infrastructure. | OWASP cases and secure defaults |
| 19 | Roadmap | Scaling the Request Path | Locate bottlenecks with queueing, profiling, capacity, and horizontal scale. | Load model and performance budget |
| 20 | Roadmap | Scaling Data and State | Compare replicas, partitioning, sharding, consistency, and migration strategies. | Partition keys and failure recovery |
| 21 | Roadmap | Concurrency, Parallelism, and Backpressure | Match execution models to CPU-bound and I/O-bound work while bounding load. | Event loop and worker pools |
| 22 | Roadmap | Containers and Delivery Systems | Derive reproducible builds, images, orchestration, health checks, and safe rollout. | Docker, Kubernetes, CI/CD pipeline |
| 23 | Roadmap | Tests as Executable Boundaries | Choose unit, integration, contract, E2E, property, and load tests by risk. | Test pyramid and ephemeral services |
| 24 | Roadmap | Messaging and Event Streams | Separate queues from logs and reason about delivery, ordering, replay, and schemas. | Kafka partitions and consumer groups |
| 25 | Roadmap | Real-Time Connections | Explain WebSocket/SSE lifecycles, presence, fan-out, ordering, and backpressure. | Connection registry and reconnect flow |

## Standard chapter contract

Every chapter must include:

1. Learning promise and prerequisites.
2. The underlying problem before the named technology.
3. Mental model and system boundary diagram.
4. A second visual that explains a decision, comparison, state change, or rollout.
5. TypeScript implementation examples.
6. Production failure modes and trade-offs.
7. Debugging checklist.
8. Knowledge checks or design questions.
9. Linked glossary terms.
10. Primary technical references with review date.

Every visual must be original, captioned, readable without color, and followed by an equivalent text explanation. Qualitative comparisons must be labeled as qualitative; the project does not present invented benchmark values as measured evidence.
