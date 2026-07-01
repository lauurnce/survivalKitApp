-- ============================================================
-- Information Assurance and Security 2 — Modules & Sections
-- Subject ID: 40000000-0004-0001-0001-000000000002
-- 4th Year, Semester 1 — major
-- 7 lessons. Split: S1+S2 = content (FREE); remaining teaching blocks + drill
--   = activity (PAID). Paid count per lesson follows the paste's real section
--   counts (2 or 3 paid).
-- Only Lesson 5 has a Python playground (ide_language=python + starter_code),
--   inserted via the 7-column form in its own INSERT. All other drills are 5-column.
-- Re-running is safe (DELETE clears prior rows for this subject first).
-- ============================================================

DELETE FROM modules WHERE subject_id = '40000000-0004-0001-0001-000000000002';

INSERT INTO modules (id, subject_id, title, slug, sort_order) VALUES
  ('882437b0-973e-51c7-be39-45f5c701541f','40000000-0004-0001-0001-000000000002','Lesson 1: Advanced Threats and Attack Techniques','lesson-1-advanced-threats-and-attack-techniques',1),
  ('9f42039f-5ce6-5d59-a4bf-32eac14c991b','40000000-0004-0001-0001-000000000002','Lesson 2: Network Security and Perimeter Defense','lesson-2-network-security-and-perimeter-defense',2),
  ('2cb05beb-eda4-500f-9c0a-e69e6709df84','40000000-0004-0001-0001-000000000002','Lesson 3: Secure Systems and Virtualization','lesson-3-secure-systems-and-virtualization',3),
  ('44977e92-4e4f-5b35-9f58-2569fe966be1','40000000-0004-0001-0001-000000000002','Lesson 4: Identity and Access Management (IAM)','lesson-4-identity-and-access-management-iam',4),
  ('22f48ad7-d466-5b7c-8f6c-7fec52e01e1a','40000000-0004-0001-0001-000000000002','Lesson 5: Cryptography and PKI','lesson-5-cryptography-and-pki',5),
  ('a4ea525a-c7f6-5e93-a82f-133c554b6228','40000000-0004-0001-0001-000000000002','Lesson 6: Security Operations and Incident Response','lesson-6-security-operations-and-incident-response',6),
  ('3e006bab-3aad-5280-9094-4b0a7df4ffb4','40000000-0004-0001-0001-000000000002','Lesson 7: Security Governance, Risk Management, and Compliance','lesson-7-security-governance-risk-management-and-compliance',7);

