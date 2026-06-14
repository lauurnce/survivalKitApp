# Application Layer
<!-- subject: Data Communications and Networking | year: 2nd -->


<!-- kind: content -->
## Introduction

The application layer provides network services used by software applications. It includes protocols for web browsing, email, name resolution, address assignment, file sharing, and other user-facing network functions.

<!-- kind: content -->
## Application, Presentation, and Session Functions

In the TCP/IP model, many functions associated with the OSI application, presentation, and session layers are grouped into the application layer.

These functions may include:

- Application network services
- Data formatting
- Encryption support
- Compression
- Session establishment and management

<!-- kind: content -->
## TCP/IP Application Layer Protocols

Common protocols include:

| Protocol | Purpose |
|---|---|
| HTTP | Transfers web content. |
| HTTPS | Transfers web content securely using encryption. |
| SMTP | Sends email between clients and servers or between mail servers. |
| POP3 | Downloads email from a server to a client. |
| IMAP | Synchronizes email while keeping messages on the server. |
| DNS | Translates domain names to IP addresses. |
| DHCP | Automatically assigns IP configuration. |
| FTP/SFTP | Transfers files. |
| SMB | Shares files and printers in many local networks. |

<!-- kind: content -->
## Client-Server Communication

In a client-server model, a client requests a service and a server responds. For example, a browser requests a webpage from a web server. The server sends back the requested content if the request is valid and allowed.

<!-- kind: content -->
## Peer-to-Peer Communication

In peer-to-peer networking, devices can share resources directly without a dedicated server. A device may be a client for one exchange and a server for another. Peer-to-peer applications may also use central services to help peers find resources.

<!-- kind: content -->
## Web Protocols: HTTP and HTTPS

HTTP is used to request and deliver web content. HTTPS adds encryption and authentication support, protecting the communication from easy interception or tampering.

A typical web request involves:

1. The user enters a URL.
2. DNS resolves the domain name to an IP address.
3. The browser opens a connection to the server.
4. The browser sends an HTTP or HTTPS request.
5. The server sends a response.
6. The browser renders the page.

<!-- kind: content -->
## Email Protocols

Email uses multiple protocols because sending and retrieving mail are different tasks.

| Protocol | Role |
|---|---|
| SMTP | Sends outgoing mail. |
| POP3 | Retrieves mail by downloading it to a client. |
| IMAP | Retrieves and synchronizes mail across devices. |

IMAP is useful when users check the same mailbox from multiple devices.

<!-- kind: content -->
## IP Addressing Services

### DNS

DNS translates human-readable names into IP addresses. Without DNS, users would need to remember IP addresses for websites and services.

### DHCP

DHCP automatically provides IP settings such as IP address, subnet mask, default gateway, and DNS server. This reduces manual configuration work and helps prevent duplicate addresses.

<!-- kind: content -->
## File Sharing Services

File sharing protocols allow users to access files over a network. SMB is common in many local networks for file and printer sharing. Secure file transfer options are preferred when data crosses untrusted networks.

<!-- kind: activity -->
## Web Request Flow Activity

Arrange the steps in correct order:

- Browser displays the webpage.
- DNS resolves the domain name.
- User enters a URL.
- Server sends an HTTP/HTTPS response.
- Browser sends a request to the web server.

Then explain where DNS, TCP, IP, and Ethernet are involved.

<!-- kind: activity -->
## Service Identification Exercise

Identify the most appropriate protocol.

| Task | Protocol |
|---|---|
| Automatically assign an IP address |  |
| Resolve a domain name |  |
| Securely view a website |  |
| Send outgoing email |  |
| Synchronize email across devices |  |
| Share files in a local network |  |

<!-- kind: activity -->
## Review Questions

1. What does the application layer provide?
2. How is HTTPS different from HTTP?
3. Why are DNS and DHCP important?
4. Compare POP3 and IMAP.
5. How is peer-to-peer communication different from client-server communication?
