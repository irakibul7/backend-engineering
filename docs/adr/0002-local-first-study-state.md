# ADR-0002: Local-first study state

- Status: Proposed
- Date: 2026-08-30

## Context

Learners need completion, theme, and notes without account friction. Remote sync would require authentication, authorization, privacy controls, a database, API, and operations that are not part of the portfolio MVP.

## Decision

Store versioned preferences, progress, and Markdown notes in browser local storage. Notes are private by design and leave the browser only through an explicit Markdown export.

## Consequences

- No account, cookie banner, backend, or personal-data store is required.
- Data does not sync across browsers and may be lost when browser data is cleared.
- Storage parsing, quota handling, migrations, and sanitization become critical client responsibilities.
- Analytics must never capture search queries, progress identifiers, or note content.

## Alternatives considered

- IndexedDB: useful for large/offline datasets but unnecessary for small text notes and progress.
- Cloud sync: better continuity but disproportionate security/privacy scope.
- No persistence: simpler but removes a defining study feature from the reference.

## Validation

PoC-03 and PoC-04 must pass before this ADR becomes Accepted.
