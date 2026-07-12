-- ============================================================
-- Information Assurance and Security 1, Modules & Sections
-- Subject ID: 30000000-0003-0002-0001-000000000004
-- 3rd Year, Semester 2, major
--
-- Free/paid split: per lesson, sections 1-2 are FREE (kind='content'),
-- sections 3-4 plus the practice drills are PAID (kind='activity').
-- Re-running is safe (the DELETE clears prior rows for this subject).
-- ============================================================

DELETE FROM modules WHERE subject_id = '30000000-0003-0002-0001-000000000004';

-- ---- Reserved module UUIDs (use in order; delete unused rows) ----
--   M01: 5ccb51da-75cd-5814-af37-e74b8452fe4e
--   M02: 8b714a41-f183-5465-9aff-8a3287f8c916
--   M03: 6d38cc43-8053-5840-830b-9a3af3115ea4
--   M04: 965ef740-b656-5b14-88da-3520be07e937
--   M05: b10d9b37-46f8-5eaa-88a6-3c521db59d4b
--   M06: 7c237496-0d80-5409-a25c-133364679759
--   M07: 2f4923a6-20df-5b29-bdf1-a8e7ad5a8f6f
--   M08: d633a3b4-38a6-5dee-9d0e-d65b489ae3dc
--   M09: 9848980d-a500-5801-8653-459d6a5bb7e9
--   M10: b98752be-5c46-59e2-8688-e8ad55be1262
--   M11: 8fa7ecf2-f7fd-5bd3-8fa7-bda11c29d054
--   M12: 8499a0d5-eed9-5972-81ea-3508d178fa18

INSERT INTO modules (id, subject_id, title, slug, sort_order) VALUES
  ('5ccb51da-75cd-5814-af37-e74b8452fe4e','30000000-0003-0002-0001-000000000004','Lesson 1: Foundations of Information Assurance and Security','lesson-1-foundations-information-assurance-security',1),
  ('8b714a41-f183-5465-9aff-8a3287f8c916','30000000-0003-0002-0001-000000000004','Lesson 2: Threats, Vulnerabilities, Controls, and Risk Assessment','lesson-2-threats-vulnerabilities-controls-risk-assessment',2),
  ('6d38cc43-8053-5840-830b-9a3af3115ea4','30000000-0003-0002-0001-000000000004','Lesson 3: Identity, Authentication, Authorization, and Access Control','lesson-3-identity-authentication-authorization-access-control',3),
  ('965ef740-b656-5b14-88da-3520be07e937','30000000-0003-0002-0001-000000000004','Lesson 4: Cryptography, Hashing, and Digital Signatures','lesson-4-cryptography-hashing-digital-signatures',4),
  ('b10d9b37-46f8-5eaa-88a6-3c521db59d4b','30000000-0003-0002-0001-000000000004','Lesson 5: Network Security Fundamentals','lesson-5-network-security-fundamentals',5),
  ('7c237496-0d80-5409-a25c-133364679759','30000000-0003-0002-0001-000000000004','Lesson 6: Host, Endpoint, and Application Security','lesson-6-host-endpoint-application-security',6),
  ('2f4923a6-20df-5b29-bdf1-a8e7ad5a8f6f','30000000-0003-0002-0001-000000000004','Lesson 7: Security Governance, Policies, Ethics, and the Philippine Legal Environment','lesson-7-governance-policies-ethics-legal-environment',7),
  ('d633a3b4-38a6-5dee-9d0e-d65b489ae3dc','30000000-0003-0002-0001-000000000004','Lesson 8: Incident Response, Business Continuity, and Disaster Recovery','lesson-8-incident-response-business-continuity-disaster-recovery',8);

