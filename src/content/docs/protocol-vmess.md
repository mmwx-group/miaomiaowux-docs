---
title: "VMess"
description: "VMess 协议配置详解"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

## 概述

VMess 是 V2Ray 原生协议，自带加密。相比 VLESS 有额外的加密开销，但兼容性更广。

## 支持的组合

| 传输      | 安全层 | 说明              |
| --------- | ------ | ----------------- |
| TCP       | None   | 仅 VMess 自身加密 |
| TCP       | TLS    | 双重加密          |
| WebSocket | None   | 适合 CDN 中转     |
| WebSocket | TLS    | WSS + VMess       |

## 配置示例

### VMess + WS + TLS

```
{
  "protocol": "vmess",
  "settings": {
    "clients": [{ "id": "uuid", "alterId": 0 }]
  },
  "streamSettings": {
    "network": "ws",
    "security": "tls",
    "wsSettings": { "path": "/vmess" },
    "tlsSettings": {
      "serverName": "example.com",
      "certificates": [{ "certificateFile": "...", "keyFile": "..." }]
    }
  }
}
```
