---
title: "主控域名"
description: "主控域名（主服务器地址）的作用、HTTPS 配置方式，以及「关闭公网访问」后的访问规则"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

主控域名是打开面板用的域名，也是整个系统的「主服务器地址」。另外两个域名没有单独配置时，订阅链接和 Agent 通信也都用它。

## 它被用在哪里

在「系统设置」→「系统」选项卡的 **主服务器地址** 里填写，格式是协议 + 域名（或 IP 加端口），例如 `https://panel.example.com`。留空时自动使用当前访问的地址。

保存后它会被用于：

- 添加服务器时生成的 Agent 安装命令，以及 Agent 连回主控的地址（没有配置 [上报域名](/docs/domain-agent) 时）。
- 订阅链接（没有配置 [订阅域名](/docs/domain-subscription) 时）。
- 个人设置里「客户端 IP 白名单」的上报链接。
- Passkey 的 RP ID、证书检测等需要「主控是谁」的地方。

如果你正通过 HTTPS 访问的域名和这里填的不一样，面板会弹窗提示「主控域名不一致」，可以一键改成当前域名。

## 配置 HTTPS

三选一：

| 方式 | 适合 | 说明 |
| --- | --- | --- |
| 证书管理 →「部署证书到主控」 | 大多数情况 | 主控自己安装并管理 Nginx。之后配置订阅域名、上报域名都可以在面板里一键完成 |
| 自己的 Nginx / Caddy | 已有反代、要和其它站点共存 | 按 [部署教程](/docs/tutorial#54-推荐使用-nginx-反向代理主控) 配置；面板给出的订阅域名、上报域名配置可以直接复制 |
| [Cloudflare Tunnel](/docs/cloudflare-tunnel) | 主控没有公网入口、不想开端口 | 由 Cloudflare 提供 HTTPS |

证书的申请和部署见 [证书管理](/docs/certificates)。

## 配置示例

以下示例假设主控域名为 `panel.example.com`、主控监听默认端口 `12889`（改过 `PORT` 的请替换），反代与主控在同一台机器上。主控域名要放行全部路径，并支持 WebSocket（面板实时刷新、未单独配置上报域名时的 Agent 长连接都依赖它）。

### Nginx

证书放在 `/usr/local/nginx/cert/panel.example.com/` 下（或改成你自己的路径），保存为例如 `/usr/local/nginx/servers/panel.conf`：

```nginx
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;
    server_name panel.example.com;

    ssl_certificate     /usr/local/nginx/cert/panel.example.com/fullchain.pem;
    ssl_certificate_key /usr/local/nginx/cert/panel.example.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    # 恢复备份、上传 Logo 等需要较大的请求体
    client_max_body_size 512m;

    location / {
        proxy_pass http://127.0.0.1:12889;
        proxy_http_version 1.1;
        proxy_set_header Host               $host;
        proxy_set_header Upgrade            $http_upgrade;
        proxy_set_header Connection         $http_connection;
        proxy_set_header X-Real-IP          $remote_addr;
        proxy_set_header X-Forwarded-For    $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto  https;
        proxy_connect_timeout 60s;
        proxy_send_timeout    600s;
        proxy_read_timeout    600s;
    }
}

# 拒绝未知域名：443 上只需要一个 default_server，已经有了就不要重复添加
server {
    listen 443 ssl default_server;
    listen [::]:443 ssl default_server;
    ssl_reject_handshake on;
}
```

- `proxy_http_version 1.1` 和 `Upgrade` / `Connection` 两个请求头缺一不可，否则 WebSocket 握手失败。
- `X-Real-IP` / `X-Forwarded-For` 用于登录限流、客户端 IP 白名单等识别真实 IP。反代与主控在同一台机器（或内网）时，主控自动信任这两个头；反代在另一台公网服务器上时，需要把它的 IP 加进环境变量 `MMWX_TRUSTED_PROXIES` 或「可信反代」设置。

保存后执行 `/usr/local/nginx/sbin/nginx -t` 检查，再执行 `systemctl reload nginx`。

### Caddy

Caddy 会自动申请、续期证书，并自动处理 WebSocket 和 `X-Forwarded-*` 请求头。在 `/etc/caddy/Caddyfile` 中加入：

```caddy
panel.example.com {
    reverse_proxy 127.0.0.1:12889
}
```

已有证书时，在站点块中加一行 `tls /path/to/fullchain.pem /path/to/privkey.pem`。保存后执行 `caddy validate --config /etc/caddy/Caddyfile`，再执行 `systemctl reload caddy`。Caddy 只响应写进 Caddyfile 的域名，不需要另加「拒绝未知域名」的站点。

## 关闭公网访问

「系统」选项卡里的 **关闭公网访问** 开启并重启主控后，主控只接受经反向代理进来的请求：

- 主控只监听 `127.0.0.1`，IP + 端口直连会失效。它只适合**同机**反向代理；Docker 端口映射和跨服务器反代都不适用。
- 主服务器地址是 `https://` 时，Host 不是主控域名的请求会被 307 跳转到主控域名。例外：
  - [订阅域名](/docs/domain-subscription) 上的订阅相关路径；
  - [上报域名](/docs/domain-agent) 上的 Agent 通信路径（WebSocket 不能跟随跳转，必须放行）；
  - 来自本机（127.0.0.1）的请求。

:::tip[被关在面板外怎么办]
误配后打不开面板时，给主控设置环境变量 `MMWX_FORCE_PUBLIC_ACCESS=1` 并重启，会临时恢复公网监听并跳过上述跳转，进去改回设置后再去掉这个变量。
:::
