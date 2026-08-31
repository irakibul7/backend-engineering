import { describe, expect, it } from "vitest";
import { inspectSession, rotateSession, type SessionRecord } from "./session-policy";

const minute = 60_000;
const now = Date.parse("2026-08-31T10:00:00.000Z");

function session(overrides: Partial<SessionRecord> = {}): SessionRecord {
  return {
    lookupDigest: "digest-current",
    subjectId: "subject-42",
    createdAt: now - 20 * minute,
    lastSeenAt: now - minute,
    expiresAt: now + 40 * minute,
    revokedAt: null,
    replacedByDigest: null,
    ...overrides,
  };
}

describe("session lifecycle policy", () => {
  it("accepts an active session before its idle and absolute deadlines", () => {
    expect(inspectSession(session(), now, 15 * minute)).toEqual({ ok: true });
  });

  it("rejects a session after its idle deadline", () => {
    expect(inspectSession(session({ lastSeenAt: now - 15 * minute }), now, 15 * minute)).toEqual({
      ok: false,
      reason: "idle-expired",
    });
  });

  it("rejects an absolute expiry even when the session was recently active", () => {
    expect(inspectSession(session({ lastSeenAt: now - 100, expiresAt: now }), now, 15 * minute)).toEqual({
      ok: false,
      reason: "absolute-expired",
    });
  });

  it("rejects revoked and replaced sessions", () => {
    expect(inspectSession(session({ revokedAt: now - minute }), now, 15 * minute)).toEqual({ ok: false, reason: "revoked" });
    expect(inspectSession(session({ replacedByDigest: "digest-next" }), now, 15 * minute)).toEqual({ ok: false, reason: "replaced" });
  });

  it("rotates to a distinct identifier and makes the predecessor unusable", () => {
    const rotated = rotateSession(session(), now, 15 * minute, () => ({
      clientToken: "browser-only-token",
      lookupDigest: "digest-next",
    }));

    expect(rotated.clientToken).toBe("browser-only-token");
    expect(rotated.previous.replacedByDigest).toBe("digest-next");
    expect(rotated.current).toMatchObject({
      lookupDigest: "digest-next",
      subjectId: "subject-42",
      createdAt: now,
      lastSeenAt: now,
      replacedByDigest: null,
    });
    expect(inspectSession(rotated.previous, now, 15 * minute)).toEqual({ ok: false, reason: "replaced" });
  });

  it("rejects an ID factory that repeats the stored lookup digest", () => {
    expect(() => rotateSession(session(), now, 15 * minute, () => ({
      clientToken: "different-browser-token",
      lookupDigest: "digest-current",
    }))).toThrow("Session rotation must produce a distinct lookup digest.");
  });

  it.each([
    ["revoked", { revokedAt: now - minute }],
    ["replaced", { replacedByDigest: "digest-next" }],
    ["absolute-expired", { expiresAt: now }],
    ["idle-expired", { lastSeenAt: now - 15 * minute }],
  ] as const)("refuses to rotate a %s session", (reason, overrides) => {
    expect(() => rotateSession(session(overrides), now, 15 * minute, () => ({
      clientToken: "browser-only-token",
      lookupDigest: "digest-new",
    }))).toThrow(`Cannot rotate a ${reason} session.`);
  });
});
