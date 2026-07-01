-- ============================================================
-- Systems Administration and Maintenance — Modules & Sections (SCAFFOLD)
-- Subject ID: 40000000-0004-0001-0001-000000000001
-- 4th Year, Semester 1 — major
-- Suggested module count: 6-10
--
-- Reserved UUID namespace below is collision-free and deterministic.
-- Fill module titles/slugs + section headings/bodies from the GPT-5.5
-- deep-research output, then run this file once. Re-running is safe
-- (the DELETE clears prior rows for this subject first).
-- ============================================================

DELETE FROM modules WHERE subject_id = '40000000-0004-0001-0001-000000000001';

-- ---- Reserved module UUIDs (use in order; delete unused rows) ----
--   M01: 0b43e829-9722-556b-ac9d-2ff5de1e2776
--   M02: 04770e05-bf49-595b-b07c-05a0a61b1cb4
--   M03: 184744d5-a256-573c-a94d-4159ba326ee0
--   M04: a8fe3e00-4cab-50cd-83a1-f8ae4358be20
--   M05: adde31d0-fb73-57bf-841d-06791c73f84c
--   M06: 9d505050-c2b5-5ef9-b212-e026f5bff7e0
--   M07: ccc292bd-c576-599e-8493-11c2b172aa90
--   M08: 9597a77e-1d87-5e6c-92c7-637508ef238b
--   M09: 7d4fdeda-d67f-5f5d-b1e6-4dd555319d4a
--   M10: 673f2341-197f-597b-afc9-aa0e332143fc
--   M11: 786c6b39-85a8-574f-93f3-41186224903a
--   M12: 95e887b9-c2ac-5358-a86b-b5f37cab1bd0

-- INSERT INTO modules (id, subject_id, title, slug, sort_order) VALUES
--   ('0b43e829-9722-556b-ac9d-2ff5de1e2776','40000000-0004-0001-0001-000000000001','Lesson 1: <TITLE>','lesson-1-<slug>',1),
--   ('04770e05-bf49-595b-b07c-05a0a61b1cb4','40000000-0004-0001-0001-000000000001','Lesson 2: <TITLE>','lesson-2-<slug>',2),
--   ('184744d5-a256-573c-a94d-4159ba326ee0','40000000-0004-0001-0001-000000000001','Lesson 3: <TITLE>','lesson-3-<slug>',3),
--   ('a8fe3e00-4cab-50cd-83a1-f8ae4358be20','40000000-0004-0001-0001-000000000001','Lesson 4: <TITLE>','lesson-4-<slug>',4),
--   ('adde31d0-fb73-57bf-841d-06791c73f84c','40000000-0004-0001-0001-000000000001','Lesson 5: <TITLE>','lesson-5-<slug>',5),
--   ('9d505050-c2b5-5ef9-b212-e026f5bff7e0','40000000-0004-0001-0001-000000000001','Lesson 6: <TITLE>','lesson-6-<slug>',6),
--   ('ccc292bd-c576-599e-8493-11c2b172aa90','40000000-0004-0001-0001-000000000001','Lesson 7: <TITLE>','lesson-7-<slug>',7),
--   ('9597a77e-1d87-5e6c-92c7-637508ef238b','40000000-0004-0001-0001-000000000001','Lesson 8: <TITLE>','lesson-8-<slug>',8),
--   ('7d4fdeda-d67f-5f5d-b1e6-4dd555319d4a','40000000-0004-0001-0001-000000000001','Lesson 9: <TITLE>','lesson-9-<slug>',9),
--   ('673f2341-197f-597b-afc9-aa0e332143fc','40000000-0004-0001-0001-000000000001','Lesson 10: <TITLE>','lesson-10-<slug>',10),
--   ('786c6b39-85a8-574f-93f3-41186224903a','40000000-0004-0001-0001-000000000001','Lesson 11: <TITLE>','lesson-11-<slug>',11),
--   ('95e887b9-c2ac-5358-a86b-b5f37cab1bd0','40000000-0004-0001-0001-000000000001','Lesson 12: <TITLE>','lesson-12-<slug>',12);

