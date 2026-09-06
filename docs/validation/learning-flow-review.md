# Learning flow review fixes

Date: 2026-09-06
Task: T-706

## Behavior

- The reading shortcut selects the first partially read published chapter and links to its first unread section. Otherwise it starts the first unread chapter. New readers see Start reading; readers who finished all chapters see the roadmap. The syllabus highlight follows the same target and exposes `aria-current="step"`.
- Completion counts explicitly label chapters; percentages explicitly label sections. Existing versioned progress is reused without a schema change.
- Notes and Search move focus inside, make background siblings inert, wrap Tab/Shift+Tab, close with Escape, and restore the captured opener. Opener capture happens before lazy loading. Global shortcuts cannot stack modals.
- Search normalizes cache/caching/cached/caches, shows the strongest matching section, supports section anchors, arrow navigation and Enter, and provides a visible close button. The header accurately describes chapters/topics rather than claiming notes search.
- Mobile spacing is compact, with the reading action before streak statistics. Notes use real placeholder line breaks and explain local storage and export backups.

## Verification

- Regression tests cover new readers, partial section progress restored from storage, completed chapters, all-complete state, current chapter semantics, Notes focus wrap/restore, search keyboard activation to a section anchor, empty-result focus wrap, and close-button restoration.
- `npm run check`: strict TypeScript, ESLint, 188 unit/component/content tests, static production build, and 12 hosting/metadata tests pass.
- `npm run verify:links`: 51 links pass, including internal routes/assets and external references.
- In-app browser: Notes focus entry, Tab and Shift+Tab wrapping, Escape and opener restoration verified; background controls disappear from the accessibility tree while modal. Verified on the default desktop surface and mobile.
- Search: typed cache, used Down twice and Enter, reached the HTTP caching anchor with its heading visible and focus returned to the search trigger.
- Library layout inspected at 1280 × 720, 390 × 844 and 320 × 700. No horizontal page overflow at either mobile width. At 390 × 844 the first chapter row is visible within the first viewport, including the long chapter-04 resume title.
- Existing saved progress survives reload. No personal notes were edited.
- No warnings/errors after the clean reload. An earlier development-only React warning during hot replacement of hook dependencies was cleared by reload.
- Axe CLI 4.13.0 on the production-preview catalog: zero automated accessibility violations.
- `git diff --check` passes. React review confirmed derived resume state, bounded lazy modules, typed section results, cleaned-up modal listeners and inert state, and no additional dependencies or data transmission.

This is focused regression verification, not a fresh full-site WCAG certification, automated axe sweep, Lighthouse benchmark, or production deployment. No commit was created.
