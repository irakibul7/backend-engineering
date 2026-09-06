import type { LessonSection } from "../types";

export const identitySections: LessonSection[] = [
  {
    id: "four-separate-questions",
    number: "01",
    title: "One request crosses four security boundaries",
    introduction: "A service cannot safely answer ‘may this request continue?’ with one vague authenticated flag. It needs separate evidence about identity, authentication, session state, and the requested resource.",
    paragraphs: [
      "Identity names a subject. Authentication establishes confidence that a claimant controls an authenticator bound to that subject. A session or token carries the result across requests. Authorization decides whether the resulting principal may perform one action on one resource under the current conditions. Each answer becomes an input to the next boundary, but none replaces it.",
      "Consider a valid session for a member of tenant A requesting document 42. The session can identify the member without proving that document 42 belongs to tenant A, that the member owns it, or that the current assurance is high enough to delete it. The service must load trusted resource attributes and evaluate policy after credential validation, on every request.",
    ],
    visuals: [
      {
        kind: "flow",
        label: "Four decisions on one request",
        stages: [
          { title: "Identity", detail: "Name the subject with an issuer-scoped identifier." },
          { title: "Authentication", detail: "Verify control of a bound authenticator." },
          { title: "Session or token", detail: "Validate current state, scope, type, and time." },
          { title: "Resource context", detail: "Load tenant, owner, classification, and action." },
          { title: "Authorization", detail: "Return an explicit allow or deny decision." },
        ],
        alternative: "The service identifies a subject, verifies authentication evidence, validates the current session or token, loads trusted attributes for the requested resource, and only then makes an explicit authorization decision.",
      },
    ],
    callout: {
      label: "Boundary rule",
      body: "Authentication establishes who is present with some assurance. Authorization still has to decide what that principal may do to this resource now.",
    },
  },
  {
    id: "authenticators-and-assurance",
    number: "02",
    title: "Authenticators provide different kinds of assurance",
    introduction: "An authentication ceremony proves control of an authenticator, not the claimant's honesty, device safety, or permission to access every resource.",
    paragraphs: [
      "Passwords are shared secrets that users can reveal to a convincing impostor and attackers can replay. OTP authenticators reduce dependence on one static secret, but manually entered OTPs remain phishable and replayable during their validity window. Public-key authenticators can bind proof to the verifier's origin, which is why phishing resistance is a property of the protocol rather than the presence of a second screen.",
      "Choose assurance from risk. A low-impact read may accept a baseline session, while exporting sensitive data, deleting a resource, or changing membership may require a recent phishing-resistant step-up. The application should record the resulting assurance and its bounded lifetime rather than infer strength from a role name.",
    ],
    table: {
      caption: "Qualitative authenticator comparison",
      columns: ["Authenticator", "Primary proof", "Replay/phishing concern", "Production implication"],
      rows: [
        ["Password", "Knowledge of a shared secret", "Replayable and readily phished", "Block breached/common values, rate-limit attempts, and never log the secret"],
        ["One-time password", "Possession plus a short-lived code", "A live code can still be relayed or phished", "Accept once, bound its lifetime, and do not label OTP alone phishing-resistant"],
        ["Public-key authenticator", "Possession of a private key and protocol proof", "Can be verifier-name bound", "Prefer for higher-assurance and phishing-resistant flows"],
      ],
    },
    checklist: [
      "Use generic authentication failures so account existence is not disclosed unnecessarily.",
      "Rate-limit failed attempts and monitor abuse without storing supplied credentials.",
      "Treat recovery and authenticator replacement as high-risk authentication events.",
      "Require a fresh step-up for sensitive actions rather than trusting an old login forever.",
    ],
  },
  {
    id: "session-lifecycle",
    number: "03",
    title: "A session is a revocable state machine",
    introduction: "Authentication is an event. A session is the changing server-side policy that decides whether its result can still be used.",
    paragraphs: [
      "A browser receives an opaque, high-entropy bearer value while the service stores only a lookup digest and session metadata. Authentication creates a fresh identifier instead of promoting an anonymous identifier supplied by the browser. Privilege changes rotate it again and invalidate the predecessor, closing the session-fixation path.",
      "Idle and absolute deadlines answer different questions. The idle deadline limits unattended use; the absolute deadline bounds the total lifetime even when requests continue. Logout, compromise response, recovery, and administrative action can revoke earlier. Every lookup must reject expired, revoked, and replaced records before refreshing activity.",
    ],
    visuals: [
      {
        kind: "timeline",
        label: "A session changes state over time",
        phases: [
          { marker: "S0", title: "Anonymous", detail: "No authenticated session exists; browser input has no privileged meaning." },
          { marker: "S1", title: "Active", detail: "Authentication issues a fresh browser value and stores its lookup digest." },
          { marker: "S2", title: "Elevated", detail: "Step-up raises assurance for a bounded period and rotates the identifier." },
          { marker: "S3", title: "Expired", detail: "Idle or absolute time reaches its limit; use fails closed." },
          { marker: "S4", title: "Replaced", detail: "A rotated predecessor remains unusable even if copied earlier." },
          { marker: "S5", title: "Revoked", detail: "Logout, recovery, or compromise response terminates acceptance." },
        ],
        alternative: "A user begins anonymous, receives a fresh active session after authentication, may temporarily step up to elevated assurance, and eventually reaches an unusable expired, replaced, or revoked state. Rotation never makes the predecessor active again.",
      },
    ],
    code: {
      filename: "session-policy.ts",
      source: `export function inspectSession(
  record: SessionRecord,
  now: number,
  idleTimeoutMs: number,
): SessionInspection {
  if (record.revokedAt !== null) {
    return { ok: false, reason: "revoked" };
  }
  if (record.replacedByDigest !== null) {
    return { ok: false, reason: "replaced" };
  }
  if (now >= record.expiresAt) {
    return { ok: false, reason: "absolute-expired" };
  }
  if (now - record.lastSeenAt >= idleTimeoutMs) {
    return { ok: false, reason: "idle-expired" };
  }
  return { ok: true };
}`,
    },
    callout: {
      label: "Example boundary",
      body: "The executable example models lifecycle policy with an injected clock and identifier factory. It deliberately does not implement credential verification, cookies, storage, or cryptography.",
    },
  },
  {
    id: "cookies-and-bearer-tokens",
    number: "04",
    title: "Credential transport changes the threat model",
    introduction: "Cookies and bearer authorization headers can both transport session material. Their delivery rules expose different default failure paths.",
    paragraphs: [
      "A browser automatically attaches a matching cookie according to its domain, path, Secure, and SameSite rules. HttpOnly prevents ordinary script from reading the value but does not stop injected script from sending same-origin requests. Automatic attachment also creates cross-site request-forgery concerns, so SameSite is defense-in-depth rather than a complete substitute for a deliberate CSRF design.",
      "Application code usually attaches a bearer token explicitly. That reduces automatic cross-site sending but makes any script-accessible storage part of the token-theft boundary. Possession normally enables replay, so minimize scope and lifetime, protect transport and storage, and design rotation, revocation, or sender constraint before choosing the format.",
    ],
    table: {
      caption: "Cookie and bearer-token transport responsibilities",
      columns: ["Question", "Secure cookie session", "Explicit bearer token"],
      rows: [
        ["Who attaches it?", "Browser for matching requests", "Client application code"],
        ["Primary browser concern", "CSRF plus same-origin action through XSS", "Theft from script-accessible storage plus XSS"],
        ["Important controls", "Secure, HttpOnly, SameSite, narrow scope, CSRF design", "Short lifetime, narrow audience/scope, protected storage, rotation or sender constraint"],
        ["Revocation shape", "Server-side session status can fail immediately", "Self-contained tokens need bounded life or an online status strategy"],
      ],
    },
    callout: {
      label: "Format is not the policy",
      body: "An opaque cookie can be poorly managed, and a signed token can be over-trusted. Decide lifecycle, transport, scope, and revocation before choosing a credential format.",
    },
  },
  {
    id: "jwt-validation-boundary",
    number: "05",
    title: "A JWT is a claims container, not session magic",
    introduction: "Base64url decoding reveals attacker-controlled fields. Trust begins only after cryptographic verification and the complete application validation profile succeed.",
    paragraphs: [
      "A maintained security library should parse the compact token, reject algorithms outside an explicit allowlist, verify the signature with key material bound to the configured issuer, and enforce structural limits. Application policy must then validate issuer, audience, token type, subject, expiry, not-before time, and mutually exclusive rules for different token kinds. A token for another API or an ID token used as an access token must fail even when its signature is valid.",
      "The example type is intentionally named VerifiedTokenEnvelope: it represents the boundary after library verification, not an object produced by decoding. The helper keeps only allowlisted roles and converts claims into a minimal principal. Resource authorization still occurs afterward because neither a valid signature nor an admin-looking claim proves access to a particular tenant object.",
    ],
    code: {
      filename: "verified-token-policy.ts",
      source: `export function validateVerifiedToken(
  envelope: VerifiedTokenEnvelope,
  policy: TokenPolicy,
  nowSeconds: number,
): TokenValidation {
  const { claims } = envelope;
  if (!policy.algorithms.includes(envelope.algorithm)) {
    return { ok: false, reason: "unexpected-algorithm" };
  }
  if (claims.iss !== policy.issuer) {
    return { ok: false, reason: "wrong-issuer" };
  }
  if (!Array.isArray(claims.aud) ||
      !claims.aud.includes(policy.audience)) {
    return { ok: false, reason: "wrong-audience" };
  }
  if (claims.typ !== policy.type) {
    return { ok: false, reason: "wrong-token-type" };
  }
  return validateTimesAndBuildPrincipal(claims, policy, nowSeconds);
}`,
    },
    checklist: [
      "Configure accepted algorithms; never select trust from an unverified header alone.",
      "Bind verification keys to the expected issuer and validate the intended audience.",
      "Give access, identity, logout, and security-event tokens mutually exclusive validation profiles.",
      "Reject missing or invalid time and subject claims required by your profile.",
      "Never put secrets in a JWT payload; signing does not encrypt its claims.",
    ],
  },
  {
    id: "authorization-per-resource",
    number: "06",
    title: "Authorization is a resource decision",
    introduction: "A role can narrow policy candidates, but the final decision usually needs the action, tenant, resource owner, classification, and current assurance.",
    paragraphs: [
      "The example begins by denying an absent principal and then rejects a tenant mismatch before inspecting ownership or roles. This order prevents an administrator in tenant B from becoming an administrator in tenant A. It also demonstrates why object identifiers from the URL are not authorization evidence: the service must load the resource and compare trusted attributes.",
      "RBAC groups permissions and remains useful for broad responsibilities. ABAC considers subject, resource, action, and environmental attributes. ReBAC captures relationships such as owner-of or member-of. Real policies often combine all three. The essential properties are explicit inputs, deny by default, one enforcement path, and tests for every matrix cell.",
    ],
    visuals: [
      {
        kind: "decision",
        label: "Authorization narrows toward allow",
        question: "May this principal perform this action on this resource now?",
        outcomes: [
          { condition: "Principal absent", result: "Deny", detail: "No authentication context can satisfy a protected operation." },
          { condition: "Tenant differs", result: "Deny", detail: "Reject before role or ownership evaluation." },
          { condition: "No relationship or role rule", result: "Deny", detail: "An unmatched policy never inherits access." },
          { condition: "Assurance too low", result: "Deny", detail: "Sensitive reads and destructive actions require step-up." },
          { condition: "Every gate passes", result: "Allow", detail: "Return the exact policy reason for safe internal audit." },
        ],
        alternative: "Authorization starts with deny. A protected request can reach allow only when a principal exists, the tenant matches, a specific ownership or role rule matches the action and resource, and the current assurance satisfies the operation.",
      },
    ],
    code: {
      filename: "authorization.ts",
      source: `export function authorize(
  { principal, action, resource }: AuthorizationRequest,
): AuthorizationDecision {
  if (!principal) return deny("anonymous");
  if (principal.tenantId !== resource.tenantId) {
    return deny("tenant-mismatch");
  }

  const rule = matchOwnerRoleOrRelationship(
    principal,
    action,
    resource,
  );
  if (!rule) return deny("no-matching-policy");
  if (rule.needsStepUp && principal.assurance !== "elevated") {
    return deny("insufficient-assurance");
  }
  return { allowed: true, reason: rule.reason };
}`,
    },
    table: {
      caption: "Executable authorization matrix for a same-tenant resource",
      columns: ["Principal/context", "Read standard", "Read restricted", "Update", "Delete", "Manage members"],
      rows: [
        ["Anonymous", "Deny", "Deny", "Deny", "Deny", "Deny"],
        ["Member, not owner", "Deny", "Deny", "Deny", "Deny", "Deny"],
        ["Resource owner", "Allow", "Step-up", "Allow", "Step-up", "Deny"],
        ["Support", "Allow", "Deny", "Deny", "Deny", "Deny"],
        ["Tenant admin", "Allow", "Step-up", "Allow", "Step-up", "Step-up"],
        ["Any cross-tenant principal", "Deny", "Deny", "Deny", "Deny", "Deny"],
      ],
    },
  },
  {
    id: "revocation-recovery-and-audit",
    number: "07",
    title: "Security state must be able to move backward",
    introduction: "Systems that can create trust but cannot quickly reduce it turn one stolen credential or mistaken grant into a long-lived incident.",
    paragraphs: [
      "Revocation is a propagation problem. A server-side session can consult current state on each request, while a self-contained access token may remain accepted until expiry unless the service adds an online status or version check. Short token lifetimes reduce the window but do not replace refresh-token rotation, reuse detection, or incident procedures where those risks apply.",
      "Recovery, password change, authenticator replacement, membership removal, and role reduction should identify which sessions and tokens become stale. Audit events need stable subject, tenant, action, resource, decision, policy version, and correlation identifiers—but never passwords, OTPs, session bearer values, complete tokens, or sensitive resource bodies.",
    ],
    table: {
      caption: "State changes and the evidence they should invalidate",
      columns: ["Event", "State transition", "Operational evidence"],
      rows: [
        ["Logout", "Revoke the active session", "Session identifier category, subject, time, outcome"],
        ["Privilege change", "Rotate session and recompute authorization", "Old/new policy version and administrative actor"],
        ["Account recovery", "Revoke affected sessions and require renewed assurance", "Recovery method, notifications, revocation completion"],
        ["Refresh-token replay", "Revoke the token family and investigate", "Family identifier, reuse signal, affected client—never raw token"],
        ["Tenant membership removal", "Deny future resource decisions immediately", "Membership version and enforcement timestamp"],
      ],
    },
    checklist: [
      "Define which events revoke one session, every session, or a token family.",
      "Test propagation delay instead of assuming a revocation write is instantly visible everywhere.",
      "Version authorization policy so an audit decision can be reconstructed.",
      "Keep credential material and sensitive resource content out of logs and traces.",
    ],
  },
  {
    id: "debugging-and-design-review",
    number: "08",
    title: "Debug the boundary that made the decision",
    introduction: "An unexpected 401, 403, or allow result becomes tractable when authentication evidence, session state, resource context, and policy output are inspected separately.",
    paragraphs: [
      "Start with the request correlation identifier and the credential transport mechanism, not the raw credential. Confirm whether authentication failed, the session or token was expired or revoked, the issuer/audience/type profile matched, and a minimal principal was created. Then inspect the trusted resource tenant, owner, classification, requested action, assurance, and policy version used by authorization.",
      "Keep public failures deliberately small. A service may map missing and unauthorized resources to the same response to avoid confirming existence, while internal audit records a safe decision category. Reproduce with deterministic policy fixtures and a controlled clock; do not paste production tokens into logs, tickets, tests, or decoding websites.",
    ],
    checklist: [
      "Distinguish missing credentials, invalid credentials, expired state, and insufficient permission internally.",
      "Confirm the verification key belongs to the expected issuer and the audience names this service.",
      "Load the resource independently and compare its tenant and owner with the principal.",
      "Check idle, absolute, elevated-assurance, and revocation times with one documented clock policy.",
      "Re-run the exact authorization matrix row using sanitized identifiers and the deployed policy version.",
    ],
    questions: [
      "Which decisions in your current service are hidden inside a single authenticated boolean?",
      "What event rotates a session identifier, and can the predecessor still be accepted anywhere?",
      "Can a valid token issued for another audience or token type reach your handlers?",
      "Which test proves that an administrator from one tenant cannot read a guessed resource ID from another tenant?",
    ],
    references: [
      { title: "NIST SP 800-63B-4: Authentication and Authenticator Management", url: "https://pages.nist.gov/800-63-4/sp800-63b.html" },
      { title: "RFC 9700: Best Current Practice for OAuth 2.0 Security", url: "https://www.rfc-editor.org/rfc/rfc9700.html" },
      { title: "RFC 8725: JSON Web Token Best Current Practices", url: "https://www.rfc-editor.org/rfc/rfc8725.html" },
      { title: "OWASP Authentication Cheat Sheet", url: "https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html" },
      { title: "OWASP Session Management Cheat Sheet", url: "https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html" },
      { title: "OWASP Authorization Cheat Sheet", url: "https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html" },
    ],
  },
];
