---
title: "Telegram 机器人(mmwX-tgbot)"
description: "主控内置的 Telegram Bot 与免登录 Mini App 配置和使用说明。"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

## TGBot 与 Mini App 已内置

无需单独下载 mmwX-tgbot、部署 systemd/Docker 服务、维护配置文件或配置额外的 Nginx 反代。主控负责 Bot 的启动、停止和热重启，Mini App 直接使用主控地址下的 /tg-app。

## 启用与配置

### 1 . 创建 Telegram Bot

在 Telegram 中打开 @BotFather，发送 /newbot 并按提示完成创建，保存得到的 Bot Token。

### 2 . 打开 TGBot 设置

使用管理员账号登录妙妙屋X，进入「系统设置」→「TGBot」。

### 3 . 填写 Bot Token

粘贴 @BotFather 提供的 Token。已保存的 Token 会显示为掩码，保持掩码不变不会覆盖原 Token。

### 4 . 填写管理员 Telegram ID

填写允许使用 /admin\_\* 命令及 Mini App 管理功能的 Telegram 数字 ID；多个 ID 使用英文逗号分隔。

### 5 . 启用并保存

打开 TGBot 开关并保存配置。主控会自动启动或热重启 Bot，页面状态显示「运行中」即表示启动成功。

### 6 . 验证 Bot 与 Mini App

向 Bot 发送 /start 或 /help，确认命令有响应；再从 Bot 菜单打开 Mini App，地址由主控自动设置为 /tg-app。

[查看系统设置完整说明 →](/docs/system-settings)

## 功能一览

### 👤 用户命令

- `/start <code>` — 兑换码注册/绑定
- `/me` — 我的账号信息
- `/sub` — 订阅链接
- `/traffic` — 流量统计
- `/nodes` — 我的节点 + 在线状态
- `/notify` — 通知开关(on/off/status)
- `/unbind` — 解绑 TG(二次确认)

### 🛡️ 管理员命令

- `/admin_invite list` — 列兑换码
- `/admin_invite create` — 按钮交互生成兑换码
- `/admin_invite revoke` — 撤销兑换码
- `/admin_user <username>` — 查指定用户

仅 admin_tg_ids 名单可用,限流 5 次/分。

### 🔔 每日通知

开通后(/notify on)bot 每天 20:00 推送:

- 📊 当日流量概况
- ⏰ 套餐剩 7/3/1 天到期提醒

## Mini App(免登录面板)

Mini App 已合并到主控，地址自动使用「主控地址 + /tg-app」。用户从机器人菜单打开后，通过 Telegram initData 完成身份校验，无需再次输入妙妙屋X用户名和密码。

### 管理员视图

![妙妙屋X Telegram Mini App 管理员界面截图](/images/screenshots/tutorial-step12-miniapp-admin.webp)

管理员在 Mini App 里查看全局概览,以及用户 / 流量 / 兑换码等管理操作。

### 用户视图

![妙妙屋X Telegram Mini App 用户界面截图](/images/screenshots/tutorial-step12-miniapp-user.webp)

普通用户在 Mini App 里查看自己的套餐、已用流量、订阅地址与可用节点。

## 安全提示

Bot Token 等同于机器人的控制凭据，请勿泄露。Mini App 调试预览允许从 URL 读取 initData，仅限本地调试；生产环境开启会带来重放风险，应保持关闭。

## 常见问题

### Bot 不回复怎么办？

确认 TGBot 已启用且状态为「运行中」，重新核对 Bot Token，并确认主控服务器能够访问 Telegram API。修改配置后点击保存，主控会自动重启 Bot。

### 管理员命令提示无权限？

确认当前 Telegram 数字 ID 已加入「管理员 Telegram ID」。多个 ID 必须使用英文逗号分隔，保存后再重试。

### Mini App 无法打开？

确认主控地址使用可公开访问的 HTTPS 域名，且 /tg-app 可以访问。无需再配置旧版的 /app、23088 端口或独立 Nginx 反代。
