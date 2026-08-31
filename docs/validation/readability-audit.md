# Chapter 05 readability audit

Date: 2026-08-31  
Scope: `Validation at Trust Boundaries`  
Reference supplied by the user: `backend-from-first-principle.vercel.app` Chapter 05

## Finding

The first Chapter 05 draft read like a technical specification placed directly into the lesson. Its eight sections each carried several concepts, long paragraphs introduced vocabulary before examples, and every diagram repeated a permanently visible text transcript.

The reference chapter is also detailed, but it reduces cognitive load by:

- splitting the subject into smaller, plainly named sections;
- introducing one concept at a time;
- placing concrete requests and responses close to the claim they explain;
- using numbered sequences and comparisons for relationships;
- keeping navigation labels specific enough to act as a chapter outline.

These are information-design findings only. No reference prose, artwork, layout, or code was copied.

## Revision

- Replaced the eight broad sections with ten focused questions.
- Added one running document request at the beginning of the lesson.
- Reused that request to explain type, syntax, meaning, normalization, coercion, server-owned fields, and error output.
- Reduced the chapter from 16 long body paragraphs to 17 short paragraphs across more sections.
- Added four compact comparison tables and three short code examples.
- Replaced generic `Foundation` labels with section-specific labels such as `Parse`, `Rules`, `Authority`, and `Errors`.
- Collapsed equivalent diagram transcripts behind `Read diagram as text`, preserving access without repeating the full explanation visually.
- Shortened the reading estimate from 38 to 32 minutes.

## Visual evidence

- `docs/validation/readability-audit/01-current-chapter.png`: initial text-heavy implementation.
- `docs/validation/readability-audit/03-reference-type-validation.png`: reference example showing claim-to-example proximity.
- `docs/validation/readability-audit/04-reference-lifecycle.png`: reference example showing numbered content chunking.
- `docs/validation/readability-audit/07-revised-example-first.png`: revised running request shown before the mental model.
- `docs/validation/readability-audit/09-revised-desktop.png`: revised desktop outline with ten specific section titles.
- `docs/validation/readability-audit/10-revised-parsing.png`: revised short parsing explanation and plain-language rule.

At `1280 × 720`, the revised page reports ten lesson sections, 17 body paragraphs, zero open diagram transcripts by default, and no horizontal document overflow.

## Verification

- TypeScript: passed.
- ESLint: passed with zero warnings.
- Vitest: 10 files and 117 tests passed.
- Production build: passed.
- Hosting suite: 12 tests passed.
- `git diff --check`: passed.

