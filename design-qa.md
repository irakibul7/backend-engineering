# Design QA: annotated chapter visuals

## Comparison target

- Source visual truth: `/Users/swoptechnologies/.codex/generated_images/01a03c60-8815-76b2-b6d9-72252e947379/exec-997c0863-920f-4348-8a28-1deba1a44c1a.png`
- Rendered implementation: `docs/validation/screenshots/visual-system-routing-desktop.png`
- Full rendered route: `docs/validation/screenshots/visual-system-routing-full-page.png`
- Combined comparison input: `docs/validation/screenshots/visual-system-routing-comparison.png`
- Route and state: `/chapters/routing-and-request-dispatch/`, light theme, route-specificity visual in view.
- Browser viewport: 1280 × 720 CSS pixels; implementation screenshot is 1265 × 712 pixels after browser scrollbar and chrome exclusion, at device scale factor 1.
- Source dimensions: 1487 × 1058 pixels. The relevant 1090 × 650 source region was cropped, scaled to 1200 pixels wide, and padded to 1400 × 900. The implementation was scaled to 1200 pixels wide and padded to the same 1400 × 900 frame. The combined comparison is 1400 × 1800 pixels.

## Findings

No actionable P0, P1, or P2 differences remain.

- [Expected] The production visual uses semantic rows instead of dotted connector lines.
  - Location: route-specificity ladder.
  - Evidence: the selected concept uses four candidates joined by drawn leader lines; the implementation uses three ordered candidates with explicit rank, reason, and `Selected`/`Candidate` text.
  - Impact: the same precedence relationship remains clear, survives narrow layouts, and does not depend on a decorative drawing.
  - Classification: intentional implementation and accessibility constraint.

- [Expected] The production visual follows the existing lesson width and typography.
  - Location: all six chapter visuals.
  - Evidence: the source concept is a full alternate lesson composition; the implementation applies its annotated-comparison language inside the approved Backend Engineering notebook shell.
  - Impact: the site remains original and visually consistent rather than becoming a copy of either inspiration site.
  - Classification: required product constraint.

- [P3] The text-view paragraph is denser than the source annotation column.
  - Location: the bottom row of each visual.
  - Impact: no information loss or interaction issue; a later editorial pass could shorten alternatives while preserving equivalent meaning.

## Required fidelity surfaces

- Fonts and typography: Spline Sans remains the reading face and JetBrains Mono handles ranks, conditions, paths, phase markers, and compact labels. The selected direction's technical hierarchy is preserved without introducing another font.
- Spacing and layout rhythm: figures use the lesson's 820-pixel reading column, thin rules, 8–14 pixel internal gaps, and a consistent caption/content/text-view sequence. Flow, decision, ladder, and timeline variants share the same frame.
- Colors and tokens: ink, muted text, rule lines, paper surfaces, and orange accent use the existing theme variables. Selected states include text, so color is not the only signal.
- Image quality and asset fidelity: the selected visual contains interface-native diagrams rather than photography or illustrative assets. Production uses semantic lists, text, and the project's existing Lucide arrow icon; no reference artwork, placeholder image, hotlink, custom SVG, or decorative raster was introduced.
- Copy and content: all six visuals use original chapter-specific explanations. No invented performance measurement or benchmark value is presented.
- Responsiveness and accessibility: the same data reads in source order, alternatives remain visible, arrows are decorative, captions name every figure, and mobile layouts stack at the existing lesson breakpoint. Automated axe scans found zero violations on all three routes.

## Full-view and focused evidence

- Full view: the selected concept and `visual-system-routing-full-page.png` were opened and inspected for lesson density, hierarchy, accent use, and surrounding context.
- Focused comparison: `visual-system-routing-comparison.png` places the source visual region and rendered production view in one normalized image. The ladder's request context, ranked candidates, selected outcome, and text alternative are readable in both.
- Additional variants: `visual-system-http-responsive.png` and `visual-system-serialization-timeline.png` show the flow and timeline renderers in the responsive lesson shell.
- Narrow routes: Lighthouse captured `visual-system-routing-390.png` and `visual-system-serialization-320.png`; both retained the header, contents control, heading, metadata, and reading column.

## Comparison history

### Pass 1

- Compared the source and implementation together using `visual-system-routing-comparison.png`.
- Checked typography, spacing, tokens, figure labeling, selection semantics, text alternatives, and lesson-shell integration.
- No P0/P1/P2 issue was identified, so no post-comparison visual fix loop was required.

## Primary interactions and browser checks

- Opened all three published routes in the in-app browser and confirmed exactly two named visual figures on each.
- Measured zero document overflow on all three routes at the desktop browser viewport.
- Inspected the flow renderer and rollout timeline in the responsive lesson shell at 742 × 844 with zero document overflow.
- Lighthouse emulation passed at 390 × 844 and 320 × 700 with accessibility, best-practices, and SEO scores of 1.00, performance 0.97, and no console errors.
- In-app browser console logs: zero warnings or errors.

## Automated verification

- strict TypeScript and ESLint with zero warnings
- 7 test files and 41 passing tests
- production build with 87.70 kB gzip initial JavaScript, under the 100 kB budget
- 12 hosting tests
- 27 verified links with no failures
- axe-core 4.13.0: zero automated violations on Chapters 01–03

final result: passed
