# Physical Layer
<!-- subject: Data Communications and Networking | year: 2nd -->


<!-- kind: content -->
## Introduction

The physical layer is responsible for moving raw bits across a network medium. It defines how bits are represented as electrical signals, light pulses, or radio waves and how devices connect physically.

<!-- kind: content -->
## Purpose of the Physical Layer

The physical layer accepts frames from the data link layer and converts them into signals that can travel across the chosen medium. At the receiving end, the physical layer converts the signals back into bits.

It defines characteristics such as:

- Cable and connector types
- Pin layouts
- Voltage or light signaling
- Wireless frequencies
- Encoding methods
- Data rates
- Maximum distances

<!-- kind: content -->
## Physical Layer Standards

Physical layer standards are created so equipment from different manufacturers can work together. Standards define how devices connect, how signals are transmitted, and how media are built.

Physical layer technologies are affected by bandwidth needs, distance, interference, cost, and installation environment.

<!-- kind: content -->
## Bandwidth and Performance Terms

**Bandwidth** is the capacity of a medium to carry data, commonly measured in bits per second.

| Unit | Meaning |
|---|---|
| bps | Bits per second |
| Kbps | Thousands of bits per second |
| Mbps | Millions of bits per second |
| Gbps | Billions of bits per second |
| Tbps | Trillions of bits per second |

Related terms:

- **Latency:** Delay experienced while data travels from source to destination.
- **Throughput:** Actual measured data transfer rate.
- **Goodput:** Useful application data rate after overhead and retransmissions are removed.

<!-- kind: content -->
## Copper Cabling

Copper cabling uses electrical signals. It is common, affordable, and easy to install, but it can be affected by electromagnetic interference and distance limitations.

Common copper cable issues include:

- Signal weakening over distance
- Interference from motors, lights, and power cables
- Crosstalk between wire pairs
- Incorrect termination

<!-- kind: content -->
## Types of Copper Cabling

### Coaxial Cable

Coaxial cable has a central conductor, insulation, shielding, and an outer jacket. It has been used for cable internet, television systems, and some older networking technologies.

### Unshielded Twisted Pair

Unshielded Twisted Pair (UTP) cable is widely used in Ethernet LANs. It contains pairs of wires twisted together to reduce interference.

### Shielded Twisted Pair

Shielded Twisted Pair (STP) adds shielding to reduce interference. It may be useful in environments with high electrical noise, but it is usually more expensive and less flexible than UTP.

<!-- kind: content -->
## Straight-Through and Crossover Cables

A straight-through Ethernet cable connects different device types, such as a PC to a switch. A crossover cable connects similar device types, such as switch to switch or PC to PC, in older environments.

Many modern devices support Auto-MDIX, which automatically adjusts transmit and receive pairs, reducing the need to choose the cable type manually.

<!-- kind: content -->
## Fiber-Optic Cabling

Fiber-optic cable uses light instead of electrical signals. It supports high bandwidth and long distances and is resistant to electromagnetic interference.

| Fiber Type | Description |
|---|---|
| Single-mode fiber | Small core, laser-based transmission, long distances. |
| Multimode fiber | Larger core, LED or lower-cost light sources, shorter distances. |

Fiber is commonly used in backbone links, data centers, long-haul service provider networks, fiber-to-the-home installations, and undersea cable systems.

**Diagram description:** A fiber diagram commonly shows light pulses traveling through a thin glass core. Single-mode fiber is shown with a narrow straight path, while multimode fiber is shown with several light paths bouncing through the core.

<!-- kind: content -->
## Wireless Media

Wireless communication uses radio waves instead of cables. It is convenient and flexible, but it is affected by distance, obstacles, interference, security settings, and signal strength.

Common wireless technologies include Wi-Fi, Bluetooth, cellular networks, and point-to-point wireless links.

<!-- kind: activity -->
## Media Selection Exercise

Choose the best medium for each situation and explain your answer.

1. A short desktop-to-switch connection inside a computer laboratory.
2. A backbone connection between two buildings.
3. Temporary internet access for users in a conference room.
4. Internet service for a rural home without cable or DSL.
5. A high-speed connection inside a data center with strong resistance to interference.

<!-- kind: activity -->
## Bandwidth Conversion Practice

Convert the following:

1. 1 Gbps = ______ Mbps
2. 100 Mbps = ______ Kbps
3. 10 Mbps = ______ bps
4. 1 Tbps = ______ Gbps

<!-- kind: activity -->
## Review Questions

1. What does the physical layer do?
2. Why is copper cabling vulnerable to interference?
3. What are the advantages of fiber-optic cabling?
4. How does wireless media differ from wired media?
5. What is the difference between bandwidth and throughput?
