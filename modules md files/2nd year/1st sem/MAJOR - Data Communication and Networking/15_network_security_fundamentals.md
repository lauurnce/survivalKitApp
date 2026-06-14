# Network Security Fundamentals
<!-- subject: Data Communications and Networking | year: 2nd -->


<!-- kind: content -->
## Introduction

Network security protects devices, data, users, and services. Even basic networks need security because attackers may attempt to steal information, disrupt services, or gain unauthorized access.

<!-- kind: content -->
## Security Threats and Vulnerabilities

A **threat** is a potential danger. A **vulnerability** is a weakness that can be exploited. A **mitigation** is a control used to reduce risk.

Attackers may exploit weak passwords, outdated software, misconfigured devices, unprotected remote access, insecure wireless settings, or careless user behavior.

<!-- kind: content -->
## Types of Network Attacks

Common attack categories include:

| Attack Type | Description |
|---|---|
| Malware | Harmful software such as viruses, worms, ransomware, or Trojans. |
| Reconnaissance | Gathering information before an attack. |
| Access attack | Attempting to gain unauthorized entry. |
| Denial-of-service | Attempting to make a service unavailable. |
| Spoofing | Pretending to be another device or user. |
| Man-in-the-middle | Intercepting or altering communication between parties. |

<!-- kind: content -->
## Access Attacks

Access attacks target accounts, passwords, devices, or services. Examples include password guessing, brute-force attempts, credential theft, privilege escalation, and exploiting unsecured management services.

Strong authentication, account lockout policies, least privilege, and secure management protocols help reduce access attack risk.

<!-- kind: content -->
## Network Attack Mitigations

Effective security uses multiple layers.

Common mitigations include:

- Keep software and firmware updated.
- Use strong unique passwords.
- Disable unused services and ports.
- Use SSH instead of Telnet.
- Apply least privilege.
- Use firewalls and access control lists.
- Segment networks.
- Monitor logs and alerts.
- Back up important data.
- Train users to recognize social engineering.

<!-- kind: content -->
## Authentication, Authorization, and Accounting

AAA is a security framework.

| Component | Question Answered |
|---|---|
| Authentication | Who are you? |
| Authorization | What are you allowed to do? |
| Accounting | What did you do? |

AAA helps organizations control and record access to network devices and services.

<!-- kind: content -->
## Firewalls

A firewall filters traffic based on rules. It may allow, deny, inspect, or log traffic. Firewalls can protect the boundary between networks and can also segment internal networks.

Firewall rules may use source address, destination address, protocol, port, application, or connection state.

<!-- kind: content -->
## Endpoint Security

Endpoint devices such as laptops and phones are common targets. Endpoint security may include antivirus tools, host firewalls, operating system updates, disk encryption, device locking, and safe browsing practices.

<!-- kind: content -->
## Device Security

Routers and switches should be hardened. Basic device hardening includes:

- Use strong passwords.
- Encrypt stored passwords where possible.
- Use SSH for remote management.
- Disable unused ports.
- Set login banners.
- Limit management access.
- Save configurations securely.
- Keep firmware updated.

<!-- kind: activity -->
## Basic Device Hardening Lab

```text
R1# configure terminal
R1(config)# enable secret StrongEnablePass123
R1(config)# service password-encryption
R1(config)# security passwords min-length 10
R1(config)# login block-for 120 attempts 3 within 60
R1(config)# banner motd #Authorized users only.#

R1(config)# ip domain-name example.local
R1(config)# username admin secret StrongAdminPass123
R1(config)# crypto key generate rsa modulus 2048
R1(config)# ip ssh version 2

R1(config)# line vty 0 4
R1(config-line)# login local
R1(config-line)# transport input ssh
R1(config-line)# exit
R1(config)# end
R1# copy running-config startup-config
```

<!-- kind: activity -->
## Security Scenario

A small office uses default router passwords, open Wi-Fi, and no antivirus protection. Employees also share one administrator account.

Identify at least five risks and recommend a mitigation for each one.

<!-- kind: activity -->
## Review Questions

1. What is the difference between a threat and a vulnerability?
2. Why is Telnet insecure?
3. What are the three parts of AAA?
4. What does a firewall do?
5. List five device-hardening practices for routers and switches.
