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

