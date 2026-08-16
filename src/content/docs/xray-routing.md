---
title: "Xray 路由管理"
description: "管理 Xray 路由规则，控制流量转发策略"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

## 概述

Xray 路由模块基于 first-match 语义：规则从上到下依次匹配，命中第一条即停止，未匹配的流量走默认出站（outbounds\[0\]）。妙妙屋X 提供两个入口管理路由规则：

| 入口     | 位置                      | 说明                                 |
| -------- | ------------------------- | ------------------------------------ |
| 节点路由 | 节点管理页 → 节点操作按钮 | 查看和管理单个节点（入站）的路由规则 |
| 路由面板 | Xray 服务器 → 路由 Tab    | 管理服务器全部路由规则，支持拖拽排序 |

## 路由匹配语义

Xray 路由规则遵循以下语义：

- \- 规则按顺序从上到下匹配，命中第一条即停止（first-match）
- \- 单条规则内多个条件为 AND 关系（如 domain + protocol 需同时满足）
- \- 只有 inboundTag + outboundTag 而无其他条件的规则 = catch-all，匹配该入站 100% 流量
- \- catch-all 之后的全局规则对该入站不再生效
- \- 无规则匹配时走 outbounds\[0\]（默认出站）

因此，规则顺序非常重要。更具体的规则应放在前面，catch-all 规则放在最后。

## 节点路由

在节点管理页面，每个远程服务器节点旁有路由按钮，点击打开节点路由 Dialog。

### 专属规则与全局规则

Dialog 将路由规则分为两类：

- \- 专属规则：包含当前节点 inboundTag 的规则，仅对此入站生效
- \- 全局规则：无 inboundTag 的规则，对所有入站生效

### Catch-all 检测

如果专属规则中存在 catch-all 规则（仅有 inboundTag + outboundTag，无 domain/ip/protocol 等条件），系统会自动隐藏全局规则和默认出站区域，并显示提示：

⚠ 全部流量已被路由到 \[outboundTag\]，后续全局规则和默认出站不再生效

### 出站名称解析

路由规则中的 outboundTag 会自动解析为对应的节点名称。系统通过匹配出站配置中的 server:port 与节点的 clash_config 地址来完成映射。

## 路由面板

在 Xray 服务器管理页面的「路由」Tab 中，可以管理远程服务器的全部路由规则。

### 左右分栏布局

路由面板采用左右分栏设计：

- \- 左侧（40%）：规则列表，可拖拽排序，点击选中
- \- 右侧（60%）：选中规则的详细字段展示 + JSON 预览 + 删除按钮

### 拖拽排序

由于 Xray 路由是 first-match 语义，规则顺序直接影响匹配结果。拖拽规则卡片左侧的手柄即可调整顺序，松手后自动保存并重启 Xray。

排序通过 action: 'set' 整体替换路由规则实现，API 规则（outboundTag 为 api）会自动保留在最前面。

## 快捷规则

系统内置了常用的快捷规则，点击即可一键添加：

| 规则            | 匹配条件               | 出站   | 说明                    |
| --------------- | ---------------------- | ------ | ----------------------- |
| 禁止 BT         | protocol: bittorrent   | block  | 阻止 BT 下载流量        |
| 禁止访问大陆 IP | ip: geoip:cn           | block  | 阻止访问中国大陆 IP     |
| OpenAI 直连     | domain: geosite:openai | direct | OpenAI 相关域名直连     |
| 禁止内网访问    | ip: geoip:private      | block  | 阻止访问内网地址        |
| RFC EMBY        | domain: rfc.uhdnow.com | 需选择 | EMBY 解锁，需指定出站   |
| 抖音解锁        | domain: geosite:tiktok | 需选择 | TikTok 解锁，需指定出站 |

## 出站负载均衡

可以创建一个负载均衡器(balancer)，把命中某条路由规则的流量分摊到一组出站上，实现多落地分流 / 故障转移。创建入口在「服务管理」的路由配置，以及「节点管理」的路由配置弹窗都提供。

### 创建步骤

1\. 在路由配置里点「创建负载均衡器」。

2\. 用出站前缀(selector)选中要参与均衡的一组出站(按 tag 前缀匹配)。

3\. 选择分流策略(见下表)。

4\. 添加一条路由规则，把 balancerTag 指向该均衡器(而不是单个 outboundTag)。

5\. 从节点管理路由弹窗创建时，默认规则的 inboundTag = 节点的 TAG，可改为对所有节点生效。

| 策略       | 说明                                             |
| ---------- | ------------------------------------------------ |
| random     | 随机挑选一个出站                                 |
| roundRobin | 轮询依次使用各出站                               |
| leastPing  | 选延迟最低的出站（需观测，自动启用 observatory） |
| leastLoad  | 选负载最低的出站（需观测）                       |

选择 leastPing / leastLoad 时系统会自动配置 observatory / burstObservatory 对候选出站做探测；random / roundRobin 无需探测。

## 自定义规则

自定义规则支持 Xray 路由的所有字段，空字段不会提交。多个值用逗号分隔。

| 字段       | 类型   | 示例                        | 说明                                             |
| ---------- | ------ | --------------------------- | ------------------------------------------------ |
| domain     | 数组   | geosite:openai, example.com | 域名匹配，支持 geosite:、domain:、full:、regexp: |
| ip         | 数组   | geoip:cn, 10.0.0.0/8        | IP 匹配，支持 geoip:、CIDR、纯 IP                |
| protocol   | 数组   | bittorrent, http, tls       | 协议匹配                                         |
| port       | 字符串 | 80, 443, 1000-2000          | 目标端口，支持范围                               |
| sourcePort | 字符串 | 1234                        | 来源端口                                         |
| network    | 字符串 | tcp / udp / tcp,udp         | 网络类型                                         |
| source     | 数组   | 10.0.0.1                    | 来源 IP                                          |
| user       | 数组   | user@example.com            | 用户标识                                         |
| inboundTag | 数组   | inbound-tag-1               | 入站标签，限定规则作用范围                       |
| attrs      | 字符串 | attrs\[':method'\] == 'GET' | 属性匹配表达式                                   |

## 自动重启

对远程服务器的路由规则进行添加、删除或排序操作后，系统会自动重启 Xray 使配置生效。操作完成后会显示 toast 提示。

## API 参考

| 接口                                           | 方法 | 说明                                   |
| ---------------------------------------------- | ---- | -------------------------------------- |
| /api/admin/remote/routing?server_id=N          | GET  | 获取远程服务器路由配置                 |
| /api/admin/remote/routing?server_id=N          | POST | 修改路由：add_rule / remove_rule / set |
| /api/admin/remote/outbounds?server_id=N        | GET  | 获取远程服务器出站列表                 |
| /api/admin/remote/services/control?server_id=N | POST | 服务控制（重启 Xray）                  |

[← Xray 出站管理](/docs/xray-outbounds)[→ Xray 系统配置](/docs/xray-system-config)
