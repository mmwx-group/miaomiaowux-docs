---
title: "Nginx 网站管理"
description: "集中管理 Agent 上由妙妙屋X部署的静态站点与反向代理"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

![服务管理页面](/images/screenshots/doc-xray-servers-page.webp)

## 进入网站管理

打开「服务管理」，在目标服务器的 Agent 下拉菜单选择「网站管理」。系统会扫描妙妙屋X的默认 Nginx servers 目录，并标记每个站点是静态目录还是反向代理；可在同一页面新增或删除。

### 静态网站

填写域名与服务器上的绝对目录。保存前确认 Agent 对目录具有读取权限。

### 反向代理

填写域名及上游地址，例如 127.0.0.1:8080。WebSocket 和常用转发头由模板统一配置。

## 安装与运行环境

未安装 Nginx 时可由 Agent 安装；检测到现有 Nginx 时会复用兼容目录。服务控制按环境自动选择：

- • systemd、OpenRC 或 SysV 服务管理
- • 没有服务管理器时直接使用 nginx 命令启动、重载和停止
- • Docker 镜像内置 Nginx，无需 systemctl

端口与主控保护

添加前会检查 80/443 占用。主控已经启用 HTTPS 时，同机 Agent 不允许开启「偷自己」，避免抢占 443 导致面板失联。删除站点只删除妙妙屋X管理的配置，不会删除静态目录或上游应用。
