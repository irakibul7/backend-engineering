# Design QA

## Comparison target

- Approved visual truth: `docs/qa/backend-engineering-approved-desktop.png`
- Density-normalized truth: `docs/qa/backend-engineering-approved-desktop-normalized.png`
- Implementation: `http://127.0.0.1:5173/`
- State: light theme; catalog with chapter 01 incomplete; roadmap expanded; mobile catalog and lesson contents drawer exercised separately.
- Density normalization: the approved concept was normalized to the browser capture dimensions of 1425 × 1013 before comparison. The desktop implementation was captured from a 1440 × 1024 CSS viewport and produced a 1425 × 1013 PNG after scrollbar exclusion. Mobile captures used a 390 × 844 CSS viewport and produced 375 × 812 PNGs. No implementation screenshot was stretched.

## Evidence

Full-view desktop comparison:

- `docs/qa/backend-engineering-approved-desktop-normalized.png`
- `docs/qa/backend-engineering-implementation-desktop.png`

Responsive and focused interaction evidence:

- `docs/qa/backend-engineering-implementation-mobile.png`
- `docs/qa/backend-engineering-lesson-mobile-drawer.png`
- `docs/qa/backend-engineering-streak-desktop.png`
- `docs/qa/backend-engineering-streak-mobile.png`

The desktop pair was viewed together in the same browser comparison input. The mobile captures were inspected independently because the approved concept is desktop-only and does not define a mobile composition.

## Findings

No actionable P0, P1, or P2 findings remain for the approved checkpoint.

- [Expected] Binary completion replaces invented partial progress.
  - Location: syllabus progress column.
  - Evidence: the concept shows partial row progress, but the current product records only complete or incomplete. The UI therefore shows 0% or 100% and does not imply scroll tracking that does not exist.
  - Classification: intentional data-model constraint.

- [P3] Utility cluster is simpler than the concept.
  - Location: desktop header, right edge.
  - Evidence: the concept includes several adjacent utilities; the implementation retains one theme control plus search, profile, and the core navigation.
  - Impact: slightly less visual density with no lost core workflow.

- [P3] Chapter copy creates small row-height variation.
  - Location: syllabus rows.
  - Evidence: original chapter titles and summaries are longer than the concept placeholders.
  - Impact: the ruled rhythm remains consistent and all labels remain readable.

## Required fidelity surfaces

- Typography: Spline Sans carries editorial/interface hierarchy and JetBrains Mono carries metadata, labels, shortcuts, and progress values. The result matches the approved modern notebook tone without copying the inspiration site's serif-led presentation.
- Layout rhythm: offset left study rail, wide syllabus table, ruled separators, chapter numbering, difficulty badges, durations, progress marks, and expanded roadmap band match the approved composition.
- Colors and tokens: warm paper, ink, muted rule lines, and orange accent are consistent across desktop, mobile, lessons, search, notes, and themes. No gradients or unrelated decorative effects were introduced.
- Asset fidelity: the target contains no photographic or illustrative art. Interface symbols use Lucide outline icons; no placeholder images, handcrafted SVGs, CSS illustrations, or hotlinked assets were introduced.
- Copy and positioning: the public title is `Backend Engineering`. Public-facing product copy is language-neutral. Current examples may use TypeScript, while the information architecture can later incorporate other languages.
- Responsive behavior: the catalog collapses cleanly to one column, keeps chapters near the first viewport, and has no horizontal overflow at 390 px. The lesson contents becomes an accessible off-canvas drawer.
- Interaction and accessibility: search, completion, real local learning streaks, notes, theme cycling, roadmap disclosure, lesson navigation, Escape handling, semantic labels, focus-visible styles, and reduced-motion behavior are present.

## Comparison history

### Pass 1

- Finding: [P2] an incomplete chapter displayed one orange progress segment while its numeric label said 0%.
- Fix: inactive progress segments now remain neutral until the chapter is completed.

- Finding: [P2] the mobile header grid exceeded the viewport.
- Fix: constrained the title track with `minmax(0, 1fr)` and reduced the action tracks. Browser measurement after the fix reported a 390 px viewport with a 375 px document width and no horizontal overflow.

### Pass 2

- Recompared the normalized approved concept and desktop implementation at matched dimensions.
- Inspected the responsive catalog and lesson drawer at 390 × 844.
- Result: no actionable P0/P1/P2 visual or interaction findings remain.

### Pass 3

- Restored the approved learning-streak block between the project introduction and reading progress.
- Replaced the concept's illustrative seven-day value with truthful current/best values and a local calendar-week activity strip.
- Verified the first-visit state at desktop and mobile sizes; no horizontal overflow or console warnings were present.

## Primary interactions tested

- marked chapter 01 complete and observed progress update to `1`
- searched `Kafka` and found `Messaging and Event Streams`
- cycled the theme to Original
- opened notes, entered Markdown containing a script, and confirmed the preview remained sanitized
- opened the mobile lesson contents drawer and verified all six section links
- recorded one learning visit for the day and displayed current streak `1`, best streak `1`, and the active weekday marker
- checked a fresh browser tab after interaction; console warnings and errors: 0

## Automated verification

- strict TypeScript check
- ESLint with zero warnings
- 14 unit tests
- production build
- 6 hosting tests
- repository whitespace check

final result: passed
