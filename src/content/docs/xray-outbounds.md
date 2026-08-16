---
title: "Xray 出站管理"
description: "管理 Xray 出站配置和路由规则"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

## 出站配置

出站定义了流量从 Xray 发出的方式。默认包含 freedom（直连）和 blackhole（阻断）两个出站。

| 类型                  | 说明                                                                                                              |
| --------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Freedom               | 直连出站，流量直接发送到目标                                                                                      |
| Blackhole             | 阻断出站，丢弃所有流量                                                                                            |
| VLESS/VMess/Trojan/SS | 代理出站，流量通过另一个代理服务器转发                                                                            |
| Tunnel                | 隧道出站                                                                                                          |
| WARP v0.2.3+          | Cloudflare WARP 出口（WireGuard 协议），点击「添加出站 → Cloudflare WARP」一键安装，每台 agent 独立账号、流量隔离 |

## 路由规则

路由规则决定入站流量如何分配到不同的出站。可以基于域名、IP、协议等条件进行分流。

- \- 支持域名匹配（domain, full, regexp）
- \- 支持 IP 匹配（CIDR, GeoIP）
- \- 支持协议匹配
- \- 支持端口匹配
- \- 支持入站 tag 匹配

## 操作

在服务器详情页的「出站」和「路由」标签页中管理。支持添加、编辑、删除出站和路由规则。修改后需要重启 Xray 服务生效。

## Cloudflare WARP 出站

v0.2.3 起内置 Cloudflare WARP 一键接入。每台 agent 各自向 Cloudflare 注册独立账号（不依赖 wgcf 二进制），生成 warp-v4 / warp-v6 两个 WireGuard 出站，可在路由里任意分流到 WARP。

1\. 在出站标签页点击「添加出站」→「Cloudflare WARP」，弹出 WARP 面板。

2\. 点「安装 WARP」，agent 向 Cloudflare 注册并写入 warp.json，自动加入 warp-v4 + warp-v6 两个出站；服务列表对应卡片显示橙色 W 徽标。

3\. 如需 WARP+：粘贴 license key 后点「升级 WARP+」即可；点「刷新配置」可重新拉取并重注 outbound（同 tag 幂等替换，不会重复）。

### 快捷路由 — 防止送中

路由面板的「快捷规则」下拉里，已安装 WARP 的服务器会多出「防止送中」一项：一键给 geosite:google + geosite:meta 全部走 warp-v4，避免 Google / Meta 流量被路到大陆节点。

### 注意事项

- \- 默认 MTU 1420（WireGuard 标准），noKernelTun=false 强制走 userspace gVisor TUN，不依赖宿主机 tun 模块和 CAP_NET_ADMIN。
- \- 卸载会同时调 Cloudflare 注销账号 + 删除本机 warp.json + 移除 xray 中的 warp-v4 / warp-v6 出站。
