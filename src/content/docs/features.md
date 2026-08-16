---
title: "核心特性"
description: "妙妙屋X 的主要功能和特性概览"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

### 远程服务器管理

Master-Agent 架构，通过 WebSocket/HTTP/Pull 三种模式管理远程服务器。支持自动重连、Token 轮换、状态监控。

### Xray 服务管理

远程安装/卸载 Xray 和 Nginx，服务启停控制，SSE 流式安装进度展示。

### Xray 入站管理

可视化入站配置向导，支持 VLESS/VMess/Trojan/Shadowsocks/Hysteria2 全协议，TCP/WS/gRPC/XHTTP 传输，TLS/REALITY 安全层。

### 协议矩阵

完整的协议×传输×安全组合支持，自动生成 mihomo/Clash 兼容的节点配置。

### 证书管理

ACME 证书自动申请，支持 Cloudflare/阿里云/腾讯云/Namesilo 等 DNS 提供商，自动部署到远程服务器。

### 套餐管理

流量套餐配置，支持按流量/时间限额，用户绑定套餐。

### 用户管理

多用户管理，角色权限控制，订阅分配，流量统计。

### 订阅生成

支持 Clash/Stash/Shadowrocket/Surge/Loon/QX/SingBox 等 12 种客户端格式。

### 模板系统

V3 模板引擎，灵活的订阅配置模板，支持自定义规则和代理组。

### 自定义规则

自定义 DNS、分流规则、规则集，精细化流量控制。

### Nginx 管理

远程安装/卸载 Nginx，配置文件管理，SSL 证书部署，Stream 端口管理。

### Agent 升级管理

Agent 远程在线升级和卸载，SSE 流式进度展示，无需手动登录服务器。

### 系统监控

远程服务器系统信息（CPU、内存、磁盘），实时网速监控，流量统计与上报。

### 域名延迟探测

批量 TCP 延迟探测（最多 200 域名），16 并发检测，用于节点质量评估。

### 系统设置

外部订阅同步、功能开关（静默模式/短链接/覆写脚本/代理集合等）、Telegram 通知推送、代理组配置同步，所有设置即时生效。

[→ 开始使用妙妙屋X](/docs/quick-start)