-- ---- Reserved section UUIDs, per module ----
-- Module 1 (0b43e829-9722-556b-ac9d-2ff5de1e2776):
--   S1: df682db7-97c5-5424-88da-b36e84107868
--   S2: 163cca96-16c9-553a-9f43-04492b6d9699
--   S3: 0ca7a419-1721-5748-88b2-604af3c9b62e
--   S4: 0795feb9-8c92-5ee8-bd6e-255ff3f567ec
--   S5: 80512e2c-6187-564b-9a1c-c7327d33fba5
--   S6: 89b8a6cc-9506-5c43-9606-98fe376c6026
--   S7: 2db813c7-ec5a-5d6f-906b-13491c4ce7a7
--   S8: b5135de6-a6cf-5e79-b59c-fb5fd4f70497
--   S9: 4982e9b3-b70e-5ec7-8a87-55430368745b
--   S10: 223cda21-02f2-55ed-9196-426940842180  <- reserve last for kind='activity'
-- Module 2 (04770e05-bf49-595b-b07c-05a0a61b1cb4):
--   S1: fd41810e-3fcc-5cb0-b561-49a5b7e825d8
--   S2: e1d9a3bc-5d81-5d49-b8da-1c61f6389086
--   S3: 923d1bd6-2f26-599b-82d4-a9d802650042
--   S4: 2da84d31-d1f6-57cd-b521-f34a0fdbfb26
--   S5: f5f1516a-69cb-5ae8-96df-81d11f561861
--   S6: 1a93bfb6-07ed-5860-9e89-5322b47429f4
--   S7: 40f54f2e-1d16-5fbe-ab9e-44dc085ff285
--   S8: 69f98694-36b0-52a8-9f5a-4ff7af28df47
--   S9: 3907da40-13db-53b7-83d1-bb0352d988c7
--   S10: abe3847e-199c-588f-bcad-bd1d9e22ca69  <- reserve last for kind='activity'
-- Module 3 (184744d5-a256-573c-a94d-4159ba326ee0):
--   S1: 92ebbe74-aaac-51a1-857f-6f61fa1d350a
--   S2: e542b644-e062-5581-9ddf-72f1a95cc904
--   S3: cef1cffd-2664-59e1-9253-4bd139983061
--   S4: 17f0bb83-d314-58f4-9a96-814118b36770
--   S5: c3a9eaad-a3ae-51fc-b3ac-149686f8ee0a
--   S6: ed0cc582-1486-55c3-a2b8-e39e2f667fb0
--   S7: 03a5e8a9-3495-529a-9d20-9a78cc03f4ff
--   S8: 0bbba00b-3096-5c6a-8250-1dce48620edb
--   S9: bf2fe92b-0b4f-52b8-b71f-3e59f95ecb3a
--   S10: f63d996f-5f1c-55c8-ad0b-e6ac1bd96480  <- reserve last for kind='activity'
-- Module 4 (a8fe3e00-4cab-50cd-83a1-f8ae4358be20):
--   S1: 21cdba49-6984-58fc-8149-d6cfdb78787a
--   S2: 9fc7dfbf-eb03-522b-ab67-00bfdd30c56c
--   S3: 9cfc4c80-cffe-5720-bcf1-9c62520d6c41
--   S4: 7f830a3d-fc29-5468-9699-6c487fda2b58
--   S5: a06713d6-faac-5d91-9766-f7f416d5440b
--   S6: 8e401d7e-1028-58b7-8236-ee7ad6465bb6
--   S7: 1664a3a9-34bc-5b80-9029-4e4c08980f0d
--   S8: 553cec19-238d-520e-8c75-f78170198c56
--   S9: bbd2363c-2757-5ff5-bd16-7766262bf683
--   S10: e8459055-b8f6-56a6-b928-1f0fdd0cb40b  <- reserve last for kind='activity'
-- Module 5 (adde31d0-fb73-57bf-841d-06791c73f84c):
--   S1: ab3f5363-c163-56c9-ace7-2e5e87efae61
--   S2: 1283fd07-1aa1-54dc-8f31-4be83ea76d5f
--   S3: bb0a6345-d611-5f84-833b-27006459cdf5
--   S4: d1ed0ebc-bc75-5b18-8805-8f4715fe05e8
--   S5: 9040a287-8240-523d-bdaa-8789a96e1f54
--   S6: e8b256e9-6eeb-58da-b09b-2d2b2bedae12
--   S7: 9e324b54-e1fd-5df3-8fec-c93a7348e2a6
--   S8: 65461092-0352-5a91-9074-ff52f8f47150
--   S9: a2aa5f1e-d7e6-5a26-a7bd-7965c5adcf7d
--   S10: 4307d801-e4dd-5863-b3b1-ec3a1d69a0ec  <- reserve last for kind='activity'
-- Module 6 (9d505050-c2b5-5ef9-b212-e026f5bff7e0):
--   S1: 3bf5a1bd-6426-556d-8b1f-238d0c1be194
--   S2: 356f32aa-3e62-5193-b222-73962c9b7655
--   S3: 92e6f295-187e-5fd6-841e-ccab2f696c5d
--   S4: cd906f63-5ff6-57b7-8957-ccd7989cb0b6
--   S5: fd8adfe6-4d05-5292-82d7-71c6bf879179
--   S6: ac53e635-7ea7-551d-958d-08c964d1526e
--   S7: 8a54338e-b2d7-54ec-b47d-d7dfac38aed6
--   S8: bac4f12e-d556-5a2e-b069-9292a4ec5d79
--   S9: 9508e63e-6bcd-55ab-8ee0-e6e118899a08
--   S10: c1e5992d-ef21-5333-93cb-26ba627ce486  <- reserve last for kind='activity'
-- Module 7 (ccc292bd-c576-599e-8493-11c2b172aa90):
--   S1: 1c9b5086-4dec-58a3-956b-2bbb57bff6a9
--   S2: 9543f76b-04b3-58bd-8e0f-d0a9e99110a4
--   S3: 2a447366-3f5f-5f80-b400-5b49d0fb0f9c
--   S4: cc56aaef-a5df-548e-8740-b7e92a77067f
--   S5: 2007190a-8f95-53aa-b83c-640c6d59c9d4
--   S6: ee7c66c5-8fc4-59ad-9dc0-7c4b22b30ffb
--   S7: 0582389b-6df7-575b-865f-b387e5d47917
--   S8: a76dedef-2ed2-58ea-91bd-16287aa6c0e1
--   S9: 78cf252c-7d6c-5cf6-8cff-6c5f77030e90
--   S10: c395eba4-f37e-5534-9e14-b2bfb030db8e  <- reserve last for kind='activity'
-- Module 8 (9597a77e-1d87-5e6c-92c7-637508ef238b):
--   S1: d5296c63-e3fc-5987-b415-5a069c60915e
--   S2: 69d56f98-a855-5cff-90d0-9b01055839c6
--   S3: 135f1ece-0a72-5529-9244-708d24955720
--   S4: 45ff46e7-e88d-568a-ad57-acd52c7c3197
--   S5: 26535888-8391-541f-8a37-86b4d6322a67
--   S6: 11e7bb69-524e-5261-947f-ff28985a27bf
--   S7: 0f005cf9-356a-5847-95e6-7d887798dbba
--   S8: 2d572eb0-c1c7-5933-a27c-8348a8471114
--   S9: 1348021f-de5a-52c5-aa2f-cf63df044cb3
--   S10: 32b9ef8a-6e07-5731-8614-6e9e601fc177  <- reserve last for kind='activity'
-- Module 9 (7d4fdeda-d67f-5f5d-b1e6-4dd555319d4a):
--   S1: f1b9a318-7afe-5861-9812-87ff993f8f7f
--   S2: 35e90c85-7c65-5f20-b341-f0643ce8357f
--   S3: 8e2a1747-e42a-54a9-a597-1595035f21bf
--   S4: 04339c81-6a0f-5958-b1c6-4e449cbbb6de
--   S5: 04ab7df7-53e8-55ac-a9a3-811ef54f3a35
--   S6: f4c84582-23c0-527b-a441-3df85b2fc17b
--   S7: 22987f56-11d1-501c-a4ce-315fcfab7d20
--   S8: 9bd9355f-3f89-5473-8d2c-602bafd814b4
--   S9: 03e7f475-46e0-51fe-b436-81764096bb57
--   S10: 89c2f7d9-ed89-512f-9940-70e72e9cbf9f  <- reserve last for kind='activity'
-- Module 10 (673f2341-197f-597b-afc9-aa0e332143fc):
--   S1: 869b9511-3fb0-5619-85ab-9574671cf926
--   S2: f1f24bd9-6c97-5aa7-872f-dcd916b100a2
--   S3: a7fc9c43-8d6b-50b3-9dfb-c67c2e6fc070
--   S4: decdd2e7-21a3-5699-bbd6-afe3217953ac
--   S5: 7be446d9-adf6-52e3-995a-5157598bd0b6
--   S6: 33e3bd3a-901b-584e-94f9-a63107287cf7
--   S7: be6b9883-12ff-57e7-a1c3-a21a9675c62f
--   S8: 0a83e218-4e89-5c65-af92-9b8b9e0547ad
--   S9: 268c7d04-df3b-5a82-9b24-3050146cca1b
--   S10: f2ee4cf5-a4eb-56da-b57b-55ad9cfc9ff5  <- reserve last for kind='activity'
-- Module 11 (786c6b39-85a8-574f-93f3-41186224903a):
--   S1: 2fbcb711-bbb8-57e0-b61e-69fd8150da0f
--   S2: d19c20ba-3ef6-5ac0-9936-1b04f60a552f
--   S3: 608af82f-d508-5cff-8daf-66abfe0bd9fd
--   S4: 40efb50e-f1be-57e4-a1da-94ebaf4b4d0a
--   S5: daf4629c-34ea-5302-ba88-29830c875f63
--   S6: 6ffd7645-0229-524f-b8d8-16d7840f1b70
--   S7: dc61100d-56c9-56e0-ae02-3cc71b8d03a6
--   S8: c51db5a3-fe71-528c-abdb-1cf250408240
--   S9: 87b3440a-a22c-56c0-97a7-3959a8b3d327
--   S10: 3c542ace-f378-5cd9-a3ee-1f7c75e61d09  <- reserve last for kind='activity'
-- Module 12 (95e887b9-c2ac-5358-a86b-b5f37cab1bd0):
--   S1: 45304188-c594-54bd-929b-fe4e8a95d6e0
--   S2: f56bf69e-5525-5c98-b7d4-195f58dacf22
--   S3: af247b03-501a-5153-8835-7946ba84cfbc
--   S4: 7c55df62-38db-5ad0-af6a-2cb10eb8bc51
--   S5: a3f387d9-555b-5091-99a4-d3dac2a89ae3
--   S6: c64dccba-b854-5aa2-9b34-16da8e23d883
--   S7: 1e0df3f0-d1e3-521d-8109-4d0b78d64e7b
--   S8: e2da667b-da08-5d03-8673-8777a8e95b0e
--   S9: 94b6e8f2-0f74-52e8-adea-2b4d381aa631
--   S10: 31672875-7aa9-5283-8fca-b10f0f286494  <- reserve last for kind='activity'

