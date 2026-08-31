# Threat model

## Scope

Static public pages, client-side search, local completion tracking, theme storage, Markdown notes/preview/export, bounded chapter visualizations, external links, build pipeline, and Vercel hosting.

## Assets to protect

- Integrity of technical content and deployed assets.
- Confidentiality of private study notes.
- Availability of public lessons.
- Trust in Rakibul's domain, authorship, links, and downloadable files.
- Build/deployment credentials and repository integrity.

## Trust boundaries

1. Authored TypeScript chapter data enters the build pipeline.
2. Dependency packages execute during install/build.
3. User Markdown crosses into preview rendering.
4. Browser storage crosses from untrusted persisted bytes into typed UI state.
5. External links leave Rakibul's origin.
6. GitHub-to-Vercel deployment crosses a privileged CI boundary.
7. A fixed educational packet fixture crosses into a chapter-only WebGL renderer.

## Threats and controls

| ID | Threat | Impact | Controls | Verification |
| --- | --- | --- | --- | --- |
| TM-01 | Script injection through note Markdown | Note theft or arbitrary actions in origin | Parse with allowlist sanitizer; disallow raw HTML, scripts, event attributes, unsafe URLs | XSS corpus unit/integration tests |
| TM-02 | Malformed or oversized local storage | Broken UI or storage exhaustion | Versioned parser, size limit, safe defaults, recoverable error state | Property/fuzz tests |
| TM-03 | Tabnabbing or malicious external URL | User deception | `rel="noopener noreferrer"`, safe URL validation, external indicator | DOM tests and link audit |
| TM-04 | Compromised dependency/build script | Supply-chain compromise | Lockfile, minimal dependencies, update review, dependency scan, least-privilege CI | CI audit and manual diff review |
| TM-05 | Unauthorized production deployment | Content/domain takeover | Protected main, reviewed PRs, Vercel access controls, scoped tokens, audit trail | Repository and Vercel settings review |
| TM-06 | Inline/script expansion weakens CSP | XSS blast radius | Prefer static markup and external hashed assets; document required directives | Hosting tests and browser smoke |
| TM-07 | Search or notes telemetry leak | Private learning intent/content exposed | No query/note analytics; network assertions in E2E | Request inspection test |
| TM-08 | Unsafe exported filename/content | Confusing or executable download | Fixed `.md`, sanitized slug, UTF-8 Blob, no HTML export | Export tests |
| TM-09 | Copied unlicensed content | Legal and reputational harm | Original-content rule, citation checklist, content review, provenance field | Editorial review |
| TM-10 | Stale technical guidance | Learner harm and trust loss | Primary sources, review date, visible correction path | Content validation and scheduled review |
| TM-11 | Clickjacking or MIME confusion | UI abuse/content misinterpretation | `frame-ancestors 'none'`, `X-Content-Type-Options: nosniff` | Header tests |
| TM-12 | Denial of service | Site unavailable | Static CDN hosting, cache immutable assets, small client bundle | Load/hosting checks |
| TM-13 | Hidden or abandoned WebGL work consumes device resources | Battery drain, heat, or degraded reading | Lazy initialization, fixed scene limits, on-demand frames, visibility/intersection pause, disposal on unmount | Lifecycle tests and browser performance observation |
| TM-14 | A visualization implies that it inspected the reader's network | Privacy confusion or accidental future data collection | Fixed RFC documentation addresses, no socket/device/network APIs, no route input or third-party topology calls | Source review and network-request audit |
| TM-15 | Motion or context loss makes networking content inaccessible | Disorientation or unavailable lesson evidence | User-controlled transitions, reduced-motion snap states, semantic HTML equivalence, and context-loss fallback | Keyboard, reduced-motion, axe, and forced-failure checks |

## Security headers target

- `Content-Security-Policy` with `default-src 'self'`, restrictive script/style/font/image/connect directives, and `frame-ancestors 'none'`.
- `Referrer-Policy: strict-origin-when-cross-origin`.
- `X-Content-Type-Options: nosniff`.
- `Permissions-Policy` disabling unused sensors/camera/microphone/geolocation.
- `Cross-Origin-Opener-Policy: same-origin` if compatible with required links and previews.

## Privacy statement

The MVP has no account, database, cookies, or remote note/progress sync. Browser storage is private to the learner's device. Analytics may observe page and performance events only; it must not receive search queries, completion identifiers, note content, or export names.

## Security review triggers

Repeat threat modeling before adding authentication, remote sync, comments, a CMS, code execution, image uploads, third-party embeds, a runtime API, or user-generated public content.
