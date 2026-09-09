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

## 在向导中创建

「节点管理 → 添加节点」选择 VLESS 后，传输协议可选 GRPC / TCP / WSS / XHTTP，安全协议可选 REALITY / TLS / XTLS-Vision / XTLS-Vision-REALITY / ENC。默认组合就是推荐的 TCP + XTLS-Vision-REALITY：

![VLESS 添加节点向导截图](../../assets/screenshots/nodes-add-vless-reality.webp)

VLESS + TCP + XTLS-Vision-REALITY：REALITY 域名自动探测延迟最低的目标，也可手填；「防止 Reality 被盗用」会创建专用 Tunnel 只放行 serverNames；用户 UUID 与流控 xtls-rprx-vision 自动填好

- 简易模式：端口、UUID、REALITY 密钥对全部自动生成，直接「提交配置」
- 专家模式：可改端口、监听地址、嗅探、中转地址等
- 选 TLS / WSS 组合时服务器需要已配置证书，否则第一步会先弹出「SSL 配置」提示

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
