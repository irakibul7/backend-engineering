# Implementation plan

Status: Approved; technical validation may begin.  
Rule: One focused task at a time. Each task ends with passing evidence and human review before commit.

## Slice 0 — Approve the contract

### T-000 Confirm product decisions

- Requirements: specification section 13
- Acceptance: canonical domain, launch chapter count, example languages, repository visibility, and content-reuse permission are recorded.
- Files in scope: `spec.md`, relevant ADRs
- Exclusions: no scaffold, dependencies, or UI code
- Commit: `docs: approve product specification`

Decision: Complete on 2026-08-30. Confirmed domain, six-chapter staged launch, TypeScript-only examples, and approval to proceed.

## Slice 1 — Prove the architecture

### T-101 Static content spike

- Requirements: `LES-001`, `PERF-001`, `REL-002`
- Acceptance: one typed chapter generates a canonical static route and an unknown route returns 404 in a Vercel-like preview.
- Files in scope: isolated `poc/static-content/`
- Exclusions: final styles, search, notes, remaining chapters

### T-102 Search-index spike

- Requirements: `SEA-002`, `SEA-003`
- Acceptance: a 24-chapter synthetic index searches title, tags, headings, and terms under 100 ms on throttled mobile hardware.
- Files in scope: isolated `poc/search/`
- Exclusions: final modal UI and production content

### T-103 Browser-state spike

- Requirements: `PRO-002`, `PRO-003`, `NOT-003`, `NOT-004`, `THE-002`
- Acceptance: versioned storage recovers from malformed data; sanitized preview rejects scriptable content; first paint uses the saved theme.
- Files in scope: isolated `poc/browser-state/`
- Exclusions: final notes editor or visual styling

### T-104 Responsive navigation spike

- Requirements: `LES-002`, `LES-003`, `A11Y-003`
- Acceptance: sticky rail on desktop becomes an accessible drawer at 390 x 844 with no horizontal overflow.
- Files in scope: isolated `poc/lesson-navigation/`
- Exclusions: final lesson content

Review gate: summarize PoC results in `docs/validation/architecture-pocs.md`, update ADRs, then discard or deliberately promote the smallest proven code.

## Slice 2 — Establish the repository

### T-201 Scaffold the application

- Requirements: `PERF-001`, `PERF-004`, `SEC-005`
- Acceptance: strict TypeScript app builds locally with pinned dependencies and documented commands.
- Files in scope: package/tool configuration and empty app shell
- Exclusions: final visual design and content features

### T-202 Add the quality gate

- Requirements: all verification requirements
- Acceptance: one command runs formatting check, lint, types, unit tests, content validation, build, and hosting tests in CI.
- Files in scope: scripts, test configuration, CI workflow
- Exclusions: feature tests not yet possible

### T-203 Add tokens and font assets

- Requirements: `CAT-005`, `THE-003`, `PERF-004`
- Acceptance: local Fraunces, Spline Sans, and JetBrains Mono equivalents render with documented color/spacing/type tokens in all themes.
- Files in scope: font assets, global CSS, token tests
- Exclusions: page composition

Review gate: design-token screenshot and dependency review.

## Slice 3 — Ship the catalog journey

### T-301 Model and validate chapter metadata

- Requirements: `CAT-001`, `CAT-002`
- Acceptance: invalid number, slug, duration, summary, or duplicate chapter fails the build.
- Files in scope: content schema, catalog fixtures, validation tests
- Exclusions: lesson body rendering

### T-302 Implement the homepage shell

- Requirements: `CAT-001`, `CAT-002`, `CAT-003`, `CAT-005`, `AUT-001`, `AUT-002`
- Acceptance: desktop and 390 x 844 captures match the approved reference measurements and keyboard order.
- Files in scope: homepage components/styles and catalog content
- Exclusions: search, progress persistence, notes

### T-303 Add completion tracking

- Requirements: `CAT-004`, `PRO-001`–`PRO-004`
- Acceptance: toggle, count, refresh persistence, malformed-data recovery, and accessible state pass tests.
- Files in scope: progress island/store and tests
- Exclusions: accounts or remote sync

### T-304 Add catalog search

