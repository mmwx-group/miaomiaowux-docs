---
title: "AnyTLS"
description: "AnyTLS protocol configuration guide"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

## Overview

AnyTLS is a TLS-based proxy protocol that layers padding + framing + built-in multiplexing on top of TLS to resist TLS-in-TLS DPI. MiaomiaowuX implements it by cherry-picking xray-core PR #5907 into the embedded xray kernel; per-user traffic stats / rate limit / device count limits all reuse the existing xray dispatcher path, sharing the same multi-user pipeline with VLESS / Trojan.

## Supported combinations

| Transport | Security | Note                                                                                                                   |
| --------- | -------- | ---------------------------------------------------------------------------------------------------------------------- |
| TCP       | TLS      | Recommended; requires a domain + TLS cert; existing wildcard certs can be auto-matched                                 |
| TCP       | REALITY  | Backend supported but no client support: mihomo / clash / sing-box all do NOT support AnyTLS-REALITY; expert mode only |

## Client compatibility

- \- sing-box ≥ 1.12.0 (production stable, per-user stats + email)
- \- mihomo / Clash.Meta (TLS only; REALITY explicitly NOT planned per upstream docs)
- \- Shadowrocket ≥ v2.2.65 (iOS)
- \- NekoBox ≥ v1.3.8 (Android)

Mihomo AnyTLS reference: [wiki.metacubex.one/config/proxies/anytls](https://wiki.metacubex.one/config/proxies/anytls/)

## Padding Scheme (traffic shaping)

AnyTLS uses padding rules to obfuscate packet sizes; configured at the inbound level, one rule per line. MiaomiaowuX pre-fills the default 9-line scheme from PR #5907 when creating an inbound; submit as-is for normal use, or edit in the Protocol Settings section. Leave empty to let the server fall back to its built-in default.

```
stop=8
0=30-30
1=100-400
2=400-500,c,500-1000,c,500-1000,c,500-1000,c,500-1000
3=9-9,500-1000
4=500-1000
5=500-1000
6=500-1000
7=500-1000
```

## Notes

- \- Auth field is settings.users\[\].password (NOT clients\[\]); both mmw-agent and the master subscription generator handle this distinction
- \- AnyTLS-REALITY is not on any major client's roadmap (Clash/Mihomo/sing-box); Simple mode defaults the security layer to TLS
- \- Inbound wizard Simple mode + TLS auto-matches the server's domain against wildcard certs in Certificate Management (e.g. a.example.com matches \*.example.com)
- \- Mihomo node fields use password + sni (same as Trojan), produced automatically by the master's inboundToClashProxy

## Config example

### AnyTLS + TCP + TLS

```
{
  "tag": "anytls-in",
  "listen": "0.0.0.0",
  "port": 443,
  "protocol": "anytls",
  "settings": {
    "users": [
      {
        "password": "your-password",
        "email": "user@example.com",
        "level": 0
      }
    ],
    "paddingScheme": [
      "stop=8",
      "0=30-30",
      "1=100-400"
    ]
  },
  "streamSettings": {
    "network": "tcp",
    "security": "tls",
    "tlsSettings": {
      "certificates": [
        {
          "certificateFile": "/path/to/fullchain.pem",
          "keyFile": "/path/to/privkey.pem"
        }
      ],
      "serverName": "your.domain.com"
    }
  }
}
```
