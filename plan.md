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

Decision: Complete on 2026-08-30 and refined after design review. Confirmed domain, two-chapter first release with four coming-next entries, language-neutral product positioning, and approval to proceed with an extensible example model.

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

### T-601 Author chapter 02

- Requirements: content section of `spec.md`
- Acceptance: routing mental model, production implications, ambiguity and method-dispatch failures, debugging checklist, primary references, and TypeScript routing tests pass.
- Files in scope: chapter 02 content, lesson-reference renderer, publication-state model, and routing example/tests
- Exclusions: later chapters
- Status: Complete. Chapters 01–02 are published; chapters 03–06 are visible as coming next without lesson links.

### T-602 Author chapters 03–06

- Acceptance: editorial checklist, primary references, schema validation, TypeScript code tests, and diagram alternatives pass for each chapter.
- Files in scope: chapters 03–06 and original diagrams
- Exclusions: roadmap chapters
- Status: Complete. Chapters 03–06 are complete and published.

### T-602A Add the published-chapter visual learning system

- Requirements: `LES-004`, `LES-009`, `THE-003`, `A11Y-001`, `A11Y-003`
- Acceptance: Chapters 01–03 each contain at least two original, captioned visuals; flows, route decisions, precedence, caching, serialization boundaries, and compatibility rollout remain understandable without color; every visual includes an equivalent text explanation; desktop, 390 px, and 320 px layouts have no page overflow; accessibility and design QA pass.
- Files in scope: `spec.md`, `plan.md`, `docs/content-outline.md`, typed chapter visual data, lesson visual renderers/styles/tests, and visual-system validation evidence
- Exclusions: new chapters, fabricated benchmark data, animations, handcrafted SVGs, reference-site prose or artwork, and changes to progress persistence
- Status: Complete and awaiting human review. Direction 2, Annotated Comparisons, was selected and verified on 2026-08-30; evidence is recorded in `docs/validation/chapter-visual-system.md` and `design-qa.md`.

### T-602B Specify Chapter 04 security boundaries

- Requirements: `LES-001`, `LES-004`, `LES-008`, `LES-009`, `A11Y-001`, `A11Y-003`, `CON-004`
- Acceptance: `docs/chapter-04-identity-spec.md` defines the lesson contract, glossary, fictional service boundaries, session state machine, data model, authorization matrix, token-validation boundary, threat hypotheses, original visuals, TypeScript example seams, primary sources, acceptance tests, and ADR impact; it explicitly preserves the static site's no-auth/no-API boundary.
- Files in scope: `spec.md`, `plan.md`, `docs/content-outline.md`, `docs/chapter-04-identity-spec.md`
- Exclusions: chapter implementation, product authentication, login UI, runtime API, identity provider, secrets, dependencies, styles, routes, sitemap changes, and publication-state changes
- Status: Complete and human-reviewed. No public route or product behavior changed in this slice.

### T-602C Implement and publish Chapter 04

- Requirements: `LES-001`, `LES-004`, `LES-008`, `LES-009`, `A11Y-001`, `A11Y-003`, `CON-004`
- Acceptance: the approved eight-section chapter, three original visuals, session-policy example, executable authorization matrix, primary references, glossary/search integration, route metadata, sitemap entry, and validation evidence pass the full repository quality gate at desktop, 390 px, and 320 px; the homepage denominator becomes four published chapters without invalidating existing local progress.
- Files in scope: Chapter 04 typed content; session and authorization example modules/tests; glossary entries; only the renderer/style changes proven necessary for the approved visuals; validation and design-QA evidence; generated static discovery output
- Exclusions: real product authentication, accounts, database, login UI, OAuth provider integration, auth SDK, hand-written cryptography, runtime API, remote progress/notes, analytics changes, and Chapters 05–24
- Status: Complete and awaiting human review. The specification was approved, implementation verified, and the final fail-closed session/time-claim review fixed on 2026-08-31; evidence is recorded in `docs/validation/chapter-04-identity.md`.

### T-602D Specify Chapter 05 validation boundaries

- Requirements: `LES-001`, `LES-004`, `LES-008`, `LES-009`, `A11Y-001`, `A11Y-003`, `CON-005`
- Acceptance: `docs/chapter-05-validation-spec.md` defines the lesson contract, glossary, fictional request boundary, validation state machine, data model, failure taxonomy, threat hypotheses, original visuals, TypeScript example seams, primary sources, acceptance tests, and ADR impact; it explicitly preserves the static site's no-API boundary and distinguishes validation from parsing, coercion, sanitization, authorization, and database enforcement.
- Files in scope: `spec.md`, `plan.md`, `docs/content-outline.md`, `docs/chapter-05-validation-spec.md`
- Exclusions: chapter implementation, product forms, runtime API, request parser, schema library, database, dependencies, styles, routes, sitemap changes, and publication-state changes
- Status: Complete and human-reviewed. No public route or product behavior changed in this slice.

### T-602E Implement and publish Chapter 05

- Requirements: `LES-001`, `LES-004`, `LES-008`, `LES-009`, `A11Y-001`, `A11Y-003`, `CON-005`
- Acceptance: the approved ten-section chapter, original responsive visuals, pure TypeScript validation example, executable failure taxonomy, primary references, glossary/search integration, route metadata, sitemap entry, and validation evidence pass the full repository quality gate at desktop, 390 px, and 320 px; the homepage denominator becomes five published chapters without invalidating existing local progress.
- Files in scope: Chapter 05 typed content; validation example modules/tests; glossary entries; only renderer/style changes proven necessary for approved visuals; validation and design-QA evidence; generated static discovery output
- Exclusions: product forms, runtime API, request parser integration, schema-library dependency, database, authorization implementation, remote progress/notes, analytics changes, and Chapters 06–24
- Status: Complete, human-reviewed, committed, and published on 2026-08-31; evidence is recorded in `docs/validation/chapter-05-validation.md`.

