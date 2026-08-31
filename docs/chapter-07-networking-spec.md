# Chapter 07 specification: Networking and Packet Routing

Status: Coverage amendment and technical validation approved; implementation ready  
Prepared: 2026-08-31  
Approved: 2026-08-31  
Coverage amendment: 2026-08-31  
Specification task: `T-602H`  
Technical-validation task: `T-602I`  
Implementation task: `T-602J`  
Requirements: `LES-001`, `LES-004`, `LES-008`, `LES-009`, `A11Y-001`, `A11Y-003`, `A11Y-004`, `PERF-002`, `PERF-003`, `CON-007`

The specification and Chapter 07 insertion were approved on 2026-08-31. A coverage review against Hussein Nasser's `Network Routing - A Deep Dive` found that the original isolated technical PoC proved only the protocol-layer and route-selection interaction; it was not the complete chapter. The user approved the coverage amendment and the expanded eight-module technical proof on 2026-08-31. Public implementation may now begin with the route-size prerequisite in ADR-0005. The selected visual target remains one interaction inside the chapter, not the chapter itself.

## 1. Product and curriculum decision

Insert `Networking and Packet Routing` as Chapter 07, immediately after `Layered Request Handling` and before resource-oriented API design. Existing roadmap Chapters 07–24 shift to 08–25 without changing their slugs or promises.

This chapter is original work. Hussein Nasser's `Network Routing - A Deep Dive` is a structural research reference because it teaches routing from local links toward Internet routing. The implementation must not copy its prose, diagrams, examples, topology, layout, illustrations, or branding.

The selected direction is the exploded `Protocol Layer Observatory`: a real interactive 3D scene synchronizes encapsulation, next-hop choice, ARP evidence, TTL, routing-table selection, and link-layer replacement as a packet moves through the system.

## 2. Scope boundary

### In scope

- One original sixteen-section chapter with short, example-led explanations.
- One running request from a browser-facing application to a documentation server using reserved example addresses, plus a separate three-network route-repair lab.
- A deterministic TypeScript packet-journey model and longest-prefix-match example.
- A lazily loaded Three.js scene that visualizes the TypeScript model without becoming the source of truth.
- Original responsive visuals for signals and frames, hub versus switch behavior, subnet membership, ARP, local delivery, routed delivery, routing-table repair, and autonomous-system reachability.
- Explicit play, pause, previous, next, replay, and step-selection controls.
- Responsive desktop, 390 px, and 320 px compositions.
- Reduced-motion, no-WebGL, keyboard, and screen-reader alternatives.
- Technical PoCs and performance budgets before chapter implementation.
- Primary technical references, glossary updates, tests, SEO, sitemap, and progress integration.

### Explicit exclusions

- No packet capture from the user's device or network.
- No raw socket, privileged network, DNS, traceroute, or external API execution in the product.
- No production networking backend, proxy, VPN, router configuration, or cloud infrastructure.
- No live Internet topology, geolocation, IP ownership lookup, or third-party telemetry.
- No React Three Fiber, physics engine, game engine, WebXR, or free-camera controls.
- No user-provided shader, model, texture, topology, or unbounded destination input.
- No animation that starts automatically, loops indefinitely, or blocks reading.
- No copied article imagery, code, prose, sequence, or diagrams.
- No implementation of Chapters 08–25.

## 3. Learning contract

After the chapter, a learner should be able to explain:

