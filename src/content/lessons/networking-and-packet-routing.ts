import { NETWORK_SCENARIOS } from "../../networking/scenarios.ts";
import type { LessonSection } from "../types";

export const networkingSections: LessonSection[] = [
  {
    "id": "from-signal-to-frame",
    "number": "01",
    "label": "Networking",
    "title": "From a signal to a frame",
    "introduction": "A cable carries changing signals. A network interface turns those signals into a message it can accept or discard.",
    "paragraphs": [
      "Our fictional client is 192.0.2.10/24. Its request for https://docs.example/networking starts as application data, but one local transmission requires a link-layer envelope. The documentation addresses in this chapter are reserved examples, not destinations to probe.",
      "For Ethernet, the destination MAC identifies a recipient on this link. The receiver checks the frame and its destination before delivering the enclosed protocol payload. A valid frame is evidence of one local delivery, not proof that an application received a request."
    ],
    "table": {
      "caption": "From a signal to a frame — worked evidence",
      "columns": [
        "Observation",
        "Interpretation"
      ],
      "rows": [
        [
          "Signal",
          "Electrical, optical, or radio encoding on a medium"
        ],
        [
          "Frame",
          "Destination MAC, source MAC, protocol identifier, payload, integrity check"
        ],
        [
          "NIC decision",
          "Accept a relevant unicast, subscribed multicast, or broadcast frame; discard invalid or unrelated traffic"
        ]
      ]
    },
    "references": [
      {
        "title": "RFC 1122",
        "url": "https://datatracker.ietf.org/doc/html/rfc1122"
      },
      {
        "title": "RFC 5737",
        "url": "https://datatracker.ietf.org/doc/html/rfc5737"
      }
    ],
    "visuals": [
      {
        "kind": "flow",
        "label": "From a local signal to an IP payload",
        "alternative": "A physical signal is decoded into frame bits. The NIC checks the envelope. A valid accepted frame delivers its payload to the indicated protocol.",
        "stages": [
          {
            "title": "Signal",
            "detail": "A medium carries encoded bits."
          },
          {
            "title": "Frame",
            "detail": "The link envelope identifies local recipients."
          },
          {
            "title": "NIC check",
            "detail": "Integrity and destination decide acceptance."
          },
          {
            "title": "Payload",
            "detail": "IP receives the accepted network packet."
          }
        ]
      }
    ]
  },
  {
    "id": "hubs-flood-switches-learn",
    "number": "02",
    "label": "Networking",
    "title": "Hubs flood; switches learn",
    "introduction": "A switch learns where a sender lives by observing the source address of an arriving frame.",
    "paragraphs": [
      "Imagine the client on port A, a peer on port B, and a gateway on port C. A hub repeats incoming signaling toward the other ports. A learning bridge instead records the source MAC and ingress port, then consults its forwarding database for the destination.",
      "Known unicast can go to one port. An unknown unicast destination is flooded within the applicable VLAN, excluding the ingress port. Learning reduces unnecessary delivery, but it does not turn a MAC address into an Internet-wide location."
    ],
    "table": {
      "caption": "Hubs flood; switches learn — worked evidence",
      "columns": [
        "Observation",
        "Interpretation"
      ],
      "rows": [
        [
          "Client sends on A",
          "Learn client MAC → A"
        ],
        [
          "Peer replies on B",
          "Learn peer MAC → B"
        ],
        [
          "Known peer destination",
          "Forward toward B"
        ],
        [
          "Unknown destination or broadcast",
          "Flood eligible ports in this broadcast domain"
        ]
      ]
    },
    "references": [
      {
        "title": "RFC 1122",
        "url": "https://datatracker.ietf.org/doc/html/rfc1122"
      }
    ],
    "questions": [
      "What changes after the first reply, and what happens when a learned entry ages out?"
    ]
  },
  {
    "id": "why-mac-does-not-scale",
    "number": "03",
    "label": "Networking",
    "title": "Why MAC addresses do not describe a global route",
    "introduction": "A flat identifier tells you which interface, but does not describe a hierarchy of reachable networks.",
    "paragraphs": [
      "If every new machine required every distant switch to learn one more individual location, both table state and flooded discovery would grow with the population. Dividing links into broadcast domains limits that local work.",
      "IP prefixes describe sets of destinations. A router can use one aggregate route for many addresses, provided the aggregate correctly represents reachability. More-specific exceptions remain possible; summarization is a routing claim, not a promise that every address inside it is currently alive."
    ],
    "table": {
      "caption": "Why MAC addresses do not describe a global route — worked evidence",
      "columns": [
        "Observation",
        "Interpretation"
      ],
      "rows": [
        [
          "Flat MAC learning",
          "Per-address location learned from local traffic"
        ],
        [
          "Broadcast boundary",
          "Discovery stays inside its link or VLAN"
        ],
        [
          "IP prefix",
          "A leading-bit pattern represents a destination set"
        ],
        [
          "Aggregation",
          "Several compatible destination sets can share one announcement"
        ]
      ]
    },
    "references": [
      {
        "title": "RFC 4632",
        "url": "https://datatracker.ietf.org/doc/html/rfc4632"
      }
    ]
  },
  {
    "id": "ip-prefixes-and-subnets",
    "number": "04",
    "label": "Networking",
    "title": "Read an IPv4 prefix as a bit boundary",
    "introduction": "192.0.2.10/24 means that the first 24 bits identify the configured network prefix.",
    "paragraphs": [
      "For this /24 example, the mask is 255.255.255.0. Applying it to both 192.0.2.10 and 192.0.2.20 produces 192.0.2.0. Applying it to 203.0.113.42 produces a different network value.",
      "The dot between octets is formatting, not a routing boundary. A /25 splits the final octet too. Always compare masked unsigned values rather than comparing address strings or assuming all subnets are /24."
    ],
    "table": {
      "caption": "Read an IPv4 prefix as a bit boundary — worked evidence",
      "columns": [
        "Observation",
        "Interpretation"
      ],
      "rows": [
        [
          "Address",
          "192.0.2.10 = 11000000 00000000 00000010 00001010"
        ],
        [
          "/24 mask",
          "11111111 11111111 11111111 00000000"
        ],
        [
          "Address AND mask",
          "11000000 00000000 00000010 00000000"
        ],
        [
          "Host bits",
          "The remaining eight bits vary within this prefix"
        ]
      ]
    },
    "references": [
      {
        "title": "RFC 4632",
        "url": "https://datatracker.ietf.org/doc/html/rfc4632"
      }
    ],
    "questions": [
      "Would 192.0.2.10/25 and 192.0.2.200 fall in the same prefix?"
    ]
  },
  {
    "id": "local-or-next-hop",
    "number": "05",
    "label": "Networking",
    "title": "Choose direct delivery or a next hop",
    "introduction": "The host chooses a route before it decides which neighbor MAC to resolve.",
    "paragraphs": [
      "A connected route covers 192.0.2.0/24. A packet for 192.0.2.20 can therefore be delivered directly on that link. The remote documentation server, 203.0.113.42, requires another route; in this example the default sends it through 192.0.2.1.",
      "The gateway must itself be reachable on the selected link. Sending toward a next hop does not change the IP destination into the gateway address. It changes the recipient of the local envelope."
    ],
    "table": {
      "caption": "Choose direct delivery or a next hop — worked evidence",
      "columns": [
        "Observation",
        "Interpretation"
      ],
      "rows": [
        [
          "192.0.2.20",
          "Connected route; resolve the peer"
        ],
        [
          "203.0.113.42",
          "Default route; resolve 192.0.2.1"
        ],
        [
          "No connected or default match",
          "No route; do not invent a next hop"
        ]
      ]
    },
    "references": [
      {
        "title": "RFC 1122",
        "url": "https://datatracker.ietf.org/doc/html/rfc1122"
      }
    ]
  },
  {
    "id": "arp-resolves-a-neighbor",
    "number": "06",
    "label": "Networking",
    "title": "ARP resolves the local neighbor",
    "introduction": "For the remote request, the client asks for the gateway’s MAC, not the documentation server’s MAC.",
    "paragraphs": [
      "A valid neighbor-cache entry can avoid an exchange. On a miss, the client broadcasts an ARP request on its link. The owner of the requested IPv4 address replies with its link-layer address, allowing the client to update its neighbor mapping and send the waiting frame.",
      "The broadcast does not cross an ordinary router. A router repeats resolution on its own outgoing link when necessary. ARP belongs to this IPv4 Ethernet example; IPv6 uses Neighbor Discovery rather than ARP."
    ],
    "table": {
      "caption": "ARP resolves the local neighbor — worked evidence",
      "columns": [
        "Observation",
        "Interpretation"
      ],
      "rows": [
        [
          "Cache hit",
          "Use the existing neighbor mapping"
        ],
        [
          "Cache miss",
          "Who has 192.0.2.1? Tell 192.0.2.10"
        ],
        [
          "Reply",
          "192.0.2.1 identifies its MAC"
        ],
        [
          "Remote destination",
          "IP destination remains 203.0.113.42"
        ]
      ]
    },
    "references": [
      {
        "title": "RFC 826",
        "url": "https://datatracker.ietf.org/doc/html/rfc826"
      },
      {
        "title": "RFC 4861",
        "url": "https://datatracker.ietf.org/doc/html/rfc4861"
      }
    ]
  },
  {
    "id": "encapsulation-without-magic",
    "number": "07",
    "label": "Networking",
    "title": "Keep the layers separate",
    "introduction": "One application intent can travel through different transport choices while routers still forward IP packets.",
    "paragraphs": [
      "HTTP/1.1 and HTTP/2 commonly use TCP; HTTP/3 uses QUIC over UDP. Encryption and transport add their own structure. The diagram is a boundary model, not a claim that readable HTTP headers appear inside every observed packet.",
      "Explore the lab below to compare link delivery, prefix decisions, neighbor resolution, protocol layers, routed delivery, route repair, Internet reachability, and operational evidence. Every state is fictional and deterministic; nothing inspects your machine."
    ],
    "table": {
      "caption": "Keep the layers separate — worked evidence",
      "columns": [
        "Observation",
        "Interpretation"
      ],
      "rows": [
        [
          "Application",
          "Document request bytes and application meaning"
        ],
        [
          "Transport",
          "TCP stream segments or UDP datagrams"
        ],
        [
          "Network",
          "IP source, destination, and lifetime"
        ],
        [
          "Link",
          "Ethernet addresses for this hop"
        ],
        [
          "Physical",
          "Signals carrying encoded frame bits"
        ]
      ]
    },
    "references": [
      {
        "title": "RFC 1122",
        "url": "https://datatracker.ietf.org/doc/html/rfc1122"
      },
      {
        "title": "RFC 791",
        "url": "https://datatracker.ietf.org/doc/html/rfc791"
      }
    ],
    "interactive": "networking"
  },
  {
    "id": "same-subnet-delivery",
    "number": "08",
    "label": "Networking",
    "title": "Follow a same-subnet delivery",
    "introduction": "A packet from 192.0.2.10 to 192.0.2.20 does not need the default gateway in this topology.",
    "paragraphs": [
      "The connected route selects the local interface. The sender uses its neighbor cache or ARP to learn the peer’s MAC, then sends an Ethernet frame whose IP destination and link destination both identify the peer at their respective layers.",
      "The switch may forward a known unicast directly or flood an unknown one. It does not decrement the IP TTL merely for switching the frame. The peer removes the frame envelope and passes the IP payload to the appropriate transport implementation."
    ],
    "table": {
      "caption": "Follow a same-subnet delivery — worked evidence",
      "columns": [
        "Observation",
        "Interpretation"
      ],
      "rows": [
        [
          "Host route lookup",
          "192.0.2.0/24 is connected"
        ],
        [
          "Neighbor resolution",
          "Resolve 192.0.2.20"
        ],
        [
          "Switch forwarding",
          "Use the MAC table or flood eligible ports"
        ],
        [
          "Destination host",
          "Validate and deliver to the IP/transport stack"
        ]
      ]
    },
    "references": [
      {
        "title": "RFC 1122",
        "url": "https://datatracker.ietf.org/doc/html/rfc1122"
      },
      {
        "title": "RFC 791",
        "url": "https://datatracker.ietf.org/doc/html/rfc791"
      }
    ]
  },
  {
    "id": "cross-network-delivery",
    "number": "09",
    "label": "Networking",
    "title": "Replace the envelope at each routed link",
    "introduction": "The destination IP remains 203.0.113.42 while the Ethernet destination changes from one neighbor to the next.",
    "paragraphs": [
      "The first frame targets 192.0.2.1’s MAC. That router receives the frame, removes its link envelope, and selects an outgoing route. In our example it sends toward the adjacent 198.51.100.1 next hop using a new link-layer envelope.",
      "This is ordinary forwarding without NAT or tunneling. Those mechanisms can change addresses or add envelopes and require separate reasoning. A reverse path may follow different routers, so a successful forward lookup alone cannot prove a working conversation."
    ],
    "table": {
      "caption": "Replace the envelope at each routed link — worked evidence",
      "columns": [
        "Observation",
        "Interpretation"
      ],
      "rows": [
        [
          "Client link",
          "Source MAC: client; destination MAC: gateway"
        ],
        [
          "Transit link",
          "Source MAC: outgoing router interface; destination MAC: next hop"
        ],
        [
          "IP endpoints",
          "192.0.2.10 → 203.0.113.42, absent translation"
        ],
        [
          "Lifetime",
          "A router forwarding the packet reduces TTL"
        ]
      ]
    },
    "references": [
      {
        "title": "RFC 791",
        "url": "https://datatracker.ietf.org/doc/html/rfc791"
      },
      {
        "title": "RFC 1812",
        "url": "https://datatracker.ietf.org/doc/html/rfc1812"
      }
    ],
    "visuals": [
      {
        "kind": "timeline",
        "label": "Three links, one IP destination",
        "alternative": "The client frames toward the gateway; the router reframes toward transit; the last router frames toward the server. Without NAT, the remote IP destination remains 203.0.113.42.",
        "phases": [
          {
            "marker": "Link 1",
            "title": "Client to gateway",
            "detail": "Resolve 192.0.2.1 and send the local envelope."
          },
          {
            "marker": "Link 2",
            "title": "Router to transit",
            "detail": "Decrement TTL and use the next link’s MAC addresses."
          },
          {
            "marker": "Link 3",
            "title": "Last hop to server",
            "detail": "Resolve the destination neighbor on its own link."
          }
        ]
      }
    ]
  },
  {
    "id": "router-forwarding",
    "number": "10",
    "label": "Networking",
    "title": "Treat forwarding as a sequence of checks",
    "introduction": "A router does not need to understand the document request to select the next link.",
    "paragraphs": [
      "An incoming IPv4 packet must survive header and forwarding checks. A packet whose lifetime expires cannot be forwarded indefinitely. The router uses destination reachability, resolves the outgoing neighbor if necessary, and constructs the next frame.",
      "The IP header checksum changes when TTL changes. A missing route, neighbor-resolution failure, or policy rejection can stop delivery at different boundaries. These are different failures even if the application eventually reports the same timeout."
    ],
    "table": {
      "caption": "Treat forwarding as a sequence of checks — worked evidence",
      "columns": [
        "Observation",
        "Interpretation"
      ],
      "rows": [
        [
          "Receive",
          "Validate frame and IPv4 header"
        ],
        [
          "Lifetime",
          "Drop when forwarding would expire TTL"
        ],
        [
          "Lookup",
          "Select an eligible destination route"
        ],
        [
          "Neighbor",
          "Resolve the selected adjacent recipient"
        ],
        [
          "Transmit",
          "Create a fresh link envelope"
        ]
      ]
    },
    "references": [
      {
        "title": "RFC 1812",
        "url": "https://datatracker.ietf.org/doc/html/rfc1812"
      },
      {
        "title": "RFC 791",
        "url": "https://datatracker.ietf.org/doc/html/rfc791"
      }
    ]
  },
  {
    "id": "routing-table-as-source-of-truth",
    "number": "11",
    "label": "Networking",
    "title": "Read the route fields before guessing",
    "introduction": "The route table describes what this node will try next, not a complete map of the Internet.",
    "paragraphs": [
      "A route identifies a destination prefix and forwarding information. Connected entries describe attached networks. Static configuration or routing protocols can supply other entries. A host route describes one address; a default is the least-specific fallback.",
      "The worked selector below compares prefix length and then metric among equally specific eligible routes. Real systems also apply policy and route-source preference. Do not compare metrics from unrelated protocols as though they were one universal distance."
    ],
    "table": {
      "caption": "Read the route fields before guessing — worked evidence",
      "columns": [
        "Observation",
        "Interpretation"
      ],
      "rows": [
        [
          "192.0.2.0/24 · connected",
          "Directly attached, eth0, metric 0"
        ],
        [
          "203.0.0.0/16 · learned",
          "Via adjacent transit neighbor, eth1, metric 20"
        ],
        [
          "203.0.113.0/24 · static",
          "More-specific destination set, eth1, metric 50"
        ],
        [
          "203.0.113.42/32 · host",
          "One destination; most specific"
        ],
        [
          "0.0.0.0/0 · default",
          "Fallback only when no more-specific route applies"
        ]
      ]
    },
    "references": [
      {
        "title": "RFC 1812",
        "url": "https://datatracker.ietf.org/doc/html/rfc1812"
      },
      {
        "title": "RFC 4632",
        "url": "https://datatracker.ietf.org/doc/html/rfc4632"
      }
    ]
  },
  {
    "id": "longest-prefix-wins",
    "number": "12",
    "label": "Networking",
    "title": "Longest matching prefix wins",
    "introduction": "A /32 host route beats a matching /24, even when the /24 has a lower metric.",
    "paragraphs": [
      "Mask the destination and each route prefix, keep matching candidates, and select the greatest prefix length. If equally specific candidates remain, this educational selector chooses the smallest metric. With no candidate, it returns a typed no-route result.",
      "The executable model validates canonical IPv4 input, rejects invalid masks, bounds the route count, and uses unsigned arithmetic. Tests cover /0, /32, high-bit addresses, overlap, ties, and no-route outcomes."
    ],
    "table": {
      "caption": "Longest matching prefix wins — worked evidence",
      "columns": [
        "Observation",
        "Interpretation"
      ],
      "rows": [
        [
          "Destination",
          "203.0.113.42"
        ],
        [
          "Matching lengths",
          "/0, /16, /24, /32"
        ],
        [
          "Selected",
          "/32, regardless of a less-specific route’s metric"
        ],
        [
          "Two /32 entries",
          "Use the smaller metric in this simplified model"
        ]
      ]
    },
    "references": [
      {
        "title": "RFC 4632",
        "url": "https://datatracker.ietf.org/doc/html/rfc4632"
      }
    ],
    "code": {
      "filename": "fictional-example.txt",
      "source": "// Educational selection over already validated routes\nconst matches = routes.filter(route => matchesPrefix(destination, route));\nconst selected = matches.sort((a, b) =>\n  b.prefixLength - a.prefixLength || a.metric - b.metric\n)[0];\n// No selected route means no-route; never invent a default."
    },
    "codeFirst": true
  },
  {
    "id": "when-the-default-route-fails",
    "number": "13",
    "label": "Networking",
    "title": "Repair a missing specific route",
    "introduction": "A default route can be valid for Internet traffic and wrong for a local container network.",
    "paragraphs": [
      "Our second topology places an application host at 192.0.2.20 and a database behind its 198.51.100.0/24 bridge. The workstation’s ordinary gateway is 192.0.2.1. Without a specific route, database traffic goes to that ordinary gateway instead of the application host.",
      "A route for 198.51.100.0/24 via 192.0.2.20 repairs this next-hop choice. It does not automatically enable forwarding, open a firewall, or create a return path. Verify those boundaries separately before calling the repair complete."
    ],
    "table": {
      "caption": "Repair a missing specific route — worked evidence",
      "columns": [
        "Observation",
        "Interpretation"
      ],
      "rows": [
        [
          "Before",
          "198.51.100.42 follows default via 192.0.2.1"
        ],
        [
          "Specific route",
          "198.51.100.0/24 via 192.0.2.20"
        ],
        [
          "Forwarding host",
          "192.0.2.20 must forward between its interfaces"
        ],
        [
          "Return path",
          "The database must be able to reach 192.0.2.10"
        ]
      ]
    },
    "references": [
      {
        "title": "RFC 1812",
        "url": "https://datatracker.ietf.org/doc/html/rfc1812"
      }
    ],
    "questions": [
      "Which observation would distinguish a missing route from a blocked forwarding policy?"
    ]
  },
  {
    "id": "from-lan-to-autonomous-systems",
    "number": "14",
    "label": "Networking",
    "title": "Separate reachability learning from forwarding",
    "introduction": "BGP exchanges reachability information; it does not accompany each application packet through the network.",
    "paragraphs": [
      "DHCP supplies host configuration such as an address lease. OSPF distributes intra-domain link-state information used to compute routes. BGP exchanges inter-domain reachability and path attributes under routing policy. These systems affect the state from which forwarding decisions are made.",
      "Imagine documentation prefix 203.0.113.0/24 advertised by one fictional autonomous system through a transit domain to another. Once suitable routes are installed, each router chooses its local next hop. Policy can prefer a path that is not the shortest physical route."
    ],
    "table": {
      "caption": "Separate reachability learning from forwarding — worked evidence",
      "columns": [
        "Observation",
        "Interpretation"
      ],
      "rows": [
        [
          "DHCP",
          "Host configuration"
        ],
        [
          "OSPF",
          "Link-state routing within a domain"
        ],
        [
          "BGP",
          "Reachability and policy between routing domains"
        ],
        [
          "Forwarding plane",
          "Per-packet decision using installed state"
        ]
      ]
    },
    "references": [
      {
        "title": "RFC 2131",
        "url": "https://datatracker.ietf.org/doc/html/rfc2131"
      },
      {
        "title": "RFC 2328",
        "url": "https://datatracker.ietf.org/doc/html/rfc2328"
      },
      {
        "title": "RFC 4271",
        "url": "https://datatracker.ietf.org/doc/html/rfc4271"
      }
    ]
  },
  {
    "id": "a-container-network-lab",
    "number": "15",
    "label": "Networking",
    "title": "Compare a route repair before and after",
    "introduction": "Use the fictional transcript to explain the change before attempting anything on a real system.",
    "paragraphs": [
      "The commands below are documentation only. They are not executed by the site. They describe routed access to a bridge subnet; publishing a container port on a host is a different access path and may involve translation.",
      "After the specific route changes, inspect the application host’s forwarding policy and the database’s return route. A source-preserving routed design and a masqueraded design can produce different packet captures while both appearing to reach the same service."
    ],
    "table": {
      "caption": "Compare a route repair before and after — worked evidence",
      "columns": [
        "Observation",
        "Interpretation"
      ],
      "rows": [
        [
          "Workstation",
          "192.0.2.10/24"
        ],
        [
          "Application host",
          "192.0.2.20/24 and 198.51.100.1/24"
        ],
        [
          "Database",
          "198.51.100.42/24, gateway 198.51.100.1"
        ],
        [
          "Required evidence",
          "Forward route, forwarding enabled, permitted policy, reply route"
        ]
      ]
    },
    "references": [
      {
        "title": "Docker: bridge network driver",
        "url": "https://docs.docker.com/engine/network/drivers/bridge/"
      },
      {
        "title": "Linux kernel: IP forwarding controls",
        "url": "https://docs.kernel.org/networking/ip-sysctl.html"
      }
    ],
    "code": {
      "filename": "fictional-example.txt",
      "source": "# Fictional Linux lab: preview only\nip route get 198.51.100.42\n# Before: via 192.0.2.1 dev eth0\n\n# Proposed change inside the isolated fictional lab:\nip route add 198.51.100.0/24 via 192.0.2.20\nip route get 198.51.100.42\n# After: via 192.0.2.20 dev eth0\n\n# On the database, inspect the reverse path too:\nip route get 192.0.2.10"
    },
    "codeFirst": true
  },
  {
    "id": "observe-debug-and-reason",
    "number": "16",
    "label": "Networking",
    "title": "Ask one question of each observation",
    "introduction": "A timeout is an application symptom. Work backward to the first boundary with missing evidence.",
    "paragraphs": [
      "Capture both directions at a known interface in an authorized lab. A SYN leaving one interface proves that observation point saw it; it does not prove the peer accepted it. No packet in a capture may mean the capture filter or interface is wrong. Separate absence of evidence from a demonstrated drop.",
      "Likewise, a successful ping does not prove that a TCP port, TLS negotiation, or HTTP route works. Traceroute depends on replies that routers may filter or rate-limit. Record the question, observation point, expected evidence, and remaining uncertainty."
    ],
    "table": {
      "caption": "Ask one question of each observation — worked evidence",
      "columns": [
        "Observation",
        "Interpretation"
      ],
      "rows": [
        [
          "ip address / ip link",
          "Address configuration and link state"
        ],
        [
          "ip route get DEST",
          "Selected next hop and outgoing interface"
        ],
        [
          "ip neigh",
          "Neighbor resolution state"
        ],
        [
          "ping / traceroute",
          "Reachability or responding hops, with filtering caveats"
        ],
        [
          "ss",
          "Local sockets and their state"
        ],
        [
          "curl",
          "Application-level response and transport/TLS symptoms"
        ],
        [
          "Packet capture",
          "Packets visible at this interface and filter"
        ]
      ]
    },
    "references": [
      {
        "title": "RFC 791",
        "url": "https://datatracker.ietf.org/doc/html/rfc791"
      }
    ],
    "questions": [
      "A request leaves the workstation but no reply returns. What would you inspect on the forwarding host and database before changing the application?"
    ]
  }
];

