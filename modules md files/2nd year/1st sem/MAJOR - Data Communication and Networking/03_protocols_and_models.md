# Protocols and Models
<!-- subject: Data Communications and Networking | year: 2nd -->


<!-- kind: content -->
## Introduction

Network communication works because devices follow agreed rules. These rules define how messages are formatted, addressed, transmitted, received, checked, and interpreted. In networking, these rules are called **protocols**.

<!-- kind: content -->
## Communication Rules

Human communication and network communication both require rules. For a message to succeed, the sender and receiver must understand the message format, language, timing, and expected response.

Network rules commonly define:

- Message encoding
- Message formatting and encapsulation
- Message size
- Message timing
- Delivery options
- Error handling

A message may be sent to one destination, many destinations, or all devices in a local network segment.

| Delivery Type | Description |
|---|---|
| Unicast | One sender to one receiver. |
| Multicast | One sender to a selected group. |
| Broadcast | One sender to all devices in the local broadcast domain. |

<!-- kind: content -->
## Protocols

A **protocol** is a set of rules that controls one part of communication. Network communication requires many protocols working together. For example, one protocol may handle addressing, another may handle routing, another may handle reliability, and another may handle application data.

Protocols may define:

- How data is formatted
- How addresses are used
- How errors are reported
- How data is divided and reassembled
- How devices know when to send
- How sessions begin and end

<!-- kind: content -->
## Protocol Suites

A **protocol suite** is a group of protocols designed to work together. The most important suite in modern networking is the TCP/IP protocol suite, which supports communication on the internet and most private networks.

Common TCP/IP protocols include:

| Protocol | Purpose |
|---|---|
| IP | Provides logical addressing and packet delivery. |
| TCP | Provides reliable transport between applications. |
| UDP | Provides lightweight, connectionless transport. |
| HTTP/HTTPS | Supports web communication. |
| DNS | Resolves names to IP addresses. |
| DHCP | Assigns IP configuration automatically. |
| ICMP | Reports errors and supports testing tools such as ping. |

<!-- kind: content -->
## Standards Organizations

Networking depends on open standards so devices from different vendors can interoperate. Standards organizations develop and maintain technical rules for internet technologies, Ethernet, wireless networks, addressing, and many other systems.

Examples of standards-related groups include organizations focused on internet protocols, addressing coordination, electrical and electronic standards, and telecommunications.

<!-- kind: content -->
## Reference Models

A **reference model** divides network communication into layers. Layered models make complex systems easier to study because each layer has a defined role.

### OSI Model

| Layer | Name | Main Idea |
|---|---|---|
| 7 | Application | Network services used by applications. |
| 6 | Presentation | Data formatting, encoding, compression, or encryption. |
| 5 | Session | Manages conversations between applications. |
| 4 | Transport | End-to-end delivery between processes. |
| 3 | Network | Logical addressing and routing. |
| 2 | Data Link | Local delivery on the same network medium. |
| 1 | Physical | Transmission of bits through media. |

### TCP/IP Model

| TCP/IP Layer | Related OSI Layers | Main Idea |
|---|---|---|
| Application | OSI 5–7 | Application services and data representation. |
| Transport | OSI 4 | TCP and UDP communication between applications. |
| Internet | OSI 3 | IP addressing and routing. |
| Network Access | OSI 1–2 | Local media access and physical transmission. |

<!-- kind: content -->
## Data Encapsulation

As data moves down the protocol stack, each layer adds control information. This process is called **encapsulation**. The unit of data at each stage is often called a **Protocol Data Unit (PDU)**.

| Layer Context | PDU Name |
|---|---|
| Application data | Data |
| Transport layer | Segment or datagram |
| Network layer | Packet |
| Data link layer | Frame |
| Physical layer | Bits |

When data reaches the destination, the receiving device removes the added information step by step. This reverse process is called **de-encapsulation**.

**Diagram description:** An encapsulation diagram usually shows data moving downward through layers. Each layer adds a header, and the data becomes a segment, packet, frame, and finally bits on the medium.

<!-- kind: content -->
## Data Access

To deliver data, a device needs both logical and physical addressing. The IP address identifies the source and destination across networks, while the MAC address is used for delivery on the local link.

When a message stays within the same network, the sender uses the destination device's MAC address. When a message must reach a remote network, the sender uses the MAC address of the default gateway for the next local hop.

<!-- kind: activity -->
## Encapsulation Practice

Place the following PDU names in the correct order as data moves from an application to the network medium:

- Frame
- Data
- Bits
- Packet
- Segment

Then explain what type of information is added at the transport, network, and data link layers.

<!-- kind: activity -->
## Model Matching Exercise

Match each function to the best OSI layer.

| Function | OSI Layer |
|---|---|
| Routing packets between networks |  |
| Sending bits as electrical or wireless signals |  |
| Reliable delivery using sequencing and acknowledgments |  |
| Local delivery using MAC addresses |  |
| Web browser access to network services |  |

<!-- kind: activity -->
## Review Questions

1. Why are protocols necessary in network communication?
2. What is a protocol suite?
3. How does the TCP/IP model differ from the OSI model?
4. What happens during encapsulation?
5. Why does a device need both IP and MAC addressing?
