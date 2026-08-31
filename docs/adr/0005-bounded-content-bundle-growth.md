# ADR-0005: Bound content-bundle growth before Chapter 07

- Status: Accepted
- Date: 2026-08-31

## Context

Publishing Chapter 06 grows the entry JavaScript from 93.98 kB to 102.76 kB gzip after optional search and notes overlays are split into conditional chunks. This is 2.76 kB above `PERF-003`'s original 100 kB cap. The built Chapter 06 route still scores 97 for Lighthouse mobile performance, with 2.3 s LCP, 0 CLS, and 0 ms total blocking time.

Removing lesson evidence to meet the cap would weaken the approved learning contract. Continuing to embed every future chapter in the entry chunk would make the problem grow without bound.

## Decision

Approve a temporary entry-chunk ceiling of 105 kB gzip for the six-chapter release. Keep search, notes, and Markdown preview conditional. Before Chapter 07 can be published, separate catalog metadata from lesson bodies and load each complete lesson as its own route chunk. Restore the 100 kB gzip ceiling for the shared entry chunk in that slice.

This exception applies only to the six-chapter release and does not authorize a larger bundle for later chapters.

## Consequences

- Chapter 06 keeps its complete reviewed examples, visuals, and primary evidence.
- The six-chapter entry chunk is allowed up to 105 kB gzip only while field performance remains within `PERF-002`.
- `T-603` is blocked until per-chapter content splitting passes progress, search, direct-route, SEO, and no-JavaScript-reading tests.
- Any regression above 105 kB gzip requires a separate decision and cannot rely on this ADR.

## Validation

- Production build: 102.76 kB gzip entry chunk.
- Conditional chunks: search 1.07 kB, notes 1.21 kB, Markdown preview 49.21 kB gzip.
- Local mobile Lighthouse on Chapter 06: performance 97, accessibility 100, best practices 100, SEO 100; LCP 2.3 s, CLS 0, TBT 0 ms.
- Approved by the user with the Chapter 06 implementation on 2026-08-31.
