---
title: "Xray 出站管理"
description: "管理 Xray 出站配置和路由规则"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

![Xray 出站管理截图](../../assets/screenshots/servers-xray-manage-outbounds.webp)

Xray 管理 → 出站管理：左侧出站列表（默认 direct / block 可用「隐藏默认」收起），右侧显示选中出站的详情

## 出站配置

出站定义了流量从 Xray 发出的方式。默认包含 freedom（直连）和 blackhole（阻断）两个出站。

| 类型                  | 说明                                                                                                              |
| --------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Freedom               | 直连出站，流量直接发送到目标                                                                                      |
| Blackhole             | 阻断出站，丢弃所有流量                                                                                            |
| VLESS/VMess/Trojan/SS | 代理出站，流量通过另一个代理服务器转发                                                                            |
| Tunnel                | 隧道出站                                                                                                          |
| WARP v0.2.3+          | Cloudflare WARP 出口（WireGuard 协议），点击「添加出站 → Cloudflare WARP」一键安装，每台 agent 独立账号、流量隔离 |

## 页面入口

- 左侧菜单「Xray 出站管理」：选择服务器后列出出站，右上角「隐藏默认出站」「添加出站」
- 服务管理 → 服务器卡片「Xray配置」→「出站管理」选项卡（左右分栏，可拖拽排序）

![Xray 出站管理独立页面截图](../../assets/screenshots/xray-outbounds-list.webp)

独立的 Xray 出站管理页面

实际使用中，大多数出站并不需要在这里手工添加：在 [节点管理](/docs/nodes) 里点某个节点的「创建链式出站」按钮，选择一个落地节点或服务器，系统会自动在源服务器上创建对应的代理出站和路由规则，见 [路由出站](/docs/routed-outbound)。

## 路由规则

路由规则决定入站流量如何分配到不同的出站。可以基于域名、IP、协议等条件进行分流。

- 支持域名匹配（domain, full, regexp）
- 支持 IP 匹配（CIDR, GeoIP）
- 支持协议匹配
- 支持端口匹配
- 支持入站 tag 匹配

路由规则在「路由管理」选项卡里维护，详见 [Xray 路由管理](/docs/xray-routing)。

## 操作

在服务器详情页的「出站」和「路由」标签页中管理。支持添加、编辑、删除出站和路由规则。修改后需要重启 Xray 服务生效（路由变更会自动重启）。

## Cloudflare WARP 出站

v0.2.3 起内置 Cloudflare WARP 一键接入。每台 agent 各自向 Cloudflare 注册独立账号（不依赖 wgcf 二进制），生成 warp-v4 / warp-v6 两个 WireGuard 出站，可在路由里任意分流到 WARP。

1. 在出站标签页点击「添加出站」→「Cloudflare WARP」，弹出 WARP 面板。
2. 点「安装 WARP」，agent 向 Cloudflare 注册并写入 warp.json，自动加入 warp-v4 + warp-v6 两个出站；服务列表对应卡片显示橙色 W 徽标。
3. 如需 WARP+：粘贴 license key 后点「升级 WARP+」即可；点「刷新配置」可重新拉取并重注 outbound（同 tag 幂等替换，不会重复）。

### 快捷路由 — 防止送中

路由面板的「快捷规则」下拉里，已安装 WARP 的服务器会多出「防止送中」一项：一键给 geosite:google + geosite:meta 全部走 warp-v4，避免 Google / Meta 流量被路到大陆节点。

### 注意事项

- 默认 MTU 1420（WireGuard 标准），noKernelTun=false 强制走 userspace gVisor TUN，不依赖宿主机 tun 模块和 CAP_NET_ADMIN。
- 卸载会同时调 Cloudflare 注销账号 + 删除本机 warp.json + 移除 xray 中的 warp-v4 / warp-v6 出站。
