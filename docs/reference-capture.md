# Reference capture

Captured: 2026-08-30  
Source: <https://backend-from-first-principle.vercel.app/>  
Source repository: <https://github.com/DsThakurRawat/Backend-from-first-Principle>

## Rights boundary

The source repository is public, but no license file was visible in the repository root during review. Public visibility does not grant permission to copy or redistribute prose, code, diagrams, or branding. This project will create original assets and content while using the observed product pattern as design evidence unless permission is documented.

## Homepage — desktop evidence

Captured at 1280 x 720. The page uses an approximately 840 px central editorial column. The hero is left-aligned with a small uppercase monospaced eyebrow, an oversized high-contrast serif heading, a plain-language description, metadata pills, completion summary, and command-search action. A short blue rule separates the hero from a vertical list of 24 chapter cards.

Observed measurements:

- hero content width: approximately 840 px;
- hero heading: Fraunces, approximately 80 px at desktop;
- body: Spline Sans, approximately 17 px;
- chapter card: approximately 802 x 86 px, offset to make room for an external completion checkbox;
- footer content width: approximately 840 px;
- page height in the inspected state: approximately 3565 px.

Visual language:

- white/light editorial canvas;
- black typography with saturated blue accent;
- Fraunces for display/editorial headings;
- Spline Sans for body/interface text;
- JetBrains Mono for metadata, chapter numbers, keyboard hints, and controls;
- thin neutral borders, modest radii, sparse shadows;
- mostly static motion with focus on reading.

## Homepage — mobile evidence

Captured at 390 x 844. The hero becomes a single column. Metadata pills wrap into two rows, search occupies its own row, and chapter cards use a compact number tile plus two-line title. The completion checkbox remains outside the card. The floating theme/notes/top controls overlap the lower-right reading area only when scrolling.

The new implementation must preserve the hierarchy while improving one observed issue: no horizontal overflow or browser-level horizontal scrollbar at 320–390 px.

## Catalog interactions

### Search

- Opens from a visible `Search…` action with `Ctrl K` hint.
- Uses a centered modal with dimmed and blurred background.
- Initial state prompts the user to type.
- Query `cache` returned chapter 09, `Caching`, with duration.
- Escape closes the modal.
- Results are intended to be keyboard selectable.

### Completion

- Each chapter has a separate labeled button.
- Completing chapter 01 changes the button to a `done` state and changes the summary from `0 of 24 completed` to `1 of 24 completed`.
- State persists in browser storage.

### Themes

- One compact control cycles through Light, Original, and Dark.
- The inspected original theme changes the canvas to warm paper and the accent to red.

### Study notes

- Opens as a right-side desktop sheet over a dimmed page.
- Provides Edit and Preview tabs, a lesson context label, Markdown formatting controls, save state, word/character count, Clear, and Export Markdown.
- Mobile should use a full-height modal sheet with focus containment.

## Lesson — desktop evidence

Chapter 01 uses a full-height sticky left contents rail and a wide reading surface. The hero combines a monospaced eyebrow, a large Fraunces title, an explanatory lead, metadata pills, and a short accent rule. A sticky bottom chapter navigator shows current chapter and next chapter. Floating study controls sit above it.

The inspected chapter contains 21 anchored sections and demonstrates:

- nested headings and long-form prose;
- inline code and syntax-highlighted Go/Python examples;
- explanatory diagrams with text alternatives;
- tables, timelines, callouts, checklists, and protocol flows;
- copy/save-diagram controls;
- references to primary technical sources;
- previous/next navigation.

## Lesson — mobile evidence

Captured at 390 x 844. The left rail becomes a `Contents` button. Opening it reveals an off-canvas contents sheet covering most of the viewport while leaving a dimmed edge of the article visible. Metadata chips wrap. The floating controls and bottom chapter navigation remain fixed.

The reference rendered a visible horizontal scrollbar in the inspected mobile state. `A11Y-003` explicitly rejects that behavior for the new project.

## Content inventory

The reference catalog contains 24 topics from HTTP and routing through security, scaling, testing, Kafka, and WebSockets. `docs/content-outline.md` preserves the broad learning progression but defines original titles, objectives, examples, and source requirements.

## Asset inventory

Observed external or shared assets:

- Google Fonts request for Fraunces, Spline Sans, and JetBrains Mono;
- shared theme, enhancement, and copy-button styles/scripts;
- inline SVG icons for search, checks, arrows, notes, editor tools, and GitHub;
- lesson-specific diagrams embedded in page content.

The implementation will package its own font files where licensing permits, use an open-source icon package, and create original diagrams. It will not hotlink source assets.