1. How signals become link-layer frames and how a network interface decides whether to accept a frame.
2. Why a hub floods traffic while a switch learns source MAC addresses and forwards known destinations selectively.
3. Why MAC-address tables do not provide scalable global reachability and why IP prefixes create aggregatable destination groups.
4. How an IPv4 address, prefix length, and mask determine whether two addresses share a subnet.
5. How a host decides whether a destination is local or requires a next hop.
6. Why ARP resolves the local next hop's link-layer address rather than the final remote destination's address.
7. Why application data becomes a transport unit, IP packet, and link-layer frame without treating TCP as the network itself.
8. How same-subnet delivery differs from delivery across two networks.
9. How a router removes one link-layer envelope, performs a route lookup, decrements TTL, and creates a new envelope.
10. Why the IP source and destination normally remain stable while link-layer addresses change hop by hop.
11. Which fields make a routing-table entry useful: destination prefix, next hop, interface, metric, and route source.
12. How longest-prefix matching chooses among connected, static, learned, host, and default routes.
13. Why a third network can be unreachable despite two working local networks, and how a deliberate static route repairs the forward and return paths.
14. How DHCP, OSPF, and BGP contribute different information to routing state without forwarding individual application packets.
15. How autonomous systems exchange reachability while each router still makes a local next-hop decision.
16. How to debug a path with `ip address`, `ip link`, `ip route`, `ip neigh`, `ping`, `traceroute`, `ss`, `curl`, and packet captures without confusing observation with proof.

The chapter must distinguish forwarding-plane decisions from routing-protocol control-plane updates. It must not suggest that packets “know” a complete path or that BGP forwards individual packets.

## 4. Running examples

The fictional client requests a document from a server:

```text
client                 192.0.2.10/24
default gateway        192.0.2.1
edge next hop          198.51.100.1
documentation server   203.0.113.42
```

These values come from IPv4 documentation prefixes and must never be presented as a real production topology.

Initial application intent:

```text
GET https://docs.example/networking
```

The example focuses on the outbound request packet. The reply path is a later comparison and may be asymmetric.

The route-repair lab uses a separate fictional topology so the learner can diagnose a failure rather than merely watch a successful packet:

```text
developer workstation   192.0.2.10/24
application host        192.0.2.20/24 and 198.51.100.1/24
container bridge        198.51.100.0/24
database container      198.51.100.42/24
ordinary default route  192.0.2.1
required specific route 198.51.100.0/24 via 192.0.2.20
```

The lab may show equivalent safe commands and outputs, but it never executes a container, changes the reader's routes, probes the reader's machine, or claims that port publishing and routed container access are identical.

## 5. Sixteen-section lesson structure

| Section | Stable anchor | Plain-language question | Required evidence |
| --- | --- | --- | --- |
| 1 | `from-signal-to-frame` | What crosses a cable, radio, or fiber link? | Signal-to-bits-to-frame visual and NIC accept/drop decision |
| 2 | `hubs-flood-switches-learn` | How do several local devices share a link? | Animated hub flood versus switch forwarding table |
| 3 | `why-mac-does-not-scale` | Why not route the Internet with MAC addresses? | Broadcast-domain growth and aggregation comparison |
| 4 | `ip-prefixes-and-subnets` | How does an address reveal its network? | Interactive binary mask and prefix-membership exercise |
| 5 | `local-or-next-hop` | Is the destination directly reachable? | Two-question decision tree and default-route evidence |
| 6 | `arp-resolves-a-neighbor` | Which local MAC address should receive the frame? | ARP request, reply, cache hit, cache miss, and broadcast boundary |
| 7 | `encapsulation-without-magic` | Where do HTTP, TCP or UDP, IP, and Ethernet fit? | Layer observatory with protocol alternatives, not TCP alone |
| 8 | `same-subnet-delivery` | What happens when both hosts share a subnet? | End-to-end local sequence with switch and optional ARP cache |
| 9 | `cross-network-delivery` | What changes when the server is remote? | Host-to-gateway-to-router sequence with per-link frame replacement |
| 10 | `router-forwarding` | What does the router actually do? | Receive, validate, decrement TTL, look up, resolve, reframe, transmit |
| 11 | `routing-table-as-source-of-truth` | Which route fields drive the decision? | Connected, static, learned, host, and default-route table |
| 12 | `longest-prefix-wins` | Which matching route is most specific? | Executable `/0`, `/16`, `/24`, `/32`, and metric tie-break example |
| 13 | `when-the-default-route-fails` | Why is a reachable third network still unreachable? | Three-network failure, static-route repair, and return-path check |
| 14 | `from-lan-to-autonomous-systems` | How does Internet reachability get installed? | AS graph and DHCP/OSPF/BGP control-plane comparison |
| 15 | `a-container-network-lab` | How can a backend engineer prove and repair a route? | Fictional container-bridge case, route change preview, and before/after evidence |
| 16 | `observe-debug-and-reason` | Which observation answers which networking question? | Command matrix, packet-capture walkthrough, failure cases, checks, and references |

