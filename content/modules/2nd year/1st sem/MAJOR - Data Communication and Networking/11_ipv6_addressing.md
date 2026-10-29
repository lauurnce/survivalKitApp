# IPv6 Addressing
<!-- subject: Data Communications and Networking | year: 2nd -->


<!-- kind: content -->
## Introduction

IPv6 was developed to solve IPv4 address exhaustion and to improve long-term internet growth. IPv6 uses 128-bit addresses, which provide a much larger address space than IPv4.

<!-- kind: content -->
## IPv4 Issues

IPv4 has a limited number of addresses. Techniques such as NAT and private addressing helped extend IPv4 usage, but they did not remove the need for a larger addressing system. IPv6 provides enough address space for modern networks, mobile devices, cloud systems, and future growth.

<!-- kind: content -->
## IPv6 Address Representation

An IPv6 address is written in hexadecimal and divided into eight groups called hextets.

Example:

```text
2001:0db8:0000:0001:0000:0000:0000:000A
```

Each hextet represents 16 bits.

<!-- kind: content -->
## Rule 1: Omit Leading Zeros

Leading zeros in a hextet may be removed.

```text
2001:0db8:0000:0001:0000:0000:0000:000A
2001:db8:0:1:0:0:0:A
```

<!-- kind: content -->
## Rule 2: Use Double Colon

One continuous sequence of all-zero hextets may be replaced with `::`. This shortcut can be used only once in an address.

```text
2001:db8:0:1:0:0:0:A
2001:db8:0:1::A
```

Using `::` more than once would make the address ambiguous.

<!-- kind: content -->
## IPv6 Address Types

| Type | Purpose |
|---|---|
| Global Unicast Address (GUA) | Publicly routable IPv6 address. |
| Link-Local Address (LLA) | Used on the local link; not routed beyond it. |
| Multicast Address | Sent to a group of IPv6 devices. |
| Anycast Address | Assigned to multiple devices; traffic goes to the nearest one according to routing. |

IPv6 does not use broadcast. Multicast and Neighbor Discovery provide functions that replace many broadcast uses.

<!-- kind: content -->
## IPv6 Global Unicast Address Structure

A typical IPv6 GUA contains:

| Part | Purpose |
|---|---|
| Global routing prefix | Assigned by provider or organization; identifies the larger network. |
| Subnet ID | Identifies subnets inside the organization. |
| Interface ID | Identifies a specific interface on a subnet. |

<!-- kind: content -->
## IPv6 Link-Local Address

A link-local address is required on IPv6-enabled interfaces. It is used for communication on the same local link, including neighbor discovery and routing protocol communication.

Link-local addresses commonly begin with:

```text
fe80::/10
```

<!-- kind: content -->
## Static IPv6 Configuration

An IPv6 address can be configured manually. A device may also use automatic methods for address creation.

<!-- kind: activity -->
## Static IPv6 Configuration Example

```text
R1# configure terminal
R1(config)# ipv6 unicast-routing
R1(config)# interface gigabitEthernet 0/0
R1(config-if)# ipv6 address 2001:db8:acad:1::1/64
R1(config-if)# ipv6 address fe80::1 link-local
R1(config-if)# no shutdown
R1(config-if)# end
R1# show ipv6 interface brief
```

<!-- kind: content -->
## Dynamic IPv6 Addressing

IPv6 devices may create or receive addresses using methods such as Stateless Address Autoconfiguration (SLAAC), DHCPv6, or a combination of both. Routers can advertise network prefix information so hosts can create their own addresses.

<!-- kind: content -->
## IPv6 Multicast Addresses

IPv6 multicast addresses begin with `ff00::/8`. Common groups include:

| Address | Group |
|---|---|
| ff02::1 | All IPv6 nodes on the local link. |
| ff02::2 | All IPv6 routers on the local link. |

Solicited-node multicast addresses are used by Neighbor Discovery to perform efficient address resolution.

<!-- kind: activity -->
## IPv6 Compression Practice

Compress each IPv6 address.

1. `2001:0db8:0000:0000:0000:0000:0000:0001`
2. `fe80:0000:0000:0000:0202:b3ff:fe1e:8329`
3. `2001:0db8:acad:0001:0000:0000:0000:0010`

Then expand:

1. `2001:db8::5`
2. `fe80::1`
3. `2001:db8:acad:1::10`

<!-- kind: activity -->
## Review Questions

1. Why was IPv6 created?
2. Why can `::` be used only once in an IPv6 address?
3. What is the difference between a GUA and an LLA?
4. Why does IPv6 not need broadcast?
5. What command enables IPv6 routing on a Cisco router?
