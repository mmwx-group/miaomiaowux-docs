---
title: "Shadowsocks"
description: "Shadowsocks protocol configuration guide"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

## Overview

Shadowsocks is a classic proxy protocol supporting both AEAD and SS2022 encryption methods. Simple to configure with good compatibility.

## Encryption Methods

| Type   | Algorithm               | Description                           |
| ------ | ----------------------- | ------------------------------------- |
| AEAD   | aes-256-gcm             | Classic AEAD encryption               |
| AEAD   | chacha20-ietf-poly1305  | Suitable for ARM devices              |
| SS2022 | 2022-blake3-aes-256-gcm | Next-generation protocol, more secure |

## SS2022 Password Format

SS2022 uses a combined format of server password + client password. In mihomo/Clash, the password format is serverPassword:clientPassword.

## Configuration Example

### SS2022

```
{
  "protocol": "shadowsocks",
  "settings": {
    "method": "2022-blake3-aes-256-gcm",
    "password": "server-base64-key",
    "network": "tcp,udp",
    "clients": [{ "password": "client-base64-key" }]
  }
}
```
