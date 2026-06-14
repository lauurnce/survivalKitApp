# VLANs
<!-- subject: Network Administration | year: 2nd -->

<!-- kind: content -->
## Introduction
A Virtual LAN (VLAN) is a logical network segment created on a switch. VLANs allow one physical switching infrastructure to behave like multiple separate Layer 2 networks.

<!-- kind: content -->
## Learning Goals
By the end of this module, you should be able to:

- Define VLANs and explain why they are useful.
- Identify common VLAN types.
- Explain trunk links and 802.1Q tagging.
- Configure VLANs and assign switch ports.
- Configure and verify trunk ports.
- Explain Dynamic Trunking Protocol (DTP) behavior.

<!-- kind: content -->
## VLAN Definitions
A VLAN groups switch ports into a separate broadcast domain. Devices in the same VLAN can communicate at Layer 2 as if they were connected to the same physical switch segment. Devices in different VLANs need routing to communicate.

VLANs are commonly used to separate departments, device types, management traffic, guest users, voice traffic, and security zones.

<!-- kind: content -->
## Benefits of VLAN Design
A good VLAN design can:

- reduce unnecessary broadcast traffic,
- improve security by separating user groups,
- simplify moves and changes,
- organize the network by function instead of only physical location,
- support special traffic requirements such as voice VLANs.

<!-- kind: content -->
## Common VLAN Types
### Default VLAN
On many Cisco switches, VLAN 1 exists by default and all ports initially belong to it. It should not be used as the main management or user VLAN in a secure design.

### Data VLAN
A data VLAN carries regular user traffic such as workstation, laptop, or printer traffic.

### Native VLAN
On an 802.1Q trunk, untagged frames are placed into the native VLAN. For security, use a native VLAN that is not used for normal data traffic.

### Voice VLAN
A voice VLAN separates IP phone traffic from regular data traffic. This helps with traffic management and quality of service.

### Management VLAN
A management VLAN is used for switch management access, such as SSH to the switch SVI.

<!-- kind: content -->
## VLANs Across Multiple Switches
When VLANs exist across more than one switch, switches use trunk links to carry traffic for multiple VLANs over one physical connection.

Without VLANs, all switch ports are part of one broadcast domain. With VLANs, each VLAN becomes a separate broadcast domain even if devices are connected to the same physical switch.

<!-- kind: content -->
## VLAN Identification with 802.1Q Tags
802.1Q tagging adds VLAN information to Ethernet frames as they cross trunk links. The tag tells the receiving switch which VLAN the frame belongs to.

The native VLAN is an exception because frames in the native VLAN are usually sent untagged. Because of this, both ends of a trunk should use the same native VLAN to avoid mismatch problems.

<!-- kind: content -->
## Voice VLAN Tagging
A switch port connected to an IP phone and a PC may carry two kinds of traffic:

- voice traffic tagged for the voice VLAN,
- data traffic from the connected PC assigned to the access VLAN.

This design allows the phone and PC to share one physical switch port while keeping traffic logically separated.

<!-- kind: activity -->
## Activity: Create VLANs
Create VLANs for users, voice, and management.

```text
S1# configure terminal
S1(config)# vlan 10
S1(config-vlan)# name USERS
S1(config-vlan)# exit
S1(config)# vlan 20
S1(config-vlan)# name VOICE
S1(config-vlan)# exit
S1(config)# vlan 99
S1(config-vlan)# name MANAGEMENT
S1(config-vlan)# end
S1# show vlan brief
```

<!-- kind: activity -->
## Activity: Assign Access Ports
Assign a user port to VLAN 10.

```text
S1# configure terminal
S1(config)# interface fastEthernet 0/6
S1(config-if)# switchport mode access
S1(config-if)# switchport access vlan 10
S1(config-if)# description User workstation
S1(config-if)# no shutdown
S1(config-if)# end
S1# show vlan brief
```

Configure a port for a PC behind an IP phone:

```text
S1# configure terminal
S1(config)# interface fastEthernet 0/7
S1(config-if)# switchport mode access
S1(config-if)# switchport access vlan 10
S1(config-if)# switchport voice vlan 20
S1(config-if)# end
```

<!-- kind: content -->
## VLAN Ranges on Catalyst Switches
Cisco switches support normal-range and extended-range VLANs. In many basic labs, VLANs 1-1005 are treated as the normal range. VLANs above that may have platform-specific requirements. Always check the device model and IOS version before relying on extended VLAN behavior.

<!-- kind: activity -->
## Activity: Change or Delete VLAN Membership
Move a port back to the default access VLAN:

```text
S1# configure terminal
S1(config)# interface fastEthernet 0/6
S1(config-if)# no switchport access vlan
S1(config-if)# end
```

Delete a VLAN from the local VLAN database:

```text
S1# configure terminal
S1(config)# no vlan 10
S1(config)# end
S1# show vlan brief
```

**Important:** Deleting a VLAN does not automatically make all affected devices reachable. Ports formerly assigned to that VLAN may stop forwarding user traffic until reassigned.

<!-- kind: content -->
## VLAN Trunks
A trunk port carries traffic for multiple VLANs. Trunks are commonly used between switches, between a switch and a router in router-on-a-stick designs, and between a switch and some servers or virtualization hosts.

Trunk configuration usually includes:

- setting the port to trunk mode,
- choosing the native VLAN,
- limiting the allowed VLAN list,
- disabling unnecessary trunk negotiation when appropriate.

<!-- kind: activity -->
## Activity: Configure a Trunk
```text
S1# configure terminal
S1(config)# interface gigabitEthernet 0/1
S1(config-if)# switchport mode trunk
S1(config-if)# switchport trunk native vlan 99
S1(config-if)# switchport trunk allowed vlan 10,20,99
S1(config-if)# description Trunk to S2
S1(config-if)# end
S1# show interfaces trunk
```

Reset trunk settings to defaults:

```text
S1# configure terminal
S1(config)# interface gigabitEthernet 0/1
S1(config-if)# no switchport trunk allowed vlan
S1(config-if)# no switchport trunk native vlan
S1(config-if)# end
```

<!-- kind: content -->
## Dynamic Trunking Protocol
Dynamic Trunking Protocol (DTP) can negotiate whether a Cisco switch port becomes a trunk. Common modes include:

- **access:** Forces the port to act as an access port.
- **trunk:** Forces the port to act as a trunk.
- **dynamic desirable:** Actively tries to form a trunk.
- **dynamic auto:** Waits for the other side to request trunking.

For predictable and secure networks, manually configure trunk or access mode instead of relying on negotiation. On many switchports, `switchport nonegotiate` can disable DTP messages when the port is manually configured as a trunk.

<!-- kind: activity -->
## Activity: Verify DTP and Trunking
```text
S1# show interfaces trunk
S1# show interfaces gigabitEthernet 0/1 switchport
S1# show dtp interface gigabitEthernet 0/1
```

Answer these questions:

1. Is the port operationally trunking?
2. What VLAN is the native VLAN?
3. Which VLANs are allowed on the trunk?
4. Is DTP negotiation enabled or disabled?

<!-- kind: content -->
## Summary
VLANs divide a switched network into separate broadcast domains. Access ports carry one data VLAN, voice-enabled access ports can support a voice VLAN, and trunk ports carry multiple VLANs using 802.1Q tags. Consistent trunk configuration and careful VLAN assignment are essential for reliable switched networks.