-- ---- Reserved section UUIDs, per module ----
-- Module 1 (5ccb51da-75cd-5814-af37-e74b8452fe4e):
--   S1: 1e573aef-a6d8-5d73-8834-b50e009a6b3b
--   S2: 02be3481-46d5-5722-bc72-090910461827
--   S3: ada7cb21-2c22-5ffb-8148-9b8f35eb8d53
--   S4: deac1cd5-c8e2-5e70-a318-701507f343b1
--   S5: c5e53b81-7909-5bfc-96dc-3a16ea1eaa6f
--   S6: 1c7c6037-3797-5276-9891-1d9fdf6ea60b
--   S7: d2f0fd35-ea63-555f-8069-afe07f6d46ce
--   S8: ed3ec15e-2e35-5c25-81cc-05fa1a04a34f
--   S9: 233ed9e6-8dd9-5391-aabd-fa360edb72d3
--   S10: 1f8eae1d-4f8a-5b2b-b8cd-59e0f70c4c00  <- reserve last for kind='activity'
-- Module 2 (8b714a41-f183-5465-9aff-8a3287f8c916):
--   S1: 394fa9bc-bf5e-55c7-afd5-2bb91d1cc589
--   S2: 2ef4073e-79e2-5fd9-a425-73f29c3d6844
--   S3: 1950bf55-bb19-5902-b8bf-c11fe47d6972
--   S4: 24e379ec-4552-5a56-b901-0e0bcad62986
--   S5: 187217a9-35b7-5048-b7ac-653f64648295
--   S6: 0d2f4f1a-26f2-57eb-9317-a1b41891e7cd
--   S7: 25fda4b2-a6b0-5e29-b57c-bdc08651d238
--   S8: 5e087945-7573-5b78-b112-c1259e156b40
--   S9: 34e68e52-35dc-5cbd-87b2-c927ece14454
--   S10: 40153e01-9f62-52b7-8615-2e4a6d3f14a2  <- reserve last for kind='activity'
-- Module 3 (6d38cc43-8053-5840-830b-9a3af3115ea4):
--   S1: b4b778ab-f136-588f-8034-5d650fbf01c4
--   S2: 74ed708e-d7f3-5d7e-96c4-b690b5dd9fad
--   S3: fe9fafba-0764-5d37-a3b4-336c507a6b95
--   S4: 62ebb0a4-e1b8-5720-9607-938151862e06
--   S5: 334f491e-4a4f-552e-b55e-a6a408974396
--   S6: 12cb1da2-8d14-5a10-ab4a-148448a11254
--   S7: f15eca15-7c70-53a2-a361-5e9fdd290878
--   S8: 6e9a9be9-495e-5085-95b9-e48fb9e7d1fd
--   S9: 37656748-1873-5d61-bcba-022fe36992a3
--   S10: f43994e1-7017-503f-aef9-73b5fc885334  <- reserve last for kind='activity'
-- Module 4 (965ef740-b656-5b14-88da-3520be07e937):
--   S1: b4ac98e8-de52-502d-9e84-d51f982fb990
--   S2: ddeca55e-90b0-5160-97e7-9a680ef94c83
--   S3: 328e4659-f2f6-56aa-a93f-61544c8124a6
--   S4: 02552499-3081-55a5-935b-a7c3ee73b51c
--   S5: a6e407eb-080c-573d-91e5-2fa4c1a53c68
--   S6: 34737f9a-85da-594c-8f8f-2dd6fc49f8ce
--   S7: c07f3db3-a6ed-5138-b343-c6d2cf5918d3
--   S8: 460fd881-19d7-5107-b235-c79f9dd86df2
--   S9: a3c7b632-5778-5011-8201-c21410aa2d94
--   S10: 48ced0a5-3fbd-5c63-af3f-7569e452b73a  <- reserve last for kind='activity'
-- Module 5 (b10d9b37-46f8-5eaa-88a6-3c521db59d4b):
--   S1: b6669359-f80f-5a73-bb32-d1afa6c7cd7b
--   S2: 3367131d-5a6f-5809-934d-c698847b8852
--   S3: a8176e3e-faf7-5dd7-87e6-0492305d9c7c
--   S4: ee35bd90-8232-5206-ad89-367ecfc84b82
--   S5: 9a80ee4a-d023-564f-9555-aa9614e26ad2
--   S6: 97fdaf88-802c-585f-b9f0-fd8636d37d91
--   S7: ea0f1d5c-f037-5e83-936f-566ca60d21c7
--   S8: cfd3b726-deb1-5736-85b4-0c7f0cddff4e
--   S9: 30ca51ce-449f-5191-aeaa-47f4cd98af55
--   S10: ccc256f2-0d38-5fd8-9841-6ec2f246f465  <- reserve last for kind='activity'
-- Module 6 (7c237496-0d80-5409-a25c-133364679759):
--   S1: 3d6cebc9-af09-5e68-826e-d54f88ad583a
--   S2: cbd8e802-93e0-5acb-a588-38167faa47ee
--   S3: 37bc3a84-1585-594e-9d92-ff82e5e22e83
--   S4: 34940a89-b1c7-517e-80a8-35ea883f259a
--   S5: f6cb0efb-8317-5378-b78b-f710859d75df
--   S6: 7edcda47-8295-5121-98c6-620d922ee1d6
--   S7: af20c66a-8847-5b0a-b54f-77fd7d0fadec
--   S8: 7986e405-bd16-580b-ac62-2d5bd80e881e
--   S9: 7fed92d2-2601-57b8-9959-0570148fbf52
--   S10: e8111ea4-c734-5308-a1c9-600e4ce6a7b1  <- reserve last for kind='activity'
-- Module 7 (2f4923a6-20df-5b29-bdf1-a8e7ad5a8f6f):
--   S1: 6791d8d0-a36e-5698-8185-5f0e6562980b
--   S2: 6b773b15-4790-5783-b753-2765cea2d1db
--   S3: 1921ce78-badc-50c0-a4cd-ad3c7ab1c526
--   S4: c26d2642-f6d2-51c0-8fc4-245e165dfc5c
--   S5: 1c234081-b2f6-597b-9e8f-19f15b9227b4
--   S6: e54ac6ef-7251-5837-9cc8-7621e3043d56
--   S7: 5a8d0361-e9b9-5875-8fbf-69acf4b004a4
--   S8: 8daa389f-0ab0-5c2d-8d6c-2e1697fbd1b0
--   S9: d02f4554-4707-5e41-ba97-303b42d1dbb9
--   S10: 111b6943-83b6-53db-b141-a61626006736  <- reserve last for kind='activity'
-- Module 8 (d633a3b4-38a6-5dee-9d0e-d65b489ae3dc):
--   S1: 583b837d-ef0f-5c6a-8442-8d739af71a17
--   S2: a9ea89a0-b314-5196-bf4f-01e8fe31d32b
--   S3: f0cd7b3e-3584-506b-812e-edb1dd9438ee
--   S4: 788d77e8-dcbf-5283-b955-6114da3ac723
--   S5: c2de38d5-0245-5c36-99e1-76852cd1701a
--   S6: 8786bd1b-e735-5bfe-9d1e-407da7161f8b
--   S7: d7e1b181-96d5-5b2f-bec7-7ff91067a64a
--   S8: 2be66da8-eb7c-5040-ab9a-19349f751570
--   S9: d369e3d9-c31c-5fc1-bd31-050735ca91b5
--   S10: d5db85cc-0d0f-5db2-8c2f-b9f827e50180  <- reserve last for kind='activity'
-- Module 9 (9848980d-a500-5801-8653-459d6a5bb7e9):
--   S1: a541cf59-f320-51ae-b679-faa999b8e5d4
--   S2: 3724fe1b-4525-5e41-a9e8-e2ad4d54cfa1
--   S3: 6247d99f-2d7d-59c9-a226-d1fc88a94e80
--   S4: ed0a4768-6894-5f0d-8d9d-b1dbba836722
--   S5: e307acd1-7d32-534f-9e08-7582d581b575
--   S6: 71d08e0a-18e2-5a62-9825-853ce5421c0f
--   S7: 0fe88931-6cab-5a04-9ae2-d24c85edc503
--   S8: 1a1160de-c4af-5ca8-bb66-85978ff68c7f
--   S9: 2c6a036e-c02e-5cb0-bcf6-c5093e6aae18
--   S10: 2191d5d1-4344-5b40-927e-141a40dc1bfc  <- reserve last for kind='activity'
-- Module 10 (b98752be-5c46-59e2-8688-e8ad55be1262):
--   S1: fc4ecd1e-c80d-5b04-ada9-cc4cec4698dd
--   S2: 9df121f9-3112-53ed-9b77-7567e07151f0
--   S3: c9360a57-d13c-5077-8baf-8820022976ba
--   S4: 14270e99-31f0-56b1-8768-5b889f1eef62
--   S5: f1eb59c3-f4a2-59fe-b888-b501e4cb3869
--   S6: 485dd940-c353-5042-a077-504e5c2d1d42
--   S7: 757e56f3-fa23-585f-bcef-88a71b06ef1a
--   S8: 27c250d8-5963-5a41-a15f-c26f863c649d
--   S9: a33c6abd-0382-5884-ba0c-27ef5f1a9188
--   S10: df261538-3571-5f92-8fa1-39b9d07be1f2  <- reserve last for kind='activity'
-- Module 11 (8fa7ecf2-f7fd-5bd3-8fa7-bda11c29d054):
--   S1: 1212adf4-6cb0-5238-9bab-eb44982b1ef5
--   S2: 7ed880ea-9100-5267-8e5d-07e1efa465fb
--   S3: 07898f74-2b8e-5153-a2d7-24861f8e1bc3
--   S4: 6c030c31-1ea3-5c4d-9c58-1dc3d2f361e0
--   S5: 40c9d557-203d-5473-b8f5-19c12324755a
--   S6: ff4057a9-1c08-5bad-abf5-90ac52ba5a4f
--   S7: 31f4240b-9202-505b-b569-f726cbcd1ff6
--   S8: 6fedfdec-cfa9-562d-b3c5-d8ad67f5baa9
--   S9: 22b8fdba-19ee-5bf6-8661-a321929674d9
--   S10: 7d2e595e-5827-5bb3-b21a-f4b95e0d4eef  <- reserve last for kind='activity'
-- Module 12 (8499a0d5-eed9-5972-81ea-3508d178fa18):
--   S1: f057e99e-427b-55e1-849b-ea8167085b6a
--   S2: 211b6f89-e8a8-52da-b4db-dd58a1e934e9
--   S3: 47acf3a1-8a4e-51e5-a5ea-55eb516af01d
--   S4: 48216e14-9273-5c52-88ad-dab1c8ce640d
--   S5: 629c0ca7-41c2-5475-964f-1a0fbb1356c1
--   S6: 2594ffc4-42cc-599d-a73f-a4d0f25c5557
--   S7: 61a69f6f-7852-5c40-a92d-6af7d714ab96
--   S8: 709a286f-d70b-5d84-9ced-4d7b2cdee6b5
--   S9: ce52ff29-c270-507a-b450-4e8d09c843a2
--   S10: e44d8491-3cfa-5c15-ae96-70d4ea24a399  <- reserve last for kind='activity'

-- ============================================================
-- IMPORT TEMPLATE, one INSERT per module. Replace placeholders.
-- content sections are FREE; the final activity section is PAID.
-- ide_language (python|sql|java|c), starter_code, topology_data are
-- all OPTIONAL columns, include only when the section needs them.
-- ============================================================
--
-- INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
-- ('5ccb51da-75cd-5814-af37-e74b8452fe4e','content','<Heading>',$md$
-- <full markdown teaching body, free tier>
-- $md$, 1),
-- ('5ccb51da-75cd-5814-af37-e74b8452fe4e','activity','Practice & Exam Drills, Lesson 1',$md$
-- <review questions, worked exam problems w/ solutions, how-to-pass tips, paid tier>
-- $md$, 2);
--
-- With an interactive playground, use the 5-column form instead:
-- INSERT INTO sections (module_id, kind, heading, body_md, sort_order, ide_language, starter_code) VALUES
-- ('5ccb51da-75cd-5814-af37-e74b8452fe4e','activity','Coding Drill',$md$<task>$md$, 3, 'python', $code$print("hi")$code$);

-- >>>>>>>>>>>>>>>>>>>>  PASTE FILLED-IN INSERTS BELOW  <<<<<<<<<<<<<<<<<<<<

-- Per module: S1/S2 = free content, S3/S4 = content gated as activity,
-- S5 = the Practice & Exam Drills activity. 2 free + 3 paid.

