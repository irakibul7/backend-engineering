# Product specification

Status: Approved for staged implementation  
Owner: Rakibul Islam  
Prepared: 2026-08-30  
Product title: Backend Engineering
Interaction research source: <https://backend-from-first-principle.vercel.app/>

## 1. Decision summary

Build a responsive, content-first backend engineering field guide with an original engineering-notebook interface. Research from the supplied site informs useful study interactions only; its layout, visual system, branding, and composition are not implementation targets. The MVP is statically generated, works without an account, stores progress and notes only in the learner's browser, and is deployable to Vercel.

The confirmed canonical production domain is `https://backend.therakibul.me`, matching the existing `therakibul.me` portfolio domain.

## 2. Problem

Backend concepts are often taught as framework recipes. Learners can reproduce code without understanding protocols, failure modes, system boundaries, or trade-offs. Rakibul needs a portfolio project that demonstrates backend depth while giving engineers a practical, searchable field manual.

## 3. Intended outcome

A visitor should be able to:

- understand the full backend learning path in under one minute;
- find a topic quickly by title, summary, tag, or glossary term;
- read a long technical lesson without losing place;
- mark chapters complete and see progress without creating an account;
- take private Markdown study notes and export them;
- use the experience comfortably on desktop and mobile;
- recognize Rakibul's authorship and reach his portfolio or GitHub.

## 4. Target users

1. Early-career backend engineers who need a structured foundation.
2. Full-stack engineers strengthening production backend knowledge.
3. Interview candidates reviewing systems concepts.
4. Engineering peers evaluating Rakibul's technical communication and product craft.

## 5. Product principles

- Explain why before framework syntax.
- One chapter is a self-contained field manual.
- Code and diagrams support the explanation; they do not replace it.
- Reading remains primary; study controls stay quiet and optional.
- No account is required for personal progress or notes.
- Every technical claim should be reviewable against primary documentation.
- The interface should feel like a precise engineer's field notebook: structured, calm, and practical without becoming a generic dashboard.

## 6. Scope

### MVP

- 24-chapter catalog with duration, tags, summary, completion state, and explicit published/coming-next/roadmap status.
- Long-form chapter route with table of contents, active-section indication, previous/next navigation, diagrams, code blocks, callouts, tables, and references.
- Command-search dialog available by click and keyboard shortcut.
- Completion tracking, theme preference, and notes stored locally.
- Markdown notes with edit, preview, save status, clear confirmation, and `.md` export.
- Three theme choices: system/editorial, light, and dark.
- Responsive behavior at desktop, tablet, and mobile.
- Author/community card, portfolio link, GitHub link, and project attribution.
- SEO, social preview, sitemap, robots, structured data, analytics hooks, and Vercel deployment configuration.
- Four fully written chapters: HTTP, routing, serialization, and identity/authentication/authorization.
- Two visible coming-next chapters: validation and layered request handling. These do not link to lesson routes until complete.
- A public roadmap for chapters 07–24. Roadmap entries remain visible but are not presented as finished lessons.

### Explicitly out of scope for MVP

- Accounts, authentication, server-side profiles, or cross-device sync.
- Comments, ratings, cohorts, certificates, payments, or email capture.
- Remote note storage, collaborative editing, or admin CMS.
- Runtime content API or database.
- Copying the reference repository's prose, diagrams, source code, author identity, or assets.
- PowerPoint COM, 10 GB upload, archive conversion, Room Agent updates, malware inspection, and other enterprise-document requirements from the supplied generic workflow. They are unrelated to this static learning product.

## 7. Information architecture

### Routes

- `/` — catalog and project introduction
- `/chapters/[slug]/` — one route per published chapter
- `/glossary/` — searchable backend term index
- `/roadmap/` — status and planned scope for chapters 07–24
- `/about/` — methodology, author, sources, and contribution guidance
- `/404.html` — helpful not-found page with search and catalog link

### Home composition

1. Compact product header with Library, Roadmap, Notes, search, and theme actions.
2. Left notebook rail with the product promise, local progress, continue action, and study-tool explanation.
3. Syllabus-style launch chapter index with difficulty, duration, progress, and current-reading state.
4. Expandable public-roadmap band.
5. Quiet author attribution and portfolio link.

### Lesson composition

1. Desktop sticky contents rail or mobile contents drawer.
2. Chapter eyebrow, title, summary, metadata chips, and reading progress.
3. Semantic sections with stable anchor IDs.
4. Code examples, tables, diagrams, callouts, references, and debugging checklist.
5. Previous/next chapter navigation.
6. Persistent product header for search, notes, and theme controls.

