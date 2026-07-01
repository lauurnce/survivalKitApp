-- ============================================================
-- Systems Administration and Maintenance — Modules & Sections
-- Subject ID: 40000000-0004-0001-0001-000000000001
-- 4th Year, Semester 1 — major
-- 8 lessons. Split: S1+S2 = content (FREE); remaining teaching blocks + drill
--   = activity (PAID). Most lessons have 3 content blocks -> 2 free / 2 paid;
--   Lesson 4 has 4 content blocks -> 2 free / 3 paid.
-- Only Lesson 8 has a Python playground (ide_language=python + starter_code),
--   inserted via the 7-column form in its own INSERT. All other drills are 5-column.
-- Re-running is safe (DELETE clears prior rows for this subject first).
-- ============================================================

DELETE FROM modules WHERE subject_id = '40000000-0004-0001-0001-000000000001';

INSERT INTO modules (id, subject_id, title, slug, sort_order) VALUES
  ('0b43e829-9722-556b-ac9d-2ff5de1e2776','40000000-0004-0001-0001-000000000001','Lesson 1: Introduction to Systems Administration and Maintenance','lesson-1-introduction-to-systems-administration-and-maintenance',1),
  ('04770e05-bf49-595b-b07c-05a0a61b1cb4','40000000-0004-0001-0001-000000000001','Lesson 2: Installing and Configuring Windows Operating Systems','lesson-2-installing-and-configuring-windows-operating-systems',2),
  ('184744d5-a256-573c-a94d-4159ba326ee0','40000000-0004-0001-0001-000000000001','Lesson 3: Installing and Configuring Linux Operating Systems','lesson-3-installing-and-configuring-linux-operating-systems',3),
  ('a8fe3e00-4cab-50cd-83a1-f8ae4358be20','40000000-0004-0001-0001-000000000001','Lesson 4: User and Group Account Management','lesson-4-user-and-group-account-management',4),
  ('adde31d0-fb73-57bf-841d-06791c73f84c','40000000-0004-0001-0001-000000000001','Lesson 5: Network Configuration and Troubleshooting','lesson-5-network-configuration-and-troubleshooting',5),
  ('9d505050-c2b5-5ef9-b212-e026f5bff7e0','40000000-0004-0001-0001-000000000001','Lesson 6: System Updates, Patching, and Maintenance','lesson-6-system-updates-patching-and-maintenance',6),
  ('ccc292bd-c576-599e-8493-11c2b172aa90','40000000-0004-0001-0001-000000000001','Lesson 7: Server Services and Network Applications','lesson-7-server-services-and-network-applications',7),
  ('9597a77e-1d87-5e6c-92c7-637508ef238b','40000000-0004-0001-0001-000000000001','Lesson 8: Automation with Scripting','lesson-8-automation-with-scripting',8);

-- ============================================================
-- LESSON 1: Introduction to Systems Administration and Maintenance
-- ============================================================
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('0b43e829-9722-556b-ac9d-2ff5de1e2776','content','What is System Administration?',$md$
**System administration** means managing an organization's computer systems so they run smoothly. A **system administrator (sysadmin)** is like the IT guardian who installs software, sets up hardware, and fixes problems. In a company or school setting, the sysadmin ensures computers, servers, and networks are available and secure. They also plan backups and upgrades so systems stay reliable.
$md$, 1),
('0b43e829-9722-556b-ac9d-2ff5de1e2776','content','Key Responsibilities of a System Administrator',$md$
A sysadmin's daily tasks include installing and configuring operating systems, troubleshooting technical issues, and applying software updates. They manage user accounts and set security permissions so only authorized people can access files. They also monitor system performance (CPU, memory, disk space) and plan for capacity growth. In short, they keep the IT "engine" running and jump in to fix it when parts break or slow down.
$md$, 2),
('0b43e829-9722-556b-ac9d-2ff5de1e2776','activity','Tools and Environments for Administrators',$md$
Sysadmins use both command-line tools and graphical interfaces. For example, they might use a Linux terminal (CLI) to run quick commands, or a Windows Server Manager (GUI) for a visual setup. Common tools include **SSH** or **Remote Desktop** for remote access, and utilities like Task Manager (Windows) or `top` (Linux) for monitoring. Sysadmins also often use web browsers to access network appliances (like routers) and use text editors (like Notepad++ or `vim`) for editing config files. These tools help them automate and speed up routine tasks.

*Ready to apply this? The practice section below walks through exam-style questions and scenarios about these concepts.*
$md$, 3),
('0b43e829-9722-556b-ac9d-2ff5de1e2776','activity','Practice & Exam Drills — Lesson 1',$md$
**Review Questions**

1. What is the main role of a system administrator?
2. Name two common tasks a sysadmin does daily.
3. Why is keeping operating systems updated important?
4. Give an example of a command-line tool and a graphical tool used by sysadmins.
5. What does it mean to "monitor system performance"?

**Worked Problems**

*Problem:* A company's email server goes down after a power surge. As a sysadmin, list the first three steps you take to troubleshoot and restore email service, explaining each step.

*Solution:* 1) **Check hardware status:** Verify the server is powered on and connected properly, ensuring no hardware damage. 2) **Review system logs:** Look at error messages in system or application logs to identify software issues. 3) **Restart services:** Restart the email service (e.g. Exchange or mail daemon) and test if it responds. If not, check network and firewall settings. Each step narrows down the cause and helps restore service.

*Problem:* In an exam scenario, you have two configurations: Server A has outdated OS patches; Server B has current patches. Explain why Server A is more at risk.

*Solution:* An outdated server lacks security fixes, making it vulnerable to known exploits (viruses, hacking). Attackers can use those known holes to break into Server A. Keeping patches up to date (like on Server B) closes those holes, reducing risk.

**Hands-On Exercise**

(No code) Pick a lab environment (or virtual machine) and practice installing a simple operating system (like Windows or Ubuntu) and setting up one user account. Note each step, then recreate it from memory.

**How to Pass**

Memorize the main duties of a sysadmin (installation, backup, troubleshooting). Professors often ask: "Which of these is not a sysadmin task?" — so know the difference between an admin and, say, a programmer. Understand basic tool names (Task Manager, `top`, SSH) and why updates matter. Practice answering in steps ("first do this, then that") as if you're actually fixing an issue.
$md$, 4);

