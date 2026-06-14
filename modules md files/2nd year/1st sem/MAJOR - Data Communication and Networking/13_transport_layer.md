# Transport Layer
<!-- subject: Data Communications and Networking | year: 2nd -->


<!-- kind: content -->
## Introduction

The transport layer supports communication between applications running on different devices. It segments data, identifies applications with port numbers, and provides either reliable or lightweight delivery depending on the protocol used.

<!-- kind: content -->
## Role of the Transport Layer

The transport layer is responsible for process-to-process communication. While IP delivers packets between hosts, transport protocols deliver data to the correct application.

Responsibilities may include:

- Segmenting data
- Reassembling data
- Tracking conversations
- Identifying applications with port numbers
- Providing reliability when required
- Controlling flow between sender and receiver

<!-- kind: content -->
## TCP and UDP

The two major transport layer protocols are TCP and UDP.

| Feature | TCP | UDP |
|---|---|---|
| Connection setup | Yes | No |
| Reliability | Acknowledgments and retransmissions | No built-in retransmission |
| Ordering | Sequences data | Delivers data as received |
| Header size | Larger | Smaller |
| Common use | Web, email, file transfer | DNS, streaming, voice, gaming |

TCP is used when reliability is more important. UDP is used when speed, simplicity, or low delay is more important.

<!-- kind: content -->
## TCP Overview

TCP provides reliable delivery through sequencing, acknowledgments, retransmissions, and flow control. If data is lost, TCP can resend it. If data arrives out of order, TCP can reorder it before passing it to the application.

TCP begins communication with a three-way handshake.

```text
1. SYN
2. SYN-ACK
3. ACK
```

This process establishes a session between the two endpoints.

<!-- kind: content -->
## TCP Session Termination

When communication is finished, TCP closes the connection gracefully using control messages. This helps both sides know that no more data will be sent.

<!-- kind: content -->
## UDP Overview

UDP is simpler than TCP. It does not establish a session, does not track acknowledgments, and does not retransmit lost data. Applications that use UDP may handle reliability themselves or may tolerate some loss.

UDP is useful for real-time traffic where waiting for retransmission may be worse than losing a small amount of data.

<!-- kind: content -->
## Port Numbers

Port numbers identify applications and services.

| Port Range | Description |
|---|---|
| Well-known ports | Common services such as web, email, and DNS. |
| Registered ports | Applications registered by vendors or organizations. |
| Dynamic/private ports | Temporary client-side ports used during communication. |

Common examples:

| Protocol/Service | Port |
|---|---|
| HTTP | TCP 80 |
| HTTPS | TCP 443 |
| DNS | UDP/TCP 53 |
| DHCP | UDP 67/68 |
| SMTP | TCP 25 |
| SSH | TCP 22 |
| FTP | TCP 20/21 |

<!-- kind: content -->
## Choosing the Right Transport Protocol

Applications choose TCP or UDP based on their needs. A file download should be complete and accurate, so TCP is appropriate. A live voice call needs low delay, so UDP is often preferred.

<!-- kind: activity -->
## Protocol Selection Exercise

Choose TCP or UDP and explain your choice.

1. Downloading a software installer.
2. Watching a live stream.
3. Sending an email.
4. Online gaming voice chat.
5. Looking up a domain name with DNS.

<!-- kind: activity -->
## Port Matching Exercise

Match the service to the port.

| Service | Port |
|---|---|
| HTTPS |  |
| DNS |  |
| SSH |  |
| HTTP |  |
| SMTP |  |

<!-- kind: activity -->
## Review Questions

1. What does the transport layer do?
2. Why does TCP use sequencing?
3. What happens during the TCP three-way handshake?
4. Why is UDP useful for real-time applications?
5. What is the purpose of port numbers?
