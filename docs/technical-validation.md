# Technical validation plan

Build these as isolated proofs of concept before the product scaffold. Each PoC answers one risky question, has a timebox, and is either discarded or promoted deliberately after review.

## PoC-01 — Static content fidelity

- Question: Can the chosen content stack render one long chapter from typed content blocks with stable anchors, syntax highlighting, diagrams, route-specific static HTML, and a real 404 on Vercel?
- Requirements: `LES-001`, `LES-004`, `LES-008`, `REL-002`
- Pass: chapter 01 fixture pre-renders; JavaScript-disabled reading works; invalid content fails build; unknown route returns 404.
- Timebox: half day.

## PoC-02 — Search index

- Question: Can build-time search cover chapters, headings, tags, and glossary terms without a server or excessive bundle size?
- Requirements: `SEA-002`, `SEA-003`, `PERF-003`
- Pass: 24 chapters plus representative sections search at p95 under 100 ms on throttled mobile; search payload under 150 kB compressed.
- Timebox: half day.

## PoC-03 — Browser persistence and migration

- Question: Can progress, theme, and notes remain resilient across schema changes, malformed data, private mode, and quota errors?
- Requirements: `PRO-002`, `PRO-003`, `NOT-003`, `THE-002`
- Pass: versioned parsers never crash rendering; migrations are deterministic; quota error is recoverable; theme is correct before paint.
- Timebox: half day.

## PoC-04 — Safe Markdown notes

- Question: Can edit/preview/export support useful Markdown without executing user-controlled HTML or URLs?
- Requirements: `NOT-004`, `NOT-005`, `SEC-001`
- Pass: OWASP XSS corpus remains inert; raw HTML is disabled or stripped; exported file is UTF-8 `.md`; no network call contains note data.
- Timebox: one day including security review.

## PoC-05 — Long-page navigation

- Question: Can one semantic contents model support desktop sticky rail, mobile drawer, deep links, active section, and fixed-control offsets without horizontal overflow?
- Requirements: `LES-002`, `LES-003`, `A11Y-003`
- Pass: desktop 1280 x 720 and mobile 390 x 844 journeys work with keyboard and browser history; 320 px has no page overflow.
- Timebox: half day.

## PoC-06 — Font and theme stability

- Question: Can three themes and packaged fonts avoid flash, layout shift, and contrast failures?
- Requirements: `THE-001`–`THE-003`, `PERF-002`, `PERF-004`
- Pass: no flash in screenshots, CLS contribution near zero, WCAG AA for token matrix.
- Timebox: half day.

## PoC-07 — Vercel delivery contract

- Question: Do static routes, redirects, headers, caching, sitemap, and custom subdomain behave correctly in preview and production?
- Requirements: `SEO-001`–`SEO-005`, `SEC-002`, `REL-002`
- Pass: hosting test suite validates response codes/headers; preview contains no production canonical leakage; production origin is configurable.
- Timebox: half day after domain confirmation.

## Deliberately not applicable

PowerPoint COM fidelity, offline synchronization across devices, 10 GB resumable upload, malware inspection, archive conversion, signed Room Agent updates, .NET tests, and infrastructure synth/diff do not map to this static educational product. They will not be built as ceremonial PoCs. If future scope introduces an equivalent risk, it must first become a requirement and ADR.

## Validation report format

For each PoC, record:

- date, owner, commit, and environment;
- hypothesis and requirement IDs;
- minimal files used;
- command and observed metrics;
- pass/fail decision;
- architecture change, if any;
- whether code was discarded or promoted.
