# WLAN Concepts
<!-- subject: Network Administration | year: 2nd -->

<!-- kind: content -->
## Introduction
Wireless LANs allow users to connect without physical Ethernet cables. WLANs are flexible and convenient, but they require careful design because radio frequency behavior, interference, security, and coverage affect performance.

<!-- kind: content -->
## Learning Goals
By the end of this module, you should be able to:

- Explain the benefits and limitations of wireless networks.
- Identify common wireless network types and technologies.
- Describe WLAN components such as wireless NICs, access points, and antennas.
- Explain BSS, ESS, association, and CSMA/CA.
- Describe CAPWAP, split MAC, and controller-based WLANs.
- Explain channel planning and common WLAN threats.
- Compare home and enterprise wireless authentication methods.

<!-- kind: content -->
## Benefits of Wireless
Wireless networks provide:

- mobility within a coverage area,
- easier device onboarding,
- reduced cabling needs,
- support for phones, tablets, IoT devices, and guests,
- flexible temporary or hard-to-wire deployments.

Wireless also has challenges, including interference, shared bandwidth, signal attenuation, and security exposure beyond physical walls.

<!-- kind: content -->
## Types of Wireless Networks
Common wireless network categories include:

- **WPAN:** personal-area technologies such as Bluetooth.
- **WLAN:** local wireless networks based on Wi-Fi.
- **WMAN:** metropolitan wireless coverage.
- **WWAN:** wide-area wireless such as cellular networks.

<!-- kind: content -->
## Wireless Technologies and Standards
Wi-Fi is based on IEEE 802.11 standards. Different 802.11 versions improve speed, frequency use, modulation, and efficiency. WLANs commonly operate in 2.4 GHz, 5 GHz, and newer 6 GHz bands depending on regulatory support and device capability.

Wireless standards organizations include IEEE for technical standards and Wi-Fi Alliance for interoperability certification.

<!-- kind: content -->
## Radio Frequencies
Wireless communication uses radio waves. Higher frequencies can carry more data but may have shorter range or reduced wall penetration. Lower frequencies often travel farther but may have fewer non-overlapping channels and more interference.

The 2.4 GHz band has longer reach but is crowded. The 5 GHz band usually offers more channels and less interference. The 6 GHz band provides additional spectrum for newer Wi-Fi devices where available.

<!-- kind: content -->
## WLAN Components
### Wireless NIC
A wireless network interface card allows a client device to connect to Wi-Fi networks.

### Wireless Home Router
A home wireless router often combines routing, switching, wireless access point, DHCP, NAT, and firewall functions.

### Wireless Access Point
An access point bridges wireless clients to a wired network. APs can be standalone or controller-managed.

### Antennas
Antennas affect coverage pattern and signal strength. Omnidirectional antennas radiate in many directions, while directional antennas focus signal in a specific direction.

<!-- kind: content -->
## WLAN Topology Modes
### BSS
A Basic Service Set is one access point and its associated wireless clients.

### ESS
An Extended Service Set uses multiple APs with the same SSID to provide wider coverage and roaming.

### Ad Hoc
Clients connect directly to each other without an AP. This is less common in managed enterprise WLANs.

<!-- kind: content -->
## 802.11 Frame Structure
Wireless frames include fields used for addressing, control, sequence handling, and frame validation. WLAN frames must support communication between wireless clients, APs, and the distribution system.

<!-- kind: content -->
## CSMA/CA
Wi-Fi uses Carrier Sense Multiple Access with Collision Avoidance. Wireless devices listen before transmitting and use timing mechanisms to reduce collisions. Unlike wired Ethernet, wireless devices cannot reliably detect collisions while transmitting, so avoiding collisions is essential.

<!-- kind: content -->
## Client and AP Association
Before sending data, a wireless client must discover and associate with an AP. The general process includes:

1. Discover available networks.
2. Select an SSID.
3. Authenticate using the configured method.
4. Associate with the AP.
5. Obtain network settings such as an IP address.

<!-- kind: content -->
## Passive and Active Discovery
- **Passive discovery:** The client listens for beacon frames sent by APs.
- **Active discovery:** The client sends probe requests looking for specific or available networks.

<!-- kind: content -->
## CAPWAP and Controller-Based WLANs
Control and Provisioning of Wireless Access Points (CAPWAP) allows lightweight APs to communicate with a wireless LAN controller. The controller centralizes WLAN configuration, monitoring, and management.

In split MAC architecture, some functions are handled by the AP and others by the controller. This helps centralize policy while keeping time-sensitive wireless operations near the client.

CAPWAP can use DTLS encryption to protect control traffic between APs and controllers.

<!-- kind: content -->
## FlexConnect APs
FlexConnect designs allow APs at remote sites to switch some traffic locally instead of tunneling all client traffic back to a controller. This is useful for branch offices with WAN constraints.

<!-- kind: content -->
## Channel Management
Wireless channels must be planned to reduce overlap and interference. Poor channel planning can cause co-channel and adjacent-channel interference, reducing throughput.

Good WLAN planning considers:

- coverage area,
- capacity requirements,
- AP placement,
- channel reuse,
- transmit power,
- building materials,
- expected client density.

<!-- kind: activity -->
## Activity: WLAN Planning Checklist
For a classroom or office WLAN, identify:

1. How many users need coverage?
2. Which devices will connect?
3. Which applications are most important?
4. Where are walls, metal objects, or sources of interference?
5. Which channels can be reused without excessive overlap?
6. Is guest access required?
7. Is enterprise authentication required?

<!-- kind: content -->
## WLAN Threats
Wireless networks are exposed through the air, so attackers may not need physical access to a wall jack. Common threats include:

- denial-of-service interference or deauthentication attacks,
- rogue access points,
- evil twin networks,
- man-in-the-middle attacks,
- weak passwords,
- outdated encryption.

<!-- kind: content -->
## WLAN Security Methods
Basic security techniques include SSID naming, authentication, and encryption. SSID hiding and MAC address filtering provide limited protection and should not be treated as strong security.

Older methods such as WEP are insecure and should not be used. WPA2 and WPA3 are stronger options.

<!-- kind: content -->
## Home and Enterprise Authentication
Home networks commonly use a pre-shared key: users connect with one shared Wi-Fi password.

Enterprise networks often use 802.1X with a RADIUS server. This allows individual user or device authentication and better accounting.

<!-- kind: content -->
## WPA3
WPA3 improves wireless security compared with older methods. It provides stronger authentication protections and better resistance against offline password guessing in personal networks. Use WPA3 where supported, while considering compatibility with older devices.

<!-- kind: activity -->
## Activity: Choose a WLAN Security Design
For each environment, choose a security approach:

| Environment | Suggested Design |
|---|---|
| Home network | WPA2-Personal or WPA3-Personal with a strong passphrase |
| Small office without RADIUS | WPA2/WPA3-Personal, separate guest SSID |
| Enterprise | WPA2/WPA3-Enterprise with 802.1X/RADIUS |
| Public guest Wi-Fi | Guest isolation, captive portal if needed, separate VLAN |

<!-- kind: content -->
## Summary
WLANs provide mobility but require careful radio and security planning. AP placement, channel selection, authentication, encryption, and threat mitigation all affect reliability and safety.
