---
title: "订阅域名"
description: "单独的订阅域名：只放行订阅与白名单上报，面板里一键配置 HTTPS 反代或复制 Nginx / Caddy 配置"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

订阅域名专门给代理客户端用：拉订阅、上报白名单 IP。配置之后，这个域名上**只放行订阅相关路径，打开面板返回 404**，订阅链接被分享出去也不会暴露面板地址。

## 放行的路径

| 路径                          | 用途                                                                                            |
| ----------------------------- | ----------------------------------------------------------------------------------------------- |
| `/x/*`                        | 短链接、套餐订阅链接                                                                            |
| `/api/clash/subscribe`        | Clash / Mihomo 订阅                                                                             |
| `/api/user/package-subscribe` | 套餐订阅                                                                                        |
| `/api/subscribe`              | 兼容旧版的订阅地址                                                                              |
| `/api/fw/*`                   | 客户端 IP 白名单上报（官方推荐客户端 MeowX 会自动上报，见 [客户端设置](/docs/client-settings)） |
| `/api/secure/cert`、`/api/secure/rpc`、`/api/secure/ws` | 客户端加密接口：普通用户的客户端经订阅域名扫码登录、连实时通道，不必知道主控地址（见 [隐藏主控地址](/docs/domain-hide-master)） |

其余路径一律 404。

:::note[从旧版本升级]
主控 v0.6.4-beta.3 起订阅域名多放行了 `/api/secure/*`。主控自动配置的 Nginx 会提示「Nginx 配置与当前开关不一致」，点 **重新配置 Nginx** 即可；自己维护的反代按下方 [手动配置](#手动配置) 补上。没补之前一切照旧，只是普通用户扫码登录仍会拿到主控域名。
:::

:::tip[想让用户也从这个域名登录面板？]
打开「同时作为用户入口」后，订阅域名还会给普通用户提供面板（登录、订阅、流量、个人设置），但管理页面和管理接口仍然一律 404，管理员也登录不了。见 [用户入口](/docs/domain-user-portal)。
:::

## 在面板里配置

1. 先把订阅域名解析到主控服务器，并在 [证书管理](/docs/certificates) 里准备好覆盖它的证书（泛域名证书也可以）。
2. 打开「系统设置」→「系统」选项卡，在 **订阅域名** 里填写，例如 `https://sub.example.com`，保存。
3. 下方会自动检查：
   - DNS 是否解析到本机。经过 CDN（如 Cloudflare 橙色云）时无法核对源站，会提示你自行确认 CDN 回源到本机。
   - 证书管理里有没有覆盖该域名的证书。
   - 本机 Nginx 是否由主控管理。
4. 主控 HTTPS 是用「部署证书到主控」启用的（Nginx 由主控管理）时，点 **自动配置 Nginx** 即可完成；否则按下方给出的 Nginx 或 Caddy 配置手动添加。

保存订阅域名后，面板、TG Bot 和 TG Mini App 里复制或推送的**所有**订阅地址都会改用它；留空则使用主控地址。

:::note
订阅域名与主控域名相同时，主控的 HTTPS 配置已经覆盖它，无需单独配置。
:::

## 手动配置

自己维护 Nginx 或 Caddy 时，可以直接复制面板给出的配置（域名、端口已经替换好），也可以照下面的示例写。示例假设订阅域名为 `sub.example.com`、主控监听默认端口 `12889`，反代与主控在同一台机器上。

### Nginx

证书放在 `/usr/local/nginx/cert/sub.example.com/` 下（或改成你自己的路径），保存为例如 `/usr/local/nginx/servers/sub.conf`：

```nginx
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;
    server_name sub.example.com;

    ssl_certificate     /usr/local/nginx/cert/sub.example.com/fullchain.pem;
    ssl_certificate_key /usr/local/nginx/cert/sub.example.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    # 只放行订阅相关路径（短链接、订阅接口、客户端 IP 白名单上报），不开放登录页与管理接口
    location ~ ^(?:/x/|/api/fw/|/api/(?:clash/subscribe|user/package-subscribe|subscribe)$) {
        proxy_pass http://127.0.0.1:12889;
        proxy_http_version 1.1;
        proxy_set_header Host               $host;
        proxy_set_header X-Real-IP          $remote_addr;
        proxy_set_header X-Forwarded-For    $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto  https;
        proxy_set_header X-Forwarded-Host   $host;
        proxy_set_header X-Forwarded-Port   $server_port;
        proxy_buffering off;
        proxy_connect_timeout 60s;
        proxy_send_timeout    60s;
        proxy_read_timeout    60s;
    }

    # 客户端加密接口（扫码登录 / 实时通道）：普通用户的客户端经订阅域名连接，不必知道主控地址
    location = /api/secure/ws {
        proxy_pass http://127.0.0.1:12889;
        proxy_http_version 1.1;
        proxy_set_header Upgrade            $http_upgrade;
        proxy_set_header Connection         "upgrade";
        proxy_set_header Host               $host;
        proxy_set_header X-Real-IP          $remote_addr;
        proxy_set_header X-Forwarded-For    $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto  https;
        proxy_buffering off;
        proxy_send_timeout 1h;
        proxy_read_timeout 1h;
    }

    location ~ ^/api/secure/(?:cert|rpc)$ {
        proxy_pass http://127.0.0.1:12889;
        proxy_http_version 1.1;
        proxy_set_header Host               $host;
        proxy_set_header X-Real-IP          $remote_addr;
        proxy_set_header X-Forwarded-For    $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto  https;
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

`X-Real-IP` 不能省：客户端 IP 白名单上报靠它拿到客户端的真实出口 IP，缺了会报「主控看到的是反代/内网地址」。

保存后执行 `/usr/local/nginx/sbin/nginx -t` 检查，再执行 `systemctl reload nginx`。

### Caddy

```caddy
sub.example.com {
    # 只放行订阅相关路径（短链接、订阅接口、客户端 IP 白名单上报）和客户端加密接口
    @subscriptions path /x/* /api/fw/* /api/clash/subscribe /api/user/package-subscribe /api/subscribe /api/secure/cert /api/secure/rpc /api/secure/ws
    handle @subscriptions {
        reverse_proxy 127.0.0.1:12889
    }
    # 其余一律 404
    handle {
        respond 404
    }
}
```

保存后执行 `caddy validate --config /etc/caddy/Caddyfile`，再执行 `systemctl reload caddy`。

### Cloudflare Tunnel

用 Tunnel 发布订阅域名时，在 Cloudflare 侧按路径限制，见 [Cloudflare Tunnel](/docs/cloudflare-tunnel)。

:::note
订阅域名与 [上报域名](/docs/domain-agent) 用同一个域名时，同一个站点里要同时放行两组路径，见 [上报域名 · 与订阅域名共用](/docs/domain-agent#与订阅域名共用一个域名)。
:::

## 同时作为用户入口

卡片下方的 **同时作为用户入口** 开关打开后，这个域名改为整站反代、放行用户面板，上面「只放行订阅路径」的配置不再适用。开关、手动配置与 Cloudflare 设置见 [用户入口](/docs/domain-user-portal)。

## 和「关闭公网访问」一起用

开启 [关闭公网访问](/docs/domain-master#关闭公网访问) 后，订阅域名上的上述路径照常放行，其它路径一律 404。不会跳转到主控域名：跳转的目标地址就是主控域名，等于把它告诉每一个在订阅域名上点开面板的人。
