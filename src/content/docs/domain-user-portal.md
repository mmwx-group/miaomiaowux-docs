---
title: "用户入口（用户与管理员分开）"
description: "让订阅域名同时作为普通用户的面板入口：用户在这里登录和使用面板，管理页面、管理接口、MCP 与 Agent 接口在这个域名上一律不提供；可选禁止普通用户在主控域名登录，TG Mini App 用户页同步迁过去"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

主控域名默认同时给管理员和普通用户用。把面板地址发给用户，就等于把管理后台的位置也告诉了他们。

**用户入口**把两者分开：[订阅域名](/docs/domain-subscription) 除了订阅链接，还给普通用户提供完整的用户面板（登录、首页、订阅、流量、个人设置等）。但这个域名**永远不提供管理功能**：

- **页面**：管理页面、TG Mini App 管理页、MCP 在用户入口上返回 404。
- **接口**：管理接口、Agent / 子服务器 / 共享服务器的接口返回 404。用户面板只用得到用户那一套接口，拿着管理员的令牌来调用也一样是 404。
- **登录**：管理员账号在用户入口上登录不了，提示和输错密码完全一样，不暴露这个账号是否存在、是不是管理员。

| 域名 | 管理员 | 普通用户 | 订阅链接 |
| --- | --- | --- | --- |
| 主控域名 | ✅ | ✅（开了「禁止普通用户在主控域名登录」后 ❌） | ✅ |
| 订阅域名（未开用户入口） | ❌ 404 | ❌ 404 | ✅ |
| 订阅域名（开了用户入口） | ❌ | ✅ | ✅ |

用户入口的判定只看请求的域名（Host），由主控自己把关；反代上的路径限制只是额外一层。

## 前提条件

- 已配置 [主控地址](/docs/domain-master)。
- 已配置 [订阅域名](/docs/domain-subscription)，并且满足：
  - 是 `https://` 地址：登录和 passkey 都需要安全连接；
  - 是域名，不是 IP；
  - 与主控域名不同：同一个域名就没有「另一个入口」可言。

条件不满足时开关打不开，面板会写明原因。

## 开启

