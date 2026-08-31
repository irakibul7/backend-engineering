# Chapter 04 specification: Identity, Authentication, and Authorization

Status: Proposed for human review  
Prepared: 2026-08-31  
Implementation task: `T-602C`  
Requirements: `LES-001`, `LES-004`, `LES-008`, `LES-009`, `A11Y-001`, `A11Y-003`, `CON-004`

## 1. Scope boundary

This specification governs an educational chapter and its isolated TypeScript examples. It does **not** add accounts, login, cookies, tokens, a database, or a runtime API to the Backend Engineering website. The product remains the static, account-free application described in `spec.md` and `docs/threat-model.md`.

The examples model a fictional multi-tenant document service so that authentication, session lifecycle, and object-level authorization can be tested against concrete resources. They are teaching artifacts, not a drop-in authentication package.

Repository evidence for this boundary:

- `spec.md:65-70` excludes accounts, authentication, remote state, a runtime API, and a database from the product.
- `spec.md:205-209` defines typed static content, prerendered routes, browser-local state, and no runtime server.
- `docs/threat-model.md:49-55` documents the current no-account/no-cookie privacy boundary and requires renewed threat modeling before real authentication or an API.

### In scope

- One original, eight-section lesson with stable anchors and primary references.
- Three original explanatory visuals with equivalent text explanations.
- A small TypeScript session-policy example.
- A small TypeScript authorization-policy example and executable authorization matrix.
- Tests for expiry, revocation, session rotation, deny-by-default behavior, ownership, and tenant isolation.
- Glossary additions needed by the lesson.
- Search, metadata, sitemap, progress-count, and previous/next integration produced by publishing the chapter.
- Chapter-specific validation evidence.

### Explicit exclusions

- No login UI, real users, credential collection, OAuth provider integration, auth SDK, database, email, recovery workflow, or secrets.
- No hand-written password hashing, JWT signing, JWT signature verification, cryptographic key management, or production-ready identity provider.
- No claim that JWTs are required, safer than opaque sessions, or sufficient for authorization.
- No new runtime endpoint and therefore no change to `openapi.yaml`.
- No change to site analytics, local notes, completion-storage format, or learning-streak storage.
- No copied prose, diagrams, layouts, or source code from the reference site.
- No additional implementation languages in this slice.

## 2. Learning contract

### Promise

After the chapter, a learner should be able to trace a request through four independent questions:

1. What subject is being represented?
2. How was control of that subject established?
3. What session or token state accompanies this request?
4. May this principal perform this action on this exact resource now?

The learner should also be able to explain why a valid session or a correctly signed token does not, by itself, authorize a resource operation.

### Prerequisites

- HTTP request and response semantics from Chapter 01.
- Request dispatch and request context from Chapter 02.
- Representation boundaries and untrusted decoded values from Chapter 03.

### Editorial thesis

Identity, authentication, session management, and authorization are separate state transitions and policy decisions. A secure request path carries evidence between those boundaries without allowing one boundary to silently answer another boundary's question.

## 3. Lesson structure

| Section | Stable anchor | Question answered | Required evidence |
| --- | --- | --- | --- |
| 1 | `four-separate-questions` | Why are identity, authentication, session state, and authorization different? | Request decision pipeline visual |
| 2 | `authenticators-and-assurance` | What does an authenticator prove, and with what assurance? | Password, OTP, and phishing-resistant authenticator comparison |
| 3 | `session-lifecycle` | What state exists after authentication, and when must it change? | Session state-machine visual and TypeScript session policy |
| 4 | `cookies-and-bearer-tokens` | Who automatically sends the credential, and which threats follow? | Cookie/bearer comparison table including CSRF, XSS, replay, scope, and revocation |
| 5 | `jwt-validation-boundary` | What can a verified JWT establish, and what must still be validated? | Validation sequence covering algorithm, issuer, audience, type, time, and subject |
| 6 | `authorization-per-resource` | How is access decided for this action on this resource? | Authorization decision graph, matrix, and TypeScript policy |
| 7 | `revocation-recovery-and-audit` | How do compromise, privilege change, recovery, and investigation alter state? | Failure table and operational checklist |
| 8 | `debugging-and-design-review` | How should an engineer diagnose a rejected or unexpectedly permitted request? | Debugging checklist, design questions, glossary, and references |

