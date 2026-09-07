# Field Notes practical-guide expansion

Reviewed locally: 2026-09-07. Requirement slice: T-708 (`CON-008`, `LAB-001`,
`LAB-002`, `SEQ-001`, `PUB-001`, existing lesson/SEO/privacy/accessibility requirements).
Validation preceded publication. No deployment command, cloud resource, real payment or outbound receipt delivery.

## What changed

Ten complete chapters now share the public catalog. Existing chapters 01–07,
all existing URLs and eighteen planned topics 08–25 remain intact. New stable routes:

- `/chapters/idempotent-payment-endpoint/` — chapter 26
- `/chapters/reliable-background-jobs/` — chapter 27
- `/chapters/tracing-a-slow-request/` — chapter 28

The catalog and roadmap link foundations → payments → jobs → tracing. Related
planned topics link to the available case studies without claiming the broader
field guides are written. Previous/next follows published order, including 07 → 26.

Each chapter has nine sections, over 1,200 words of explanatory paragraphs,
prerequisites, design decisions, runnable setup/source links, input/output contracts,
failure/recovery exercises, executable tests, production limitations, official
references reviewed on September 7 and two original semantic diagrams. Existing
renderers, typography, notebook layout, search, progress, notes, and theme controls
are retained. Every lesson visibly attributes Rakibul Islam and links his portfolio.

Field Notes continues the document-publishing examples as an explicitly hypothetical
application. Its Node.js 24 / SQLite code has no package dependencies. A local fake
wallet/payment transaction commits debit, payment, response and receipt job together.
Workers have expiring claims, per-claim tokens, bounded backoff, explicit dead-letter
replay, and a separately committed fake receipt sink keyed by stable job identity.
Traces carry explicit request context through the HTTP handler, service, database
query and serialization. The measured workload changes only the composite index.

## Public/private boundary

- Twelve public routes (catalog, roadmap, ten chapters) contain their full content
  in generated HTML, with unique metadata, self-canonicals, structured data and
  sitemap entries. Public reading works without JavaScript.
- Eight authored files under `public/labs/field-notes/` are intentionally public
  downloads. A pre-build allowlist rejects extra files, directories and symlinks
  before Vite can copy them. No databases or measurement results are published.
- The lab runs separately on loopback. Its local OpenAPI contract is separate from
  the static site's empty API paths. There is no authenticated content in this repo.
- Notes and progress remain browser-local. Browser tests entered only synthetic
  test notes, reloaded and previewed them, and asserted that neither notes nor any
  other remote request left the local preview. No notes/dialog/editor state is
  present in prerendered pages or sitemap entries.

## Correctness and production checks

`npm run check` passed:

- Strict TypeScript and ESLint with zero warnings.
- 198 Vitest tests in 17 files, including existing search/storage/component tests
  and new editorial, loader/index, resource-link and source-excerpt checks.
- 12 Node lab integration tests against real SQLite files: exact replay, changed
  commands, ownership/input rejection, six competing payment processes, restart
  replay, rollback after SIGKILL, dependency outages, retry timing/exhaustion,
  final-attempt lease expiry, stale-token updates, manual replay, competing workers,
  SIGKILL after effect commit, HTTP busy/recovery, trace isolation/error spans and
  ordered query-result equivalence.
- Production build with Vite 6.4.3, followed by 16 hosting/static-output tests.
  Each chapter remains a separate client chunk; shared entry plus loader remains
  below the approved 100 kB gzip budget (approximately 82 kB).
- `git diff --check` passed. The repository has no configured formatter command.

Vite's prerender build reports the existing static/dynamic-import warnings because
server rendering imports every lesson. Client chunks are separately checked by the
bundle tests; the existing networking renderer remains within its approved budget.

`npm run test:browser` passed using Playwright 1.63.0, axe 4.13.0 and Chrome
152.0.7977.77 at 1280×720, 390×844 and 320×700. At each width it checked catalog,
roadmap and all three new chapters, overflow, canonicals, diagram bounds, author
links, code copy, keyboard search, chapter navigation/back, notes persistence and
sanitization, focus restoration, themes and axe. Mobile contents links worked.
The three chapters were also read without JavaScript. All eight served source
files were downloaded to a disposable directory and their lab tests passed there.
Zero browser warnings/errors, zero unexpected external requests and zero axe
violations. Evidence: [browser and Lighthouse summary](field-notes-browser.json)
and [screenshots](field-notes-screenshots/).

