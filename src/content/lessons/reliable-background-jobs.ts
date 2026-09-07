import type { LessonSection } from "../types";
import { setup, nextSteps } from "./field-notes-shared.ts";

export const jobsSections: LessonSection[] = [
  {
    id: "accepted-does-not-mean-delivered", number: "01", label: "Problem and prerequisites", title: "A paid document still needs its receipt",
    introduction: "The API must commit promptly even when receipt delivery is unavailable.",
    paragraphs: [
      "Continue the hypothetical Field Notes application from the payment chapter. Each successful simulated payment commits a ready receipt job in the same SQLite transaction. A separate worker claims that job. Receipt delivery may fail, take too long or succeed just before the worker crashes. The API must not lose the obligation or debit again while recovering it.",
      "Prerequisites: the payment chapter's transaction/outbox boundary, layered request handling, and basic SQL updates. Understand that a durable queue record is not proof an effect occurred. A receipt in this lab is a row in a fake sink; no email leaves the machine. The sink commits separately from queue acknowledgment so the crash gap is observable.",
      "Constraints: one job per payment, a one-second lease, at most three attempts per delivery cycle and explicit operator replay after exhaustion. Workers claim one job and exit; a shell or scheduler must invoke them again. This intentionally small worker model exposes state transitions without adding Redis or a broker. BullMQ and distributed messaging remain broader roadmap topics.",
    ],
    links: [nextSteps[3], nextSteps[4]],
    visuals: [{ kind: "flow", label: "Payment outbox to receipt sink", stages: [
      { title: "Payment commit", detail: "Debit and ready job become durable together." },
      { title: "Claim", detail: "Reserve one due job with a fresh lease token." },
      { title: "Effect", detail: "Fake sink stores one receipt for the stable job id." },
      { title: "Acknowledge", detail: "Mark done only while this worker owns an unexpired lease." },
    ], alternative: "The payment transaction saves a ready job. A worker claims it with a fresh lease token. The fake sink commits a receipt using the stable job id. The worker then marks the queue record done if it still owns a valid lease. Effect and acknowledgment are separate commits." }],
  },
  setup,
  {
    id: "choose-the-delivery-guarantee", number: "03", label: "Design decisions", title: "Promise repeated attempts, not exactly-once execution",
    introduction: "Acknowledgment timing trades possible loss for possible duplication.",
    paragraphs: [
      "If a worker marks done before delivering, a crash can lose the receipt forever. If it delivers first and marks done afterward, a crash between those steps causes a later worker to deliver again. This lab chooses the second order: at-least-once attempts, with a sink that deduplicates effects. Bounded retries mean eventual success is not guaranteed; dead letters need investigation and replay.",
      "deliverReceipt uses INSERT OR IGNORE with job_id as the primary key. It makes repeated delivery of this immutable receipt a no-op. That only proves one effect in this local sink. A real email provider needs an equivalent idempotency contract or a different business policy; a local dedup record alone cannot atomically wrap an arbitrary remote email send.",
      "The job id equals the payment id and remains stable across automatic retries and manual replays. A fresh worker lease token is a different identifier: it proves current ownership of the queue record. Mixing them would either break sink deduplication or allow a stale worker to acknowledge a newer owner's work. Neither identifier establishes strict delivery ordering.",
    ],
    table: { caption: "What this queue guarantees", columns: ["Mechanism", "Guarantee", "Limit"], rows: [
      ["Payment transaction creates job", "No committed payment without a receipt obligation", "An external broker relay is not implemented"],
      ["Expiring claim and repeated polling", "Abandoned work becomes eligible again", "No polling means no recovery progress"],
      ["Conditional lease-token acknowledgment", "Stale owners cannot mark newer work done", "Cannot stop an already-running remote side effect"],
      ["Unique receipt job_id", "Repeated delivery has one fake sink effect", "Not a distributed exactly-once claim"],
      ["Three attempts then dead", "Failure loops stop consuming attempts automatically", "Operator repair/replay is required"],
    ] },
  },
  {
    id: "claim-with-a-lease", number: "04", label: "Concurrency", title: "Claim atomically, then release the transaction",
    introduction: "A lease is a time-bounded reservation; it is not a permanent lock on the effect.",
    paragraphs: [
      "claim opens BEGIN IMMEDIATE, moves expired final attempts to dead, selects one due ready or expired running job below the attempt limit, increments attempts, writes a fresh token and lease_until, then commits. Two processes cannot both reserve the same current attempt. The test invokes competing worker processes and verifies one completed effect and one attempt.",
      "Receipt delivery happens after the claim transaction has ended. Holding a write transaction across an unavailable dependency would block other writers and extend the failure domain. After delivery, acknowledge updates only a running row whose token matches and lease has not expired. A zero-row update means ownership was lost; it is not permission to overwrite another worker's state.",
      "A worker can pause long enough for its lease to expire while still doing work. Another worker can then reclaim the job. The old worker cannot acknowledge or fail the new lease, but it can still reach a sink that ignores lease ownership. This is why sink idempotency remains necessary even with lease tokens. Real long tasks need lease renewal, bounded dependency deadlines and, where applicable, fencing understood by the downstream resource.",
    ],
    code: { filename: "store.mjs · acknowledgment condition", source: `export function acknowledge(db, job, now = Date.now()) {
  return db.prepare(\`UPDATE jobs SET state='done',token=NULL,lease_until=NULL,error=NULL
    WHERE id=? AND state='running' AND token=? AND lease_until>?\`).run(job.id, job.token, now).changes;
}` },
    visuals: [{ kind: "timeline", label: "Crash and lease recovery", phases: [
      { marker: "t0", title: "Worker A claims", detail: "Attempt increments; token A expires after one second." },
      { marker: "Effect", title: "Receipt commits", detail: "The fake sink keeps job_id even if A now crashes." },
      { marker: "Expiry", title: "Worker B reclaims", detail: "Token B replaces A; attempts increments again." },
      { marker: "Retry", title: "Effect deduplicates", detail: "The same job_id has no second receipt; B acknowledges." },
    ], alternative: "Worker A receives a one-second lease and commits the receipt effect, then crashes before acknowledgment. After expiry worker B replaces the token and increments attempts. B repeats delivery with the same job id, which the fake sink deduplicates, then acknowledges its own lease." }],
  },
  {
    id: "backoff-is-a-capacity-policy", number: "05", label: "Retries", title: "Back off with jitter and a finite attempt budget",
    introduction: "Retrying immediately can turn a dependency outage into a queue-wide burst.",
    paragraphs: [
      "A failed fake dependency invokes failJob while the lease is still valid. Attempts one and two return to ready with a future available_at; the third enters dead. The delay uses equal jitter: cap=min(30000,250×2^(attempt−1)) milliseconds, then a random delay in [cap/2,cap). The cap is a policy constant, not a measured performance result. The current three-attempt cycle ends before the 30-second maximum matters.",
      "The tests inject a clock and deterministic randomness. They prove that a not-yet-due job cannot be claimed and that the delay grows within its bounds. Production randomness spreads retry arrivals; deterministic tests make edge cases repeatable. There is no sleeping inside a database transaction, and available_at is persisted so process restarts do not forget the schedule.",
      "The supplied --unavailable switch simulates a transient receipt dependency failure. A real adapter must classify failures: retry bounded timeouts, throttling and temporary availability failures; quarantine invalid payloads or permanently rejected operations instead of hammering them. Respect provider retry hints and combine attempt limits with an elapsed-time budget. This fixture has only one simulated failure class.",
      "Wall-clock lease timestamps are shared on this single machine. Clock jumps can delay or accelerate recovery. Cross-host workers should use a consistent time authority such as the queue/database server and monitor skew. A lease timeout should exceed measured normal task duration plus a margin; the one-second value here exists to make the exercise quick.",
    ],
    code: { filename: "store.mjs · retry policy", source: `export function retryDelay(attempt, random = Math.random) {
  const cap = Math.min(30000, 250 * 2 ** (attempt - 1));
  return Math.floor(cap / 2 + random() * cap / 2);
}` },
  },
  {
    id: "kill-after-the-effect", number: "06", label: "Crash exercise", title: "Kill a worker after delivery but before acknowledgment",
    introduction: "The hardest retry is the one whose first attempt already succeeded at the sink.",
    paragraphs: [
      "Start with a fresh file to avoid a job completed in an earlier exercise. The pay command simulates the same payment service as the API. The crash switch deliberately sends SIGKILL to its own worker after deliverReceipt commits. Expect the shell to report a killed process. It does not kill the API or the reader's other processes.",
      "After at least one second, another work invocation should reclaim the job, repeat the receipt operation and report acknowledged=true. jobs should show state=done and attempts=2. The automated test also counts receipts and requires exactly one. The absence of a second receipt follows from the sink's unique key, not from a queue promise that the handler runs only once.",
      "Exercise: move the crash before the effect in a disposable copy of cli.mjs. Predict the receipt count before and after recovery. Then remove deduplication in another disposable copy and see which test fails. Keep the original fixture as the known-good implementation.",
    ],
    code: { filename: "crash-worker.sh", source: `node cli.mjs init ./worker-crash.sqlite
node cli.mjs pay ./worker-crash.sqlite
node cli.mjs work ./worker-crash.sqlite --crash-after-effect
sleep 1
node cli.mjs work ./worker-crash.sqlite
node cli.mjs jobs ./worker-crash.sqlite
# Expected: done, attempts=2; one receipt effect.` },
  },
  {
    id: "dead-letters-are-an-operational-state", number: "07", label: "Outage exercise", title: "Make exhaustion visible and replay deliberately",
    introduction: "A dead-letter queue is a place to investigate unfinished work, not a success state.",
    paragraphs: [
      "This implementation represents the dead-letter queue as jobs with state=dead. The row retains the payment id, attempt count, last error and replay count. It does not delete the obligation. jobs is a local operator inspection command; there is no public administrative endpoint.",
      "Run the unavailable-dependency exercise below. The sleeps exceed the first two backoff ranges. After attempt three, inspect a dead row with receipt_unavailable. Additional work commands should return idle. A worker killed on its final attempt also becomes dead when a later claim sweep sees the expired lease; otherwise it would remain stuck running forever.",
      "Before replaying, identify the cause, repair or restore the dependency, and check whether a side effect already occurred. Copy the exact job id from jobs output into the replay command. It only resets a dead job, increments replays and preserves job identity; it will not reset a running or completed job. A subsequent healthy worker should reach done without duplicating an existing receipt.",
      "Production replay needs operator identity, an audit history, replay authorization, bounded batches and protection against poison messages. The lab records only a count and last error. Replaying every dead row on a timer would erase the failure budget and turn permanent failures into endless retries.",
    ],
    code: { filename: "unavailable-dependency.sh", source: `node cli.mjs init ./outage.sqlite
node cli.mjs pay ./outage.sqlite
node cli.mjs work ./outage.sqlite --unavailable
sleep 1
node cli.mjs work ./outage.sqlite --unavailable
sleep 1
node cli.mjs work ./outage.sqlite --unavailable
node cli.mjs jobs ./outage.sqlite
# Replace JOB_ID with the id above, after investigating:
node cli.mjs replay ./outage.sqlite JOB_ID
node cli.mjs work ./outage.sqlite` },
  },
  {
    id: "verify-state-transitions", number: "08", label: "Tests", title: "Test the windows between durable writes",
    introduction: "A happy-path worker test misses the failure modes that justify having a queue.",
    paragraphs: [
      "node --test lab.test.mjs covers scheduled retry eligibility, attempt exhaustion, manual replay, a final-attempt crash, stale acknowledgment and stale failure updates, two competing worker processes, and real SIGKILL after a committed effect. The queue tests inject time instead of waiting through every lease boundary; the crash test still kills a real process and reads a real SQLite file.",
      "Exercise: take a job claimed at time zero, claim it again at exactly lease expiry and try to acknowledge the original token. The expected update count is zero. Explain why checking token alone is insufficient if the old lease expired but has not yet been reclaimed. The implementation also checks lease_until greater than now.",
      "Exercise: leave the dependency unavailable and stop invoking workers. The durable job remains, but nothing progresses. Explain why durability, availability and eventual delivery are different properties. Monitoring should expose oldest ready age, active leases, retry counts, dead rows and time since last successful worker cycle.",
    ],
    questions: ["Which commit owns the receipt effect, and which owns acknowledgment?", "Can a lease prevent an old process from emailing a customer?", "What evidence must an operator inspect before replay?"],
  },
  {
    id: "operate-the-boundary", number: "09", label: "Limitations and references", title: "Extend the worker only after its guarantee is clear",
    introduction: "A queue library can supply mechanics; the application still owns effect safety.",
    paragraphs: [
      "Not implemented: an always-running polling service, graceful draining, lease renewal, external broker, multiple failure classes, dependency timeout adapter, priorities, strict ordering, per-tenant fairness, retention, full operator audit, metrics, alerts or multi-host deployment. The synchronous single-writer SQLite design bounds local complexity and limits throughput.",
      "The two durable commits around delivery are intentional. Replacing the sink with an external API requires its own idempotency and reconciliation policy. Replacing SQLite with BullMQ changes stalled-job detection, retry configuration and storage semantics; consult those official contracts instead of assuming this fixture's lease fields exist in that library.",
      "Continue to the tracing chapter with the same documents and process boundaries. A receipt backlog is a reason to measure and inspect dependency behavior, not automatically a reason to add workers. Official references below were reviewed on 2026-09-07; the broader queues, lifecycle and messaging roadmap lessons remain planned.",
    ],
    links: nextSteps.slice(4),
    checklist: ["Claim transaction ends before effect delivery", "Sink receives a stable operation identity", "Acknowledgment requires current, unexpired ownership", "Retries are scheduled and finite", "Expired final attempts and dead letters remain observable"],
    references: [
      { title: "SQLite: transaction isolation and write reservation", url: "https://www.sqlite.org/lang_transaction.html" },
      { title: "BullMQ: retries, backoff and jitter", url: "https://docs.bullmq.io/guide/retrying-failing-jobs" },
      { title: "BullMQ: stalled-job recovery", url: "https://docs.bullmq.io/guide/jobs/stalled" },
      { title: "RabbitMQ: consumer acknowledgments and delivery safety", url: "https://www.rabbitmq.com/docs/confirms" },
      { title: "Node.js: child processes used by the crash tests", url: "https://nodejs.org/api/child_process.html" },
    ],
  },
];
