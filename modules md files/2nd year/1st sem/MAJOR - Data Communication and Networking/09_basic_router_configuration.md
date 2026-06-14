# Basic Router Configuration
<!-- subject: Data Communications and Networking | year: 2nd -->


<!-- kind: content -->
## Introduction

Routers connect different networks. A basic router configuration includes a hostname, secure access settings, interface IP addresses, and verification commands to confirm connectivity.

<!-- kind: content -->
## Configure Initial Router Settings

A new router should be configured with identity and security settings before it is placed into regular use.

Common initial settings include:

- Hostname
- Encrypted privileged EXEC password
- Console password
- Remote access settings
- Password encryption
- Login banner
- Saved configuration

<!-- kind: activity -->
## Initial Router Setup Lab

```text
Router> enable
Router# configure terminal
Router(config)# hostname R1
R1(config)# enable secret StrongEnablePass123
R1(config)# service password-encryption
R1(config)# banner motd #Authorized access only.#

R1(config)# line console 0
R1(config-line)# password ConsolePass123
R1(config-line)# login
R1(config-line)# exit

R1(config)# line vty 0 4
R1(config-line)# password RemotePass123
R1(config-line)# login
R1(config-line)# transport input ssh
R1(config-line)# exit
```

<!-- kind: content -->
## Configure Router Interfaces

Router interfaces must be assigned IP addresses and enabled before they can forward traffic. Each router interface usually belongs to a different network.

A router interface configuration may include:

- Interface selection
- Description
- IPv4 address and subnet mask
- IPv6 address, if used
- `no shutdown` to activate the interface

<!-- kind: activity -->
## Router Interface Configuration Lab

```text
R1# configure terminal
R1(config)# interface gigabitEthernet 0/0
R1(config-if)# description LAN gateway interface
R1(config-if)# ip address 192.168.1.1 255.255.255.0
R1(config-if)# no shutdown
R1(config-if)# exit

R1(config)# interface gigabitEthernet 0/1
R1(config-if)# description Link to another network
R1(config-if)# ip address 192.168.2.1 255.255.255.0
R1(config-if)# no shutdown
R1(config-if)# end
R1# copy running-config startup-config
```

<!-- kind: content -->
## Configure the Default Gateway on Hosts and Switches

End devices need a default gateway so they can reach remote networks. The default gateway address should be the router interface address on the same local network as the host.

A Layer 2 switch used for management also needs a default gateway if it will be managed from another network.

<!-- kind: activity -->
## Verification Commands

Use these commands to check the configuration:

```text
R1# show ip interface brief
R1# show running-config
R1# show interfaces
R1# ping 192.168.1.10
```

A useful troubleshooting approach is to check interface status first, then IP addressing, then cabling, then routing.

<!-- kind: activity -->
## Troubleshooting Scenario

A PC cannot ping its default gateway.

Check the following:

1. Is the PC IP address in the same network as the router interface?
2. Is the subnet mask correct?
3. Is the router interface enabled with `no shutdown`?
4. Is the cable connected to the correct port?
5. Does `show ip interface brief` show the interface as up/up?

<!-- kind: activity -->
## Review Questions

1. Why does each router interface usually need a different network address?
2. What does `no shutdown` do?
3. Why should passwords be encrypted in the configuration?
4. What is the role of a default gateway?
5. Which command gives a quick summary of router interface status?