1. 打开「系统设置」→「系统」选项卡，找到 **订阅域名**。
2. 打开 **同时作为用户入口**。成功后下方显示「用户入口：https://sub.example.com」。
3. 用户入口要求反代把**整个站点**转给主控。原来只放行订阅路径的反代配置会让用户面板打不开：
   - 订阅域名是由主控自动配置 Nginx 的：开关打开时会自动改写，不需要手动操作。
   - 页面提示「Nginx 配置与当前开关不一致」：点 **重新配置 Nginx**。
   - 自己维护的 Nginx / Caddy：按下方 [手动配置](#手动配置) 修改。
4. 把用户入口地址发给用户，让他们从这里登录。

:::note
用户入口上的登录页、品牌、主题与主控完全一样，用户看不出区别。区别只在于这里没有任何管理功能。
:::

## 禁止普通用户在主控域名登录

用户入口只挡住了「管理员从用户入口登录」。要反过来让普通用户**只能**从用户入口登录，再打开 **禁止普通用户在主控域名登录**：

- 普通用户在主控域名登录时，会提示「主控域名不接受普通用户登录，请前往用户入口 https://sub.example.com 登录」。
- 管理员不受影响。
- 客户端 App（MeowX 等）的登录不受影响：App 只能连主控域名。
- 需要先开启用户入口；关闭用户入口时，这个开关会被一起关掉，避免普通用户哪里都登录不了。

两个开关都打开后，管理员只在主控域名登录，普通用户只在用户入口登录。

## Telegram Mini App

开启用户入口后，[TG 机器人](/docs/tool-mmwx-tgbot) 的 Mini App 也按身份分开：

| 页面 | 地址 | 谁会打开 |
| --- | --- | --- |
| 用户页 | `https://sub.example.com/tg-app`（用户入口上） | 机器人默认的菜单按钮 |
| 管理页 | `https://panel.example.com/tg-app/admin`（只在主控域名提供） | 配置为管理员的 Telegram 账号，菜单按钮单独指向这里 |

- 走错页时会按身份自动换到对应那一页。
- 用户页上不包含任何管理内容。
- 两个地址都显示在「订阅域名」卡片里。
- 改了开关后机器人会自动重启，更新菜单按钮。

## 手动配置

自己维护反代时，面板的订阅域名卡片里会给出已经填好域名和端口的配置，直接复制即可。下面是示例：订阅域名 `sub.example.com`，主控监听默认端口 `12889`，反代与主控在同一台机器上。

两份配置都是**整站反代给主控**，只在反代这一层先挡掉明显的管理路径。即使这里漏挡了某条路径，主控按域名还有一份完整的白名单，不会暴露管理面。

### Nginx

```nginx
server {
    listen                     443 ssl;
    listen                     [::]:443 ssl;
    http2                      on;
    server_name                sub.example.com;
    ssl_certificate            /usr/local/nginx/cert/sub.example.com.pem;
    ssl_certificate_key        /usr/local/nginx/cert/sub.example.com.key;
    ssl_protocols              TLSv1.2 TLSv1.3;

    # 订阅相关路径(短链接、订阅接口、客户端 IP 白名单上报):关闭缓冲
    location ~ ^(?:/x/|/api/fw/|/api/(?:clash/subscribe|user/package-subscribe|subscribe)$) {
        proxy_pass                          http://127.0.0.1:12889;
        proxy_http_version                  1.1;
        proxy_set_header Host               $host;
        proxy_set_header X-Real-IP          $remote_addr;
        proxy_set_header X-Forwarded-For    $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto  https;
        proxy_set_header X-Forwarded-Host   $host;
        proxy_set_header X-Forwarded-Port   $server_port;
        proxy_buffering                     off;
        proxy_connect_timeout               60s;
        proxy_send_timeout                  60s;
        proxy_read_timeout                  60s;
    }

    # MMWX 用户入口:放行用户面板;管理面先在这里挡一道(主控按域名还有完整白名单)
    location = /api/v3 { return 404; }
    location = /mcp { return 404; }
    location = /tg-app/admin { return 404; }
    location = /api/secure/rpc { return 404; }
    location = /api/secure/ws { return 404; }
    location ^~ /api/admin/ { return 404; }
    location ^~ /mcp/ { return 404; }
    location ^~ /tg-app/admin/ { return 404; }
    location ^~ /api/tg-webapp/admin/ { return 404; }
    location ^~ /api/remote/ { return 404; }
    location ^~ /api/child/ { return 404; }
    location ^~ /api/federation/ { return 404; }
    location ^~ /api/setup/ { return 404; }
    location ^~ /api/xray/ { return 404; }
    location ^~ /api/speedtest/ { return 404; }
    location ^~ /api/user/debug/ { return 404; }

    # 实时推送(WebSocket)
    location = /api/ws/dashboard {
        proxy_pass                          http://127.0.0.1:12889;
        proxy_http_version                  1.1;
        proxy_set_header Upgrade            $http_upgrade;
        proxy_set_header Connection         "upgrade";
        proxy_set_header Host               $host;
        proxy_set_header X-Real-IP          $remote_addr;
        proxy_set_header X-Forwarded-For    $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto  https;
        proxy_set_header X-Forwarded-Host   $host;
        proxy_set_header X-Forwarded-Port   $server_port;
        proxy_buffering                     off;
        proxy_connect_timeout               60s;
        proxy_send_timeout                  1h;
        proxy_read_timeout                  1h;
    }

    # 其余(页面、静态资源、用户接口、登录)交给主控;主控按域名只放行用户面板
    location / {
        proxy_pass                          http://127.0.0.1:12889;
        proxy_http_version                  1.1;
        proxy_set_header Host               $host;
        proxy_set_header X-Real-IP          $remote_addr;
        proxy_set_header X-Forwarded-For    $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto  https;
        proxy_set_header X-Forwarded-Host   $host;
        proxy_set_header X-Forwarded-Port   $server_port;
        client_max_body_size                16m;
        proxy_connect_timeout               60s;
        proxy_send_timeout                  300s;
        proxy_read_timeout                  300s;
    }
}

# 443 上只需要一个 default_server;已经有了就不要重复添加(nginx -t 会报重复)
server {
    listen                     443 ssl default_server;
    listen                     [::]:443 ssl default_server;
    ssl_reject_handshake       on;
}
```

`proxy_set_header Host $host` 不能省：主控靠域名认出这是用户入口，Host 被改成上游地址后，主控会把请求当成从主控入口进来的。

保存后执行 `/usr/local/nginx/sbin/nginx -t` 检查，再执行 `systemctl reload nginx`。

### Caddy

```caddy
sub.example.com {
	# MMWX 用户入口:放行用户面板;管理面先在这里挡一道(主控按域名还有完整白名单)
	@admin path /api/v3 /mcp /tg-app/admin /api/secure/rpc /api/secure/ws /api/admin/* /mcp/* /tg-app/admin/* /api/tg-webapp/admin/* /api/remote/* /api/child/* /api/federation/* /api/setup/* /api/xray/* /api/speedtest/* /api/user/debug/*
	handle @admin {
		respond 404
	}
	handle {
		reverse_proxy 127.0.0.1:12889
	}
}
```

Caddy 的 `reverse_proxy` 默认保留原 Host，也自带 WebSocket 支持。保存后执行 `caddy validate --config /etc/caddy/Caddyfile`，再执行 `systemctl reload caddy`。

### Cloudflare

用户入口走 Cloudflare 时：

1. **DNS**：给订阅域名添加 A / AAAA 记录指向主控，代理状态选「已代理」（橙色云朵）。Cloudflare 回源时保留原 Host，主控据此认出用户入口。
2. **SSL/TLS → 概述**：加密模式选「完全（严格）」，源站放上覆盖该域名的证书（证书管理里申请的证书，或 Cloudflare 的源服务器证书）。
3. **回源端口**：源站不在 443 监听时，在「规则 → Origin Rules」加一条：主机名等于订阅域名 → 目标端口重写为源站端口。
4. **缓存**：不要开「缓存所有内容」。订阅和接口都是按用户返回的，缓存会串号。稳妥起见加一条缓存规则：主机名等于订阅域名且 URI 路径以 `/api/` 开头 → 绕过缓存。
5. **网络 → WebSockets**：保持开启，实时推送要用。

:::danger[不要用 Worker 转发]
Worker 用 `fetch()` 转发到主控域名时，主控看到的 Host 是主控域名，会把请求当成从主控入口进来的。这样用户入口「不提供管理面」的隔离就整个失效了。

让 Worker 额外带一个密钥头来声明「这是用户入口」也不行：Worker 漏带、写错或被改动时，结果都是管理面暴露。DNS 代理按 Host 判定，配错的结果只是打不开。
:::

## 关闭用户入口

关掉「同时作为用户入口」后，订阅域名恢复为只放行订阅路径。

- **主控自动管理的 Nginx**：关闭时会**先**把 Nginx 改回只放行订阅路径，成功后才关开关。如果改 Nginx 失败，开关不会关，并提示原因。这样不会出现「Nginx 还在整站放行、主控已不再按用户入口拦」的空档。
- **自己维护的反代**：要自己把配置改回 [订阅域名](/docs/domain-subscription#手动配置) 里只放行订阅路径的版本。否则关掉开关后，订阅域名上会暴露整个面板，包括管理页面。

## 应急开关

设置了环境变量 `MMWX_FORCE_PUBLIC_ACCESS=1` 并重启主控后，用户入口的全部隔离都会失效（用于被锁在面板外时恢复访问，见 [主控域名](/docs/domain-master)）。处理完记得去掉。

## 常见问题

### 管理员在用户入口上登录，提示用户名或密码错误

这是设计如此：管理员只能在主控域名登录。为了不暴露账号是否存在、是不是管理员，提示与密码错误相同。

### 用户在用户入口上用不了 passkey

passkey 与域名绑定。在主控域名上添加的 passkey，换到用户入口通常用不了。用户用密码在用户入口登录后，在「个人设置」里再添加一个即可。

### 开关打开了，但提示「暂未生效」

按提示的原因处理：订阅地址不是 `https://`、填的是 IP、与主控域名相同，或还没配置主控地址。

### 用户入口打开是 404 或只有订阅能用

反代还是只放行订阅路径的旧配置。点「重新配置 Nginx」，或按上面的 [手动配置](#手动配置) 改成整站反代。