-- ============================================================
-- LESSON 1: Foundations of Information Assurance and Security
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('5ccb51da-75cd-5814-af37-e74b8452fe4e','content','Why Security Matters in Information Technology',$md$
Information assurance and security is the discipline of protecting information and the systems that store, process, and transmit it. In BSIT, this is not just a "special topic." It is part of responsible system design, network administration, systems analysis, database work, web development, and IT operations.

When we say **information assurance**, we are talking about keeping information trustworthy, available, and properly handled throughout its life cycle. When we say **information security**, we focus on protecting information and systems from unauthorized access, misuse, disruption, modification, or destruction.

A practical way to remember the heart of the subject is the **CIA triad**:

- **Confidentiality** means information is seen only by authorized people.
- **Integrity** means information remains accurate, complete, and unaltered unless a valid change is made.
- **Availability** means information and services are accessible when needed.

A registrar database is a good local example. Student grades should not be readable by random users, so confidentiality matters. Grades must not change without proper authorization, so integrity matters. During enrollment, the system should stay online and usable, so availability matters.

Modern organizations also care about these supporting ideas:

- **Authenticity**, proving that a user, message, or system is genuine.
- **Accountability**, making actions traceable to a user or process.
- **Non-repudiation**, preventing a sender or actor from denying an action they actually performed.
- **Privacy**, protecting personal and sensitive information from improper collection, use, or disclosure.

Security is not only about stopping hackers. It also addresses careless behavior, weak passwords, missing backups, poor network design, unpatched software, and weak policies. In other words, many security failures start with ordinary IT mistakes.
$md$, 1),
('5ccb51da-75cd-5814-af37-e74b8452fe4e','content','Assets, Threats, Vulnerabilities, and Risk',$md$
Before you can protect anything, you must know what is being protected and what can go wrong.

An **asset** is anything valuable to an organization. In IT, assets usually include:

- Data such as grades, payroll records, customer information, and source code
- Hardware such as servers, routers, laptops, and backup drives
- Software such as databases, ERP systems, web apps, and operating systems
- Services such as internet connectivity, email, cloud storage, and online enrollment
- People, processes, and reputation

A **threat** is a possible cause of harm. A **vulnerability** is a weakness that a threat can exploit. An **attack** is the actual attempt to exploit that weakness.

Here is a simple chain:

| Element | Example |
|---|---|
| Asset | LGU permit database |
| Threat | Malicious outsider |
| Vulnerability | Weak admin password |
| Attack | Password guessing or credential stuffing |
| Impact | Data exposure or service disruption |

This leads to **risk**. In basic terms, risk is the chance that a threat will exploit a vulnerability and cause harm to an asset. Security work is therefore about reducing risk to an acceptable level, not magically removing all risk.

A useful class reminder is this:

> No vulnerability, no exploit. No valuable asset, no meaningful loss. Security analysis connects both.
$md$, 2),
('5ccb51da-75cd-5814-af37-e74b8452fe4e','activity','The Security Goals of an Organization',$md$
Organizations do not apply security controls randomly. They usually protect systems for business and mission reasons.

Common organizational security goals include:

- Protecting confidential records
- Maintaining continuous operations
- Complying with laws and regulations
- Preventing fraud and abuse
- Preserving customer trust and institutional reputation
- Recovering quickly from incidents

In a Philippine setting, think of a small hospital information system. It must protect patient data, prevent unauthorized edits, keep records available to doctors, and recover from brownouts, ransomware, or accidental deletion. Security is therefore both a technical and management concern.

Security also works best when it is **proportional**. A public school website announcing events does not need the same protection level as a payment gateway or student health record system. Good security means using the right controls for the right assets.
$md$, 3),
('5ccb51da-75cd-5814-af37-e74b8452fe4e','activity','Security as a Continuous Process',$md$
One of the biggest misconceptions in IT is that security is a one-time setup. In reality, security is a **continuous process** because systems, users, threats, and technologies keep changing.

A simple security life cycle looks like this:

1. Identify assets and requirements
2. Analyze threats and vulnerabilities
3. Choose and implement controls
4. Monitor and review results
5. Respond to incidents
6. Improve the system

This is why organizations patch systems, rotate credentials, review logs, revisit policies, retrain users, and audit controls. Security must evolve with the environment.

For students, the key exam idea is this: security is not a product you buy once; it is a discipline you maintain over time.
$md$, 4),
('5ccb51da-75cd-5814-af37-e74b8452fe4e','activity','Practice & Exam Drills, Lesson 1',$md$
### Review Questions

1. Differentiate information assurance from information security.
2. Define the CIA triad and give one practical example for each component.
3. What is an asset in information security? Give three examples.
4. Distinguish among threat, vulnerability, and attack.
5. Why is availability as important as confidentiality in many organizations?
6. What is the difference between privacy and confidentiality?
7. Why is security considered a continuous process instead of a one-time activity?
8. Give one example where a non-technical issue creates a security problem.

### Worked Exam-Style Problems

**Problem A: Classify the Security Concern**

A state university stores: final grades, faculty login accounts, enrollment schedules, online payment records. For each situation below, identify the primary security goal affected.

1. A student website becomes unreachable during enrollment.
2. An employee changes a grade without authorization.
3. A shared file with payment records is left accessible to all staff.
4. A user denies submitting an approval even though the system says they did.

*Step-by-Step Solution*

1. Unreachable website during enrollment → **Availability**, the service is not accessible when needed.
2. Unauthorized grade change → **Integrity**, data was altered improperly.
3. Payment records accessible to all staff → **Confidentiality**, sensitive data is exposed to unauthorized persons.
4. User denies approving a transaction → **Non-repudiation** (with accountability related), the system must prove who performed the action.

**Problem B: Identify the Security Chain**

A company payroll server has outdated software. A ransomware group discovers the weakness and encrypts the payroll files, delaying salary release. Identify the asset, vulnerability, threat, attack, impact, and risk statement.

*Step-by-Step Solution*

- **Asset:** Payroll server and payroll files
- **Vulnerability:** Outdated software / missing patch
- **Threat:** Ransomware group
- **Attack:** Exploitation followed by file encryption
- **Impact:** Payroll processing delay, possible financial and reputational damage
- **Risk statement:** There is a risk that attackers may exploit outdated payroll server software to encrypt payroll data, causing operational disruption and delayed salary release.

**Problem C: Short Essay Question**

Why can a system be considered insecure even if it has a firewall?

*Suggested Answer Structure*

- Security is broader than a single device.
- The firewall protects only some traffic paths.
- Weak passwords, poor permissions, unpatched hosts, insider misuse, and missing backups can still cause compromise.
- Therefore, security must combine technical controls, procedures, and people awareness.

### Hands-On Exercises

**Exercise A: Asset Inventory Starter**, Create a mini asset inventory for one of: school LMS, barangay records system, small online shop, student organization website. Use the format: Asset | Why valuable | Main threat | Possible vulnerability | Possible impact. Write at least five assets.

**Exercise B: CIA Analysis Drill**, Choose one Philippine-context system such as a hospital record system, e-commerce delivery app, BPO attendance system, or university enrollment portal. Write one paragraph each for why confidentiality, integrity, and availability matter.

**Exercise C: Security Process Reflection**, Describe one real or imagined incident where a system was initially secure but later became vulnerable because of change. Explain what changed and why continuous review was necessary.

### How to Pass This Topic

- Memorize the core terms exactly: asset, threat, vulnerability, attack, risk, confidentiality, integrity, availability.
- Professors often ask scenario-based identification, not just definitions.
- When answering, always connect the problem to the business effect or organizational impact.
- Do not confuse integrity with confidentiality. If data is changed incorrectly, that is integrity, not confidentiality.
- Do not say "security means secrecy only." Availability is heavily tested.
- In essay questions, write in a clear chain: asset → threat → vulnerability → attack → impact.
- For long tests, short definitions may be worth few points, but case analysis usually carries more weight.
$md$, 5);

