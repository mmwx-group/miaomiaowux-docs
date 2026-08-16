---
title: "VLESS"
description: "Detailed VLESS protocol configuration"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

## Overview

VLESS is Xray's primary protocol. It is lightweight with no encryption overhead (relies on transport layer encryption) and supports the most transport and security layer combinations.

## Supported Combinations

| Transport | Security              | Description                                    |
| --------- | --------------------- | ---------------------------------------------- |
| TCP       | REALITY               | Recommended, no domain or certificate required |
| TCP       | REALITY + XTLS-Vision | Recommended, best performance                  |
| TCP       | TLS                   | Requires domain and certificate                |
| TCP       | TLS + XTLS-Vision     | Requires domain and certificate                |
| WebSocket | TLS                   | WSS, suitable for CDN relay                    |
| gRPC      | REALITY               | Suitable for high concurrency                  |
| XHTTP     | REALITY               | Next-gen transport, replaces H2                |

## XTLS-Vision

XTLS-Vision is a flow control mode exclusive to VLESS, enabled via flow: xtls-rprx-vision. It reduces TLS-in-TLS characteristics, improving detection resistance. Only supports TCP transport.

## Configuration Example

### VLESS + TCP + REALITY + Vision (Recommended)

```
{
  "protocol": "vless",
  "settings": {
    "clients": [{ "id": "uuid", "flow": "xtls-rprx-vision" }],
    "decryption": "none"
  },
  "streamSettings": {
    "network": "tcp",
    "security": "reality",
    "realitySettings": {
      "dest": "dl.google.com:443",
      "serverNames": ["dl.google.com"],
      "privateKey": "...",
      "shortIds": [""]
    }
  }
}
```
