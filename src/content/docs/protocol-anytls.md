---
title: "AnyTLS"
description: "AnyTLS 协议配置详解"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

## 概述

AnyTLS 是基于 TLS 的代理协议，在 TLS 之上叠加 padding + framing + 内置 multiplexing，用于抵御 TLS-in-TLS 等深包检测。妙妙屋X 通过 cherry-pick xray-core PR #5907 在嵌入式 xray 内核中实现，per-user 流量统计 / 限速 / 设备数限制全部走 xray dispatcher 现有通路，与 VLESS / Trojan 共享相同的多用户能力。

## 支持的组合

| 传输 | 安全层  | 说明                                                                                                |
| ---- | ------- | --------------------------------------------------------------------------------------------------- |
| TCP  | TLS     | 推荐组合，需要域名 + TLS 证书；可自动匹配现有泛域名证书                                             |
| TCP  | REALITY | 妙妙屋X 后端支持，但客户端兼容性差：mihomo / clash / sing-box 均不支持 AnyTLS-REALITY，仅作专家保留 |

## 客户端兼容性

- \- sing-box ≥ 1.12.0（生产稳定，per-user 统计 + email）
- \- mihomo / Clash.Meta（TLS only，REALITY 官方文档明确不会支持）
- \- Shadowrocket ≥ v2.2.65（iOS）
- \- NekoBox ≥ v1.3.8（Android）

Mihomo AnyTLS 配置参考： [wiki.metacubex.one/config/proxies/anytls](https://wiki.metacubex.one/config/proxies/anytls/)

## Padding Scheme（流量整形）

AnyTLS 通过 padding 规则伪装包大小，inbound 级配置，每行一条规则。妙妙屋X 创建入站时已预填 PR #5907 自带的 9 行默认方案，普通用户直接提交即可；如需自定义可在添加入站页面的「协议设置」中修改，留空则使用服务端默认。

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

## 注意事项

- \- 鉴权字段为 settings.users\[\].password（不是 clients\[\]），妙妙屋X 已在 mmw-agent 和主控订阅生成器中区分处理
- \- AnyTLS-REALITY 在所有主流客户端(Clash/Mihomo/sing-box)中均无支持计划，简易模式安全协议默认 TLS
- \- 添加入站「简易模式」+ TLS 时，妙妙屋X 自动用服务器域名匹配证书管理里的泛域名证书（如 \*.example.com 匹配 a.example.com）
- \- mihomo 节点字段使用 password + sni（与 Trojan 同源），由主控的 inboundToClashProxy 自动产出

## 配置示例

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