Each section starts with the underlying problem, names the boundary, shows a failure case, and ends with the production implication. Product copy remains implementation-language neutral; code labels identify the example language only where code is rendered.

## 4. Glossary

| Term | Chapter definition |
| --- | --- |
| Subject | The entity an identity assertion refers to, usually identified by an issuer-scoped identifier. |
| Principal | The subject plus the security context the application uses for a decision. |
| Identity | A set of identifiers and attributes associated with a subject; it is not proof by itself. |
| Credential | Data bound to an identity and presented in an authentication process. |
| Authenticator | Something the claimant controls and uses to prove possession or control during authentication. |
| Authentication | The process that establishes confidence that a claimant controls one or more authenticators bound to a subject. |
| Authorization | A policy decision about whether a principal may perform an action on a resource under the current context. |
| Session | Server-recognized state that continues an authenticated interaction across requests. |
| Bearer token | A credential whose possession is sufficient for use unless additional sender constraints are enforced. |
| Claim | A statement about a subject or token context; it remains untrusted until its containing credential is fully validated. |
| Role | A named grouping of permissions. A role is one possible policy input, not the complete decision. |
| Permission | An allowed action over a resource type or scope. |
| Tenant | An isolation boundary containing principals and resources for one organization. |
| Step-up authentication | A new authentication event that raises the assurance available to a sensitive action or session. |
| Revocation | A state transition that makes previously accepted session or token material no longer acceptable. |

## 5. Sample service and trust boundaries

The examples use a fictional document service with these components:

1. A user agent transports either a secure session cookie or a bearer access token.
2. An authentication boundary validates the credential and produces a minimal principal.
3. A resource loader resolves the document and its tenant/owner attributes independently of user-controlled identifiers.
4. An authorization policy evaluates principal, action, resource, and request context.
5. The handler performs the operation only after an explicit allow decision.
6. An audit sink records security-relevant outcomes without recording credentials or sensitive document content.

The client of the fictional service is attacker-controlled. Route parameters, cookie values, token strings, decoded claims, headers, and resource identifiers are untrusted until the appropriate boundary validates them.

## 6. State machine

```text
anonymous
   |
   | authenticator verified
   v
authenticated -> active session -> step-up required -> elevated session
                      |                    |                    |
                      | idle/absolute      | failed/cancelled   | privilege timeout
                      v                    v                    v
                   expired             restricted         active session
                      ^
                      |
             revoked / compromised
```

Normative transitions for the example:

- Authentication creates a new server-side session identifier; it never promotes an anonymous identifier supplied by the browser.
- A privilege change rotates the session identifier and invalidates the predecessor.
- Idle and absolute deadlines are checked on every session use.
- Logout, compromise response, password/account recovery, or administrative action can revoke a session.
- Step-up changes assurance for a bounded interval; it does not permanently widen every authorization decision.
- Unknown, malformed, expired, superseded, or revoked session identifiers all fail closed.

## 7. Data model

The examples expose only the minimum types needed to teach the boundaries:

```ts
type Principal = Readonly<{
  subjectId: string;
  tenantId: string;
  roles: readonly ("member" | "support" | "tenant-admin")[];
  assurance: "baseline" | "elevated";
}>;

type SessionRecord = Readonly<{
  lookupDigest: string;
  subjectId: string;
  createdAt: number;
  lastSeenAt: number;
  expiresAt: number;
  revokedAt: number | null;
  replacedByDigest: string | null;
}>;

type DocumentResource = Readonly<{
  id: string;
  tenantId: string;
  ownerSubjectId: string;
  classification: "standard" | "restricted";
}>;

type AuthorizationRequest = Readonly<{
  principal: Principal | null;
  action: "read" | "update" | "delete" | "manage-members";
  resource: DocumentResource;
}>;

type AuthorizationDecision = Readonly<{
  allowed: boolean;
  reason:
    | "anonymous"
    | "tenant-mismatch"
    | "insufficient-assurance"
    | "owner"
    | "support-read"
    | "tenant-admin"
    | "no-matching-policy";
}>;
```