networkingSections[1].references?.push({ title: "Cisco: Unicast flooding in switched networks", url: "https://www.cisco.com/c/en/us/support/docs/switches/catalyst-6000-series-switches/23563-143.html" });
networkingSections[0].callout = { label: "Before you begin", body: "Bring the request-flow model from Chapters 01 and 06. No routing experience is assumed: start by separating one local frame from the complete application request." };
networkingSections[15].code = { filename: "fictional-capture.txt", source: `# Fictional capture at the workstation, before route repair
12:00:00 eth0 OUT Ethernet dst=gateway MAC
  IPv4 192.0.2.10 → 198.51.100.42 TTL=64 TCP 51000 → 5432 SYN
# The IP destination is correct, but the local frame targets the wrong gateway.
# After selecting the specific route via 192.0.2.20:
12:01:00 eth0 OUT Ethernet dst=application-host MAC
  IPv4 192.0.2.10 → 198.51.100.42 TTL=64 TCP 51000 → 5432 SYN
# A capture on the forwarding host's bridge sees TTL=63 and a new frame.
# SYN-ACK returning to the workstation supports a working TCP return path.
# It does not establish database authentication or query success.` };

// The complete semantic state sequence is also emitted into static lesson HTML.
const evidenceSections = [1, 3, 5, 6, 8, 12, 13, 15];
NETWORK_SCENARIOS.forEach((scenario, index) => {
  const table = networkingSections[evidenceSections[index]].table;
  scenario.steps.forEach((step, number) => table?.rows.push([
    `${scenario.label} · ${number + 1}. ${step.title}`,
    `${step.body} ${step.insight} ${step.facts.map((fact) => `${fact.label}: ${fact.value}`).join("; ")}`,
  ]));
});
