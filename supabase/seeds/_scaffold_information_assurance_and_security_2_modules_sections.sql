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

-- ============================================================
-- LESSON 4: Identity and Access Management (IAM)
-- ============================================================
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('44977e92-4e4f-5b35-9f58-2569fe966be1','content','Authentication Methods and Multi-Factor',$md$
**Authentication** verifies identity before granting access. Common methods include **passwords** (something you know), **smart cards or tokens** (something you have), and **biometrics** (something you are). **Multi-factor Authentication (MFA)** requires two or more of these factors, greatly improving security. For example, accessing a bank account might require a password plus a one-time code sent to a mobile phone. In practice, implementing strong password policies (length and complexity) and adding MFA (like authenticator apps or SMS codes) prevents unauthorized access even if credentials are compromised.
$md$, 1),
('44977e92-4e4f-5b35-9f58-2569fe966be1','content','Authorization and Access Control',$md$
**Authorization** determines what resources a user can access. A common model is **Role-Based Access Control (RBAC)**: users are assigned roles (e.g., "manager", "clerk") and each role has specific permissions. Less commonly, **Attribute-Based Access Control (ABAC)** uses attributes (such as department, clearance level, time of day). The **principle of Least Privilege** means giving users only the permissions they need to do their job. For example, a regular user account should not have administrator rights. Auditing and regular review of permissions ensure that old or unused accounts are disabled to prevent abuse.
$md$, 2),
('44977e92-4e4f-5b35-9f58-2569fe966be1','activity','Directory Services and Single Sign-On',$md$
**Directory services** (like Microsoft Active Directory or OpenLDAP) centralize user accounts, passwords, and permissions. **LDAP** (Lightweight Directory Access Protocol) is commonly used to query these directories. **Single Sign-On (SSO)** lets users authenticate once for multiple systems. **Kerberos** is a common SSO protocol that uses tickets (for example, in a Windows domain login). For instance, logging into a domain-joined computer gives you a Kerberos ticket that you can use to access file shares without re-entering a password. Proper configuration (such as account lockout policies) helps prevent brute-force attacks on these services.
$md$, 3),
('44977e92-4e4f-5b35-9f58-2569fe966be1','activity','AAA Protocols (RADIUS, TACACS)',$md$
**AAA** stands for **Authentication, Authorization, and Accounting**, and these protocols are used by network devices. **RADIUS** is widely used for network access (especially Wi-Fi and VPN); it handles remote authentication (e.g., an employee logging into the wireless network) and can log accounting information. **TACACS+** is similar but often used for administering network devices (like routers and switches). For example, a company might use RADIUS with 802.1X to authenticate laptops on Wi-Fi, requiring central server verification. These protocols ensure that access attempts are checked against a central user database and that logs of access can be audited.

*Ready to apply this? The practice set below walks through exam-style problems with step-by-step solutions and a directory-service exercise.*
$md$, 4),
('44977e92-4e4f-5b35-9f58-2569fe966be1','activity','Practice & Exam Drills — Lesson 4',$md$
**Review Questions**

1. Describe what multi-factor authentication (MFA) is and provide an example with at least two factors.
2. What is Role-Based Access Control (RBAC) and how does it simplify authorization management?
3. What is the role of a directory service like LDAP or Active Directory in network security?
4. Briefly explain how Kerberos Single Sign-On authenticates a user.
5. What is RADIUS and why is it used in network access control?

**Worked Examples**

*Problem:* A company requires employees to use both a password and a fingerprint to log into the secure lab. Identify the type of authentication and explain why it's more secure than just a password.

*Solution:* This is **two-factor authentication** (password = knowledge + fingerprint = biometric). It's more secure because an attacker would need to compromise both factors. Even if the password is stolen, access is blocked without the fingerprint.

*Problem:* A user in the Finance department has a role that allows viewing financial reports but not editing them. Which access control concept is this an example of?

*Solution:* This demonstrates **least privilege** using **RBAC**. The Finance role has read-only permission. Defining roles with limited permissions prevents unauthorized actions (like deleting financial data). Permissions are tied to roles, simplifying management.

*Problem:* Employees connect their devices to Wi-Fi and are prompted for credentials. Behind the scenes, which protocol often handles authentication and accounting for this scenario?

*Solution:* This is typically handled by **RADIUS with 802.1X**. RADIUS checks the credentials against a central server and can log the access attempt. TACACS+ is more often used for device management logins.

**Hands-On Exercise**

On a home or lab network, explore a simple directory service. Install OpenLDAP or use Windows Active Directory on a VM. Create two user accounts (e.g., "user1" and "user2") with different permissions, configure one to have access to a shared folder while the other does not, and test logging in as each user.

**How to Pass**

- Be specific: instead of just "multi-factor", give concrete examples ("password + OTP token" or "password + fingerprint").
- Use correct terminology: "principle of least privilege" and name protocols (Kerberos, LDAP, 802.1X) accurately.
- Understand flow: sometimes exam questions ask you to describe steps in a login process (Kerberos ticket exchange). Practice explaining it step-by-step at a high level.
- Mention real-world applications ("RADIUS server used in secure Wi-Fi setups").
- Avoid vague answers; also mention management (using a password manager or enforcing complexity via group policy).
$md$, 5);