### T-602F Specify Chapter 06 layered request handling

- Requirements: `LES-001`, `LES-004`, `LES-008`, `LES-009`, `A11Y-001`, `A11Y-003`, `A11Y-004`, `CON-006`
- Acceptance: `docs/chapter-06-layered-handling-spec.md` defines the learning contract, running request, glossary, role matrix, lifecycle state machine, type model, dependency direction, middleware contract, request-context rules, failure ownership, threat hypotheses, original visuals, TypeScript example seams, primary sources, acceptance tests, OpenAPI/threat-model impact, ADR impact, and small implementation slices.
- Files in scope: `spec.md`, `plan.md`, `docs/content-outline.md`, `docs/chapter-06-layered-handling-spec.md`
- Exclusions: chapter implementation, publication state, React/CSS changes, product middleware, runtime API, server, database, DI container, tracing SDK, dependencies, routes, metadata, sitemap, and Chapter 07
- Status: Complete and human-reviewed. The user approved the specification on 2026-08-31.

### T-602G Implement and publish Chapter 06

- Requirements: `LES-001`, `LES-004`, `LES-008`, `LES-009`, `A11Y-001`, `A11Y-003`, `A11Y-004`, `CON-006`
- Acceptance: the approved ten-section chapter, three original responsive visuals, dependency-free TypeScript request-layer example, executable responsibility and middleware contracts, primary references, glossary/search integration, route metadata, sitemap entry, and validation evidence pass the full repository quality gate at desktop, 390 px, and 320 px; the homepage denominator becomes six published chapters without invalidating existing local progress.
- Files in scope: approved Chapter 06 content; layered request example/tests; glossary entries; only renderer/style changes proven necessary; validation and design-QA evidence; generated static discovery output
- Exclusions: runtime API, server framework, database, ORM, DI container, tracing SDK, remote progress/notes, analytics changes, and Chapters 07–25
- Status: Complete, human-reviewed, and approved for commit on 2026-08-31. Content, examples, discovery integration, quality gates, responsive browser checks, accessibility, and performance evidence passed; evidence is recorded in `docs/validation/chapter-06-layered-handling.md`. The temporary bundle exception is accepted in ADR-0005.

### T-602H Specify Chapter 07 networking and packet routing

- Requirements: `LES-001`, `LES-004`, `LES-008`, `LES-009`, `A11Y-001`, `A11Y-003`, `A11Y-004`, `PERF-002`, `PERF-003`, `CON-007`
- Acceptance: `docs/chapter-07-networking-spec.md` defines curriculum position, learning contract, two running topologies, glossary, sixteen-section outline, explicit coverage gate, deterministic packet and scenario state, data model, longest-prefix-match contract, the selected 3D centerpiece and seven supporting visual modules, renderer lifecycle, responsive and accessibility behavior, performance budget, threat hypotheses, PoCs, test strategy, sources, architecture impact, and small implementation slices.
- Files in scope: `spec.md`, `plan.md`, `docs/content-outline.md`, `docs/chapter-07-networking-spec.md`, and the selected concept image under validation screenshots
- Exclusions: chapter implementation, dependencies, React/CSS changes, Three.js, routes, publication state, sitemap, metadata, storage, analytics, and renumbering the current runtime catalog
- Status: Complete and human-approved on 2026-08-31. The approved amendment requires sixteen sections, eight visual modules, TCP/UDP-neutral examples, route repair, Internet reachability, and operations evidence before publication.

### T-602I Validate Chapter 07 networking and 3D boundaries

- Acceptance: PoC-NET-01 through PoC-NET-03 prove routing correctness, deterministic scene state, protocol-layer and bounded routed-topology 3D fidelity, TCP/UDP-neutral encapsulation, readable mobile hop timelines, bounded renderer lifecycle, context loss, reduced motion, keyboard operation, no-WebGL equivalence, responsive behavior, and bundle budgets before public implementation.
- Files in scope: isolated PoC modules/tests/fixture, dependency ADR, and validation evidence approved after `T-602H`
- Exclusions: public lesson route, catalog publication, sitemap, metadata, and unrelated chapters
- Status: Complete and human-approved on 2026-08-31. The expanded proof covers eight modules and forty deterministic states, passes model/component/lifecycle tests, responsive checks, normal and no-WebGL accessibility scans, production build and bundle budgets, renderer lifecycle/context recovery, and repository regression gates. ADR-0006 is Accepted. No public lesson route or catalog publication occurred in this slice.

### T-602J Implement and publish Chapter 07

- Acceptance: ADR-0005 content splitting, the approved original sixteen-section static chapter, all required responsive visual modules, protocol-layer and routed-topology interactions, dependency-free semantic fallback, glossary/search/progress/SEO/sitemap integration, primary references, and complete accessibility/responsive/performance/design-QA evidence pass before commit.
- Files in scope: approved Chapter 07 implementation and the prerequisite route-size architecture
- Exclusions: network inspection, runtime API, sockets, live topology, user network data, telemetry changes, and Chapters 08–25
- Status: Ready. `T-602H` and `T-602I` are approved; begin with the ADR-0005 route-size architecture prerequisite before authoring and publishing the sixteen-section lesson.

### T-603 Publish roadmap chapters 08–15

- Acceptance: roadmap entries show promise, planned evidence, and status without generating finished lesson routes or sitemap URLs.
- Prerequisite: accept and complete the per-chapter content split required by `docs/adr/0005-bounded-content-bundle-growth.md` before publishing Chapter 07.

### T-604 Publish roadmap chapters 16–25

- Same contract as T-603 for chapters 16–25.

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
