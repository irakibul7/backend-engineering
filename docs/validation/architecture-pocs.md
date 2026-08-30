# Architecture PoC report

Date: 2026-08-30  
Owner: Rakibul Islam / Codex  
Commit: uncommitted review checkpoint  
Environment: macOS, Node 22.20.0, Vite 6.4.2, React 19.2, TypeScript 5.9.3

This report records the first vertical-slice evidence. It does not promote unfinished launch work to complete.

## PoC-01 — Typed static content

- Requirements: `LES-001`, `LES-004`, `LES-008`, `REL-002`
- Minimal files: `src/content/chapters.ts`, `src/Prototype.tsx`, `vite.config.mjs`, `scripts/prepare-sites-build.mjs`
- Evidence: the typed chapter fixture renders stable section anchors, prose, callouts, checklists, and TypeScript code blocks; `npm run typecheck` and `npm run build` pass.
- Decision: **partial**. The content model and renderer are promoted. Route-specific prerendering, JavaScript-disabled reading, schema-level content validation, and a true unknown-route 404 remain required before launch.
- Architecture effect: keep the Vite/React Product Design starter and add prerender output as a later delivery slice.

## PoC-02 — Local search

- Requirements: `SEA-002`, `SEA-003`, `PERF-003`
- Minimal files: `src/lib/search.ts`, `src/lib/search.test.ts`, `src/content/chapters.ts`
- Evidence: title, summary, promise, and tag ranking cover all 24 catalog entries. Three search tests pass, including the roadmap query `Kafka`. The complete client bundle is 122.00 kB gzip, below the 150 kB search-payload ceiling even before separating the search index.
- Decision: **pass for the catalog slice**. A throttled-device p95 benchmark and glossary/section indexing remain launch gates.
- Architecture effect: promote the small in-memory index; no search service is needed.

## PoC-03 — Versioned browser state

- Requirements: `PRO-002`, `PRO-003`, `NOT-003`, `THE-002`
- Minimal files: `src/lib/storage.ts`, `src/lib/storage.test.ts`
- Evidence: three storage tests cover progress filtering, malformed preference recovery, and note round-tripping. Browser verification confirmed completion count, theme persistence, and note autosave.
- Decision: **pass for local-only state**. Quota-error messaging and explicit schema migrations remain before launch.
- Architecture effect: promote the versioned local-storage adapters; do not introduce an account or backend.

## PoC-04 — Sanitized Markdown notes

- Requirements: `NOT-004`, `NOT-005`, `SEC-001`
- Minimal files: `src/Prototype.tsx`, `src/Prototype.test.tsx`
- Evidence: `react-markdown` with `rehype-sanitize` renders Markdown preview while a script injection test remains inert. Browser verification confirmed edit, preview, autosave, and export affordance.
- Decision: **partial**. The approach is promoted. A broader XSS corpus, dangerous-URL cases, clipboard/download denial paths, and security review remain launch gates.
- Architecture effect: raw HTML stays disabled; notes remain private to the browser.

## PoC-05 — Responsive lesson navigation

- Requirements: `LES-002`, `LES-003`, `A11Y-003`
- Minimal files: `src/Prototype.tsx`, `src/prototype.css`
- Evidence: desktop uses a sticky contents rail; 390 × 844 uses a labeled contents button, modal backdrop, and off-canvas drawer. Browser verification opened the drawer and confirmed all six section links are visible. Desktop and mobile reference comparisons are stored in `docs/qa/`.
- Decision: **pass for the first lesson**. Active-section tracking, focus return, 320 px overflow, and full keyboard regression remain launch gates.
- Architecture effect: one semantic section model drives both navigation modes.

## PoC-06 — Fonts and themes

- Requirements: `THE-001`–`THE-003`, `PERF-002`, `PERF-004`
- Minimal files: `src/prototype.css`, locally packaged `@fontsource` dependencies
- Evidence: Fraunces, Spline Sans, and JetBrains Mono are bundled locally. Light, Original, and Dark token sets render without network-hosted assets. Browser verification cycled to Original and found zero console warnings or errors.
- Decision: **partial**. Visual stability passes this checkpoint; automated contrast and CLS measurements remain launch gates.
- Architecture effect: promote the three-theme token model.

## PoC-07 — Hosting contract

- Requirements: `REL-002`; discovery/security requirements are intentionally deferred
- Minimal files: `worker/index.mjs`, `scripts/prepare-sites-build.mjs`, `tests/sites-worker.test.mjs`
- Evidence: production build passes and four hosting tests verify static assets, application-route fallback, API/write-request handling, and required packaging artifacts.
- Decision: **partial**. Vercel routes, security headers, canonical metadata, sitemap, robots, HTTPS, and `backend.therakibul.me` are launch work.
- Architecture effect: keep the portable static build; add Vercel-specific delivery configuration only in the launch slice.

## Verification summary

`npm run check` passed on 2026-08-30:

- strict TypeScript
- ESLint with zero warnings
- 12 unit and interaction tests
- Vite production build
- 4 hosting tests
- browser checks at 1440 × 900 and 390 × 844
- zero browser console warnings or errors

