---
title: "拼车教程"
description: "妙妙屋X 没有使用类似流量狗（端口区分）的流量区分方式，而是使用 xray 原生的「按入站 / 出站 + 用户」三维计量方式。这意味着同一台服务器上同一端口可以被多个用户共用，每个用户的流量按身份（client.email）单独累计，不需要给每个用户单独开一个端口。"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

### 流量计量方式

妙妙屋X 没有使用类似流量狗（端口区分）的流量区分方式，而是使用 xray 原生的「按入站 / 出站 + 用户」三维计量方式。这意味着同一台服务器上同一端口可以被多个用户共用，每个用户的流量按身份（client.email）单独累计，不需要给每个用户单独开一个端口。

### 拼车 4 步走

#### 1\. 服务管理：添加一台服务器

在服务管理页面添加服务器，填写名称、IP、域名等，主控生成配对 Token 后部署 Agent。详见安装 Agent 文档。

![服务管理页面截图](/images/screenshots/doc-xray-servers-page.webp)

服务管理页面 — 服务器以卡片形式展示，含状态 / 实时网速 / 流量 / Xray 一键操作

#### 2\. 节点管理：添加节点

节点既可以由服务器入站自动同步（推荐），也可以手动添加。一个服务器可以同时有多种协议节点（VLESS / Trojan / Shadowsocks / Hysteria2 / AnyTLS 等），它们都可以拼车给同一批用户。

![节点管理页面截图](/images/screenshots/doc-nodes-page.webp)

节点管理 — 按服务器分组列出所有入站节点，支持批量编辑 / 启停 / 同步

#### 3\. 套餐管理：添加套餐 + 选节点

在套餐管理添加套餐，填写流量额度、计量周期、计量方式（单向 / 双向），在右侧勾选这个套餐能用哪些节点（不勾默认全选）。套餐是「权限组」的角色 —— 拼车小组的人共用同一个套餐。

![创建套餐对话框截图](/images/screenshots/tutorial-step9-package-create-dialog.webp)

创建套餐对话框 — 左侧参数 + 右侧关联节点选择

#### 4\. 用户管理：添加用户 + 绑定套餐

在用户管理添加用户，然后点该用户行的「管理套餐」给他绑定第 3 步创建的套餐 + 设到期时间。每多一个拼车用户就重复这一步。

![用户管理页面截图](/images/screenshots/tutorial-step10-users-list.webp)

用户管理 — 列出所有用户及其套餐状态

![管理套餐对话框截图](/images/screenshots/tutorial-step10-bind-package-dialog.webp)

管理套餐对话框 — 选套餐 + 到期时间 + 流量重置周期

提示：每个用户的凭据（如 uuid、password）都是唯一的，由妙妙屋X 在用户获取订阅时自动插入到节点配置中。所以「同一个节点拼给多个用户」不需要任何手工操作，按上述 4 步走完即可，每个用户拿到的订阅里都是自己的专属凭据，流量按用户名单独计。

### 小工具

#### TG Bot & Mini App

把 mmwX-tgbot 接入 Telegram 后，拼车小组成员可以在 Telegram 里直接查账号 / 流量 / 订阅，管理员可以发兑换码续期、按号绑定。Mini App 提供免登录手机面板，比 Web 后台轻便。

完整部署 + 配置教程见 [Telegram 机器人](/docs/tool-mmwx-tgbot)

![TG Bot 管理员视图截图](/images/screenshots/tutorial-step12-miniapp-admin.webp)

管理员视图：兑换码 / 用户绑定 / 流量摘要（手机）

![TG Bot 用户视图截图](/images/screenshots/tutorial-step12-miniapp-user.webp)

普通用户视图：账号 / 流量 / 订阅（手机）

#### OpenClaw & Hermes（MCP）

妙妙屋X 主控内置 MCP（Model Context Protocol）服务，任何兼容 MCP 的 AI Agent（OpenClaw、Hermes Agent、Claude Code、Cursor 等）都可以接入，用自然语言完成节点 / 订阅 / 流量 / 服务器 / 用户 / 套餐运维。例如直接对 Agent 说「给 alice 创建一个 100GB 套餐并绑定」就能自动完成第 3、4 步。

配置方法 + 工具清单 + 安全建议见 [接入 AI Agent（MCP）](/docs/mcp)

![API Token 区截图](/images/screenshots/system-settings-api-token.webp)

系统设置 → API Token：把这里生成的 token 填入 OpenClaw / Hermes 的 mcp_servers 配置即可
