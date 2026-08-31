import { describe, expect, it } from "vitest";
import {
  authorize,
  validateVerifiedToken,
  type Action,
  type DocumentResource,
  type Principal,
  type VerifiedTokenEnvelope,
} from "./authorization";

const resource: DocumentResource = {
  id: "document-7",
  tenantId: "tenant-a",
  ownerSubjectId: "owner-1",
  classification: "standard",
};

function principal(overrides: Partial<Principal> = {}): Principal {
  return {
    subjectId: "owner-1",
    tenantId: "tenant-a",
    roles: ["member"],
    assurance: "baseline",
    ...overrides,
  };
}

describe("resource authorization policy", () => {
  it("denies anonymous and cross-tenant requests before role evaluation", () => {
    expect(authorize({ principal: null, action: "read", resource })).toEqual({ allowed: false, reason: "anonymous" });
    expect(authorize({
      principal: principal({ tenantId: "tenant-b", roles: ["tenant-admin"], assurance: "elevated" }),
      action: "manage-members",
      resource,
    })).toEqual({ allowed: false, reason: "tenant-mismatch" });
  });

  it("allows an owner to update a same-tenant document", () => {
    expect(authorize({ principal: principal(), action: "update", resource })).toEqual({ allowed: true, reason: "owner" });
  });

  it("requires elevated assurance for restricted reads and deletes", () => {
    const restricted = { ...resource, classification: "restricted" as const };

    expect(authorize({ principal: principal(), action: "read", resource: restricted })).toEqual({ allowed: false, reason: "insufficient-assurance" });
    expect(authorize({ principal: principal(), action: "delete", resource })).toEqual({ allowed: false, reason: "insufficient-assurance" });
    expect(authorize({ principal: principal({ assurance: "elevated" }), action: "delete", resource })).toEqual({ allowed: true, reason: "owner" });
  });

  it("limits support to standard same-tenant reads", () => {
    const support = principal({ subjectId: "support-1", roles: ["support"] });

    expect(authorize({ principal: support, action: "read", resource })).toEqual({ allowed: true, reason: "support-read" });
    expect(authorize({ principal: support, action: "update", resource })).toEqual({ allowed: false, reason: "no-matching-policy" });
    expect(authorize({ principal: support, action: "read", resource: { ...resource, classification: "restricted" } })).toEqual({ allowed: false, reason: "no-matching-policy" });
  });

  it("allows only an elevated tenant admin to manage membership", () => {
    const admin = principal({ subjectId: "admin-1", roles: ["tenant-admin"] });

    expect(authorize({ principal: admin, action: "manage-members", resource })).toEqual({ allowed: false, reason: "insufficient-assurance" });
    expect(authorize({ principal: { ...admin, assurance: "elevated" }, action: "manage-members", resource })).toEqual({ allowed: true, reason: "tenant-admin" });
  });

  it.each([
    ["member", false, "read", "standard", "baseline", false],
    ["member", true, "read", "standard", "baseline", true],
    ["member", true, "read", "restricted", "baseline", false],
    ["member", true, "read", "restricted", "elevated", true],
    ["member", true, "update", "standard", "baseline", true],
    ["member", true, "delete", "standard", "baseline", false],
    ["member", true, "delete", "standard", "elevated", true],
    ["support", false, "read", "standard", "baseline", true],
    ["support", false, "read", "restricted", "elevated", false],
    ["support", false, "update", "standard", "elevated", false],
    ["tenant-admin", false, "read", "standard", "baseline", true],
    ["tenant-admin", false, "read", "restricted", "baseline", false],
    ["tenant-admin", false, "read", "restricted", "elevated", true],
    ["tenant-admin", false, "update", "standard", "baseline", true],
    ["tenant-admin", false, "delete", "standard", "baseline", false],
    ["tenant-admin", false, "delete", "standard", "elevated", true],
    ["tenant-admin", false, "manage-members", "standard", "baseline", false],
    ["tenant-admin", false, "manage-members", "standard", "elevated", true],
  ] as const)("applies the matrix for %s owner=%s %s %s at %s assurance", (role, owner, action, classification, assurance, expected) => {
    const actor = principal({
      subjectId: owner ? resource.ownerSubjectId : `${role}-2`,
      roles: [role],
      assurance,
    });

    expect(authorize({
      principal: actor,
      action: action as Action,
      resource: { ...resource, classification },
    }).allowed).toBe(expected);
  });
});

const token: VerifiedTokenEnvelope = {
  algorithm: "ES256",
  algorithmVerified: true,
  claims: {
    typ: "access+jwt",
    iss: "https://identity.example",
    aud: ["document-api"],
    sub: "owner-1",
    exp: 1_800_000_000,
    nbf: 1_700_000_000,
    tenantId: "tenant-a",
    roles: ["member", "unknown-role"],
    assurance: "baseline",
  },
};

const tokenPolicy = {
  algorithms: ["ES256"] as const,
  issuer: "https://identity.example",
  audience: "document-api",
  type: "access+jwt",
  clockSkewSeconds: 30,
};

describe("verified-token application policy", () => {
  it("converts only approved claims into a minimal principal", () => {
    expect(validateVerifiedToken(token, tokenPolicy, 1_750_000_000)).toEqual({
      ok: true,
      principal: {
        subjectId: "owner-1",
        tenantId: "tenant-a",
        roles: ["member"],
        assurance: "baseline",
      },
    });
  });

  it.each([
    ["algorithm", { algorithm: "RS256" }, "unexpected-algorithm"],
    ["issuer", { claims: { ...token.claims, iss: "https://attacker.example" } }, "wrong-issuer"],
    ["audience", { claims: { ...token.claims, aud: ["other-api"] } }, "wrong-audience"],
    ["type", { claims: { ...token.claims, typ: "id+jwt" } }, "wrong-token-type"],
    ["subject", { claims: { ...token.claims, sub: "" } }, "invalid-subject"],
    ["expiry", { claims: { ...token.claims, exp: 1_700_000_000 } }, "expired"],
    ["not-before", { claims: { ...token.claims, nbf: 1_800_000_000 } }, "not-active"],
  ] as const)("rejects a token with the wrong %s boundary", (_boundary, override, reason) => {
    const candidate = { ...token, ...override } as VerifiedTokenEnvelope;
    expect(validateVerifiedToken(candidate, tokenPolicy, 1_750_000_000)).toEqual({ ok: false, reason });
  });

  it.each([
    ["string not-before", { ...token.claims, nbf: "tomorrow" }],
    ["non-finite not-before", { ...token.claims, nbf: Number.NaN }],
    ["non-finite expiry", { ...token.claims, exp: Number.POSITIVE_INFINITY }],
  ])("rejects a malformed %s time claim", (_boundary, claims) => {
    expect(validateVerifiedToken({ ...token, claims }, tokenPolicy, 1_750_000_000)).toEqual({
      ok: false,
      reason: "invalid-time-claim",
    });
  });
});