## 8. Functional requirements

### Catalog

- `CAT-001`: Render all published chapters in deterministic numeric order.
- `CAT-002`: Show number, title, estimated duration, short summary, and tags for each chapter.
- `CAT-003`: Make the complete card keyboard and pointer navigable while keeping completion a separate control.
- `CAT-004`: Show progress as `n of published chapters` and update it immediately. Coming-next and roadmap topics do not count until they are published.
- `CAT-005`: Preserve a quiet editorial hierarchy at 320 px through wide desktop layouts.
- `CAT-006`: Distinguish published lessons, coming-next chapters, and roadmap entries in text and accessible state, not color alone.

### Lessons

- `LES-001`: Generate one canonical static route for every published chapter.
- `LES-002`: Render a sticky desktop table of contents and an accessible mobile drawer.
- `LES-003`: Update the active contents item as the reader crosses section boundaries.
- `LES-004`: Support semantic prose, code, tables, callouts, diagrams, citations, and reference lists.
- `LES-005`: Provide copy controls for code blocks with accessible success feedback.
- `LES-006`: Provide previous/next navigation with chapter number and title.
- `LES-007`: Preserve the current section when a theme or notes panel changes.
- `LES-008`: Expose stable anchors so sections can be deep-linked.
- `LES-009`: Include at least two original explanatory visuals in every published chapter, with a visible caption and an equivalent text explanation. Visuals must clarify a system boundary, decision, comparison, state change, or rollout rather than decorate the lesson. Every diagram renderer must respond to its own container width and transform dense grids into readable rows or vertical sequences before labels or explanations become compressed.

### Search

- `SEA-001`: Open search from the header action, `Ctrl/Cmd+K`, or `/` when focus is not in an editable field.
- `SEA-002`: Search title, summary, tags, section headings, and glossary terms locally.
- `SEA-003`: Return ranked results within 100 ms for the production index on a mid-range mobile device.
- `SEA-004`: Support Arrow keys, Enter, and Escape with correct focus restoration.
- `SEA-005`: Display helpful empty and initial states without layout shift.

### Progress

- `PRO-001`: Toggle chapter completion without navigating.
- `PRO-002`: Persist completion locally using a versioned schema.
- `PRO-003`: Ignore unknown chapter IDs and recover from malformed stored data.
- `PRO-004`: Expose completion state to assistive technology and never rely on color alone.
- `PRO-005`: Record at most one learning visit per local calendar day, display the current and best consecutive-day streak, and keep all streak data in versioned browser storage.

### Study notes

- `NOT-001`: Open and close a lesson-aware notes panel from button or keyboard shortcut.
- `NOT-002`: Store a private Markdown note per chapter plus optional master notes.
- `NOT-003`: Autosave locally after a short debounce and show `Saving`, `Saved`, or `Error` state.
- `NOT-004`: Preview sanitized Markdown with headings, lists, code, emphasis, links, and callouts.
- `NOT-005`: Export the active note as a UTF-8 Markdown file.
- `NOT-006`: Require confirmation before clearing a non-empty note.
- `NOT-007`: Preserve keyboard focus and trap focus while the panel is modal on narrow screens.
- `NOT-008`: Do not transmit note content or include it in analytics.

### Theme

- `THE-001`: Provide system/editorial, light, and dark modes.
- `THE-002`: Persist explicit choice locally and prevent a flash of the wrong theme.
- `THE-003`: Meet WCAG AA contrast in every theme, including code, diagrams, focus states, and callouts.

### Author and portfolio

- `AUT-001`: Attribute the project to Rakibul Islam and link to `therakibul.me` and GitHub.
- `AUT-002`: Explain that the material is an original field guide informed by primary sources.
- `AUT-003`: Provide a contribution route only after a dedicated project repository exists.

### SEO and sharing

- `SEO-001`: Use one canonical origin controlled by `PUBLIC_SITE_URL`.
- `SEO-002`: Generate unique title, description, canonical, Open Graph, Twitter, and article metadata per route.
- `SEO-003`: Generate sitemap and robots files from published content.
- `SEO-004`: Add `WebSite`, `Person`, `BreadcrumbList`, and `TechArticle` JSON-LD where appropriate.
- `SEO-005`: Provide favicon, app icons, manifest, and a branded social-sharing image.

### Accessibility and responsive behavior

