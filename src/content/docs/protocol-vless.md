---
title: "VLESS"
description: "VLESS 协议配置详解"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

## 概述

VLESS 是 Xray 的主力协议，轻量无加密开销（依赖传输层加密），支持最多的传输和安全层组合。

## 支持的组合

| 传输      | 安全层                | 说明                 |
| --------- | --------------------- | -------------------- |
| TCP       | REALITY               | 推荐，无需域名和证书 |
| TCP       | REALITY + XTLS-Vision | 推荐，最佳性能       |
| TCP       | TLS                   | 需要域名和证书       |
| TCP       | TLS + XTLS-Vision     | 需要域名和证书       |
| WebSocket | TLS                   | WSS，适合 CDN 中转   |
| gRPC      | REALITY               | 适合高并发场景       |
| XHTTP     | REALITY               | 新一代传输，替代 H2  |

## XTLS-Vision

XTLS-Vision 是 VLESS 独有的流控模式，通过 flow: xtls-rprx-vision 启用。它可以减少 TLS-in-TLS 的特征，提高抗检测能力。仅支持 TCP 传输。

## 配置示例

### VLESS + TCP + REALITY + Vision（推荐）

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
