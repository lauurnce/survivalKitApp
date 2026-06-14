# Networking Today
<!-- subject: Data Communications and Networking | year: 2nd -->


<!-- kind: content -->
## Introduction

Computer networks allow people, devices, applications, and services to exchange information. They support everyday activities such as messaging, online classes, video calls, file sharing, web browsing, online banking, cloud storage, and remote work. A network removes many distance limitations by allowing devices in different locations to communicate through shared standards and communication paths.

<!-- kind: content -->
## Networks Affect Daily Life

Modern communication depends on networked systems. A single user may interact with many networks in one day: a home Wi-Fi network, a cellular network, a school or office network, and the public internet. These networks make it possible to join global communities, access online services, and collaborate with people who are not physically nearby.

<!-- kind: content -->
## Network Components

A device connected to a network is often called a **host** or **end device**. End devices create, request, send, receive, or display data. Examples include laptops, smartphones, printers, servers, IP phones, and tablets.

A **client** requests a service. A **server** provides a service. For example, a web browser is a client when it asks a web server for a page. The server responds by sending the requested content.

| Server Type | Main Purpose |
|---|---|
| Email server | Handles sending, receiving, and storing email. |
| Web server | Delivers websites and web application content. |
| File server | Stores shared files for users or applications. |

<!-- kind: content -->
## Peer-to-Peer Networks

In a **peer-to-peer network**, each device can act as both a client and a server. One computer may share a file while another shares a printer. This design is simple and inexpensive, but it is usually appropriate only for very small networks because management, security, and performance become harder as more devices are added.

| Strengths | Limitations |
|---|---|
| Easy to set up | No central management point |
| Lower cost | Weaker security control |
| Useful for simple sharing | Difficult to expand cleanly |
| Requires less infrastructure | Performance may decrease as usage grows |

<!-- kind: content -->
## End Devices and Intermediary Devices

**End devices** are the source or destination of messages. A message may begin on a phone, pass through several network devices, and end at a server.

**Intermediary devices** connect end devices and help data move through the network. Examples include switches, routers, wireless access points, firewalls, and multilayer switches. These devices may forward frames, choose routes, filter traffic, regenerate signals, keep path information, and notify other devices when communication problems occur.

<!-- kind: content -->
## Network Media

Network media are the paths used to carry signals.

| Medium | Signal Type |
|---|---|
| Copper cable | Electrical signals |
| Fiber-optic cable | Light pulses |
| Wireless | Radio-frequency electromagnetic waves |

**Diagram description:** A typical network media diagram compares copper cables, fiber strands/connectors, and wireless routers or antennas. The purpose of the diagram is to show that network communication can move through physical cables or through the air.

<!-- kind: content -->
## Network Representations and Topologies

Network diagrams use symbols to represent devices, connections, and addressing information. They help technicians understand the network before installing, configuring, or troubleshooting it.

Important terms:

- **Network Interface Card (NIC):** Hardware that connects a device to a network.
- **Physical port:** A connector where a cable can be attached.
- **Interface:** A communication connection on a device. In many networking discussions, “port” and “interface” are used similarly.

A **physical topology** shows the actual placement of devices and cabling. A **logical topology** shows how data moves, including devices, ports, networks, and addressing.

<!-- kind: content -->
## Common Network Types

Networks can be small or extremely large.

| Network Scale | Description |
|---|---|
| Small home network | Connects a few personal devices to each other and to the internet. |
| Small office/home office network | Supports a small workplace or remote worker. |
| Medium or large network | Connects many users, departments, and locations. |
| Worldwide network | Connects massive numbers of devices across regions, such as the internet. |

A **Local Area Network (LAN)** covers a limited area such as a room, building, or campus. A **Wide Area Network (WAN)** connects networks across larger geographic areas and often uses service provider infrastructure.

| LAN | WAN |
|---|---|
| Limited geographic area | Large geographic area |
| Usually controlled by one person or organization | Often involves service providers |
| Typically high speed internally | Often slower or more costly than LAN links |
| Connects nearby end devices | Connects multiple LANs |

<!-- kind: content -->
## The Internet, Intranets, and Extranets

The **internet** is a global system of interconnected networks. It is not owned by one person or company; it works because many organizations follow common protocols and standards.

An **intranet** is a private internal network for authorized users inside an organization. An **extranet** gives selected outside users secure access to specific internal resources, such as partner portals or supplier systems.

<!-- kind: content -->
## Internet Connection Technologies

Home and small office internet access may use cable, DSL, cellular, satellite, or dial-up. Businesses often need higher bandwidth, dedicated links, managed support, and stronger reliability. Business connections may include leased lines, Ethernet WAN services, business DSL, or satellite where wired service is unavailable.

<!-- kind: content -->
## Converged Networks

A **converged network** carries data, voice, and video over the same infrastructure. Instead of maintaining separate systems for telephones, video, and computer data, one network can support several communication services using common standards.

<!-- kind: content -->
## Reliable Networks

Reliable network design focuses on four major characteristics:

| Characteristic | Meaning |
|---|---|
| Fault tolerance | The network continues operating even when a component fails. |
| Scalability | The network can grow without major redesign. |
| Quality of Service (QoS) | Important traffic can be prioritized when bandwidth is limited. |
| Security | Devices, data, and services are protected from misuse or attack. |

Fault tolerance often uses redundant paths. Packet switching also helps because data is divided into packets that can be forwarded across available paths.

QoS is important for delay-sensitive traffic such as voice and live video. Without prioritization, calls may become choppy or video may freeze when the network is congested.

Security protects three major goals: **confidentiality** so only authorized users can read data, **integrity** so data is not improperly changed, and **availability** so services remain usable when needed.

<!-- kind: content -->
## Current Network Trends

Important trends include Bring Your Own Device (BYOD), online collaboration, video communication, cloud computing, smart homes, powerline networking, and wireless broadband.

BYOD lets users connect personal devices such as laptops, tablets, and phones for study or work. Collaboration tools allow people to work together through chat, shared files, shared documents, and video meetings. Cloud computing allows users to store data or run applications on internet-connected servers rather than only on local devices.

Cloud models include public clouds, private clouds, hybrid clouds, and cloud environments designed for a specific organization or industry.

<!-- kind: content -->
## Network Security Threats and Solutions

Threats may be external, such as malware, denial-of-service attacks, identity theft, data interception, or zero-day attacks. They may also be internal, such as lost devices, careless handling of data, accidental misuse, or malicious actions by trusted users.

Security is strongest when applied in layers. Small networks commonly use antivirus tools, antispyware tools, firewalls, strong passwords, and secure Wi-Fi settings. Larger networks may also use dedicated firewalls, access control lists, intrusion prevention systems, VPNs, device hardening, monitoring, and logging.

<!-- kind: activity -->
## Review Questions

1. How do networks affect daily life?
2. What is the difference between a client and a server?
3. Why is peer-to-peer networking usually better for small networks than large networks?
4. Compare end devices and intermediary devices.
5. Explain the difference between physical and logical topology.
6. Give one example of a converged network.
7. Explain confidentiality, integrity, and availability using simple examples.
8. How can BYOD help students?
9. Why are internal threats important to address?
10. List two entry-level networking jobs and identify the technical and soft skills they require.

<!-- kind: activity -->
## Device Classification Exercise

Classify each item as an end device, intermediary device, or network medium.

| Item | Classification |
|---|---|
| Laptop |  |
| Router |  |
| Fiber-optic cable |  |
| Smartphone |  |
| Switch |  |
| Wireless access point |  |
| Printer |  |
| Copper Ethernet cable |  |
| Firewall |  |