-- ============================================================
-- LESSON 2: Threats, Vulnerabilities, Controls, and Risk Assessment
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('8b714a41-f183-5465-9aff-8a3287f8c916','content','Common Threat Sources',$md$
Threats come from many directions. A good IT professional avoids the mistake of thinking that all security problems come from anonymous outsiders.

Threat sources usually include:

- **External attackers** such as cybercriminals, hacktivists, and opportunistic intruders
- **Insiders** such as careless employees, disgruntled users, or over-privileged staff
- **Environmental events** such as fire, flood, power loss, and hardware failure
- **Human error** such as accidental deletion, wrong configuration, and lost devices
- **Supply chain issues** such as insecure third-party services, compromised updates, or weak vendor practices

Some threats are intentional, while others are accidental. Both matter. A user who mistakenly posts a spreadsheet with personal data can cause damage almost as serious as a deliberate attacker.
$md$, 1),
('8b714a41-f183-5465-9aff-8a3287f8c916','content','Types of Vulnerabilities',$md$
A vulnerability is a weakness that makes a system easier to compromise. Vulnerabilities often appear in these categories:

- **Technical vulnerabilities**, unpatched software, insecure services, misconfigured firewalls
- **Human vulnerabilities**, weak passwords, lack of awareness, social engineering susceptibility
- **Physical vulnerabilities**, unlocked server rooms, exposed network ports, stolen devices
- **Process vulnerabilities**, no backup plan, no change approval, unclear incident reporting
- **Design vulnerabilities**, systems built without security requirements from the start

A strong exam point here is that a vulnerability does not automatically mean a breach has happened. It means the system is susceptible. Once exploited, it becomes part of an attack.
$md$, 2),
('8b714a41-f183-5465-9aff-8a3287f8c916','activity','Security Controls and Their Categories',$md$
A **security control** is a safeguard that reduces risk. Controls are often grouped by function.

**By nature**

- **Administrative controls**, policies, training, procedures, standards, job separation
- **Technical controls**, firewalls, encryption, MFA, antivirus, access control lists
- **Physical controls**, locks, CCTV, guards, ID checks, equipment cages

**By purpose**

- **Preventive** controls stop incidents before they happen.
- **Detective** controls discover incidents or suspicious activity.
- **Corrective** controls restore systems or reduce damage after an incident.
- **Deterrent** controls discourage bad behavior.
- **Compensating** controls provide an alternative when a preferred control is not possible.

Examples:

| Situation | Control | Category |
|---|---|---|
| Users choose weak passwords | Password policy + MFA | Administrative + Technical |
| Office PCs are stolen | Door lock + device encryption | Physical + Technical |
| Malware infection occurs | EDR alert + reimaging + restore | Detective + Corrective |
$md$, 3),
('8b714a41-f183-5465-9aff-8a3287f8c916','activity','Basic Risk Assessment',$md$
Risk assessment is one of the most common topics in introductory security courses because it helps organizations decide what to protect first.

A simple formula often used in class is:

$$ \text{Risk Level} \approx \text{Likelihood} \times \text{Impact} $$

This is not the only method, but it helps beginners prioritize.

A basic risk assessment process:

1. Identify the asset
2. Identify threats
3. Identify vulnerabilities
4. Estimate likelihood
5. Estimate impact
6. Assign a risk level
7. Select a treatment decision

Typical treatment choices are:

- **Mitigate**, reduce the risk using controls
- **Transfer**, shift part of the financial burden, for example through contracts or insurance
- **Avoid**, stop the risky activity
- **Accept**, tolerate the risk if it is low or unavoidable

A school may decide that a public announcement kiosk can operate with moderate risk, but student records cannot. Risk assessment helps justify that decision.
$md$, 4),
('8b714a41-f183-5465-9aff-8a3287f8c916','activity','Practice & Exam Drills, Lesson 2',$md$
### Review Questions

1. Name four major sources of security threats.
2. How is a vulnerability different from a threat?
3. Give one example each of an administrative, technical, and physical control.
4. Distinguish preventive, detective, and corrective controls.
5. Why are accidental threats still important in security planning?
6. What are the four common risk treatment options?
7. What variables are usually considered in a simple risk calculation?
8. Why should organizations prioritize risks instead of trying to fix everything at once?

### Worked Exam-Style Problems

**Problem A: Classify Each Item**, Classify each item as threat, vulnerability, control, or asset.

1. Unpatched web server → **Vulnerability**, weakness that can be exploited.
2. Customer database → **Asset**, valuable information resource.
3. Security awareness training → **Control**, administrative safeguard.
4. Flood affecting the data center → **Threat**, potential cause of harm.
5. Shared admin password → **Vulnerability**, weak practice that increases exposure.
6. CCTV at the server room entrance → **Control**, physical and detective safeguard.

**Problem B: Risk Matrix Computation**

A university portal has: Vulnerability, no MFA for administrator accounts; Likelihood, 4 of 5; Impact, 5 of 5. Compute the risk score and interpret it using this scale:

| Score | Interpretation |
|---|---|
| 1–5 | Low |
| 6–10 | Moderate |
| 11–15 | High |
| 16–25 | Critical |

*Step-by-Step Solution*

$$ \text{Risk Score} = \text{Likelihood} \times \text{Impact} = 4 \times 5 = 20 $$

20 falls under **Critical**. The organization should mitigate immediately, enable MFA, limit admin exposure, and review logs.

**Problem C: Choose the Best Treatment**

A small startup uses an old internet-facing service that is expensive to secure and rarely used. What is the most reasonable treatment option?

*Step-by-Step Solution*

If the service is rarely used, expensive to secure, internet-facing, and not business-critical, the sensible choice is **avoidance** by discontinuing the service. Acceptance leaves a serious entry point; transfer does not remove the technical weakness; mitigation is possible but not always cost-effective.

### Hands-On Exercises

**Exercise A: Build a Risk Register**, Create a risk register with five entries for a fictional university system using the template: Asset | Threat | Vulnerability | Likelihood | Impact | Risk Score | Suggested Control.

**Exercise B: Control Mapping**, For each incident (stolen laptop, phishing email, accidental data deletion, power interruption in a server room), assign one preventive, one detective, and one corrective control.

**Exercise C: Short Case Analysis**, A BPO company stores attendance data in a shared spreadsheet accessible through a public link. Discuss the asset, the vulnerability, the likely threat, the impact, and one appropriate treatment decision.

### How to Pass This Topic

- Expect classification questions. Faculty often test if you can distinguish threat vs vulnerability vs control.
- In risk problems, always show the formula and the given values.
- Do not give random controls. Match the control to the actual weakness.
- If likelihood is low but impact is severe, explain both. Professors reward balanced answers.
- Risk treatment terms are often memorization-heavy, but still explain why you chose one.
- Use short but precise wording in tables. Long vague answers lose points.
$md$, 5);

