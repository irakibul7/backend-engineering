# Chapter 04 validation: Identity, Authentication, and Authorization

Date: 2026-08-31  
Slice: `T-602C`  
Requirements: `LES-001`, `LES-004`, `LES-008`, `LES-009`, `A11Y-001`, `A11Y-003`, `CON-004`  
Result: Passed; awaiting human review before commit

## Delivered scope

- Published one original eight-section field guide that separates identity, authentication, session/token validation, resource context, and authorization.
- Added three original, captioned visuals: a four-boundary request flow, a session state timeline, and an authorization decision path. Every visual includes a visible equivalent text explanation.
- Added four semantic tables covering authenticator properties, credential transport, the executable authorization matrix, and revocation/recovery events.
- Added executable TypeScript examples for session lifecycle, resource authorization, and application validation of an already cryptographically verified token envelope.
- Added glossary definitions and deep links for assurance, authentication, authorization, bearer token, claim, principal, revocation, session, step-up authentication, subject, and tenant.
- Published the canonical lesson route with unique metadata, TechArticle JSON-LD, search coverage, previous navigation, sitemap inclusion, and a four-chapter progress denominator.
- Preserved Chapters 05–06 as non-linked coming-next entries.

## Security review

The educational examples remain isolated pure functions. They do not add accounts, credential collection, cookies, a database, an identity provider, secrets, or a runtime API to the website.

- Session tests cover active, idle-expired, absolute-expired, revoked, and replaced states.
- Rotation first applies the same lifecycle inspection as ordinary session use, refuses every unusable state, produces a distinct lookup digest for an active session, invalidates the predecessor, and returns the raw client bearer value only at the delivery boundary.
- Authorization denies an absent principal and tenant mismatch before evaluating ownership or roles.
- The complete sample matrix is table-driven, including owner, support, tenant-admin, restricted-resource, destructive-action, elevated-assurance, and cross-tenant paths.
- The token helper accepts only a type named `VerifiedTokenEnvelope`, rechecks the approved algorithm/profile, validates issuer, audience, type, subject, tenant, finite expiry, and an absent-or-finite not-before claim, filters roles through an allowlist, and performs no signature verification by hand.
- A final security review reproduced and closed two fail-closed gaps before commit: revoked/replaced/expired session rotation and malformed time-claim acceptance. Focused regressions prove both triggers no longer succeed while the active-session and valid-token controls remain accepted.
- The lesson repeatedly states that decoding is not verification and verification is not resource authorization.
- Threat hypotheses and residual limits remain documented in `docs/chapter-04-identity-spec.md`; no hypothesis is represented as a vulnerability in the static site.

## Primary-source review

Reviewed 2026-08-31 and returned HTTP 200 during link verification:

- [NIST SP 800-63B-4](https://pages.nist.gov/800-63-4/sp800-63b.html)
- [RFC 9700: Best Current Practice for OAuth 2.0 Security](https://www.rfc-editor.org/rfc/rfc9700.html)
- [RFC 8725: JSON Web Token Best Current Practices](https://www.rfc-editor.org/rfc/rfc8725.html)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)

## Automated evidence

- `npm run check`: passed.
- Strict TypeScript: passed.
- ESLint with zero warnings: passed.
- Vitest: 9 files and 88 tests passed.
- Focused session/authorization tests: 44 passed.
- Production build: six canonical route documents generated.
- Initial JavaScript: 93.80 kB gzip, below the 100 kB budget.
- Hosting verification: 12 tests passed.
- Broken-link verification: 34 URLs passed.
- Chapter-specific canonical, Open Graph, Twitter, TechArticle JSON-LD, sitemap inclusion, and unpublished Chapter 05 exclusion passed.
- `git diff --check`: passed.

## Browser, responsive, and accessibility evidence

The local production preview at `http://127.0.0.1:4176` was inspected through the in-app browser.

- Default desktop viewport: expected title and heading, three named figures, four tables, canonical URL, no error overlay, zero document overflow, and zero console warnings/errors.
- 390 × 844: long title reflowed inside the reading column; mobile Contents control displayed; drawer exposed all eight anchors; figures and tables remained contained; zero document overflow and console warnings/errors.
- 320 × 700: 39 px mobile heading, contained visuals and table scroll regions, zero page-level horizontal overflow, no error overlay, and zero console warnings/errors.
- Axe-core 4.13.0: zero automated WCAG 2/2.1/2.2 A/AA violations on the Chapter 04 route.
- Lighthouse at 390 × 844: performance 0.98, accessibility 1.00, best practices 1.00, SEO 1.00, LCP 2.0 s, CLS 0, TBT 10 ms, console-error audit passed.
- Lighthouse at 320 × 700: performance 0.98, accessibility 1.00, best practices 1.00, SEO 1.00, LCP 2.0 s, CLS 0, TBT 10 ms, console-error audit passed.

## React and architecture review

- No new React component, hook, effect, dependency, client fetch, global listener, or render-time data transformation was introduced.
- Chapter data remains module-level typed static content and reuses the existing semantic flow, decision, and timeline renderers.
- The three figures use existing accessible markup and CSS, so the bundle added content rather than a parallel rendering system.
- Initial JavaScript remains within budget and the heavy Markdown preview remains separately loaded.
- No change was required to ADRs or `openapi.yaml`; the product still has no authentication or runtime API.

## Scope review

Files changed are limited to the approved specification/plan, chapter/glossary content, executable example modules/tests, existing publication/SEO/search/hosting expectations, README status, and this validation record. No Chapters 05–24 content, product authentication, remote persistence, analytics behavior, or new styling was added.

Final result: passed.