-- ============================================================
-- LESSON 1: Advanced Threats and Attack Techniques
-- ============================================================
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('882437b0-973e-51c7-be39-45f5c701541f','content','Malware and Ransomware',$md$
Modern cyber threats often target the **confidentiality, integrity, and availability (CIA)** of information systems. **Malware** is malicious software designed to disrupt or gain unauthorized access. Types of malware include **viruses** (self-replicating code attaching to files), **worms** (standalone programs that spread across networks), **trojan horses** (malicious code disguised as legitimate software), and **ransomware** (encrypts files to extort payment). Each can steal data, corrupt information, or block system availability. For example, ransomware like WannaCry can make critical data inaccessible until a payment is made. Organizations must use up-to-date antivirus software and backup systems to mitigate these threats.
$md$, 1),
('882437b0-973e-51c7-be39-45f5c701541f','content','Social Engineering and Phishing',$md$
Attackers often use **social engineering** to trick users into revealing credentials or downloading malware. **Phishing** is a common tactic: fraudulent emails or messages mimic trusted sources to steal passwords or install malware. Variations include **spear-phishing** (targeted emails) and **vishing** (phone-based phishing). For instance, a fake email claiming to be from "HR Department" asking to reset your password can compromise corporate systems. Vigilant practice—such as verifying the sender's address, not clicking unknown links, and never giving out passwords—helps prevent these attacks.
$md$, 2),
('882437b0-973e-51c7-be39-45f5c701541f','activity','Web and Application Attacks (SQLi, XSS, CSRF)',$md$
Many attacks exploit web applications. **SQL Injection (SQLi)** occurs when attackers insert malicious code into database queries, potentially exposing or altering data. **Cross-Site Scripting (XSS)** allows attackers to inject scripts into web pages that run in other users' browsers. **Cross-Site Request Forgery (CSRF)** tricks authenticated users into submitting unintended commands. These attacks exploit poor input validation or session management. For example, a vulnerable login form that concatenates input directly into a SQL query can allow an attacker to retrieve user passwords via SQLi.
$md$, 3),
('882437b0-973e-51c7-be39-45f5c701541f','activity','Network Attacks and Vulnerabilities (DoS, DDoS, MITM)',$md$
Networks have specific vulnerabilities. A **Denial of Service (DoS)** attack floods a server or network with traffic, causing legitimate requests to be dropped. A **Distributed DoS (DDoS)** uses many compromised machines (a botnet) to overwhelm targets, making mitigation harder. **Man-in-the-Middle (MITM)** attacks intercept communication; for example, an attacker on a public Wi-Fi could eavesdrop on unencrypted traffic. Attackers may also spoof IP or MAC addresses or exploit protocol flaws. Regular patching, secure network configurations, and intrusion prevention tools help reduce these risks.

*Ready to apply this? The practice set below walks through exam-style problems with step-by-step solutions and a hands-on defense exercise.*
$md$, 4),
('882437b0-973e-51c7-be39-45f5c701541f','activity','Practice & Exam Drills — Lesson 1',$md$
**Review Questions**

1. What are the three goals of information security known as the CIA triad?
2. Explain the difference between a computer virus and a worm.
3. Describe a typical social engineering attack (e.g., phishing) and one way to prevent it.
4. What is SQL Injection and why is it dangerous for web applications?
5. How does a DDoS attack work, and what can organizations do to mitigate its impact?

**Worked Examples**

*Problem:* A website has a login form where entering `username='admin' OR '1'='1'` in the username field logs you in without a password. Identify the vulnerability and suggest a fix.

*Solution:* This is **SQL Injection**. The input bypasses authentication by exploiting unfiltered input in the SQL query. The fix is to use **parameterized queries** or **prepared statements** and validate user input to prevent SQL code execution.

*Problem:* A company server receives an overwhelming flood of traffic from many sources, causing a crash. Which attack is this and how can it be prevented?

*Solution:* This describes a **Distributed Denial of Service (DDoS)** attack. Prevention can include using firewalls or anti-DDoS services to filter malicious traffic, deploying redundant servers or using a content delivery network (CDN) to absorb traffic, and keeping network resources scalable.

*Problem:* An employee receives an email that looks like it's from HR asking for login credentials to update benefits. How should the employee respond, and what is this attack?

*Solution:* This is a **phishing** attack (social engineering). The employee should verify with HR directly (e.g., by calling the HR office), and should not click any links or provide credentials. Confirm legitimacy through a trusted channel and report the attempt to the IT/security team.

**Hands-On Exercise**

Try using a basic firewall on your computer. For example, configure Windows Defender Firewall or a Linux `ufw` (Uncomplicated Firewall) rule to block incoming connections on a specific port (like port 80). Observe how this can prevent unauthorized access to services. (This practice helps you understand perimeter defenses and blocking unnecessary network access.)

**How to Pass**

- Always mention the CIA triad (Confidentiality, Integrity, Availability) when discussing threats.
- Understand key examples and differences (virus vs worm, DoS vs DDoS). Professors often expect specific examples (WannaCry ransomware, a famous DDoS incident).
- For social engineering or phishing, emphasize user awareness and double-checking sources.
- Remember relevant laws like the Data Privacy Act (RA 10173) and how it relates to data breaches.
- Practice analyzing simple scenarios; explain both the attack and how you would fix or prevent it. Common mistakes: neglecting mitigation steps or confusing attack types.
$md$, 5);