Production secrets, password verifiers, raw session tokens, JWTs, refresh tokens, and cryptographic keys are intentionally absent from fixtures and repository state. The example stores a one-way lookup digest rather than the browser's bearer value.

## 8. Authorization matrix

This is the normative matrix for the executable policy. A matching role never bypasses tenant isolation. `Owner` is a resource relationship, not a stored global role.

| Principal/context | Read standard | Read restricted | Update | Delete | Manage members |
| --- | --- | --- | --- | --- | --- |
| Anonymous | Deny | Deny | Deny | Deny | Deny |
| Same-tenant member, not owner | Deny | Deny | Deny | Deny | Deny |
| Same-tenant owner | Allow | Allow with elevated assurance | Allow | Allow with elevated assurance | Deny |
| Same-tenant support | Allow | Deny | Deny | Deny | Deny |
| Same-tenant tenant admin | Allow | Allow with elevated assurance | Allow | Allow with elevated assurance | Allow with elevated assurance |
| Any principal from another tenant | Deny | Deny | Deny | Deny | Deny |

Policy evaluation order:

1. Deny an absent principal.
2. Deny a tenant mismatch before evaluating a role or ownership relationship.
3. Match a specific action/resource rule.
4. Require elevated assurance for restricted reads, destructive actions, and membership management.
5. Deny when no policy matches.

The returned reason is safe for tests and internal audit. A public HTTP response may intentionally map multiple denial reasons to the same status and message to avoid leaking resource existence.

## 9. Token validation boundary

The chapter must not teach signature verification as a hand-written exercise. The executable example receives claims only **after** a trusted library has verified token structure and signature against an allowlisted algorithm and the issuer's configured key material. The chapter then demonstrates application validation:

1. Require the expected token type.
2. Require the configured issuer and bind the verification key to that issuer.
3. Require the intended audience.
4. Require a valid, issuer-scoped subject.
5. Check expiry and not-before values using a bounded clock-skew policy.
6. Reject token kinds governed by another validation profile.
7. Convert only approved claims into a minimal principal.
8. Perform resource authorization separately.

The lesson will state that decoding is not validation, signature validity is not authorization, and token revocation/rotation requirements must be designed before choosing a self-contained token.

## 10. Threat model for the educational service

The following are design-time threat hypotheses for the fictional example service, not findings in the static Backend Engineering website.

| ID | Threat hypothesis and prerequisite | Asset/impact | Required control | Verification evidence |
| --- | --- | --- | --- | --- |
| C04-TM-01 | An attacker reuses breached passwords against the login boundary. | Account control and private documents | Rate limiting, breached/common-password blocklist, MFA/passkey support, generic failures, and monitoring | Content review against NIST guidance; login implementation remains excluded |
| C04-TM-02 | A victim authenticates through a phishing origin or reveals a replayable OTP. | Account/session control | Prefer phishing-resistant authenticators for higher assurance; bind step-up to the intended action | Authenticator comparison and design question |
| C04-TM-03 | An attacker fixes or steals a session identifier. | Authenticated session | Generate high-entropy opaque identifiers, use secure cookie attributes, rotate on authentication/privilege change, and invalidate predecessors | Session rotation, superseded-session, and expiry tests |
| C04-TM-04 | Script execution or transport leakage exposes a bearer credential. | API access until expiry/revocation | Short lifetime, minimal scope, secure transport/storage, CSP/XSS defenses, rotation or sender constraint where applicable | Cookie/token comparison and replay failure case |
| C04-TM-05 | A token for another issuer, audience, algorithm, or token kind is accepted. | Cross-service impersonation | Allowlist algorithms; validate issuer/key binding, audience, type, time, and mutually exclusive token profiles | Token policy tests over already-verified claim fixtures |
| C04-TM-06 | A valid principal changes a resource ID to access another user's or tenant's object. | Cross-user or cross-tenant disclosure/modification | Load resource attributes, validate authorization on every request, enforce ownership/tenant relationship, deny by default | Full authorization matrix and cross-tenant tests |
| C04-TM-07 | Cookie authentication permits a cross-site state-changing request. | Unauthorized state change | SameSite policy as defense-in-depth plus explicit CSRF protection for relevant request patterns | Cookie/bearer comparison; runtime CSRF implementation excluded |
| C04-TM-08 | Recovery or MFA reset silently lowers assurance. | Persistent account takeover | Treat recovery as a security-sensitive state change, notify the subject, revoke affected sessions, and require renewed assurance | Recovery state walkthrough and design question |
| C04-TM-09 | Revocation is recorded but cached/session state remains usable. | Continued access after compromise | Server-side status check or bounded token lifetime, atomic rotation, invalidation propagation, and tests with a controlled clock | Revoked-session and replaced-session tests |
| C04-TM-10 | Audit events contain credentials, raw tokens, or sensitive documents. | Secondary credential/content disclosure | Log stable identifiers and decision categories, never authenticators or bearer values | Logging checklist and fixture review |

