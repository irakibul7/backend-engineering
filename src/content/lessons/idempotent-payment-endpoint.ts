import type { LessonSection } from "../types";
import { setup, nextSteps } from "./field-notes-shared.ts";

export const paymentSections: LessonSection[] = [
  {
    id: "a-response-is-not-a-receipt", number: "01", label: "Problem and prerequisites", title: "A lost response must not buy publication twice",
    introduction: "The client times out after clicking Pay. It cannot tell whether the server committed.",
    paragraphs: [
      "Field Notes sells one publication per document. The fictional author clicks Pay, loses the response and retries. Two tabs can also submit concurrently. The invariant is one payment and one debit per document, with a stable answer for retries of the same command. A process-local map cannot enforce that invariant across restarts or two API processes.",
      "Read HTTP method semantics, identity and authorization, validation, and layered request handling first; the links below connect them. You need JavaScript objects, SQL uniqueness and the idea of an all-or-nothing transaction. The durable-data roadmap chapter is still planned; this lab supplies the transaction reasoning it needs rather than pretending that broader curriculum is complete.",
      "Constraints: one fixed demo author, USD integer cents, two server-priced documents, a durable local SQLite file and no external provider. The 500-cent debit is simulated. The API has a 4096-byte body limit, rejects malformed JSON and extra fields, and never accepts a client-supplied identity. This is an endpoint design exercise; it is not a production payment processor.",
    ],
    links: nextSteps.slice(0, 4),
    visuals: [{ kind: "flow", label: "Lost response, retained outcome", stages: [
      { title: "Client", detail: "Send publication command with one stable key." },
      { title: "Database", detail: "Commit debit, payment, response and job together." },
      { title: "Network", detail: "Response can disappear after commit." },
      { title: "Retry", detail: "Read the saved response using the same author and key." },
    ], alternative: "The client sends a stable key. The database commits all payment records atomically. The response may be lost after that commit. A later retry reads the saved response and does not repeat the debit." }],
  },
  setup,
  {
    id: "define-command-identity", number: "03", label: "Contract", title: "Separate a request key from a business invariant",
    introduction: "A key identifies one attempted command; the document constraint prevents a second purchase under another key.",
    paragraphs: [
      "The key is 1–80 ASCII letters, digits, underscores or hyphens. Store it under the authenticated principal in a real service; this lab fixes that principal to author-1. Scoping prevents one customer from reading another customer's saved result. The same key in another scope is unrelated. The key is not an authorization mechanism.",
      "Validate first, then serialize [documentId, amountCents, currency] in a fixed order. This fingerprint ignores JSON property order but preserves the accepted command. A saved key with an identical fingerprint returns exactly the original status and JSON body, including paymentId. A changed command with that key returns 409. Do not hash arbitrary raw JSON and confuse whitespace with a new business operation.",
      "A separate UNIQUE(document_id) on payments protects the one-purchase rule even when a client sends a new key. The server looks up document ownership and price; a valid but stale price returns 409. Real pricing needs an explicit price-version or quote-expiry policy. A safe integer and USD restriction avoid floating-point and multi-currency ambiguity in this bounded fixture.",
    ],
    table: { caption: "Payment outcomes for the seeded document", columns: ["Input", "Response", "Durable effect"], rows: [
      ["New valid key; document-7 at 500 USD cents", "201 with simulated=true", "One debit, payment, response and ready job"],
      ["Same key and normalized command", "Original 201 and body", "No additional writes"],
      ["Same key; document-8 instead", "409 key_reused_with_different_command", "None"],
      ["New key; document-7 already purchased", "409 already_paid", "None"],
      ["Malformed JSON or unknown fields", "400", "No saved key"],
      ["Store locked beyond 250 ms", "503 and Retry-After: 1", "Retry the same key; do not infer success or failure"],
    ] },
  },
  {
    id: "place-the-transaction", number: "04", label: "Implementation", title: "Put every local payment effect inside one transaction",
    introduction: "The commit is the linearization point for successful purchases in this lab.",
    paragraphs: [
      "Open store.mjs beside this section. pay begins a short BEGIN IMMEDIATE transaction, checks the saved response, checks ownership, price and the business constraint, conditionally debits the wallet, inserts the payment, saves the response, and inserts a ready receipt job. A thrown error rolls everything back. Rejections commit no business changes and are not stored as completed keys.",
      "The conditional wallet update only succeeds if the balance covers the server price. A CHECK constraint also prevents a negative balance. The response is sent after COMMIT. If the process dies during the transaction, SQLite recovers the rollback journal when the file is next accessed. If it dies after commit, the saved key survives and the retry obtains its response.",
      "Use a synchronous transaction callback: never await inside it. A transaction belongs to a database connection, not to a JavaScript lexical block. Returning a Promise here would allow an early commit before awaited work finishes. The concrete pay callback contains only synchronous database operations and the explicit test-only crash hook.",
    ],
    code: { filename: "store.mjs · transaction helper", source: `export function transaction(db, action) {
  db.exec('BEGIN IMMEDIATE');
  try {
    const result = action();
    db.exec('COMMIT');
    return result;
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}` },
    visuals: [{ kind: "timeline", label: "Atomic payment boundary", phases: [
      { marker: "Before", title: "Validate", detail: "Reject invalid input before opening the write transaction." },
      { marker: "Inside", title: "Decide and write", detail: "Key lookup → ownership/price → debit → payment → response → receipt job." },
      { marker: "Commit", title: "Make outcome durable", detail: "All local records become the accepted operation together." },
      { marker: "After", title: "Send and process", detail: "Send the HTTP result; workers deliver receipts independently." },
    ], alternative: "Validation occurs before the transaction. Key lookup, domain checks, debit and all four durable records are inside one transaction. Commit establishes the accepted result. Sending the response and processing the receipt occur afterward." }],
  },
  {
    id: "reason-about-concurrency", number: "05", label: "Trade-offs", title: "Let the database arbitrate concurrent requests",
    introduction: "Checking a key before a transaction leaves a race between the check and the write.",
    paragraphs: [
      "SQLite permits one writer at a time. BEGIN IMMEDIATE acquires the write reservation before the key read. A competing process either waits and then sees the committed response, or exceeds the 250 ms busy timeout and gets 503. The test launches six separate processes against the same file, so it exercises database coordination rather than merely the event loop.",
      "Default rollback journaling and FULL synchronous mode favor a small, understandable local durability boundary. Long readers can delay commits, and synchronous database calls block Node's event loop. This is a correctness demonstration, not a recommendation for high-traffic payment architecture. A PostgreSQL implementation would use its own unique constraints, conflict handling and isolation semantics; copying BEGIN IMMEDIATE would be wrong.",
      "A key lookup followed by a separate debit transaction, or debit followed by queue insertion outside the transaction, creates a crash gap. The ready job in the payment transaction is an outbox entry: it records work that must be attempted later. Moving that job to an external broker requires a relay that itself tolerates duplicates.",
    ],
  },
  {
    id: "send-and-repeat", number: "06", label: "Inputs and outputs", title: "Send one command, then lose confidence in the response",
    introduction: "Use a fresh initialized database and leave the API running in the first terminal.",
    paragraphs: [
      "The first command returns HTTP 201 with paymentId (a generated UUID), documentId=document-7, amountCents=500, currency=USD and simulated=true. Repeat it verbatim: status and body must match exactly. UUID values are intentionally not hard-coded as an expected result.",
      "Now substitute document-8 while retaining publication-7: expect 409 key_reused_with_different_command. Restore document-7 but choose another key: expect 409 already_paid. Reordering JSON fields should still replay successfully. These changes distinguish transport serialization, command identity and the business uniqueness rule.",
    ],
    code: { filename: "payment.http.sh", source: `curl -i http://127.0.0.1:4318/payments \\
  -H 'Content-Type: application/json' \\
  -H 'Idempotency-Key: publication-7' \\
  --data '{"documentId":"document-7","amountCents":500,"currency":"USD"}'
node cli.mjs jobs ./field-notes.sqlite
# Expect one ready job whose id equals paymentId.` },
  },
  {
    id: "crashes-and-uncertainty", number: "07", label: "Failures and recovery", title: "Treat a timeout as an unknown outcome",
    introduction: "A failed response does not prove the operation failed.",
    paragraphs: [
      "Before commit, retrying the same key can perform the operation. After commit but before the response arrives, retrying the same key retrieves the saved result. A 503 from contention is also retryable with that key and bounded backoff. The caller needs a deadline and an attempt limit; retries are not permission to keep a dependency saturated indefinitely.",
      "This lab retains successful keys indefinitely. A production retention policy must cover the intended retry window and preserve enough business identity to reject late duplicates after key expiry. Failed validation and rolled-back transactions do not reserve a key here. This is an explicit local policy, not an assertion that every provider uses it; compare the linked Stripe contract before integrating that provider.",
      "Do not put a real card charge inside this transaction helper. The provider can accept a charge while the local process loses the reply. A database rollback cannot undo that remote effect. Persist a pending payment operation first, use a stable provider idempotency key, call outside the transaction, then reconcile the outcome. Persist verified webhook events idempotently and compare amount, currency and order identity. A timeout stays pending until provider evidence resolves it.",
    ],
    callout: { label: "Guarantee boundary", body: "The lab proves one local simulated debit per document. It does not prove exactly-once charging across a network or implement a real provider, refunds, reconciliation or webhook verification." },
  },
  {
    id: "test-the-failure-boundary", number: "08", label: "Tests and exercises", title: "Break the boundary and observe the invariant",
    introduction: "Assertions count durable effects, not only HTTP status codes.",
    paragraphs: [
      "Run node --test lab.test.mjs. The payment tests assert exact response replay, one 500-cent debit, one payment and one job after concurrency, and no effects after malformed, unauthorized or rolled-back commands. A separate process is killed after the wallet update but before the other writes; reopening the file must reveal the original balance and no payment/job. A later retry must succeed.",
      "Exercise 1: send two curl requests concurrently using the same key. Accept a retryable 503 under contention, retry it with the same key, and inspect that both final 201 bodies match. Explain why two success responses do not imply two purchases. Repeat with different keys: one purchase should succeed and the other report already_paid.",
      "Exercise 2: use the crash-debit command on a fresh file, then retry pay. The shell reports a killed process; that is the deliberate failure. Explain which records would disagree if the debit were committed before the request record. Never run crash hooks against a database you want to keep.",
    ],
    code: { filename: "crash-payment.sh", source: `node cli.mjs init ./payment-crash.sqlite
node cli.mjs crash-debit ./payment-crash.sqlite retry-key
# Expected: process killed inside the uncommitted transaction.
node cli.mjs pay ./payment-crash.sqlite retry-key
# Expected: 201; the earlier partial debit was rolled back.
node --test lab.test.mjs` },
    questions: ["Why must a timeout preserve the original key?", "Which guarantee survives if two callers choose different keys?", "Where does a real provider call go, and how is an ambiguous result resolved?"],
  },
  {
    id: "production-checklist", number: "09", label: "Limits and next lesson", title: "Know what remains before handling money",
    introduction: "The next step is reliable receipt delivery, not connecting this demo to a card processor.",
    paragraphs: [
      "Authentication, authorization beyond the fixed fixture, money ledger accounting, multi-currency rounding, refunds, provider integration, durable pending-state reconciliation, webhook signatures, audit retention, migrations, backups, rate limits and operational alerts are not implemented. The catch-all 503 deliberately hides SQLite internals; a deployed service needs internal error classification and alerting without logging payment data.",
      "Only successful responses are saved; business conflicts can change as domain state changes. There is no key expiry, cleanup or user-facing payment-status route. These are deliberate scope limits and should become explicit requirements before a real integration. The local fixture does not contain card data or make outbound calls.",
      "Continue with Reliable Background Jobs using the same ready receipt job. For broader API and transaction theory, follow the roadmap links; those field guides remain planned. The source downloads and all examples were reviewed against the official references below on 2026-09-07.",
    ],
    checklist: ["Can every retry identify the same accepted command?", "Are debit, response and outbox records inside one commit?", "Does the business constraint still hold across processes and new keys?", "Is a provider timeout modeled as uncertainty rather than failure?"],
    links: nextSteps.slice(4),
    references: [
      { title: "Node.js: built-in SQLite API", url: "https://nodejs.org/api/sqlite.html" },
      { title: "SQLite: transactions and BEGIN IMMEDIATE", url: "https://www.sqlite.org/lang_transaction.html" },
      { title: "SQLite: atomic commit and recovery", url: "https://www.sqlite.org/atomiccommit.html" },
      { title: "Stripe: provider-specific idempotent request contract", url: "https://docs.stripe.com/api/idempotent_requests" },
      { title: "HTTP semantics: idempotent methods", url: "https://www.rfc-editor.org/rfc/rfc9110.html#section-9.2.2" },
    ],
  },
];