-- ============================================================
-- IMPORT TEMPLATE — one INSERT per module. Replace placeholders.
-- content sections are FREE; the final activity section is PAID.
-- ide_language (python|sql|java|c), starter_code, topology_data are
-- all OPTIONAL columns — include only when the section needs them.
-- ============================================================
--
-- INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
-- ('0b43e829-9722-556b-ac9d-2ff5de1e2776','content','<Heading>',$md$
-- <full markdown teaching body — free tier>
-- $md$, 1),
-- ('0b43e829-9722-556b-ac9d-2ff5de1e2776','activity','Practice & Exam Drills — Lesson 1',$md$
-- <review questions, worked exam problems w/ solutions, how-to-pass tips — paid tier>
-- $md$, 2);
--
-- With an interactive playground, use the 5-column form instead:
-- INSERT INTO sections (module_id, kind, heading, body_md, sort_order, ide_language, starter_code) VALUES
-- ('0b43e829-9722-556b-ac9d-2ff5de1e2776','activity','Coding Drill',$md$<task>$md$, 3, 'python', $code$print("hi")$code$);

-- >>>>>>>>>>>>>>>>>>>>  PASTE FILLED-IN INSERTS BELOW  <<<<<<<<<<<<<<<<<<<<

INSERT INTO modules (id, subject_id, title, slug, sort_order) VALUES
  ('0b43e829-9722-556b-ac9d-2ff5de1e2776','40000000-0004-0001-0001-000000000001','Lesson 1: Introduction to Systems Administration and Maintenance','lesson-1-introduction-to-systems-administration-and-maintenance',1),
  ('04770e05-bf49-595b-b07c-05a0a61b1cb4','40000000-0004-0001-0001-000000000001','Lesson 2: Installing and Configuring Windows Operating Systems','lesson-2-installing-and-configuring-windows-operating-systems',2),
  ('184744d5-a256-573c-a94d-4159ba326ee0','40000000-0004-0001-0001-000000000001','Lesson 3: Installing and Configuring Linux Operating Systems','lesson-3-installing-and-configuring-linux-operating-systems',3),
  ('a8fe3e00-4cab-50cd-83a1-f8ae4358be20','40000000-0004-0001-0001-000000000001','Lesson 4: User and Group Account Management','lesson-4-user-and-group-account-management',4),
  ('adde31d0-fb73-57bf-841d-06791c73f84c','40000000-0004-0001-0001-000000000001','Lesson 5: Network Configuration and Troubleshooting','lesson-5-network-configuration-and-troubleshooting',5),
  ('9d505050-c2b5-5ef9-b212-e026f5bff7e0','40000000-0004-0001-0001-000000000001','Lesson 6: System Updates, Patching, and Maintenance','lesson-6-system-updates-patching-and-maintenance',6),
  ('ccc292bd-c576-599e-8493-11c2b172aa90','40000000-0004-0001-0001-000000000001','Lesson 7: Server Services and Network Applications','lesson-7-server-services-and-network-applications',7),
  ('9597a77e-1d87-5e6c-92c7-637508ef238b','40000000-0004-0001-0001-000000000001','Lesson 8: Automation with Scripting','lesson-8-automation-with-scripting',8);