Residual risk must be stated: an educational policy model cannot prove the security of an identity provider, cryptographic library, browser, deployment configuration, or production recovery process.

## 11. Original visual specification

### Visual A: Four decisions, four outputs

- Kind: annotated flow.
- Stages: identity assertion -> authenticator verification -> session/token validation -> resource authorization -> handler.
- Boundary annotations: untrusted input, verified authentication evidence, minimal principal, loaded resource, allow/deny decision.
- Equivalent text: a numbered trace that explains what each stage may establish and what it may not infer.

### Visual B: A session changes over time

- Kind: state timeline.
- States: anonymous, active, elevated, idle-expired, absolute-expired, rotated, revoked.
- Annotations: new ID at authentication, new ID at privilege change, predecessor invalidation, bounded elevated assurance.
- Equivalent text: the normative transitions in section 6.

### Visual C: Authorization narrows access

- Kind: decision graph.
- Gates: principal present -> tenant matches -> action rule exists -> relationship/role matches -> assurance sufficient -> allow.
- Every false branch ends in deny; no color-only meaning.
- Equivalent text: the ordered policy evaluation in section 8.

No visual may reproduce the reference site's diagram composition. Labels, captions, layout, and examples must be original and must remain usable at 320 px, in dark mode, and without color perception.

## 12. Executable examples

### `src/content/examples/session-policy.ts`

Pure functions with an injected clock will model:

- active, idle-expired, absolute-expired, revoked, and replaced states;
- generation boundary represented by an injected ID factory rather than insecure randomness in the lesson;
- rotation that returns a new record and marks the prior record as replaced;
- structured rejection reasons with no raw credential logging.

The example will not store sessions, set cookies, hash passwords, or claim production cryptographic completeness.

### `src/content/examples/authorization.ts`

A pure `authorize(request)` function will implement the matrix in section 8. Types will make actions, roles, assurance, and decision reasons explicit. The default return path is deny.

### Optional claim-policy helper

A pure validator may demonstrate issuer, audience, type, subject, and time checks over a fixture explicitly named `VerifiedTokenClaims`. It must explain at the type boundary that a maintained security library performed signature and algorithm verification first. If this boundary cannot be made unmistakable in UI and tests, omit the executable helper and keep the JWT sequence as prose/table content.

## 13. Test strategy and acceptance cases

### Unit tests

Session policy:

1. Accept an active session before both deadlines.
2. Reject an idle-expired session.
3. Reject an absolute-expired session even when recently active.
4. Reject revoked and replaced sessions.
5. Rotate to a distinct identifier and mark the predecessor unusable.
6. Keep time deterministic through an injected clock.

Authorization policy:

