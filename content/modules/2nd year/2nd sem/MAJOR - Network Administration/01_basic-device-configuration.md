# Basic Device Configuration
<!-- subject: Network Administration | year: 2nd -->

<!-- kind: content -->
## Introduction
Network devices should be configured in a predictable and secure way before they are placed into production. This module focuses on the first tasks usually performed on Cisco switches and routers: preparing a switch for management, configuring switch ports, enabling secure remote access, setting up basic router interfaces, and verifying that directly connected networks can communicate.

<!-- kind: content -->
## Learning Goals
By the end of this module, you should be able to:

- Explain the basic boot process of a Cisco switch.
- Configure a switch management interface and default gateway.
- Set switch port speed, duplex, and auto-MDIX behavior.
- Use verification commands to inspect switch and router status.
- Prefer SSH over Telnet for remote administration.
- Configure basic IPv4 and IPv6 settings on router interfaces.
- Verify directly connected routes and interface status.

<!-- kind: content -->
## Cisco Switch Boot Sequence
When a Cisco switch powers on, it performs several startup steps before the operating system becomes available:

1. **POST runs from ROM.** The power-on self-test checks key hardware such as the CPU, memory, and flash file system.
2. **The boot loader starts.** This small ROM-based program runs after POST completes successfully.
3. **Low-level CPU settings are initialized.** The boot loader prepares memory mapping and basic CPU operation.
4. **Flash storage is prepared.** The switch initializes the flash file system where the operating system image and configuration files are stored.
5. **IOS is loaded.** The boot loader finds an IOS image, loads it into memory, and passes control to IOS.

The switch can use a configured boot variable to determine which IOS image to load. If no boot variable is set, it normally attempts to boot from the first valid executable image it finds in flash.

<!-- kind: activity -->
## Activity: Inspect the Boot Image
Use these commands to check or set the IOS boot image on a switch.

```text
Switch# show boot
Switch# configure terminal
Switch(config)# boot system flash:c2960-lanbasek9-mz.150-2.SE/c2960-lanbasek9-mz.150-2.SE.bin
Switch(config)# end
Switch# copy running-config startup-config
```

**Check yourself:** Identify the storage device, folder path, and IOS filename in the `boot system` command.

<!-- kind: content -->
## Switch LED Indicators
Switch LEDs provide quick physical clues about device status. Common indicators include:

- **SYST:** Shows whether the switch has power and is operating normally.
- **RPS:** Indicates redundant power supply status if supported.
- **STAT:** Shows port link/activity status.
- **DUPLX:** Shows whether a port is using half-duplex or full-duplex.
- **SPEED:** Shows the link speed for each port.
- **PoE:** Shows Power over Ethernet status if the switch supports it.

The mode button changes what port LEDs represent. For example, in STAT mode a solid green port LED usually indicates link up, while a blinking green LED commonly represents traffic activity. Amber or alternating colors usually indicate a blocked port, fault, or power-related issue.

<!-- kind: content -->
## Recovering from a System Crash
If IOS cannot load because system files are missing or damaged, the boot loader can be used for recovery. A console connection is required. The common recovery idea is:

1. Connect to the switch using a console cable and terminal software.
2. Power-cycle the switch.
3. Hold the mode button during startup until the boot loader prompt appears.
4. Use boot loader commands to inspect flash, recover passwords, format storage, or reinstall IOS.

Useful boot loader commands include directory inspection commands such as `dir`.

<!-- kind: content -->
## Switch Management Access
A Layer 2 switch does not need an IP address to forward Ethernet frames, but it does need one for remote management. Management access is normally configured through a **Switch Virtual Interface (SVI)**.

An SVI is a logical VLAN interface, not a physical port. The management SVI should have:

- an IPv4 address and subnet mask,
- optionally an IPv6 address,
- the interface enabled with `no shutdown`,
- a default gateway if the administrator will connect from another network.

For better security, avoid using VLAN 1 as the management VLAN when possible.

<!-- kind: activity -->
## Activity: Configure a Management SVI
Example management VLAN: VLAN 99  
Example switch IP: `172.17.99.11/24`  
Example IPv6 address: `2001:db8:acad:99::1/64`  
Example gateway: `172.17.99.1`

