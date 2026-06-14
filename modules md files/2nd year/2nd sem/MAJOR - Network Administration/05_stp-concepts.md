# STP Concepts
<!-- subject: Network Administration | year: 2nd -->

<!-- kind: content -->
## Introduction
Redundant switch links improve availability, but they can also create Layer 2 loops. The Spanning Tree Protocol (STP) prevents loops by placing some redundant switch ports into a blocking state while keeping backup paths available.

<!-- kind: content -->
## Learning Goals
By the end of this module, you should be able to:

- Explain why Layer 2 redundancy can create loops.
- Describe broadcast storms and MAC address instability.
- Explain how STP creates a loop-free topology.
- Identify root bridge, root ports, designated ports, and alternate ports.
- Compare STP and RSTP concepts.
- Explain PortFast and BPDU Guard.

<!-- kind: content -->
## Redundancy in Layer 2 Networks
Redundant links are useful because they provide backup paths when a cable, port, or switch fails. However, Ethernet frames do not have a time-to-live field like IP packets. If a Layer 2 loop exists, frames can circulate indefinitely.

Problems caused by Layer 2 loops include:

- repeated broadcast frames,
- duplicate frames arriving at hosts,
- unstable MAC address table entries,
- high CPU and bandwidth usage,
- network-wide outages from broadcast storms.

<!-- kind: content -->
## Broadcast Storms
A broadcast storm occurs when broadcasts are endlessly replicated through a looped Layer 2 topology. Because switches flood broadcasts, each loop can multiply the amount of traffic. The network may become unusable even though the physical links are still up.

<!-- kind: content -->
## Purpose of STP
STP builds a logical tree topology from a physical topology that may contain redundant links. It keeps selected ports forwarding and places other ports into a non-forwarding state. If an active path fails, STP can recalculate and activate a backup path.

<!-- kind: content -->
## How STP Builds a Loop-Free Topology
STP uses Bridge Protocol Data Units (BPDUs) exchanged between switches. From these messages, switches choose:

1. the **root bridge**,
2. each non-root switch's **root port**,
3. each segment's **designated port**,
4. any **alternate or blocked ports** needed to prevent loops.

<!-- kind: content -->
## Root Bridge Election
The root bridge is the reference point for the spanning tree. The switch with the lowest Bridge ID becomes the root bridge.

The Bridge ID includes:

- bridge priority,
- extended system ID, often related to VLAN ID,
- switch MAC address.

Lower values win. Administrators can influence the root bridge by setting bridge priority.

<!-- kind: activity -->
## Activity: Set the Root Bridge
Make a switch the preferred root bridge for VLAN 10:

```text
S1# configure terminal
S1(config)# spanning-tree vlan 10 root primary
S1(config)# end
S1# show spanning-tree vlan 10
```

Or manually set priority:

```text
S1# configure terminal
S1(config)# spanning-tree vlan 10 priority 24576
S1(config)# end
```

**Question:** Why is it better to deliberately choose the root bridge instead of leaving it to default MAC address values?

<!-- kind: content -->
## Root Ports
Every non-root switch selects one root port. The root port is the switch's best path toward the root bridge. STP chooses it based on lowest total path cost. If costs tie, STP uses additional tiebreakers such as upstream bridge ID and port ID.

<!-- kind: content -->
## Designated Ports
Each network segment has one designated port. This port is the best forwarding path from that segment toward the root bridge. Designated ports forward traffic.

On the root bridge, all active ports are designated ports because the root bridge is already the center of the STP topology.

<!-- kind: content -->
## Alternate and Blocked Ports
An alternate port provides a backup path but does not forward regular traffic while the current topology is stable. Blocking redundant ports prevents loops while preserving backup connectivity.

<!-- kind: activity -->
## Activity: Predict STP Roles
Given three switches in a triangle:

- S1 has the lowest bridge ID.
- S2 and S3 each connect directly to S1.
- S2 and S3 also connect to each other.

Predict:

1. Which switch becomes the root bridge?
2. Which ports on S2 and S3 become root ports?
3. Which link is likely to have an alternate/blocked port?
4. What changes if the S1-to-S2 link fails?

Then verify in a lab:

```text
S1# show spanning-tree
S2# show spanning-tree
S3# show spanning-tree
```

<!-- kind: content -->
## STP Port States and Timers
Classic STP uses states such as blocking, listening, learning, forwarding, and disabled. These states help prevent loops during topology changes.

Common timers include:

- **Hello timer:** how often BPDUs are sent.
- **Forward delay:** time spent in listening and learning states.
- **Max age:** how long BPDU information is kept before being considered stale.

<!-- kind: content -->
## Per-VLAN Spanning Tree
Cisco environments often run a separate spanning tree instance per VLAN. This allows different VLANs to use different root bridges and forwarding paths. It can improve load distribution, but it also requires careful planning.

<!-- kind: content -->
## Evolution of STP
Several STP variants exist:

- **STP (802.1D):** Original spanning tree behavior.
- **PVST+/Per-VLAN STP:** Separate STP instance per VLAN in Cisco environments.
- **Rapid STP (RSTP/802.1w):** Faster convergence than classic STP.
- **Rapid PVST+:** Cisco per-VLAN implementation of rapid spanning tree behavior.
- **MST:** Maps multiple VLANs to fewer spanning tree instances.

<!-- kind: content -->
## RSTP Concepts
RSTP improves convergence by using faster state transitions and updated port roles. Common RSTP roles include root, designated, alternate, and backup. RSTP port states are simplified into discarding, learning, and forwarding.

<!-- kind: content -->
## PortFast and BPDU Guard
**PortFast** allows an edge port connected to an end device to move quickly to forwarding. It should not be used on ports connected to other switches.

**BPDU Guard** protects edge ports. If a BPDU is received on a PortFast-enabled edge port, BPDU Guard can shut the port down to prevent accidental or malicious switch connections.

<!-- kind: activity -->
## Activity: Secure an Edge Port
```text
S1# configure terminal
S1(config)# interface fastEthernet 0/10
S1(config-if)# switchport mode access
S1(config-if)# spanning-tree portfast
S1(config-if)# spanning-tree bpduguard enable
S1(config-if)# end
S1# show spanning-tree interface fastEthernet 0/10 detail
```

Enable BPDU Guard globally for PortFast ports:

```text
S1# configure terminal
S1(config)# spanning-tree portfast default
S1(config)# spanning-tree bpduguard default
S1(config)# end
```

<!-- kind: content -->
## Alternatives to STP
Some modern designs reduce reliance on STP by using Layer 3 links, routed access designs, chassis virtualization, link aggregation, or fabric technologies. Even so, STP remains important because many switched networks still need Layer 2 loop protection.

<!-- kind: content -->
## Summary
STP prevents Layer 2 loops by calculating a loop-free forwarding topology. It elects a root bridge, selects forwarding ports, and blocks redundant paths until needed. RSTP improves convergence, while PortFast and BPDU Guard help secure and speed up edge ports.
