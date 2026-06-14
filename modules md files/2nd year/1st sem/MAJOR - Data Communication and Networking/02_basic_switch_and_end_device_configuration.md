# Basic Switch and End Device Configuration
<!-- subject: Data Communications and Networking | year: 2nd -->


<!-- kind: content -->
## Introduction

Before a switch or end device can participate properly in a network, it needs basic settings such as a device name, secure access, IP addressing information, and a default gateway. Network technicians often configure these settings through a command-line interface.

<!-- kind: content -->
## Operating System Components

An operating system provides the interface between users, software, and hardware.

| Component | Role |
|---|---|
| Shell | Accepts user commands through a graphical interface or command line. |
| Kernel | Manages hardware resources and coordinates software requests. |
| Hardware | The physical parts of the device. |

A **GUI** uses windows, icons, menus, and pointers. A **CLI** uses typed commands. Network devices commonly use CLI access because it is efficient, scriptable, and available even when a graphical interface is not.

<!-- kind: content -->
## Cisco IOS Access Methods

Common access methods for a Cisco IOS device include:

| Method | Use |
|---|---|
| Console | Direct physical access, often used for initial setup or recovery. |
| SSH | Secure remote CLI access over the network. |
| Telnet | Remote CLI access without encryption; generally avoided because commands and passwords are sent in readable form. |

Terminal emulation tools allow a technician to connect through console, SSH, or Telnet sessions.

<!-- kind: content -->
## IOS Navigation

Cisco IOS uses different command modes. Each mode controls what commands are available.

| Mode | Example Prompt | Purpose |
|---|---|---|
| User EXEC | `Switch>` | Basic monitoring commands. |
| Privileged EXEC | `Switch#` | More powerful verification and management commands. |
| Global configuration | `Switch(config)#` | Device-wide configuration. |
| Subconfiguration modes | `Switch(config-if)#`, `Switch(config-line)#` | Interface, line, or other specific settings. |

A technician enters privileged EXEC mode with `enable`, then enters configuration mode with `configure terminal`.

<!-- kind: content -->
## Command Structure and Help

IOS commands usually begin with a keyword and may include required or optional arguments. The CLI supports features that help avoid mistakes:

- `?` displays available commands or parameters.
- `Tab` completes a partial command when the entry is unique.
- Arrow keys recall or edit commands.
- `Ctrl+C` exits many configuration operations.
- `end` returns to privileged EXEC mode.

When output is long, IOS may pause with a `--More--` prompt so the technician can continue reading one screen at a time.

<!-- kind: content -->
## Basic Device Configuration

A basic switch setup usually includes a hostname, protected privileged EXEC access, console access security, remote access security, password encryption, and a login warning banner.

Passwords should be strong and should not be easy to guess. Remote access should use SSH instead of Telnet whenever possible.

<!-- kind: activity -->
## Basic Switch Configuration Lab

Use the following as a model for configuring a new switch. Replace example values with the values required in your lab.

```text
Switch> enable
Switch# configure terminal
Switch(config)# hostname S1
S1(config)# enable secret StrongEnablePass123
S1(config)# service password-encryption
S1(config)# banner motd #Authorized access only.#

S1(config)# line console 0
S1(config-line)# password ConsolePass123
S1(config-line)# login
S1(config-line)# exit

S1(config)# line vty 0 15
S1(config-line)# password RemotePass123
S1(config-line)# login
S1(config-line)# transport input ssh
S1(config-line)# exit
```

<!-- kind: content -->
## Saving Configurations

Cisco IOS keeps active settings in the **running configuration**. These settings are lost after a reboot unless they are saved. The saved version is called the **startup configuration**.

Important commands:

```text
show running-config
show startup-config
copy running-config startup-config
erase startup-config
reload
```

Use saving commands carefully. Erasing or reloading a device can interrupt network service.

<!-- kind: content -->
## Ports, Interfaces, and Addresses

A switch has physical ports that connect to end devices and other network devices. A Layer 2 switch can still have an IP address for management. This IP address is usually configured on a Switch Virtual Interface (SVI), commonly VLAN 1 in simple labs.

End devices need the following IP settings:

- IP address
- Subnet mask or prefix length
- Default gateway
- DNS server address, when name resolution is needed

The **default gateway** is the router interface a host uses to send traffic outside its local network.

<!-- kind: activity -->
## Configure Switch Management IP

```text
S1# configure terminal
S1(config)# interface vlan 1
S1(config-if)# ip address 192.168.1.2 255.255.255.0
S1(config-if)# no shutdown
S1(config-if)# exit
S1(config)# ip default-gateway 192.168.1.1
S1(config)# end
S1# copy running-config startup-config
```

<!-- kind: activity -->
## Connectivity Verification

Use these commands to check basic communication:

```text
S1# show ip interface brief
S1# ping 192.168.1.1
S1# show running-config
```

On a host computer, verify the IP address, subnet mask, default gateway, and DNS settings. Then test connectivity using `ping`.

<!-- kind: activity -->
## Review Questions

1. Why do network devices often use a CLI instead of only a GUI?
2. Why is SSH preferred over Telnet?
3. What is the difference between running configuration and startup configuration?
4. Why does a switch need an IP address if it mainly forwards frames at Layer 2?
5. What does a default gateway do?