-- ============================================================
-- LESSON 3: Identity, Authentication, Authorization, and Access Control
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('6d38cc43-8053-5840-830b-9a3af3115ea4','content','Identity and the AAA Model',$md$
Security starts by answering a simple question: Who is using the system, and what are they allowed to do?

A user's digital identity may be represented by a username, employee number, email account, certificate, token, or other credential. Security systems then apply the **AAA model**:

- **Authentication**, proving identity
- **Authorization**, determining permissions after identity is proven
- **Accounting**, recording actions for auditing and review

Example:

- A student logs into the university portal using a username and password.
- The portal verifies the student's identity, **authentication**.
- The student can view subjects but cannot edit grades, **authorization**.
- The system stores login history and activity logs, **accounting**.

Many exam questions ask students to separate these three clearly. The easiest way is:

> Authentication asks who you are. Authorization asks what you can do. Accounting records what you did.
$md$, 1),
('6d38cc43-8053-5840-830b-9a3af3115ea4','content','Authentication Methods',$md$
Authentication factors are usually grouped into categories:

- **Something you know**, password, PIN, security answer
- **Something you have**, token, phone, smart card, OTP app
- **Something you are**, fingerprint, face, iris, voice
- **Somewhere you are**, location-based checks
- **Something you do**, behavioral patterns such as typing rhythm

Using more than one factor gives **multi-factor authentication** or MFA. For example, password + OTP is stronger than password alone.

Good authentication design also considers:

- password length and complexity,
- account lockout or throttling,
- credential storage,
- reset procedures,
- session timeout,
- protection against phishing.

A weak reset process can ruin a strong login system. If an attacker can easily reset a password through social engineering, the system remains vulnerable.
$md$, 2),
('6d38cc43-8053-5840-830b-9a3af3115ea4','activity','Authorization and Access Control Models',$md$
After authentication, a system decides what the subject is allowed to access. This is **authorization**.

Common access control ideas include:

- **Least privilege**, users get only the access they need
- **Need to know**, sensitive information is shared only when necessary
- **Separation of duties**, critical tasks are split so one person cannot abuse the whole process
- **Default deny**, deny access unless explicitly allowed

Common access control models:

| Model | Core Idea | Example |
|---|---|---|
| DAC | Owner can decide access | A file owner shares a folder with selected users |
| MAC | Access follows labels and rules | Government-classified records |
| RBAC | Access depends on role | Registrar staff, faculty, cashier, student |
| ABAC | Access depends on attributes | Access only if department = HR and time = office hours |

In many organizations, RBAC is practical because institutions already assign jobs by role. It is easier to manage than giving every user custom permissions one by one.
$md$, 3),
('6d38cc43-8053-5840-830b-9a3af3115ea4','activity','Account Management and Common Access Mistakes',$md$
Even a good access model can fail if accounts are poorly managed.

Common mistakes include:

- shared accounts,
- default passwords,
- orphaned accounts of resigned employees,
- excessive admin privileges,
- no periodic access review,
- letting users keep rights from old positions.

Suppose a former intern still has access to a cloud drive. That is an account management problem. If a finance employee can both create and approve payments, that is a separation-of-duties problem.

A simple secure account life cycle includes:

1. Create account based on approved request
2. Assign minimum required access
3. Review access regularly
4. Adjust access when role changes
5. Disable or remove access when no longer needed

For introductory security, remember this principle: most access problems are management problems before they become technical incidents.
$md$, 4),
('6d38cc43-8053-5840-830b-9a3af3115ea4','activity','Practice & Exam Drills, Lesson 3',$md$
### Review Questions

1. What does the AAA model stand for?
2. Differentiate authentication from authorization.
3. Give three examples of authentication factors.
4. What is multi-factor authentication?
5. Define least privilege.
6. Compare DAC and RBAC.
7. Why are shared accounts risky?
8. What is separation of duties?

### Worked Exam-Style Problems

**Problem A: AAA Identification**, For each statement, identify Authentication, Authorization, or Accounting.

1. The system checks whether the entered OTP is correct → **Authentication**, identity is being verified.
2. A faculty member can encode grades but cannot release payroll → **Authorization**, access rights are defined.
3. The system stores the timestamp and IP address of a login → **Accounting**, activity is recorded.
4. A user presents a fingerprint to access a secure workstation → **Authentication**, biometric factor verifies identity.

**Problem B: Choose the Access Control Model**

A university wants: students view only their own grades; instructors edit grades only for subjects they handle; the registrar finalizes records; permissions depend mainly on job function. Which model is most appropriate?

*Step-by-Step Solution*

Key clue: permissions depend mainly on job function. Student, Instructor, Registrar are **roles**. Therefore the most appropriate model is **RBAC**. DAC lets individual owners decide access (messy); MAC is more label-driven and rigid; ABAC is possible but role-based control is the most direct and manageable here.

**Problem C: Access Review Case**

A staff member transferred from admissions to procurement but still retains admissions access. What principle is violated, and what should be done?

*Step-by-Step Solution*

This violates **least privilege** because the staff member keeps more access than required. It also shows weak account management and poor access review. Correct action: revoke old admissions permissions; assign only procurement-related permissions; review whether similar excess access exists for others; improve role-change procedures.

### Hands-On Exercises

**Exercise A: Create an RBAC Table**, Design an RBAC matrix. Roles: Student, Faculty, Registrar, Cashier, IT Admin. Resources: Grades, Enrollment Records, Payment Records, User Accounts, Course Schedule. Use the format: Role | View Grades | Edit Grades | View Payments | Manage Accounts | Edit Schedule.

**Exercise B: Access Control Critique**, Evaluate this setup: all department staff use one shared account; the password is changed only once per year; logs do not show which individual edited a file. Write a one-paragraph security critique.

**Exercise C: Authentication Upgrade Plan**, A small business currently uses only passwords. Recommend a better authentication setup and explain why it improves security.

### How to Pass This Topic

- Professors love asking AAA identification. Practice fast recognition.
- For access control models, memorize the strongest keyword for each: DAC = owner decision; MAC = labels/rules; RBAC = roles; ABAC = attributes.
- In case studies, mention least privilege and separation of duties whenever relevant.
- If you see shared accounts in a problem, mention loss of accountability immediately.
- When in doubt, explain how access should change across the account life cycle.
- Keep answers practical. Faculty often reward students who think like future system administrators.
$md$, 5);

-- ============================================================
-- LESSON 4: Cryptography, Hashing, and Digital Signatures
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('965ef740-b656-5b14-88da-3520be07e937','content','Why Cryptography Exists',$md$
Cryptography protects information by transforming it so that unauthorized users cannot meaningfully read or alter it. In security, cryptography supports confidentiality, integrity, authentication, and non-repudiation.

Important terms:

- **Plaintext**, original readable data
- **Ciphertext**, encrypted unreadable output
- **Encryption**, converting plaintext to ciphertext
- **Decryption**, restoring ciphertext to plaintext
- **Key**, secret or controlled value used by an algorithm

Cryptography is not magic. If keys are poorly managed, even strong algorithms can fail in practice.
$md$, 1),
('965ef740-b656-5b14-88da-3520be07e937','content','Symmetric and Asymmetric Encryption',$md$
There are two broad encryption approaches.

**Symmetric encryption**, the same key is used to encrypt and decrypt.

- Advantages: fast, efficient for large amounts of data.
- Challenge: both parties must protect and share the same secret key securely.

**Asymmetric encryption**, a pair of keys is used: a **public key** for sharing and a **private key** kept secret.

- Advantages: supports secure key exchange, helps with digital signatures.
- Challenge: slower than symmetric methods.

A simple exam comparison:

| Property | Symmetric | Asymmetric |
|---|---|---|
| Number of keys | One shared key | Public/private pair |
| Speed | Faster | Slower |
| Typical use | Bulk data encryption | Key exchange, signatures |

In real systems, both are often used together. For example, a secure connection may use asymmetric methods to establish trust and exchange secrets, then use symmetric encryption for efficient communication.
$md$, 2),
('965ef740-b656-5b14-88da-3520be07e937','activity','Hashing and Integrity',$md$
A **hash function** takes an input and produces a fixed-size output called a hash value or digest. Hashing is not the same as encryption.

Key idea:

- Encryption is reversible with the right key
- Hashing is designed to be one-way

Uses of hashing include:

- password storage,
- file integrity checking,
- digital signatures,
- detecting unauthorized modification.

If two files produce different hashes, they are different. If a file's stored expected hash no longer matches its current hash, integrity may have been compromised.

In introductory exams, students are often asked why passwords should not be stored in plain text. The expected answer is that systems should store hashed passwords, ideally with stronger storage practices such as salting and slow password-hashing mechanisms.
$md$, 3),
('965ef740-b656-5b14-88da-3520be07e937','activity','Digital Signatures and Practical Data Protection',$md$
A **digital signature** is used to prove origin and protect integrity. Conceptually:

1. The sender creates a digest of the message.
2. The digest is signed using the sender's private key.
3. The receiver verifies using the sender's public key.

If verification succeeds, the receiver gains confidence that:

- the message was not altered,
- the signature came from the holder of the private key.

This supports integrity, authentication, and non-repudiation.

In daily IT practice, cryptography also appears in:

- secure websites,
- VPNs,
- encrypted storage,
- secure email,
- database protection,
- digital certificates.

For beginners, the safest summary is this: encryption hides data, hashing checks data, signatures prove trusted origin and integrity.
$md$, 4),
('965ef740-b656-5b14-88da-3520be07e937','activity','Practice & Exam Drills, Lesson 4',$md$
### Review Questions

1. Define plaintext, ciphertext, encryption, and key.
2. What is the difference between symmetric and asymmetric encryption?
3. Why is symmetric encryption faster?
4. Why is hashing not the same as encryption?
5. What security properties can digital signatures provide?
6. Why should passwords not be stored in plain text?
7. What is a public key used for?
8. What is a private key used for?

### Worked Exam-Style Problems

**Problem A: Identify the Correct Technique**, Match each need to the most appropriate concept.

1. Hide the contents of a confidential file → **Encryption**
2. Check whether a downloaded file was modified → **Hashing**
3. Prove that a message came from a particular sender → **Digital signature**
4. Store passwords more safely than plain text → **Hashing** (with proper password hashing methods)

**Problem B: Symmetric vs Asymmetric Choice**

A company wants to encrypt a very large archive quickly, but the key exchange between partners is a challenge. Which method fits each part?

*Step-by-Step Solution*

- Encrypting a very large archive quickly → **Symmetric encryption**
- Handling secure key exchange between partners → **Asymmetric encryption**

Best practical explanation: use asymmetric techniques to exchange or protect the symmetric key, then use symmetric encryption for the bulk file. This hybrid approach is common because it combines speed and secure key handling.

**Problem C: Signature Reasoning**

A sender signs a message digest using a private key. The receiver verifies using the public key. What does successful verification tell the receiver?

*Step-by-Step Solution*

Successful verification suggests: the message matches the signed digest → **integrity**; the signer likely possessed the private key → **authentication of origin**; the sender cannot easily deny the action later → **non-repudiation** in the intended model. It does not automatically guarantee **confidentiality**, unless encryption is also used.

### Hands-On Exercises

**Exercise A: Crypto Comparison Table**, Create a summary table with columns: Technique | Reversible? | Main Purpose | Typical Use. Fill in rows for symmetric encryption, asymmetric encryption, hashing, and digital signatures.

**Exercise B: Integrity Check Scenario**, A school distributes a software installer to multiple computer labs. Explain how hashing can help verify that the installer in every lab is the correct and untampered copy.

**Exercise C: Password Storage Reflection**, Write a short explanation to a non-technical office manager on why storing passwords in an Excel file or plain database column is dangerous.

### How to Pass This Topic

- Many students confuse hashing with encryption. Fix that early.
- Memorize the phrase: encryption for secrecy, hashing for integrity check, signatures for proof of origin.
- If a question mentions public key/private key, think asymmetric encryption or digital signatures.
- If a question asks about password storage, do not answer "encrypt passwords" unless the class specifically discussed the nuance. Intro courses usually expect "hash passwords."
- In long answers, connect the tool to the security property it supports.
- When comparing methods, a simple table-based answer is often the cleanest.
$md$, 5);