The browser run found and fixed two existing contrast problems: small text in the
original theme, and the enabled Notes export button. It also exposed a search
regression caused by matching `round` inside the new word `background`; word-prefix
matching now retains partial search while preserving the existing round-trip result.

`npm run verify:links` checked 89 unique document/download URLs. The final batch
returned 88 successes and one HTTP 429 for the existing RFC 9457 reference; an
isolated retry returned HTTP 200. Thus all 89 destinations resolved, but the batch
command itself exited nonzero on that transient response. The checker now removes
fragment duplicates, limits batches to four and spaces external requests per origin.
Internal anchor/file existence is separately validated against built HTML, so an
SPA fallback cannot disguise a broken internal link. No references were replaced
just to avoid rate limiting.

The production dependency audit initially reported four high-severity findings in
Vite, Browserslist, PostCSS and nanoid. Compatible patches (including Vite 6.4.3)
were applied; `npm audit --omit=dev --json` now reports zero vulnerabilities. This
is a package advisory check, not a claim of a comprehensive security audit.
Official Vite patch evidence: https://github.com/vitejs/vite/releases/tag/v6.4.3
and https://github.com/advisories/GHSA-fx2h-pf6j-xcff.

## Measured evidence, not a performance promise

All three new chapter routes scored Lighthouse mobile 97 performance / 100
accessibility / 100 best practices / 100 SEO. LCP was approximately 2.27 seconds;
TBT was 0 ms. CLS was 0 for payment/tracing and 0.024 for jobs. Lighthouse 13.4.1
used its 412×823 mobile simulation, 4× CPU slowdown, 150 ms RTT and 1638.4 Kbps
throughput settings. Full settings and exact measurements are in the summary JSON.
These are local simulated audits, not field Core Web Vitals.

The standalone lab report is [field-notes-measurement.json](field-notes-measurement.json).
Command: `node public/labs/field-notes/measure.mjs > docs/validation/field-notes-measurement.json`.
The retained run was made after build/browser/Lighthouse activity completed; an
initial run made during build activity was discarded as a confounded measurement.

Environment: Node v24.4.1, SQLite 3.51.2, Darwin 25.2.0 arm64, Apple M1, eight logical
CPUs and 8 GiB RAM. Fresh temporary database, rollback journal, FULL synchronous;
100,002 rows, 100 owner values, owner=author-42, 20 returned rows, ten warmups and
100 samples per variant, concurrency one, unindexed then indexed. Client timing
includes complete response-body receipt. The same process owns client/API/synchronous
SQLite, and spans are buffered in memory. No artificial background load was added;
OS scheduling/cache state was not controlled.

The retained run measured unindexed p50 5.710 ms / p95 6.361 ms and indexed p50
0.312 ms / p95 0.716 ms, with zero HTTP errors and identical response digests.
Raw samples, trace relationships, query plans and all environment/workload fields
are included. These are one warm sequential local run, not production benchmarks.
Fixed variant order and same-process execution limit causal/general throughput
claims; repeat and reverse order before drawing broader conclusions. The public
chapter publishes the procedure and expected plan/response shape, not these timings.

## Remaining gaps

- Eighteen broader topics remain planned. These case studies do not replace the
  full PostgreSQL, API design, BullMQ, OpenTelemetry, distributed messaging or
  scaling curriculum.
- The local API has a fixed demo principal and synthetic money. Real identity,
  provider reconciliation, verified webhooks, refunds, ledger accounting and
  retention policy are deliberately absent. It must never be exposed publicly.
- The worker needs continued polling; there is no daemon/scheduler, external broker,
  lease renewal, production timeout adapter, multi-host clock model, strict ordering,
  full replay audit, metrics or alerts. At-least-once attempts do not guarantee
  eventual success. Only the fake sink deduplicates effects.
- Tracing is a synchronous explicit-context teaching helper, not an OpenTelemetry
  SDK/exporter or incoming W3C-context implementation. There is no network database,
  pool instrumentation, production load test or field telemetry baseline.
- SIGKILL exercises were executed on macOS; Windows readers are directed to WSL.
  SQLite emits its expected experimental warning on the tested Node version.
- Local production builds and hosting contract tests passed. No deployment, DNS,
  live indexing, Search Console or post-deploy checks were performed.

Review the chapter prose and lab trade-offs before deciding whether to publish.
The existing working tree was clean at intake. After this local review, the user approved committing and pushing the changes.
