export type Role = "member" | "support" | "tenant-admin";
export type Assurance = "baseline" | "elevated";
export type Action = "read" | "update" | "delete" | "manage-members";

export type Principal = Readonly<{
  subjectId: string;
  tenantId: string;
  roles: readonly Role[];
  assurance: Assurance;
}>;

export type DocumentResource = Readonly<{
  id: string;
  tenantId: string;
  ownerSubjectId: string;
  classification: "standard" | "restricted";
}>;

export type AuthorizationRequest = Readonly<{
  principal: Principal | null;
  action: Action;
  resource: DocumentResource;
}>;

export type AuthorizationDecision = Readonly<{
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

function hasRole(principal: Principal, role: Role) {
  return principal.roles.includes(role);
}

function requiresElevatedAssurance(action: Action, resource: DocumentResource) {
  return action === "delete" || action === "manage-members" || (action === "read" && resource.classification === "restricted");
}

export function authorize({ principal, action, resource }: AuthorizationRequest): AuthorizationDecision {
  if (!principal) return { allowed: false, reason: "anonymous" };
  if (principal.tenantId !== resource.tenantId) return { allowed: false, reason: "tenant-mismatch" };

  const owner = principal.subjectId === resource.ownerSubjectId;
  const admin = hasRole(principal, "tenant-admin");
  const supportRead = hasRole(principal, "support") && action === "read" && resource.classification === "standard";
  const ownerAction = owner && (action === "read" || action === "update" || action === "delete");
  const adminAction = admin && (action === "read" || action === "update" || action === "delete" || action === "manage-members");

  if (!ownerAction && !adminAction && !supportRead) return { allowed: false, reason: "no-matching-policy" };
  if (requiresElevatedAssurance(action, resource) && principal.assurance !== "elevated") {
    return { allowed: false, reason: "insufficient-assurance" };
  }
  if (ownerAction) return { allowed: true, reason: "owner" };
  if (adminAction) return { allowed: true, reason: "tenant-admin" };
  return { allowed: true, reason: "support-read" };
}

type VerifiedTokenClaims = Readonly<{
  typ: unknown;
  iss: unknown;
  aud: unknown;
  sub: unknown;
  exp: unknown;
  nbf?: unknown;
  tenantId: unknown;
  roles: unknown;
  assurance: unknown;
}>;

export type VerifiedTokenEnvelope = Readonly<{
  algorithm: string;
  algorithmVerified: true;
  claims: VerifiedTokenClaims;
}>;

type TokenPolicy = Readonly<{
  algorithms: readonly string[];
  issuer: string;
  audience: string;
  type: string;
  clockSkewSeconds: number;
}>;

type TokenValidation =
  | Readonly<{ ok: true; principal: Principal }>
  | Readonly<{
      ok: false;
      reason:
        | "expired"
        | "invalid-assurance"
        | "invalid-subject"
        | "invalid-tenant"
        | "invalid-time-claim"
        | "not-active"
        | "unexpected-algorithm"
        | "wrong-audience"
        | "wrong-issuer"
        | "wrong-token-type";
    }>;

const roles = new Set<Role>(["member", "support", "tenant-admin"]);

function isRole(value: unknown): value is Role {
  return typeof value === "string" && roles.has(value as Role);
}

export function validateVerifiedToken(
  envelope: VerifiedTokenEnvelope,
  policy: TokenPolicy,
  nowSeconds: number,
): TokenValidation {
  const { claims } = envelope;
  if (!policy.algorithms.includes(envelope.algorithm)) return { ok: false, reason: "unexpected-algorithm" };
  if (claims.iss !== policy.issuer) return { ok: false, reason: "wrong-issuer" };
  if (!Array.isArray(claims.aud) || !claims.aud.includes(policy.audience)) return { ok: false, reason: "wrong-audience" };
  if (claims.typ !== policy.type) return { ok: false, reason: "wrong-token-type" };
  if (typeof claims.sub !== "string" || claims.sub.length === 0) return { ok: false, reason: "invalid-subject" };
  if (typeof claims.tenantId !== "string" || claims.tenantId.length === 0) return { ok: false, reason: "invalid-tenant" };
  if (typeof claims.exp !== "number" || !Number.isFinite(claims.exp)) return { ok: false, reason: "invalid-time-claim" };
  if (claims.nbf !== undefined && (typeof claims.nbf !== "number" || !Number.isFinite(claims.nbf))) {
    return { ok: false, reason: "invalid-time-claim" };
  }
  if (nowSeconds - policy.clockSkewSeconds >= claims.exp) return { ok: false, reason: "expired" };
  if (claims.nbf !== undefined && nowSeconds + policy.clockSkewSeconds < claims.nbf) {
    return { ok: false, reason: "not-active" };
  }
  if (claims.assurance !== "baseline" && claims.assurance !== "elevated") return { ok: false, reason: "invalid-assurance" };

  return {
    ok: true,
    principal: {
      subjectId: claims.sub,
      tenantId: claims.tenantId,
      roles: Array.isArray(claims.roles) ? claims.roles.filter(isRole) : [],
      assurance: claims.assurance,
    },
  };
}
