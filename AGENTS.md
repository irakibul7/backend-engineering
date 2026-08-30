# Repository rules

These rules apply to human and AI contributors.

## Product contract

- Read `spec.md`, `plan.md`, and the relevant ADRs before implementation.
- Every implementation task must name its requirement IDs, acceptance tests, files in scope, and explicit exclusions.
- Do not expand scope silently. Record a new requirement or ADR first.
- The reference site is evidence for layout and behavior, not permission to copy copyrighted prose, diagrams, source code, or branding.
- Use original explanations, examples, diagrams, and Rakibul Islam branding unless explicit reuse permission is documented.

## Work loop

1. Select one incomplete task from `plan.md`.
2. Restate the requirement IDs and exclusions.
3. Add or update the smallest useful test first when practical.
4. Implement only that slice.
5. Run the task's acceptance tests and the repository quality gate.
6. Review the complete diff for correctness, accessibility, security, and scope.
7. Ask for human review before committing.
8. Commit only passing, explainable work with a focused message.

Use separate worktrees only for independent work that cannot touch the same files or product state.

## Engineering rules

- TypeScript uses strict mode; do not introduce `any` without an explained boundary.
- Content schemas are validated at build time.
- User-authored Markdown is sanitized before preview.
- Browser storage is versioned and defensive against malformed data.
- All interactive controls are keyboard-accessible and have visible focus.
- No analytics, trackers, cookies, authentication, or remote note storage in MVP unless the specification changes.
- No runtime API is added without updating `openapi.yaml`, the threat model, and an ADR.
- No hotlinked assets from the reference site.
- Prefer semantic HTML and progressive enhancement over client-only rendering.
- Never commit secrets, `.env` files, browser exports, copied user notes, or production credentials.

## Required verification before commit

- Formatting and linting
- Strict type checking
- Unit tests
- Content/schema validation
- Production build
- Integration tests for search and browser persistence
- Playwright checks at desktop and `390 x 844`
- Accessibility scan and keyboard path
- Broken-link, metadata, sitemap, and robots checks
- Zero unexpected browser console warnings or errors

Security-sensitive changes to Markdown rendering, browser persistence, external links, headers, or deployment configuration require a second review pass.
