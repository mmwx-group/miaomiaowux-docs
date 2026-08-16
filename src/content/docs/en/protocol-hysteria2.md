---
title: "Hysteria2"
description: "Hysteria2 protocol configuration guide"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

## Overview

Hysteria2 is based on QUIC (UDP), optimized for high-latency, high-packet-loss networks. Requires a TLS certificate.

## Prerequisites

- \- TLS certificate required (can be auto-issued via certificate management)
- \- UDP port must be open
- \- Client must support Hysteria2 (mihomo/Clash.Meta supported)

## Xray Configuration Notes

In Xray-core, Hysteria2 uses protocol: "hysteria" with version: 2. Authentication uses the auth field (not password).

## Configuration Example

```
{
  "protocol": "hysteria",
  "settings": {
    "version": 2,
    "clients": [{ "auth": "your-password" }]
  },
  "streamSettings": {
    "network": "hysteria",
    "security": "tls",
    "tlsSettings": {
      "serverName": "example.com",
      "alpn": ["h3"],
      "certificates": [{
        "certificateFile": "/path/to/cert.pem",
        "keyFile": "/path/to/key.pem"
      }]
    }
  }
}
```
