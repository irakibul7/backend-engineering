export type ValidationIssue = Readonly<{
  path: string;
  code:
    | "invalid-root"
    | "missing-field"
    | "unknown-field"
    | "invalid-type"
    | "invalid-format"
    | "out-of-range"
    | "too-many-items"
    | "normalization-conflict"
    | "semantic-conflict";
  message: string;
}>;

export type DocumentInput = Readonly<{
  title: string;
  slug: string;
  tags: readonly string[];
  visibility: "private" | "tenant";
  retentionDays: number | null;
}>;

export type DocumentCommand = Readonly<{
  title: string;
  canonicalSlug: string;
  tags: readonly string[];
  visibility: "private" | "tenant";
  retentionDays: number | null;
}>;

export type ValidationResult<T> =
  | Readonly<{ ok: true; value: T }>
  | Readonly<{ ok: false; issues: readonly ValidationIssue[] }>;

const allowedKeys = new Set(["title", "slug", "tags", "visibility", "retentionDays"]);
const requiredKeys = ["title", "slug", "visibility"] as const;

const limits = Object.freeze({
  title: 120,
  slug: 64,
  tags: 8,
  tag: 32,
  retentionDays: 3650,
});

function issue(path: string, code: ValidationIssue["code"], message: string): ValidationIssue {
  return Object.freeze({ path, code, message });
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function hasOwn(record: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(record, key);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isVisibility(value: unknown): value is DocumentInput["visibility"] {
  return value === "private" || value === "tenant";
}

function isRetentionDays(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && Number.isInteger(value) && value >= 1 && value <= limits.retentionDays;
}

function propertyPath(key: string): string {
  return `$[${JSON.stringify(key)}]`;
}

export function validateDocumentInput(input: unknown): ValidationResult<DocumentInput> {
  if (!isPlainRecord(input)) {
    return { ok: false, issues: [issue("$", "invalid-root", "Input must be a plain object.")] };
  }

  const issues: ValidationIssue[] = [];
  for (const key of requiredKeys) {
    if (!hasOwn(input, key)) issues.push(issue(`$.${key}`, "missing-field", `${key} is required.`));
  }

  for (const key of Object.keys(input).filter((key) => !allowedKeys.has(key)).sort()) {
    issues.push(issue(propertyPath(key), "unknown-field", `${key} is not an accepted field.`));
  }

  const title = input.title;
  if (hasOwn(input, "title")) {
    if (typeof title !== "string") {
      issues.push(issue("$.title", "invalid-type", "title must be a string."));
    } else if (title.length < 1 || title.length > limits.title) {
      issues.push(issue("$.title", "out-of-range", `title must contain 1 to ${limits.title} characters.`));
    }
  }

  const slug = input.slug;
  if (hasOwn(input, "slug")) {
    if (typeof slug !== "string") {
      issues.push(issue("$.slug", "invalid-type", "slug must be a string."));
    } else if (slug.length < 1 || slug.length > limits.slug) {
      issues.push(issue("$.slug", "out-of-range", `slug must contain 1 to ${limits.slug} characters.`));
    } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(slug)) {
      issues.push(issue("$.slug", "invalid-format", "slug may contain letters, numbers, and single hyphens."));
    }
  }

  const tags = hasOwn(input, "tags") ? input.tags : [];
  if (!isStringArray(tags)) {
    issues.push(issue("$.tags", "invalid-type", "tags must be an array of strings."));
  } else {
    if (tags.length > limits.tags) {
      issues.push(issue("$.tags", "too-many-items", `tags may contain at most ${limits.tags} items.`));
    }
    tags.forEach((tag, index) => {
      if (tag.length < 1 || tag.length > limits.tag) {
        issues.push(issue(`$.tags[${index}]`, "out-of-range", `each tag must contain 1 to ${limits.tag} characters.`));
      }
    });
  }

  const visibility = input.visibility;
  if (hasOwn(input, "visibility") && !isVisibility(visibility)) {
    issues.push(issue("$.visibility", "invalid-type", "visibility must be private or tenant."));
  }

  const retentionDays = hasOwn(input, "retentionDays") ? input.retentionDays : null;
  if (retentionDays !== null && !isRetentionDays(retentionDays)) {
    const code = typeof retentionDays === "number" ? "out-of-range" : "invalid-type";
    issues.push(issue("$.retentionDays", code, `retentionDays must be a whole number from 1 to ${limits.retentionDays}, or omitted.`));
  }

  if (issues.length > 0) return { ok: false, issues };

  if (typeof title !== "string" || typeof slug !== "string" || !isStringArray(tags) || !isVisibility(visibility)) {
    return { ok: false, issues: [issue("$", "invalid-root", "Input did not satisfy the document contract.")] };
  }
  if (retentionDays !== null && !isRetentionDays(retentionDays)) {
    return { ok: false, issues: [issue("$.retentionDays", "out-of-range", "retentionDays is outside the accepted range.")] };
  }

  return {
    ok: true,
    value: Object.freeze({
      title,
      slug,
      tags: Object.freeze([...tags]),
      visibility,
      retentionDays,
    }),
  };
}

export function normalizeDocumentInput(input: DocumentInput): ValidationResult<DocumentCommand> {
  const issues: ValidationIssue[] = [];
  const title = input.title.normalize("NFC").trim();
  const canonicalSlug = input.slug.toLowerCase();
  const tags = input.tags.map((tag) => tag.normalize("NFC").trim().toLowerCase());

  if (title.length < 1 || title.length > limits.title) {
    issues.push(issue("$.title", "out-of-range", `normalized title must contain 1 to ${limits.title} characters.`));
  }
  if (canonicalSlug.length < 1 || canonicalSlug.length > limits.slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(canonicalSlug)) {
    issues.push(issue("$.slug", "invalid-format", "normalized slug does not satisfy the canonical grammar."));
  }

  const seenTags = new Set<string>();
  tags.forEach((tag, index) => {
    if (tag.length < 1 || tag.length > limits.tag) {
      issues.push(issue(`$.tags[${index}]`, "out-of-range", `normalized tag must contain 1 to ${limits.tag} characters.`));
      return;
    }
    if (seenTags.has(tag)) {
      issues.push(issue(`$.tags[${index}]`, "normalization-conflict", "tag duplicates an earlier tag after normalization."));
      return;
    }
    seenTags.add(tag);
  });

  if (input.visibility === "tenant" && input.retentionDays === null) {
    issues.push(issue("$.retentionDays", "semantic-conflict", "tenant-visible documents require an explicit retention period."));
  }

  if (issues.length > 0) return { ok: false, issues };

  return {
    ok: true,
    value: Object.freeze({
      title,
      canonicalSlug,
      tags: Object.freeze([...tags]),
      visibility: input.visibility,
      retentionDays: input.retentionDays,
    }),
  };
}

export function validateDocumentCommand(input: unknown): ValidationResult<DocumentCommand> {
  const structural = validateDocumentInput(input);
  if (!structural.ok) return structural;
  return normalizeDocumentInput(structural.value);
}