-- ============================================================
-- LESSON 2: Network Security and Perimeter Defense
-- ============================================================
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('9f42039f-5ce6-5d59-a4bf-32eac14c991b','content','Firewalls and Network Segmentation',$md$
A **firewall** is a network security device (software or hardware) that controls incoming and outgoing network traffic based on predefined rules. Basic firewalls operate at the **packet-filtering** level (examining IP addresses and ports), while advanced firewalls track connection state (**stateful**) or inspect application-level data. For example, a firewall rule can block all traffic on port 80 (HTTP) except from certain trusted IP addresses. **Network segmentation** divides a network into subnets or VLANs so that a breach in one segment cannot easily spread to others. By isolating sensitive systems (e.g., financial servers) from general user networks, segmentation limits the scope of an attack.
$md$, 1),
('9f42039f-5ce6-5d59-a4bf-32eac14c991b','content','Intrusion Detection and Prevention Systems (IDS/IPS)',$md$
An **Intrusion Detection System (IDS)** monitors network or system activities for malicious behavior or policy violations and alerts administrators. An **Intrusion Prevention System (IPS)** goes further by actively blocking or preventing detected threats (such as dropping malicious packets). These systems use **signature-based** detection (matching known attack patterns) or **anomaly-based** detection (flagging unusual behavior). For example, an IDS might flag repeated failed login attempts as a possible brute-force attack. Properly tuned IDS/IPS tools help catch attacks that pass through firewalls, as they can identify suspicious patterns inside allowed traffic.
$md$, 2),
('9f42039f-5ce6-5d59-a4bf-32eac14c991b','activity','Virtual Private Networks (VPNs) and Tunneling',$md$
A **VPN** creates a secure tunnel over a public network (like the Internet) so remote users can access a private network securely. It uses encryption (e.g., IPsec or SSL/TLS) to protect data in transit. For example, an organization might allow employees to connect via an IPsec VPN to securely access internal company resources from home. Common VPN types include **site-to-site VPNs** (connecting entire networks) and **SSL VPNs** (often browser-based for individual users). Tunneling protocols encapsulate data packets; think of it as sending sensitive data inside an encrypted "envelope" across the Internet.
$md$, 3),
('9f42039f-5ce6-5d59-a4bf-32eac14c991b','activity','Wireless Network Security',$md$
Wireless networks introduce additional risks because signals can extend beyond physical walls. Wi-Fi encryption protocols are crucial: use at least **WPA2** or newer **WPA3** for strong security (avoid the outdated WEP standard). A strong Wi-Fi password and disabling WPS (Wi-Fi Protected Setup) help prevent unauthorized access. Other measures include hiding the SSID (network name), using MAC address filtering, and setting up a separate guest network for visitors. Always change default router or admin passwords, and keep firmware updated to patch known vulnerabilities in routers and access points.

*Ready to apply this? The practice set below walks through exam-style problems with step-by-step solutions and a hands-on port-scanning exercise.*
$md$, 4),
('9f42039f-5ce6-5d59-a4bf-32eac14c991b','activity','Practice & Exam Drills — Lesson 2',$md$
**Review Questions**

1. What is the main purpose of a network firewall?
2. How does an IPS differ from an IDS?
3. Why would a company use a VPN for remote workers?
4. What is network segmentation and what is its security benefit?
5. Name two strong security measures for a wireless network.

**Worked Examples**

*Problem:* A firewall rule blocks TCP port 23 (Telnet) from external networks to the corporate LAN. What does this rule prevent, and why is it important?

*Solution:* TCP port 23 is used by **Telnet**, an unencrypted remote login service. Blocking it prevents attackers from accessing internal devices via Telnet. This is important because Telnet is insecure (passwords and data are sent in plaintext); blocking it forces use of a secure alternative like **SSH** (port 22).

*Problem:* A company has two LAN segments: one for employees and one for servers, connected via a router with strict access rules. What is this setup called, and how does it help security?

*Solution:* This is **network segmentation** (often via VLANs or subnets). It limits the damage if one segment is compromised. Even if an employee PC is hacked, the attacker still needs to bypass the router rules to reach servers. Firewalls/routers enforce the separation, improving security.

*Problem:* An employee uses public Wi-Fi in a cafe and connects to company email without a VPN. Describe the risk and how using a VPN would help.

*Solution:* Public Wi-Fi can be monitored by attackers (eavesdropping or MITM). Without a VPN, credentials or emails could be intercepted. A VPN encrypts the connection end-to-end, so even if intercepted, the data remains confidential.

**Hands-On Exercise**

On a test computer or VM, use a port scanning tool such as `nmap` to scan open ports on your own router or local machine (only on networks you own). Observe which services are exposed. Practice closing unnecessary ports on your router or firewall and see how the scan results change.

**How to Pass**

- Remember common port numbers: HTTP (80), HTTPS (443), SSH (22), Telnet (23).
- When discussing Wi-Fi, cite strong protocols (WPA2 or WPA3) and explain why WEP is weak (crackable in minutes).
- Distinguish clearly between IDS (detects and alerts) and IPS (can also block traffic).
- Use specific examples: "IPsec VPN with AES encryption" rather than just "use a VPN."
- Common pitfalls: forgetting to mention both prevention and detection tools, or ignoring wireless security. Always explain both the measure and why it stops the threat.
$md$, 5);