```text
S1# configure terminal
S1(config)# vlan 99
S1(config-vlan)# name MANAGEMENT
S1(config-vlan)# exit
S1(config)# interface vlan 99
S1(config-if)# ip address 172.17.99.11 255.255.255.0
S1(config-if)# ipv6 address 2001:db8:acad:99::1/64
S1(config-if)# no shutdown
S1(config-if)# exit
S1(config)# ip default-gateway 172.17.99.1
S1(config)# end
S1# copy running-config startup-config
```

Verify the SVI:

```text
S1# show ip interface brief
S1# show ipv6 interface brief
S1# show running-config interface vlan 99
```

**Note:** The SVI may remain down until the VLAN exists and at least one active port belongs to that VLAN.

<!-- kind: content -->
## Duplex Communication
A switch port can operate in half-duplex or full-duplex mode.

- **Full-duplex** allows sending and receiving at the same time. It is more efficient and eliminates collisions on that link.
- **Half-duplex** allows only one direction at a time. It can experience collisions and lower performance.

Modern wired Ethernet networks should use full-duplex whenever possible. Gigabit and faster Ethernet links normally operate in full-duplex mode.

<!-- kind: content -->
## Switch Port Speed, Duplex, and Auto-MDIX
Switch ports can use automatic negotiation or manual settings. Autonegotiation is useful when the connected device may vary, while manual configuration is common for known infrastructure devices such as servers, routers, and uplinks.

**Auto-MDIX** allows the switch to automatically handle straight-through or crossover cable requirements. On devices that support it, the port can adjust to the cable type automatically. Auto-MDIX works best when speed and duplex are set to `auto`.

<!-- kind: activity -->
## Activity: Configure a Switch Port
Configure FastEthernet 0/1 for full-duplex and 100 Mbps:

```text
S1# configure terminal
S1(config)# interface fastEthernet 0/1
S1(config-if)# duplex full
S1(config-if)# speed 100
S1(config-if)# end
S1# copy running-config startup-config
```

Enable auto-MDIX when available:

```text
S1# configure terminal
S1(config)# interface fastEthernet 0/1
S1(config-if)# speed auto
S1(config-if)# duplex auto
S1(config-if)# mdix auto
S1(config-if)# end
```

<!-- kind: content -->
## Switch Verification Commands
Use show commands to confirm configuration and troubleshoot problems.

| Task | Command |
|---|---|
| Display interface details | `show interfaces [interface-id]` |
| Display startup configuration | `show startup-config` |
| Display active configuration | `show running-config` |
| Show flash contents | `show flash` |
| Show hardware and IOS version | `show version` |
| Show command history | `show history` |
| Show IP interface information | `show ip interface [interface-id]` |
| Show IPv6 interface information | `show ipv6 interface [interface-id]` |
| Show MAC address table | `show mac address-table` |

<!-- kind: content -->
## Interpreting Interface Status
The first line of `show interfaces` is important. For example:

```text
FastEthernet0/18 is up, line protocol is up
```

The first status describes the physical layer. The second describes the data link layer.

- **up/up:** The interface is physically connected and the data link protocol is working.
- **up/down:** The cable signal may exist, but the data link layer has a problem. Possible causes include encapsulation mismatch, remote error-disable state, or hardware issues.
- **down/down:** The port is not detecting a working physical connection. Check cable, remote device, and speed settings.
- **administratively down:** The interface was disabled with the `shutdown` command.

<!-- kind: content -->
## Common Interface Error Counters
Interface counters help identify performance problems even when the link is technically up.

| Counter | Meaning |
|---|---|
| Input errors | Total receive-side errors, including CRC, runts, giants, overruns, and ignored frames. |
| Runts | Frames smaller than the Ethernet minimum size. |
| Giants | Frames larger than the allowed Ethernet frame size. |
| CRC errors | Frames whose checksum does not match, often due to noise, bad cabling, or damaged connectors. |
| Output errors | Send-side errors that prevented frames from being transmitted. |
| Collisions | Frames retransmitted because of collisions, normally associated with half-duplex links. |
| Late collisions | Collisions detected too late in frame transmission, often caused by excessive cable length or duplex mismatch. |

<!-- kind: activity -->
## Activity: Troubleshoot a Bad Link
Use this checklist when a switch-to-device connection fails or performs poorly:

