export const NETWORK_SCENARIO_IDS = [
  "link-sharing",
  "prefix-decision",
  "neighbor-resolution",
  "encapsulation",
  "routed-delivery",
  "route-repair",
  "internet-reachability",
  "operations",
] as const;

export type NetworkScenarioId = (typeof NETWORK_SCENARIO_IDS)[number];
export type EvidenceVisual = "topology" | "prefix" | "layers" | "routes" | "internet" | "operations";
export type TransportChoice = "tcp" | "udp";
export type EvidenceOutcome = "observed" | "dropped" | "route-added" | "forwarded" | "return-verified";

export type EvidenceFact = Readonly<{ label: string; value: string }>;

export type EvidenceStep = Readonly<{
  short: string;
  title: string;
  body: string;
  insight: string;
  activeNodeIds: readonly string[];
  activeLinkIds: readonly string[];
  facts: readonly EvidenceFact[];
  transport?: TransportChoice;
  outcome?: EvidenceOutcome;
}>;

export type NetworkScenario = Readonly<{
  id: NetworkScenarioId;
  number: string;
  label: string;
  eyebrow: string;
  summary: string;
  visual: EvidenceVisual;
  steps: readonly EvidenceStep[];
}>;

const step = (
  short: string,
  title: string,
  body: string,
  insight: string,
  activeNodeIds: readonly string[],
  activeLinkIds: readonly string[],
  facts: readonly EvidenceFact[],
  options: Readonly<{ transport?: TransportChoice; outcome?: EvidenceOutcome }> = {},
): EvidenceStep => ({ short, title, body, insight, activeNodeIds, activeLinkIds, facts, ...options });

