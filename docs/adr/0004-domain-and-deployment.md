# ADR-0004: Domain and deployment

- Status: Accepted
- Date: 2026-08-30

## Context

The portfolio already uses `therakibul.me` on Vercel. The owner confirmed `backend.therakibul.me` as the canonical project subdomain. Canonical URLs, sitemap, DNS, Search Console, and social metadata must use that stable origin.

## Decision

Use Vercel for preview and production. Make the canonical origin a required build setting named `PUBLIC_SITE_URL`. The production value is `https://backend.therakibul.me`.

## Consequences

- Preview deployments cannot accidentally emit their own URL as canonical.
- Production metadata and DNS share the confirmed origin.
- The apex portfolio can link to the project only after HTTPS and canonical behavior are verified.

## Validation

PoC-07 and production hosting tests must pass before this ADR becomes Accepted.
