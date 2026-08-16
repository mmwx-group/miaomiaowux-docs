---
title: "生成订阅"
description: "为用户一键生成订阅链接,自动转换为 Clash / Mihomo / Shadowrocket / Surge / Stash / Surfboard / V2Ray / SingBox / Quantumult X 等 12+ 客户端格式;支持模板叠加和自定义规则。"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

![生成订阅页面截图](/images/screenshots/doc-generator-page.webp)

生成订阅 — 选节点 / 客户端格式 / 规则,一键生成订阅链接

## 概述

订阅系统将节点转换为各客户端支持的格式，通过唯一链接分发给用户。支持多种主流客户端格式。

## 支持的客户端格式

| 格式            | 客户端              | 平台              |
| --------------- | ------------------- | ----------------- |
| Clash/ClashMeta | mihomo, Clash Verge | 全平台            |
| Surge           | Surge               | macOS / iOS       |
| Loon            | Loon                | iOS               |
| Quantumult X    | Quantumult X        | iOS               |
| Shadowrocket    | Shadowrocket        | iOS               |
| SingBox         | sing-box            | 全平台            |
| Stash           | Stash               | macOS / iOS       |
| Surfboard       | Surfboard           | Android           |
| V2Ray           | V2RayN, V2RayNG     | Windows / Android |
| Egern           | Egern               | iOS               |

## 订阅链接

```
https://your-domain.com/api/clash/subscribe?token=<用户Token>&format=<格式>
```

`token` — 用户的订阅令牌（在用户管理中生成）

`format` — 输出格式（clash, surge, loon, qx, shadowrocket, singbox, stash, surfboard, v2ray, egern）

## 转换流程

1\. 用户通过订阅链接请求订阅

2\. 系统验证 Token 并获取用户可用节点

3\. 根据 format 参数选择对应的格式转换器

4\. 应用订阅模板（如有配置）

5\. 输出最终订阅内容
