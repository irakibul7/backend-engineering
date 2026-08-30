# Backend from First Principles

A specification-first, long-form backend engineering field guide for Rakibul Islam's portfolio.

The product will reproduce the reference site's information architecture and interaction model while using original code, writing, diagrams, and personal branding. The current repository intentionally contains planning artifacts only. Application implementation starts after human review of `spec.md` and `plan.md`.

## Current phase

- Phase: technical validation, approved to implement
- Implementation: not started
- Intended production host: Vercel
- Intended domain: `backend.therakibul.me` (confirmed 2026-08-30)
- Reference experience: <https://backend-from-first-principle.vercel.app/>

## Read first

1. [`spec.md`](./spec.md) defines the product and acceptance criteria.
2. [`plan.md`](./plan.md) breaks implementation into small reviewable slices.
3. [`AGENTS.md`](./AGENTS.md) contains repository rules for human and AI contributors.
4. [`docs/reference-capture.md`](./docs/reference-capture.md) records source evidence.
5. [`docs/test-strategy.md`](./docs/test-strategy.md) defines the verification gates.

## Documentation map

- `docs/content-outline.md`: original 24-chapter curriculum
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
