# Chapter 07 networking technical-validation evidence

- Date: 2026-08-31
- Owner: Codex with Rakibul Islam human approval
- Commit: uncommitted working tree
- Environment: macOS, Node.js/Vite development server, Vitest jsdom, in-app Chromium browser, axe-core 4.13.0
- Requirements: `LES-001`, `LES-004`, `LES-008`, `A11Y-001`, `A11Y-003`, `A11Y-004`, `PERF-002`, `PERF-003`, `CON-007`
- Scope: `T-602I`, approved expanded PoC-NET-01 through PoC-NET-03
- Public product impact: none; `/networking-poc.html` is an isolated Vite development/build entry and is not part of the production build, catalog, sitemap, or Chapter 07 route.

## PoC-NET-01 — deterministic packet journey and route lookup

### Hypothesis

A pure TypeScript model can parse canonical IPv4 addresses, perform unsigned longest-prefix matching, and reconstruct every packet step without depending on animation state.

### Minimal files

- `src/pocs/networking/model.ts`
- `src/pocs/networking/model.test.ts`

### Verification

```text
npm test -- --run src/pocs/networking
4 test files passed
42 focused tests passed
```

Covered cases:

- canonical and malformed IPv4 input;
- unsigned `255.255.255.255` and high-bit prefixes;
- `/0`, `/8`, `/24`, and `/32` overlaps;
- equal-prefix metric tie-breaks;
- non-canonical route prefixes, invalid next hops, interface names, metrics, and prefix lengths;
- bounded 64-route fixture and explicit no-route outcome;
- deterministic next, previous, direct selection, boundary clamping, TTL decrement, and link-layer replacement.
- eight scenario definitions with 40 total states and deterministic scenario/step transitions.

### Decision

Pass. Promote the model deliberately if the public static Chapter 07 slice is approved. Keep it authoritative over any future renderer.

## PoC-NET-02 — 3D fidelity and bounded lifecycle

### Hypothesis

The selected exploded Protocol Layer Observatory plus bounded topology views can implement all eight approved technical-validation modules without entering the shared product bundle or running continuously.

### Minimal files

- `networking-poc.html`
- `vite.networking-poc.config.ts`
- `src/pocs/networking/NetworkingPoc.tsx`
- `src/pocs/networking/observatory.ts`
- `src/pocs/networking/lifecycle.ts`
- `src/pocs/networking/networking-poc.css`
- `docs/adr/0006-chapter-only-threejs-observatory.md`

### Build evidence

```text
npm run build:poc:networking
networking-poc JavaScript: 74.51 kB gzip
lazy observatory/Three.js chunk: 131.66 kB gzip
networking-poc CSS: 12.98 kB gzip
```

The lazy 3D chunk passes the 180 kB gzip limit. The proof does not alter the main production build input.

### Runtime evidence

- Coverage: eight modules and 40 states: hubs/switches (5), subnets/next hops (4), ARP/neighbors (5), protocol layers (5), routed delivery (8), route repair (5), Internet reachability (4), and observe/debug (4).
- Scene: 28 objects and 556 triangles, below 40 objects and 50,000 triangles.
- Desktop observation: DPR 1.0 and 125,840 drawing-buffer pixels, below the 1.5 DPR and 2.1-million-pixel caps.
- Renderer state changed from `active` to `idle` after the observatory moved beyond its 180 px preload margin, then resumed when returned onscreen.
- Forced `WEBGL_lose_context` produced `context-lost`, restored to `ready`, and emitted no browser warning or error.
- Renderer construction is triggered only by near-viewport intersection or focus.
- Paused states render on demand; only finite transitions use `setAnimationLoop`.
- Cleanup removes observers/listeners and disposes scene geometry, materials, and the renderer.

### Responsive evidence

- Desktop target: 1488 × 1058 CSS viewport, no document overflow, all eight module choices and the selected evidence remain usable.
- Mobile: 390 × 844, no document overflow; the canvas and evidence stack vertically and module navigation scrolls within its own bounded region.
- Narrow: 320 × 720, 305 px content/document width, no document overflow, 181 px canvas width.
- The narrow step rail becomes a labeled native select; dense route tables and module navigation use labeled internal scroll regions.

### Decision

Pass and approved for promotion into the public Chapter 07 implementation under ADR-0006.

## PoC-NET-03 — semantic and reduced-motion equivalence

### Hypothesis

The complete packet state remains understandable and operable when motion is reduced, WebGL is unavailable, or the canvas is hidden.

### Evidence

- Every stage has an HTML heading and explanation.
- Source IP, destination IP, TTL, current link, route candidates, selected route, and selection reason remain HTML.
- Previous, Continue, direct step buttons, native narrow-screen select, Auto-play, Pause, and arrow-key rail navigation are tested.
- Auto-play is off initially, finite, and disabled when system or reader motion reduction applies.
- The saved reader setting can only request less motion than the operating-system preference.
- `?webgl=off` keeps the complete semantic state and all three route rows.
- `noscript` contains the fixed journey and routing-table evidence for the isolated proof.
- axe-core 4.13.0 found zero violations in normal and forced no-WebGL states.
- Final in-app browser passes reported zero unexpected console warnings or errors.

### Decision

Pass for technical validation. The published chapter must preserve the same semantic-first architecture after route-size splitting.

## Visual and interaction evidence

- Selected source: `docs/validation/screenshots/chapter-07-networking-selected-concept.png`
- Desktop implementation: `docs/validation/screenshots/chapter-07-networking-expanded-poc-desktop.png`
- Side-by-side comparison: `docs/validation/screenshots/chapter-07-networking-design-qa-comparison.png`
- Mobile 390 px: `docs/validation/screenshots/chapter-07-networking-expanded-poc-390.png`
- No-WebGL 320 px: `docs/validation/screenshots/chapter-07-networking-expanded-poc-fallback-320.png`
- Detailed visual review: `design-qa.md`

## Human review decision

Rakibul Islam approved the expanded local proof on 2026-08-31. ADR-0006 is Accepted and `T-602I` is Complete. Public Chapter 07 implementation proceeds as `T-602J`, beginning with the separate ADR-0005 content-splitting prerequisite.

## Repository regression gate

```text
npm run check
TypeScript: passed
ESLint: passed with zero warnings
Vitest: 15 files, 181 tests passed
Production build: passed; shared entry remains 102.76 kB gzip under ADR-0005's temporary six-chapter limit
Hosting: 12 tests passed

npm run build:poc:networking
Passed; entry 74.51 kB gzip, lazy 3D chunk 131.66 kB gzip, CSS 12.98 kB gzip

git diff --check
Passed
```

The link checker confirmed all 51 internal and external routes/assets with HTTP 200. Axe-core 4.13.0 reported zero automated violations in normal and forced no-WebGL states. Production Lighthouse on the semantic fallback reported 99 performance, 100 accessibility, and 100 best practices, with FCP 1.7 s, LCP 1.9 s, CLS 0.003, and TBT 20 ms. The WebGL audit passed accessibility and best practices at 100; its synthetic SwiftShader run is recorded separately because software rendering dominated TBT and does not represent the verified in-app GPU path.
