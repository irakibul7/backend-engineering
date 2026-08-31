export type SessionRecord = Readonly<{
  lookupDigest: string;
  subjectId: string;
  createdAt: number;
  lastSeenAt: number;
  expiresAt: number;
  revokedAt: number | null;
  replacedByDigest: string | null;
}>;

type SessionInspection =
  | Readonly<{ ok: true }>
  | Readonly<{
      ok: false;
      reason: "absolute-expired" | "idle-expired" | "replaced" | "revoked";
    }>;

type SessionIdentifiers = Readonly<{
  clientToken: string;
  lookupDigest: string;
}>;

type SessionRotation = Readonly<{
  clientToken: string;
  previous: SessionRecord;
  current: SessionRecord;
}>;

export function inspectSession(record: SessionRecord, now: number, idleTimeoutMs: number): SessionInspection {
  if (!Number.isFinite(idleTimeoutMs) || idleTimeoutMs <= 0) {
    throw new Error("Idle timeout must be a positive duration.");
  }
  if (record.revokedAt !== null) return { ok: false, reason: "revoked" };
  if (record.replacedByDigest !== null) return { ok: false, reason: "replaced" };
  if (now >= record.expiresAt) return { ok: false, reason: "absolute-expired" };
  if (now - record.lastSeenAt >= idleTimeoutMs) return { ok: false, reason: "idle-expired" };
  return { ok: true };
}

export function rotateSession(
  record: SessionRecord,
  now: number,
  idleTimeoutMs: number,
  createIdentifiers: () => SessionIdentifiers,
): SessionRotation {
  const inspection = inspectSession(record, now, idleTimeoutMs);
  if (!inspection.ok) {
    throw new Error(`Cannot rotate a ${inspection.reason} session.`);
  }

  const identifiers = createIdentifiers();
  if (!identifiers.clientToken || !identifiers.lookupDigest) {
    throw new Error("Session rotation must produce non-empty identifiers.");
  }
  if (identifiers.lookupDigest === record.lookupDigest) {
    throw new Error("Session rotation must produce a distinct lookup digest.");
  }

  return {
    clientToken: identifiers.clientToken,
    previous: { ...record, replacedByDigest: identifiers.lookupDigest },
    current: {
      lookupDigest: identifiers.lookupDigest,
      subjectId: record.subjectId,
      createdAt: now,
      lastSeenAt: now,
      expiresAt: record.expiresAt,
      revokedAt: null,
      replacedByDigest: null,
    },
  };
}