-- ============================================================
-- LESSON 5: Network Security Fundamentals
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('b10d9b37-46f8-5eaa-88a6-3c521db59d4b','content','Security in a Networked Environment',$md$
Once systems are connected, the attack surface expands. Network security focuses on protecting data in transit, network services, connected devices, and the paths through which users and attackers communicate.

Basic security concerns in networks include:

- unauthorized access,
- eavesdropping,
- spoofing,
- service disruption,
- malware spread,
- weak remote access,
- insecure wireless connections.

Network security is especially important because a single weak point can affect many systems at once.
$md$, 1),
('b10d9b37-46f8-5eaa-88a6-3c521db59d4b','content','Network Devices and Security Functions',$md$
Several network components contribute to security.

| Device or Concept | Security Purpose |
|---|---|
| Firewall | Filters traffic according to rules |
| Router | Connects networks and can enforce some traffic policies |
| Switch | Connects devices in a local network; can support VLAN separation |
| IDS | Detects suspicious activity |
| IPS | Detects and can block suspicious activity |
| VPN | Protects remote communications over untrusted networks |
| Proxy | Intermediates requests and can filter content |

A firewall is important, but it is not enough by itself. Secure network design often includes segmentation, rule review, host hardening, secure services, and monitoring.
$md$, 2),
('b10d9b37-46f8-5eaa-88a6-3c521db59d4b','activity','Segmentation, Secure Protocols, and Design Basics',$md$
A common security principle is **segmentation**. Instead of putting every device in one flat network, organizations divide systems into zones.

Examples:

- office users in one segment,
- servers in another,
- guest Wi-Fi separate from internal resources,
- public web servers placed in a DMZ-style area rather than the internal core.

This limits the spread of incidents and makes access control cleaner.

Protocol choice also matters. Secure practice usually favors protected options over insecure legacy ones. For example, secure remote administration should avoid exposed weak services and should use better-protected approaches, proper credentials, and restricted access.

Good introductory network security design asks:

- What should be public?
- What should remain internal?
- Which systems need to talk to each other?
- What traffic should be blocked by default?
$md$, 3),
('b10d9b37-46f8-5eaa-88a6-3c521db59d4b','activity','Wireless and Remote Access Security',$md$
Wireless networks and remote work introduce convenience and risk at the same time.

Common wireless and remote access issues:

- weak Wi-Fi credentials,
- rogue access points,
- unsecured public Wi-Fi usage,
- reused passwords,
- exposed remote desktop services,
- unmanaged personal devices.

Practical protections include:

- strong Wi-Fi security settings,
- separate guest networks,
- VPN for remote users,
- MFA for remote login,
- device policy enforcement,
- logging and review of remote sessions.

For Philippine environments where staff may work from homes, cafés, or shared spaces, remote access security becomes part of everyday IT operations rather than an optional extra.

A simple office topology diagram would help here: an internet edge, firewall, DMZ/public server zone, internal office LAN, server LAN, and guest Wi-Fi separated from the internal network.
$md$, 4),
('b10d9b37-46f8-5eaa-88a6-3c521db59d4b','activity','Practice & Exam Drills, Lesson 5',$md$
### Review Questions

1. Why does networking increase the attack surface?
2. What is the main job of a firewall?
3. Differentiate IDS and IPS.
4. Why is network segmentation important?
5. What is a DMZ in simple terms?
6. Why should guest Wi-Fi be separated from internal office systems?
7. What is the purpose of a VPN?
8. Why is remote access security critical today?

### Worked Exam-Style Problems

**Problem A: Choose the Best Device**, Match each need with the most suitable component.

1. Detect suspicious scanning behavior on a network → **IDS**
2. Filter inbound and outbound traffic using rules → **Firewall**
3. Securely connect remote employees to internal services → **VPN**
4. Separate visitors from internal administrative systems → **Segmentation / guest network separation**

**Problem B: Network Design Case**

A school has: a public website, faculty computers, student lab PCs, a registrar database server, and guest Wi-Fi for visitors. Describe a safer arrangement.

*Step-by-Step Solution*

A safer design should: put the public website in a public-facing server zone or DMZ-like segment; place faculty computers on an internal staff network; put student lab PCs on a separate academic/lab segment; place the registrar database server in a restricted internal server segment; keep guest Wi-Fi fully separated from internal systems; control traffic between zones using firewall rules; allow only required connections, such as web traffic to the website and authorized application traffic to the registrar server. Key principle: do not place everything on one flat network.

**Problem C: Firewall Rule Reasoning**

A company wants only HTTPS traffic from the internet to reach its public website. What should the high-level rule be?

*Step-by-Step Solution*

Allow inbound HTTPS traffic to the public web server; deny unnecessary inbound services by default; permit only required administrative traffic from trusted internal or VPN-based sources; log relevant events. This demonstrates least exposure and default deny thinking.

### Hands-On Exercises

**Exercise A: Segment a Small Network**, Draw or describe a secure layout for: one internet connection, one firewall, one web server, one file server, 20 office PCs, guest Wi-Fi, and one admin workstation. Explain which parts should communicate and which should not.

**Exercise B: Remote Access Policy Draft**, Write five basic rules for employees accessing company systems from home or public networks.

**Exercise C: Protocol Risk Reflection**, List three examples of risky networking behavior and one safer alternative for each.

### How to Pass This Topic

- Focus on function, not product names. Exams ask what the control does.
- Segmentation, DMZ, firewalls, VPNs, and IDS/IPS are very common test topics.
- When given a network case, answer with separate zones and limit communication.
- If an item asks how to protect public-facing services, mention least exposure and default deny.
- Do not overcomplicate answers with vendor-specific jargon unless required.
- Simple, well-structured network reasoning earns points.
$md$, 5);