- Requirements: `SEA-001`–`SEA-005`
- Acceptance: click and shortcut open search; keyboard navigation, ranking, empty state, Escape, and focus restoration pass Playwright.
- Files in scope: generated index, search dialog, tests
- Exclusions: remote search or analytics of queries

Review gate: full catalog journey on desktop and mobile; commit each task separately.

## Slice 4 — Ship one complete lesson

### T-401 Implement the typed lesson renderer

- Requirements: `LES-001`, `LES-004`, `LES-008`
- Acceptance: chapter 01 renders semantic prose, code, table, callout, diagram, references, and stable deep links without client JavaScript.
- Files in scope: lesson schema, renderer, chapter 01 original content
- Exclusions: remaining chapters

### T-402 Add contents navigation

- Requirements: `LES-002`, `LES-003`, `A11Y-001`–`A11Y-005`
- Acceptance: active desktop rail and mobile drawer pass keyboard, focus, reduced-motion, and overflow checks.
- Files in scope: contents components/styles/tests
- Exclusions: search and notes

### T-403 Add code-copy and chapter navigation

- Requirements: `LES-005`, `LES-006`
- Acceptance: copy feedback is announced; clipboard denial is handled; previous/next boundaries are correct.
- Files in scope: code block and chapter navigation components/tests
- Exclusions: execution sandbox

Review gate: technical review of chapter 01 plus design QA against the reference lesson at desktop and mobile.

## Slice 5 — Add study tools

### T-501 Add three themes

- Requirements: `THE-001`–`THE-003`, `LES-007`
- Acceptance: system/light/dark persist without flash and meet contrast.
- Files in scope: theme bootstrap, control, tokens, tests
- Exclusions: custom user themes

### T-502 Add local Markdown notes

- Requirements: `NOT-001`–`NOT-008`, `SEC-001`, `SEC-004`
- Acceptance: edit/preview/autosave/error/clear/export/focus paths pass; XSS corpus stays inert; no network request contains note data.
- Files in scope: notes panel, sanitizer, storage, export, tests
- Exclusions: image upload, remote sync, collaboration

Review gate: second security review for sanitizer, local storage, and export code.

## Slice 6 — Complete original content

### T-601 Author chapters 02–06

- Requirements: content section of `spec.md`
- Acceptance: editorial checklist, primary references, schema validation, TypeScript code tests, and diagram alternatives pass for each chapter.
- Files in scope: chapters 02–06 and original diagrams
- Exclusions: later chapters

### T-602 Publish roadmap chapters 07–15

- Acceptance: roadmap entries show promise, planned evidence, and status without generating finished lesson routes or sitemap URLs.

### T-603 Publish roadmap chapters 16–24

- Same contract as T-602 for chapters 16–24.

Each chapter or coherent two-chapter pair should be its own human-reviewed commit. Do not generate all chapters in one task.

## Slice 7 — Launch quality

### T-701 Add metadata and discovery

- Requirements: `SEO-001`–`SEO-005`
- Acceptance: unique metadata, JSON-LD, manifest, icons, social cover, sitemap, and robots pass automated checks using the confirmed origin.
- Files in scope: SEO generators, public assets, tests
- Exclusions: deployment

### T-702 Apply security and caching headers

- Requirements: `SEC-002`, `SEC-003`, `REL-002`
- Acceptance: CSP and related headers pass hosting tests without breaking notes, diagrams, or fonts.
- Files in scope: Vercel configuration and hosting tests
- Exclusions: WAF or authenticated services

### T-703 Run full verification

- Requirements: all
- Acceptance: unit, integration, Playwright, accessibility, content, link, performance, console, security, build, and hosting gates pass; `design-qa.md` says `final result: passed`.
- Files in scope: fixes directly required by verification and launch evidence
- Exclusions: new features

### T-704 Deploy and connect domain

- Requirements: `SEO-001`, launch acceptance
- Acceptance: Vercel production deployment is healthy, DNS resolves, HTTPS and canonical redirect are correct, and Search Console receives the sitemap.
- Files in scope: deployment configuration and launch evidence
- Exclusions: portfolio edit

### T-705 Add to portfolio

- Requirements: `AUT-001`
- Acceptance: portfolio card describes the project accurately, links to the verified production URL, passes portfolio checks, and deploys.
- Files in scope: portfolio project only
- Exclusions: changes to this field guide