export const NETWORK_SCENARIOS: readonly NetworkScenario[] = [
  {
    id: "link-sharing",
    number: "01",
    label: "Hubs and switches",
    eyebrow: "Local links",
    summary: "Watch a frame cross a direct link, flood through a hub, and become selective after a switch learns its ports.",
    visual: "topology",
    steps: [
      step("Direct", "Two interfaces can exchange one local frame", "A frame carries a source MAC, a destination MAC, and payload across one physical or wireless link. The receiving interface accepts it only when the destination matches.", "Layer 2 delivers between adjacent interfaces; it does not promise a global path.", ["host-a", "host-b"], ["a-b"], [{ label: "Frame", value: "A → B" }, { label: "Decision", value: "B accepts" }]),
      step("Hub", "A hub repeats the signal to every other port", "The hub has no destination table. It reproduces the incoming signal on every port except the one where it arrived.", "Every attached interface sees the frame, even though only B needs it.", ["host-a", "hub", "host-b", "host-c", "host-d"], ["a-hub", "hub-b", "hub-c", "hub-d"], [{ label: "Forwarding", value: "Flood all ports" }, { label: "Useful copies", value: "1 of 3" }]),
      step("Learn", "A switch learns from the source of arriving frames", "When A sends a frame into port 1, the switch records that source MAC A is reachable through port 1. Learning uses the source, not the destination.", "The forwarding table is learned evidence and can age out.", ["host-a", "switch"], ["a-switch"], [{ label: "Learned", value: "MAC A → port 1" }, { label: "Destination", value: "Still unknown" }]),
      step("Forward", "A known destination uses one switch port", "After B has also transmitted, the switch knows B is on port 5. A frame for B is forwarded only to that port.", "Selective forwarding reduces unnecessary local traffic.", ["host-a", "switch", "host-b"], ["a-switch", "switch-b"], [{ label: "Lookup", value: "MAC B → port 5" }, { label: "Forward", value: "Port 5 only" }]),
      step("Unknown", "An unknown destination is flooded within the LAN", "If the destination MAC is absent from the table, the switch temporarily behaves like a hub and floods the frame inside that broadcast domain.", "Switching scales a LAN, but unknown destinations still expose the limit of flat addressing.", ["host-a", "switch", "host-b", "host-c", "host-d"], ["a-switch", "switch-b", "switch-c", "switch-d"], [{ label: "Lookup", value: "No entry" }, { label: "Fallback", value: "Flood local ports" }]),
    ],
  },
  {
    id: "prefix-decision",
    number: "02",
    label: "Subnets and next hops",
    eyebrow: "Hierarchical addressing",
    summary: "Apply a prefix mask, decide whether delivery is local, and choose a reachable next hop for a remote destination.",
    visual: "prefix",
    steps: [
      step("Prefix", "An IP prefix groups destinations into a network", "The prefix length says how many leading bits identify the network. In 192.0.2.0/24, the first 24 bits describe the destination group.", "Hierarchical prefixes let one route stand for many hosts.", ["client"], [], [{ label: "Network", value: "192.0.2.0/24" }, { label: "Host bits", value: "8" }]),
      step("Mask", "The mask exposes the network portion", "Apply 255.255.255.0 to 192.0.2.10 and the result is 192.0.2.0. Apply it to 192.0.2.42 and the result is the same.", "Equal masked networks mean the destination is directly reachable on this link.", ["client", "local-server"], ["client-local"], [{ label: "192.0.2.10 AND /24", value: "192.0.2.0" }, { label: "192.0.2.42 AND /24", value: "192.0.2.0" }]),
      step("Remote", "A different prefix requires a next hop", "The destination 203.0.113.42 does not belong to 192.0.2.0/24, so the client cannot resolve the server directly on its local link.", "Remote delivery begins by finding an adjacent router.", ["client", "server"], [], [{ label: "Client network", value: "192.0.2.0/24" }, { label: "Server network", value: "203.0.113.0/24" }]),
      step("Gateway", "The default gateway is a local neighbor", "The client selects 192.0.2.1 as its next hop. That gateway must itself be reachable on the client's local subnet.", "A host chooses the next hop, not every router in the path.", ["client", "router-a"], ["client-router"], [{ label: "Destination", value: "203.0.113.42" }, { label: "Next hop", value: "192.0.2.1" }]),
    ],
  },
  {
    id: "neighbor-resolution",
    number: "03",
    label: "ARP and neighbors",
    eyebrow: "Address resolution",
    summary: "Resolve a local next-hop IP into the MAC address required for one-link delivery.",
    visual: "topology",
    steps: [
      step("Miss", "The neighbor cache has no gateway entry", "The route points at 192.0.2.1, but Ethernet still needs a destination MAC. The client checks its neighbor cache first.", "Routing selects an IP next hop; ARP supplies the local-link address.", ["client"], [], [{ label: "Neighbor", value: "192.0.2.1" }, { label: "Cache", value: "Miss" }]),
      step("Request", "ARP asks every device on the local broadcast link", "The client broadcasts: who has 192.0.2.1? Switches keep that request inside the LAN and routers do not forward it as an Internet query.", "ARP is local by design.", ["client", "switch", "router-a", "local-server"], ["client-switch", "switch-router", "switch-local"], [{ label: "Destination MAC", value: "ff:ff:ff:ff:ff:ff" }, { label: "Question", value: "Who has 192.0.2.1?" }]),
      step("Reply", "Only the interface owning the IP replies", "The gateway answers with its MAC address and directs the reply back to the client.", "The reply proves the address of the adjacent next hop, not the remote server.", ["client", "router-a"], ["client-router"], [{ label: "192.0.2.1", value: "02:00:00:00:01:01" }, { label: "Delivery", value: "Unicast reply" }]),
      step("Cache", "The client stores the mapping temporarily", "The neighbor entry lets later frames avoid another broadcast until the entry ages or becomes invalid.", "Neighbor state is a cache, not permanent truth.", ["client", "router-a"], ["client-router"], [{ label: "State", value: "Reachable" }, { label: "Entry", value: "192.0.2.1 → 02:…:01:01" }]),
      step("Remote", "A remote server never receives this ARP request", "For 203.0.113.42, the client uses the gateway's MAC in the Ethernet frame while keeping the server's IP in the enclosed packet.", "Resolve the next hop on this link, not the final destination across the Internet.", ["client", "router-a", "server"], ["client-router"], [{ label: "Frame destination", value: "Gateway MAC" }, { label: "Packet destination", value: "203.0.113.42" }]),
    ],
  },
  {
    id: "encapsulation",
    number: "04",
    label: "Protocol layers",
    eyebrow: "Encapsulation",
    summary: "See application data carried by either TCP or UDP before IP and Ethernet add their own delivery information.",
    visual: "layers",
    steps: [
      step("Data", "Application data starts without network envelopes", "The application produces bytes for a request. Lower layers have not yet added ports, IP addresses, MAC addresses, or link signals.", "Application meaning and delivery mechanics are separate concerns.", ["application"], [], [{ label: "Payload", value: "GET /networking" }, { label: "Layer", value: "Application" }]),
      step("TCP", "TCP can carry a reliable byte-stream conversation", "TCP adds ports, sequence information, acknowledgements, and connection state before IP carries the segment.", "TCP is one transport choice, not the definition of networking.", ["application", "transport"], ["app-transport"], [{ label: "Transport", value: "TCP" }, { label: "Unit", value: "Segment" }], { transport: "tcp" }),
      step("UDP", "UDP can carry a message without TCP connection state", "UDP adds source and destination ports with a compact header. IP routing works the same way whether the payload is TCP, UDP, or another supported protocol.", "Routers forward IP packets; they do not require every packet to contain TCP.", ["application", "transport"], ["app-transport"], [{ label: "Transport", value: "UDP" }, { label: "Unit", value: "Datagram" }], { transport: "udp" }),
      step("IP", "IP adds network-layer source, destination, and lifetime", "The network layer wraps the transport unit with 192.0.2.10, 203.0.113.42, a protocol identifier, and TTL 64.", "The protocol field tells the destination which upper layer should receive the payload.", ["application", "transport", "network"], ["app-transport", "transport-network"], [{ label: "Source IP", value: "192.0.2.10" }, { label: "Destination IP", value: "203.0.113.42" }]),
      step("Frame", "Ethernet wraps the packet for one local link", "The frame uses the client's MAC as its source and the gateway's MAC as its destination. The remote server IP remains inside.", "Each envelope answers a different delivery question.", ["application", "transport", "network", "link", "physical"], ["app-transport", "transport-network", "network-link", "link-physical"], [{ label: "Frame destination", value: "Gateway MAC" }, { label: "Packet destination", value: "Server IP" }]),
    ],
  },
  {
    id: "routed-delivery",
    number: "05",
    label: "Routed packet journey",
    eyebrow: "Hop-by-hop forwarding",
    summary: "Follow one packet from client to gateway, through a router lookup and TTL change, into a replacement frame, and on to the server.",
    visual: "topology",
    steps: [
      step("Intent", "The client targets a server on another subnet", "The application has produced a request for 203.0.113.42. The client route table determines that the destination is remote.", "The packet does not contain a precomputed Internet path.", ["client", "server"], [], [{ label: "Source", value: "192.0.2.10" }, { label: "Destination", value: "203.0.113.42" }]),
      step("Next hop", "The client selects its local gateway", "The default route chooses 192.0.2.1 because no more-specific route exists on the client.", "The selected next hop is adjacent and can be resolved locally.", ["client", "router-a"], ["client-router"], [{ label: "Route", value: "0.0.0.0/0" }, { label: "Next hop", value: "192.0.2.1" }]),
      step("ARP", "ARP supplies the gateway's MAC address", "The neighbor cache resolves 192.0.2.1 to the router interface's link-layer address.", "The server's MAC is neither requested nor visible on this link.", ["client", "switch", "router-a"], ["client-switch", "switch-router"], [{ label: "Neighbor IP", value: "192.0.2.1" }, { label: "Resolved MAC", value: "02:…:01:01" }]),
      step("Frame", "The first frame reaches the router", "The frame targets the gateway MAC while the enclosed packet continues to target 203.0.113.42.", "One frame ends at the router; the packet journey continues.", ["client", "router-a"], ["client-router"], [{ label: "Frame", value: "Client MAC → gateway MAC" }, { label: "Packet", value: "192.0.2.10 → 203.0.113.42" }]),
      step("Lookup", "The router removes the frame and looks up the destination", "The router validates the packet and compares the destination with its candidate prefixes. The most-specific matching route chooses the outbound interface.", "Forwarding is a local table decision repeated at each router.", ["router-a"], [], [{ label: "Selected route", value: "203.0.113.0/24" }, { label: "Interface", value: "eth1" }]),
      step("TTL", "The router decrements TTL before transmission", "TTL changes from 64 to 63. A zero value causes a discard, preventing a routing loop from continuing forever.", "TTL is a hop limit, not elapsed time.", ["router-a"], [], [{ label: "Before", value: "TTL 64" }, { label: "After", value: "TTL 63" }]),
      step("Reframe", "A new frame carries the packet across the next link", "The router resolves the next neighbor, uses new source and destination MAC addresses, and transmits the packet without changing its destination IP.", "MAC addresses change by link; the destination IP remains stable.", ["router-a", "server"], ["router-server"], [{ label: "New frame", value: "Router MAC → server MAC" }, { label: "Destination IP", value: "203.0.113.42" }]),
      step("Deliver", "The destination removes each envelope", "The server interface accepts the frame, IP selects the upper-layer protocol, and the transport layer delivers the application bytes to the listening process.", "Decapsulation reverses the sender's wrapping order.", ["server"], [], [{ label: "Destination", value: "Reached" }, { label: "Application", value: "Request delivered" }]),
    ],
  },
  {
    id: "route-repair",
    number: "06",
    label: "Route repair",
    eyebrow: "Three-network failure",
    summary: "Diagnose a missing route to a fictional container bridge, add the specific route, and verify both directions.",
    visual: "routes",
    steps: [
      step("Observe", "Start with the routes the host already knows", "The workstation knows its connected 192.0.2.0/24 network and an ordinary default route. It has no specific knowledge of the application host's 198.51.100.0/24 container bridge.", "Read the table before changing it.", ["workstation", "application-host", "database"], [], [{ label: "Target network", value: "198.51.100.0/24" }, { label: "Specific route", value: "Missing" }], { outcome: "observed" }),
      step("Fail", "The default route sends the packet the wrong way", "Because no specific route matches, the workstation sends the packet to 192.0.2.1. That gateway has no path to the private lab network, so the packet is dropped.", "A reachable host does not imply that every network behind it is reachable.", ["workstation", "default-gateway"], ["workstation-default"], [{ label: "Selected", value: "0.0.0.0/0" }, { label: "Outcome", value: "No route beyond gateway" }], { outcome: "dropped" }),
      step("Add", "Add a specific route through the dual-homed host", "The intended route sends 198.51.100.0/24 through 192.0.2.20, an adjacent host that has an interface on both networks and forwarding enabled.", "The next hop must be locally reachable.", ["workstation", "application-host"], ["workstation-app"], [{ label: "Destination", value: "198.51.100.0/24" }, { label: "Via", value: "192.0.2.20" }], { outcome: "route-added" }),
      step("Forward", "The new route reaches the container network", "The workstation sends the packet to the application host, which looks up 198.51.100.42 on its connected bridge and forwards it to the database container.", "A specific route outranks the default route.", ["workstation", "application-host", "database"], ["workstation-app", "app-database"], [{ label: "Selected", value: "198.51.100.0/24" }, { label: "Outcome", value: "Forwarded to database" }], { outcome: "forwarded" }),
      step("Return", "The return path must also be valid", "The database uses 198.51.100.1 as its gateway. The application host already knows 192.0.2.0/24 through its other interface, so the reply can return to the workstation.", "Always validate both directions; routing state need not be symmetric.", ["database", "application-host", "workstation"], ["app-database", "workstation-app"], [{ label: "Reply route", value: "192.0.2.0/24 connected" }, { label: "Result", value: "Return verified" }], { outcome: "return-verified" }),
    ],
  },
  {
    id: "internet-reachability",
    number: "07",
    label: "Internet reachability",
    eyebrow: "Control plane and forwarding plane",
    summary: "Separate how routes are installed from how each router forwards an individual packet.",
    visual: "internet",
    steps: [
      step("Local", "A home route starts the journey", "The client sends a remote destination to its home gateway. DHCP may have supplied the address, prefix, and default gateway, but it does not forward this packet.", "Configuration protocols contribute state; forwarding consumes it.", ["client", "home-router"], ["client-home"], [{ label: "Installed by", value: "DHCP or static config" }, { label: "Used by", value: "Local forwarding lookup" }]),
      step("Inside AS", "An interior protocol shares paths within one organization", "An ISP can use OSPF to calculate paths between its own routers and install the resulting routes in their tables.", "OSPF updates routing state inside an autonomous system.", ["as-a", "as-b"], ["as-a-b"], [{ label: "Scope", value: "Inside one AS" }, { label: "Result", value: "Routes installed" }]),
      step("Between ASes", "BGP advertises reachability between autonomous systems", "One AS advertises the prefixes it can reach. A neighboring AS applies policy and may install a route with an adjacent next hop.", "BGP exchanges reachability; it does not carry each application packet.", ["as-a", "as-b", "as-c"], ["as-a-b", "as-b-c"], [{ label: "Scope", value: "Between ASes" }, { label: "Evidence", value: "Prefix advertisement" }]),
      step("Forward", "Every router still makes its own local decision", "When traffic arrives, each router performs a local lookup and forwards to one adjacent next hop. The packet does not know the complete AS path.", "The control plane builds tables; the forwarding plane uses them packet by packet.", ["client", "home-router", "as-a", "as-b", "as-c", "server"], ["client-home", "home-as-a", "as-a-b", "as-b-c", "as-c-server"], [{ label: "Decision", value: "Local next hop" }, { label: "Repeated", value: "At every router" }]),
    ],
  },
  {
    id: "operations",
    number: "08",
    label: "Observe and debug",
    eyebrow: "Operational reasoning",
    summary: "Choose the command that answers the current question instead of collecting unrelated output.",
    visual: "operations",
    steps: [
      step("Interface", "Begin with interface and address state", "Use `ip link` to inspect interface state and `ip address` to inspect assigned addresses and prefixes.", "Prove the local foundation before blaming a remote network.", ["workstation"], [], [{ label: "Question", value: "Is the interface up and addressed?" }, { label: "Commands", value: "ip link · ip address" }]),
      step("Neighbor", "Inspect local neighbor resolution", "Use `ip neigh` when a route is correct but the adjacent next hop cannot be reached on the link.", "A neighbor failure and a route failure are different boundaries.", ["workstation", "router-a"], ["workstation-router"], [{ label: "Question", value: "Can the next hop resolve?" }, { label: "Command", value: "ip neigh" }]),
      step("Route", "Ask which route the kernel would select", "Use `ip route` and a destination-specific route lookup to inspect the chosen prefix, next hop, source address, and interface.", "The selected route is stronger evidence than assumptions about the default gateway.", ["workstation", "router-a"], ["workstation-router"], [{ label: "Question", value: "Where will this destination go?" }, { label: "Command", value: "ip route get 203.0.113.42" }]),
      step("Path", "Escalate from local state to path and application evidence", "Use ping carefully for reachability, traceroute for TTL-limited path observations, `ss` for local sockets, `curl` for HTTP behavior, and packet capture to correlate headers with the model.", "Each tool answers a narrower question; none alone proves the whole network.", ["workstation", "router-a", "server"], ["workstation-router", "router-server"], [{ label: "Path", value: "traceroute · capture" }, { label: "Application", value: "ss · curl" }]),
    ],
  },
] as const;