Every section must place an example, visual, table, or interaction before the third body paragraph. A section may contain at most two short paragraphs before evidence. Sections 1 through 15 each require their own responsive evidence; the protocol-layer observatory cannot be reused as a substitute for the remaining concepts.

### Coverage gate from the research article

The linked article is a coverage reference, not an implementation template. The public chapter is incomplete unless the following independently authored evidence exists:

| Research theme | Required original treatment |
| --- | --- |
| Data links and frames | Signal, NIC filtering, frame fields, and local-delivery boundary |
| Hub and switch | Flooding, source learning, known-unicast forwarding, and unknown-destination flooding |
| MAC scaling limits | Broadcast-domain and table-growth explanation leading to hierarchical IP prefixes |
| IPv4 networks | Prefix length, mask, host/network bits, membership, and reserved documentation addresses |
| Local-or-remote rule | Direct delivery versus selecting a reachable next hop |
| ARP | Local broadcast request, unicast reply, neighbor cache, and non-forwarding boundary |
| Packet encapsulation | Application payload, transport alternatives, IP packet, frame, and physical signal |
| Same-network journey | Host lookup, ARP/cache behavior, switch forwarding, and delivery |
| Inter-network journey | Default gateway, router interfaces, IP forwarding, TTL, and frame replacement |
| Multiple-network failure | Missing route, wrong default path, packet drop, specific route, and return-path reasoning |
| Routing table | Prefix, next hop, interface, metric, origin, default route, and longest-prefix match |
| Internet routing | Autonomous systems and control-plane installation of reachability information |
| Operations | Safe command interpretation and a fictional container-network repair exercise |

The implementation must not reuse the article's topology, address values, command transcript, animation, image sequence, captions, or wording.

## 6. Concept glossary

| Term | Chapter definition |
| --- | --- |
| Link | A medium and link-layer relationship over which adjacent interfaces exchange frames. |
| Frame | A link-layer envelope used for delivery on one link. |
| Packet | A network-layer unit carrying source, destination, protocol, lifetime, and payload information. |
| Encapsulation | Wrapping higher-layer data with the header and metadata required by a lower layer. |
| MAC address | A link-layer identifier used for delivery on a local link; it is not a global route. |
| IP address | A network-layer identifier whose prefix participates in forwarding decisions. |
| Subnet prefix | The leading address bits that describe a destination set. |
| Next hop | The adjacent node to which the current node sends a packet on its selected route. |
| Default gateway | The next hop used when no more-specific local or learned route matches. |
| ARP | IPv4 address resolution used to discover a neighbor's link-layer address on a local broadcast link. |
| Neighbor cache | Temporary mappings between network-layer neighbors and link-layer addresses. |
| Routing table | Candidate destination prefixes and forwarding information available to a node. |
| Longest-prefix match | Selecting the matching route with the greatest prefix length. |
| TTL | An IPv4 hop limit decremented by routers to bound persistent forwarding loops. |
| Forwarding plane | Per-packet lookup and transmission behavior. |
| Control plane | Processes that install or update reachability information used by forwarding. |
| Autonomous system | A routing-policy domain identified for inter-domain reachability exchange. |
| BGP | A protocol for exchanging reachability and path information between autonomous systems. |
| Asymmetric routing | Forward and return traffic using different valid paths. |

## 7. Packet-journey state machine

The authoritative educational state is a pure TypeScript model:

```text
application-data
  -> transport-segment
  -> ip-packet
  -> local-or-gateway decision
  -> neighbor resolution
  -> ethernet-frame
  -> router receive
  -> longest-prefix match
  -> TTL decrement
  -> new ethernet-frame
  -> next link or destination
```

Transitions are learner-controlled. Auto-play calls the same `next` transition and never owns separate state.

