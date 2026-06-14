# DHCPv4
<!-- subject: Network Administration | year: 2nd -->

<!-- kind: content -->
## Introduction
Dynamic Host Configuration Protocol for IPv4 (DHCPv4) automatically provides hosts with IP addressing information. Instead of manually assigning addresses to every device, administrators can configure a DHCP server to lease addresses and related settings.

<!-- kind: content -->
## Learning Goals
By the end of this module, you should be able to:

- Explain the DHCPv4 client-server process.
- Describe how leases are obtained and renewed.
- Configure a Cisco IOS router as a DHCPv4 server.
- Verify DHCPv4 operation.
- Configure DHCP relay for clients on remote networks.
- Configure a router interface as a DHCP client.

<!-- kind: content -->
## DHCPv4 Server and Client
A DHCPv4 client requests addressing information from a DHCPv4 server. A complete DHCP lease can include:

- IPv4 address,
- subnet mask,
- default gateway,
- DNS server address,
- domain name,
- lease duration,
- other optional parameters.

DHCP reduces configuration errors and makes address management easier in changing networks.

<!-- kind: content -->
## Steps to Obtain a Lease
The initial DHCP process is often remembered as **DORA**:

1. **Discover:** The client broadcasts a message looking for DHCP servers.
2. **Offer:** A server offers an available address and settings.
3. **Request:** The client requests the offered address.
4. **Acknowledge:** The server confirms the lease.

Because a new client may not yet have an IP address or know the server address, early DHCP messages use broadcasts.

<!-- kind: content -->
## Steps to Renew a Lease
A client does not keep a leased address forever. Before the lease expires, it attempts to renew the lease, often by contacting the original DHCP server directly. If renewal fails, the client may eventually broadcast again to find any available DHCP server.

<!-- kind: content -->
## Cisco IOS DHCPv4 Server
A Cisco router can provide DHCPv4 service for a small or lab network. Basic configuration includes:

- excluding addresses that should not be leased,
- creating a DHCP pool,
- defining the network and subnet mask,
- setting the default router,
- setting DNS and other options if needed.

<!-- kind: activity -->
## Activity: Configure a Cisco IOS DHCPv4 Server
Example LAN: `192.168.10.0/24`  
Gateway: `192.168.10.1`  
DNS server: `8.8.8.8`

```text
R1# configure terminal
R1(config)# ip dhcp excluded-address 192.168.10.1 192.168.10.20
R1(config)# ip dhcp pool LAN10
R1(dhcp-config)# network 192.168.10.0 255.255.255.0
R1(dhcp-config)# default-router 192.168.10.1
R1(dhcp-config)# dns-server 8.8.8.8
R1(dhcp-config)# domain-name example.local
R1(dhcp-config)# end
```

Verify:

```text
R1# show ip dhcp pool
R1# show ip dhcp binding
R1# show ip dhcp server statistics
```

<!-- kind: content -->
## DHCPv4 Verification
Useful checks include:

- Confirm the router interface facing clients is up and has the correct gateway address.
- Confirm excluded addresses do not overlap incorrectly with the available pool.
- Confirm the pool network matches the client subnet.
- Confirm clients are set to obtain an IP address automatically.
- Check the DHCP binding table after clients request addresses.

<!-- kind: activity -->
## Activity: Troubleshoot a DHCP Client
On a client device:

```text
ipconfig /all
ipconfig /release
ipconfig /renew
```

On a Cisco device:

```text
R1# show ip dhcp binding
R1# show ip dhcp pool
R1# debug ip dhcp server events
R1# undebug all
```

**Questions:**

1. Did the client receive an address from the correct subnet?
2. Is the default gateway correct?
3. Is the DNS server correct?
4. Does the server show a binding for the client MAC address?

<!-- kind: content -->
## Disable the Cisco IOS DHCPv4 Server
If a router should not provide DHCP service, disable the DHCP service globally.

<!-- kind: activity -->
## Activity: Disable DHCP Service
```text
R1# configure terminal
R1(config)# no service dhcp
R1(config)# end
```

Re-enable it:

```text
R1# configure terminal
R1(config)# service dhcp
R1(config)# end
```

<!-- kind: content -->
## DHCPv4 Relay
DHCP clients use broadcasts at the start of the lease process. Routers do not normally forward broadcasts between networks. If the DHCP server is on a different subnet, configure DHCP relay on the interface that receives client broadcasts.

The relay address points to the DHCP server.

<!-- kind: activity -->
## Activity: Configure DHCP Relay
Client LAN: `192.168.20.0/24`  
DHCP server: `192.168.100.10`

```text
R1# configure terminal
R1(config)# interface gigabitEthernet 0/0/1
R1(config-if)# ip helper-address 192.168.100.10
R1(config-if)# end
```

Verify:

```text
R1# show running-config interface gigabitEthernet 0/0/1
```

`ip helper-address` can relay several UDP-based services, but DHCP relay is its most common use.

<!-- kind: content -->
## Cisco Router as a DHCPv4 Client
A router interface can also receive an IP address from a DHCP server. This is common on an edge router connected to an ISP or upstream network.

<!-- kind: activity -->
## Activity: Configure a Router Interface as a DHCP Client
```text
R1# configure terminal
R1(config)# interface gigabitEthernet 0/0/0
R1(config-if)# ip address dhcp
R1(config-if)# no shutdown
R1(config-if)# end
R1# show ip interface brief
R1# show dhcp lease
```

<!-- kind: content -->
## Summary
DHCPv4 automates IPv4 address assignment. Clients obtain leases through Discover, Offer, Request, and Acknowledge messages. Cisco IOS can act as a DHCP server, relay, or client. Verification commands help confirm pools, bindings, and client leases.
