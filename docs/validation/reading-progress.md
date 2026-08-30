# Section reading progress — 2026-08-30

## Outcome

Chapter percentages now represent sections actually reached rather than a binary placeholder. A section is recorded when its end marker enters the upper 80% of the reading viewport. Returning to an already-read section is idempotent.

## Persistence

Progress remains private to the current browser and device in `localStorage` under `backend-engineering:reading-progress:v1`. The payload maps known chapter slugs to known section IDs. It is not sent to Vercel Analytics, Speed Insights, or any application server.

Legacy 100% chapter completions migrate to all known sections. The former completed-chapter record remains synchronized for compatibility.

## Verification

- TypeScript strict check: passed
- ESLint with zero warnings: passed
- Unit/component tests: 30 passed, including section persistence, legacy migration, and intersection-driven UI progress
- Production build and 12 hosting tests: passed
- Browser: first HTTP section changed the lesson and catalog values from 0% to 17%; overall published progress became 8%
- Browser reload: 17% persisted

Final result: passed.
