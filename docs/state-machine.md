# Interaction state machines

## 1. Search dialog

```text
closed
  -> opening (button or shortcut)
  -> open.idle
open.idle
  -> open.querying (printable input)
  -> closed (Escape or dismiss)
open.querying
  -> open.results (one or more matches)
  -> open.empty (no matches)
  -> open.idle (query cleared)
open.results
  -> navigating (Enter/click result)
  -> closed (Escape or dismiss)
navigating
  -> closed (route committed)
```

Invariants:

- focus starts in the search input;
- Arrow keys never move focus outside results;
- closing restores focus to the opener;
- search query is not persisted or transmitted.

## 2. Chapter completion

```text
unknown -> incomplete (valid default)
incomplete -> complete (user toggles)
complete -> incomplete (user toggles)
malformed stored value -> incomplete + repaired storage
```

Invariants:

- only known published chapter IDs contribute to the count;
- toggling does not navigate;
- accessible name and pressed/checked state match the visual state.

## 3. Learning streak

```text
missing -> current(1), best(1) (first visit)
current(n) -> current(n) (same local calendar day)
current(n) -> current(n + 1) (next local calendar day)
current(n) -> current(1), best(max(best, n)) (gap longer than one day)
malformed stored value -> current(1), best(1) + repaired storage
```

Invariants:

- a browser visit contributes at most once per local calendar day;
- only the rolling fourteen-day activity window is retained;
- streak data stays local and is never included in analytics;
- current and best values remain readable without relying on the flame icon or color.

## 4. Theme

```text
unresolved -> system (no saved choice)
unresolved -> original | light | dark (valid saved choice)
system <-> original <-> light <-> dark (explicit selection)
invalid stored choice -> system
```

The bootstrap runs before first paint. `prefers-color-scheme` affects only the `system` choice.

## 5. Study notes panel

```text
closed -> opening -> open.edit.clean
open.edit.clean -> open.edit.dirty (user input)
open.edit.dirty -> open.edit.saving (debounce/manual save)
open.edit.saving -> open.edit.clean (save succeeds)
open.edit.saving -> open.edit.error (storage failure)
open.edit.error -> open.edit.saving (retry)
open.edit.* <-> open.preview
open.edit.* | open.preview -> confirming-clear (non-empty clear)
confirming-clear -> open.edit.clean (confirm)
confirming-clear -> previous open state (cancel)
open.* -> exporting -> previous open state
open.* -> closing -> closed
```

Invariants:

- preview always uses sanitized Markdown output;
- unsaved content receives a final synchronous save attempt before close;
- mobile open state traps focus; desktop sheet remains modal to background controls;
- notes never leave the browser unless the learner triggers a file download.

## 6. Lesson contents navigation

```text
desktop.rail.active(sectionId)
mobile.closed.active(sectionId)
mobile.closed -> mobile.open (Contents)
mobile.open -> mobile.closed (Escape, backdrop, close, or section selection)
active(sectionA) -> active(sectionB) (intersection/anchor navigation)
```

Invariants:

- deep-linked section is active after load;
- fixed controls do not cover the selected heading;
- browser back/forward preserves native fragment behavior.