export type EvidenceState = Readonly<{
  scenarioId: NetworkScenarioId;
  scenarioIndex: number;
  stepIndex: number;
  activeNodeIds: readonly string[];
  activeLinkIds: readonly string[];
}>;

function scenarioById(id: NetworkScenarioId): NetworkScenario {
  const scenario = NETWORK_SCENARIOS.find((candidate) => candidate.id === id);
  if (!scenario) throw new Error(`Unknown application-owned networking scenario: ${id}`);
  return scenario;
}

function evidenceAt(scenarioId: NetworkScenarioId, requestedStep: number): EvidenceState {
  const scenarioIndex = NETWORK_SCENARIOS.findIndex((scenario) => scenario.id === scenarioId);
  const scenario = scenarioById(scenarioId);
  const stepIndex = Math.max(0, Math.min(Math.round(requestedStep), scenario.steps.length - 1));
  const evidence = scenario.steps[stepIndex];
  return { scenarioId, scenarioIndex, stepIndex, activeNodeIds: evidence.activeNodeIds, activeLinkIds: evidence.activeLinkIds };
}

export function createInitialEvidence(): EvidenceState {
  return evidenceAt(NETWORK_SCENARIOS[0].id, 0);
}

export function selectScenario(_current: EvidenceState, scenarioId: NetworkScenarioId): EvidenceState {
  return evidenceAt(scenarioId, 0);
}

export function selectEvidenceStep(
  current: EvidenceState,
  stepIndex: number,
  scenarioId: NetworkScenarioId = current.scenarioId,
): EvidenceState {
  return evidenceAt(scenarioId, stepIndex);
}

export function nextEvidence(current: EvidenceState): EvidenceState {
  return evidenceAt(current.scenarioId, current.stepIndex + 1);
}

export function previousEvidence(current: EvidenceState): EvidenceState {
  return evidenceAt(current.scenarioId, current.stepIndex - 1);
}

export function evidenceScenario(current: EvidenceState): NetworkScenario {
  return scenarioById(current.scenarioId);
}

export function evidenceStep(current: EvidenceState): EvidenceStep {
  return evidenceScenario(current).steps[current.stepIndex];
}