1. Run `show interfaces interface-id`.
2. If the port is down, check the cable, connector, remote device, and speed settings.
3. If the port is up but errors are increasing, inspect for noise, bad cabling, duplex mismatch, or damaged NICs.
4. If the port is administratively down, enable it with `no shutdown`.
5. Document what you changed and escalate if the issue continues.

<!-- kind: content -->
## Secure Remote Access: Telnet vs SSH
Telnet uses TCP port 23 and sends usernames, passwords, and session data in plaintext. Because anyone capturing traffic can read the login details, Telnet should not be used for production device management.

SSH uses TCP port 22 and encrypts the management session. It protects both authentication and command traffic. For network administration, SSH should be the standard remote access method.

<!-- kind: activity -->
## Activity: Configure SSH on a Switch
Before enabling SSH, configure a hostname, domain name, local user account, RSA keys, and VTY settings.

```text
S1# configure terminal
S1(config)# hostname S1
S1(config)# ip domain-name example.local
S1(config)# username admin secret StrongPassword123
S1(config)# crypto key generate rsa
How many bits in the modulus [512]: 1024
S1(config)# ip ssh version 2
S1(config)# line vty 0 15
S1(config-line)# login local
S1(config-line)# transport input ssh
S1(config-line)# end
S1# copy running-config startup-config
```

Verify SSH:

```text
S1# show ip ssh
S1# show running-config | section line vty
```

From a PC, connect using an SSH client:

```text
ssh admin@172.17.99.11
```

<!-- kind: content -->
## Basic Router Configuration
A router forwards traffic between different networks. At minimum, a router should have:

- a hostname,
- secure privileged access,
- encrypted passwords where possible,
- configured and enabled interfaces,
- saved configuration,
- verification that directly connected networks appear in the routing table.

<!-- kind: activity -->
## Activity: Configure Router Interfaces
Example dual-stack router interface configuration:

```text
R1# configure terminal
R1(config)# hostname R1
R1(config)# no ip domain-lookup
R1(config)# enable secret StrongEnableSecret
R1(config)# ipv6 unicast-routing
R1(config)# interface gigabitEthernet 0/0/0
R1(config-if)# description LAN-A gateway
R1(config-if)# ip address 192.168.10.1 255.255.255.0
R1(config-if)# ipv6 address 2001:db8:acad:10::1/64
R1(config-if)# no shutdown
R1(config-if)# exit
R1(config)# interface gigabitEthernet 0/0/1
R1(config-if)# description LAN-B gateway
R1(config-if)# ip address 192.168.20.1 255.255.255.0
R1(config-if)# ipv6 address 2001:db8:acad:20::1/64
R1(config-if)# no shutdown
R1(config-if)# end
R1# copy running-config startup-config
```

<!-- kind: content -->
## Loopback Interfaces
A loopback interface is a logical router interface that stays up as long as the router is running. It is useful for testing, management, routing protocol identification, and stable reachability.

<!-- kind: activity -->
## Activity: Create a Loopback Interface
```text
R1# configure terminal
R1(config)# interface loopback 0
R1(config-if)# ip address 10.10.10.1 255.255.255.255
R1(config-if)# ipv6 address 2001:db8:acad:ffff::1/128
R1(config-if)# end
```

<!-- kind: content -->
## Verify Directly Connected Networks
After router interfaces are configured, use verification commands to check status and routes.

| Task | Command |
|---|---|
| Brief IPv4 interface status | `show ip interface brief` |
| Brief IPv6 interface status | `show ipv6 interface brief` |
| Detailed interface information | `show interfaces` |
| IPv4 routes | `show ip route` |
| IPv6 routes | `show ipv6 route` |
| Running configuration | `show running-config` |
| Filter output | `show running-config | section interface` |

A directly connected route normally appears when the interface has an address, the interface is up, and the line protocol is up.

<!-- kind: activity -->
## Activity: Verification Questions
Answer these using device output:

1. Which interfaces are up/up?
2. What directly connected IPv4 networks appear in the routing table?
3. What directly connected IPv6 networks appear in the routing table?
4. Which interface is the default gateway for each LAN?
5. Can hosts on the two directly connected LANs ping each other?
