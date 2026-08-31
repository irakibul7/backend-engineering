# ADR-0006: Use a chapter-only Three.js observatory

- Status: Accepted
- Date: 2026-08-31
- Accepted: 2026-08-31 after expanded PoC review by Rakibul Islam

## Context

Chapter 07 must explain encapsulation and router forwarding as state changes. The selected visual direction uses an exploded three-dimensional protocol stack synchronized with a semantic routing table. Static diagrams can explain individual states, but they do not validate whether one controlled transition can connect packet wrapping, route selection, TTL change, and link-layer replacement without overwhelming the lesson.

The current product has no 3D runtime. Adding one to the shared entry would violate the project's bundle direction and create an unnecessary continuous-rendering risk.

## Decision

Use Three.js directly inside a Chapter 07-only lazy boundary. Keep the pure TypeScript packet-journey reducer authoritative; the renderer receives a read-only projection and cannot make routing decisions.

The isolated PoC proved:

- a fixed camera with application-owned primitive geometry and no downloaded models, textures, physics, WebXR, or free-camera controls;
- no renderer construction until the observatory is near the viewport or focused;
- on-demand frames while idle and `setAnimationLoop` only during an explicit transition or one finite auto-play journey;
- immediate pause while offscreen, hidden, reduced-motion, context-lost, or unmounted;
- deterministic restoration from semantic state after resizing or context restoration;
- disposal of geometries, materials, listeners, and renderer resources;
- a complete HTML representation for reduced motion and no-WebGL environments;
- the bundle, object, triangle, device-pixel-ratio, and drawing-buffer limits in the Chapter 07 specification.

The PoC uses the current pinned Three.js release after lockfile review. The approved public implementation may promote the same bounded architecture into Chapter 07, but it must remain route-local and preserve the verified semantic fallback.

## Alternatives considered

- Static-only diagrams: lowest runtime cost but does not validate the selected stateful teaching interaction.
- CSS or DOM pseudo-3D: visually fragile, difficult to keep semantically aligned, and not the selected real-3D direction.
- React Three Fiber: convenient React bindings, but adds another abstraction and dependency before direct Three.js lifecycle behavior is understood.
- Pre-rendered video: cannot expose deterministic steps or equivalent keyboard control and adds a larger media asset.

## Consequences

- Chapter 07 owns a lazy 3D chunk; catalog and other lessons do not import it.
- The semantic journey and routing table remain readable without the chunk.
- Renderer lifecycle and performance become explicit acceptance criteria rather than implementation details.
- Three.js updates require focused visual, lifecycle, accessibility, and bundle regression review.

## Validation

`PoC-NET-02` and `PoC-NET-03` passed on 2026-08-31. Human review approved eight modules, forty deterministic states, responsive and no-WebGL behavior, finite animation, context recovery, accessibility, and the bundle/runtime budgets. Evidence is recorded in `docs/validation/chapter-07-networking-pocs.md` and `design-qa.md`.
