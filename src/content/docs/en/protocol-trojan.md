---
title: "Trojan"
description: "Detailed Trojan protocol configuration"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

## Overview

The Trojan protocol mimics HTTPS traffic and uses password authentication. In Xray-core, it supports TLS and REALITY security layers.

## Supported Combinations

| Transport | Security | Description                       |
| --------- | -------- | --------------------------------- |
| TCP       | TLS      | Classic Trojan                    |
| TCP       | REALITY  | No domain or certificate required |
| gRPC      | REALITY  | gRPC transport                    |

## Notes

- \- Xray-core has removed flow (XTLS-Vision) support for Trojan
- \- In mihomo, Trojan uses the sni field instead of servername

## Configuration Example

### Trojan + TCP + REALITY

```
{
  "protocol": "trojan",
  "settings": {
    "clients": [{ "password": "your-password" }]
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
