---
title: "Trojan"
description: "Trojan 协议配置详解"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

## 概述

Trojan 协议模拟 HTTPS 流量，使用密码认证。在 Xray-core 中支持 TLS 和 REALITY 安全层。

## 支持的组合

| 传输 | 安全层  | 说明           |
| ---- | ------- | -------------- |
| TCP  | TLS     | 经典 Trojan    |
| TCP  | REALITY | 无需域名和证书 |
| gRPC | REALITY | gRPC 传输      |

## 注意事项

- \- Xray-core 已移除 Trojan 的 flow（XTLS-Vision）支持
- \- mihomo 中 Trojan 使用 sni 字段，而非 servername

## 配置示例

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
