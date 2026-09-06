import type { Chapter } from "./types";
export type { Chapter, LessonSection, LessonVisual } from "./types";

export const chapters: Chapter[] = [
  {
    "number": 1,
    "slug": "http-as-a-state-machine",
    "title": "HTTP as a State Machine",
    "duration": "35 min",
    "status": "published",
    "summary": "Requests, representations, method semantics, caching, and CORS from the protocol boundary inward.",
    "promise": "Trace a request from bytes to semantics without hiding behind framework vocabulary.",
    "tags": [
      "HTTP",
      "CORS",
      "caching",
      "protocols"
    ],
    "sectionIndex": [
      {
        "id": "protocol-contract",
        "title": "A protocol is a shared contract"
      },
      {
        "id": "request-lifecycle",
        "title": "Follow one request end to end"
      },
      {
        "id": "method-semantics",
        "title": "Methods carry operational semantics"
      },
      {
        "id": "representation",
        "title": "Headers describe the representation"
      },
      {
        "id": "caching",
        "title": "Caching is a freshness agreement"
      },
      {
        "id": "cors",
        "title": "CORS is a browser read policy"
      }
    ]
  },
  {
    "number": 2,
    "slug": "routing-and-request-dispatch",
    "title": "Routing and Request Dispatch",
    "duration": "28 min",
    "status": "published",
    "summary": "Path matching, method dispatch, precedence, parameters, and request context.",
    "promise": "Derive a router from matching rules and make ambiguity observable.",
    "tags": [
      "routing",
      "handlers",
      "request context"
    ],
    "sectionIndex": [
      {
        "id": "route-as-decision-table",
        "title": "A route is a decision rule"
      },
      {
        "id": "parse-before-match",
        "title": "Parse the target before matching"
      },
      {
        "id": "specificity-and-precedence",
        "title": "Precedence is part of the API contract"
      },
      {
        "id": "parameters-are-input",
        "title": "Path parameters are still untrusted input"
      },
      {
        "id": "method-dispatch",
        "title": "Separate 404 from 405"
      },
      {
        "id": "request-context",
        "title": "Carry context without global state"
      },
      {
        "id": "debug-the-decision",
        "title": "Debug the routing decision"
      }
    ]
  },
  {
    "number": 3,
    "slug": "representation-and-serialization",
    "title": "Representation and Serialization",
    "duration": "30 min",
    "status": "published",
    "summary": "How values cross process boundaries through JSON, schemas, compatibility rules, and binary formats.",
    "promise": "Choose a representation by contract and evolution cost, not familiarity.",
    "tags": [
      "JSON",
      "serialization",
      "schemas",
      "Protobuf"
    ],
    "sectionIndex": [
      {
        "id": "values-stop-at-the-boundary",
        "title": "Values stop at the process boundary"
      },
      {
        "id": "json-is-not-your-type-system",
        "title": "JSON is syntax, not your type system"
      },
      {
        "id": "round-trips-are-designed",
        "title": "Round trips must be designed"
      },
      {
        "id": "decode-in-stages",
        "title": "Decode untrusted bytes in stages"
      },
      {
        "id": "schema-evolution",
        "title": "Schema evolution is a deployment problem"
      },
      {
        "id": "binary-formats-and-protobuf",
        "title": "Binary does not automatically mean better"
      },
      {
        "id": "representation-decisions",
        "title": "Choose a representation by constraints"
      },
      {
        "id": "debug-the-wire-contract",
        "title": "Debug the wire contract"
      }
    ]
  },
  {
    "number": 4,
    "slug": "identity-authentication-authorization",
    "title": "Identity, Authentication, and Authorization",
    "duration": "42 min",
    "status": "published",
    "summary": "Identity proof, session lifecycle, token validation, per-resource policy, tenant isolation, and revocation.",
    "promise": "Separate who a caller is, how that was proved, and what the caller may do now.",
    "tags": [
      "authentication",
      "authorization",
      "sessions",
      "JWT",
      "RBAC",
      "ABAC",
      "ReBAC",
      "step-up"
    ],
    "sectionIndex": [
      {
        "id": "four-separate-questions",
        "title": "One request crosses four security boundaries"
      },
      {
        "id": "authenticators-and-assurance",
        "title": "Authenticators provide different kinds of assurance"
      },
      {
        "id": "session-lifecycle",
        "title": "A session is a revocable state machine"
      },
      {
        "id": "cookies-and-bearer-tokens",
        "title": "Credential transport changes the threat model"
      },
      {
        "id": "jwt-validation-boundary",
        "title": "A JWT is a claims container, not session magic"
      },
      {
        "id": "authorization-per-resource",
        "title": "Authorization is a resource decision"
      },
      {
        "id": "revocation-recovery-and-audit",
        "title": "Security state must be able to move backward"
      },
      {
        "id": "debugging-and-design-review",
        "title": "Debug the boundary that made the decision"
      }
    ]
  },
  {
    "number": 5,
    "slug": "validation-at-trust-boundaries",
    "title": "Validation at Trust Boundaries",
    "duration": "32 min",
    "status": "published",
    "summary": "Resource limits, parsing, strict runtime structure, normalization, domain invariants, safe mapping, and failure ownership.",
    "promise": "Follow one request from raw JSON to a safe command, and see exactly where every rejection belongs.",
    "tags": [
      "validation",
      "security",
      "schemas",
      "normalization",
      "DTO",
      "mass assignment",
      "Problem Details"
    ],
    "sectionIndex": [
      {
        "id": "follow-one-request",
        "title": "Follow one request"
      },
      {
        "id": "parsing-is-not-validation",
        "title": "Parsing only means “I can read it”"
      },
      {
        "id": "three-kinds-of-validation",
        "title": "Check type, syntax, then meaning"
      },
      {
        "id": "transform-with-a-reason",
        "title": "Transform only with a reason"
      },
      {
        "id": "reduce-client-authority",
        "title": "Let the client control less"
      },
      {
        "id": "bound-the-work",
        "title": "Stop oversized work early"
      },
      {
        "id": "place-each-rule",
        "title": "Put each rule where the evidence exists"
      },
      {
        "id": "return-useful-errors",
        "title": "Return an error the client can act on"
      },
      {
        "id": "build-the-pipeline",
        "title": "Build one narrow transition at a time"
      },
      {
        "id": "test-the-boundaries",
        "title": "Test the edges, not only the happy path"
      }
    ]
  },
  {
    "number": 6,
    "slug": "layered-request-handling",
    "title": "Layered Request Handling",
    "duration": "34 min",
    "status": "published",
    "summary": "Handlers, services, repositories, middleware, dependencies, and request-scoped context.",
    "promise": "Follow one request through every layer and give each decision one clear owner.",
    "tags": [
      "architecture",
      "handlers",
      "middleware",
      "services",
      "repositories",
      "dependency injection",
      "request context",
      "cancellation"
    ],
    "sectionIndex": [
      {
        "id": "one-request-many-jobs",
        "title": "One request contains many jobs"
      },
      {
        "id": "handler-translates",
        "title": "The handler translates"
      },
      {
        "id": "service-coordinates",
        "title": "The service coordinates one use case"
      },
      {
        "id": "domain-decides",
        "title": "The domain decides what may change"
      },
      {
        "id": "repository-speaks-domain",
        "title": "A repository speaks application language"
      },
      {
        "id": "middleware-wraps",
        "title": "Middleware wraps the path"
      },
      {
        "id": "context-stays-scoped",
        "title": "Request context stays small and scoped"
      },
      {
        "id": "compose-at-the-edge",
        "title": "Compose dependencies at the edge"
      },
      {
        "id": "fail-cancel-and-clean-up",
        "title": "Failures keep their owner"
      },
      {
        "id": "test-the-seams",
        "title": "Test the seams you designed"
      }
    ]
  },
  {
    "number": 7,
    "slug": "networking-and-packet-routing",
    "title": "Networking and Packet Routing",
    "duration": "55 min",
    "status": "published",
    "summary": "Links, prefixes, ARP, packet forwarding, route repair, and Internet reachability with a controlled networking lab.",
    "promise": "Follow a packet from local signals to routed delivery, and explain the evidence behind every next-hop decision.",
    "tags": [
      "networking",
      "IPv4",
      "ARP",
      "CIDR",
      "routing",
      "BGP",
      "OSPF",
      "DHCP",
      "TCP",
      "UDP"
    ],
    "sectionIndex": [
      {
        "id": "from-signal-to-frame",
        "title": "From a signal to a frame"
      },
      {
        "id": "hubs-flood-switches-learn",
        "title": "Hubs flood; switches learn"
      },
      {
        "id": "why-mac-does-not-scale",
        "title": "Why MAC addresses do not describe a global route"
      },
      {
        "id": "ip-prefixes-and-subnets",
        "title": "Read an IPv4 prefix as a bit boundary"
      },
      {
        "id": "local-or-next-hop",
        "title": "Choose direct delivery or a next hop"
      },
      {
        "id": "arp-resolves-a-neighbor",
        "title": "ARP resolves the local neighbor"
      },
      {
        "id": "encapsulation-without-magic",
        "title": "Keep the layers separate"
      },
      {
        "id": "same-subnet-delivery",
        "title": "Follow a same-subnet delivery"
      },
      {
        "id": "cross-network-delivery",
        "title": "Replace the envelope at each routed link"
      },
      {
        "id": "router-forwarding",
        "title": "Treat forwarding as a sequence of checks"
      },
      {
        "id": "routing-table-as-source-of-truth",
        "title": "Read the route fields before guessing"
      },
      {
        "id": "longest-prefix-wins",
        "title": "Longest matching prefix wins"
      },
      {
        "id": "when-the-default-route-fails",
        "title": "Repair a missing specific route"
      },
      {
        "id": "from-lan-to-autonomous-systems",
        "title": "Separate reachability learning from forwarding"
      },
      {
        "id": "a-container-network-lab",
        "title": "Compare a route repair before and after"
      },
      {
        "id": "observe-debug-and-reason",
        "title": "Ask one question of each observation"
      }
    ]
  },
  {
    "number": 8,
    "slug": "resource-oriented-api-design",
    "title": "Resource-Oriented API Design",
    "duration": "Roadmap",
    "status": "roadmap",
    "summary": "Resources, invariants, idempotency, pagination, errors, and contract evolution.",
    "promise": "Design APIs from domain behavior before choosing endpoint shapes.",
    "tags": [
      "REST",
      "OpenAPI",
      "contracts"
    ]
  },
  {
    "number": 9,
    "slug": "durable-data-and-transactions",
    "title": "Durable Data and Transactions",
    "duration": "Roadmap",
    "status": "roadmap",
    "summary": "Indexes, isolation, consistency, transactions, and query planning.",
    "promise": "Reason from storage guarantees to application correctness.",
    "tags": [
      "PostgreSQL",
      "transactions",
      "indexes"
    ]
  },
  {
    "number": 10,
    "slug": "caching-as-controlled-staleness",
    "title": "Caching as Controlled Staleness",
    "duration": "Roadmap",
    "status": "roadmap",
    "summary": "Cache placement, invalidation, stampede control, and consistency trade-offs.",
    "promise": "Treat every cache as an explicit staleness budget.",
    "tags": [
      "Redis",
      "caching",
      "consistency"
    ]
  },
  {
    "number": 11,
    "slug": "deferred-work-and-job-queues",
    "title": "Deferred Work and Job Queues",
    "duration": "Roadmap",
    "status": "roadmap",
    "summary": "Retries, ordering, idempotency, scheduling, and worker lifecycle.",
    "promise": "Move work off the request path without losing delivery semantics.",
    "tags": [
      "queues",
      "workers",
      "BullMQ"
    ]
  },
  {
    "number": 12,
    "slug": "search-beyond-sql-like",
    "title": "Search Beyond SQL LIKE",
    "duration": "Roadmap",
    "status": "roadmap",
    "summary": "Inverted indexes, analyzers, relevance, and synchronization.",
    "promise": "Understand what a search engine stores before tuning relevance.",
    "tags": [
      "Elasticsearch",
      "search",
      "indexing"
    ]
  },
  {
    "number": 13,
    "slug": "failure-semantics-and-resilience",
    "title": "Failure Semantics and Resilience",
    "duration": "Roadmap",
    "status": "roadmap",
    "summary": "Deadlines, retries, circuit breakers, bulkheads, and graceful degradation.",
    "promise": "Design the failure path before production designs it for you.",
    "tags": [
      "resilience",
      "retries",
      "fault tolerance"
    ]
  },
  {
    "number": 14,
    "slug": "service-to-service-contracts",
    "title": "Service-to-Service Contracts",
    "duration": "Roadmap",
    "status": "roadmap",
    "summary": "HTTP, gRPC, messaging, deadlines, and schema evolution.",
    "promise": "Choose a protocol by coupling and delivery needs.",
    "tags": [
      "gRPC",
      "microservices",
      "Protobuf"
    ]
  },
  {
    "number": 15,
    "slug": "configuration-as-a-runtime-contract",
    "title": "Configuration as a Runtime Contract",
    "duration": "Roadmap",
    "status": "roadmap",
    "summary": "Deploy-time configuration, secrets, validation, flags, and rotation.",
    "promise": "Make invalid configuration fail before traffic arrives.",
    "tags": [
      "configuration",
      "secrets",
      "feature flags"
    ]
  },
  {
    "number": 16,
    "slug": "observability-from-signals-to-decisions",
    "title": "Observability from Signals to Decisions",
    "duration": "Roadmap",
    "status": "roadmap",
    "summary": "Logs, metrics, traces, SLOs, and actionable alerts.",
    "promise": "Start with debugging questions and derive the telemetry you need.",
    "tags": [
      "OpenTelemetry",
      "logging",
      "metrics",
      "tracing"
    ]
  },
  {
    "number": 17,
    "slug": "graceful-lifecycle-management",
    "title": "Graceful Lifecycle Management",
    "duration": "Roadmap",
    "status": "roadmap",
    "summary": "Startup, readiness, draining, cancellation, and shutdown.",
    "promise": "Treat process lifecycle as part of request correctness.",
    "tags": [
      "shutdown",
      "Kubernetes",
      "reliability"
    ]
  },
  {
    "number": 18,
    "slug": "backend-security-by-trust-boundary",
    "title": "Backend Security by Trust Boundary",
    "duration": "Roadmap",
    "status": "roadmap",
    "summary": "Threat modeling inputs, identity, data, dependencies, and infrastructure.",
    "promise": "Secure transitions between trust zones instead of memorizing vulnerability names.",
    "tags": [
      "security",
      "OWASP",
      "threat modeling"
    ]
  },
  {
    "number": 19,
    "slug": "scaling-the-request-path",
    "title": "Scaling the Request Path",
    "duration": "Roadmap",
    "status": "roadmap",
    "summary": "Profiling, capacity, queues, load balancing, and horizontal scale.",
    "promise": "Find the bottleneck before adding machines.",
    "tags": [
      "scaling",
      "performance",
      "load balancing"
    ]
  },
  {
    "number": 20,
    "slug": "scaling-data-and-state",
    "title": "Scaling Data and State",
    "duration": "Roadmap",
    "status": "roadmap",
    "summary": "Replicas, partitioning, sharding, consistency, and migration.",
    "promise": "Scale state without losing the invariants that make it useful.",
    "tags": [
      "sharding",
      "replication",
      "consistency"
    ]
  },
  {
    "number": 21,
    "slug": "concurrency-parallelism-backpressure",
    "title": "Concurrency, Parallelism, and Backpressure",
    "duration": "Roadmap",
    "status": "roadmap",
    "summary": "Event loops, worker pools, CPU-bound work, I/O, and bounded load.",
    "promise": "Match the execution model to the work and its capacity limit.",
    "tags": [
      "concurrency",
      "event loop",
      "backpressure"
    ]
  },
  {
    "number": 22,
    "slug": "containers-and-delivery-systems",
    "title": "Containers and Delivery Systems",
    "duration": "Roadmap",
    "status": "roadmap",
    "summary": "Images, orchestration, health checks, CI/CD, and safe rollout.",
    "promise": "Make a release reproducible before making it frequent.",
    "tags": [
      "Docker",
      "Kubernetes",
      "CI/CD"
    ]
  },
  {
    "number": 23,
    "slug": "tests-as-executable-boundaries",
    "title": "Tests as Executable Boundaries",
    "duration": "Roadmap",
    "status": "roadmap",
    "summary": "Unit, integration, contract, E2E, property, and load tests by risk.",
    "promise": "Choose tests by the boundary that can fail.",
    "tags": [
      "testing",
      "contracts",
      "Playwright"
    ]
  },
  {
    "number": 24,
    "slug": "messaging-and-event-streams",
    "title": "Messaging and Event Streams",
    "duration": "Roadmap",
    "status": "roadmap",
    "summary": "Queues, logs, delivery, ordering, replay, schemas, and consumer groups.",
    "promise": "Separate message transport from the business guarantee you need.",
    "tags": [
      "Kafka",
      "messaging",
      "events"
    ]
  },
  {
    "number": 25,
    "slug": "real-time-connections",
    "title": "Real-Time Connections",
    "duration": "Roadmap",
    "status": "roadmap",
    "summary": "WebSocket and SSE lifecycles, presence, fan-out, ordering, and reconnects.",
    "promise": "Design the connection lifecycle, not only the happy-path message.",
    "tags": [
      "WebSockets",
      "SSE",
      "real-time"
    ]
  }
];

export const publishedChapters = chapters.filter((chapter) => chapter.status === "published");
export const launchChapters = chapters.filter((chapter) => chapter.status === "published");
export const roadmapChapters = chapters.filter((chapter) => chapter.status === "roadmap");

export function chapterHref(chapter: Chapter) {
  if (chapter.status === "published") return `/chapters/${chapter.slug}/`;
  if (chapter.status === "coming-next") return `/#${chapter.slug}`;
  return `/roadmap/#${chapter.slug}`;
}

export function chapterBySlug(slug: string) {
  return publishedChapters.find((chapter) => chapter.slug === slug);
}
