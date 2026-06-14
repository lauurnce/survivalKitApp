# Data Link Layer
<!-- subject: Data Communications and Networking | year: 2nd -->


<!-- kind: content -->
## Introduction

The data link layer prepares network layer packets for transmission over a specific medium. It handles local delivery, media access, frame formatting, and error detection on a single link.

<!-- kind: content -->
## Purpose of the Data Link Layer

The data link layer receives packets from the network layer and encapsulates them into frames. It also controls how devices place and receive data on the medium.

Main responsibilities include:

- Framing packets for local transmission
- Identifying local source and destination devices
- Controlling access to the medium
- Detecting transmission errors
- Supporting different physical media

<!-- kind: content -->
## Data Link Sublayers

IEEE LAN technologies commonly divide the data link layer into two sublayers.

| Sublayer | Role |
|---|---|
| Logical Link Control (LLC) | Identifies the network layer protocol carried in the frame. |
| Media Access Control (MAC) | Handles local addressing, framing, and media access rules. |

The MAC sublayer is especially important in Ethernet and wireless networks because it defines how devices share the medium.

<!-- kind: content -->
## Topologies

A topology describes how devices are arranged or how data flows.

A **physical topology** shows physical placement and cabling. A **logical topology** shows how frames move from one device to another.

WAN topologies may include point-to-point, hub-and-spoke, or mesh designs. LAN topologies are commonly built around switches, where many devices connect to a central switching device.

<!-- kind: content -->
## Half-Duplex and Full-Duplex Communication

In **half-duplex** communication, a device can send or receive at a given time, but not both simultaneously. This can create collisions when devices share the medium.

In **full-duplex** communication, devices can send and receive at the same time. Modern switched Ethernet commonly uses full-duplex communication.

<!-- kind: content -->
## Access Control Methods

When multiple devices share a medium, they need rules for deciding when to transmit.

| Method | Description |
|---|---|
| Contention-based access | Devices compete for the medium and transmit when it appears available. |
| Controlled access | Devices take turns or receive permission before transmitting. |

### CSMA/CD

Carrier Sense Multiple Access with Collision Detection (CSMA/CD) was used in older shared Ethernet environments. A device listened before transmitting. If a collision occurred, devices stopped, waited, and tried again.

Modern switched Ethernet greatly reduces or eliminates collisions because each switch port is its own collision domain and usually operates in full duplex.

<!-- kind: content -->
## Data Link Frame

A frame contains the information needed for local delivery. Although frame formats vary by technology, Ethernet frames commonly include:

- Preamble and start frame delimiter
- Destination MAC address
- Source MAC address
- Type or length field
- Encapsulated data
- Frame Check Sequence (FCS) for error detection

**Diagram description:** A frame diagram usually displays the frame as a row of labeled fields. It shows that the packet is placed inside a frame with MAC addressing and error-checking information.

<!-- kind: activity -->
## Frame Analysis Practice

Answer the following:

1. Which frame field identifies the local receiving device?
2. Which frame field identifies the local sending device?
3. What field helps detect whether a frame was damaged?
4. Why does the data link layer need to know the type of network layer protocol being carried?

<!-- kind: activity -->
## Duplex Scenario

A legacy hub connects several computers. Users complain that performance is poor when many users send files at the same time.

1. Is this environment likely to experience collisions? Why?
2. Would a switch improve the situation? Explain.
3. Why is full-duplex communication better for modern Ethernet?

<!-- kind: activity -->
## Review Questions

1. What is the role of the data link layer?
2. How are LLC and MAC different?
3. Compare physical and logical topologies.
4. What is the difference between half duplex and full duplex?
5. Why is framing necessary?
