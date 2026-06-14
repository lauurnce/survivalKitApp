# Switch Security Configuration
<!-- subject: Network Administration | year: 2nd -->

<!-- kind: content -->
## Introduction
Switch security configuration applies practical protections against common Layer 2 attacks. This module focuses on unused ports, port security, VLAN attack mitigation, DHCP snooping, Dynamic ARP Inspection, and STP protections.

<!-- kind: content -->
## Learning Goals
By the end of this module, you should be able to:

- Secure unused switch ports.
- Configure and verify port security.
- Explain sticky MAC learning and violation modes.
- Mitigate VLAN hopping attacks.
- Configure DHCP snooping.
- Configure Dynamic ARP Inspection.
- Configure PortFast and BPDU Guard on edge ports.

<!-- kind: content -->
## Secure Unused Ports
Unused switch ports should not remain open. A common best practice is to place unused ports into an unused VLAN, disable them, and add a description.

<!-- kind: activity -->
## Activity: Shut Down Unused Ports
```text
S1# configure terminal
S1(config)# vlan 999
S1(config-vlan)# name UNUSED
S1(config-vlan)# exit
S1(config)# interface range fastEthernet 0/11 - 24
S1(config-if-range)# switchport mode access
S1(config-if-range)# switchport access vlan 999
S1(config-if-range)# shutdown
S1(config-if-range)# description Unused - disabled
S1(config-if-range)# end
```

<!-- kind: content -->
## Port Security Overview
Port security limits which MAC addresses can use a switch port. It helps reduce MAC flooding and unauthorized device connections.

Port security can learn MAC addresses in several ways:

- manually configured secure MAC addresses,
- dynamically learned secure MAC addresses,
- sticky learned MAC addresses saved into the running configuration.

Port security is configured on access ports, not dynamic trunk ports.

<!-- kind: activity -->
## Activity: Configure Basic Port Security
Allow one device on an access port and shut down the port if another MAC address appears.

```text
S1# configure terminal
S1(config)# interface fastEthernet 0/6
S1(config-if)# switchport mode access
S1(config-if)# switchport access vlan 10
S1(config-if)# switchport port-security
S1(config-if)# switchport port-security maximum 1
S1(config-if)# switchport port-security violation shutdown
S1(config-if)# switchport port-security mac-address sticky
S1(config-if)# end
S1# show port-security interface fastEthernet 0/6
```

<!-- kind: content -->
## Port Security Violation Modes
When a violation occurs, the switch can respond in different ways.

| Mode | Behavior |
|---|---|
| Protect | Drops unauthorized traffic without logging much detail. |
| Restrict | Drops unauthorized traffic and can increment counters/log events. |
| Shutdown | Places the port into an error-disabled state. This is commonly used for strict protection. |

<!-- kind: content -->
## Port Security Aging
Port security aging removes learned secure MAC addresses after a timer. Aging can be absolute or inactivity-based depending on configuration. This is useful when devices are expected to change, but it should be used carefully in secure environments.

<!-- kind: activity -->
## Activity: Configure Port Security Aging
```text
S1# configure terminal
S1(config)# interface fastEthernet 0/6
S1(config-if)# switchport port-security aging time 10
S1(config-if)# switchport port-security aging type inactivity
S1(config-if)# end
```

<!-- kind: content -->
## Recovering an Error-Disabled Port
If a port enters an error-disabled state, investigate the cause before re-enabling it. After correcting the problem, use `shutdown` and `no shutdown` on the interface or configure automatic recovery if appropriate.

<!-- kind: activity -->
## Activity: Verify and Recover Port Security
```text
S1# show port-security
S1# show port-security interface fastEthernet 0/6
S1# show interfaces status err-disabled
S1# configure terminal
S1(config)# interface fastEthernet 0/6
S1(config-if)# shutdown
S1(config-if)# no shutdown
S1(config-if)# end
```

<!-- kind: content -->
## Mitigate VLAN Hopping
To reduce VLAN hopping risk:

- Manually configure user ports as access ports.
- Disable trunk negotiation on ports that should not trunk.
- Use an unused VLAN as the native VLAN.
- Avoid carrying the native VLAN as a user VLAN.
- Limit allowed VLANs on trunks.

<!-- kind: activity -->
## Activity: Harden Access and Trunk Ports
User access port:

```text
S1# configure terminal
S1(config)# interface fastEthernet 0/6
S1(config-if)# switchport mode access
S1(config-if)# switchport access vlan 10
S1(config-if)# switchport nonegotiate
S1(config-if)# end
```

Trunk port:

```text
S1# configure terminal
S1(config)# interface gigabitEthernet 0/1
S1(config-if)# switchport mode trunk
S1(config-if)# switchport trunk native vlan 999
S1(config-if)# switchport trunk allowed vlan 10,20,99
S1(config-if)# switchport nonegotiate
S1(config-if)# end
```

<!-- kind: content -->
## DHCP Snooping
DHCP snooping protects against rogue DHCP servers and helps build a trusted binding table of MAC address, IP address, VLAN, and port information.

Ports are classified as:

- **trusted:** usually uplinks toward legitimate DHCP servers,
- **untrusted:** usually user-facing access ports.

DHCP server messages arriving on untrusted ports are dropped.

<!-- kind: activity -->
## Activity: Configure DHCP Snooping
```text
S1# configure terminal
S1(config)# ip dhcp snooping
S1(config)# ip dhcp snooping vlan 10,20
S1(config)# interface gigabitEthernet 0/1
S1(config-if)# ip dhcp snooping trust
S1(config-if)# exit
S1(config)# interface range fastEthernet 0/1 - 24
S1(config-if-range)# ip dhcp snooping limit rate 10
S1(config-if-range)# end
S1# show ip dhcp snooping
S1# show ip dhcp snooping binding
```

<!-- kind: content -->
## Dynamic ARP Inspection
Dynamic ARP Inspection checks ARP packets against trusted information, often from the DHCP snooping binding table. It helps stop ARP poisoning by dropping invalid ARP messages on untrusted ports.

DAI requires careful configuration. If bindings are missing for statically addressed hosts, valid ARP traffic may be dropped unless entries or ACLs are configured.

<!-- kind: activity -->
## Activity: Configure Dynamic ARP Inspection
```text
S1# configure terminal
S1(config)# ip arp inspection vlan 10,20
S1(config)# interface gigabitEthernet 0/1
S1(config-if)# ip arp inspection trust
S1(config-if)# end
S1# show ip arp inspection
S1# show ip arp inspection interfaces
```

<!-- kind: content -->
## Mitigate STP Attacks
Use PortFast on access ports connected to end devices, and BPDU Guard to disable an edge port if it receives BPDUs unexpectedly.

<!-- kind: activity -->
## Activity: Configure PortFast and BPDU Guard
Per interface:

```text
S1# configure terminal
S1(config)# interface fastEthernet 0/6
S1(config-if)# spanning-tree portfast
S1(config-if)# spanning-tree bpduguard enable
S1(config-if)# end
```

Globally for PortFast-enabled edge ports:

```text
S1# configure terminal
S1(config)# spanning-tree portfast default
S1(config)# spanning-tree bpduguard default
S1(config)# end
```

<!-- kind: content -->
## Summary
Switch hardening reduces common Layer 2 risks. Disable unused ports, use port security, control trunking, enable DHCP snooping, protect ARP with DAI, and secure edge ports with PortFast and BPDU Guard.
