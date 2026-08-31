# Design QA: Chapter 07 expanded networking observatory PoC

Latest review: 2026-08-31. This pass compares visual direction 2, the selected Protocol Layer Observatory, with the approved eight-module interactive proof. The implementation keeps the selected technical composition while expanding coverage beyond the original single packet-stack state.

## Latest comparison target

- Source visual truth: `docs/validation/screenshots/chapter-07-networking-selected-concept.png`
- Browser-rendered implementation: `docs/validation/screenshots/chapter-07-networking-expanded-poc-desktop.png`
- Combined comparison input: `docs/validation/screenshots/chapter-07-networking-design-qa-comparison.png`
- Responsive evidence: `docs/validation/screenshots/chapter-07-networking-expanded-poc-390.png` and `docs/validation/screenshots/chapter-07-networking-expanded-poc-fallback-320.png`
- Route and state: `/networking-poc.html`, light theme, Protocol layers module, step 04 `IP`, motion enabled but idle.
- Browser viewport and pixels: 1488 × 1058 at device scale factor 1 for both source and implementation. The combined comparison is 2976 × 1058 pixels.

## Latest findings

No actionable P0, P1, or P2 differences remain.

- [Expected] The proof adds an eight-module evidence navigator above the selected composition.
  - Evidence: local links, subnet decisions, ARP, protocol layers, routed delivery, route repair, Internet reachability, and operations are independently selectable while the selected exploded-stack composition remains the Protocol layers module.
  - Impact: the PoC now proves the breadth of the approved sixteen-section curriculum instead of presenting protocol encapsulation as the whole chapter.
- [Expected] Protocol header details remain semantic HTML instead of becoming rasterized canvas text.
  - Evidence: the concept draws TCP/IP/Ethernet header cells inside its plates; the proof aligns readable HTML layer labels beside real Three.js geometry and keeps packet fields in the explanation and routing table.
  - Impact: zoom, screen-reader, no-WebGL, and narrow-screen experiences retain the same facts.
- [Expected] The implementation uses original chapter copy and the reviewed RFC documentation addresses.
  - Evidence: headings, route rows, and step names differ from generated placeholder copy while preserving the packet-layer and route-selection relationships.
- [P3] The proof exposes renderer metrics in a collapsed technical disclosure.
  - Impact: it is intentionally present for PoC review and should be removed or moved to development tooling before public Chapter 07 publication.

## Latest required fidelity surfaces

- Fonts and typography: Spline Sans and JetBrains Mono match the established Backend Engineering product. The large lesson heading, mono eyebrow, layer labels, table hierarchy, and microcopy follow the selected concept's roles while fitting original content.
- Spacing and layout rhythm: the header, chapter rail, reading canvas, exploded stack, right-side evidence, bottom step rail, and three controls retain the source proportions. The new module navigator scrolls within its own bounded region; the 390 px and 320 px versions stack evidence below the observatory and replace the dense step rail with a named select.
- Colors and visual tokens: white paper, dark ink, cool rules, translucent blue/violet plates, and orange active state follow the target and the existing product tokens. The light-theme text/action orange was darkened after contrast testing without changing the vivid canvas highlight.
- Image quality and asset fidelity: the implementation uses the exact installed app icon and a real Three.js scene with crisp application-owned primitive geometry. No source raster is shipped as the scene, no hotlinked model or texture is used, and no target asset is replaced by CSS or handwritten SVG art.
- Copy and content: all headings, descriptions, addresses, route evidence, TTL values, switch/ARP states, control-plane distinctions, and debugging prompts are original and synchronized with the deterministic TypeScript scenario model.
- Responsiveness and accessibility: 390 px and 320 px have no document overflow; controls measure 48 px high; the table scrolls within its own labeled region; the semantic fallback preserves source, destination, TTL, route rows, and explanations. Normal and forced no-WebGL pages each report zero axe violations.

## Latest full-view and focused evidence

- Full view: `chapter-07-networking-design-qa-comparison.png` places the equal-size source and expanded browser capture together. Header shell, sidebar weight, exploded-stack scale, evidence hierarchy, selected layer, and step progression are readable in the same image.
- Focused regions: no separate crop was needed because the equal-height comparison keeps all five layer states, source/destination evidence, the notice card, and active step visible.
- Mobile: the 390 px capture proves the stacked visual/evidence layout and the 320 px capture proves the semantic fallback without page overflow.

## Latest comparison history

### Pass 1 — blocked

- [P2] The desktop routing table retained its mobile minimum width, hiding the Interface column behind an internal scrollbar.
- [P2] Five small orange text/control surfaces failed automated color contrast.
- [P2] The initial desktop heading scale caused the routing-state title to wrap and pushed the control row below the selected concept's viewport composition.

### Pass 2 — passed

- Rebalanced the desktop visual/table columns and reduced the table minimum so all three route fields remain visible.
- Reduced the maximum heading scale while preserving the source hierarchy and a single-line routing-state title.
- Darkened text/action orange and muted copy; axe-core 4.13.0 reports zero violations in normal and no-WebGL states.
- Re-captured the implementation at the same state and density, rebuilt the normalized comparison, and found no remaining P0/P1/P2 mismatch.

### Pass 3 — expanded coverage passed

- Added eight independently selectable modules and forty deterministic states without changing the selected product shell.
- Reworked every evidence type for bounded internal scrolling or vertical stacking at 390 px and 320 px.
- Re-captured the approved Protocol layers state at the source dimensions and reviewed the side-by-side comparison; no actionable P0/P1/P2 difference remains.

## Latest interactions and browser checks

- Auto-play advanced to Transport, Pause stopped it, and direct step selection synchronized the heading, active layer, route row, and insight.
- The Reduce motion control changed to `On` and disabled Auto-play; unit evidence covers platform preference precedence and persisted opt-in reduction.
- Scrolling the observatory out of view changed renderer state from `active` to `idle`.
- Forced `WEBGL_lose_context` changed state to `context-lost` and restored it to `ready` without a console warning or error.
- All eight modules were opened and every scenario advanced to its final deterministic state: 5, 4, 5, 5, 8, 5, 4, and 4 steps respectively.
- Renderer evidence at desktop: 28 objects, 556 triangles, 1.0 pixel ratio, and 125,840 drawing-buffer pixels.
- Browser console: zero warnings or errors in final desktop, mobile, interaction, fallback, and context-recovery passes.
- axe-core 4.13.0: zero automated violations in normal and forced no-WebGL states.
- Production Lighthouse: 99 performance, 100 accessibility, and 100 best practices for the semantic fallback path; WebGL-path synthetic performance is documented separately because SwiftShader dominates its CPU trace.

## Prior review: responsive diagram system

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

## Latest extension: Chapter 06 layered request handling

Chapter 06 reviewed: 2026-08-31. The lesson adds three original figures through the existing extended-flow, timeline, and decision renderers. Desktop, 390 x 844, and 320 x 700 checks found no page overflow, diagram overflow, error overlay, or console warning/error. At 390 px each figure measured 335 px within the content viewport; at 320 px each measured 265 px. The mobile contents drawer exposed all ten section anchors, diagram transcripts remained collapsed, and the conditionally loaded search and notes overlays remained operable. Axe found zero automated violations; Lighthouse scored 97 performance and 100 accessibility, best practices, and SEO. No actionable P0, P1, or P2 visual finding remains. Detailed evidence is in `docs/validation/chapter-06-layered-handling.md`.

final result: passed
