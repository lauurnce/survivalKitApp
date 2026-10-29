# EtherChannel
<!-- subject: Network Administration | year: 2nd -->

<!-- kind: content -->
## Introduction
EtherChannel combines multiple physical Ethernet links into one logical link. This provides more bandwidth and redundancy between switches, routers, or servers while allowing STP to treat the bundle as a single link.

<!-- kind: content -->
## Learning Goals
By the end of this module, you should be able to:

- Explain link aggregation and EtherChannel.
- List EtherChannel benefits and restrictions.
- Compare PAgP and LACP.
- Configure EtherChannel using LACP.
- Verify and troubleshoot EtherChannel bundles.

<!-- kind: content -->
## Link Aggregation
Link aggregation groups several physical interfaces so they behave as one logical interface. Traffic can be balanced across member links based on a hashing method, such as source/destination MAC address, IP address, or port information.

EtherChannel does not usually split a single flow evenly across all links. Instead, it chooses a member link for each flow based on the load-balancing algorithm.

<!-- kind: content -->
## Advantages of EtherChannel
EtherChannel provides:

- increased aggregate bandwidth,
- link redundancy if one member link fails,
- simpler STP behavior because the bundle is one logical port,
- load sharing across active links,
- the ability to add capacity without replacing hardware immediately.

<!-- kind: content -->
## Implementation Restrictions
Member interfaces must have compatible settings. Common requirements include:

- same speed and duplex,
- same switchport mode,
- same access VLAN or trunk settings,
- same native VLAN if trunking,
- same allowed VLAN list if trunking,
- no incompatible security or QoS settings.

If member links are inconsistent, the EtherChannel may fail or place ports into a suspended state.

<!-- kind: content -->
## EtherChannel Negotiation Protocols
### PAgP
Port Aggregation Protocol is Cisco-proprietary. Common modes include:

- **desirable:** actively tries to form an EtherChannel,
- **auto:** waits for the other side to initiate PAgP.

### LACP
Link Aggregation Control Protocol is standards-based. Common modes include:

- **active:** actively tries to form an EtherChannel,
- **passive:** waits for the other side to initiate LACP.

### Static EtherChannel
Using `mode on` creates a channel without negotiation. Both sides must be manually configured correctly.

<!-- kind: content -->
## Negotiation Mode Compatibility
| Side A | Side B | Result |
|---|---|---|
| LACP active | LACP active | Forms channel |
| LACP active | LACP passive | Forms channel |
| LACP passive | LACP passive | Does not form |
| PAgP desirable | PAgP desirable | Forms channel |
| PAgP desirable | PAgP auto | Forms channel |
| PAgP auto | PAgP auto | Does not form |
| On | On | Forms static channel if settings match |

<!-- kind: activity -->
## Activity: Configure LACP EtherChannel
Bundle two trunk links between switches.

On S1:

```text
S1# configure terminal
S1(config)# interface range gigabitEthernet 0/1 - 2
S1(config-if-range)# switchport mode trunk
S1(config-if-range)# switchport trunk allowed vlan 10,20,99
S1(config-if-range)# channel-group 1 mode active
S1(config-if-range)# exit
S1(config)# interface port-channel 1
S1(config-if)# switchport mode trunk
S1(config-if)# switchport trunk allowed vlan 10,20,99
S1(config-if)# end
```

On S2:

```text
S2# configure terminal
S2(config)# interface range gigabitEthernet 0/1 - 2
S2(config-if-range)# switchport mode trunk
S2(config-if-range)# switchport trunk allowed vlan 10,20,99
S2(config-if-range)# channel-group 1 mode active
S2(config-if-range)# exit
S2(config)# interface port-channel 1
S2(config-if)# switchport mode trunk
S2(config-if)# switchport trunk allowed vlan 10,20,99
S2(config-if)# end
```

<!-- kind: activity -->
## Activity: Verify EtherChannel
```text
S1# show etherchannel summary
S1# show etherchannel port-channel
S1# show interfaces port-channel 1
S1# show interfaces trunk
```

In `show etherchannel summary`, look for indicators that the port-channel is Layer 2 and in use, and that member ports are bundled.

<!-- kind: content -->
## Common EtherChannel Issues
EtherChannel problems often happen when member ports do not match. Check for:

- different trunk allowed VLAN lists,
- different native VLANs,
- one side access and the other side trunk,
- mismatched negotiation protocol or mode,
- speed/duplex mismatch,
- interfaces assigned to different channel groups,
- configuration applied only to physical ports but not the port-channel interface.

<!-- kind: activity -->
## Activity: Troubleshoot a Suspended Channel
Use this process:

1. Check the summary:

```text
S1# show etherchannel summary
```

2. Compare physical interface settings:

```text
S1# show running-config interface gigabitEthernet 0/1
S1# show running-config interface gigabitEthernet 0/2
```

3. Compare the port-channel settings:

```text
S1# show running-config interface port-channel 1
```

4. Correct mismatches by configuring the port-channel interface first, then member interfaces if needed.

<!-- kind: content -->
## Summary
EtherChannel bundles multiple Ethernet links into one logical connection. It improves bandwidth and resilience while simplifying STP. Successful configuration depends on consistent member interface settings and compatible negotiation modes.
