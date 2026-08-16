---
title: "Quick Start"
description: "Quickly deploy MiaoMiaoWu X and complete basic configuration"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

1

Deploy Master

2

Add Server

3

Install Xray

4

Create Inbound

5

Sync Nodes

6

Generate Subscription

## 1 Deploy Master

Recommended: install the master directly with the one-click script (sets up a systemd service; the same command handles updates and uninstall):

```
# 一键安装（交互选择本机/Docker 与 SQLite/PostgreSQL 18）
curl -sL https://raw.githubusercontent.com/iluobei/miaomiaowuX/main/install.sh | sudo bash

# 安装完成后访问 http://服务器IP:12889 进入初始化向导
```

安装脚本已负责数据库初始化：SQLite 不安装额外服务；选择 PostgreSQL 会安装 PostgreSQL 18、创建账号并自动写入连接配置。Docker 模式使用 Compose，数据持久化到安装目录。

For more installation methods, see [Docker Installation](/docs/en/install-docker) or [Direct Installation](/docs/en/install-direct)

## 2 Add Remote Server

1. Log in to the master panel, go to the Service Management page
2. Click Add Server, fill in server name, IP address, domain (optional)
3. The system automatically generates a connection Token
4. Deploy Agent on the remote server (see [Agent Deployment](/docs/en/install-agent))
5. After Agent connects successfully, the server status changes to Connected

## 3 Install Xray

On the Service Management page, click the Install Xray button on the server card. The system will automatically install Xray on the remote server via Agent.

The installation progress is displayed via SSE streaming. After installation, you can optionally install Nginx (for TLS camouflage).

## 4 Create Inbound

Go to the server's Inbound Management page and use the inbound wizard to create a proxy inbound:

1. Select protocol (VLESS/VMess/Trojan/Shadowsocks/Hysteria2)
2. Select transport (TCP/WebSocket/gRPC/XHTTP)
3. Select security layer (TLS/REALITY/None)
4. Configure port and other parameters
5. Click create, inbound is automatically deployed to the remote server

For detailed protocol combinations, see [Protocol Matrix](/docs/en/protocol-matrix)

## 5 Sync Nodes

After inbound creation, the system automatically syncs inbounds as nodes. You can also manually trigger sync on the Node Management page.

Synced nodes are automatically converted to mihomo/Clash compatible proxy configurations.

## 6 Generate Subscription

Go to User Management to create users and assign nodes. Users can then obtain proxy configurations via subscription links.

Supports 12 client formats including Clash/Stash/Shadowrocket/Surge. See [Generate Subscription](/docs/en/generator)
