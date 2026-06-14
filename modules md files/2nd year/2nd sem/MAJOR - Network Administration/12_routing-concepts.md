# Routing Concepts
<!-- subject: Network Administration | year: 2nd -->

<!-- kind: content -->
## Introduction
Routers connect different IP networks and decide where packets should go next. Routing concepts explain how routers choose paths, build routing tables, and forward packets toward their destinations.

<!-- kind: content -->
## Learning Goals
By the end of this module, you should be able to:

- Explain the two main functions of a router.
- Describe path determination and packet forwarding.
- Apply the longest prefix match rule.
- Identify route sources in a routing table.
- Explain directly connected, static, dynamic, and default routes.
- Describe administrative distance and load balancing.

<!-- kind: content -->
## Two Main Router Functions
A router performs two major tasks:

1. **Path determination:** Choose the best route to a destination network.
2. **Packet forwarding:** Move packets from the incoming interface to the correct outgoing interface or next hop.

Routers use routing tables to make these decisions.

<!-- kind: content -->
## Path Determination
When a packet arrives, the router checks the destination IP address and searches the routing table for the best matching route. A route may point to an exit interface, a next-hop IP address, or both.

The best match is not always the route with the smallest network. It is the route with the **longest matching prefix**.

<!-- kind: content -->
## Longest Prefix Match
If multiple routes match a destination, the router chooses the most specific match. A longer prefix length means more network bits match.

Example IPv4 routing entries:

| Route | Prefix Length |
|---|---|
| `0.0.0.0/0` | least specific default route |
| `192.168.0.0/16` | broad private network route |
| `192.168.10.0/24` | more specific LAN route |
| `192.168.10.50/32` | host route |

For destination `192.168.10.50`, the `/32` route wins if present. If not, `/24` beats `/16`, and `/16` beats `/0`.

<!-- kind: activity -->
## Activity: Longest Match Practice
Given this routing table:

```text
0.0.0.0/0 via 203.0.113.1
10.0.0.0/8 via 192.0.2.1
10.10.0.0/16 via 192.0.2.2
10.10.5.0/24 via 192.0.2.3
10.10.5.25/32 via 192.0.2.4
```

Choose the route for each destination:

1. `10.10.5.25`
2. `10.10.5.80`
3. `10.10.9.10`
4. `10.20.1.1`
5. `8.8.8.8`

<!-- kind: content -->
## IPv6 Longest Match
IPv6 uses the same longest-prefix principle. A route such as `2001:db8:acad:10::/64` is more specific than `2001:db8:acad::/48`, and both are more specific than the default route `::/0`.

<!-- kind: content -->
## Building the Routing Table
Routes can enter the routing table through several sources:

- directly connected interfaces,
- static route configuration,
- dynamic routing protocols,
- default route configuration,
- local host routes for interface addresses.

A route is usable only if its associated interface or next hop is reachable.

<!-- kind: content -->
## Packet Forwarding Decision Process
A simplified forwarding process is:

1. Receive a frame on an interface.
2. Remove the Layer 2 header.
3. Inspect the destination IP address.
4. Find the best matching route.
5. Decrement TTL for IPv4 or Hop Limit for IPv6.
6. Re-encapsulate the packet in a new Layer 2 frame for the outgoing link.
7. Forward the frame out the selected interface.

<!-- kind: content -->
## Packet Forwarding Mechanisms
Cisco routers have used different forwarding methods over time:

- **Process switching:** CPU handles packet decisions individually.
- **Fast switching:** A route cache speeds up repeated flows.
- **Cisco Express Forwarding (CEF):** Uses optimized forwarding information structures for efficient forwarding.

Modern Cisco devices commonly use CEF.

<!-- kind: activity -->
## Activity: Basic Router Verification
```text
R1# show ip interface brief
R1# show ipv6 interface brief
R1# show interfaces
R1# show ip route
R1# show ipv6 route
R1# show running-config | section interface
```

Answer:

1. Which interfaces are up/up?
2. Which routes are directly connected?
3. Is there a default route?
4. Which interface would traffic use to reach a remote network?

<!-- kind: content -->
## Route Sources
Routing tables identify how a route was learned. Common codes include:

- **C:** directly connected network,
- **L:** local interface address,
- **S:** static route,
- **O:** OSPF route,
- **D:** EIGRP route,
- **R:** RIP route,
- **B:** BGP route.

Exact codes depend on platform and enabled protocols.

<!-- kind: content -->
## Directly Connected Networks
When a router interface is configured with an IP address and is up/up, the connected network is installed in the routing table. A local host route for the interface address is often installed as well.

<!-- kind: content -->
## Static Routes
A static route is manually configured by an administrator. Static routes are predictable and efficient, but they do not automatically adapt to topology changes unless additional tracking or floating static routes are used.

<!-- kind: content -->
## Dynamic Routing Protocols
Dynamic routing protocols allow routers to exchange route information and adapt to changes. Examples include OSPF, EIGRP, RIP, IS-IS, and BGP. Dynamic routing is useful when networks are larger or change frequently.

<!-- kind: content -->
## Default Route
A default route is used when no more specific route matches the destination. It is commonly used to send unknown traffic toward an upstream router or internet edge.

IPv4 default route: `0.0.0.0/0`  
IPv6 default route: `::/0`

<!-- kind: content -->
## Administrative Distance
Administrative distance measures the trustworthiness of a route source. When two routes to the same destination have the same prefix length but different sources, the route with the lower administrative distance is preferred.

For example, a directly connected route is usually preferred over a static route, and a static route is usually preferred over many dynamic routes.

<!-- kind: content -->
## Static or Dynamic Routing?
Static routing is useful for:

- small networks,
- stub networks,
- default routes,
- backup routes,
- predictable paths.

Dynamic routing is useful for:

- larger networks,
- redundant topologies,
- frequent changes,
- automatic convergence.

Many real networks use both.

<!-- kind: content -->
## Best Path and Load Balancing
Routers choose the best path using routing information such as prefix length, administrative distance, and routing protocol metric. If multiple equal-cost routes exist, the router may load balance traffic across them.

<!-- kind: activity -->
## Activity: Route Source Identification
Look at sample route entries and identify the source:

```text
C    192.168.10.0/24 is directly connected, GigabitEthernet0/0/0
L    192.168.10.1/32 is directly connected, GigabitEthernet0/0/0
S    192.168.30.0/24 [1/0] via 192.168.20.2
O    10.1.0.0/16 [110/20] via 10.0.0.2
S*   0.0.0.0/0 [1/0] via 203.0.113.1
```

Questions:

1. Which route is directly connected?
2. Which one is a host route?
3. Which one is a default route?
4. Which one was learned by OSPF?

<!-- kind: content -->
## Summary
Routing is the process of choosing paths and forwarding packets between networks. Routers use longest prefix match, route sources, metrics, and administrative distance to decide where traffic should go.
