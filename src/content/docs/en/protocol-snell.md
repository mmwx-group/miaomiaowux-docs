---
title: "Snell"
description: "Snell protocol configuration guide"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

## Overview

Snell is a lightweight encrypted proxy protocol from Surge (salt + AES-GCM record layer). MiaomiaowuX implements the Snell v4 / v5 / v6 server inside its embedded (forked) xray core, with TCP + UDP, obfs and multi-user support. Per-user traffic stats / rate-limit / device-limit all go through the existing xray dispatcher, sharing the same multi-user capabilities as VLESS / Trojan, and it has been verified interoperable with upstream sing-box / mihomo.

## Version comparison

| Version | Multi-user model                     | Obfs / shaping                        | Notes                                                               |
| ------- | ------------------------------------ | ------------------------------------- | ------------------------------------------------------------------- |
| v4      | Per-user PSK (trial-decrypt per PSK) | obfs: none / http / tls               | Widest compatibility; supported by mainstream clients               |
| v5      | Per-user PSK                         | obfs: none / http / tls               | Same wire format as v4, with refinements                            |
| v6      | Shared PSK + clientID (hidden salt)  | mode: default / unshaped / unsafe-raw | Stronger anti-blocking (hidden salt + shaping); needs newer clients |

## Adding a node (wizard)

In Node Management → Add Node, pick the Snell protocol; the version buttons are 'v4/v5' or 'v6'. On save the Clash config is stored into the node table by default.

### Simple mode

Just enter server address and port; the PSK is auto-generated (and the clientID for v6), then submit.

### Expert mode

Additionally configure obfs / shaping and multiple users: v4 / v5 set obfs (none / http / tls) and obfs-host; v6 set mode (default / unshaped / unsafe-raw). One credential per user (per-user PSK for v4 / v5; shared PSK + per-user clientID for v6).

## Client compatibility

- \- Surge: native Snell support (v1–v6), the original Snell client
- \- mihomo / Clash.Meta: Snell v1–v5 (v6 needs a newer core); MiaomiaowuX's Clash subscription outputs v4 / v5
- \- sing-box: recent versions support Snell; MiaomiaowuX's sing-box subscription outputs v4–v6 (v5 folded to v4)
- \- MiaomiaowuX subscription conversion currently covers only Clash and sing-box clients (other clients have limited Snell support)

## Notes

- \- Auth field is settings.users\[\].psk (not clients\[\] / password); Add-Inbound 'Simple mode' auto-generates the PSK
- \- v4 and v5 share the same wire format (plaintext salt + AES-128-GCM records); multi-user works by trial-decrypting per PSK. v6 switches to shared PSK + clientID and hides the salt (via PSK-derived shuffle / mask), so each user needs a clientID (auto-generated in Simple mode)
- \- v6 supports three shaping modes: default (shaped), unshaped, unsafe-raw (raw core, debug only); v4 / v5 support obfs (none / http / tls), v6 no longer uses obfs
- \- Snell uses plain TCP transport, no TLS / streamSettings; per-user traffic stats / rate-limit share the same xray dispatcher path as VLESS / Trojan

## Config examples

### Snell v4 / v5

```
{
  "tag": "snell-in",
  "listen": "0.0.0.0",
  "port": 8443,
  "protocol": "snell",
  "settings": {
    "users": [
      {
        "psk": "your-psk",
        "version": 4,
        "obfsMode": "none",
        "email": "user@example.com"
      }
    ]
  }
}
```

### Snell v6

```
{
  "tag": "snell-in",
  "listen": "0.0.0.0",
  "port": 8443,
  "protocol": "snell",
  "settings": {
    "users": [
      {
        "psk": "shared-psk",
        "version": 6,
        "v6Mode": "default",
        "clientId": "a1b2c3d4e5f6",
        "email": "user@example.com"
      }
    ]
  }
}
```

v6 uses a shared PSK + per-user clientID; v4 / v5 use a separate PSK per user. obfsMode can be omitted when none; for obfuscation set http or tls plus obfsHost.
