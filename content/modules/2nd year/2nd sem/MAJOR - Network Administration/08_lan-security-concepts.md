# LAN Security Concepts
<!-- subject: Network Administration | year: 2nd -->

<!-- kind: content -->
## Introduction
LAN security protects endpoints, switches, management access, and Layer 2 control processes. Many attacks do not require routing; they can happen inside the local network. Understanding these threats is the first step toward configuring defenses.

<!-- kind: content -->
## Learning Goals
By the end of this module, you should be able to:

- Explain endpoint security and network security device roles.
- Describe authentication, authorization, and accounting.
- Identify common Layer 2 threats.
- Explain MAC address table flooding, VLAN hopping, DHCP attacks, ARP attacks, spoofing, STP attacks, and reconnaissance.
- Match common threats with mitigation techniques.

<!-- kind: content -->
## Endpoint Security
Endpoints include laptops, desktops, phones, servers, printers, and IoT devices. They are frequent targets because they run user applications and often store or access sensitive data.

Endpoint protection commonly includes:

- operating system updates,
- anti-malware tools,
- host firewalls,
- disk encryption,
- strong authentication,
- least-privilege user accounts,
- device posture checks.

<!-- kind: content -->
## Network Security Devices
Different devices protect different parts of a network:

- **Firewalls** filter traffic based on policy.
- **Intrusion prevention systems** detect and block suspicious behavior.
- **Email security gateways** reduce phishing and malicious attachments.
- **Web security gateways** control access to risky websites and downloads.
- **Network access control systems** verify user or device identity before allowing network access.

<!-- kind: content -->
## Access Control and AAA
AAA is a framework for controlling access.

- **Authentication:** Verifies identity. Example: username and password, certificate, or multi-factor login.
- **Authorization:** Determines what the authenticated user or device is allowed to do.
- **Accounting:** Records what happened, such as login times and commands used.

Local passwords can work in small environments, but centralized AAA is easier to manage in larger networks.

<!-- kind: content -->
## 802.1X
802.1X provides port-based network access control. Before a device is allowed to use the network, it must authenticate. The typical roles are:

- **Supplicant:** the client device requesting access,
- **Authenticator:** the switch or wireless access point controlling the port,
- **Authentication server:** often a RADIUS server that validates credentials.

<!-- kind: content -->
## Layer 2 Vulnerabilities
Layer 2 attacks target switching behavior and local network protocols. Because these attacks occur inside a LAN, perimeter firewalls may not see or stop them.

Common switch attack categories include:

- MAC address table attacks,
- VLAN hopping,
- DHCP attacks,
- ARP attacks,
- address spoofing,
- STP manipulation,
- reconnaissance using discovery protocols.

<!-- kind: content -->
## MAC Address Table Flooding
A switch has limited space for learned MAC addresses. In a MAC flooding attack, an attacker sends many frames with fake source MAC addresses. If the table fills, the switch may flood unknown unicast traffic more widely, allowing the attacker to capture traffic that would normally be forwarded only to specific ports.

Mitigation includes port security, limiting learned MAC addresses per port, and shutting down unused ports.

<!-- kind: content -->
## VLAN Hopping Attacks
VLAN hopping attempts to send traffic into a VLAN where the attacker should not have access.

Two common ideas are:

- **Switch spoofing:** The attacker tries to make a port become a trunk.
- **Double tagging:** The attacker crafts frames with two VLAN tags to exploit native VLAN handling.

Mitigation includes forcing user ports to access mode, disabling DTP, using an unused native VLAN, and avoiding user traffic on the native VLAN.

<!-- kind: content -->
## DHCP Attacks
DHCP-related attacks include:

- **DHCP starvation:** An attacker consumes available addresses by sending many fake requests.
- **Rogue DHCP server:** An attacker provides false gateway or DNS settings to clients.

Mitigation includes DHCP snooping, trusted ports toward legitimate DHCP servers, and rate limits on untrusted access ports.

<!-- kind: content -->
## ARP Attacks
ARP resolves IPv4 addresses to MAC addresses in a LAN. Attackers can send fake ARP messages to redirect traffic through their device. This is often called ARP spoofing or ARP poisoning.

Mitigation includes Dynamic ARP Inspection (DAI), DHCP snooping bindings, and static ARP entries for critical systems when appropriate.

<!-- kind: content -->
## Address Spoofing
Spoofing means pretending to use another address or identity. In LANs, attackers may spoof MAC addresses, IP addresses, or both. Spoofing can bypass simple filters or impersonate trusted devices.

Mitigation includes port security, IP Source Guard, DHCP snooping, and strong authentication.

<!-- kind: content -->
## STP Attacks
An attacker may try to influence STP by sending superior BPDUs, potentially becoming the root bridge or changing forwarding paths.

Mitigation includes BPDU Guard on edge ports and deliberate root bridge placement.

<!-- kind: content -->
## CDP/LLDP Reconnaissance
Discovery protocols can reveal device names, ports, IP addresses, platforms, and software versions. This is useful for administrators but also helpful to attackers.

Disable discovery protocols on ports where they are not needed, especially user-facing or untrusted ports.

<!-- kind: activity -->
## Activity: Match Threats to Controls
Match each attack with a likely mitigation.

| Threat | Useful Mitigation |
|---|---|
| MAC flooding | Port security |
| Switch spoofing | Force access mode and disable DTP |
| Double tagging | Use unused native VLAN; do not use native VLAN for users |
| Rogue DHCP server | DHCP snooping |
| ARP poisoning | Dynamic ARP Inspection |
| Fake root bridge | BPDU Guard / Root Guard |
| Device reconnaissance | Disable CDP/LLDP on untrusted ports |

<!-- kind: activity -->
## Activity: LAN Security Review Questions
1. Why is Telnet unsafe for device management?
2. Why do VLANs improve security but not replace access control?
3. How does DHCP snooping help Dynamic ARP Inspection?
4. Why should unused switch ports be disabled?
5. Why should PortFast be limited to edge ports?

<!-- kind: content -->
## Summary
LAN attacks often target switching behavior, address assignment, ARP, and local discovery protocols. Good LAN security combines endpoint protection, secure management, AAA, port security, DHCP snooping, DAI, STP protections, and careful VLAN/trunk design.
