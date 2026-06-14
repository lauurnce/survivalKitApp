# Network Layer
<!-- subject: Data Communications and Networking | year: 2nd -->


<!-- kind: content -->
## Introduction

The network layer allows devices on different networks to communicate. It provides logical addressing and routing so packets can move from a source host to a destination host across one or more networks.

<!-- kind: content -->
## Network Layer Characteristics

The main protocol at this layer is IP. IP has three important characteristics:

| Characteristic | Meaning |
|---|---|
| Connectionless | IP does not establish a session before sending packets. |
| Best effort | IP does not guarantee delivery by itself. |
| Media independent | IP can work over different network media such as copper, fiber, or wireless. |

Reliability, if needed, is handled by upper-layer protocols such as TCP.

<!-- kind: content -->
## IP Encapsulation

The network layer encapsulates a transport layer segment into an IP packet. The packet includes source and destination IP addresses. These IP addresses normally remain the same from source to destination, even as the packet passes through routers.

At each hop, the data link frame changes because the local MAC addresses change. The IP packet remains focused on end-to-end delivery.

<!-- kind: content -->
## IPv4 Packet

An IPv4 packet header contains information used to deliver and handle the packet. Important fields include:

- Version
- Source IPv4 address
- Destination IPv4 address
- Time to Live (TTL)
- Protocol
- Header checksum
- Differentiated Services field for traffic handling

The TTL value is reduced by routers. If it reaches zero, the packet is discarded to prevent endless looping.

<!-- kind: content -->
## IPv6 Packet

IPv6 uses a simpler fixed-size base header compared with IPv4. Important fields include:

- Version
- Traffic Class
- Flow Label
- Payload Length
- Next Header
- Hop Limit
- Source IPv6 address
- Destination IPv6 address

The Hop Limit field in IPv6 performs a similar role to TTL in IPv4.

<!-- kind: content -->
## How a Host Routes

When a host sends data, it decides whether the destination is local or remote.

If the destination is on the same network, the host sends the frame directly to the destination MAC address. If the destination is on a different network, the host sends the frame to the default gateway's MAC address. The default gateway is usually a router interface.

<!-- kind: content -->
## Introduction to Routing

Routers connect different networks and forward packets based on destination IP addresses. A router uses its routing table to choose the best path.

A routing table may include:

- Directly connected networks
- Static routes configured by an administrator
- Dynamic routes learned from routing protocols
- A default route for unknown destinations

<!-- kind: content -->
## Static Routing

A static route is manually configured. It is useful for small networks, simple paths, backup routes, or default routes. However, static routes do not automatically adapt when the network changes.

A typical IPv4 static route format is:

```text
ip route destination-network subnet-mask next-hop-or-exit-interface
```

<!-- kind: activity -->
## Static Route Example

Configure a static route to reach network `192.168.20.0/24` through next-hop `192.168.10.2`.

```text
R1# configure terminal
R1(config)# ip route 192.168.20.0 255.255.255.0 192.168.10.2
R1(config)# end
R1# show ip route
```

<!-- kind: activity -->
## Local or Remote Decision Practice

Host A has IP address `192.168.1.10/24` and default gateway `192.168.1.1`.

For each destination, decide whether Host A sends directly to the destination or to the default gateway.

| Destination | Direct or Default Gateway? |
|---|---|
| 192.168.1.25 |  |
| 192.168.2.10 |  |
| 192.168.1.200 |  |
| 10.1.1.5 |  |

<!-- kind: activity -->
## Review Questions

1. What does the network layer do?
2. Why is IP called best effort?
3. What is the purpose of a default gateway?
4. How does a router choose where to send a packet?
5. What is one advantage and one disadvantage of static routing?
