# Field Notes: one local backend lab

By Rakibul Islam · https://therakibul.me/

Hypothetical document-publishing application. No real money, email, accounts,
credentials, remote dependency, or paid infrastructure. The website never runs this
server. It has a fixed synthetic author and MUST remain on loopback.

## Requirements and setup

Node.js 24.4.1 or a newer Node 24 release. `node:sqlite` may print an experimental
warning on this version. No npm install, Docker or database daemon is required.
The process-crash exercises/tests use SIGKILL on macOS/Linux. Use WSL on Windows.

From a repository checkout:

```sh
mkdir -p .local/field-notes
cp public/labs/field-notes/* .local/field-notes/
cd .local/field-notes
node cli.mjs init ./field-notes.sqlite
node --test lab.test.mjs
node server.mjs ./field-notes.sqlite
```

For a standalone copy, download README.md, openapi.yaml, store.mjs, trace.mjs,
server.mjs, cli.mjs, measure.mjs and lab.test.mjs from `/labs/field-notes/` into a new
local directory. Inspect the code before running it. The chapter links list exactly this allowlist; no script runs during download.

## Payment (terminal two, same directory)

```sh
curl -i http://127.0.0.1:4318/payments \
  -H 'Content-Type: application/json' -H 'Idempotency-Key: publication-7' \
  --data '{"documentId":"document-7","amountCents":500,"currency":"USD"}'
```

Expected: 201 and a JSON object containing paymentId (generated UUID),
documentId=document-7, amountCents=500, currency=USD, simulated=true.
Repeat the exact command: identical status/body and a single 500-cent debit.
Change documentId to document-8 with the same key: 409 key_reused_with_different_command.
Change only the key: 409 already_paid. Invalid commands produce 400; a valid wrong
price produces 409. A busy/unavailable store produces 503; retry the same key.

A successful transaction saves wallet debit, payment, replay response and receipt
job together. Validation/rejection/rolled-back failures are not cached. No time-based
key expiration exists in this lab. Keys are scoped to the fixed author, and the
business unique constraint permits only one payment per document.

## Jobs and deliberate crashes

```sh
node cli.mjs jobs ./field-notes.sqlite
node cli.mjs work ./field-notes.sqlite --crash-after-effect
# Expect this process to be killed. Wait at least one second for its lease.
sleep 1
node cli.mjs work ./field-notes.sqlite
node cli.mjs jobs ./field-notes.sqlite
```

Expected: running job is reclaimed, attempts=2, state=done; exactly one receipt.
The effect committed before the crash. A unique receipt job_id deduplicates replay.
A worker command claims at most one job and exits; idle is not queue completion.

Use a fresh database filename for the unavailable-dependency exercise:

```sh
node cli.mjs init ./outage.sqlite
node cli.mjs pay ./outage.sqlite
node cli.mjs work ./outage.sqlite --unavailable
sleep 1
node cli.mjs work ./outage.sqlite --unavailable
sleep 1
node cli.mjs work ./outage.sqlite --unavailable
node cli.mjs jobs ./outage.sqlite
# Copy the job id from jobs output only after investigating the failure:
node cli.mjs replay ./outage.sqlite JOB_ID
node cli.mjs work ./outage.sqlite
```

Expected: ready after attempts 1–2, dead after attempt 3, done after explicit replay.
`JOB_ID` is a placeholder, not a literal id. Replay records a replay count and
preserves receipt identity. Full operator identity/history, poison-payload diagnosis,
alerting, retention and scheduling are production extensions.

## API to database tracing

```sh
node cli.mjs seed ./field-notes.sqlite
node cli.mjs plan ./field-notes.sqlite
curl -i 'http://127.0.0.1:4318/documents?owner=author-42'
node cli.mjs index ./field-notes.sqlite on
node cli.mjs plan ./field-notes.sqlite
curl -i 'http://127.0.0.1:4318/documents?owner=author-42'
```

Expected: 20 documents, newest first. The first is fixture-99942. X-Trace-Id
matches four JSON spans in the API terminal: http GET /documents, documents.list,
sqlite SELECT documents, json.serialize. IDs and durations vary per request.
Without the composite index, SQLite scans and sorts; with it, the planner can seek
by owner and read in order. Exact EXPLAIN text depends on the SQLite version.

```sh
node measure.mjs > measurement.json
```

The runner creates and deletes its own temporary database and ephemeral-port API.
It seeds 100,002 rows (100,000 generated, two demo documents), runs ten warmups and
100 measured requests per variant, records Node/SQLite/OS/CPU/RAM, raw client
samples, p50/p95 (nearest rank), plans, result digests and correlated spans.
Concurrency is one; baseline precedes indexed; both use the same process and warm
cache. An HTTP failure fails the run. No generic benchmark score is claimed.
Repeat whole runs and reverse the variant order before generalizing; a real load
test needs a separate client process/host, concurrent traffic, throughput/error
budgets, resource utilization and representative data distribution. Node's
synchronous SQLite API blocks the event loop: the lab cannot prove production
throughput or network/database-pool performance. No fabricated output timings
are embedded in the lesson.

## Recovery and limitations

- Kill API before commit: retry performs the transaction. Kill after commit but
  before response: retry retrieves the original response. Never mint a new key
  merely because a response timed out.
- A real payment provider is outside the database transaction. Add a durable
  pending operation, stable provider idempotency key and reconciliation; never
  infer “not charged” from a network timeout. No real provider is implemented.
- Default SQLite rollback journaling, FULL synchronous mode and a 250 ms busy
  timeout are explicit choices. One writer holds BEGIN IMMEDIATE; keep it short.
  Durability still depends on filesystem/storage guarantees and backups.
- Jobs provide at-least-once attempts, conditional on continued polling and repair
  of dead letters. They do not promise every job will eventually succeed. Only
  the fake sink has deduplicated effects. There is no distributed exactly-once
  guarantee, strict ordering, lease renewal or automatic scheduler.
- Traces use explicit synchronous parent context. They are not an OpenTelemetry
  SDK/exporter or a W3C incoming-context parser. Async propagation and external
  dependencies need real instrumentation. Bodies, keys and query values are not logged.
- The API root span ends at response enqueue, not receipt by the client. Client
  timing includes response-body read; query spans include prepare/execute/materialize.
  Durations are monotonic within one process, not comparable timestamps across hosts.
- `init` never resets an existing wallet. For another experiment, choose a new DB
  name. Stop the server with Ctrl-C and delete only your disposable lab directory
  when finished. Never put generated databases/results in public/labs.
