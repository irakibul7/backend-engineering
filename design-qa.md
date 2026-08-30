# Design QA

## Comparison target

- Source visual truth: `https://backend-from-first-principle.vercel.app/`
- Source lesson truth: `https://backend-from-first-principle.vercel.app/1.HTTP-AND-CORS/html_notes/notes.html`
- Implementation: `http://127.0.0.1:5173/`
- State: Original theme; catalog with chapter 01 completed; first lesson at its top; mobile contents drawer also exercised separately.
- Density normalization: source and implementation were captured in the same in-app browser at device scale factor 1. Desktop CSS viewport was 1440 × 900 and produced 1425 × 891 PNG captures after browser scrollbar/chrome exclusion. Mobile CSS viewport was 390 × 844 and produced 375 × 812 PNG captures after the same exclusion. No image rescaling was used.

## Evidence

Full-view catalog comparisons:

- `docs/qa/catalog-reference-desktop.png`
- `docs/qa/catalog-implementation-desktop.png`
- `docs/qa/catalog-reference-mobile.png`
- `docs/qa/catalog-implementation-mobile.png`

Focused lesson/hero comparison:

- `docs/qa/lesson-reference-mobile.png`
- `docs/qa/lesson-implementation-mobile.png`

The catalog full view is sufficient for card, pill, hero, typography, spacing, color, and fixed-control review. The focused lesson comparison was necessary because the contents control, lesson typography, metadata, and start of the reading flow are too small to judge in the desktop catalog capture.

## Findings

No actionable P0, P1, or P2 findings remain for the approved first checkpoint.

- [Expected] Product-content differences
  - Location: catalog hero, section heading, and chapter cards.
  - Evidence: the source describes 24 finished Go/Python chapters; the implementation truthfully presents six TypeScript launch chapters and eighteen roadmap topics, with original titles and summaries.
  - Classification: required by the approved product scope, not visual drift.

- [Expected] Launch-collection grouping
  - Location: catalog after the accent rule.
  - Evidence: the implementation adds `The foundations` and its short explanation before the cards, so the first card sits lower than in the source, especially on mobile.
  - Classification: acceptable information-architecture change needed to distinguish published work from the public roadmap.

- [P3] Mobile first-card visibility
  - Location: 390 px catalog, below the accent rule.
  - Evidence: the source exposes part of chapter 01 above the fold; the implementation exposes the launch-collection label and heading while the card begins below the fold.
  - Impact: a small reduction in immediate content density, with no blocked action or broken hierarchy.
  - Follow-up: after chapter 02–06 content is complete, test a tighter mobile gap between `.section-rule` and `.chapter-section` without removing the published/roadmap distinction.

## Required fidelity surfaces

- Fonts and typography: Fraunces, Spline Sans, and JetBrains Mono match the source’s editorial display/body/utility roles. Weights, tight display tracking, line height, and mobile wrapping are coherent. The lesson-title connector duplication found in the first pass was fixed.
- Spacing and layout rhythm: centered reading column, large hero breathing room, pill rhythm, card spacing, floating controls, desktop contents rail, and mobile drawer match the source pattern. The lower first card on mobile is documented as P3.
- Colors and tokens: Original theme maps the warm paper, red accent, muted borders, and dark text closely. Light and Dark are deliberate additional states and use the same semantic token structure.
- Image quality and asset fidelity: neither reference screen uses photographic or illustrative assets. No placeholder, CSS-drawn illustration, custom SVG, emoji, or hotlinked visual asset was introduced. UI icons use Lucide consistently.
- Copy and content: all project copy is original, coherent, and accurately distinguishes six published chapters from eighteen roadmap topics. TypeScript is the only example language.
- Interaction and accessibility: search, completion, theme, notes, drawer, Escape handling, semantic labels, focus-visible styles, and reduced-motion CSS are present. Automated tests and browser checks found no console warnings or errors.

## Comparison history

### Pass 1

- Finding: [P2] the lesson heading rendered `HTTP as a as a state machine.` because the template removed a differently cased substring.
- Fix: normalized the terminal phrase with a case-insensitive expression and added a regression test.
- Post-fix evidence: `docs/qa/lesson-implementation-mobile.png` now renders `HTTP as a state machine.` and `npm run check` passes 12 tests.

### Pass 2

- Recompared catalog desktop, catalog mobile, and lesson mobile against the reference in matched browser states.
- Result: no actionable P0/P1/P2 visual or interaction findings remain for this checkpoint.

## Primary interactions tested

- marked chapter 01 complete and observed `1 of 6 completed`
- searched `Kafka` and found `Messaging and Event Streams`
- cycled the theme to Original
- opened notes, edited Markdown, previewed sanitized output, and observed autosave
- opened the mobile contents drawer and verified all six anchors
- checked browser console logs after interaction; warnings and errors: 0

## Follow-up polish

- Reassess the mobile catalog’s first-card position after real chapter summaries settle.
- Add active-section tracking and focus restoration during the complete lesson slice.
- Run automated contrast, 320 px overflow, and visual regression checks before launch.

final result: passed