### State rules

- `previous` and direct step selection reconstruct state deterministically; they do not reverse floating-point animation state.
- A step becomes complete only after its semantic state is committed, not after a frame timer ends.
- Pause stops interpolation immediately and preserves the committed step.
- Restart returns to the exact initial model.
- Changing theme, resizing, hiding the tab, or losing WebGL context never changes the semantic packet state.
- The 3D renderer observes state and emits no networking decision.

## 8. Data model

```ts
type JourneyStage =
  | "application-data"
  | "transport-segment"
  | "ip-packet"
  | "next-hop-decision"
  | "neighbor-resolution"
  | "ethernet-frame"
  | "router-lookup"
  | "ttl-decrement"
  | "forwarded-frame"
  | "delivered";

type Ipv4Address = Readonly<{ value: number; text: string }>;

type Route = Readonly<{
  prefix: Ipv4Address;
  prefixLength: number;
  nextHop: Ipv4Address | null;
  interfaceName: string;
  metric: number;
}>;

type RouteDecision = Readonly<{
  candidates: readonly Route[];
  selected: Route;
  reason: "longest-prefix" | "metric-tiebreak";
}>;

type PacketJourney = Readonly<{
  stage: JourneyStage;
  sourceIp: Ipv4Address;
  destinationIp: Ipv4Address;
  ttl: number;
  currentLink: number;
  routeDecision: RouteDecision | null;
  neighborMac: string | null;
}>;

type NetworkScenario =
  | "direct-link"
  | "hub-flood"
  | "switch-forward"
  | "same-subnet"
  | "cross-network"
  | "missing-route"
  | "static-route-repair"
  | "internet-reachability";

type EvidenceState = Readonly<{
  scenario: NetworkScenario;
  step: number;
  activeNodeIds: readonly string[];
  activeLinkIds: readonly string[];
  packetJourney: PacketJourney | null;
  explanationId: string;
}>;
```

IPv4 parsing and prefix matching accept runtime input as `unknown`, reject malformed or non-canonical values, use unsigned 32-bit evidence, and never rely on lexicographic string matching.

The scenario reducer is deterministic and content-owned. It does not inspect the reader's interfaces, routes, IP addresses, neighbor cache, containers, or network traffic.

## 9. Longest-prefix-match contract

The executable example must:

1. Parse the destination and every route prefix.
2. Validate prefix lengths from 0 through 32.
3. Mask the destination and route prefix with an unsigned prefix mask.
4. Keep only matching routes.
5. Select the greatest prefix length.
6. Use the smallest metric only as the documented tie-breaker between equally specific routes.
7. Return a typed `no-route` outcome when nothing matches.
8. Keep the default route `/0` explicit rather than special-casing its text.

Tests include `/0`, `/32`, signed-bit boundaries, overlapping `/8` `/16` `/24` routes, equal-prefix metrics, malformed addresses, and no-route behavior.

## 10. Visual system and selected centerpiece

The composition in `docs/validation/screenshots/chapter-07-networking-selected-concept.png` is the source of truth for the protocol-layer centerpiece only. It does not define or satisfy the rest of the chapter's visual coverage.

Preserve:

- Existing app header, chapter rail, typography, white reading surface, ink, rules, and orange accent.
- The large exploded vertical layer observatory.
- One active layer at a time, with the packet payload visibly moving through encapsulation.
- A synchronized routing table and explicit “Longest prefix wins” explanation.
- A numbered step rail and restrained Back, Auto-play, and Continue controls.
- Technical information in HTML text and tables rather than rasterized inside the canvas.

Correct during implementation:

- Use Chapter 07, not the concept image's placeholder chapter number.
- Use the approved sixteen anchors and accurate example addresses.
- Keep the canvas as one visual region inside the lesson rather than turning the entire chapter into a simulator.
- Treat TCP and UDP as transport examples. Do not present a TCP segment as the only thing networking carries.
- Do not reproduce generated-image text errors or use the generated raster as the final interactive scene.

### Required responsive visual modules

