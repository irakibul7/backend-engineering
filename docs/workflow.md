# Specification-first delivery workflow

Source: Addy Osmani, [My LLM coding workflow going into 2026](https://medium.com/@addyosmani/my-llm-coding-workflow-going-into-2026-52fe1681325e).

This project treats AI as a fast pair programmer under human direction. Specifications, tests, browser evidence, review, and version control are the control system.

## 1. Specify

Required inputs before implementation:

- approved `spec.md` with requirements and exclusions;
- original curriculum and glossary;
- actor/role boundaries;
- interaction state machines;
- build-time and browser-state data models;
- explicit API boundary;
- threat model and test strategy;
- accepted or clearly proposed ADRs;
- reference captures at desktop and mobile.

Exit gate:

- target user and outcome are unambiguous;
- open decisions that change architecture or launch scope are resolved;
- a human can explain what is and is not being built.

## 2. Validate risky assumptions

Run only the isolated PoCs in `docs/technical-validation.md`. Each PoC has one question, requirement IDs, a measurable pass condition, a timebox, and an explicit promotion/discard decision.

Exit gate:

- results are recorded in `docs/validation/architecture-pocs.md`;
- failed assumptions update the specification or ADR before product code starts;
- experimental code is not silently copied into production.

## 3. Plan small vertical slices

Every task must contain:

- stable task ID;
- requirement IDs;
- user-visible or architectural outcome;
- acceptance tests;
- files in scope;
- explicit exclusions;
- review gate and expected commit message.

One slice should be understandable and reviewable in one sitting. Do not ask an agent to implement the whole application or author all chapters at once.

## 4. Implement one focused task

Before editing:

1. Read the task, requirements, relevant source files, tests, and ADRs.
2. Restate the intended change and exclusions.
3. Add the smallest useful failing test or validation fixture when practical.

During editing:

- change only in-scope files;
- preserve established tokens, components, and content schemas;
- prefer simple, explainable code;
- stop and update the plan if a new architectural decision appears;
- do not delegate overlapping tasks or run parallel work for coupled UI state.

## 5. Verify the complete story

Run the task-level tests first, then the repository gate. For user-facing work, verification includes the rendered browser state—not only build output.

Relevant evidence may include:

- content/contract generation;
- formatting, lint, and strict types;
- unit, integration, and Playwright tests;
- authorization/role review when a runtime role exists;
- Markdown/XSS and storage tests;
- accessibility and responsive checks;
- performance budgets;
- production build and hosting tests;
- Vercel response headers and routing;
- side-by-side design comparison.

A green build is necessary but not sufficient. The human reviewer must inspect the behavior and the diff.

## 6. Review and commit

Review order:

1. Requirements and exclusions.
2. User experience and accessibility.
3. Correctness and failure handling.
4. Security and privacy.
5. Test evidence.
6. Diff clarity and unintended changes.

Require a second review pass for:

- Markdown rendering or sanitization;
- local persistence or migration;
- external links and downloads;
- security headers or deployment configuration;
- any future authentication, authorization, upload, sync, or runtime API code.

Commit rules:

- human review happens before commit;
- all applicable checks pass;
- commit contains one explainable task;
- message describes the outcome, not `AI changes`;
- unrelated generated files, local audits, credentials, and personal data stay out;
- use a branch/worktree only when it isolates genuinely independent work.

## Task prompt template

```md
Task: T-### — <outcome>

Requirements:
- <REQ-ID>

Acceptance tests:
- <observable result>

Context to read:
- <specific files/docs>

Files in scope:
- <paths>

Explicit exclusions:
- <not part of this task>

Verification:
- <commands and browser states>

Stop conditions:
- Stop and report if a requirement conflicts with an ADR, source evidence is missing,
  or completing the task would require a new external service or security boundary.
```

## Review record template

```md
Task:
Commit candidate:
Requirements satisfied:
Checks run:
Browser states reviewed:
Security/privacy review:
Known limitations:
Human reviewer decision: approve | changes requested
```
