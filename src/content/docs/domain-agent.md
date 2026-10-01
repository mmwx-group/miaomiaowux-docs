---
title: "上报域名（Agent 通信地址）"
description: "给 Agent 单独设置连回主控的地址：只放行 Agent 通信，按「检查 → 单台测试 → 全部切换」安全迁移整个机群"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

上报域名在面板里叫 **Agent 通信地址**，是各台服务器上的 Agent 连回主控用的地址：WebSocket 长连接、心跳、流量上报、配置推送的回包和安装脚本都走它。

单独设置之后：

- 这个域名**只接受 Agent 通信**（`/api/remote/*`，含 WebSocket），打开面板返回 404，也不会跳转（跳转会把面板域名告诉对方）。
- 面板域名不再出现在 Agent 上；以后更换面板域名也不用动 Agent。
- 面板域名照样接受 Agent 通信，作为离线 Agent、老版本 Agent 和切换出问题时的退路。

留空时与主控地址相同。

## 为什么要分三步切换

这个地址一旦配错，**整个机群会同时失联**。所以面板不会「保存即下发」，而是按三步走：

### ① 检查

在「系统设置」→「系统」→ **Agent 通信地址** 填入新地址（格式 `https://agent.example.com`，也可以是 `http://IP:端口`），点 **检查**：

- DNS 必须解析到本机（或认得出的 CDN）。
- 面板会显示这个域名的 HTTPS 反代状态：本机 Nginx 由主控管理时可以 **一键配置**；否则复制下方的 Nginx / Caddy 配置手动添加。配置只放行 `/api/remote/`（含 WebSocket），其余请求返回 404，Nginx 配置含拒绝未知域名的兜底。

### ② 单台测试

选一台在线的服务器，点 **用这台测试**。主控先让这台 Agent 带认证地探测新地址，再真的切过去，等它从新地址连回来（主控看得到它连接时用的域名）才算通过，最多等 90 秒。

**没连回来会自动改回原地址**，不影响这台服务器继续工作。与主控同机的 Agent 和联邦服务器不参与测试；确实没有可测试的在线 Agent 时可以确认跳过。

### ③ 切换全部 Agent

单台测试通过后 30 分钟内，点 **切换全部 Agent 并保存**。其余在线 Agent 逐台「先探测、再切换」，结果分别显示：

| 结果 | 含义 |
| --- | --- |
| 已切换 | 已改用新地址 |
| 保留原地址 | 这台访问不了新地址，继续用原地址（不影响使用） |
| 离线，回来后自动切换 | 当前离线，重新连上主控时自动下发新地址 |

全部处理完才会保存设置。

## 改回去

点 **改回与主控地址相同**，Agent 会改回使用主控地址。主控地址本来就在用，不需要再检查 DNS。

## 配置示例

在「检查」那一步面板会给出替换好域名和端口的配置，复制即可；也可以照下面的示例写。示例假设上报域名为 `agent.example.com`、主控监听默认端口 `12889`，反代与主控在同一台机器上。

### Nginx

证书放在 `/usr/local/nginx/cert/agent.example.com/` 下（或改成你自己的路径），保存为例如 `/usr/local/nginx/servers/agent.conf`：

```nginx
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;
    server_name agent.example.com;

    ssl_certificate     /usr/local/nginx/cert/agent.example.com/fullchain.pem;
    ssl_certificate_key /usr/local/nginx/cert/agent.example.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    # Agent 长连接（WebSocket）：要转发 Upgrade，读写超时放长，避免空闲时段被砍断
    location = /api/remote/ws {
        proxy_pass http://127.0.0.1:12889;
        proxy_http_version 1.1;
        proxy_set_header Upgrade            $http_upgrade;
        proxy_set_header Connection         "upgrade";
        proxy_set_header Host               $host;
        proxy_set_header X-Real-IP          $remote_addr;
        proxy_set_header X-Forwarded-For    $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto  https;
        proxy_buffering off;
        proxy_connect_timeout 60s;
        proxy_send_timeout    1h;
        proxy_read_timeout    1h;
    }

    # Agent 的 HTTP 上报 / 心跳 / 安装脚本
    location ^~ /api/remote/ {
        proxy_pass http://127.0.0.1:12889;
        proxy_http_version 1.1;
        proxy_set_header Host               $host;
        proxy_set_header X-Real-IP          $remote_addr;
        proxy_set_header X-Forwarded-For    $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto  https;
        proxy_buffering off;
        proxy_connect_timeout 60s;
        proxy_send_timeout    120s;
        proxy_read_timeout    120s;
    }

    location / {
        return 404;
    }
}

# 拒绝未知域名：443 上只需要一个 default_server，已经有了就不要重复添加
server {
    listen 443 ssl default_server;
    listen [::]:443 ssl default_server;
    ssl_reject_handshake on;
}
```

保存后执行 `/usr/local/nginx/sbin/nginx -t` 检查，再执行 `systemctl reload nginx`。

### Caddy

Caddy 的 `reverse_proxy` 自带 WebSocket 支持，长连接不会被超时砍断：

```caddy
agent.example.com {
    # Agent 通信（WebSocket 长连接 + HTTP 上报）
    @agent path /api/remote/*
    handle @agent {
        reverse_proxy 127.0.0.1:12889
    }
    # 其余一律 404
    handle {
        respond 404
    }
}
```

保存后执行 `caddy validate --config /etc/caddy/Caddyfile`，再执行 `systemctl reload caddy`。

### 与订阅域名共用一个域名

同一个 `server_name` 只能有一个 server 块，所以两组路径要写在同一个站点里。

Nginx：把 [订阅域名示例](/docs/domain-subscription#nginx) 中订阅路径的 `location ~ ...` 段，和上面两段 `/api/remote/` 的 location 放进同一个 server 块，最后保留 `location / { return 404; }`。

Caddy：

```caddy
edge.example.com {
    @subscriptions path /x/* /api/fw/* /api/clash/subscribe /api/user/package-subscribe /api/subscribe
    handle @subscriptions {
        reverse_proxy 127.0.0.1:12889
    }
    @agent path /api/remote/*
    handle @agent {
        reverse_proxy 127.0.0.1:12889
    }
    handle {
        respond 404
    }
}
```

## 注意事项

- 上报域名可以和订阅域名用同一个域名：两类路径都会放行，面板仍然 404。
- 经过 Cloudflare 等 CDN 时，确认 CDN 允许 WebSocket（Cloudflare 默认允许）。
- 开启 [关闭公网访问](/docs/domain-master#关闭公网访问) 后，上报域名上的 Agent 通信照常放行（WebSocket 不能跟随跳转），其它路径 404。
