# Switching Concepts
<!-- subject: Network Administration | year: 2nd -->

<!-- kind: content -->
## Introduction
Switches connect devices inside a local area network and forward Ethernet frames based on MAC addresses. A switch improves LAN performance by learning where devices are located and sending frames only where they need to go whenever possible.

<!-- kind: content -->
## Learning Goals
By the end of this module, you should be able to:

- Explain how Ethernet frames are forwarded by a switch.
- Describe how the MAC address table is built and used.
- Compare store-and-forward and cut-through switching.
- Distinguish between collision domains and broadcast domains.
- Explain why switches reduce congestion in modern LANs.

<!-- kind: content -->
## Switching in Networking
A switch operates mainly at Layer 2 of the OSI model. Its job is to receive Ethernet frames, examine the destination MAC address, and decide which port should forward the frame.

A switch does not need to know IP addresses to perform basic Layer 2 forwarding. Instead, it uses a MAC address table that maps learned MAC addresses to switch ports.

<!-- kind: content -->
## The Switch MAC Address Table
The MAC address table is built dynamically. Each entry usually contains:

- a learned MAC address,
- the switch port where that MAC address was last seen,
- the VLAN where the address belongs,
- an aging timer.

When a device sends a frame into the switch, the switch records the source MAC address and incoming port. This is called **learning**.

<!-- kind: content -->
## Learn and Forward Method
A switch follows a simple decision process:

1. **Learn the source.** Record the source MAC address and the port where the frame arrived.
2. **Check the destination.** Look for the destination MAC address in the MAC address table.
3. **Forward or flood.**
   - If the destination is known, forward the frame only out the matching port.
   - If the destination is unknown, flood the frame out all appropriate ports except the incoming port.
   - If the destination is a broadcast or multicast, flood it to the relevant broadcast domain.

<!-- kind: activity -->
## Activity: Observe MAC Learning
Use a small LAN with two PCs connected to a switch.

1. Clear the MAC address table if your lab environment allows it.
2. Display the table:

```text
S1# show mac address-table
```

3. Ping from PC1 to PC2.
4. Display the table again.
5. Identify which MAC address was learned on which port.

**Questions:**

- Why might the first frame be flooded?
- What changes after the switch learns the destination MAC address?

<!-- kind: content -->
## Switch Forwarding Methods
Switches can use different internal forwarding methods.

### Store-and-Forward Switching
The switch receives the complete frame before forwarding it. It can check the frame check sequence (FCS) and discard frames that fail error checking. This method adds more latency than cut-through switching but provides stronger error handling.

### Cut-Through Switching
The switch begins forwarding after reading enough of the frame to identify the destination MAC address. This can reduce latency, but the switch may forward frames before discovering that they contain errors.

A related variation is **fragment-free switching**, which waits for the first portion of the frame before forwarding to reduce the chance of forwarding collision fragments.

<!-- kind: content -->
## Collision Domains
A collision domain is a network segment where devices could interfere with each other if they transmit at the same time. In old hub-based Ethernet, all devices attached to the hub shared one collision domain.

Switches reduce collisions because each switch port is its own collision domain. When a port operates in full-duplex mode, collisions should not occur on that link.

<!-- kind: content -->
## Broadcast Domains
A broadcast domain is the set of devices that receive a Layer 2 broadcast frame. A basic Layer 2 switch forwards broadcasts to all ports in the same VLAN.

Routers and Layer 3 boundaries normally separate broadcast domains. VLANs also separate broadcast domains inside a switched network.

<!-- kind: content -->
## How Switches Reduce Network Congestion
Switches improve LAN efficiency by:

- giving each port dedicated bandwidth,
- reducing unnecessary frame forwarding when destinations are known,
- supporting full-duplex links,
- separating collision domains,
- allowing VLANs to divide broadcast traffic.

<!-- kind: activity -->
## Activity: Forwarding Decision Practice
For each case, decide what the switch does.

| Case | Switch Action |
|---|---|
| Destination MAC is known on another port | Forward only out the destination port. |
| Destination MAC is unknown | Flood out all ports in the VLAN except the incoming port. |
| Destination MAC is broadcast `ff:ff:ff:ff:ff:ff` | Flood out all ports in the VLAN except the incoming port. |
| Source MAC is not in the table | Add it to the MAC address table. |
| Destination MAC is on the same incoming port | Filter/drop the frame because it does not need to be forwarded. |

<!-- kind: content -->
## Summary
Switches make forwarding decisions using MAC addresses. They learn source addresses, forward known unicast frames efficiently, flood unknown and broadcast frames, and reduce congestion by separating collision domains. VLANs and routers are needed to control broadcast domains.
