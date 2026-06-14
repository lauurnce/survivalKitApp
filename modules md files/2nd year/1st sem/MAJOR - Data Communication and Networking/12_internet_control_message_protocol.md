# Internet Control Message Protocol
<!-- subject: Data Communications and Networking | year: 2nd -->


<!-- kind: content -->
## Introduction

Internet Control Message Protocol (ICMP) supports network testing and error reporting. It is used by tools such as ping and traceroute to help verify connectivity and locate problems.

<!-- kind: content -->
## ICMP Messages

ICMP messages are not used to carry normal application data. Instead, they report conditions related to packet delivery.

Common ICMP purposes include:

- Testing reachability
- Reporting unreachable destinations
- Reporting time exceeded conditions
- Supporting path testing tools

In IPv4, ICMP works with IPv4. In IPv6, ICMPv6 has additional responsibilities, including support for Neighbor Discovery.

<!-- kind: content -->
## ICMPv6 Messages

ICMPv6 supports both error reporting and informational messages. It is also essential for IPv6 functions such as:

- Router Solicitation
- Router Advertisement
- Neighbor Solicitation
- Neighbor Advertisement
- Duplicate Address Detection

Because ICMPv6 is required for many IPv6 operations, blocking it completely can break IPv6 communication.

<!-- kind: content -->
## Ping Tests

`ping` tests whether a destination can be reached. It sends Echo Request messages and waits for Echo Reply messages.

A successful ping indicates that a path exists and that the destination can respond. A failed ping does not always identify the exact problem. The issue could be addressing, routing, firewall filtering, cabling, interface status, or destination availability.

<!-- kind: activity -->
## Ping Practice

Run ping tests in this order:

```text
ping 127.0.0.1
ping <own-IP-address>
ping <default-gateway>
ping <remote-host-IP>
ping <domain-name>
```

Interpretation:

1. Loopback ping tests the local TCP/IP stack.
2. Own-address ping checks the local interface configuration.
3. Gateway ping checks local network connectivity.
4. Remote-host ping checks routing beyond the local network.
5. Domain-name ping also checks name resolution.

<!-- kind: content -->
## Traceroute Tests

`traceroute` or `tracert` shows the path packets take toward a destination by listing router hops. It relies on hop limits or TTL values and ICMP responses.

Traceroute can help identify where a path fails. Asterisks or timeouts may indicate filtering, an unreachable device, or a router that does not respond to probe messages.

<!-- kind: activity -->
## Traceroute Practice

Run a traceroute to a reachable destination.

Windows:

```text
tracert 8.8.8.8
```

Linux/macOS/Cisco-style environments:

```text
traceroute 8.8.8.8
```

Answer:

1. How many hops appear?
2. Which hop is your local default gateway?
3. Where do delays increase?
4. Are there any timeouts?

<!-- kind: activity -->
## Review Questions

1. What is ICMP used for?
2. Why is ICMPv6 important to IPv6?
3. What does ping prove and what does it not prove?
4. How does traceroute help locate network problems?
5. Why might a traceroute show asterisks even if the destination is reachable?
