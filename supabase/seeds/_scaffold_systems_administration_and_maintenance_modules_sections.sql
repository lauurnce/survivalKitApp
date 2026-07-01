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

-- ============================================================
-- LESSON 2: Installing and Configuring Windows Operating Systems
-- ============================================================
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('04770e05-bf49-595b-b07c-05a0a61b1cb4','content','Windows Server Installation Overview',$md$
Installing Windows Server starts by preparing an installation media (DVD or USB) with the Windows setup files. When you boot from this media, you follow on-screen prompts: accept license, choose disk partitions (often **NTFS** file system), and enter a product key. After setup copies files, the server reboots. Key configuration like setting the administrator password and initial network settings comes next. This foundation lets you add roles like Domain Controller or DNS later on.
$md$, 1),
('04770e05-bf49-595b-b07c-05a0a61b1cb4','content','Basic Windows Configuration Steps',$md$
Once Windows Server is installed, some initial setup is done via the Settings or Control Panel. You configure updates (Windows Update settings), install drivers (for network card, etc.), and set the time zone. Many admins add the server to a domain or configure it as a standalone by using the **Server Manager** or "System Properties". Enabling **Remote Desktop** is common, so you can manage it from another computer. These steps are basic but crucial before the server goes live.
$md$, 2),
('04770e05-bf49-595b-b07c-05a0a61b1cb4','activity','Managing Windows Settings and Roles',$md$
Windows Server comes with built-in roles like **Active Directory Domain Services (AD DS)** or **DHCP Server**. You use the Server Manager (a GUI tool) to add features. For example, installing AD DS involves running the "Add Roles and Features Wizard", then promoting the server to a domain controller. Windows also uses the Registry Editor and Group Policy Editor for deeper configuration, but those are advanced. For a quiz, focus on knowing where to find settings: e.g., "Control Panel → Network" or "Server Manager → Add roles".

*Ready to apply this? The practice set below includes exam-style scenarios about Windows server setup and configuration.*
$md$, 3),
('04770e05-bf49-595b-b07c-05a0a61b1cb4','activity','Practice & Exam Drills — Lesson 2',$md$
**Review Questions**

1. What file system does Windows Server typically use on installation?
2. Why do you set an administrator password during installation?
3. How do you add a server role, like DNS or AD DS, in Windows Server?
4. Name one task you perform in Windows Server Manager.
5. What is the purpose of enabling Remote Desktop on a server?

**Worked Problems**

*Problem:* An exam question shows a screenshot of the Windows Server "Initial Configuration Tasks" window after installation. It asks which three tasks you should complete first for a production server. Identify them and explain why.

*Solution:* Likely tasks: **Configure Networking** (set IP, DNS so the server communicates), **Change Administrator Password** (security), and **Enable Windows Update** (keeping the server up to date with patches). These ensure the server is secure and connected before it's used.

*Problem:* You are asked to install a DHCP server role on Windows Server. Outline the step-by-step process using Server Manager or PowerShell (briefly).

*Solution:* 1) Open Server Manager, go to "Add Roles and Features". 2) Select "DHCP Server" from the roles list. 3) Follow prompts to confirm. 4) Complete installation and then authorize the DHCP server in the DHCP console. (In PowerShell: run `Install-WindowsFeature -Name DHCP`.) Each step adds the DHCP service so it can assign IP addresses on the network.

**Hands-On Exercise**

(No code) In a Windows Server VM or lab machine, practice installing the DHCP Server role. After installation, assign an IP address scope and test with a client VM to ensure it gets an IP from your server.

**How to Pass**

Remember the core difference between "client" Windows (like Windows 10) and "Server" edition (like Windows Server 2019). In exams, you might get a question like "Which feature is only available on Windows Server?" — look for options like AD or IIS. Also memorize common admin tool names ("Server Manager," "Active Directory Users and Computers") and where they are found. Practice explaining configuration tasks as clear steps.
$md$, 4);

-- ============================================================
-- LESSON 3: Installing and Configuring Linux Operating Systems
-- ============================================================
INSERT INTO sections (module_id, kind, heading, body_md, sort_order) VALUES
('184744d5-a256-573c-a94d-4159ba326ee0','content','Linux Installation Process',$md$
Installing a Linux server (e.g. Ubuntu or CentOS) starts with booting from a Linux live USB or DVD. You often need to choose a "Server" installation mode. Steps include selecting language, keyboard layout, and creating disk partitions (**ext4** is common for Linux). You then create a root (administrator) password and possibly a regular user account. Many Linux installers ask whether to install a bootloader (**GRUB**) – you usually say yes so the system can boot.
$md$, 1),
('184744d5-a256-573c-a94d-4159ba326ee0','content','Basic Linux Configuration after Install',$md$
After Linux is installed, initial setup is usually done via the command line. You might configure the hostname with `hostnamectl` and network with `nano /etc/network/interfaces` or `nmcli`. On many distros, you update package lists (`sudo apt update`) and install essential tools (`sudo apt install net-tools`, etc.). Setting up an SSH server (`sudo apt install openssh-server`) is common so you can log in remotely. You can also use GUI tools if installed (like Ubuntu's "Software & Updates").
$md$, 2),
('184744d5-a256-573c-a94d-4159ba326ee0','activity','Linux Administration Tools and Commands',$md$
Linux admins rely on the shell (bash) and commands like `ls` (list files), `cp`, `mv`, `chmod` (change permission), and `chown` (change ownership). They edit text files using editors such as `vi`, `nano`, or `gedit`. To install software, they use package managers (`apt` on Debian/Ubuntu, `yum` or `dnf` on CentOS). Monitoring tools include `top` or `htop` for processes, `df -h` for disk usage, and `journalctl` or `dmesg` for logs. Understanding these commands is foundational for Linux administration.

*Ready to apply this? The practice drills below include Linux commands and configuration scenarios with worked solutions.*
$md$, 3),
('184744d5-a256-573c-a94d-4159ba326ee0','activity','Practice & Exam Drills — Lesson 3',$md$
**Review Questions**

1. What command lists files in a directory on Linux?
2. After installing Ubuntu Server, which command updates the list of software packages?
3. Where do you set the hostname on a modern Linux distribution?
4. How do you change a file's permissions using the command line? Give the command.
5. What does 'SSH' stand for and what is its use?

**Worked Problems**

*Problem:* A newly installed Linux server has no network connectivity. Which configuration file or command would you check to fix this?

*Solution:* Check network interface settings. For example, on Ubuntu, open `/etc/netplan/*.yaml` or `/etc/network/interfaces` and verify IP configuration. Also use `ip addr show` to see the current config. Correct any typos (e.g. wrong IP or gateway).

*Problem:* Explain the difference between the root user and a regular user in Linux. Why shouldn't you regularly log in as root?

*Solution:* **Root** is the superuser with unlimited privileges (can do anything to the system). A **regular user** has limited rights. We avoid using root for daily work to prevent accidental system-wide damage. Instead, use `sudo` to run specific commands as root.

**Hands-On Exercise**

(No code) In a Linux VM, practice creating a new user with `sudo adduser username` and give it sudo privileges by adding it to the "sudo" or "wheel" group. Test switching to that user (`su - username`) and try updating packages. Document each command used.

**How to Pass**

Know key Linux terms and commands by heart. In tests, questions might ask: "Which command shows current disk usage?" (Answer: `df -h`) or "What file type is a Linux terminal script?" (shell script, often with `.sh`). Drill simple commands until you can do them without thinking. Professors like asking about differences (`apt` vs `apt-get`, or Linux file permissions `rwx` = 421). Practice problems where you interpret a line of command output.
$md$, 4);

