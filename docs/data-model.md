# Data model

## Build-time content

### Chapter

```ts
type Chapter = {
  schemaVersion: 1;
  number: number;             // 1..24, unique
  slug: string;               // canonical lowercase kebab-case
  title: string;
  shortTitle: string;
  summary: string;
  learningPromise: string;
  durationMinutes: number;
  status: "draft" | "coming-next" | "roadmap" | "published";
  tags: string[];
  prerequisites: string[];    // chapter slugs
  languages: "typescript"[];
  reviewedAt: string;         // ISO date
  sections: Section[];
  references: Reference[];
};
```

### Section

```ts
type Section = {
  id: string;                 // stable deep-link anchor
  title: string;
  summary: string;
  order: number;
  searchableText: string;     // derived, not authored twice
  glossaryTerms: string[];
};
```

Chapter body data may contain only approved typed semantic blocks: `Paragraph`, `Callout`, `CodeBlock`, `Diagram`, `ComparisonTable`, `Sequence`, `Checklist`, `KnowledgeCheck`, and `References`.

### Reference

```ts
type Reference = {
  title: string;
  url: string;
  publisher: string;
  kind: "standard" | "official-doc" | "paper" | "book";
  accessedAt: string;
};
```

### Glossary term

```ts
type GlossaryTerm = {
  slug: string;
  term: string;
  definition: string;
  chapterSlug: string;
  sectionId: string;
  aliases: string[];
  tags: string[];
};
```

### Search document

```ts
type SearchDocument = {
  id: string;
  kind: "chapter" | "section" | "glossary";
  title: string;
  summary: string;
  url: string;
  chapterNumber?: number;
  tags: string[];
  terms: string[];
};
```

## Browser storage

All keys are namespaced and versioned. Data is local to one browser profile.

### Preferences

Key: `backend-engineering:preferences:v1`

```ts
type PreferencesV1 = {
  schemaVersion: 1;
  theme: "system" | "original" | "light" | "dark";
};
```

### Progress

Key: `backend-engineering:progress:v1`

```ts
type ProgressV1 = {
  schemaVersion: 1;
  completedChapterSlugs: string[];
  updatedAt: string;
};
```

The completed-chapter record remains for compatibility. Granular reading progress is stored separately and locally.

Key: `backend-engineering:reading-progress:v1`

```ts
type ReadingProgressV1 = {
  schemaVersion: 1;
  chapterSections: Record<string, string[]>; // chapter slug to read section IDs
  updatedAt: string;
};
```

A section becomes read when its end marker reaches the reading area. Percentages are derived from read sections divided by total published sections. Existing completed chapters migrate to all of their known sections. Unknown chapter and section IDs are discarded when the schema is read.

### Notes

Key prefix: `backend-engineering:notes:v1:` followed by `master` or a known chapter slug. Reads fall back to the former `bfp:*` keys so existing local progress and notes survive the product rename.

```ts
type NoteV1 = {
  schemaVersion: 1;
  scope: "master" | "chapter";
  chapterSlug?: string;
  markdown: string;
  updatedAt: string;
};
```

### Learning streak

Key: `backend-engineering:streak:v1`

```ts
type LearningStreakV1 = {
  schemaVersion: 1;
  currentStreak: number;
  bestStreak: number;
  lastVisitDate: string;      // local YYYY-MM-DD
  activeDates: string[];      // rolling 14-day local activity window
};
```

A same-day return is idempotent. A visit on the next local calendar day extends the streak; a longer gap resets the current streak to one while preserving the best streak.

Limits:

- reject notes larger than 500 KiB with a recoverable warning;
- never store images as data URLs in MVP;
- trim unknown fields during repair;
- export filename uses a safe slug and UTC date;
- storage parsing returns a typed result, never throws into rendering.

## Future data boundary

No server data model exists in MVP. Accounts, remote sync, comments, and CMS are not latent tables; each requires a new specification, threat model, role matrix, OpenAPI paths, and ADR.
