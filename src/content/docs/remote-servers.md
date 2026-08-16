---
title: "远程服务器"
description: "添加和管理远程服务器，Master-Agent 架构说明"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

![服务管理页面截图](/images/screenshots/doc-xray-servers-page.webp)

服务管理 — 服务器以卡片形式展示,含状态 / 实时网速 / 流量 / Xray 信息 / 一键操作

## 概述

妙妙屋X 采用 Master-Agent 架构。主控端通过网络与远程服务器上的 Agent 通信，实现 Xray/Nginx 的远程安装、配置和管理。

## 添加服务器

1. 进入「服务管理」页面，点击「添加服务器」
2. 填写服务器名称（用于标识）
3. 填写服务器 IP 地址
4. 填写域名（可选，用于 TLS 证书和 Nginx 伪装）
5. 选择偷取模式（tunnel/steal，影响节点端口生成）
6. 系统自动生成 Server Token 和 Agent Token
7. 使用 Token 在远程服务器上部署 Agent

**两种部署方式:** 一键脚本(裸机 + systemd) 或 Docker 镜像 (内置 embedded xray + nginx,必须 host 网络)。详细命令和注意事项见 [安装 Agent 文档](/docs/install-agent)。

## 连接模式

### WebSocket（推荐）

Agent 主动连接主控端，保持长连接。实时双向通信，支持扫描结果推送。

### HTTP

主控端直接调用 Agent HTTP API。需要 Agent 端口（默认 23889）对主控端可达。

### Pull

Agent 定期从主控端拉取指令。适合 NAT 或防火墙受限环境。

### Auto

自动尝试 WebSocket → HTTP → Pull 回退链，选择最优连接方式。

## Token 管理

每台服务器有两个 Token：

- \- Server Token：Agent 用于连接主控端的凭证
- \- Agent Token：主控端用于调用 Agent API 的凭证

可在服务器详情页重置 Token。重置后 Agent 会通过 WebSocket 自动接收新 Token。

## 服务器状态

| 状态         | 说明                     |
| ------------ | ------------------------ |
| connected    | Agent 已连接，可正常管理 |
| disconnected | Agent 断开连接           |
| pending      | 等待 Agent 首次连接      |

## 服务器流量统计维度

服务管理列表里的「已用流量」与流量配额限额支持两种数据源,在创建或编辑服务器对话框的「服务器流量数据源」选项里切换,默认推荐「系统网卡流量」:

### 系统网卡流量(默认推荐)

由 Agent 从 /proc/net/dev 读取物理网卡 RX + TX 累计,包含所有走该机器的流量 — Xray 转发 + SSH + apt update + 监控/日志上报 + tunnel overhead 等全部计入,跟 VPS 服务商面板的网卡计费口径完全一致。不含 WARP / Tailscale / Docker / wireguard 等虚拟网卡。

### Xray 协议流量

聚合该服务器所有节点的 inbound + outbound 流量(SUM(uplink + downlink)),只统计走 Xray 协议的数据,跟节点视图口径一致。中转 / 转发为主的小机适合此模式 — 系统其它流量基本可以忽略,数字更接近"用户实际消耗"。

切换数据源 = 自动迁移历史,显示数值连续

切换 Xray → 系统时,主控会自动把切换瞬间的 Xray 总累计 + 每日历史 baseline 完整复制到 system 维度;切换瞬间显示的「已用流量」跟切换前 Xray 视角等同,之后系统模式按真实网卡累加,跟 Xray 数据自然分离。反向(系统 → Xray)无需迁移 — Xray 每日快照一直在拍,直接生效。

「流量统计规则」选项(上行 / 下行 / 双向)对两种数据源同样适用 — 两者各自的 RX / TX 都能单选或合计。

节点视图、用户视图、套餐流量阈值断流逻辑永远走 Xray 维度(系统网卡无法拆分到 tag 或 user),不受此选项影响。

## 批量升级 Agent

主控发布新版本后，可在远程服务器管理里对多台服务器批量升级 Agent，无需逐台 SSH 重新执行安装命令。升级过程以流式日志展示进度。

## 分享服务器给其他妙妙屋X

你可以把自己的一台服务器分享给别人的妙妙屋X 主控，让对方也能在其面板里管理该服务器（创建入站、出节点等），而无需把 Agent 令牌直接交出去。

### 分享方（拥有者）

在服务器管理里为该服务器生成一个分享令牌（可带前缀），交给对方。对方的操作会经你的主控代理转发到该服务器。

### 接收方

在「添加服务器」里选择「接入分享的服务器」，填入对方给的分享令牌即可。接入后该服务器会作为一台联邦（federated）服务器出现在你的列表里，状态随拥有方上报刷新；入站 / 节点 / Tunnel 管理等均可用。

主控与 Agent、以及主控之间的联邦通信均走加密通道（密钥协商 + 会话缓存），令牌轮换不影响在线管理。
