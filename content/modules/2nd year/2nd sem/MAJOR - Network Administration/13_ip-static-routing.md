# IP Static Routing
<!-- subject: Network Administration | year: 2nd -->

<!-- kind: content -->
## Introduction
Static routing allows an administrator to manually define paths to destination networks. Static routes are useful in small networks, stub networks, backup paths, and situations where predictable routing is required.

<!-- kind: content -->
## Learning Goals
By the end of this module, you should be able to:

- Describe different types of static routes.
- Configure IPv4 and IPv6 static routes.
- Compare next-hop, directly connected, and fully specified static routes.
- Configure default static routes.
- Configure floating static routes.
- Configure static host routes.
- Verify static route operation.

<!-- kind: content -->
## Types of Static Routes
Common static route types include:

- **Standard static route:** route to a specific remote network.
- **Default static route:** route used when no more specific route matches.
- **Floating static route:** backup route with a higher administrative distance.
- **Static host route:** route to one specific host address.
- **Summary static route:** route that represents multiple networks with one entry.

<!-- kind: content -->
## Next-Hop Options
A static route can identify the path in different ways:

- **Next-hop route:** specifies the next router IP address.
- **Directly connected route:** specifies the exit interface.
- **Fully specified route:** specifies both exit interface and next-hop address.

On multiaccess networks such as Ethernet, a fully specified static route can reduce ambiguity because the router knows both the outgoing interface and the next-hop address.

<!-- kind: content -->
## IPv4 and IPv6 Static Route Commands
IPv4 syntax:

```text
ip route destination-network subnet-mask {next-hop-ip | exit-interface} [administrative-distance]
```

IPv6 syntax:

```text
ipv6 route destination-prefix/prefix-length {next-hop-ipv6 | exit-interface} [administrative-distance]
```

IPv6 routing must be enabled on the router with `ipv6 unicast-routing` for IPv6 forwarding.

<!-- kind: activity -->
## Activity: Configure IPv4 Next-Hop Static Routes
Topology idea:

- R1 LAN: `192.168.10.0/24`
- R2 LAN: `192.168.20.0/24`
- R1-to-R2 transit: `10.0.12.0/30`
- R2 transit address: `10.0.12.2`

On R1, route to R2 LAN:

```text
R1# configure terminal
R1(config)# ip route 192.168.20.0 255.255.255.0 10.0.12.2
R1(config)# end
R1# show ip route static
```

<!-- kind: activity -->
## Activity: Configure IPv6 Next-Hop Static Routes
Example:

- R1 LAN: `2001:db8:acad:10::/64`
- R2 LAN: `2001:db8:acad:20::/64`
- R2 transit address: `2001:db8:acad:12::2`

```text
R1# configure terminal
R1(config)# ipv6 unicast-routing
R1(config)# ipv6 route 2001:db8:acad:20::/64 2001:db8:acad:12::2
R1(config)# end
R1# show ipv6 route static
```

<!-- kind: content -->
## Directly Connected Static Routes
A directly connected static route uses only the exit interface. This can work well on point-to-point links. On Ethernet links, it may cause extra address resolution behavior because many devices can exist on the same segment.

<!-- kind: activity -->
## Activity: Configure Directly Connected Static Routes
```text
R1# configure terminal
R1(config)# ip route 192.168.20.0 255.255.255.0 serial 0/1/0
R1(config)# ipv6 route 2001:db8:acad:20::/64 serial 0/1/0
R1(config)# end
```

<!-- kind: content -->
## Fully Specified Static Routes
A fully specified static route includes both the exit interface and the next-hop address. This is especially useful on Ethernet links.

<!-- kind: activity -->
## Activity: Configure Fully Specified Static Routes
```text
R1# configure terminal
R1(config)# ip route 192.168.20.0 255.255.255.0 gigabitEthernet 0/0/0 10.0.12.2
R1(config)# ipv6 route 2001:db8:acad:20::/64 gigabitEthernet 0/0/0 2001:db8:acad:12::2
R1(config)# end
```