| Module | Format | Required states |
| --- | --- | --- |
| Local-link laboratory | Semantic HTML/SVG with restrained animation | Direct link, hub flood, switch learn, known unicast, unknown-destination flood |
| Prefix workbench | HTML bit grid and decision tree | Network bits, host bits, mask application, same subnet, different subnet |
| Neighbor-resolution exchange | HTML/SVG sequence | Cache hit, broadcast request, reply, cache update, remote destination resolves gateway |
| Protocol-layer observatory | Lazy Three.js plus complete semantic twin | Application payload, TCP or UDP transport, IP packet, Ethernet frame, physical link |
| Routed packet journey | Lazy Three.js topology mode plus semantic timeline | Same subnet, default gateway, router receive, lookup, TTL change, frame replacement, delivery |
| Route-repair laboratory | HTML route table synchronized with the journey | No matching specific route, wrong default path, static route added, forward path, return path |
| Internet reachability map | Responsive HTML/SVG graph | AS advertisement, learned prefix, local table installation, hop-by-hop forwarding |
| Operations matrix | Semantic HTML table and annotated terminal output | Address, link, neighbor, route, socket, reachability, path, HTTP, and capture questions |

Every animated module needs explicit step controls and an equivalent static state. On mobile, complex topologies become a vertical hop timeline; they must not shrink a desktop network map until labels are unreadable.

## 11. 3D scene architecture

Use Three.js directly behind a lazy chapter-only boundary.

```text
TypeScript journey + scenario reducers (source of truth)
              |
              +--> semantic HTML explanation + tables + timeline
              |
              +--> Three.js scene adapter
                       scene / camera / renderer
                       layer and topology meshes
                       packet payload mesh
                       transition controller
```

### Scene contents

- Observatory mode with five thin layer plates: application data, TCP or UDP transport unit, IP packet, Ethernet frame, and physical link.
- Topology mode with bounded hosts, one switch, two router interfaces, three subnet planes, and a destination.
- One packet/payload object whose position and enclosure change by stage and whose active link-layer envelope is replaced at a router boundary.
- One router decision marker linking the IP layer to the selected table row.
- Simple lights, flat materials, limited transparency, and no textures or downloaded 3D models.
- A fixed camera with no orbit, pan, zoom, or drag controls.
- Explicit modes for encapsulation, same-subnet delivery, routed delivery, and missing-route repair. Each mode has a complete semantic HTML timeline.

### Renderer lifecycle

- Create the renderer only when the visual approaches the viewport or receives focus.
- Render on demand while paused.
- Use `setAnimationLoop` only during a transition or explicit auto-play.
- Stop rendering when paused, offscreen, `document.hidden`, unmounted, reduced-motion, or context-lost.
- Dispose geometries, materials, listeners, and the renderer on unmount.
- Recreate visual state from the reducer after WebGL context restoration.

## 12. Responsive behavior

### Desktop at 1280 px and wider

- The active 3D module and its semantic evidence share the reading canvas in a roughly 60/40 composition.
- All five layers remain visible with their HTML labels aligned beside the canvas.
- Controls and step rail remain below the visual.

### Mobile at 390 px

- The layer scene becomes a fixed-camera single-column observatory; topology scenes become a vertical semantic hop timeline with an optional simplified canvas above it.
- The active layer is emphasized; inactive layers remain visible but compressed in depth.
- The routing table moves below the canvas and permits internal keyboard-accessible horizontal scrolling only if required.
- Previous, play/pause, and next form a full-width control row with 44 px minimum targets.

### Narrow guardrail at 320 px

- No document overflow.
- Canvas width follows its container; its height is capped to preserve the next explanation in the first viewport after scrolling to the section.
- The step rail may wrap into a named select control while preserving direct access to every state.
- Labels remain HTML outside the canvas and never scale below readable text sizes.

## 13. Accessibility and motion contract

