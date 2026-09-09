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

- Xray-core has removed flow (XTLS-Vision) support for Trojan
- In mihomo, Trojan uses the sni field instead of servername

## Creating it in the wizard

In "Nodes → Add Node" with TROJAN selected, the transport can be GRPC / TCP and the security REALITY / TLS. REALITY needs no certificate — the wizard probes a REALITY domain and generates the key pair as for VLESS; TLS requires a certificate on the server:

![Trojan add node wizard screenshot](../../../assets/screenshots/nodes-add-trojan.webp)

Trojan + TCP + REALITY: password generated, REALITY domain probed automatically

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
