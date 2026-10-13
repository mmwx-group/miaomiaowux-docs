---
title: "Miu"
description: "Miu 协议配置详解：通道池、内层 TLS 1.3 原样转发、PSK 鉴权、TLS / REALITY 两种外层、只发给官方客户端的订阅规则"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

## 概述

Miu 是妙妙屋X 自研的代理协议，跑在 TLS 1.3 或 REALITY 之上：用通道池取代多路复用，已经是 TLS 1.3 密文的数据不再加密第二次。

- **通道池，不做多路复用**。一条通道 = 一条 TCP + 外层 TLS + 一次认证，同一时间只跑一条流，流结束后回到池里给下一条用。在热通道上开流不需要握手、不等回包；没有多路复用，也就没有流与流之间的队头阻塞。
- **内层 TLS 1.3 原样转发**。访问 HTTPS 网站时，内层握手过后的密文不再套一层外层加密，省掉一次加解密。明文、内层握手的明文部分、TLS 1.2 仍然留在外层加密里。这是协议自己判断的，没有开关。
- **中止不废通道**。应用关掉连接时只结束这条流，通道照样回池。
- 每条流开头的几个包按 padding 规则整形；UDP 走 UDP-over-TCP，服务端自动支持，不需要额外配置。

妙妙屋X 在嵌入式 xray 内核（fork）中实现了 Miu 服务端，per-user 流量统计 / 限速 / 设备数限制与 VLESS / Trojan 走同一套通路。

| 项目     | 说明                                                                                |
| -------- | ----------------------------------------------------------------------------------- |
| 鉴权     | 每个用户一把 PSK（任意字符串，至少 16 个字符），身份即密钥；两端必须逐字相同        |
| 传输     | TCP                                                                                 |
| 安全层   | TLS（需要证书）或 REALITY（不需要证书）                                             |
| UDP      | 支持（UDP-over-TCP）                                                                |
| 内核要求 | 只有 [嵌入式 xray](/docs/embedded-xray) 的服务器支持，外置（官方）xray 没有这个协议 |
| 版本要求 | 主控 v0.5.6 及以上，Agent v1.1.1 及以上                                             |
| 客户端   | 默认只下发给官方客户端 MeowX，见下方[订阅下发规则](#订阅下发规则)                   |

## 添加节点（向导）

在「节点管理 → 添加节点」选择 MIU，传输只有 TCP，安全协议可选 TLS / REALITY。

- **TLS**：服务器需要先有域名和证书。简易模式会按服务器域名自动匹配已有证书；没有匹配到时按提示先去签发，或切到专家模式手动选择。
- **REALITY**：不需要证书，向导像 VLESS 一样探测 REALITY 目标域名并自动生成密钥对。
- **PSK** 自动生成，不需要手填。从面板用户添加、或把节点绑进套餐时，每个用户会拿到自己的一把 PSK，流量与限速按用户分别统计。

Miu 没有协议级的可调参数，选完安全协议直接提交即可。外置 xray 的服务器上 MIU 按钮不可选，需要先把服务器切换到内联模式。

## 订阅下发规则

Miu 是自研协议，别的客户端不认识它。官方 mihomo 遇到不认识的节点类型会**整份配置加载失败**（所有节点都用不了），所以订阅默认按客户端区分：

- **官方客户端 MeowX**：正常拿到 Miu 节点。
- **其它客户端**：Miu 节点被滤掉，连同代理组里对它的引用；被滤空的代理组会补上 DIRECT。普通订阅、套餐订阅、临时订阅都按这条规则处理。
- 妙妙屋X 之间跨面板导入节点不过滤。

如果订阅的使用者用的是支持 Miu 的客户端（例如自己编译了带 Miu 的 mihomo），可以在「节点管理 → 辅助功能」里打开 **「向所有客户端下发 Miu 节点」**（v0.5.7 起）。打开后所有客户端和临时订阅都会拿到 Miu 节点，默认关闭。

:::caution
打开这个开关前，先确认订阅的使用者用的都是支持 Miu 的客户端。不支持的客户端拿到 Miu 节点后，整份订阅都会加载失败。
:::

## 客户端兼容性

| 客户端                                                                   | 支持情况                              |
| ------------------------------------------------------------------------ | ------------------------------------- |
| MeowX（官方客户端）                                                      | 支持，请使用最新版本                  |
| 带 Miu 出站的 mihomo                                                     | 支持，节点类型为 `type: miu`          |
| 官方 mihomo / Clash.Meta 系（Clash Verge Rev、FlClash、Mihomo Party 等） | 不支持，遇到 Miu 节点整份配置加载失败 |
| sing-box、Shadowrocket、Surge、Loon、Quantumult X、Stash                 | 不支持                                |

主控本机的节点测速会自动下载带 Miu 出站的 mihomo 内核来测 Miu 节点，不需要手动处理；用 `MIHOMO_BIN` 指定了内核的主控不会被替换，此时指定的内核需要自己支持 Miu。

## 注意事项

- **主控、Agent、客户端要一起升级**。测试版期间用过的第一版线上格式已经停用，与现在的节点不通；只升级其中一边，Miu 节点会连不上。
- Miu 只能作入站，不能作为 Xray 出站，也不能用作中转节点的落地。
- 服务器从内嵌 xray 切换到外置 xray 前，必须先删掉上面的 Miu 入站，否则面板会拒绝切换（外置 xray 加载不了这个协议）。
- 鉴权字段为 `settings.users[]`（不是 `clients[]`），每个用户只有 `psk`，没有 UUID。
- TLS 节点默认带 `client-fingerprint: chrome`，让客户端用浏览器的握手指纹；入站里显式填了指纹的以它为准。

## 配置示例

### Miu + TCP + TLS

```json
{
  "tag": "miu-in",
  "listen": "0.0.0.0",
  "port": 443,
  "protocol": "miu",
  "settings": {
    "users": [
      {
        "psk": "your-psk-at-least-16-chars",
        "email": "alice@example.com"
      }
    ]
  },
  "streamSettings": {
    "network": "tcp",
    "security": "tls",
    "tlsSettings": {
      "serverName": "example.com",
      "certificates": [
        {
          "certificateFile": "/path/to/cert.pem",
          "keyFile": "/path/to/key.pem"
        }
      ]
    }
  }
}
```

订阅中生成的 mihomo 节点：

```yaml
- name: 东京 Miu
  type: miu
  server: example.com
  port: 443
  psk: your-psk-at-least-16-chars
  udp: true
  sni: example.com
  client-fingerprint: chrome
```

### Miu + TCP + REALITY

REALITY 的节点多出 `reality-opts`，写法与 VLESS 的 REALITY 节点相同：

```yaml
- name: 东京 Miu REALITY
  type: miu
  server: 203.0.113.10
  port: 443
  psk: your-psk-at-least-16-chars
  udp: true
  sni: www.example.com
  client-fingerprint: chrome
  reality-opts:
    public-key: xxxx
    short-id: xxxx
```