- The chapter remains complete without WebGL or JavaScript.
- The canvas has a concise accessible name and points to the current semantic explanation; it is not the only source of any fact.
- The current step heading, packet fields, routing candidates, selected route, TTL, and reason are real HTML.
- Step changes announce one concise message through a polite live region only after user action.
- Every action is reachable and operable by keyboard with visible focus.
- Space toggles play/pause only while a scene control has focus; arrow keys change steps only inside the step control.
- Auto-play is off by default and stops after one journey.
- `prefers-reduced-motion: reduce` removes interpolation, disables auto-play, and changes steps instantly.
- A visible `Reduce motion` control persists locally and may only make motion less intense than the platform preference.
- No flash, rapid camera motion, parallax on scroll, or continuous rotation.
- High-contrast mode retains outlines, labels, and selected-state text without depending on transparency or orange.

## 14. Performance budget

ADR-0005 must be completed before this chapter can publish: catalog metadata and lesson bodies must be split so the shared entry returns to at most 100 kB gzip.

Chapter-specific budgets:

| Budget | Limit |
| --- | --- |
| Shared entry JavaScript | `<= 100 kB` gzip |
| Networking content chunk excluding 3D dependency | `<= 35 kB` gzip |
| Lazy 3D dependency + scene chunk | `<= 180 kB` gzip |
| Scene objects | `<= 40` |
| Visible triangles | `<= 50,000` |
| Drawing buffer | `<= 2.1 million` pixels |
| Device pixel ratio | capped at `1.5` |
| Idle render loop | stopped; zero scheduled animation frames |
| Layout shift | `0` from canvas initialization |

The canvas reserves its aspect ratio before loading. A Three.js failure must not prevent chapter text, controls, table, navigation, or progress from working.

## 15. Threat and privacy model

| Hypothesis | Boundary | Required control | Test evidence |
| --- | --- | --- | --- |
| Malformed IP or prefix corrupts lookup | Parser | Accept `unknown`; strict canonical parser and bounds | Invalid-input cases |
| Crafted route count creates excessive work | Example model | Fixed bounded route fixture; no arbitrary table import | Route-count invariant |
| WebGL consumes GPU while hidden | Renderer lifecycle | Visibility/intersection stop and disposal | Lifecycle test and browser observation |
| Context loss leaves a blank or broken lesson | Canvas adapter | Semantic fallback and context restore | Forced context-loss test where supported |
| Animation causes motion discomfort | Interaction | Opt-in play, reduced-motion snap states, no camera travel | Reduced-motion browser check |
| Diagram leaks user network information | Privacy | Fixed documentation addresses; no device/network inspection | Network-request audit |
| Canvas or shader becomes an injection surface | Scene construction | Static application-owned geometry/material/shader inputs | Dependency and source review |

## 16. Technical-validation PoCs

### PoC-NET-01: Pure packet journey and routing lookup

- Implement only the parser, prefix matching, journey reducer, and unit tests.
- Prove deterministic next/previous/direct-step reconstruction.
- No React, Three.js, styles, route, or publication change.

### PoC-NET-02: 3D fidelity and lifecycle

- Recreate the selected observatory and a bounded routed-topology mode inside an isolated development route or fixture.
- Prove encapsulation, same-subnet delivery, routed delivery, and missing-route repair without using TCP as the only transport example.
- Prove fixed-camera composition at desktop and a readable vertical-hop alternative at 390 px and 320 px.
- Prove on-demand rendering, pause/offscreen/hidden shutdown, disposal, context loss, and state restoration.
- Record initial and lazy chunk sizes.

### PoC-NET-03: Accessibility and fallback

- Prove keyboard operation, live-region restraint, reduced motion, high contrast, no-WebGL fallback, and readable semantic table.
- Axe must report zero automated violations.
- The full state narrative for every scenario must remain understandable with canvas hidden.

Implementation is blocked until all three PoCs pass and are reviewed.

## 17. Test strategy

### Unit tests

- IPv4 parsing, prefix masks, canonical text, unsigned high-bit cases.
- Longest-prefix matching and metric tie-breaks.
- Deterministic journey reducer, bounds, replay, and direct selection.
- Motion preference resolution and local preference narrowing.
- Scene projection derived from semantic state without mutating it.

