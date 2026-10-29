# IPv4 Addressing
<!-- subject: Data Communications and Networking | year: 2nd -->


<!-- kind: content -->
## Introduction

IPv4 addressing identifies devices and networks so packets can be delivered. Understanding IPv4 structure, address types, and subnetting is essential for building and troubleshooting networks.

<!-- kind: content -->
## IPv4 Address Structure

An IPv4 address is 32 bits long and is usually written in dotted decimal format.

Example:

```text
192.168.10.25
```

Each decimal number represents 8 bits, called an octet. Therefore, an IPv4 address has four octets.

```text
192      .168      .10       .25
11000000 .10101000 .00001010 .00011001
```

A subnet mask or prefix length identifies which part of the address is the network portion and which part is the host portion.

<!-- kind: content -->
## Network, Host, and Broadcast Addresses

Each IPv4 network includes special addresses.

| Address Type | Description |
|---|---|
| Network address | Identifies the network itself. Host bits are all 0. |
| Host address | Assigned to an individual device. |
| Broadcast address | Sends to all hosts in the local IPv4 network. Host bits are all 1. |

For `192.168.1.0/24`, the network address is `192.168.1.0`, usable host addresses are `192.168.1.1` through `192.168.1.254`, and the broadcast address is `192.168.1.255`.

<!-- kind: content -->
## IPv4 Communication Types

| Type | Description |
|---|---|
| Unicast | One source sends to one destination. |
| Broadcast | One source sends to all hosts in the local network. |
| Multicast | One source sends to a selected group of receivers. |

<!-- kind: content -->
## Types of IPv4 Addresses

IPv4 addresses may be public or private.

| Private Range | Prefix |
|---|---|
| 10.0.0.0 to 10.255.255.255 | 10.0.0.0/8 |
| 172.16.0.0 to 172.31.255.255 | 172.16.0.0/12 |
| 192.168.0.0 to 192.168.255.255 | 192.168.0.0/16 |

Private addresses are used inside organizations and homes. They are not routed directly on the public internet. Network Address Translation (NAT) is commonly used when private hosts access the internet.

Other special address categories include loopback addresses, link-local addresses, and experimental or reserved ranges.

<!-- kind: content -->
## Assignment of IP Addresses

IPv4 addresses can be assigned manually or automatically.

| Method | Description |
|---|---|
| Static assignment | An administrator manually configures the address. |
| Dynamic assignment | DHCP automatically provides IP settings. |

Static addressing is common for routers, servers, printers, and infrastructure devices. DHCP is common for user devices.

<!-- kind: content -->
## Network Segmentation

Network segmentation divides a larger network into smaller subnets. Segmentation helps improve organization, security, broadcast control, and address management.

Subnetting borrows bits from the host portion to create additional network bits.

<!-- kind: content -->
## Subnetting Basics

A prefix length shows how many bits are used for the network portion.

| Prefix | Subnet Mask | Usable Hosts per Subnet |
|---|---|---|
| /24 | 255.255.255.0 | 254 |
| /25 | 255.255.255.128 | 126 |
| /26 | 255.255.255.192 | 62 |
| /27 | 255.255.255.224 | 30 |
| /28 | 255.255.255.240 | 14 |
| /29 | 255.255.255.248 | 6 |
| /30 | 255.255.255.252 | 2 |

Usable hosts are calculated as:

```text
2^(host bits) - 2
```

The subtraction accounts for the network address and broadcast address.

<!-- kind: content -->
## Subnetting Example

Requirement: Split `192.168.1.0/24` into four equal subnets.

Borrow 2 host bits because `2^2 = 4`. The new prefix is `/26`.

| Subnet | Network Address | Usable Host Range | Broadcast |
|---|---|---|---|
| 1 | 192.168.1.0/26 | 192.168.1.1 - 192.168.1.62 | 192.168.1.63 |
| 2 | 192.168.1.64/26 | 192.168.1.65 - 192.168.1.126 | 192.168.1.127 |
| 3 | 192.168.1.128/26 | 192.168.1.129 - 192.168.1.190 | 192.168.1.191 |
| 4 | 192.168.1.192/26 | 192.168.1.193 - 192.168.1.254 | 192.168.1.255 |

<!-- kind: content -->
## VLSM

Variable Length Subnet Masking (VLSM) allows different subnet sizes inside the same larger address block. This saves addresses because each subnet can be sized according to need.

A common VLSM strategy is to assign the largest subnet first, then continue with smaller requirements.

<!-- kind: activity -->
## Subnetting Practice

For each network, identify the network address, first usable address, last usable address, and broadcast address.

1. `192.168.10.0/25`
2. `192.168.10.128/26`
3. `10.1.4.0/23`
4. `172.16.5.32/27`

<!-- kind: activity -->
## VLSM Design Activity

You are given `192.168.50.0/24`. Create subnets for:

- 60 hosts
- 30 hosts
- 12 hosts
- 2 hosts

Assign the largest subnet first. List the network address, prefix, usable range, and broadcast address for each subnet.

<!-- kind: activity -->
## Review Questions

1. What is the difference between a network address and a host address?
2. Why are private IPv4 addresses used?
3. What does a subnet mask do?
4. Why does subnetting reduce broadcast size?
5. How does VLSM help conserve addresses?
