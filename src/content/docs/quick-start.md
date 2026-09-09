---
title: "快速开始"
description: "快速部署妙妙屋X并完成基本配置"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

六步跑通妙妙屋X：部署主控 → 添加服务器 → 安装 Xray → 创建入站 → 同步节点 → 生成订阅。想看每一步的完整截图与字段说明，请直接阅读 [新手教程](/docs/tutorial)。

## 1 部署主控

推荐使用一键脚本直接安装主控端(自动创建 systemd 服务,升级/卸载同一条命令搞定):

```
# 一键安装（交互选择本机/Docker 与 SQLite/PostgreSQL 18）
curl -sL https://raw.githubusercontent.com/iluobei/miaomiaowuX/main/install.sh | sudo bash

# 安装完成后访问 http://服务器IP:12889 进入初始化向导
```

安装脚本已负责数据库初始化：SQLite 不安装额外服务；选择 PostgreSQL 会安装 PostgreSQL 18、创建账号并自动写入连接配置。Docker 模式使用 Compose，数据持久化到安装目录。

![初始化向导截图](../../assets/screenshots/tutorial-setup-wizard.webp)

首次访问会进入初始化向导，创建的第一个账号即管理员

更多安装方式请参考 [Docker 安装](/docs/install-docker) 或 [直接安装](/docs/install-direct)

## 2 添加远程服务器

1. 登录主控面板，进入「服务管理」页面
2. 点击「添加服务器」，填写服务器名称、服务器地址（域名或 IP）、选择 Xray 模式
3. 点「生成 Token」，对话框直接给出一键安装命令
4. 在远程服务器上执行该命令部署 Agent（参考 [Agent 部署](/docs/install-agent)）
5. Agent 连接成功后，服务器卡片状态变为「在线」

![添加服务器后的安装命令截图](../../assets/screenshots/add-server-result.webp)

生成 Token 后直接复制安装命令到目标服务器执行即可

## 3 安装 Xray

选择「内联 Xray」模式（PRO）时 Agent 自带 xray-core，安装 Agent 的同时 Xray 就已就绪；选择「外置 Xray」时安装脚本会自动安装独立的 Xray 服务。两种模式的差别见 [内嵌 Xray](/docs/embedded-xray)。

Agent 在线后，服务器卡片上会显示 Xray 运行状态、Nginx 状态与 Agent 版本；点「Xray配置」可以启停 Xray、编辑配置以及管理入站 / 出站 / 路由。

![服务管理页面截图](../../assets/screenshots/servers-list.webp)

服务器卡片：在线状态、内联 Xray、WS 连接、Xray 运行中、Agent 版本

## 4 创建入站

进入「节点管理」→「添加节点」（或「Xray 入站管理」→「添加入站」），使用向导创建代理入站：

1. 选择协议（VLESS / VMess / Trojan / Shadowsocks / Hysteria2 / AnyTLS / Snell / Mieru 等）
2. 选择传输方式（TCP / WebSocket / gRPC / XHTTP）
3. 选择安全层（REALITY / TLS / XTLS-Vision / 无）
4. 简易模式自动生成端口和凭据；专家模式可以逐项修改
5. 点击「提交配置」，入站自动部署到远程服务器

![添加节点向导截图](../../assets/screenshots/nodes-add-vless-reality.webp)

添加节点向导：VLESS + TCP + XTLS-Vision-REALITY，右侧实时预览入站 JSON

详细的协议组合请参考 [协议矩阵](/docs/protocol-matrix)

## 5 同步节点

入站创建成功后，系统会自动将入站同步为节点，出现在「节点管理」列表里。也可以在服务器卡片的「Agent」菜单里手动点「同步节点」。

同步后的节点会自动转换为 mihomo/Clash 兼容的代理配置。

![节点管理页面截图](../../assets/screenshots/nodes-list.webp)

节点管理：入站同步出来的节点带「远程:服务器名」标签

## 6 生成订阅

进入「用户管理」创建用户并绑定套餐，用户即可通过「复制订阅」拿到订阅链接；管理员也可以在「生成订阅」页面勾选节点、选择规则集直接生成一份订阅文件。

![用户管理页面截图](../../assets/screenshots/users-list.webp)

用户管理：每个用户一行，「复制订阅」即该用户的订阅链接

支持 Clash/Stash/Shadowrocket/Surge 等 12 种客户端格式。详见 [生成订阅](/docs/generator)