-- ==== Lesson 1 ====
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('0b43e829-9722-556b-ac9d-2ff5de1e2776','content','What is System Administration?',$md$
System administration means managing an organization's computer systems so they run smoothly. A system administrator (sysadmin) is like the IT guardian who installs software, sets up hardware, and fixes problems. In a company or school setting, the sysadmin ensures computers, servers, and networks are available and secure. They also plan backups and upgrades so systems stay reliable.
$md$, 1),
('0b43e829-9722-556b-ac9d-2ff5de1e2776','content','Key Responsibilities of a System Administrator',$md$
A sysadmin's daily tasks include installing and configuring operating systems, troubleshooting technical issues, and applying software updates. They manage user accounts and set security permissions so only authorized people can access files. They also monitor system performance (CPU, memory, disk space) and plan for capacity growth. In short, they keep the IT "engine" running and jump in to fix it when parts break or slow down.
$md$, 2),
('0b43e829-9722-556b-ac9d-2ff5de1e2776','activity','Tools and Environments for Administrators',$md$
Sysadmins use both command-line tools and graphical interfaces. For example, they might use a Linux terminal (CLI) to run quick commands, or a Windows Server Manager (GUI) for a visual setup. Common tools include SSH or Remote Desktop for remote access, and utilities like Task Manager (Windows) or `top` (Linux) for monitoring. Sysadmins also often use web browsers to access network appliances (like routers) and use text editors (like Notepad++ or vim) for editing config files. These tools help them automate and speed up routine tasks.

Ready to apply this? The practice section for this lesson walks through exam-style questions and scenarios about these concepts — unlock it to test your knowledge and drill the basics.
$md$, 3),
('0b43e829-9722-556b-ac9d-2ff5de1e2776','activity','Practice & Exam Drills — Lesson 1',$md$
**Review Questions:**

1. What is the main role of a system administrator?
2. Name two common tasks a sysadmin does daily.
3. Why is keeping operating systems updated important?
4. Give an example of a command-line tool and a graphical tool used by sysadmins.
5. What does it mean to "monitor system performance"?

**Worked Problems:**

**Problem:** A company's email server goes down after a power surge. As a sysadmin, list the first three steps you take to troubleshoot and restore email service, explaining each step.

**Solution:** 1) **Check hardware status:** Verify the server is powered on and connected properly, ensuring no hardware damage. 2) **Review system logs:** Look at error messages in system or application logs to identify software issues. 3) **Restart services:** Restart the email service (e.g. Exchange or mail daemon) and test if it responds. If not, check network and firewall settings. Each step narrows down the cause and helps restore service.

**Problem:** In an exam scenario, you have two configurations: Server A has outdated OS patches; Server B has current patches. Explain why Server A is more at risk.

**Solution:** An outdated server lacks security fixes, making it vulnerable to known exploits (viruses, hacking). Attackers can use those known holes to break into Server A. Keeping patches up to date (like on Server B) closes those holes, reducing risk.

**Hands-On Exercise:** (No code) Pick a lab environment (or virtual machine) and practice installing a simple operating system (like Windows or Ubuntu) and setting up one user account. Note each step, then recreate it from memory.

**How to Pass:** Memorize the main duties of a sysadmin (installation, backup, troubleshooting). Professors often ask: "Which of these is not a sysadmin task?" So know the difference between admin and, say, a programmer. Understand basic tool names (e.g. Task Manager, `top`, SSH) and why updates matter. Practice answering in steps ("first do this, then that") as if you're actually fixing an issue.
$md$, 4);

-- ==== Lesson 2 ====
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('04770e05-bf49-595b-b07c-05a0a61b1cb4','content','Windows Server Installation Overview',$md$
Installing Windows Server starts by preparing an installation media (DVD or USB) with the Windows setup files. When you boot from this media, you follow on-screen prompts: accept license, choose disk partitions (often NTFS file system), and enter a product key. After setup copies files, the server reboots. Key configuration like setting the administrator password and initial network settings comes next. This foundation lets you add roles like Domain Controller or DNS later on.
$md$, 1),
('04770e05-bf49-595b-b07c-05a0a61b1cb4','content','Basic Windows Configuration Steps',$md$
Once Windows Server is installed, some initial setup is done via the Settings or Control Panel. You configure updates (Windows Update settings), install drivers (for network card, etc.), and set the time zone. Many admins add the server to a domain or configure it as a standalone by using the Server Manager or "System Properties". Enabling Remote Desktop is common, so you can manage it from another computer. These steps are basic but crucial before the server goes live.
$md$, 2),
('04770e05-bf49-595b-b07c-05a0a61b1cb4','activity','Managing Windows Settings and Roles',$md$
Windows Server comes with built-in roles like Active Directory Domain Services (AD DS) or DHCP Server. You use the Server Manager (a GUI tool) to add features. For example, installing AD DS involves running the "Add Roles and Features Wizard", then promoting the server to a domain controller. Windows also uses the Registry Editor and Group Policy Editor for deeper configuration, but those are advanced. For a quiz, focus on knowing where to find settings: e.g., "Control Panel → Network" or "Server Manager → Add roles".

Ready to apply this? The practice set for this lesson includes exam-style scenarios about Windows server setup and configuration — unlock it to drill the steps and prepare for test questions.
$md$, 3),
('04770e05-bf49-595b-b07c-05a0a61b1cb4','activity','Practice & Exam Drills — Lesson 2',$md$
**Review Questions:**

1. What file system does Windows Server typically use on installation?
2. Why do you set an administrator password during installation?
3. How do you add a server role, like DNS or AD DS, in Windows Server?
4. Name one task you perform in Windows Server Manager.
5. What is the purpose of enabling Remote Desktop on a server?

**Worked Problems:**

**Problem:** An exam question shows a screenshot of the Windows Server "Initial Configuration Tasks" window after installation. It asks which three tasks you should complete first for a production server. Identify them and explain why.

**Solution:** Likely tasks: **Configure Networking** (set IP, DNS so server communicates), **Change Administrator Password** (security), and **Enable Windows Update** (keeping the server up to date with patches). These ensure the server is secure and connected before it's used.

**Problem:** You are asked to install a DHCP server role on Windows Server. Outline the step-by-step process using Server Manager or PowerShell (briefly).

**Solution:** 1) Open Server Manager, go to "Add Roles and Features". 2) Select "DHCP Server" from the roles list. 3) Follow prompts to confirm. 4) Complete installation and then authorize the DHCP server in the DHCP console. (In PowerShell: run `Install-WindowsFeature -Name DHCP`). Each step adds the DHCP service so it can assign IP addresses on the network.

**Hands-On Exercise:** (No code) In a Windows Server VM or lab machine, practice installing the DHCP Server role. After installation, assign an IP address scope and test with a client VM to ensure it gets an IP from your server. This hands-on drilling helps reinforce the steps.

**How to Pass:** Remember the core difference between "client" Windows (like Windows 10) and "Server" edition (like Windows Server 2019). In exams, you might get a question like "Which feature is only available on Windows Server?" — look for options like AD or IIS. Also memorize common admin tools names (e.g., "Server Manager," "Active Directory Users and Computers") and where they are found. Practice explaining configuration tasks as clear steps.
$md$, 4);

