# Published chapter visual-system evidence

Date: 2026-08-30  
Task: T-602A  
Requirements: `LES-004`, `LES-009`, `THE-003`, `A11Y-001`, `A11Y-003`

## Delivered scope

The three published chapters now contain six original explanatory visuals:

- Chapter 01: request ownership flow and cache freshness decision.
- Chapter 02: route-specificity ladder and 404/405 dispatch decision.
- Chapter 03: representation boundary flow and compatibility-first rollout timeline.

All visuals are rendered from typed content through four reusable semantic variants: flow, decision, ladder, and timeline. Every figure has a visible caption and visible equivalent text. Selection and outcome meanings use text as well as the orange accent.

Excluded by design: fabricated benchmark values, animations, handcrafted SVGs, reference-site artwork or prose, and new chapter content.

## Verification evidence

- `npm run check`: passed.
- Test files: 7 passed; tests: 41 passed.
- Production routes generated: 5.
- Initial JavaScript: 87.70 kB gzip; budget: less than 100 kB.
- Hosting tests: 12 passed.
- Broken-link verification: 27 URLs passed.
- axe-core 4.13.0: zero violations on all three published chapter routes.
- In-app browser: two expected figures on every published route, zero desktop document overflow, and zero console warnings or errors.
- Lighthouse at 390 × 844: performance 0.97, accessibility 1.00, best practices 1.00, SEO 1.00, LCP 2.1 s, CLS 0.001, console-error audit passed.
- Lighthouse at 320 × 700: performance 0.97, accessibility 1.00, best practices 1.00, SEO 1.00, LCP 2.1 s, CLS 0.058, console-error audit passed.
- `git diff --check`: passed.

## Captures

- `screenshots/visual-system-routing-comparison.png`: normalized source and implementation comparison.
- `screenshots/visual-system-routing-full-page.png`: full routing lesson.
- `screenshots/visual-system-routing-desktop.png`: focused desktop ladder.
- `screenshots/visual-system-http-responsive.png`: request flow in the responsive lesson shell.
- `screenshots/visual-system-serialization-timeline.png`: rollout timeline in the responsive lesson shell.
- `screenshots/visual-system-routing-390.png`: Lighthouse 390-pixel route capture.
- `screenshots/visual-system-serialization-320.png`: Lighthouse 320-pixel route capture.

Design QA: `design-qa.md` ends with `final result: passed`.
