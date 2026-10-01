---
title: "订阅域名"
description: "单独的订阅域名：只放行订阅与白名单上报，面板里一键配置 HTTPS 反代或复制 Nginx / Caddy 配置"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

订阅域名专门给代理客户端用：拉订阅、上报白名单 IP。配置之后，这个域名上**只放行订阅相关路径，打开面板返回 404**，订阅链接被分享出去也不会暴露面板地址。

## 放行的路径

| 路径 | 用途 |
| --- | --- |
| `/x/*` | 短链接、套餐订阅链接 |
| `/api/clash/subscribe` | Clash / Mihomo 订阅 |
| `/api/user/package-subscribe` | 套餐订阅 |
| `/api/subscribe` | 兼容旧版的订阅地址 |
| `/api/fw/*` | 客户端 IP 白名单上报（官方客户端会自动上报，见 [客户端设置](/docs/client-settings)） |

其余路径一律 404。

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
    # 只放行订阅相关路径（短链接、订阅接口、客户端 IP 白名单上报）
    @subscriptions path /x/* /api/fw/* /api/clash/subscribe /api/user/package-subscribe /api/subscribe
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

## 和「关闭公网访问」一起用

开启 [关闭公网访问](/docs/domain-master#关闭公网访问) 后，订阅域名上的上述路径照常放行，其它路径会被跳转到主控域名。