-- ==== Lesson 3 ====
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('184744d5-a256-573c-a94d-4159ba326ee0','content','Linux Installation Process',$md$
Installing a Linux server (e.g. Ubuntu or CentOS) starts with booting from a Linux live USB or DVD. You often need to choose a "Server" installation mode. Steps include selecting language, keyboard layout, and creating disk partitions (ext4 is common for Linux). You then create a root (administrator) password and possibly a regular user account. Many Linux installers ask whether to install a bootloader (GRUB) — you usually say yes so the system can boot.
$md$, 1),
('184744d5-a256-573c-a94d-4159ba326ee0','content','Basic Linux Configuration after Install',$md$
After Linux is installed, initial setup is usually done via the command line. You might configure the hostname with `hostnamectl` and network with `nano /etc/network/interfaces` or `nmcli`. On many distros, you update package lists (`sudo apt update`) and install essential tools (`sudo apt install net-tools`, etc.). Setting up SSH server (`sudo apt install openssh-server`) is common so you can log in remotely. You can also use GUI tools if installed (like Ubuntu's "Software & Updates").
$md$, 2),
('184744d5-a256-573c-a94d-4159ba326ee0','activity','Linux Administration Tools and Commands',$md$
Linux admins rely on the shell (bash) and commands like `ls` (list files), `cp`, `mv`, `chmod` (change permission), and `chown` (change ownership). They edit text files using editors such as `vi`, `nano`, or `gedit`. To install software, they use package managers (`apt` on Debian/Ubuntu, `yum` or `dnf` on CentOS). Monitoring tools include `top` or `htop` for processes, `df -h` for disk usage, and `journalctl` or `dmesg` for logs. Understanding these commands is foundational for Linux administration.

Ready to apply this? The practice drills include Linux commands and configuration scenarios with worked solutions — unlock it to sharpen your command-line skills and exam prep.
$md$, 3),
('184744d5-a256-573c-a94d-4159ba326ee0','activity','Practice & Exam Drills — Lesson 3',$md$
**Review Questions:**

1. What command lists files in a directory on Linux?
2. After installing Ubuntu Server, which command updates the list of software packages?
3. Where do you set the hostname on a modern Linux distribution?
4. How do you change a file's permissions using command line? Give the command.
5. What does 'SSH' stand for and what is its use?

**Worked Problems:**

**Problem:** An exam question provides a scenario: A newly installed Linux server has no network connectivity. The student is asked: "Which configuration file or command would you check to fix this?"

**Solution:** Check network interfaces settings. For example, on Ubuntu, open `/etc/netplan/*.yaml` or `/etc/network/interfaces` and verify IP configuration. Also use `ip addr show` to see current config. Correct any typos (e.g. wrong IP or gateway).

**Problem:** Explain the difference between root user and a regular user in Linux. Why shouldn't you regularly log in as root?

**Solution:** Root is the superuser with unlimited privileges (can do anything to the system). A regular user has limited rights. We avoid using root for daily work to prevent accidental system-wide damage. Instead, use `sudo` to run specific commands as root.

**Hands-On Exercise:** (No code) In a Linux VM, practice creating a new user with `sudo adduser username` and give it sudo privileges by adding to the "sudo" or "wheel" group. Test switching to that user (`su - username`) and try updating packages. Document each command used.

**How to Pass:** Know key Linux terms and commands by heart. In tests, questions might ask: "Which command shows current disk usage?" (Answer: `df -h`) or "What file type is a Linux terminal script?" (shell script, often with `.sh`). Drill simple commands until you can do them without thinking. Professors like asking about differences (e.g. `apt` vs `apt-get`, or Linux file permissions rwx = 421). Practice problems where you have to interpret a line of command output.
$md$, 4);

-- ==== Lesson 4 ====
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('a8fe3e00-4cab-50cd-83a1-f8ae4358be20','content','Fundamentals of Users and Groups',$md$
Computers use user accounts to control who can log in and access resources. Each user has a username and password, and files they own. Groups collect users for easier permission management (for example, putting all HR staff in one group). This system makes it easy to grant or restrict access: instead of setting permissions for each user, you set them for a group. In both Windows and Linux, permissions (read/write/execute) determine what a user or group can do with a file or folder.
$md$, 1),
('a8fe3e00-4cab-50cd-83a1-f8ae4358be20','content','Managing Accounts on Windows',$md$
On Windows, you create users via the Control Panel's "User Accounts" or through "Active Directory Users and Computers" for domain environments. Administrators add or remove accounts, set passwords, and define group memberships (like "Administrators" or "Users"). Windows also has built-in "Computer Management" console (`compmgmt.msc`) where local users and groups can be managed. Typically, you might create a departmental group (e.g. "Accounting"), then add each accountant user to it, simplifying permissions on shared drives.
$md$, 2),
('a8fe3e00-4cab-50cd-83a1-f8ae4358be20','activity','Managing Accounts on Linux',$md$
In Linux, user and group management is often done via terminal. Commands include `sudo adduser [username]` or `useradd`, and `sudo groupadd [groupname]`. You can assign a user to a group with `usermod -aG groupname username`. Configuration files like `/etc/passwd` list all user accounts, while `/etc/group` lists groups. For example, creating a "developers" group and adding user `juan` to it can be done with `sudo groupadd developers` and `sudo usermod -aG developers juan`. Files and directories can then give read/write permission to the "developers" group.
$md$, 3),
('a8fe3e00-4cab-50cd-83a1-f8ae4358be20','activity','File Permissions and Access Control',$md$
Permissions define what users and groups can do with files. In Windows, an administrator sets permissions in the file's Properties → Security tab (checking Full Control, Read, Write for a user or group). In Linux, each file has an owner, group, and others, each with read (r), write (w), and execute (x) bits. For example, `chmod 750 file.txt` means the owner can read/write/execute, the group can read/execute, and others have no access. Understanding `chmod` and `chown` is key: `chown user:group file.txt` changes the owner and group.

Ready to apply this? Unlock the practice drills for problems on setting permissions and managing accounts — they include typical exam questions with full solutions and a hands-on exercise.
$md$, 4),
('a8fe3e00-4cab-50cd-83a1-f8ae4358be20','activity','Practice & Exam Drills — Lesson 4',$md$
**Review Questions:**

1. In Windows, where do you go to add a new user account on a local machine?
2. Which Linux command adds a user to a group?
3. What permission bits does `chmod 755` set for owner, group, others?
4. Why are groups useful in permission management?
5. On Windows, what does it mean to give "Full Control" to a user?

**Worked Problems:**

**Problem:** A Linux file `report.txt` is owned by user `alice` and group `sales`, with permissions `rw-r-----`. User `bob` (who is in group `sales`) cannot write to it. How can you fix this?

**Solution:** The permissions `rw-r-----` mean owner can read/write, group can only read, others have none. To allow group write, run `chmod g+w report.txt`. Now it becomes `rw-rw----`, so members of `sales` (like `bob`) can write to it.

**Problem:** On an exam, a student is asked: "Describe the steps to create a new user named `marcos` on Windows Server and make him a member of the IT group."

**Solution:** Step 1: In ADUC, right-click Users folder, choose New → User, enter `marcos` with password. This creates the account. Step 2: Still in ADUC, find the group "IT", open its properties, go to Members tab, and add `marcos`. This makes him part of the IT group, inheriting its permissions. This structure saves time managing permissions.

**Hands-On Exercise:** (No code) Using a Windows or Linux VM, create a new group called "ProjectX". Then create a new user (e.g. `juan`) and add him to the "ProjectX" group. Next, make a folder called "ProjectXDocs" and set its permissions so that only members of "ProjectX" can read/write to it. For Windows, use folder Properties → Security; for Linux use `chmod` and `chown`.

**How to Pass:** Focus on the common commands and locations: on Windows, remember "Computer Management → Local Users and Groups"; on Linux, memorize `adduser`, `userdel`, `chmod`, `chown` syntax. Professors often ask about permission notation (rwx). Practice translating between symbolic (rwx) and numeric (421) formats: e.g. `rwxr-x---` = 750. A common exam trick: a file is not editable because of wrong group, so watch out for "belongs to root" vs "group permissions."
$md$, 5);

-- ==== Lesson 5 ====
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('adde31d0-fb73-57bf-841d-06791c73f84c','content','IP Addressing and Subnetting Basics',$md$
Every device on a network needs an IP address (like a house number). An IPv4 address looks like `192.168.0.10`, often paired with a subnet mask like `255.255.255.0`. The mask defines which part of the address is the network vs host. For example, with `255.255.255.0`, devices `192.168.0.1`–`254` are on the same LAN. Subnetting creates smaller networks (subnets) to organize larger networks efficiently. In practice, sysadmins might encounter both IPv4 and IPv6 addresses, but for most exams, focus on IPv4 and how to calculate simple subnets (e.g. `/24` means `255.255.255.0`).
$md$, 1),
('adde31d0-fb73-57bf-841d-06791c73f84c','content','Configuring Network Interfaces',$md$
To connect to a network, a computer needs an IP, gateway, and DNS servers. On Windows, you use Network Connections settings: IPv4 properties allow you to enter a static IP, mask, gateway, and DNS. On Linux, you might edit a config file (like `/etc/network/interfaces`) or use `nmcli` (NetworkManager) commands. For example, `sudo nano /etc/network/interfaces` could contain `address 10.0.0.10/24` and `gateway 10.0.0.1`. Many networks use DHCP, where a router assigns IPs automatically. In that case, the setting is on "Obtain an IP address automatically" (Windows) or `dhclient` on Linux.
$md$, 2),
('adde31d0-fb73-57bf-841d-06791c73f84c','activity','Network Troubleshooting Tools',$md$
Sysadmins use tools to diagnose connectivity:

- **Ping:** Sends a small packet to an IP to test if it's reachable (e.g. `ping 8.8.8.8`). A reply indicates the device is alive.
- **ipconfig/ifconfig:** On Windows, `ipconfig` (with `/all`) shows your current IP settings. On Linux, `ifconfig` or `ip addr show` does the same.
- **Traceroute** (`tracert` on Windows): Shows the path packets take to a destination, useful for finding where a connection fails.
- **netstat:** Lists active network connections and open ports.

Using these, an admin can tell if the computer is on the right subnet, if DNS is resolving names, or if packets are getting blocked by a firewall.

Ready to apply this? The locked activity section includes practice problems calculating subnets and interpreting ping results, plus a set of review questions to test your network fundamentals.
$md$, 3),
('adde31d0-fb73-57bf-841d-06791c73f84c','activity','Practice & Exam Drills — Lesson 5',$md$
**Review Questions:**

1. What is the purpose of a subnet mask?
2. In the IP address `10.1.2.5/24`, what range of addresses is in the same subnet?
3. Which command shows the current IP address on a Windows machine?
4. What does a successful ping test indicate?
5. How do traceroute (or tracert) help in troubleshooting?

**Worked Problems:**

**Problem:** You have an IP `192.168.5.18` with a subnet mask `255.255.255.0`. What is the network address and broadcast address of this subnet?

**Solution:** With a mask of `255.255.255.0` (also `/24`), the first three numbers define the network: Network address is `192.168.5.0`. The broadcast address (all 1s in host part) is `192.168.5.255`. Devices on this subnet can have IPs `192.168.5.1` to `192.168.5.254`.

**Problem:** An exam scenario shows a client `ipconfig /all` output with IP `169.254.x.x`. What went wrong?

**Solution:** The IP `169.254.x.x` is an APIPA (Automatic Private IP Addressing) address. It means the client failed to get an IP from DHCP, so Windows auto-assigned an address in `169.254` range. The fix is to check the DHCP server or client network connection. The question tests knowledge of what `169.254` means.

**Hands-On Exercise:** (No code) On a lab network, configure one computer with a static IP (choose an unused `192.168.x` address). Then try pinging another known device on the same network. Record the ping command and result. Next, unplug the network cable from the pinged device and run ping again; observe how packets fail. Practice using `tracert google.com` on Windows or `traceroute google.com` on Linux and note the hops.

**How to Pass:** Know simple subnet math by heart (e.g. `/24` = `255.255.255.0`, `/16` = `255.255.0.0`). Practice converting between CIDR (like `/24`) and mask forms. Memorize common private network ranges (e.g. `192.168.x.x`). Professors often test the meaning of IPs like `127.0.0.1` (loopback) or `0.0.0.0`. For commands, recall exactly how to call them: e.g. `ping 127.0.0.1` tests local TCP/IP stack. Label common port numbers if asked (DNS=53, HTTP=80).
$md$, 4);

-- ==== Lesson 6 ====
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('9d505050-c2b5-5ef9-b212-e026f5bff7e0','content','Keeping Systems Updated',$md$
Both Windows and Linux release updates to fix bugs and vulnerabilities. On Windows, you use Windows Update to download patches, security fixes, and drivers. On Linux, you use the package manager (like `sudo apt update` & `sudo apt upgrade`) to pull updates from the distribution's repositories. Regular patching prevents malware exploits. For example, if a major security flaw is found, installing the patch quickly can stop viruses from exploiting it. Think of updates like safety checks for your car — skipping them leads to breakdowns.
$md$, 1),
('9d505050-c2b5-5ef9-b212-e026f5bff7e0','content','Performance Monitoring Basics',$md$
An admin should regularly check system health. Key metrics include CPU usage, memory usage, and disk space. On Windows, Task Manager shows CPU/Memory graphs and which processes are using them. On Linux, tools like `top`, `htop`, or `vmstat` show similar info. Monitoring trends helps catch issues early: e.g., if disk usage is near full, add storage. Also check error logs: Windows has Event Viewer, Linux has `/var/log/syslog` or `dmesg`. These logs give clues to hardware failures or software crashes.
$md$, 2),
('9d505050-c2b5-5ef9-b212-e026f5bff7e0','activity','Backup and Recovery Fundamentals',$md$
Maintenance isn't just fixing problems — it's preventing data loss. Backups create copies of important files or system images. A common strategy is nightly backups of user data and weekly full system backups. On Windows, this might use Backup and Restore or tools like Veeam; on Linux, tools like `rsync` or `tar` scripts. Testing recovery is key: a backup is useless if it can't be restored. In exams, a question might describe a server hard disk failure — your answer should outline restoring from a known good backup.

Ready to apply this? Unlock the activity to practice planning update and backup routines, answer review questions, and solve a maintenance case study step by step.
$md$, 3),
('9d505050-c2b5-5ef9-b212-e026f5bff7e0','activity','Practice & Exam Drills — Lesson 6',$md$
**Review Questions:**

1. Why is it important to apply system patches regularly?
2. What tool on Linux can you use to check real-time memory usage?
3. What is a full backup versus an incremental backup?
4. On Windows, where would you look to find recent error or warning messages?
5. What could happen if you ignore disk space warnings?

**Worked Problems:**

**Problem:** A midterm problem describes a server with failing hard drive that logs I/O errors. The student must outline a recovery plan.

**Solution:** First, shut down the server safely to avoid data loss. Next, remove/repair the bad drive and install a new drive. Then restore from backup: insert the latest backup media or connect to backup server and copy the data to the new drive. Finally, test the system to ensure everything works. Explain each step with purpose (prevent damage, replace failed component, recover data).

**Problem:** An exam asks: "List two tools you would use to find out why a Linux server is running slowly, and what they show."

**Solution:** Use `top` or `htop` to see which processes are consuming CPU or RAM. Also check disk usage with `df -h` to see free space, and `iostat` to check if disk I/O is high. Each tool pinpoints different bottlenecks.

**Hands-On Exercise:** (No code) Set a Linux VM to have one folder backup script. For example, create a bash script that archives `/etc` into `/backup/etc_backup.tar.gz`. Schedule it via cron to run daily. Verify by running `ls /backup` to see the archive. Practice the steps: writing the script, making it executable, and adding a cron job (with `crontab -e`).

**How to Pass:** Remember the names of built-in tools: Task Manager, Event Viewer, `top`, `df`, etc. For backups, know at least one free tool (like `rsync` or Windows Backup). Exams may ask advantages of one backup type over another, so recall that full backups copy everything every time (slow but straightforward) while incremental only saves changes (faster but needs chain of backups). A common tip: always rehearse your recovery procedure. That exam question often expects "restore from last full backup, then apply incrementals".
$md$, 4);

-- ==== Lesson 7 ====
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('ccc292bd-c576-599e-8493-11c2b172aa90','content','File Sharing and Print Services',$md$
Servers often provide shared storage and printers. On Windows, administrators share folders via SMB/CIFS: right-click a folder, choose "Share", and set permissions (Read or Read/Write for users/groups). On Linux, Samba is the equivalent for sharing files with Windows clients. You edit `/etc/samba/smb.conf` to define shares (e.g., `[shared]` pointing to a directory). For printing, Windows uses Print Management; Linux often uses CUPS (Common Unix Printing System) to share printers. In a Philippine school or office, students may connect to a shared directory or network printer managed by the sysadmin.
$md$, 1),
('ccc292bd-c576-599e-8493-11c2b172aa90','content','DNS and DHCP Services',$md$
Two critical network services are DHCP and DNS. DHCP (Dynamic Host Configuration Protocol) automatically gives IP addresses to clients. Admins set up a DHCP scope (range of IPs), and clients get an IP without manual config. DNS (Domain Name System) translates names to IPs (e.g. `www.example.com` to `93.184.216.34`). On Windows Server, you can add the DHCP role or DNS role in Server Manager. On Linux, ISC DHCP server (`isc-dhcp-server`) and BIND are common. A practical point: make sure clients use your DNS (often via DHCP settings) so they can resolve company intranet names or internet sites.
$md$, 2),
('ccc292bd-c576-599e-8493-11c2b172aa90','activity','Web Servers and Network Services',$md$
Many servers host websites or web services. Windows has IIS (Internet Information Services) to run websites (.NET or ASP applications). Linux commonly uses Apache or Nginx for web hosting. To set up a website, you place files in a web directory (`C:\inetpub\wwwroot` on Windows, or `/var/www/html` on Linux). Another example: Email and database servers also run as services (e.g. Postfix for email or MySQL for databases), but those might be separate classes. As an admin, you should know basic web server setup: open ports (80/443), document root, and how to restart the service (`service apache2 restart` or `iisreset`).

Ready to apply this? The practice section covers scenarios like configuring a shared drive and setting up DHCP for lab computers. Unlock it for hands-on exercises and exam questions with step-by-step solutions.
$md$, 3),
('ccc292bd-c576-599e-8493-11c2b172aa90','activity','Practice & Exam Drills — Lesson 7',$md$
**Review Questions:**

1. What is the purpose of SMB or Samba in a network?
2. Which port does HTTP typically use?
3. What does DHCP stand for, and what does it do?
4. How do you create a shared folder on Windows? Briefly describe.
5. Why is it important for DHCP and DNS to work together on a network?

**Worked Problems:**

**Problem:** A computer cannot get an IP automatically and shows a yellow triangle in Windows. The DHCP server has 50 addresses (`10.1.1.100`–`10.1.1.149`) and 60 clients. What is the issue and solution?

**Solution:** There are more clients (60) than available DHCP addresses (50). The last 10 clients get no IP. To fix: increase the DHCP scope (e.g. `10.1.1.100`–`10.1.1.160`) or reduce reservation. This shows understanding of DHCP scope limits.

**Problem:** In an exam, a question may ask: "How do you set up a website on Linux?"

**Solution:** Step 1: Install (e.g. `sudo apt install apache2`). Step 2: Place content (like `index.html`) in `/var/www/html`. Step 3: Check firewall (e.g. `ufw allow 'Apache'`). Step 4: Restart service (`sudo systemctl restart apache2`). Explain that after this, browsing the server's IP shows your page.

**Hands-On Exercise:** (No code) In a test environment, share a folder from one machine and connect to it from another. For example, on a Windows VM, create a folder `C:\Share`, right-click it, choose "Properties → Sharing → Share". Set "Everyone" to Read/Write. On another computer, map this shared folder (`\\servername\Share`). Verify you can copy files to and from it.

**How to Pass:** Learn key service names and ports (DHCP, DNS port 53, HTTP port 80/443). Be able to explain why you need DHCP (to avoid configuring each PC manually) and DNS (so we use names, not hard IPs). Professors like scenario questions: e.g., "You set up a new printer but clients can't find it by name, what service might be misconfigured?" (Answer: DNS). Always mention checking firewalls — it's a common oversight.
$md$, 4);

-- ==== Lesson 8 ====
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('9597a77e-1d87-5e6c-92c7-637508ef238b','content','Introduction to Scripting for Administration',$md$
Automation saves time for repetitive tasks. A script is a small program (often written in a language like Bash or Python) that runs a series of commands. For example, a sysadmin might script daily backups or log analysis. In exams, you should recognize simple script logic: loops to process many items, or conditionals to check a situation. Even if you don't code often, understanding scripts is useful: at least know basic structures (`for` loop, `if-then`). This lesson will focus on Python, a common admin scripting language, but remember that Windows also has PowerShell (exam topic) and Linux uses shell scripts.
$md$, 1),
('9597a77e-1d87-5e6c-92c7-637508ef238b','content','Basic Python Scripting Concepts',$md$
Python is an easy-to-read language often used in system admin for parsing text or automating web tasks. In a script, you can use loops (`for`, `while`), functions, and libraries. For example, you could write a Python script to read a log file line by line and extract errors. Key Python facts: indentation matters, `print()` outputs text, and `import` lets you use extra tools (like `os` or `sys`). In the context of system admin, remember that Python can automate file operations (via `open()` or `os.listdir()`), network calls, or even server management through modules.
$md$, 2),
('9597a77e-1d87-5e6c-92c7-637508ef238b','activity','Task Scheduling (Cron and Task Scheduler)',$md$
Once you have a script or command, you often want it to run automatically on a schedule. On Linux, this is done with cron jobs. For instance, `crontab -e` opens your schedule file where you could add `0 2 * * * /usr/bin/python3 /home/user/backup.py` to run at 2 AM daily. On Windows, the equivalent is the Task Scheduler, where you create a basic task and choose triggers (daily, at startup) and actions (run a script or program). Understanding how to set up these scheduled tasks can be exam material. It's also a tip to always test run scripts manually first, then automate them.

Ready to apply this? The unlocked practice includes a Python coding exercise to filter log messages, plus review questions on scripting concepts and scheduling.
$md$, 3);

INSERT INTO sections (module_id, kind, heading, body_md, sort_order, ide_language, starter_code) VALUES
('9597a77e-1d87-5e6c-92c7-637508ef238b','activity','Practice & Exam Drills — Lesson 8',$md$
**Review Questions:**

1. In Python, which keyword starts a loop?
2. What does the `print()` function do?
3. Give one example of a Linux scheduling tool.
4. In a cron job schedule, what does `0 0 * * *` mean (when the job runs)?
5. Why might a sysadmin use a script instead of manual commands?

**Worked Problems:**

**Problem:** Complete the Python snippet below so that it prints only the lines with "ERROR".

**Solution Explanation:** You would split `log_data` into lines (using `.splitlines()` or `.split("\n")`), then loop through each line, check if `"ERROR"` is in it, and if so, print it. The expected output lines are "ERROR: Network down" and "ERROR: Could not connect".

**Problem:** On an exam, a student is given a cron entry `30 3 * * 1 /usr/bin/rsync -a /data/ /backup/`. What does this do?

**Solution:** This cron job runs every Monday at 3:30 AM (30 minutes past hour 3 on day-of-week 1). It executes the `rsync` command to archive-copy `/data/` to `/backup/`. This likely performs a weekly backup. The student should explain the time fields and the purpose of `rsync` (syncing files).

**Coding Exercise:** Write Python code in the playground that prints only the error lines from `log_data`. A possible solution:

```python
for line in log_data.splitlines():
    if "ERROR" in line:
        print(line)
```

When run, it should output:

```
ERROR: Network down
ERROR: Could not connect
```

**How to Pass:** Practice writing simple scripts or pseudo-code. In exams, they might ask what a loop does or to trace through a given script. Know how to read a cron schedule (5 fields). Mistakes to avoid: mixing up `* * *` syntax in cron, or forgetting Python indentation. In code answers, ensure syntax is correct (e.g. colon after `if` and proper indentation). For scheduling, memorize a couple of examples: daily at midnight (`0 0 * * *`), every hour (`0 * * * *`), etc. Professors often give a broken cron line and ask you to fix it, so watch out for field order.
$md$, 4, 'python', $code$log_data = """INFO: System running
WARNING: Disk space low
ERROR: Network down
INFO: Backup succeeded
ERROR: Could not connect
"""
# Write code below to extract lines containing "ERROR" from log_data.
$code$);

-- SOURCES:
--   Polytechnic University of the Philippines (PUP Unisan) — Systems Administration and Maintenance course outline (CCIS ITPS)
--   Northern Negros State College of Science and Technology — Systems Administration and Maintenance syllabus overview
--   Misamis University (BSIT) — Systems Administration and Maintenance (ITP220) course description
--   CHED CMO No. 25 s.2015 — Revised Policies, Standards, and Guidelines for BSIT (sample curriculum listing)

