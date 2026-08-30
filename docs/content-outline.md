# Original curriculum outline

The sequence intentionally covers the same general backend learning journey as the reference, but every chapter will use original structure, prose, examples, diagrams, and citations.

Launch status: chapters 01–06 are the fully authored first release. Chapters 07–24 form the public roadmap.

| No. | Status | Working title | First-principles promise | Core evidence |
| --- | --- | --- | --- | --- |
| 01 | Launch | HTTP as a State Machine | Trace a request from bytes to semantics and explain HTTP properties without framework vocabulary. | RFC 9110/9112 and TypeScript server |
| 02 | Launch | Routing and Request Dispatch | Derive routing from path matching, method dispatch, precedence, and request context. | TypeScript router implementation and ambiguity tests |
| 03 | Launch | Representation and Serialization | Explain how data crosses process boundaries and where JSON, Protobuf, and schema evolution fail. | TypeScript encoders and compatibility matrix |
| 04 | Launch | Identity, Authentication, and Authorization | Separate identity proof, session state, and policy decisions. | TypeScript session/JWT flows and authorization matrix |
| 05 | Launch | Validation at Trust Boundaries | Model parsing, validation, normalization, and safe transformation as distinct steps. | TypeScript failure taxonomy and schema tests |
| 06 | Launch | Layered Request Handling | Derive handlers, services, repositories, middleware, and request-scoped context from change boundaries. | TypeScript dependency flow and tracing example |
| 07 | Roadmap | Resource-Oriented API Design | Design predictable REST APIs from resources, invariants, idempotency, and evolution constraints. | OpenAPI examples and contract tests |
| 08 | Roadmap | Durable Data and Transactions | Explain indexes, isolation, consistency, and transactions from storage guarantees. | PostgreSQL plans and concurrency cases |
| 09 | Roadmap | Caching as Controlled Staleness | Treat caching as a consistency trade-off, not a speed switch. | Cache-aside, invalidation, stampede control |
| 10 | Roadmap | Deferred Work and Job Queues | Decide what leaves the request path and how retries, ordering, and idempotency interact. | Worker lifecycle and retry tests |
| 11 | Roadmap | Search Beyond SQL LIKE | Derive inverted indexes, analyzers, relevance, and synchronization trade-offs. | Elasticsearch indexing pipeline |
| 12 | Roadmap | Failure Semantics and Resilience | Build error taxonomies, deadlines, retries, circuit breakers, and graceful degradation. | Failure matrix and chaos cases |
| 13 | Roadmap | Service-to-Service Contracts | Compare HTTP, gRPC, messaging, and schema evolution based on coupling and delivery needs. | Protobuf contracts and deadlines |
| 14 | Roadmap | Configuration as a Runtime Contract | Separate deploy-time config, secrets, feature flags, and dynamic configuration. | Validation and rotation paths |
| 15 | Roadmap | Observability from Signals to Decisions | Connect logs, metrics, traces, SLOs, and alerts to debugging questions. | OpenTelemetry trace walkthrough |
| 16 | Roadmap | Graceful Lifecycle Management | Explain startup, readiness, draining, cancellation, and shutdown as one lifecycle. | Kubernetes termination timeline |
| 17 | Roadmap | Backend Security by Trust Boundary | Threat-model inputs, identity, data, dependencies, and infrastructure. | OWASP cases and secure defaults |
| 18 | Roadmap | Scaling the Request Path | Locate bottlenecks with queueing, profiling, capacity, and horizontal scale. | Load model and performance budget |
| 19 | Roadmap | Scaling Data and State | Compare replicas, partitioning, sharding, consistency, and migration strategies. | Partition keys and failure recovery |
| 20 | Roadmap | Concurrency, Parallelism, and Backpressure | Match execution models to CPU-bound and I/O-bound work while bounding load. | Event loop and worker pools |
| 21 | Roadmap | Containers and Delivery Systems | Derive reproducible builds, images, orchestration, health checks, and safe rollout. | Docker, Kubernetes, CI/CD pipeline |
| 22 | Roadmap | Tests as Executable Boundaries | Choose unit, integration, contract, E2E, property, and load tests by risk. | Test pyramid and ephemeral services |
| 23 | Roadmap | Messaging and Event Streams | Separate queues from logs and reason about delivery, ordering, replay, and schemas. | Kafka partitions and consumer groups |
| 24 | Roadmap | Real-Time Connections | Explain WebSocket/SSE lifecycles, presence, fan-out, ordering, and backpressure. | Connection registry and reconnect flow |

## Standard chapter contract

Every chapter must include:

1. Learning promise and prerequisites.
2. The underlying problem before the named technology.
3. Mental model and system boundary diagram.
4. Protocol or data-flow walkthrough.
5. TypeScript implementation examples.
6. Production failure modes and trade-offs.
7. Debugging checklist.
8. Knowledge checks or design questions.
9. Linked glossary terms.
10. Primary technical references with review date.
