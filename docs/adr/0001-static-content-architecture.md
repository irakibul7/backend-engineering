# ADR-0001: Static content architecture

- Status: Proposed
- Date: 2026-08-30

## Context

The product is primarily 24 long-form technical documents. It needs canonical routes, fast first paint, strong SEO, build-time schema checks, typed authoring, and a bounded client runtime for search, progress, theme, and notes. The Product Design workflow requires its protected Vite/React starter as the implementation base.

## Decision

Use the protected Product Design Vite/React starter with strict TypeScript. Store chapters as validated typed content data and render them through semantic React block components. Add a post-build prerender step that emits route-specific HTML and metadata for the catalog, roadmap, glossary, about page, and six published lessons. Deploy the static output to Vercel.

## Consequences

- Route-specific HTML and metadata are generated at build time; reading content is present before hydration.
- Content validation and search-index generation happen at build time.
- Search must use a generated client index.
- Notes/progress remain browser-only.
- The team must keep interaction modules bounded to protect the JavaScript budget.

## Alternatives considered

- Astro: excellent content fit, but incompatible with the protected Product Design starter selected for this clone workflow.
- Next.js: capable but larger operational surface than a static field guide needs.
- Unprerendered React SPA: simple but unacceptable for route-specific SEO and no-JavaScript reading.
- Hand-authored HTML files: closest to the reference implementation but difficult to validate and maintain consistently across 24 chapters.

## Validation

PoC-01 and PoC-07 must pass before this ADR becomes Accepted.