- `A11Y-001`: Meet WCAG 2.2 AA for keyboard use, focus, contrast, landmarks, headings, labels, and reduced motion.
- `A11Y-002`: Include skip navigation and announce dynamic search, copy, save, and progress feedback.
- `A11Y-003`: Avoid horizontal page scrolling at 320 px and above. Diagrams and graphs must reflow without clipped nodes, overlapping connectors, compressed labels, or diagram-level horizontal scrolling.
- `A11Y-004`: Maintain a comfortable reading measure of roughly 65–78 characters on lessons.
- `A11Y-005`: Make all pointer targets at least 44 by 44 CSS pixels where practical.

### Performance and reliability

- `PERF-001`: Pre-render all public content; JavaScript is optional for reading.
- `PERF-002`: Target LCP under 2.5 s, CLS under 0.1, and INP under 200 ms at the 75th percentile.
- `PERF-003`: Keep initial JavaScript under 100 kB gzip unless an ADR approves an exception.
- `PERF-004`: Self-host or package required production assets; no reference-site hotlinks.
- `REL-001`: A failed notes/search enhancement must not prevent reading or navigation.
- `REL-002`: Unknown routes return a real 404 response in production.

### Security and privacy

- `SEC-001`: Sanitize any user-authored Markdown before preview.
- `SEC-002`: Use a restrictive Content Security Policy compatible with static hosting.
- `SEC-003`: External links use safe opener behavior and visibly identify external destinations.
- `SEC-004`: Collect no personal data in MVP; analytics, if enabled, must exclude note/search content.
- `SEC-005`: Pin dependencies and run dependency and secret scans in CI.

## 9. Content requirements

- The current release includes four complete chapters and the 24-chapter outline in `docs/content-outline.md`; chapters 05–06 are coming next and chapters 07–24 are public roadmap entries.
- Each published chapter has a learning promise, prerequisites, mental model, first-principles explanation, production implications, practical examples, failure cases, debugging checklist, glossary links, and primary references.
- Product navigation and positioning remain implementation-language neutral. Initial examples are authored in the current repository language, while the content model must allow additional languages later without renaming the product or restructuring the curriculum.
- Content must not be bulk-copied or lightly paraphrased from the reference.
- Every published chapter contains at least two diagrams or graphs created specifically for this project, and every visual has a visible caption and equivalent text explanation. New visual types must define and verify desktop, narrow-container, and 320 px presentations before publication.
- `CON-004`: Before Chapter 04 is published, its reviewed specification must separate identity, authentication, session/token validation, and per-resource authorization; include an executable authorization matrix and session-lifecycle tests; and make clear that the educational examples do not add authentication or a runtime API to this website.

## 10. Architecture

The implementation uses the approved Product Design Vite/React starter with strict TypeScript. Chapter content is stored as validated TypeScript data and rendered through semantic block components. A post-build prerender step emits route-specific HTML, metadata, and canonical paths for static Vercel delivery. Search, notes, progress, and theme remain small client-side modules. See ADR-0001.

Content is validated at build time. Search data is generated during the build. Browser-only state is versioned in local storage. The MVP has no runtime server, database, account, or API; `openapi.yaml` records that boundary.

## 11. Analytics

If Vercel Web Analytics and Speed Insights are enabled, only route and performance information may be collected. Search queries, completion IDs, notes, clipboard activity, and exported filenames must never be sent.

## 12. Launch acceptance

The release is ready only when:

1. All 24 catalog entries exist; only complete chapters have canonical lesson routes, chapters 05–06 are labeled coming next, and chapters 07–24 link to the roadmap.
2. Chapters 01–04 are fully authored; coming-next and roadmap chapters are explicitly labeled and excluded from lesson sitemap entries.
3. Search, progress, theme, and notes pass keyboard and mobile Playwright coverage.
4. All repository quality gates in `docs/test-strategy.md` pass.
5. Design QA compares desktop and mobile captures against the approved original mock and records `final result: passed`.
6. Production metadata uses the confirmed domain.
7. Vercel preview and production return correct status codes, headers, sitemap, robots, and social images.
8. The portfolio adds the project only after the production route is verified.

## 13. Confirmed decisions and remaining governance

Confirmed 2026-08-30:

1. Canonical domain: `backend.therakibul.me`.
2. Staged growth: four complete foundation chapters, two visible coming-next chapters, and a public roadmap for chapters 07–24.
3. Public positioning is language-neutral. Initial examples use the current repository language; additional language variants may be added later.
4. Specification approved; proceed through technical validation and small reviewed slices.

Still governed by the existing contract:

- A contribution link is added only after a dedicated repository exists.
- Reuse of source assets or prose requires documented permission; otherwise all content and assets remain original.
