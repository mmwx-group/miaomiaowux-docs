---
title: "域名配置总览"
description: "妙妙屋X 的三个域名：主控域名、订阅域名、上报域名（Agent 通信地址）各管什么、在哪里配置、推荐组合"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

妙妙屋X 最多可以用三个域名，分别给三类访问者：

| 域名 | 谁在访问 | 放行的路径 | 在哪里配置 | 必须 |
| --- | --- | --- | --- | --- |
| [主控域名](/docs/domain-master) | 管理员和用户的浏览器（面板）；未单独配置时也承担订阅和 Agent 通信 | 全部 | 系统设置 →「系统」→ 主服务器地址 | 是 |
| [订阅域名](/docs/domain-subscription) | 代理客户端拉订阅、客户端上报白名单 IP | 订阅相关路径（`/x/*`、订阅接口、`/api/fw/*`） | 系统设置 →「系统」→ 订阅域名 | 否 |
| [上报域名（Agent 通信地址）](/docs/domain-agent) | 各台服务器上的 Agent：长连接、心跳、流量上报、安装脚本 | `/api/remote/*`（含 WebSocket） | 系统设置 →「系统」→ Agent 通信地址 | 否 |

后两个都是可选的：不单独配置时，订阅链接和 Agent 都直接用主控域名。

## 为什么要拆成三个域名

- **不暴露面板**：订阅链接会被分享、会被导入各种客户端；Agent 装在每一台服务器上。只用一个域名时，拿到订阅链接或登上任何一台服务器的人都知道面板在哪。拆开后，订阅域名和上报域名上**打开面板一律返回 404**。
- **分开走不同线路**：订阅域名可以套 CDN 或 Cloudflare Tunnel，让国内用户拉订阅更快；上报域名可以单独解析，换面板域名时不必动 Agent。
- **分开封禁风险**：某个域名被墙或被滥用时，只影响一类访问，换掉它不影响其它两类。

## 推荐组合

| 场景 | 推荐做法 |
| --- | --- |
| 个人自用、少量服务器 | 只配主控域名即可 |
| 有多个用户、订阅链接会外发 | 主控域名 + 订阅域名 |
| 服务器多、不想让每台 Agent 都知道面板域名 | 三个都配 |

三个域名都可以是同一张证书覆盖的子域名（例如泛域名证书 `*.example.com` 下的 `panel.`、`sub.`、`agent.`）。

## 配置顺序

1. 先按 [部署教程](/docs/tutorial) 配好**主控域名**和 HTTPS，确认面板能正常打开。
2. 需要时再配**订阅域名**：保存后，面板、TG Bot 和 Mini App 里复制或推送的订阅地址都会换成它。
3. 最后配**上报域名**：它会把新地址下发给所有 Agent，按「检查 → 单台测试 → 全部切换」三步走，详见 [上报域名](/docs/domain-agent)。

## 完整示例（三个域名同一台主控）

假设面板 `panel.example.com`、订阅 `sub.example.com`、上报 `agent.example.com` 都解析到主控，主控监听默认端口 `12889`。用 Caddy 时整个 `/etc/caddy/Caddyfile` 如下（Caddy 自动申请证书）：

```caddy
# 主控域名：全部放行
panel.example.com {
    reverse_proxy 127.0.0.1:12889
}

# 订阅域名：只放行订阅相关路径
sub.example.com {
    @subscriptions path /x/* /api/fw/* /api/clash/subscribe /api/user/package-subscribe /api/subscribe
    handle @subscriptions {
        reverse_proxy 127.0.0.1:12889
    }
    handle {
        respond 404
    }
}

# 上报域名：只放行 Agent 通信
agent.example.com {
    @agent path /api/remote/*
    handle @agent {
        reverse_proxy 127.0.0.1:12889
    }
    handle {
        respond 404
    }
}
```

用 Nginx 时，每个域名一个 server 块，外加一个拒绝未知域名的兜底站点，分别见：

- [主控域名 · Nginx](/docs/domain-master#nginx)
- [订阅域名 · Nginx](/docs/domain-subscription#nginx)
- [上报域名 · Nginx](/docs/domain-agent#nginx)

配好反代后，别忘了在「系统设置」→「系统」里填写对应的地址，否则面板生成的链接仍然使用主控域名。

:::caution[泛域名证书要加兜底站点]
使用泛域名证书并做了泛解析时，任何没有配置过的子域名都可能被 Nginx 交给第一个站点（往往就是面板）。自己配置 Nginx 时务必加上 [拒绝未知域名](/docs/tutorial#拒绝未知域名必须) 的兜底站点；面板一键配置生成的 Nginx 配置已经包含它。
:::