-- ============================================================
-- LESSON 3: Secure Systems and Virtualization
-- ============================================================
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('2cb05beb-eda4-500f-9c0a-e69e6709df84','content','Operating System and Application Hardening',$md$
To secure systems, operating systems (OS) and applications must be **hardened**. Hardening means disabling unnecessary services, closing unused ports, and applying security patches promptly. For example, removing default accounts and ensuring antivirus is active reduces the attack surface. Strong **patch management** ensures that vulnerabilities (like unpatched software flaws) are fixed before attackers can exploit them. Additionally, use host-based firewalls and enable system logging to detect potential intrusions.
$md$, 1),
('2cb05beb-eda4-500f-9c0a-e69e6709df84','content','Virtualization and Cloud Security',$md$
Virtual machines (VMs) and cloud services introduce new security considerations. Each VM should be isolated and given only the necessary resources. **Hypervisor security** is crucial: a breach in the hypervisor could compromise all VMs. Also, follow the **principle of least privilege** for cloud instances and secure API keys. In cloud environments, encrypt data at rest and in transit, and use identity roles (like AWS IAM roles) to control access. Regularly update VM images and use snapshots for rollback in case of issues.
$md$, 2),
('2cb05beb-eda4-500f-9c0a-e69e6709df84','activity','Trusted Hardware and Secure Boot',$md$
Modern systems use trusted hardware to enhance security. **TPM (Trusted Platform Module)** is a chip that can securely store encryption keys and verify system integrity (through measured boot). **Secure Boot** checks digital signatures of firmware and boot loaders to prevent rootkits at startup. For example, a computer with Secure Boot will refuse to load an untrusted operating system. Hardware-based protections—such as BIOS/UEFI passwords and disabling boot from external media—help prevent unauthorized access to the system.

*Ready to apply this? The practice set below walks through exam-style problems with step-by-step solutions and a hands-on hardening exercise.*
$md$, 3),
('2cb05beb-eda4-500f-9c0a-e69e6709df84','activity','Practice & Exam Drills — Lesson 3',$md$
**Review Questions**

1. What does "hardening" an operating system involve?
2. Why is timely patching of software important for security?
3. How can virtualization increase security risk, and what is needed to mitigate it?
4. What is a TPM (Trusted Platform Module) and what role does it play in system security?
5. Explain what Secure Boot does during system startup.

**Worked Examples**

*Problem:* A server is set up with many default services running (e.g., Telnet, FTP, SMTP), but it will be used only as a web server. What steps should you take to harden this system?

*Solution:* Disable or remove all unnecessary services (turn off Telnet, FTP if not needed). Ensure only the web service (ports 80/443) is active. Apply all security patches and install antivirus. Reduce the attack surface by limiting running services and keeping the system updated.

*Problem:* A company uses virtual machines for different departments. If the hypervisor is not secured, what could be the consequence?

*Solution:* A compromised hypervisor could allow an attacker to control or access all VMs hosted on it. Secure the hypervisor with strong credentials, limit access, and apply patches. VM isolation depends on hypervisor integrity, so the hypervisor itself must be protected.

*Problem:* A laptop uses full disk encryption with TPM (e.g., BitLocker on Windows). Describe how an attacker is prevented from accessing data if the hard drive is stolen.

*Solution:* The TPM stores the encryption key securely and only releases it if the system boot environment is unchanged. If the drive is removed or the boot is tampered with, the key is not released and the disk remains encrypted.

**Hands-On Exercise**

On a local machine or VM, enable the host-based firewall (e.g., `iptables` on Linux or Windows Defender Firewall). Configure it to allow only essential ports (for example, block all incoming traffic except SSH on port 22). Reboot and verify that blocked ports remain closed.

**How to Pass**

- Recall specific steps: "disable default accounts," "close unused ports," and name tools like `iptables` or Windows Firewall.
- Be clear about patch management: many attacks exploit unpatched vulnerabilities (e.g., the WannaCry exploit).
- For virtualization, use terms like "hypervisor" (VMware ESXi, Hyper-V) and note that each VM must be as secure as a physical host.
- Connect TPM and Secure Boot: both ensure integrity of the system at boot. Mention real examples (Intel TXT, BitLocker with TPM).
- Common oversight: forgetting hardware measures (BIOS password) or not relating hypervisor security to VM isolation.
$md$, 4);

