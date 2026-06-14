# Build a Small Network
<!-- subject: Data Communications and Networking | year: 2nd -->


<!-- kind: content -->
## Introduction

A small network can support users, applications, file sharing, internet access, and basic security. Building one requires planning devices, addressing, connectivity, verification, and troubleshooting procedures.

<!-- kind: content -->
## Devices in a Small Network

A small network commonly includes:

- Router or internet gateway
- Switch
- Wireless access point
- End devices such as PCs, laptops, phones, and printers
- Servers or shared storage, if needed
- Firewall features or a dedicated firewall

The device selection should match user needs, expected traffic, growth, budget, and security requirements.

<!-- kind: content -->
## Redundancy in a Small Network

Redundancy means having backup paths, devices, or services. Small networks may have limited redundancy because of cost, but important services should still be considered.

Examples:

- Backup internet connection
- Spare switch or router
- Backup power supply
- Cloud backup for critical files
- Redundant links for important devices

<!-- kind: content -->
## Traffic Management

Small networks may carry web traffic, email, file transfers, printing, voice, video, and cloud application data. Time-sensitive traffic such as voice or video may need prioritization if bandwidth is limited.

Traffic management may involve QoS, bandwidth planning, separating guest traffic, and monitoring usage.

<!-- kind: content -->
## Small Network Applications and Protocols

Common services include:

| Service | Protocols or Technologies |
|---|---|
| Web access | HTTP, HTTPS, DNS |
| Email | SMTP, IMAP, POP3 |
| Address assignment | DHCP |
| File sharing | SMB or secure file transfer |
| Remote management | SSH |
| Connectivity testing | ICMP |

<!-- kind: content -->
## Scaling to Larger Networks

A small network should be designed so it can grow. Good practices include structured addressing, clear device names, documentation, cable labeling, scalable IP subnets, secure management, and consistent configuration standards.

<!-- kind: content -->
## Verify Connectivity

Verification confirms that the network works as intended. Start with the local device and move outward.

Suggested order:

1. Check physical connections and link lights.
2. Check IP address, subnet mask, gateway, and DNS settings.
3. Ping the loopback address.
4. Ping the local IP address.
5. Ping the default gateway.
6. Ping a remote IP address.
7. Ping a domain name.
8. Use traceroute if remote connectivity fails.

<!-- kind: activity -->
## Host Verification Commands

Windows:

```text
ipconfig
ipconfig /all
ping <destination>
tracert <destination>
nslookup <domain-name>
```

Linux/macOS:

```text
ip address
ip route
ping <destination>
traceroute <destination>
nslookup <domain-name>
```

<!-- kind: activity -->
## IOS Verification Commands

```text
show running-config
show ip interface brief
show interfaces
show ip route
show arp
show mac address-table
ping <destination>
traceroute <destination>
```

Use the output to identify addressing errors, interface problems, missing routes, or Layer 2 learning issues.

<!-- kind: content -->
## Troubleshooting Methodologies

Structured troubleshooting avoids random guessing.

Common approaches include:

| Method | Description |
|---|---|
| Bottom-up | Start at the physical layer and move upward. |
| Top-down | Start with the application and move downward. |
| Divide-and-conquer | Test from the middle to narrow the problem area. |
| Follow-the-path | Trace the actual traffic path hop by hop. |
| Substitution | Replace a suspected faulty component with a known good one. |
| Comparison | Compare a nonworking setup with a working setup. |

<!-- kind: content -->
## Default Gateway Issues

If a host can reach local devices but cannot reach remote networks, the default gateway may be missing, incorrect, or unreachable. The host's gateway must be in the same local network as the host.

Common symptoms:

- Can ping own IP address.
- Can ping local devices.
- Cannot ping outside the local network.
- Cannot reach internet resources by IP address.

<!-- kind: content -->
## DNS Issues

If a host can reach remote IP addresses but cannot reach websites by name, DNS may be the problem. Check DNS server configuration and test name resolution with tools such as `nslookup`.

Common symptoms:

- `ping 8.8.8.8` works.
- `ping example.com` fails.
- Browser cannot load websites by name.

<!-- kind: activity -->
## Small Network Design Activity

Design a small network for an office with:

- 20 users
- 1 network printer
- Wi-Fi for employees
- Guest Wi-Fi
- Internet access
- Basic security controls

Include:

1. Devices needed
2. IP addressing plan
3. Default gateway
4. DHCP scope
5. Security measures
6. Verification tests

<!-- kind: activity -->
## Troubleshooting Scenario

A user says, “I can print to the office printer, but I cannot open any websites.”

Answer:

1. Is the local network working? What evidence supports your answer?
2. What should you test next?
3. How would you check the default gateway?
4. How would you check DNS?
5. What commands would you use?

<!-- kind: activity -->
## Review Questions

1. What devices are commonly found in a small network?
2. Why is documentation important even for small networks?
3. What is the difference between a default gateway problem and a DNS problem?
4. Which troubleshooting method starts at the physical layer?
5. Why should network designs consider future growth?
