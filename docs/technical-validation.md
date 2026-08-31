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

## PoC-NET-01 — Deterministic packet journey and route lookup

- Question: Can a pure TypeScript model parse canonical IPv4 addresses, select a route by longest-prefix match, and reconstruct every packet-journey step without visual state leaking into networking decisions?
- Requirements: `LES-001`, `LES-008`, `CON-007`
- Pass: `/0`, `/32`, overlapping prefixes, high-bit addresses, equal-prefix metrics, malformed input, no-route behavior, next/previous/direct selection, and replay pass unit tests.
- Exclusions: React, Three.js, CSS, runtime API, live networking, and public routes.
- Timebox: half day.

## PoC-NET-02 — Protocol-layer observatory fidelity and lifecycle

- Question: Can the selected exploded-layer composition and a bounded routed-topology mode remain readable and responsive while a lazy Three.js renderer stays within explicit GPU, geometry, and animation-loop limits?
- Requirements: `LES-004`, `A11Y-004`, `PERF-002`, `PERF-003`, `CON-007`
- Pass: the isolated proof covers protocol layers with TCP and UDP alternatives plus same-subnet, routed-delivery, and missing-route-repair topology states; matches the selected composition at desktop; provides a readable vertical-hop alternative at 390 px and 320 px; caps device pixel ratio and drawing-buffer size; schedules animation only during a transition; pauses when hidden or offscreen; disposes resources; and reports its lazy chunk size.
- Exclusions: public Chapter 07 route, catalog changes, external assets, camera controls, physics, WebXR, and continuous animation.
- Timebox: one day.

## PoC-NET-03 — Semantic, reduced-motion, and no-WebGL equivalence

- Question: Can every interactive scene state remain understandable and operable when animation is reduced, WebGL is unavailable, or the canvas is hidden?
- Requirements: `A11Y-001`, `A11Y-003`, `A11Y-004`, `CON-007`
- Pass: semantic state, selected route, TTL, and explanations remain real HTML for every approved scenario; keyboard controls cover each journey; reduced motion uses snap transitions and disables auto-play; forced WebGL failure preserves the complete lesson; automated accessibility reports zero violations.
- Exclusions: screen-reader-specific telemetry, remote preference sync, and any collection of reader network information.
- Timebox: half day.

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
