# Address Resolution Protocol
<!-- subject: Data Communications and Networking | year: 2nd -->


<!-- kind: content -->
## Introduction

Address resolution allows a device to match a logical Layer 3 address with the Layer 2 address needed for local delivery. In IPv4, this function is handled by Address Resolution Protocol (ARP). In IPv6, similar functions are handled by Neighbor Discovery.

<!-- kind: content -->
## MAC and IP Addresses

A device on an Ethernet LAN uses two important addresses:

| Address | Layer | Purpose |
|---|---|---|
| MAC address | Layer 2 | Local delivery from one network interface to another on the same link. |
| IP address | Layer 3 | End-to-end logical addressing across networks. |

When a device sends a packet, it needs an IP address for the final destination and a MAC address for the next local hop.

<!-- kind: content -->
## Destination on the Same Network

If the destination IP address is on the same local network, the sender needs the destination host's MAC address. If it does not already know the MAC address, it uses ARP to discover it.

<!-- kind: content -->
## Destination on a Remote Network

If the destination IP address is on another network, the sender does not send the frame directly to the remote host's MAC address. Instead, it sends the frame to the default gateway's MAC address. The router then forwards the packet toward the remote network.

<!-- kind: content -->
## How ARP Works

ARP uses two basic messages:

| ARP Message | Purpose |
|---|---|
| ARP Request | Broadcast asking, “Who has this IPv4 address?” |
| ARP Reply | Unicast response containing the matching MAC address. |

Devices store resolved addresses in an ARP table or ARP cache for a limited time. This reduces the need to send repeated ARP requests.

**Diagram description:** An ARP diagram often shows one host broadcasting a request to all local devices. Only the device with the matching IPv4 address replies with its MAC address.

<!-- kind: content -->
## IPv6 Neighbor Discovery

IPv6 does not use ARP. It uses Neighbor Discovery Protocol (NDP), which relies on ICMPv6 messages.

Neighbor Discovery supports:

- Address resolution
- Router discovery
- Neighbor reachability checks
- Duplicate address detection
- Redirect messages

For address resolution, IPv6 uses Neighbor Solicitation and Neighbor Advertisement messages instead of ARP requests and replies.

<!-- kind: activity -->
## ARP Table Practice

On a host, use a command such as:

```text
arp -a
```

Then answer:

1. What IP addresses appear in the ARP table?
2. What MAC address is associated with the default gateway?
3. Why does the ARP table change over time?

<!-- kind: activity -->
## ARP Scenario

Host A has IP `192.168.1.10/24`. Its default gateway is `192.168.1.1`. It wants to communicate with `192.168.2.20`.

1. Is the destination local or remote?
2. Which IP address does Host A need to resolve to a MAC address?
3. Will Host A use the final destination's MAC address or the gateway's MAC address for the first frame?

<!-- kind: activity -->
## Review Questions

1. Why are both MAC and IP addresses needed?
2. What is the purpose of ARP?
3. What is stored in an ARP cache?
4. Why does IPv6 use Neighbor Discovery instead of ARP?
5. What is the difference between ARP Request and ARP Reply?
