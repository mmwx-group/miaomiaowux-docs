---
title: "协议矩阵"
description: "妙妙屋X 支持的所有协议×传输×安全组合"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

## 完整矩阵

以下是经过测试验证的所有可用组合（19 种），均已通过 mihomo 连通性测试。

| #   | 协议        | 传输  | 安全层                | 备注                                              |
| --- | ----------- | ----- | --------------------- | ------------------------------------------------- |
| 1   | VLESS       | TCP   | REALITY               |                                                   |
| 2   | VLESS       | TCP   | REALITY + XTLS-Vision | flow: xtls-rprx-vision                            |
| 3   | VLESS       | TCP   | TLS                   |                                                   |
| 4   | VLESS       | TCP   | TLS + XTLS-Vision     | flow: xtls-rprx-vision                            |
| 5   | VLESS       | WS    | TLS                   | WSS                                               |
| 6   | VLESS       | gRPC  | REALITY               |                                                   |
| 7   | VLESS       | XHTTP | REALITY               |                                                   |
| 8   | Trojan      | TCP   | TLS                   |                                                   |
| 9   | Trojan      | TCP   | REALITY               |                                                   |
| 10  | Trojan      | gRPC  | REALITY               |                                                   |
| 11  | VMess       | TCP   | None                  |                                                   |
| 12  | VMess       | TCP   | TLS                   |                                                   |
| 13  | VMess       | WS    | None                  |                                                   |
| 14  | VMess       | WS    | TLS                   |                                                   |
| 15  | Shadowsocks | TCP   | None                  | AEAD: aes-256-gcm                                 |
| 16  | Shadowsocks | TCP   | None                  | SS2022: 2022-blake3-aes-256-gcm                   |
| 17  | Hysteria2   | UDP   | TLS                   | 需要 TLS 证书                                     |
| 18  | AnyTLS      | TCP   | TLS                   | 需要 TLS 证书（推荐，mihomo/sing-box 通用）       |
| 19  | AnyTLS      | TCP   | REALITY               | 后端支持但 Clash/Mihomo/sing-box 客户端均无支持   |
| 20  | Snell       | TCP   | None                  | Snell v4 / v5:每用户独立 PSK,支持 obfs 混淆       |
| 21  | Snell       | TCP   | None                  | Snell v6:共享 PSK + clientID,隐藏 salt + 流量整形 |

## 已废弃的组合

以下组合在 Xray-core 中已被废弃或移除：

- \- HTTP/H2 传输：已迁移到 XHTTP stream-one（H2 & H3）
- \- Trojan + Flow（XTLS-Vision）：Xray-core 已移除 Trojan 的 flow 支持

## mihomo 兼容性说明

- \- Trojan 在 mihomo 中使用 sni 字段（非 servername）
- \- XHTTP 需要 xhttp-opts 包含 headers: {}，mode 放在顶层
- \- REALITY 的 short-id 和 public-key 放在 reality-opts 中
- \- Hysteria2 使用 hysteria2 类型（非 hysteria）
