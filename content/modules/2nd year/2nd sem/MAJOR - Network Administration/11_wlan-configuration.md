# WLAN Configuration
<!-- subject: Network Administration | year: 2nd -->

<!-- kind: content -->
## Introduction
WLAN configuration can be performed on home wireless routers, standalone APs, or centralized wireless LAN controllers. The exact interface varies by vendor, but the core ideas remain the same: configure network addressing, SSID, security, VLAN mapping, and verification.

<!-- kind: content -->
## Learning Goals
By the end of this module, you should be able to:

- Identify common home wireless router settings.
- Explain basic wireless setup options.
- Describe NAT, QoS, and port forwarding in small networks.
- Outline WLAN creation on a wireless LAN controller.
- Explain how WPA2-Enterprise uses RADIUS.
- Troubleshoot common wireless connection and performance problems.

<!-- kind: content -->
## Logging in to a Wireless Router
A home or small-office router is usually configured through a web interface. Basic access steps are:

1. Connect to the router by Ethernet or default Wi-Fi.
2. Open the router's management IP address in a browser.
3. Log in with administrative credentials.
4. Change default passwords immediately.
5. Save and test changes after configuration.

Do not leave default administrator credentials in place.

<!-- kind: content -->
## Basic Network Setup
Common basic settings include:

- router LAN IP address,
- DHCP server range,
- subnet mask,
- DNS settings,
- time zone and device name,
- firmware update settings.

The router LAN IP often becomes the default gateway for local clients.

<!-- kind: content -->
## Basic Wireless Setup
Important wireless settings include:

- SSID or network name,
- wireless band selection,
- channel or automatic channel selection,
- security mode,
- Wi-Fi password or enterprise authentication settings,
- guest network settings,
- transmit power when supported.

Use strong encryption, preferably WPA2 or WPA3. Avoid WEP and weak passwords.

<!-- kind: activity -->
## Activity: Home Router Configuration Checklist
Use this checklist when configuring a small wireless router:

1. Change the administrator password.
2. Set a clear but non-sensitive SSID.
3. Use WPA2/WPA3 security with a strong passphrase.
4. Disable WPS if not needed.
5. Configure DHCP range and DNS settings.
6. Create a separate guest network if guests need access.
7. Update firmware.
8. Save the configuration and test client connectivity.

<!-- kind: content -->
## Wireless Mesh Networks
A mesh network uses multiple wireless nodes to extend coverage. Mesh can simplify coverage expansion, but performance depends on placement, backhaul quality, and interference. Wired backhaul is usually more reliable than wireless backhaul when available.

<!-- kind: content -->
## NAT for IPv4
Network Address Translation allows many private IPv4 devices to share one public IPv4 address. In home routers, NAT is commonly enabled by default on the internet-facing connection.

<!-- kind: content -->
## Quality of Service
Quality of Service prioritizes important traffic such as voice, video, or conferencing. QoS does not create extra bandwidth, but it can reduce delay and jitter for selected traffic during congestion.

<!-- kind: content -->
## Port Forwarding
Port forwarding allows inbound traffic from the internet to reach a specific internal device and port. It should be used carefully because it exposes internal services. Only forward ports that are necessary and secure.

<!-- kind: activity -->
## Activity: Port Forwarding Planning
Before creating a port forward, answer:

1. Which internal device needs inbound access?
2. What internal IP address does it use?
3. Which protocol and port are required?
4. Is the service patched and password-protected?
5. Can a VPN be used instead of direct exposure?

<!-- kind: content -->
## Wireless LAN Controller Overview
A wireless LAN controller (WLC) centrally manages lightweight APs and WLAN settings. Instead of configuring every AP separately, administrators configure SSIDs, security, interfaces, VLAN mappings, and policies on the controller.

<!-- kind: content -->
## Viewing AP Information
A WLC can show joined APs, their operational status, assigned channels, clients, and software version. This helps verify that APs are connected and ready before creating or modifying WLANs.