-- ============================================================
-- LESSON 5: Cryptography and PKI
-- ============================================================
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('22f48ad7-d466-5b7c-8f6c-7fec52e01e1a','content','Encryption and Hashing',$md$
Cryptography transforms data to protect it. **Symmetric encryption** uses the same secret key for encryption and decryption (for example, **AES** is a common symmetric cipher), while **asymmetric encryption** uses a public/private key pair (for example, **RSA**). **Hash functions** (like SHA-256) produce a fixed-size digest of data, used for integrity checks (they are one-way; you can't reverse the hash). For example, passwords are often stored as hashes so the actual password is not kept in the system. In practice, symmetric ciphers are fast for encrypting large data, while asymmetric algorithms are used for secure key exchange or digital signatures. Understanding both types and their purposes is essential for secure system design.
$md$, 1),
('22f48ad7-d466-5b7c-8f6c-7fec52e01e1a','content','Public Key Infrastructure (PKI) and Certificates',$md$
A **Public Key Infrastructure (PKI)** manages keys and digital certificates to bind identities with public keys. **Certificates** are digital documents issued by **Certificate Authorities (CAs)** that vouch for a public key belonging to a specific entity. For instance, an SSL/TLS certificate proves that a website is legitimate. PKI involves a **chain of trust**: a root CA issues certificates to intermediate CAs, which in turn issue certificates to end entities. A key concept is **certificate revocation**, which invalidates a certificate if its key is compromised. It's important to know how CAs verify identities and how web browsers check certificates during HTTPS connections.
$md$, 2),
('22f48ad7-d466-5b7c-8f6c-7fec52e01e1a','activity','Secure Protocols (TLS, SSH, VPN Encryption)',$md$
Many protocols use cryptography to secure communications. **TLS/SSL** (e.g., HTTPS) uses asymmetric encryption (to establish a session key) and then symmetric encryption to protect web traffic. **SSH** secures remote logins by encrypting the entire session with both symmetric and asymmetric techniques. VPN protocols like **IPsec** or **OpenVPN** also rely on encryption and often use PKI (certificates) or pre-shared keys. For example, when you see a padlock icon in a browser's address bar, it's because TLS is encrypting the connection. Knowing the basic steps (handshakes) of these protocols helps in understanding how data remains confidential and tamper-proof in transit.

*Ready to apply this? The practice set below walks through exam-style problems with step-by-step solutions and a live Python hashing playground.*
$md$, 3);

INSERT INTO sections (module_id, kind, heading, body_md, sort_order, ide_language, starter_code) VALUES
('22f48ad7-d466-5b7c-8f6c-7fec52e01e1a','activity','Practice & Exam Drills — Lesson 5',$md$
**Review Questions**

1. Explain the difference between symmetric and asymmetric encryption, and give an example of each (e.g., AES vs RSA).
2. What is the purpose of a hash function in security (for example, why use SHA-256)?
3. Describe the general steps of a TLS (SSL) handshake for an HTTPS connection.
4. What is a Certificate Authority (CA) and why is it needed in PKI?
5. What happens when a digital certificate expires or is revoked?

**Worked Examples**

*Problem:* Alice wants to send Bob a secret message. Bob gives Alice his public key. How should Alice encrypt the message so that only Bob can read it?

*Solution:* Alice should use **Bob's public key** to encrypt the message. Then only Bob can decrypt it using his **private key**. Public keys encrypt data so that only the corresponding private key can decrypt it, ensuring confidentiality.

*Problem:* A user tries to visit a website and the browser shows a warning that the SSL/TLS certificate is expired. What does this imply and what should the user do?

*Solution:* It implies the certificate is no longer valid, and the site's identity cannot be fully trusted (someone could be impersonating it). The user should be cautious: verify the URL is correct, check with the site administrator, and avoid logging in or entering sensitive information until the certificate is updated. Expired certificates break the trust model of PKI, so browsers warn the user.

**Hands-On Exercise**

Using the Python starter code, complete the script to find which password matches the given hash. (It should find "password123".) Once you find the match, modify the script: prompt the user to enter a password, compute its SHA-256 hash using `hash_password()`, and print the hash. This uses Python's cryptographic library and shows how hashing works in code.

**How to Pass**

- Know common algorithms by name (AES, RSA, SHA-1/2) and typical use-cases ("RSA for key exchange", "AES for fast encryption").
- When describing SSL/TLS, mention certificates and key exchange explicitly. Use terms like "public key", "private key", and "digital signature" correctly.
- Understand certificate chains: "root CA vs intermediate CA vs end-entity certificate."
- Clarify differences: hashing is one-way (for integrity), encryption is reversible with a key (for confidentiality). Don't confuse the two.
$md$, 4, 'python', $code$import hashlib

def hash_password(password: str) -> str:
    # Compute SHA-256 hash of the password string.
    return hashlib.sha256(password.encode()).hexdigest()

def main():
    # The correct hash for the password "password123"
    correct_hash = "ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f"
    candidates = ["password", "123456", "password123", "admin"]

    for pw in candidates:
        # YOUR CODE HERE: Check if pw matches the correct_hash
        pass

if __name__ == "__main__":
    main()$code$);

-- ============================================================
-- LESSON 6: Security Operations and Incident Response
-- ============================================================
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('a4ea525a-c7f6-5e93-a82f-133c554b6228','content','Monitoring and Logging (SIEM)',$md$
Security Operations involves continuously monitoring systems and networks. Logs from firewalls, servers, and applications are collected to spot anomalies (e.g., repeated failed logins or unusual traffic patterns). A **SIEM (Security Information and Event Management)** tool aggregates logs and uses rules or analytics to alert on suspicious activity. For example, a SIEM can flag if a user suddenly downloads a large amount of data late at night. Regular log review and automated alerts help catch incidents early, before they escalate.
$md$, 1),
('a4ea525a-c7f6-5e93-a82f-133c554b6228','content','Incident Response Process',$md$
When a security incident occurs, following a structured **Incident Response (IR)** plan is crucial. Common phases are: **Preparation** (establishing policies and tools), **Identification** (detecting and confirming an incident), **Containment** (isolating affected systems), **Eradication** (removing the threat, such as deleting malware), **Recovery** (restoring systems to normal operation, e.g., from backups), and **Lessons Learned** (reviewing what happened and improving processes). For example, in a malware outbreak, containment might involve disconnecting infected machines from the network. In answers, list each phase clearly; exam questions often ask you to outline these steps.
$md$, 2),
('a4ea525a-c7f6-5e93-a82f-133c554b6228','activity','Digital Forensics and Evidence Handling',$md$
**Digital forensics** involves collecting and analyzing data from computers or networks after an incident. Key principles include **chain of custody** (documenting who handled evidence and when) and using **write-blocking** tools to avoid altering original data. For instance, creating a bit-for-bit image of a hard drive ensures the original remains unmodified for investigation. Hashing files before analysis verifies they haven't changed. In coursework, know basic forensic terms and tools, and why maintaining evidence integrity is vital for potential legal proceedings.
$md$, 3),
('a4ea525a-c7f6-5e93-a82f-133c554b6228','activity','Business Continuity and Disaster Recovery',$md$
Beyond responding to attacks, organizations plan for continuity of operations. **Business Continuity Planning (BCP)** ensures critical services keep running after incidents (for example, by using redundant servers or alternate locations), while **Disaster Recovery (DR)** focuses on restoring systems (for example, recovering data from backups after ransomware). This includes regular, off-site backups of data and system configurations. Philippine companies often consider local risks (like power outages) in their BCP/DR, and must comply with laws (such as breach notification requirements under RA 10173) as part of their recovery planning.

*Ready to apply this? The practice set below walks through exam-style problems with step-by-step solutions and a log-review exercise.*
$md$, 4),
('a4ea525a-c7f6-5e93-a82f-133c554b6228','activity','Practice & Exam Drills — Lesson 6',$md$
**Review Questions**

1. What is the purpose of a SIEM tool in security operations?
2. List and briefly describe the main phases of the incident response process.
3. Why is maintaining a chain of custody important in digital forensics?
4. What is the difference between Business Continuity Planning (BCP) and Disaster Recovery (DR)?
5. Give one example of a preventive security measure and one example of a detective security measure.

**Worked Examples**

*Problem:* You notice on the SIEM dashboard that a user account logged in from two different countries within minutes. What might this indicate, and what should you do next?

*Solution:* This likely indicates a **compromised account** (impossible travel or credential sharing). Lock or suspend the account and start an investigation (verify the user's location through out-of-band communication). Treat this as an incident: immediate containment (locking account), then investigation.

*Problem:* A malware outbreak encrypted files on a critical server at 10 PM. According to the incident response plan, what should be done first?

*Solution:* First, follow **containment** procedures (isolate the server from the network to prevent spread). Next: identify and remove the malware (eradication), then recover files from backups (recovery). Contain the incident before recovery.

*Problem:* An organization has critical financial data and falls victim to ransomware with no recent backups. How does this situation relate to business continuity and disaster recovery?

*Solution:* Without recent backups (a DR measure), the organization cannot restore operations, severely disrupting business continuity. Emphasize the need for regular backups and alternate operation plans. Note the legal aspect: under RA 10173 (Data Privacy Act), they must notify the NPC and affected individuals of the breach.

**Hands-On Exercise**

Review a security event on your own system. Check the Event Viewer on Windows or `/var/log/syslog` on Linux for any recent events marked as "error" or "warning." Try to interpret what happened (e.g., a failed login). Write a brief incident report summary: identify the issue, steps taken to resolve it, and lessons learned. This simulates the "Identification" and "Documentation" phases of incident response.

**How to Pass**

- Remember key terms: clearly define containment, eradication, recovery, etc. Mnemonic: "Identify, Contain, Eradicate, Recover, Learn" — but list all phases.
- Use examples: logging (detective) vs patching (preventive).
- Mention relevant regulations: in the Philippines, cite the Cybersecurity Act (RA 11765) and the Data Privacy Act (RA 10173) regarding breach handling and notification.
- Show your thought process: explain both what happened and how you respond. Common mistakes: describing only one phase (like just recovery) without containment or lessons learned.
$md$, 5);

-- ============================================================
-- LESSON 7: Security Governance, Risk Management, and Compliance
-- ============================================================
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('3e006bab-3aad-5280-9094-4b0a7df4ffb4','content','Security Policies, Standards, and Frameworks',$md$
Organizations rely on policies and standards to guide security practices. Examples include **ISO/IEC 27001** (an international information security management standard) and the **NIST Cybersecurity Framework**. A **security policy** defines roles and responsibilities (for example, an Acceptable Use Policy or Incident Response Policy). Auditors check that organizations follow these standards. For instance, a Philippine company might align with ISO 27001 and the National Privacy Commission's policies to ensure comprehensive coverage of security and privacy requirements.
$md$, 1),
('3e006bab-3aad-5280-9094-4b0a7df4ffb4','content','Risk Management and Assessment',$md$
Risk management involves identifying, analyzing, and mitigating risks. Techniques include **qualitative** analysis (using risk matrices to rate impact and likelihood) and **quantitative** analysis (calculating expected losses). A key formula is **Single Loss Expectancy (SLE) = Asset Value × Exposure Factor** and **Annual Loss Expectancy (ALE) = SLE × Annualized Rate of Occurrence (ARO)**. Controls (like firewalls or encryption) reduce risk by lowering either the likelihood or the impact. A key step is performing risk assessments: listing assets, threats, vulnerabilities, and determining the level of risk. Exams often ask you to perform or interpret simple risk calculations using these formulas.
$md$, 2),
('3e006bab-3aad-5280-9094-4b0a7df4ffb4','activity','Legal and Regulatory Compliance',$md$
Laws and regulations govern security practices. In the Philippines, **Republic Act 10173 (Data Privacy Act)** mandates protecting personal data and reporting breaches to the National Privacy Commission. **Republic Act 11765 (Cybersecurity Act)** establishes the national cybersecurity framework and responsibilities for government and private sectors. Organizations must also comply with sector-specific laws (for example, financial institutions follow guidelines from Bangko Sentral ng Pilipinas). Understanding these regulations is crucial: an exam question might ask about breach notification requirements under RA 10173, for example.
$md$, 3),
('3e006bab-3aad-5280-9094-4b0a7df4ffb4','activity','Asset Classification and Data Protection',$md$
**Asset classification** means categorizing information (such as Public, Internal, Confidential, Secret). For example, customer personal data might be classified as "Confidential." Organizations apply protections based on classification (like encryption and strict access controls for confidential data). Philippine standards often require encryption or other controls for sensitive information. Maintaining an inventory of assets and clear labeling (such as security labels or electronic tags) helps ensure that data is handled appropriately throughout its lifecycle.

*Ready to apply this? The practice set below walks through exam-style problems with step-by-step solutions and a risk-register exercise.*
$md$, 4),
('3e006bab-3aad-5280-9094-4b0a7df4ffb4','activity','Practice & Exam Drills — Lesson 7',$md$
**Review Questions**

1. Why do organizations create an information security policy, and what might it include?
2. In risk management, what do the terms threat, vulnerability, risk, and impact mean?
3. How do you calculate Single Loss Expectancy (SLE) and Annual Loss Expectancy (ALE)? Provide the formula.
4. Name one Philippine law relevant to cybersecurity or data privacy and describe its primary requirement.
5. Why is asset classification important and how does it affect data protection?

**Worked Examples**

*Problem:* An organization has a server with an asset value of ₱500,000. It estimates that 20% of the value could be lost per incident (Exposure Factor = 20%), and that such incidents may happen once every 5 years. Calculate the SLE and ALE.

*Solution:* SLE = Asset Value × Exposure Factor = ₱500,000 × 0.20 = **₱100,000**. ARO = 1/5 = 0.20. ALE = SLE × ARO = ₱100,000 × 0.20 = **₱20,000 per year**. ALE represents the expected annual cost of this risk.

*Problem:* A hospital classifies patient records as "Confidential." What security measures should be applied according to this classification?

*Solution:* Confidential classification means only authorized personnel can access these records. Measures include strong access controls (unique accounts, strong passwords), encryption of data at rest (so stolen media stays unreadable) and in transit (HTTPS), and strict audit logging of who accessed the data.

*Problem:* A company falls victim to a data breach involving customer personal information. Under RA 10173 (Data Privacy Act), what must the company do?

*Solution:* They must notify the **National Privacy Commission (NPC)** and the affected individuals about the breach, typically within **72 hours** of discovery. Name RA 10173 explicitly and outline these notification requirements.

**Hands-On Exercise**

Create a simple risk register for a small scenario (e.g., personal laptop or home network). List a few assets ("Laptop", "Financial Documents"), possible threats ("Malware", "Theft"), and assign a qualitative risk level (High/Medium/Low). Then propose one or two controls for the highest risks ("Install antivirus software", "Enable drive encryption").

**How to Pass**

- Use correct formulas: write out SLE = AV × EF and ALE = SLE × ARO clearly. If numbers are given, show the arithmetic.
- Cite real standards or frameworks by name (ISO 27001, NIST). Note that ISO 27001 requires periodic risk assessments.
- For legal questions, name the law and its key points ("RA 10173 requires breach notification within 72 hours").
- Clarify terms: distinguish "risk" (potential for loss) from "vulnerability" (a weakness).
- Be precise about policies/frameworks ("ISO/IEC 27001 is an international standard for Information Security Management Systems"). Vague statements like "follow best practices" are less convincing.
$md$, 5);

-- ============================================================
-- SOURCES
-- Polytechnic University of the Philippines (PUP) — BSIT program and course descriptions
-- CHED CMO No. 25, series of 2015 — Revised PSGs for BSCS/BSIS/BSIT programs
-- ============================================================
