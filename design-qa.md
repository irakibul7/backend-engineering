# Design QA: responsive diagram system

Latest responsive review: 2026-08-31. This pass responds to the supplied compressed three-column cache-decision capture and applies the result to the shared flow, decision, precedence-ladder, and timeline renderers.

## Latest comparison target

- Source failure capture: `/var/folders/_3/q4mggdm115df_j6qdtmbzwjr0000gn/T/TemporaryItems/NSIRD_screencaptureui_DjBzJJ/Screenshot 2026-08-31 at 12.06.03 PM.png`
- Desktop implementation: `docs/validation/screenshots/responsive-decision-desktop.png`
- Mobile implementations: `docs/validation/screenshots/responsive-decision-390.png`, `docs/validation/screenshots/responsive-flow-320.png`, `docs/validation/screenshots/responsive-ladder-320.png`, and `docs/validation/screenshots/responsive-timeline-320.png`
- Mobile header implementation: `docs/validation/screenshots/responsive-header-320.png`
- Combined focused comparison: `docs/validation/screenshots/responsive-decision-comparison.png`
- Route and state: published lesson routes, light theme, figures scrolled into view, Contents drawer closed except for its interaction test.
- Source pixels: 816 × 140. Desktop capture: 1265 × 712 at a 1280 × 720 browser viewport and device scale factor 1. The focused implementation region was cropped to 800 × 495 and padded to 816 × 505; source and implementation were stacked in an 816 × 665 comparison image without rescaling the source.
- Mobile captures: 375 × 812 pixels at a 390 × 844 viewport and 305 × 667 pixels at a 320 × 700 viewport, both at device scale factor 1 after browser scrollbar/chrome exclusion.

## Latest findings

No actionable P0, P1, or P2 differences remain.

- [Expected] The cache decision is now a vertical decision table at every lesson width.
  - Evidence: the source failure capture compresses three condition/result cards into one horizontal row; `responsive-decision-comparison.png` shows one full-width row per condition with a stable condition → outcome → explanation reading order.
  - Impact: labels and explanations keep their intended hierarchy instead of competing for three narrow columns.
- [Expected] Narrow flows and timelines use vertical process rails.
  - Evidence: `responsive-flow-320.png` and `responsive-timeline-320.png` retain numbered or phased order, connectors, titles, and explanations at the smallest supported viewport.
  - Impact: sequence is visible without horizontal scrolling or clipped nodes.
- [Expected] The header mark uses the exact installed app icon.
  - Evidence: desktop and mobile captures show `/icon-192.png?v=2` inside the home link; the image retains its original dark rounded tile and orange `B` mark.
- [P3] The 320 px precedence ladder intentionally shows fewer candidates per viewport height.
  - Impact: vertical scrolling is expected lesson behavior; no node, status, or explanation is clipped horizontally.

## Latest required fidelity surfaces

- Fonts and typography: Spline Sans and JetBrains Mono remain unchanged. The new decision rows give conditions a stable column and preserve outcome weight, explanation size, line height, and wrapping at desktop and mobile widths.
- Spacing and layout rhythm: desktop decision rows use consistent 13–15 px padding and 8 px separation. At narrow container widths, flows and timelines become vertical rails; the 320 px header and sticky Contents bar no longer overlap the reading column.
- Colors and tokens: all borders, paper layers, muted copy, selection states, and connectors continue to use existing theme tokens. No theme-specific hard-coded background was introduced.
- Image quality and asset fidelity: the home link now displays the shipped 192 px app icon directly at 44 px desktop and 36 px mobile. It is not redrawn with CSS, text, or a custom SVG.
- Copy and content: all original diagram conditions, outcomes, stages, captions, and equivalent text views remain unchanged.
- Responsiveness and accessibility: the four published routes reported zero page, figure, and descendant overflow at 390 px and 320 px. The 320 px header and primary navigation reported zero overflow; the Contents control is a full-width sticky bar below the header and no longer covers captions. Figures retain semantic lists, captions, decorative-arrow hiding, and visible text alternatives.

## Latest full-view and focused evidence

- Full view: desktop and mobile route captures were inspected for header/logo proportions, reading-column alignment, sticky navigation, diagram density, and theme consistency.
- Focused comparison: `responsive-decision-comparison.png` places the supplied compressed decision row directly above the redesigned desktop figure. The comparison verifies the new vertical table rather than relying on code inspection.
- Renderer variants: flow, decision, ladder, and timeline were each opened at 320 px. Every renderer and descendant measured zero horizontal overflow across Chapters 01–04.
- Primary interaction: the mobile Contents button opened the drawer with `aria-expanded="true"` and a backdrop, then closed with `aria-expanded="false"`.
- Browser console: zero warnings or errors during the four-route 320 px pass.

## Latest comparison history

### Pass 1 — blocked

- [P1] The cache-decision outcomes were compressed into three narrow cards.
- [P2] Diagram reflow depended on viewport width rather than the figure's available container width.
- [P2] The fixed mobile Contents button covered figure captions while scrolling.
- [P2] The 320 px primary navigation exposed an internal horizontal scrollbar.

### Pass 2 — passed

- Replaced the three-column decision grid with full-width semantic decision rows.
- Added container-based narrow layouts for flow, ladder, and timeline renderers, including a second breakpoint for dense decision and ladder content.
- Converted the Contents control into a sticky full-width lesson bar below the app header.
- Rebalanced the 320 px header columns, controls, gaps, and navigation padding; page, header, nav, figure, and descendant overflow all measure zero.
- Replaced the text logo with the existing app-icon asset and preserved the accessible home-link label.

## Prior review: annotated chapter visuals

Chapter 04 extension reviewed: 2026-08-31. The identity/authentication/authorization lesson adds three original figures through the approved flow, timeline, and decision renderers. Desktop, 390 × 844, and 320 × 700 checks found no page overflow, visual overflow, error overlay, or console warning/error. The mobile contents drawer exposed all eight section anchors. Axe reported zero automated violations; Lighthouse scored 0.98 performance and 1.00 accessibility, best practices, and SEO at both narrow viewports. Detailed evidence is in `docs/validation/chapter-04-identity.md`.

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
  - Location: all nine chapter visuals.
  - Evidence: the source concept is a full alternate lesson composition; the implementation applies its annotated-comparison language inside the approved Backend Engineering notebook shell. Chapter 04 extends the same system without adding a competing visual style.
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
- Copy and content: all nine visuals use original chapter-specific explanations. No invented performance measurement or benchmark value is presented.
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

- Opened all four published routes in the in-app browser. Chapters 01–03 retain two named figures each; Chapter 04 contains three named figures.
- Measured zero document overflow on all four routes at the desktop browser viewport.
- Inspected the flow renderer and rollout timeline in the responsive lesson shell at 742 × 844 with zero document overflow.
- Lighthouse emulation passed at 390 × 844 and 320 × 700 with accessibility, best-practices, and SEO scores of 1.00, performance 0.97, and no console errors.
- In-app browser console logs: zero warnings or errors.

## Automated verification

- strict TypeScript and ESLint with zero warnings
- 9 test files and 90 passing tests
- production build with 93.98 kB gzip initial JavaScript, under the 100 kB budget
- 12 hosting tests
- 34 verified links with no failures
- axe-core 4.13.0: zero automated violations on Chapter 04; previous evidence covers Chapters 01–03

final result: passed