<!-- kind: content -->
## Verify a Static Route
A configured static route should appear in the routing table if the next hop or exit interface is reachable.

<!-- kind: activity -->
## Activity: Static Route Verification
```text
R1# show ip route static
R1# show ipv6 route static
R1# show running-config | include ^ip route|^ipv6 route
R1# ping 192.168.20.1
R1# ping 2001:db8:acad:20::1
R1# traceroute 192.168.20.1
```

If the route does not appear, check interface status, next-hop reachability, and command syntax.

<!-- kind: content -->
## Default Static Routes
A default static route is used when no more specific route exists. It is commonly configured on edge routers or stub routers.

IPv4 default route:

```text
ip route 0.0.0.0 0.0.0.0 next-hop-ip
```

IPv6 default route:

```text
ipv6 route ::/0 next-hop-ipv6
```

<!-- kind: activity -->
## Activity: Configure Default Static Routes
```text
R1# configure terminal
R1(config)# ip route 0.0.0.0 0.0.0.0 203.0.113.1
R1(config)# ipv6 route ::/0 2001:db8:acad:edge::1
R1(config)# end
R1# show ip route | include Gateway|S\*
R1# show ipv6 route ::/0
```

<!-- kind: content -->
## Floating Static Routes
A floating static route is a backup route. It has a higher administrative distance than the primary route, so it is used only if the preferred route disappears from the routing table.

<!-- kind: activity -->
## Activity: Configure a Floating Static Route
Primary route uses `10.0.12.2`. Backup route uses `10.0.13.2` with administrative distance 5.

```text
R1# configure terminal
R1(config)# ip route 192.168.20.0 255.255.255.0 10.0.12.2
R1(config)# ip route 192.168.20.0 255.255.255.0 10.0.13.2 5
R1(config)# end
R1# show ip route 192.168.20.0
```

Test by shutting down the primary path in a lab and checking whether the backup route appears.

<!-- kind: content -->
## Host Routes
A host route points to one exact host. In IPv4, host routes use a `/32` mask. In IPv6, host routes use `/128`.

Routers may automatically install local host routes for their own interface addresses. Administrators can also configure static host routes for specific devices.

<!-- kind: activity -->
## Activity: Configure Static Host Routes
IPv4 host route:

```text
R1# configure terminal
R1(config)# ip route 192.168.20.50 255.255.255.255 10.0.12.2
R1(config)# end
```

IPv6 host route:

```text
R1# configure terminal
R1(config)# ipv6 route 2001:db8:acad:20::50/128 2001:db8:acad:12::2
R1(config)# end
```

<!-- kind: content -->
## IPv6 Static Route with Link-Local Next Hop
IPv6 link-local addresses are only unique on a local link. When using a link-local address as the next hop, specify the exit interface so the router knows which link the address belongs to.

<!-- kind: activity -->
## Activity: Configure IPv6 Route Using Link-Local Next Hop
```text
R1# configure terminal
R1(config)# ipv6 route 2001:db8:acad:20::/64 gigabitEthernet 0/0/0 fe80::2
R1(config)# end
R1# show ipv6 route static
```

<!-- kind: content -->
## Static Routing Troubleshooting
Check these items when a static route fails:

- Is the destination network and mask/prefix correct?
- Is the next-hop address reachable?
- Is the exit interface up/up?
- Is IPv6 unicast routing enabled for IPv6 routes?
- Is a more specific route overriding the expected route?
- Is the return path configured on the remote router?
- Are ACLs or firewalls blocking tests?

<!-- kind: activity -->
## Activity: End-to-End Static Routing Lab
Build a two-router topology and complete these tasks:

1. Configure IPv4 and IPv6 addresses on all router interfaces.
2. Configure static routes to each remote LAN.
3. Configure default routes if one router represents an internet edge.
4. Verify routing tables.
5. Ping from LAN to LAN.
6. Remove the primary route and test a floating static backup.
7. Document the final routing table.

<!-- kind: content -->
## Summary
Static routes manually define paths through the network. They can point to a next hop, an exit interface, or both. Default routes handle unknown destinations, floating static routes provide backups, and host routes target individual devices.
