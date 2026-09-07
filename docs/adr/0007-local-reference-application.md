# ADR-0007: One local document-publishing reference application

- Status: Accepted for this user-authorized implementation; review pending
- Date: 2026-09-07

Field Notes is a hypothetical continuation of the existing document publication examples. A fixed demo author purchases publication for a document from a simulated wallet; a durable receipt job follows; a document-list request supplies the tracing workload. There are no employment stories or real transactions.

Use Node.js 24 built-ins and SQLite, with JavaScript ES modules beside the existing TypeScript lessons. This keeps downloads executable without package installation, database services or cloud accounts. SQLite is chosen for reproducibility, not as a substitute for PostgreSQL's concurrency model. Use default rollback journaling, FULL synchronous mode, bounded lock waits and BEGIN IMMEDIATE. One writer at a time is an explicit limitation. PostgreSQL, Redis/BullMQ and full OpenTelemetry deployment remain roadmap extensions.

The site's OpenAPI paths remain empty. The lab has a separate local contract and binds only to 127.0.0.1. The build copies only authored files under public/labs; database and measurement files are excluded by name and generated outside that directory. Client chapter chunks contain small explanatory excerpts, never executable backend modules. Public source downloads are intentional and contain no reader data. Existing private study tools are unchanged.

Append chapters 26–28 instead of repurposing broad planned chapters or breaking stable identifiers. Show a foundations-to-case-studies learning path and roadmap cross-links. Previous/next derives from published order, allowing gaps.

The payment transaction contains the fake debit, payment, idempotency response and receipt job. It never encloses network I/O. A real provider requires a durable pending state, provider-side idempotency, reconciliation and independently verified webhooks; that adapter is not implemented. Jobs use leases and at-least-once attempts with a bounded dead-letter policy; a unique local receipt effect prevents duplicates in this sink only. Trace spans are a small explicit-context teaching implementation, not an OpenTelemetry exporter.