-- ============================================================
-- LESSON 6: Host, Endpoint, and Application Security
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('7c237496-0d80-5409-a25c-133364679759','content','Host and Endpoint Security Basics',$md$
A **host** is a computer or server connected to a network. An **endpoint** includes laptops, desktops, phones, tablets, and other user devices. Host and endpoint security focuses on making these systems resistant to misuse and compromise.

Common host risks include:

- missing patches,
- weak local accounts,
- unnecessary services,
- malware infection,
- poor device configuration,
- unsafe downloads,
- unauthorized software.

A device with strong network protection can still be compromised if the local system itself is weak. That is why endpoint security matters.
$md$, 1),
('7c237496-0d80-5409-a25c-133364679759','content','System Hardening and Patch Management',$md$
**Hardening** means reducing unnecessary exposure by securely configuring a system.

Examples of hardening:

- remove unused services,
- change default settings,
- disable unnecessary accounts,
- apply secure permissions,
- enable logging,
- keep software updated.

**Patch management** is one of the most basic and most frequently tested controls. Vulnerabilities in operating systems, browsers, databases, and apps are often addressed through updates. Delayed patching increases exposure.

A simple memory tip:

> Unnecessary services create unnecessary attack surfaces.

This is why a secure build is preferred over installing everything and hoping nothing is abused.
$md$, 2),
('7c237496-0d80-5409-a25c-133364679759','activity','Malware, Safe Use, and Monitoring',$md$
**Malware** includes malicious software such as viruses, worms, ransomware, trojans, spyware, and keyloggers.

Common infection paths:

- malicious downloads,
- phishing attachments,
- unsafe websites,
- infected removable media,
- vulnerable services.

Basic host defenses include:

- endpoint protection tools,
- patching,
- user awareness,
- application control,
- backups,
- restricted privileges,
- logging and monitoring.

Monitoring matters because prevention is never perfect. Logs can reveal failed logins, privilege misuse, suspicious processes, or unusual activity patterns.
$md$, 3),
('7c237496-0d80-5409-a25c-133364679759','activity','Application Security and Secure Development Thinking',$md$
Applications must also be secure by design. Introductory application security covers common weaknesses such as:

- poor input validation,
- weak authentication,
- insecure session handling,
- improper access checks,
- careless error exposure,
- insecure storage of secrets,
- unsafe database queries.

The big idea is **secure SDLC thinking**: security should be considered during requirements, design, coding, testing, deployment, and maintenance, not only after release.

When students hear "application security," they should think of this question:

> What could a user or attacker do that the system designer failed to expect or restrict?

That mindset is more valuable than memorizing long vulnerability lists without understanding the logic behind them.
$md$, 4),
('7c237496-0d80-5409-a25c-133364679759','activity','Practice & Exam Drills, Lesson 6',$md$
### Review Questions

1. What is host security?
2. What is endpoint security?
3. Why is patch management important?
4. What does system hardening mean?
5. Give three common malware infection paths.
6. Why are logs important in host security?
7. Give three examples of application security weaknesses.
8. What is the main idea behind secure SDLC?

### Worked Exam-Style Problems

**Problem A: Hardening Identification**

A server has: an unused remote service left enabled; a default admin account still active; no recent updates; broad file permissions for all users. Identify four host security weaknesses.

*Step-by-Step Solution*

1. Unused remote service left enabled → unnecessary service expands attack surface
2. Default admin account still active → predictable or high-risk account exposure
3. No recent updates → missing patches may leave known vulnerabilities
4. Broad file permissions for all users → poor access control and least privilege violation

**Problem B: Malware Response Case**

A staff laptop suddenly shows encrypted files and a ransom note. What immediate actions should the IT team take first?

*Step-by-Step Solution*

1. Isolate the laptop from the network, prevent spread
2. Report the incident according to procedure, ensure coordinated response
3. Preserve relevant evidence such as logs and timestamps when possible, support investigation
4. Check backups and scope, determine recoverability and whether more systems are affected
5. Do not casually use the device further, avoid worsening the damage

This is introductory incident thinking connected to host security.

**Problem C: Application Scenario**

A web form accepts any text entered by the user and sends it directly into a database query. Why is this dangerous?

*Step-by-Step Solution*

The system lacks proper input handling and safe query design. An attacker may submit crafted input that changes query behavior. This can lead to unauthorized data access or modification. The problem reflects poor input validation and insecure application logic.

### Hands-On Exercises

**Exercise A: Hardening Checklist**, Write a 10-point hardening checklist for a newly installed office workstation.

**Exercise B: Malware Prevention Plan**, A small school computer lab has frequent infections from USB drives. Propose a practical prevention plan using technical controls, user rules, and administrative actions.

**Exercise C: Secure App Reflection**, Choose a simple application such as an online registration form or inventory system. List one authentication risk, one authorization risk, one data handling risk, and one logging/auditing need.

### How to Pass This Topic

- Expect questions that ask you to spot weaknesses in a scenario.
- If a case mentions outdated software, answer with patch management immediately.
- If a case mentions unused services, answer with hardening and attack surface reduction.
- For app security questions, stay logical: input, access, session, storage, logging.
- Do not answer only with "install antivirus." Faculty usually want layered controls.
- Use phrases like least privilege, secure configuration, and monitoring where appropriate.
$md$, 5);

-- ============================================================
-- LESSON 7: Security Governance, Policies, Ethics, and the Philippine Legal Environment
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('2f4923a6-20df-5b29-bdf1-a8e7ad5a8f6f','content','Why Governance and Policy Matter',$md$
Technology alone cannot secure an organization. Systems need rules, responsibilities, and decision-making structures. That is the role of **security governance**.

Governance answers questions such as:

- Who approves security policies?
- Who owns which assets?
- What controls are mandatory?
- How are exceptions handled?
- How are incidents reported?
- How is compliance checked?

A **policy** is a formal statement of expectations and rules. A **standard** gives required specifications. A **procedure** gives step-by-step instructions. A **guideline** gives recommended practice.

Example:

- Policy: all sensitive data must be protected
- Standard: passwords must meet minimum requirements
- Procedure: how new accounts are requested and approved
- Guideline: tips for secure remote work
$md$, 1),
('2f4923a6-20df-5b29-bdf1-a8e7ad5a8f6f','content','Core Security Policies Students Should Recognize',$md$
Introductory security courses commonly discuss policies such as:

- acceptable use policy,
- password policy,
- access control policy,
- backup and recovery policy,
- incident reporting policy,
- remote access policy,
- email and internet use policy,
- data classification and retention policy.

A good policy is clear, enforceable, aligned to business needs, and supported by management. A policy that nobody follows is not effective governance.

Security governance also links to awareness training. Many incidents involve human error, phishing, weak handling of data, or policy violations. This is why awareness is not optional.
$md$, 2),
('2f4923a6-20df-5b29-bdf1-a8e7ad5a8f6f','activity','Ethics, Professional Responsibility, and User Trust',$md$
Security work involves power. IT professionals may manage privileged accounts, confidential records, logs, and infrastructure. Because of that, **ethics** is central.

An ethical IT practitioner should:

- respect privacy,
- avoid unauthorized access,
- handle data only for legitimate purposes,
- protect confidentiality,
- report weaknesses responsibly,
- follow legal and institutional rules,
- document actions honestly.

Being technically capable does not make an action ethically acceptable. For example, reading confidential data without authorization "just to test" is still improper if done outside approved scope.

A useful classroom distinction:

- *Can you do it?* is a technical question.
- *Should you do it?* is an ethical and legal question.
$md$, 3),
('2f4923a6-20df-5b29-bdf1-a8e7ad5a8f6f','activity','Philippine Legal and Regulatory Context',$md$
In Philippine IT environments, introductory security study usually includes legal awareness. Students should know that organizations handling data and digital systems operate under laws and policies that shape responsible practice.

Important themes include:

- protection of personal information,
- cybercrime-related offenses,
- lawful access and evidence handling,
- institutional accountability for poor data practices,
- documentation and reporting responsibilities.

For practical study, remember these legal angles:

- personal data must be handled carefully,
- unauthorized access and misuse of systems can have criminal consequences,
- organizations may face liability for weak protection of sensitive information,
- security teams must work within legal and organizational authority.

In exam answers, do not try to act like a lawyer. Instead, show that you understand the principle: security work must be technically sound, ethically responsible, and legally aware.
$md$, 4),
('2f4923a6-20df-5b29-bdf1-a8e7ad5a8f6f','activity','Practice & Exam Drills, Lesson 7',$md$
### Review Questions

1. What is security governance?
2. Differentiate policy, standard, procedure, and guideline.
3. Why are security policies important?
4. Why is user awareness training necessary?
5. Give three examples of common organizational security policies.
6. Why is ethics central to information security work?
7. What is the difference between technical ability and ethical permission?
8. Why must IT security practice be legally aware in the Philippines?

### Worked Exam-Style Problems

**Problem A: Policy Classification**, Classify each statement as policy, standard, procedure, or guideline.

1. "All employees must use company-approved channels for reporting incidents." → **Policy**, broad rule statement
2. "Passwords must be at least 12 characters long." → **Standard**, specific required rule
3. "To request an account, fill out Form A, secure approval, then submit to IT." → **Procedure**, step-by-step instruction
4. "When working from home, avoid public Wi-Fi when possible." → **Guideline**, recommended good practice

**Problem B: Ethics Case**

An IT intern discovers that they can access confidential employee files because of a permission error. Out of curiosity, the intern opens a few files without approval but does not change anything. Was this acceptable?

*Step-by-Step Solution*

No, it was not acceptable. Access was not authorized for that purpose; confidential files were viewed without legitimate business need; ethical responsibility includes respecting privacy and reporting weaknesses properly. Correct action: stop, document the issue responsibly, and report the permission problem through the proper channel.

**Problem C: Short Legal Awareness Response**

Why should a company handling customer personal data take security controls seriously even if it has never been attacked before?

*Suggested Answer Structure*

- Handling personal data creates protection responsibilities.
- Weak controls may lead to unauthorized disclosure, misuse, or loss.
- Legal and regulatory consequences may follow from poor protection.
- Trust and reputation can also be damaged.
- Therefore, security is a proactive duty, not only a reaction after an incident.

### Hands-On Exercises

**Exercise A: Draft a Mini Password Policy**, Write a short password and authentication policy for a student organization managing member records. Include password basics, account responsibility, reset handling, and an MFA recommendation.

**Exercise B: Ethical Reflection**, Write one paragraph answering: If you accidentally discover a weakness in your school's system, what is the ethical way to respond?

**Exercise C: Policy Audit Check**, Take any everyday process such as email use, shared drive access, or student record handling. List one missing policy, one missing standard, one missing procedure, and one missing awareness point.

### How to Pass This Topic

- Most exams here are definition + case analysis.
- Memorize the difference among policy, standard, procedure, and guideline.
- In ethics questions, mention authorization, privacy, responsibility, and proper reporting.
- In legal-awareness questions, avoid overclaiming legal details unless required. Focus on principle and responsibility.
- Many students answer too abstractly. Use realistic organizational context.
- Professors often reward answers that connect technology to people, process, and accountability.
$md$, 5);