1. Deny an anonymous request.
2. Deny every cross-tenant request, including tenant admin.
3. Allow an owner to update a same-tenant standard document.
4. Require elevated assurance for restricted read and delete.
5. Allow support to read only standard same-tenant documents.
6. Allow membership management only for an elevated same-tenant tenant admin.
7. Deny unknown/no-matching policy paths.
8. Table-drive every cell in the normative authorization matrix.

Claim policy, if included:

1. Reject wrong issuer, audience, type, subject, expired time, and not-before time.
2. Convert only allowlisted claims to `Principal`.
3. Demonstrate that valid claims still receive a separate authorization decision.

### Content and build tests

- Chapter schema validation and deterministic Chapter 04 publication order.
- Three visuals, each with caption and equivalent text.
- Stable anchors and search-index coverage for session, JWT, RBAC, ABAC, ReBAC, tenant, step-up, and revocation.
- Chapter-specific canonical, Open Graph/Twitter metadata, JSON-LD, sitemap entry, and previous/next navigation.
- Homepage progress denominator changes from three to four published chapters; existing local completion data remains valid.
- All external references pass the broken-link check.

### Browser and accessibility acceptance

- Desktop, 390 x 844, and 320 x 700 have no page-level horizontal overflow.
- Visuals, matrix, tables, code-copy controls, contents navigation, notes, and completion control are keyboard accessible.
- Automated accessibility scan reports zero violations on the new route.
- Light, dark, and editorial themes preserve contrast and non-color meaning.
- Page works as a readable prerendered document before client JavaScript.
- Browser console contains zero unexpected warnings/errors.

### Repository quality gate

Run the complete pre-commit contract in `AGENTS.md`, including formatting, lint, strict types, unit tests, content validation, production build, hosting tests, search/persistence integration, responsive Playwright, accessibility, keyboard path, broken links, metadata, sitemap, robots, performance budget, and console checks.

## 14. ADR decisions

No new architecture decision is proposed for the application.

- ADR-0001 remains intact: Chapter 04 is typed static content and prerendered like existing chapters.
- ADR-0002 remains intact: no remote identity or progress synchronization is added.
- ADR-0003 remains intact: all prose, examples, and visuals are original and primary-source reviewed.
- `openapi.yaml` remains unchanged because the chapter adds no product runtime API.
- The educational service model is kept in this chapter specification instead of the product threat model so readers do not mistake hypothetical service threats for vulnerabilities in the static site.

A separate ADR and updated product threat model are mandatory if a future task proposes real application authentication, server-side sessions, or an API.

## 15. Primary-source basis

Reviewed 2026-08-31:

- [NIST SP 800-63B-4: Authentication and Authenticator Management](https://pages.nist.gov/800-63-4/sp800-63b.html) — authenticator assurance, replay/phishing resistance, reauthentication, and session requirements.
- [RFC 9700: Best Current Practice for OAuth 2.0 Security](https://www.rfc-editor.org/rfc/rfc9700.html) — authorization-code protection, PKCE, redirect handling, implicit-flow risk, and refresh-token protection.
- [RFC 8725: JSON Web Token Best Current Practices](https://www.rfc-editor.org/rfc/rfc8725.html) — algorithm verification, issuer/audience validation, explicit typing, claim distrust, and cross-JWT confusion.
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html) — authentication responses, reauthentication, MFA, and credential-handling guidance.
- [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html) — secure cookie attributes, session identifier renewal, idle/absolute timeout, and invalidation.
- [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html) — least privilege, deny by default, per-request permission validation, and relationship/attribute-based decisions.

## 16. Human review gate

Implementation may start only after review confirms:

1. The example domain and authorization matrix are understandable and appropriate.
2. The chapter does not imply that authentication is being added to the website.
3. The JWT boundary does not teach hand-written cryptography or treat claims as trusted merely because they decode.
4. The threat hypotheses cover credential, session, token, object, tenant, recovery, and audit boundaries without presenting speculative issues as product findings.
5. The three visuals and eight-section structure are sufficiently original and useful.
6. The slice remains small enough for one explainable, tested commit.
