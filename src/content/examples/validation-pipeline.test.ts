import { describe, expect, it } from "vitest";
import {
  normalizeDocumentInput,
  validateDocumentCommand,
  validateDocumentInput,
} from "./validation-pipeline";

const minimal = {
  title: "Boundary Notes",
  slug: "Boundary-Notes",
  visibility: "private",
};

describe("validation pipeline", () => {
  it("constructs a fresh command from a minimal valid object", () => {
    expect(validateDocumentCommand(minimal)).toEqual({
      ok: true,
      value: {
        title: "Boundary Notes",
        canonicalSlug: "boundary-notes",
        tags: [],
        visibility: "private",
        retentionDays: null,
      },
    });
  });

  it.each([null, [], "document", 42, true])("rejects a non-record root: %j", (input) => {
    expect(validateDocumentInput(input)).toEqual({
      ok: false,
      issues: [{ path: "$", code: "invalid-root", message: "Input must be a plain object." }],
    });
  });

  it("reports missing fields in deterministic contract order", () => {
    expect(validateDocumentInput({})).toEqual({
      ok: false,
      issues: [
        { path: "$.title", code: "missing-field", message: "title is required." },
        { path: "$.slug", code: "missing-field", message: "slug is required." },
        { path: "$.visibility", code: "missing-field", message: "visibility is required." },
      ],
    });
  });

  it.each(["tenantId", "ownerSubjectId", "isAdmin", "__proto__", "constructor", "prototype"])(
    "rejects the unknown or server-owned key %s",
    (key) => {
      const input = JSON.parse(JSON.stringify({ ...minimal, [key]: "attacker-controlled" })) as unknown;
      const result = validateDocumentInput(input);

      expect(result).toMatchObject({
        ok: false,
        issues: [{ path: `$[${JSON.stringify(key)}]`, code: "unknown-field" }],
      });
      expect(({} as { isAdmin?: unknown }).isAdmin).toBeUndefined();
    },
  );

  it.each(["30", true, 3.5, Number.NaN, Number.POSITIVE_INFINITY])(
    "rejects retentionDays without coercion: %s",
    (retentionDays) => {
      const result = validateDocumentInput({ ...minimal, retentionDays });
      expect(result).toMatchObject({ ok: false });
      if (!result.ok) expect(result.issues[0]?.path).toBe("$.retentionDays");
    },
  );

  it("accepts documented limits and rejects values just beyond them", () => {
    expect(validateDocumentCommand({
      title: "t".repeat(120),
      slug: "s".repeat(64),
      tags: Array.from({ length: 8 }, (_, index) => `tag-${index}`),
      visibility: "tenant",
      retentionDays: 3650,
    })).toMatchObject({ ok: true });

    expect(validateDocumentInput({ ...minimal, title: "t".repeat(121) })).toMatchObject({
      ok: false,
      issues: [{ path: "$.title", code: "out-of-range" }],
    });
    expect(validateDocumentInput({ ...minimal, tags: Array.from({ length: 9 }, () => "tag") })).toMatchObject({
      ok: false,
      issues: [{ path: "$.tags", code: "too-many-items" }],
    });
  });

  it("rejects values that collide after explicit tag normalization", () => {
    expect(validateDocumentCommand({ ...minimal, tags: [" API ", "api"] })).toMatchObject({
      ok: false,
      issues: [{ path: "$.tags[1]", code: "normalization-conflict" }],
    });
  });

  it("enforces a cross-field domain rule after structural validation", () => {
    expect(validateDocumentCommand({ ...minimal, visibility: "tenant" })).toMatchObject({
      ok: false,
      issues: [{ path: "$.retentionDays", code: "semantic-conflict" }],
    });
  });

  it("rejects inherited input and never reads inherited allowed-looking fields", () => {
    const inherited = Object.create({ title: "Inherited", slug: "inherited", visibility: "private" }) as object;
    expect(validateDocumentInput(inherited)).toMatchObject({
      ok: false,
      issues: [{ path: "$", code: "invalid-root" }],
    });
  });

  it("does not alias or mutate caller-owned arrays", () => {
    const tags = ["Backend"];
    const structural = validateDocumentInput({ ...minimal, tags });
    expect(structural.ok).toBe(true);
    tags.push("mutated-later");

    if (!structural.ok) throw new Error("Expected structural validation to pass.");
    expect(structural.value.tags).toEqual(["Backend"]);

    const normalized = normalizeDocumentInput(structural.value);
    expect(normalized).toEqual({
      ok: true,
      value: {
        title: "Boundary Notes",
        canonicalSlug: "boundary-notes",
        tags: ["backend"],
        visibility: "private",
        retentionDays: null,
      },
    });
  });

  it("returns deterministic issues regardless of property insertion order", () => {
    const first = validateDocumentInput({ extraB: 1, ...minimal, extraA: 1, title: 7 });
    const second = validateDocumentInput({ extraA: 1, ...minimal, extraB: 1, title: 7 });

    expect(first).toEqual(second);
  });
});
