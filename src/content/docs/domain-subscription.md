---
title: "订阅域名"
description: "单独的订阅域名：只放行订阅与白名单上报，面板里一键配置 HTTPS 反代或复制 Nginx / Caddy 配置"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

订阅域名专门给代理客户端用：拉订阅、上报白名单 IP。配置之后，这个域名上**只放行订阅相关路径，打开面板返回 404**，订阅链接被分享出去也不会暴露面板地址。

## 放行的路径

| 路径 | 用途 |
| --- | --- |
| `/x/*` | 短链接、套餐订阅链接 |
| `/api/clash/subscribe` | Clash / Mihomo 订阅 |
| `/api/user/package-subscribe` | 套餐订阅 |
| `/api/subscribe` | 兼容旧版的订阅地址 |
| `/api/fw/*` | 客户端 IP 白名单上报（官方客户端会自动上报，见 [客户端设置](/docs/client-settings)） |

其余路径一律 404。

## 在面板里配置

1. 先把订阅域名解析到主控服务器，并在 [证书管理](/docs/certificates) 里准备好覆盖它的证书（泛域名证书也可以）。
2. 打开「系统设置」→「系统」选项卡，在 **订阅域名** 里填写，例如 `https://sub.example.com`，保存。
3. 下方会自动检查：
   - DNS 是否解析到本机。经过 CDN（如 Cloudflare 橙色云）时无法核对源站，会提示你自行确认 CDN 回源到本机。
   - 证书管理里有没有覆盖该域名的证书。
   - 本机 Nginx 是否由主控管理。
4. 主控 HTTPS 是用「部署证书到主控」启用的（Nginx 由主控管理）时，点 **自动配置 Nginx** 即可完成；否则按下方给出的 Nginx 或 Caddy 配置手动添加。

保存订阅域名后，面板、TG Bot 和 TG Mini App 里复制或推送的**所有**订阅地址都会改用它；留空则使用主控地址。

:::note
订阅域名与主控域名相同时，主控的 HTTPS 配置已经覆盖它，无需单独配置。
:::

## 手动配置

自己维护 Nginx 或 Caddy 时，可以直接复制面板给出的配置，也可以参考：

- [部署教程 · 独立订阅域名配置](/docs/tutorial#独立订阅域名配置)（Nginx）
- [部署教程 · Caddy](/docs/tutorial#55-可选使用-caddy-反向代理主控)
- [Cloudflare Tunnel](/docs/cloudflare-tunnel)：订阅域名的 Path 规则

面板生成的 Nginx 配置包含 [拒绝未知域名](/docs/tutorial#拒绝未知域名必须) 的兜底站点，避免泛域名证书下任意子域名都能访问。

## 和「关闭公网访问」一起用

开启 [关闭公网访问](/docs/domain-master#关闭公网访问) 后，订阅域名上的上述路径照常放行，其它路径会被跳转到主控域名。