-- ============================================================
-- LESSON 8: Incident Response, Business Continuity, and Disaster Recovery
-- ============================================================

INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('d633a3b4-38a6-5dee-9d0e-d65b489ae3dc','content','What an Incident Is',$md$
A security event becomes an **incident** when it threatens confidentiality, integrity, availability, or normal operations and requires response.

Examples:

- malware infection,
- unauthorized account use,
- lost laptop with sensitive files,
- website defacement,
- insider misuse,
- ransomware,
- major data leak,
- denial-of-service disruption.

Not every unusual event is a confirmed breach, but suspicious events must still be assessed. Good security operations depend on recognizing and escalating incidents quickly.
$md$, 1),
('d633a3b4-38a6-5dee-9d0e-d65b489ae3dc','content','Basic Incident Response Process',$md$
An introductory incident response flow often includes:

1. **Preparation**, policies, roles, tools, contacts, backups, training
2. **Identification**, determine whether an incident is occurring
3. **Containment**, limit spread and damage
4. **Eradication**, remove the cause
5. **Recovery**, restore normal service safely
6. **Lessons learned**, improve after the incident

A practical example:

- suspicious endpoint behavior is detected,
- IT confirms malware,
- affected host is isolated,
- malicious files are removed,
- system is restored from a clean state,
- controls are improved to prevent recurrence.
$md$, 2),
('d633a3b4-38a6-5dee-9d0e-d65b489ae3dc','activity','Evidence, Documentation, and Communication',$md$
During incidents, technical skill is not enough. Teams must also document actions and communicate clearly.

Important response habits:

- record time, actions, and observations,
- preserve relevant logs and evidence,
- avoid unnecessary alteration of affected systems,
- notify the correct internal contacts,
- escalate according to severity,
- communicate carefully to avoid confusion or leaks.

In introductory courses, students are not expected to become digital forensic experts yet. But they should understand that sloppy handling of incidents can destroy useful evidence and make recovery harder.
$md$, 3),
('d633a3b4-38a6-5dee-9d0e-d65b489ae3dc','activity','Business Continuity and Disaster Recovery',$md$
**Business Continuity Planning (BCP)** keeps critical operations going during disruption. **Disaster Recovery (DR)** focuses on restoring IT systems and data after disruption.

Two common metrics:

- **RTO, Recovery Time Objective**, how quickly a service should be restored
- **RPO, Recovery Point Objective**, how much data loss is tolerable in time terms

Example:

- If payroll has an RTO of 4 hours, it should be restored within 4 hours.
- If it has an RPO of 30 minutes, losing more than 30 minutes of data is unacceptable.

BCP and DR matter in the Philippines because organizations may face brownouts, connectivity problems, typhoons, floods, device theft, and ransomware. Good planning reduces panic and downtime.

A simple exam summary:

- Incident response handles the event now.
- Business continuity keeps essential functions running.
- Disaster recovery restores systems after serious disruption.
$md$, 4),
('d633a3b4-38a6-5dee-9d0e-d65b489ae3dc','activity','Practice & Exam Drills, Lesson 8',$md$
### Review Questions

1. What makes an event a security incident?
2. List the major phases of incident response.
3. Why is containment important?
4. Why should actions during an incident be documented?
5. What is the difference between BCP and DR?
6. Define RTO.
7. Define RPO.
8. Why are lessons learned important after an incident?

### Worked Exam-Style Problems

**Problem A: Identify the Incident Response Phase**, For each action, identify the phase.

1. The team disconnects an infected PC from the network → **Containment**
2. The company prepares contact lists and response playbooks in advance → **Preparation**
3. The malware is removed and the root cause is fixed → **Eradication**
4. Systems are restored from clean backups → **Recovery**
5. The team holds a post-incident review → **Lessons learned**

**Problem B: RTO and RPO Interpretation**

A university enrollment system has RTO = 6 hours and RPO = 1 hour. Explain both.

*Step-by-Step Solution*

- **RTO = 6 hours**, the enrollment system should be restored within 6 hours after disruption.
- **RPO = 1 hour**, the organization should not lose more than 1 hour of enrollment data.

Interpretation: recovery planning must support restoration within 6 hours, and backups or replication must be frequent enough that data loss stays within 1 hour.

**Problem C: Incident Scenario Analysis**

A staff member reports that several shared folders have strange file extensions and cannot be opened. What should happen first?

*Step-by-Step Solution*

1. Treat the issue as a possible security incident
2. Identify and assess the scope quickly
3. Contain affected systems or shares to prevent spread
4. Notify the proper response contacts
5. Preserve relevant evidence and logs
6. Review backups for recovery planning

If ransomware is suspected, immediate isolation becomes a priority.

### Hands-On Exercises

**Exercise A: Mini Incident Response Plan**, Write a one-page response outline for a phishing-based account compromise in a school office. Include who reports, who receives the report, immediate steps, containment ideas, recovery actions, and documentation needs.

**Exercise B: Continuity Ranking**, A small organization has these services: payroll, company website, internal chat, CCTV archive, online ordering, HR records. Rank them from most to least critical for recovery and briefly justify.

**Exercise C: BCP/DR Reflection**, Assume a regional office loses power and internet during a typhoon. Write a short paragraph describing one business continuity action, one disaster recovery action, and one long-term lesson learned.

### How to Pass This Topic

- Memorize the incident response phases in order.
- Distinguish clearly among containment, eradication, and recovery.
- In incident cases, do not jump straight to "reformat everything." Think controlled response first.
- For RTO/RPO, define each in plain language before applying it.
- Examiners often want practical sequence, so answer step-by-step.
- If a question involves operations during disasters, connect technical recovery to business impact.
$md$, 5);

-- SOURCES (metadata, not inserted): UP Diliman CS 153 Intro to Computer
-- Security; PUP BSIT/CS; FEU Institute of Technology BSIT Cybersecurity; Adamson
-- University BSIT 2022; Ateneo de Manila CSCI 61; DLSU ITSECUR; CHED CMO 25
-- s. 2015 (IAS101/IAS102 outcomes).
