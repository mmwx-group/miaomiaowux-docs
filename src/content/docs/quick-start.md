---
title: "快速开始"
description: "快速部署妙妙屋X并完成基本配置"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

1

部署主控

2

添加服务器

3

安装 Xray

4

创建入站

5

同步节点

6

生成订阅

## 1 部署主控

推荐使用一键脚本直接安装主控端(自动创建 systemd 服务,升级/卸载同一条命令搞定):

```
# 一键安装（交互选择本机/Docker 与 SQLite/PostgreSQL 18）
curl -sL https://raw.githubusercontent.com/iluobei/miaomiaowuX/main/install.sh | sudo bash

# 安装完成后访问 http://服务器IP:12889 进入初始化向导
```

安装脚本已负责数据库初始化：SQLite 不安装额外服务；选择 PostgreSQL 会安装 PostgreSQL 18、创建账号并自动写入连接配置。Docker 模式使用 Compose，数据持久化到安装目录。

更多安装方式请参考 [Docker 安装](/docs/install-docker) 或 [直接安装](/docs/install-direct)

## 2 添加远程服务器

1. 登录主控面板，进入「服务管理」页面
2. 点击「添加服务器」，填写服务器名称、IP 地址、域名（可选）
3. 系统自动生成连接 Token
4. 在远程服务器上部署 Agent（参考 [Agent 部署](/docs/install-agent)）
5. Agent 连接成功后，服务器状态变为「已连接」

## 3 安装 Xray

在服务管理页面，点击服务器卡片上的「安装 Xray」按钮，系统会通过 Agent 在远程服务器上自动安装 Xray。

安装过程通过 SSE 流式展示进度，安装完成后可选择安装 Nginx（用于 TLS 伪装）。

## 4 创建入站

进入服务器的「入站管理」页面，使用入站向导创建代理入站：

1. 选择协议（VLESS/VMess/Trojan/Shadowsocks/Hysteria2）
2. 选择传输方式（TCP/WebSocket/gRPC/XHTTP）
3. 选择安全层（TLS/REALITY/None）
4. 配置端口和其他参数
5. 点击创建，入站自动部署到远程服务器

详细的协议组合请参考 [协议矩阵](/docs/protocol-matrix)

## 5 同步节点

入站创建成功后，系统会自动将入站同步为节点。也可以在「节点管理」页面手动触发同步。

同步后的节点会自动转换为 mihomo/Clash 兼容的代理配置。

## 6 生成订阅

进入「用户管理」创建用户并分配节点，用户即可通过订阅链接获取代理配置。

支持 Clash/Stash/Shadowrocket/Surge 等 12 种客户端格式。详见 [生成订阅](/docs/generator)
