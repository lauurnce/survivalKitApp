-- ============================================================
-- Information Assurance and Security 1 — Modules & Sections (SCAFFOLD)
-- Subject ID: 30000000-0003-0002-0001-000000000004
-- 3rd Year, Semester 2 — major
-- Suggested module count: 6-10
--
-- Reserved UUID namespace below is collision-free and deterministic.
-- Fill module titles/slugs + section headings/bodies from the GPT-5.5
-- deep-research output, then run this file once. Re-running is safe
-- (the DELETE clears prior rows for this subject first).
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
-- IMPORT TEMPLATE — one INSERT per module. Replace placeholders.
-- content sections are FREE; the final activity section is PAID.
-- ide_language (python|sql|java|c), starter_code, topology_data are
-- all OPTIONAL columns — include only when the section needs them.
-- ============================================================
--
-- INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
-- ('5ccb51da-75cd-5814-af37-e74b8452fe4e','content','<Heading>',$md$
-- <full markdown teaching body — free tier>
-- $md$, 1),
-- ('5ccb51da-75cd-5814-af37-e74b8452fe4e','activity','Practice & Exam Drills — Lesson 1',$md$
-- <review questions, worked exam problems w/ solutions, how-to-pass tips — paid tier>
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

- **Authenticity** — proving that a user, message, or system is genuine.
- **Accountability** — making actions traceable to a user or process.
- **Non-repudiation** — preventing a sender or actor from denying an action they actually performed.
- **Privacy** — protecting personal and sensitive information from improper collection, use, or disclosure.

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
('5ccb51da-75cd-5814-af37-e74b8452fe4e','activity','Practice & Exam Drills — Lesson 1',$md$
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

1. Unreachable website during enrollment → **Availability** — the service is not accessible when needed.
2. Unauthorized grade change → **Integrity** — data was altered improperly.
3. Payment records accessible to all staff → **Confidentiality** — sensitive data is exposed to unauthorized persons.
4. User denies approving a transaction → **Non-repudiation** (with accountability related) — the system must prove who performed the action.

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

**Exercise A: Asset Inventory Starter** — Create a mini asset inventory for one of: school LMS, barangay records system, small online shop, student organization website. Use the format: Asset | Why valuable | Main threat | Possible vulnerability | Possible impact. Write at least five assets.

**Exercise B: CIA Analysis Drill** — Choose one Philippine-context system such as a hospital record system, e-commerce delivery app, BPO attendance system, or university enrollment portal. Write one paragraph each for why confidentiality, integrity, and availability matter.

**Exercise C: Security Process Reflection** — Describe one real or imagined incident where a system was initially secure but later became vulnerable because of change. Explain what changed and why continuous review was necessary.

### How to Pass This Topic

- Memorize the core terms exactly: asset, threat, vulnerability, attack, risk, confidentiality, integrity, availability.
- Professors often ask scenario-based identification, not just definitions.
- When answering, always connect the problem to the business effect or organizational impact.
- Do not confuse integrity with confidentiality. If data is changed incorrectly, that is integrity, not confidentiality.
- Do not say "security means secrecy only." Availability is heavily tested.
- In essay questions, write in a clear chain: asset → threat → vulnerability → attack → impact.
- For long tests, short definitions may be worth few points, but case analysis usually carries more weight.
$md$, 5);