<!-- kind: content -->
## Configure a Basic WLAN on a WLC
The general WLC workflow is:

1. Create a WLAN profile and SSID.
2. Assign a WLAN ID or profile name.
3. Map the WLAN to an interface or VLAN.
4. Choose security settings.
5. Enable the WLAN.
6. Test with a wireless client.

<!-- kind: activity -->
## Activity: WLC WLAN Configuration Outline
Use this vendor-neutral checklist:

```text
1. Log in to the WLC.
2. Confirm APs have joined the controller.
3. Create a new WLAN/SSID.
4. Map the WLAN to the correct VLAN/interface.
5. Configure WPA2/WPA3 security.
6. Apply or save the configuration.
7. Enable the WLAN.
8. Connect a test client.
9. Verify the client receives the correct IP address.
10. Test gateway and internet or internal connectivity.
```

<!-- kind: content -->
## WPA2-Enterprise WLANs
WPA2-Enterprise uses 802.1X authentication, typically with a RADIUS server. Instead of one shared Wi-Fi password, users or devices authenticate with individual credentials or certificates.

Common components:

- WLC or AP acting as authenticator,
- RADIUS server,
- user/device identity store,
- client supplicant.

<!-- kind: content -->
## SNMP and RADIUS Settings
SNMP can be used for monitoring. RADIUS is used for centralized authentication, authorization, and accounting.

When configuring RADIUS, confirm:

- server IP address,
- shared secret,
- authentication and accounting ports,
- reachability between WLC and server,
- correct time settings if certificates are involved.

<!-- kind: activity -->
## Activity: WPA2-Enterprise Planning
Fill in the following before configuring an enterprise WLAN:

| Item | Value |
|---|---|
| SSID |  |
| VLAN/interface |  |
| RADIUS server IP |  |
| Shared secret |  |
| Authentication method |  |
| Test user/device |  |
| DHCP scope |  |
| DNS server |  |

<!-- kind: content -->
## DHCP Scope for WLAN Clients
Wireless clients need valid IP settings. Depending on the design, DHCP may be provided by a router, server, firewall, or the WLC itself. The WLAN VLAN/interface must match the DHCP scope intended for those clients.

<!-- kind: content -->
## Troubleshooting Wireless Client Connection Problems
If a client cannot connect:

- Confirm the SSID is enabled and visible if it should be broadcast.
- Confirm the client supports the selected security mode.
- Check password, certificate, or 802.1X credentials.
- Verify RADIUS reachability for enterprise WLANs.
- Confirm the client is in range and not blocked by policy.
- Check whether MAC filtering or client limits are applied.
- Verify DHCP is working after association.

<!-- kind: content -->
## Troubleshooting Slow WLAN Performance
If the wireless network is slow:

- Check signal strength and distance from AP.
- Look for interference from nearby networks or devices.
- Verify channel plan and channel width.
- Check AP/client capabilities.
- Identify overloaded APs.
- Test wired network performance to separate wireless issues from upstream issues.
- Update firmware when appropriate.

<!-- kind: activity -->
## Activity: Wireless Troubleshooting Flow
1. Can the client see the SSID?
2. Can the client authenticate?
3. Does the client associate with an AP?
4. Does the client receive a correct IP address?
5. Can the client ping the gateway?
6. Can the client reach DNS?
7. Can the client reach the required application?
8. Is performance acceptable near the AP and farther away?

<!-- kind: content -->
## Updating Firmware
Firmware updates can fix bugs, improve security, and add device support. Before updating, read release notes, back up the current configuration, schedule downtime if needed, and verify the device after the update.

<!-- kind: content -->
## Summary
WLAN configuration includes SSID creation, security selection, VLAN/interface mapping, DHCP planning, and client testing. Home routers combine many functions in one device, while WLCs centralize AP and WLAN management for larger networks.
