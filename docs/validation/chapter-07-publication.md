# Chapter 07 and presentation verification

Date: 2026-09-06. Local implementation; user approved commit and push on 2026-09-06.

## Delivered scope

The preceding learning-flow fixes were committed and pushed to `main` as `b8cdf11` with user authorization. Subsequent changes group the roadmap into three stages, wrap its descriptions, and tighten lesson spacing.

ADR-0005 is implemented: metadata and section indexes are separate from lazy lesson bodies. The build prerenders readable HTML for all public routes. Chapter 07 contains sixteen original sections, eight interactive modules with forty deterministic states, per-section worked evidence, a route-repair transcript, an annotated capture, glossary definitions, and primary references. Existing roadmap slugs remain stable; their numbers shift to 08–25.

The approved Three.js proof is promoted into a lazy embedded lab. The PoC entry re-exports the production implementation so its parser, scenario, lifecycle, and component tests cover the shared code. Static HTML includes every state description and fact, independently of the canvas.

## Verification

- `npm run check`: strict types, lint, 192 unit/content/component tests, production build, and 14 hosting/static/bundle checks pass.
- `npm run verify:links`: all 65 links pass. RFC Editor initially returned HTTP 429 for the new citations; the chapter now links to official IETF copies, verified successfully.
- Axe: zero violations on the production chapter, both with the lab closed and opened.
- Production browser sweep: all forty module states retain semantic evidence; zero console warnings/errors; resource origins contain only localhost.
- CUA manual checks: desktop at 1440 px, mobile at 390 px, and narrow 320 px. No document overflow; narrow controls are 48 px high. Mobile uses a named step selector. Desktop arrow keys change the focused step. Reduced motion disables auto-play and leaves the renderer idle.
- Existing component tests verify fallback, scenario synchronization, motion preference, step control, and lifecycle behavior. Added an embedded-mode test for theme preservation, heading hierarchy, and replay.
- Static-route tests verify all section anchors and introductions in generated HTML; catalog/search/progress/navigation tests include Chapter 07.
- Lighthouse mobile on the production chapter: performance 95, accessibility 100, best practices 100, SEO 100; cumulative layout shift 0. This is a local baseline, not field performance.
- `git diff --check`: passes.

## Bundle evidence

Production gzip sizes (decimal kB): entry 73.90; shared loader/catalog 6.05; Chapter 07 body 7.91; shared scenario evidence 6.32; lab UI 6.86; Three.js plus scene 131.67. The aggregate shared entry stays below 100 kB, aggregate networking content/UI below 35 kB, and the lazy renderer below 180 kB. The renderer is requested only after opening the lab and approaching its viewport.

## Review notes

The SSR build reports expected static/dynamic-import notices because its prerender entry intentionally imports every lesson. The client build emits separate lesson chunks. The 3D chunk triggers Vite's default uncompressed-size advisory; its compressed size remains within the explicitly approved ADR-0006 budget.

Automated Selenium layout calls were clamped to a 500 px minimum window by headless Chrome; the 390 px and 320 px claims above come from the separate CUA viewport checks. Context-loss behavior remains covered by the prior approved proof and shared lifecycle implementation; forced context recovery was not repeated in the public embedded browser run. The user subsequently approved committing and pushing this slice on 2026-09-06. No explicit production deployment was performed.
