import type { LessonSection } from "../types";
import { setup, nextSteps } from "./field-notes-shared.ts";

export const tracingSections: LessonSection[] = [
  {
    id: "locate-time-before-optimizing", number: "01", label: "Problem and prerequisites", title: "The document list feels slow; locate the time",
    introduction: "A request duration tells you that something took time, but not which boundary needs a change.",
    paragraphs: [
      "In the hypothetical Field Notes application, authors list their newest documents after buying publication. A growing table can turn a simple list into a scan and sort. Before adding a cache or more API processes, follow one request through transport handling, application work, the database query and JSON serialization. Use the same documents and Node process as the payment and worker labs.",
      "Prerequisites: layered request handling, the networking chapter's distinction between application and transport, SQL WHERE/ORDER BY/LIMIT, and the previous two case studies. No OpenTelemetry account or collector is required. The lab uses explicit local span context so you can inspect relationships without hiding them behind auto-instrumentation.",
      "The fixture has 100000 generated documents across 100 author values plus two payment documents. A request for author-42 returns 20 rows ordered by created descending. We compare the query with and without an index on (owner, created DESC). This is a controlled workload, not a production incident or a claim about the site's traffic.",
    ],
    links: [nextSteps[3], { title: "Foundation: networking and packet routing", url: "/chapters/networking-and-packet-routing/" }, nextSteps[4], nextSteps[5]],
    visuals: [{ kind: "flow", label: "One request, nested observations", stages: [
      { title: "Client", detail: "Time fetch until the entire response body is read." },
      { title: "HTTP span", detail: "From handler entry to response enqueue." },
      { title: "Service span", detail: "Coordinate document listing and own the database child." },
      { title: "Query span", detail: "Prepare, execute and materialize the SQLite rows." },
    ], alternative: "Client timing includes reading the complete response. The HTTP span contains the document-list service span, which contains the SQLite query span. Serialization is a sibling of the service span under HTTP. The server root ends before the client necessarily receives the response." }],
  },
  setup,
  {
    id: "make-context-explicit", number: "03", label: "Instrumentation", title: "Carry trace identity through each boundary",
    introduction: "A trace groups one request; a parent span identifies the operation that called a child.",
    paragraphs: [
      "trace.mjs creates a random 128-bit trace id and a random 64-bit id per span. Each request gets a fresh trace object; no mutable global current-request variable exists. server.mjs passes each parent id explicitly into the next synchronous operation. The response exposes X-Trace-Id so the caller can find its four JSON span records in the API terminal.",
      "http GET /documents is the root. documents.list is its child; sqlite SELECT documents is a child of documents.list. json.serialize is another child of the root. Timings use performance.now, which is monotonic within the process. The query measurement includes statement preparation, execution and row materialization; it is not pure database-engine execution time.",
      "The helper captures errors in finally, so a thrown query still records error spans. It deliberately instruments synchronous operations only. A Promise would return before its eventual completion and produce a misleading duration. Real asynchronous propagation should use maintained OpenTelemetry instrumentation and its context management, not this helper copied unchanged around an async handler.",
      "These records illustrate trace structure but are not OTLP, an SDK exporter or a W3C traceparent implementation. The lab generates its own root and ignores incoming trace context. A real public ingress validates traceparent and decides whether to trust sampling decisions; never treat a trace id as authentication. Cross-service traces need propagation, compatible clocks and deliberate sampling.",
    ],
    code: { filename: "server.mjs · nested query spans", source: `const rows = trace.span('documents.list', root, (service) => trace.span('sqlite SELECT documents', service,
  () => db.prepare(LIST_SQL).all((url.searchParams.get('owner') ?? 'author-42').slice(0, 80))));` },
  },
  {
    id: "capture-the-baseline", number: "04", label: "Inputs and expected output", title: "Start with an unindexed request and its query plan",
    introduction: "Record the access path and returned rows before changing anything.",
    paragraphs: [
      "Seed the same database used by the running API, remove the experiment's index if a previous run created it, and inspect the plan. The query is parameterized; owner input never becomes SQL syntax. The list has a bounded result size. Generated timestamps are unique in this workload, so the order is deterministic; a real schema needs a tie-breaker and a corresponding pagination contract.",
      "The HTTP response should contain 20 objects with id, title and created. The first id is fixture-99942. X-Trace-Id should match four records printed by the API. Do not compare generated IDs to a copied example. Locate the root, service and query by name and verify the parent relationships. Their actual durations come from your machine; this chapter invents none.",
      "Without the composite index, expect a documents scan and a temporary sort structure for ORDER BY. SQLite's exact EXPLAIN QUERY PLAN wording is version-dependent and is not a stable API. The tests check only the relevant access-path evidence, and also compare results before and after the change.",
    ],
    code: { filename: "baseline.sh", source: `node cli.mjs seed ./field-notes.sqlite
node cli.mjs index ./field-notes.sqlite off
node cli.mjs plan ./field-notes.sqlite
curl -i 'http://127.0.0.1:4318/documents?owner=author-42'
# Inspect the API terminal for matching X-Trace-Id span records.` },
  },
  {
    id: "form-a-falsifiable-hypothesis", number: "05", label: "Diagnosis", title: "Use the plan to explain the expensive boundary",
    introduction: "A plausible optimization needs an observed mechanism and a correctness check.",
    paragraphs: [
      "Hypothesis: most avoidable server work is finding one owner's newest rows. A full scan considers irrelevant owners and a sort orders all matches before applying LIMIT. An index beginning with owner can narrow the search; ordering the next key by created lets the database walk the requested order and stop after 20 matches. Test that hypothesis rather than asserting every slow request needs an index.",
      "Run index on, inspect the new plan and repeat the same request. Expect the planner to select documents_owner_created and avoid the temporary ORDER BY sort. Compare the complete response data or its digest. An optimization that returns different documents is a behavior change, not a successful performance fix.",
      "The index consumes disk and must be maintained on writes. It may be less valuable for other predicates or broad result sets; cardinality and statistics matter. ANALYZE updates statistics after the index change in this experiment. In a production database, index creation, locks, storage growth and rollout safety need their own plan; do not extrapolate local DDL behavior to PostgreSQL.",
    ],
    code: { filename: "index.sh", source: `node cli.mjs index ./field-notes.sqlite on
node cli.mjs plan ./field-notes.sqlite
curl -i 'http://127.0.0.1:4318/documents?owner=author-42'
# Expected access path: documents_owner_created; same ordered rows.` },
    visuals: [{ kind: "decision", label: "Evidence before an optimization", question: "Where is the avoidable time?", outcomes: [
      { condition: "Query dominates; plan scans and sorts", result: "Test a matching index", detail: "Verify the access path changes and result rows remain identical." },
      { condition: "Client time exceeds server span", result: "Inspect unmeasured boundaries", detail: "Connection setup, queuing, response transfer and export overhead are candidates." },
      { condition: "Serialization dominates", result: "Inspect response work", detail: "Measure row count, object shaping and payload size before changing SQL." },
    ], alternative: "When query work dominates and the plan scans and sorts, test an appropriate index and check result equivalence. When client time exceeds the server span, inspect connection, queuing, transfer and telemetry overhead. When serialization dominates, inspect payload and object shaping rather than assuming the database is responsible." }],
  },
  {
    id: "measure-reproducibly", number: "06", label: "Measurement protocol", title: "Measure a workload, not a single lucky request",
    introduction: "The measurement command records raw evidence alongside its summaries.",
    paragraphs: [
      "Run node measure.mjs > measurement.json from the copied lab folder. The runner creates a fresh temporary database, seeds 100002 rows, starts an API on an ephemeral loopback port, and cleans up afterward. It runs ten warmups followed by 100 measured sequential requests without the index, then repeats after creating the index. The client reads the entire body before stopping the timer. An HTTP error aborts the run instead of disappearing from the statistics.",
      "The JSON report records Node and SQLite versions, OS/release/architecture, CPU model/count, RAM, journal and synchronous settings, row count, query owner, result limit, variant order and concurrency=1. Each sample includes clientMs and traceId. Plans, all span records and result digests are included. p50 and p95 use the nearest-rank definition: sorted sample positions 50 and 95 for 100 observations.",
      "Inspect the raw distribution, compare result digests and join slow sample traceIds to the query/service/root spans. A lower p95 alone is not proof that the index caused every improvement. Cache warming, CPU scheduling and fixed baseline-first order can bias results. Repeat whole experiments and reverse variant order; record every run you report, including regressions. No benchmark numbers are embedded here because they would not describe every reader's environment.",
      "This is a warm, single-client, same-process experiment: synchronous SQLite, client and API share the event loop. The runner buffers trace records in memory instead of writing each one to stdout. Disk cache is not reset, no network database or connection pool exists, and there is no competing workload. It cannot establish service capacity, concurrent-user latency, cold-cache performance or production SLO compliance.",
    ],
    code: { filename: "measurement.sh", source: `node measure.mjs > measurement.json
node --input-type=module -e '
import { readFileSync } from "node:fs";
const report = JSON.parse(readFileSync("measurement.json", "utf8"));
console.log(report.environment, report.workload);
for (const run of report.runs) console.log({
  indexed: run.indexed, p50Ms: run.p50Ms, p95Ms: run.p95Ms,
  errors: run.errors, resultDigests: run.resultDigests, plan: run.plan
});
'` },
  },
  {
    id: "read-spans-without-double-counting", number: "07", label: "Interpretation", title: "Nested durations overlap; do not add them together",
    introduction: "A parent contains its child, so summing their durations exaggerates request time.",
    paragraphs: [
      "The service span contains the query span and the root contains both. Use the query duration to explain part of its parent's time; do not add root + service + query. Exclusive time can be estimated by subtracting non-overlapping child intervals from the parent. In an asynchronous application, children may overlap, so subtract the union of intervals rather than their simple sum.",
      "The root here ends when response bytes are queued with res.end. It does not include complete client receipt, DNS, TLS, proxy queuing or network transfer. Trace flushing occurs after the root span and can still affect the client's observed duration. If client time exceeds the root, that gap is a question to investigate, not automatically network latency. Same-process event-loop scheduling also contributes in this fixture.",
      "Keep span names low-cardinality and stable. The code logs operation names, random IDs, parent IDs, monotonic times and status; it omits request bodies, idempotency keys and SQL values. A production telemetry pipeline needs bounded buffers, sampling, access control and retention. Trace identifiers join observations but should not carry customer data or authorization decisions.",
    ],
    table: { caption: "Observation and the question it can answer", columns: ["Signal", "Useful question", "Cannot establish alone"], rows: [
      ["Client elapsed time", "How long did a complete fetch take?", "Which backend boundary dominated"],
      ["Database child span", "How much handler time was spent preparing/executing/materializing?", "Pure engine CPU or lock-wait breakdown"],
      ["EXPLAIN QUERY PLAN", "Which scan/index/sort path was selected?", "Actual elapsed duration"],
      ["Response digest", "Did the experiment return identical bytes?", "Correct authorization for real users"],
    ] },
  },
  {
    id: "slow-query-and-failure-exercises", number: "08", label: "Tests and exercises", title: "Separate correctness assertions from timing observations",
    introduction: "A test should not fail because a developer laptop had a busy moment.",
    paragraphs: [
      "The index test seeds real SQLite rows, compares ordered results, checks the scan before and index path after, and verifies the temporary sort disappears. It deliberately avoids a fixed millisecond threshold. The HTTP test issues concurrent requests, requires different trace IDs, checks all parent relationships and ensures child durations fit inside parents. It also verifies a busy database returns 503 and recovers after the lock is released.",
      "Exercise 1: turn the index off after observing the indexed plan. Measure again and locate the change in database span time and plan. If your timings overlap, report that uncertainty; increase sample count or workload carefully and document the change instead of selecting a flattering number.",
      "Exercise 2: request an owner with no rows, then one with many rows. Observe how selectivity and LIMIT affect the query. In a disposable copy, widen the projection or remove LIMIT and see whether serialization becomes material. Preserve the original measurement report so that workload changes are not misrepresented as an apples-to-apples optimization.",
      "Exercise 3: in a test-only fixture, close the database before calling the handler. A 503 and error spans should replace success; never turn database failure into an empty successful list. Explain how you would distinguish lock wait, query execution, pool wait and dependency timeout in a networked database using separate spans and engine diagnostics.",
    ],
    code: { filename: "verify-tracing.sh", source: `node --test lab.test.mjs
node cli.mjs index ./field-notes.sqlite off
node cli.mjs plan ./field-notes.sqlite
curl -i 'http://127.0.0.1:4318/documents?owner=author-42'
curl -i 'http://127.0.0.1:4318/documents?owner=missing-author'` },
    questions: ["Why can EXPLAIN confirm a plan change without proving a speedup?", "Which boundaries are missing from the root span?", "How would a same-process client bias a concurrent load test?"],
  },
  {
    id: "production-observability-gaps", number: "09", label: "Limitations and references", title: "Carry the method into production, then add the missing instruments",
    introduction: "Trace a question through evidence before choosing a fix.",
    paragraphs: [
      "Production extensions include OpenTelemetry SDK instrumentation, asynchronous context propagation, W3C trace context, resource attributes, collector/exporter configuration, database pool spans, cancellation/deadlines, query-engine diagnostics, metrics and SLO alerts. None of those integrations are claimed by this local span helper. No span leaves the machine.",
      "Before reporting capacity, run a separate load generator with explicit concurrency or arrival rate, independent hardware/processes, representative data skew, warmup/cache policy and a fixed observation period. Record errors, throughput, saturation and tail latency. Query-only and end-to-end measurements answer different questions and should not share a misleading benchmark label.",
      "The foundations and three case studies are complete reading routes; broader observability, durable data, scaling and concurrency topics remain planned. The official references below were reviewed on 2026-09-07. The lab's own measurement output is the source of any timings a reader chooses to report; hypothetical case-study prose is not performance evidence.",
    ],
    links: nextSteps.slice(4),
    checklist: ["A slow sample can be joined to one trace", "Span parentage and timing boundaries are explicit", "Plan and result equivalence are checked together", "Environment, workload, raw samples and errors accompany measurements", "Unimplemented production instrumentation is named"],
    references: [
      { title: "Node.js: monotonic performance measurements", url: "https://nodejs.org/docs/latest-v24.x/api/perf_hooks.html" },
      { title: "SQLite: EXPLAIN QUERY PLAN", url: "https://www.sqlite.org/eqp.html" },
      { title: "SQLite: multi-column indexes and query planning", url: "https://www.sqlite.org/queryplanner.html" },
      { title: "OpenTelemetry: traces and spans", url: "https://opentelemetry.io/docs/concepts/signals/traces/" },
      { title: "OpenTelemetry JavaScript: Node.js instrumentation", url: "https://opentelemetry.io/docs/languages/js/getting-started/nodejs/" },
      { title: "W3C: Trace Context", url: "https://www.w3.org/TR/trace-context/" },
    ],
  },
];
