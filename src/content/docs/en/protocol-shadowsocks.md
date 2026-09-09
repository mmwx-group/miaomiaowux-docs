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

## Creating it in the wizard

The wizard offers two Shadowsocks buttons: "SHADOWSOCKS" (AEAD such as aes-256-gcm) and "SHADOWSOCKS2022" (2022-blake3-aes-128-gcm, server password + per-user PSK). Neither needs a certificate; simple mode generates port and passwords:

![Shadowsocks 2022 add node wizard screenshot](../../../assets/screenshots/nodes-add-ss2022.webp)

Shadowsocks 2022: the user password (PSK) is Base64-encoded automatically; the JSON preview shows method 2022-blake3-aes-128-gcm and network tcp,udp

![Shadowsocks add node wizard screenshot](../../../assets/screenshots/nodes-add-shadowsocks.webp)

Classic Shadowsocks (AEAD)

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
