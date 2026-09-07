# Backend Engineering

A specification-first, long-form backend engineering field guide for Rakibul Islam's portfolio.

The product uses an original engineering-notebook interface, original writing, and personal branding. Its curriculum is language-neutral at the product level so implementation examples can expand over time.

## Current phase

- Phase: public launch
- Implementation: catalog, roadmap, private local study tools, ten complete lessons and eighteen planned topics available
- Production host: Vercel
- Production domain: <https://backend.therakibul.me/>
- Inspiration studied: <https://backend-from-first-principle.vercel.app/> (interaction research only; not a visual target)

Vercel publishes `dist/client`. The build creates one indexable HTML document per public route, plus the manifest, icons, social image, sitemap, and robots file. Unknown document routes preserve a real 404.

Vercel Web Analytics and Speed Insights are mounted only on the production domain and Vercel preview deployments, preventing expected telemetry-endpoint errors during local previews.

## Verification

```sh
npm run check
npm run preview -- --host 127.0.0.1 --port 4176
npm run verify:links
```

The dated launch record, including Lighthouse, accessibility, responsive, console, link, and production checks, lives in [`docs/validation/launch-readiness.md`](./docs/validation/launch-readiness.md). The first live Analytics and Speed Insights baseline, privacy boundary, and review thresholds live in [`docs/validation/observability-baseline.md`](./docs/validation/observability-baseline.md).

## Read first

1. [`spec.md`](./spec.md) defines the product and acceptance criteria.
2. [`plan.md`](./plan.md) breaks implementation into small reviewable slices.
3. [`AGENTS.md`](./AGENTS.md) contains repository rules for human and AI contributors.
4. [`docs/reference-capture.md`](./docs/reference-capture.md) records source evidence.
5. [`docs/test-strategy.md`](./docs/test-strategy.md) defines the verification gates.

## Documentation map

- `docs/content-outline.md`: original curriculum (Chapter 07 insertion is specified in `docs/chapter-07-networking-spec.md`)
- `docs/workflow.md`: Addy-inspired operating loop and review gates
- `docs/glossary.md`: shared product and backend vocabulary
- `docs/role-matrix.md`: capabilities by user role
- `docs/state-machine.md`: search, progress, theme, notes, and lesson states
- `docs/data-model.md`: content and browser-storage schemas
- `docs/threat-model.md`: trust boundaries and mitigations
- `docs/technical-validation.md`: proof-of-concept plan
- `docs/adr/`: architecture decisions
- `openapi.yaml`: explicit API boundary for the static MVP

## Addy workflow

The repository follows a specification-first loop inspired by Addy Osmani's AI-assisted engineering workflow:

1. Specify the outcome and constraints.
2. Validate risky assumptions in isolation.
3. Plan small vertical slices.
4. Implement one focused slice at a time.
5. Verify with automated and browser checks.
6. Review every change before making a small, explainable commit.

No generated change is accepted only because it compiles. A human must understand the diff and its evidence.


## Practical case studies and local reference application

Read foundations 01–07, then follow the hypothetical Field Notes document service
through [payment design](src/content/lessons/idempotent-payment-endpoint.ts),
[job recovery](src/content/lessons/reliable-background-jobs.ts), and
[request tracing](src/content/lessons/tracing-a-slow-request.ts) (chapters 26–28).
Existing URLs and planned topics retain their identifiers.

The [downloadable lab](public/labs/field-notes/README.md) runs on Node.js 24 with
built-in SQLite and no package installation. All payments and receipts are local
simulations. Copy its eight files into `.local/field-notes` before running them.
No database, API, credentials or paid service is added to the website.

```sh
npm run test:lab
npm run check
npm run preview -- --host 127.0.0.1 --port 4176
# In another terminal, with Google Chrome installed:
npm run test:browser
npm run verify:links
```

Browser checks use pinned Playwright and axe dev dependencies. `BROWSER_BASE_URL`
overrides the preview URL; `BROWSER_CHANNEL` overrides `chrome` (install the
corresponding browser first). Screenshots and the browser report are stored in
`.local/field-notes-browser/`. The build rejects unapproved files and symlinks in
the public lab directory before copying assets.

See [implementation and verification evidence](docs/validation/field-notes.md)
for changes, measured workload details, privacy boundaries and remaining gaps.
The validation record documents the local review; deployment is a separate step.
