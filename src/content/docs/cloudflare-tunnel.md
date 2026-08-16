---
title: "使用 Cloudflare Tunnel 发布主控"
description: "无需本地证书和入站端口，为主控与订阅域名提供 HTTPS"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

Cloudflare Tunnel 可以通过主控服务器主动建立的出站连接提供 HTTPS。此方案不需要安装 Nginx/Caddy、管理 TLS 证书或开放 80/443 入站端口，并可隐藏源站 IP。

建议配置两个域名：

- `panel.example.com`：转发全部路径，用于管理面板和 Agent WebSocket。
- `sub.example.com`：只转发订阅路径，其他请求返回 404。

:::caution[使用前确认]
域名必须托管在 Cloudflare。面板和订阅流量都会经过 Cloudflare；如果不希望流量经过第三方，请继续使用 [Nginx 或 Caddy](/docs/tutorial#54-推荐使用-nginx-反向代理主控)。
:::

## 1. 限制主控监听地址

### 裸机或 systemd 安装

进入「系统设置 → 系统」，开启「关闭公网访问」，保存后重启主控。该选项会让主控只监听 `127.0.0.1`，必须重启才会生效。

### Docker 安装

不要开启「关闭公网访问」，否则 Docker 端口映射会失效。将端口只绑定到宿主机回环地址：

```bash
docker run ... -p 127.0.0.1:12889:12889 ...
```

Compose 配置：

```yaml
ports:
  - "127.0.0.1:12889:12889"
```

以下配置假设 `cloudflared` 运行在宿主机。如果它也运行在容器内，请将 `127.0.0.1` 改为主控容器在同一 Docker 网络中的地址。

验证本地服务：

```bash
curl -sI http://127.0.0.1:12889/login | head -1
ss -lnt | grep 12889
```

## 2. 创建 Tunnel

1. 打开 Cloudflare Dashboard 的 **Networking → Tunnels**。
2. 选择 **Create Tunnel**，类型使用 Cloudflared。
3. 按页面给出的命令在主控服务器安装并注册 `cloudflared` 服务。
4. 确认 Tunnel 状态变为 **Healthy**。

Dashboard 会提供包含 Tunnel Token 的安装命令。Token 等同凭证，不要写入文档、截图或提交到 Git。

## 3. 添加发布路由

进入 Tunnel 的 **Routes**，添加两条 **Published application** 路由：

| 用途     | Hostname            | Path       | Service URL              |
| -------- | ------------------- | ---------- | ------------------------ |
| 管理面板 | `panel.example.com` | 留空       | `http://127.0.0.1:12889` |
| 订阅     | `sub.example.com`   | 见下方正则 | `http://127.0.0.1:12889` |

订阅域名的 Path：

```regex
^/(x/.*|api/(clash/subscribe|user/package-subscribe|subscribe))$
```

该规则只允许以下端点：

- `/x/*`：短链接和套餐订阅。
- `/api/clash/subscribe`：Clash/Mihomo 订阅。
- `/api/user/package-subscribe`：套餐订阅。
- `/api/subscribe`：兼容订阅端点。

未匹配的路由必须返回 404，不能再添加一条把 `sub.example.com` 全路径转发到主控的规则。

## 4. 使用本地配置文件（可选）

如果使用本地管理的 Tunnel，可在 `~/.cloudflared/config.yml` 配置路由。规则由上到下匹配，404 兜底必须放在最后：

```yaml
tunnel: <TUNNEL_ID>
credentials-file: /root/.cloudflared/<TUNNEL_ID>.json

ingress:
  - hostname: panel.example.com
    service: http://127.0.0.1:12889
  - hostname: sub.example.com
    path: ^/(x/.*|api/(clash/subscribe|user/package-subscribe|subscribe))$
    service: http://127.0.0.1:12889
  - service: http_status:404
```

检查规则并启动服务：

```bash
cloudflared tunnel ingress validate
cloudflared tunnel ingress rule https://sub.example.com/login
sudo systemctl enable --now cloudflared
```

## 5. 更新妙妙屋X设置

进入「系统设置」，填写：

- 主服务器地址：`https://panel.example.com`
- 订阅域名：`https://sub.example.com`

保存后重新生成或复制订阅链接，确认链接使用独立订阅域名。

## 6. 验证

```bash
curl -sI https://sub.example.com/ | head -1
curl -sI https://sub.example.com/login | head -1
curl -sI https://sub.example.com/api/clash/subscribe | head -1
curl -sI https://panel.example.com/login | head -1
```

前两个请求应返回 404；订阅 API 应成功到达主控（未携带参数或鉴权时可以返回 4xx，但不应是 Tunnel 的 404）；面板登录页应正常响应。最后使用一条真实订阅链接在客户端更新一次，确认节点能够下发。

## 安全与排障

- 不要为订阅域名配置全路径转发，否则登录页也会暴露。
- 若出现 `502`，检查主控监听地址、端口以及 `cloudflared` 日志。
- Dashboard 保存域名失败时，检查是否存在同名 A、AAAA 或 CNAME 记录。
- WebSocket 无需额外路由；如果 Agent 无法连接，检查面板域名是否为全路径转发。
- 可以为管理面板叠加 Cloudflare Access；不要为公开订阅域名启用会阻断客户端的交互式登录策略。

本页基于 [社区 Issue #2](https://github.com/mmwx-group/miaomiaowux-docs/issues/2) 的实测方案整理。Cloudflare 操作界面变化时，以 [Cloudflare Tunnel 官方文档](https://developers.cloudflare.com/tunnel/setup/) 为准。
