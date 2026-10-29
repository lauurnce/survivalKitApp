# Inter-VLAN Routing
<!-- subject: Network Administration | year: 2nd -->

<!-- kind: content -->
## Introduction
VLANs separate a network into different broadcast domains. That separation improves organization and security, but it also means devices in different VLANs cannot communicate at Layer 2 alone. **Inter-VLAN routing** provides Layer 3 forwarding between VLANs.

<!-- kind: content -->
## Learning Goals
By the end of this module, you should be able to:

- Explain why routing is needed between VLANs.
- Compare legacy inter-VLAN routing, router-on-a-stick, and Layer 3 switch routing.
- Configure router-on-a-stick subinterfaces.
- Configure switched virtual interfaces on a Layer 3 switch.
- Troubleshoot common inter-VLAN routing problems.

<!-- kind: content -->
## What Is Inter-VLAN Routing?
Devices in the same VLAN can communicate through switching. Devices in different VLANs need a router or Layer 3 switch to forward traffic between their IP networks.

For example:

- VLAN 10 uses `192.168.10.0/24`.
- VLAN 20 uses `192.168.20.0/24`.
- A host in VLAN 10 must send traffic to its default gateway before reaching VLAN 20.

<!-- kind: content -->
## Inter-VLAN Routing Methods
### Legacy Inter-VLAN Routing
A router uses a separate physical interface for each VLAN. Each router interface connects to a switch access port in a different VLAN. This works but does not scale well because each VLAN needs a physical router interface.

### Router-on-a-Stick
A router uses one physical interface configured with multiple logical subinterfaces. The switch port connected to the router is a trunk. Each subinterface is assigned to a VLAN using 802.1Q encapsulation and acts as that VLAN's default gateway.

### Layer 3 Switch Inter-VLAN Routing
A Layer 3 switch uses SVIs as VLAN gateways and routes internally between them. This is common in larger LANs because it is faster and more scalable than sending all inter-VLAN traffic to an external router.

<!-- kind: content -->
## Router-on-a-Stick Operation
In router-on-a-stick, the router receives tagged frames from a trunk link. The tag identifies the VLAN. The router processes traffic through the matching subinterface and routes it to the destination VLAN.

Each subinterface needs:

- a subinterface number,
- an 802.1Q VLAN ID,
- an IP address that serves as the default gateway for that VLAN,
- optional native VLAN handling if required.

<!-- kind: activity -->
## Activity: Configure Router-on-a-Stick
Example VLANs:

- VLAN 10: `192.168.10.0/24`, gateway `192.168.10.1`
- VLAN 20: `192.168.20.0/24`, gateway `192.168.20.1`
- VLAN 99 native/management: `192.168.99.0/24`, gateway `192.168.99.1`

Switch trunk to router:

```text
S1# configure terminal
S1(config)# vlan 10
S1(config-vlan)# name USERS
S1(config-vlan)# exit
S1(config)# vlan 20
S1(config-vlan)# name STAFF
S1(config-vlan)# exit
S1(config)# vlan 99
S1(config-vlan)# name NATIVE-MGMT
S1(config-vlan)# exit
S1(config)# interface gigabitEthernet 0/1
S1(config-if)# switchport mode trunk
S1(config-if)# switchport trunk native vlan 99
S1(config-if)# switchport trunk allowed vlan 10,20,99
S1(config-if)# no shutdown
S1(config-if)# end
```

Router subinterfaces:

```text
R1# configure terminal
R1(config)# interface gigabitEthernet 0/0/0
R1(config-if)# no shutdown
R1(config-if)# exit
R1(config)# interface gigabitEthernet 0/0/0.10
R1(config-subif)# encapsulation dot1Q 10
R1(config-subif)# ip address 192.168.10.1 255.255.255.0
R1(config-subif)# exit
R1(config)# interface gigabitEthernet 0/0/0.20
R1(config-subif)# encapsulation dot1Q 20
R1(config-subif)# ip address 192.168.20.1 255.255.255.0
R1(config-subif)# exit
R1(config)# interface gigabitEthernet 0/0/0.99
R1(config-subif)# encapsulation dot1Q 99 native
R1(config-subif)# ip address 192.168.99.1 255.255.255.0
R1(config-subif)# end
```

Verify:

```text
S1# show interfaces trunk
R1# show ip interface brief
R1# show ip route connected
```

<!-- kind: content -->
## Layer 3 Switch Inter-VLAN Routing
A Layer 3 switch can route between VLANs using SVIs. Each VLAN interface receives an IP address and becomes the default gateway for hosts in that VLAN. Routing must be enabled with `ip routing`.

<!-- kind: activity -->
## Activity: Configure Inter-VLAN Routing on a Layer 3 Switch
```text
MLS1# configure terminal
MLS1(config)# ip routing
MLS1(config)# vlan 10
MLS1(config-vlan)# name USERS
MLS1(config-vlan)# exit
MLS1(config)# vlan 20
MLS1(config-vlan)# name STAFF
MLS1(config-vlan)# exit
MLS1(config)# interface vlan 10
MLS1(config-if)# ip address 192.168.10.1 255.255.255.0
MLS1(config-if)# no shutdown
MLS1(config-if)# exit
MLS1(config)# interface vlan 20
MLS1(config-if)# ip address 192.168.20.1 255.255.255.0
MLS1(config-if)# no shutdown
MLS1(config-if)# end
MLS1# show ip route
MLS1# show ip interface brief
```

If the Layer 3 switch needs to route toward another router, configure a routed port or a transit VLAN and add appropriate routes.

<!-- kind: content -->
## Common Inter-VLAN Routing Problems
Common issues include:

- VLAN does not exist on the switch.
- Access port is assigned to the wrong VLAN.
- Trunk is not formed or does not allow the required VLAN.
- Native VLAN mismatch.
- Router subinterface has the wrong VLAN ID.
- Default gateway on the host is incorrect.
- SVI is down because no active port exists in the VLAN.
- `ip routing` is missing on a Layer 3 switch.

<!-- kind: activity -->
## Activity: Troubleshooting Checklist
When two hosts in different VLANs cannot communicate:

1. Confirm the source host IP address, subnet mask, and default gateway.
2. Confirm the destination host IP address and default gateway.
3. Check access port VLAN assignment:

```text
S1# show vlan brief
S1# show interfaces status
```

4. Check trunk status and allowed VLANs:

```text
S1# show interfaces trunk
```

5. Check router subinterfaces or Layer 3 switch SVIs:

```text
R1# show ip interface brief
R1# show running-config interface gigabitEthernet 0/0/0.10
MLS1# show ip interface brief
MLS1# show ip route
```

6. Test hop by hop with `ping` and `traceroute`.

<!-- kind: content -->
## Summary
Inter-VLAN routing allows communication between separate VLANs. Router-on-a-stick uses router subinterfaces over a trunk link. A Layer 3 switch uses SVIs and internal routing. Most failures come from mismatched VLANs, trunk problems, missing gateways, or incorrect interface configuration.
