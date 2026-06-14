# Ethernet Switching
<!-- subject: Data Communications and Networking | year: 2nd -->


<!-- kind: content -->
## Introduction

Ethernet is the most common LAN technology. Switches use Ethernet frame information to forward data efficiently between devices on the same local network.

<!-- kind: content -->
## Ethernet Frames

An Ethernet frame contains control information and the data being delivered. Important frame fields include the destination MAC address, source MAC address, type/length information, payload, and error-checking field.

Ethernet uses the Frame Check Sequence (FCS) to help detect damaged frames. If a frame fails the check, it is discarded.

<!-- kind: content -->
## Ethernet MAC Address

A MAC address is a Layer 2 address assigned to a network interface. It is commonly written as 12 hexadecimal digits, often grouped in pairs.

Example:

```text
00-1A-2B-3C-4D-5E
```

The first part of a MAC address identifies the organization that assigned the address, while the remaining part identifies the specific interface value assigned by that organization.

MAC addresses are used for local network delivery. They do not replace IP addresses; instead, they work with IP addresses during communication.

<!-- kind: content -->
## Unicast, Broadcast, and Multicast MAC Addresses

| Address Type | Purpose |
|---|---|
| Unicast | Identifies one receiving interface. |
| Broadcast | Sent to all devices in the local broadcast domain. |
| Multicast | Sent to a selected group of devices. |

An Ethernet broadcast destination MAC address is:

```text
FF-FF-FF-FF-FF-FF
```

<!-- kind: content -->
## The MAC Address Table

A switch learns MAC addresses by reading the source MAC address of incoming frames. It records which MAC address is reachable through which switch port.

When a switch receives a frame:

1. It learns the source MAC address and incoming port.
2. It checks the destination MAC address.
3. If the destination is known, it forwards the frame only out the correct port.
4. If the destination is unknown, it floods the frame out other ports in the same VLAN.
5. Broadcast frames are flooded to all ports in the broadcast domain except the receiving port.

<!-- kind: content -->
## Switching Methods

Switches may use different forwarding methods.

| Method | Description |
|---|---|
| Store-and-forward | Receives the full frame and checks it before forwarding. |
| Cut-through | Begins forwarding after reading enough of the frame to identify the destination. |

Store-and-forward provides better error checking. Cut-through can reduce latency, but it may forward damaged frames.

<!-- kind: content -->
## Duplex, Speed, and Auto-MDIX

Switch interfaces can operate at different speeds, such as 100 Mbps, 1 Gbps, or higher. Modern devices usually negotiate speed and duplex automatically.

**Auto-MDIX** allows a switch port to adjust automatically for straight-through or crossover cable requirements. This simplifies cabling in many modern networks.

<!-- kind: activity -->
## MAC Table Observation Lab

Use these commands on a Cisco switch to observe switching behavior.

```text
S1# show mac address-table
S1# clear mac address-table dynamic
S1# show interfaces status
S1# show interfaces fastEthernet 0/1
```

Suggested steps:

1. Display the MAC address table.
2. Ping between two connected hosts.
3. Display the MAC address table again.
4. Identify which MAC addresses were learned on which ports.

<!-- kind: activity -->
## Switching Decision Exercise

A switch receives a frame on port Fa0/1 with source MAC `AA-AA-AA-AA-AA-AA` and destination MAC `BB-BB-BB-BB-BB-BB`.

1. What will the switch learn?
2. What will it do if `BB-BB-BB-BB-BB-BB` is already in the MAC table?
3. What will it do if the destination is unknown?
4. What will it do if the destination is `FF-FF-FF-FF-FF-FF`?

<!-- kind: activity -->
## Review Questions

1. What information does a switch use to make forwarding decisions?
2. How does a switch learn MAC addresses?
3. What is the difference between known unicast and unknown unicast traffic?
4. Why are broadcasts flooded?
5. What problem does Auto-MDIX solve?