### Component tests

- Lazy scene does not load before the boundary activates.
- Previous, next, direct step, play, pause, replay, and completion.
- Table selection, semantic explanation, and scene state stay synchronized.
- Hub/switch, prefix, ARP, local delivery, routed delivery, route repair, and AS reachability visuals expose the same facts in their semantic equivalents.
- TCP and UDP transport choices produce valid encapsulation states without changing IP forwarding semantics.
- Reduced motion removes auto-play and interpolation.
- WebGL failure renders the complete fallback.
- Progress is based on lesson sections, not animation completion.

### Browser tests

- Desktop, 390 px, and 320 px layouts with no document overflow.
- Keyboard journey through every scene control.
- Page visibility and offscreen pause behavior.
- WebGL context-loss recovery where browser support permits.
- Zero unexpected console warnings, errors, or external requests.
- Axe, Lighthouse, bundle budgets, and layout-shift checks.
- Design QA compares the selected concept and the implementation at the same desktop viewport and active `IP routing` state.

## 18. Source plan

Primary technical sources:

1. RFC 1122, Requirements for Internet Hosts — Communication Layers.
2. RFC 826, An Ethernet Address Resolution Protocol.
3. RFC 791, Internet Protocol.
4. RFC 1812, Requirements for IP Version 4 Routers.
5. RFC 4632, Classless Inter-domain Routing.
6. RFC 4271, Border Gateway Protocol 4.
7. RFC 8200, Internet Protocol Version 6 Specification.
8. RFC 5737, IPv4 Address Blocks Reserved for Documentation.
9. Three.js WebGLRenderer documentation.
10. Three.js responsive rendering manual.
11. W3C WCAG 2.2 pause/stop/hide and animation-from-interactions guidance.

Secondary structural reference:

- Hussein Nasser, `Network Routing - A Deep Dive`, reviewed 2026-08-31. Use only to validate topic coverage and the progression from local links to routing; do not copy expression or visuals.

Every technical claim in the published lesson must map to a primary source. The chapter must label IPv4-specific behavior and briefly contrast IPv6 Neighbor Discovery rather than implying ARP is universal.

## 19. Architecture and repository impact

- `openapi.yaml`: unchanged; no runtime API is added.
- Threat model: add bounded WebGL lifecycle, fixed documentation data, reduced-motion, and no-device-inspection controls.
- ADR-0005: prerequisite; per-chapter content splitting must land before publication.
- New ADR required for the Three.js dependency, lazy loading, renderer lifecycle, and chapter-only 3D boundary.
- Analytics: unchanged; no animation step, destination, canvas, or command interaction is collected.
- Storage: one versioned visual-motion preference may be added; it cannot contain network data.
- Sitemap and metadata change only in the final approved publication slice.

## 20. Small implementation slices

### T-602H — Specification

- Deliver this document, `CON-007`, curriculum insertion plan, selected concept asset, and task plan.
- No runtime or publication change.

### T-602I — Technical validation

- Complete PoC-NET-01 through PoC-NET-03 with tests and evidence.
- No public lesson route or catalog publication.

### T-602J-1 — Route-size architecture

- Complete ADR-0005's per-chapter content split and restore the shared 100 kB gzip budget.
- Preserve direct routes, SEO generation, search, progress, and no-JavaScript reading.

### T-602J-2 — Original written chapter

- Publish the sixteen short sections, all non-3D responsive visual modules, glossary, questions, debugging matrix, route-repair lab, and primary references without the 3D scene.
- Confirm the chapter remains complete as static content.

### T-602J-3 — Interactive observatory

- Add the reviewed lazy Three.js adapter for protocol layers and the bounded routed-topology mode using the same pure journey and scenario models.
- Add reduced-motion, no-WebGL, context-loss, and mobile behaviors.

### T-602J-4 — Final verification and publication

- Run the full gate, accessibility, responsive, performance, broken-link, network-request, and design-QA checks.
- Add canonical metadata and sitemap only after the reviewed chapter is complete.
- Human review is required before commit and push.
