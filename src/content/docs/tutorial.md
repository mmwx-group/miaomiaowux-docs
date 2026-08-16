---
title: "新手教程"
description: "从零开始部署妙妙屋X完整指南"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

1

安装前准备

2

DNS 解析

3

安装主控

4

初始化

5

HTTPS

6

添加服务器

7

安装 Agent

8

添加节点

9

创建套餐

10

绑定套餐

11

流量信息

12

小工具

不建议使用“偷自己”方式部署主控

主控与 REALITY 偷自己共用 443 端口会增加链路复杂度和排障成本。推荐让 Nginx 直接反向代理主控，并为订阅使用单独域名；偷自己更适合普通 Agent 节点。

## 1 安装前准备

开始之前，请确保你已准备好以下资源：

| 项目   | 数量                                        |
| ------ | ------------------------------------------- |
| 域名   | 1 个（主控域名）（如需使用 REALITY 偷自己） |
| 服务器 | 1 台                                        |

如果需要使用 REALITY 偷自己功能，必须准备一个域名用于偷自己的目标网站，这个网站可以是妙妙屋X。

## 2 添加 DNS 解析

### 主控域名（必须）

为妙妙屋X主控添加一个域名解析，例如 mmwx.example.com，将 example.com 替换为你的实际域名。

### 服务器域名（建议）

建议为每台服务器添加独立域名，例如 jp.example.com、us.example.com。

## 3 安装妙妙屋X

在服务器上执行一键安装脚本：

```
curl -sL https://raw.githubusercontent.com/iluobei/miaomiaowuX/main/install.sh | sudo bash
```

更多安装方式请参考 [Docker 安装](/docs/install-docker) 或 [直接安装](/docs/install-direct)

## 4 初始化

浏览器访问主控面板：

```
http://mmwx.example.com:12889
```

输入用户名、密码完成注册，域名填写第 2 步中添加的主控域名（如 mmwx.example.com）。

![初始化向导截图](/images/screenshots/tutorial-step4-setup-wizard.webp)

首次启动的初始化向导，创建管理员账号

## 5 开启 HTTPS

### 5.1 配置 DNS 服务商

1. 点击「证书管理」→「DNS 提供商」→「添加提供商」
2. 填写 DNS 服务商名称，选择服务商类型
3. 填写 API Key / API Secret（不同服务商所需字段不同）

### 5.2 申请证书

点击「证书列表」→「申请证书」，按以下参数填写：

![证书管理页面截图](/images/screenshots/tutorial-step5-certificates-list.webp)

证书管理页面，列出已申请的证书

![申请证书对话框截图](/images/screenshots/tutorial-step5-apply-cert-dialog.webp)

申请证书对话框，填写域名、邮箱、DNS 提供商等

| 输入项     | 填写内容           | 备注                      |
| ---------- | ------------------ | ------------------------- |
| 域名       | `*.example.com`    | 申请通配符证书            |
| 邮箱       | 你的邮箱           | 用于证书通知              |
| CA 提供商  | Let's Encrypt      | 默认选项                  |
| 目标服务器 | Master             | 默认即可                  |
| 验证方式   | DNS-01             | 通配符证书必须使用 DNS-01 |
| DNS 提供商 | 选择已添加的提供商 |                           |
| 自动续期   | 开启               | 默认开启                  |
| 自动部署   | 关闭               | 开启后续期自动重新部署    |

填写完成后点击「申请」，等待申请成功。

### 5.3 部署证书

仅一键安装的妙妙屋X可以自动配置 HTTPS。Docker 安装请自行安装 Nginx 等工具管理主控 HTTPS，跳过此步并查看 5.4 章节。

申请成功后，顶部弹出提示框，点击「部署证书到主控」即可开启 HTTPS。也可在证书列表中手动点击部署。

部署过程中会安装 Nginx，视服务器性能与网络情况需等待一段时间。

### 5.4 推荐：使用 Nginx 反向代理主控

为主控域名和订阅域名分别配置 HTTPS：主控域名反代完整面板，订阅域名只允许订阅相关路径，其余请求统一返回 404。请先确保两个域名均已解析到主控服务器，并准备对应证书。

#### 安装 Nginx

```
curl -fsSL https://raw.githubusercontent.com/iluobei/miaomiaowuX/main/install-nginx.sh | bash
```

使用妙妙屋X主控仓库提供的一键脚本安装。默认安装目录为 /usr/local/nginx，额外的 server 配置可放在 /usr/local/nginx/servers/。

#### 从主控下载并放置证书

进入主控的「证书管理」，找到对应域名的证书并点击下载。解压下载的压缩包后会得到以下两个文件：

- `fullchain.pem`: 域名证书及完整证书链。
- `privkey.pem`: 证书私钥，请勿公开或发送给他人。

每个域名单独使用一个目录。以下示例先把两个文件上传到主控服务器，再放入 /usr/local/nginx/cert/{domain}/；请将 {server_ip} 和 {domain} 替换为实际值。订阅域名也需要重复此步骤。

```
# 先在本地执行，将解压后的证书上传到主控服务器
scp fullchain.pem privkey.pem root@{server_ip}:/tmp/

# 再登录主控服务器执行；将 {domain} 替换为对应域名
sudo mkdir -p /usr/local/nginx/cert/{domain}
sudo cp /tmp/fullchain.pem /usr/local/nginx/cert/{domain}/fullchain.pem
sudo cp /tmp/privkey.pem /usr/local/nginx/cert/{domain}/privkey.pem
sudo chmod 644 /usr/local/nginx/cert/{domain}/fullchain.pem
sudo chmod 600 /usr/local/nginx/cert/{domain}/privkey.pem
```

#### 主控域名配置

将 {domain} 替换为主控域名，并确认对应目录中已存在 fullchain.pem 和 privkey.pem。保存为例如 /usr/local/nginx/servers/master.conf。

```
server {
    listen 443;
    #listen 443 quic;
    listen [::]:443;
    #listen [::]:443 quic;
    http2 on;
    server_name {domain};

    ssl_certificate /usr/local/nginx/cert/{domain}/fullchain.pem;
    ssl_certificate_key /usr/local/nginx/cert/{domain}/privkey.pem;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE:ECDH:AES:HIGH:!NULL:!aNULL:!MD5:!ADH:!RC4;
    ssl_prefer_server_ciphers on;
    error_page 497 https://$host:443$1;
    #add_header Alt-Svc 'h3=":443"; ma=2592000,h3-29=":443"; ma=2592000';
    ssl_protocols TLSv1 TLSv1.1 TLSv1.2;

    location / {
        proxy_ssl_server_name on;
        proxy_set_header Host $host;
        client_max_body_size 512M;
        proxy_set_header Connection $http_connection;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_pass http://127.0.0.1:12889;
    }

    proxy_read_timeout 600s;
    proxy_connect_timeout 600s;
}
```

#### 独立订阅域名配置

将 {domain} 替换为独立订阅域名，并确认已将该域名的证书放入对应目录。此配置只放行短链接和订阅 API，不开放管理面板。

```
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;

    server_name {domain};

    ssl_certificate /usr/local/nginx/cert/{domain}/fullchain.pem;
    ssl_certificate_key /usr/local/nginx/cert/{domain}/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    # Allowed endpoints:
    #   /x/{code}                    short links and package subscription links
    #   /api/clash/subscribe         direct Clash/Mihomo subscriptions
    #   /api/user/package-subscribe  direct package subscriptions
    #   /api/subscribe               compatibility endpoint
    location ~ ^(?:/x/|/api/(?:clash/subscribe|user/package-subscribe|subscribe)$) {
        proxy_pass http://127.0.0.1:12889;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
        proxy_buffering off;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    location / {
        return 404;
    }
}
```

配置完成后，必须前往 [系统设置](/docs/system-settings)，在主服务器地址区域填写完整的订阅域名（例如 https://sub.example.com），否则系统生成的订阅链接仍会使用主控域名。

最后执行 /usr/local/nginx/sbin/nginx -t 检查配置，再运行 systemctl reload nginx 重新加载。

### 5.5 可选：使用 Caddy 反向代理主控

Caddy 会自动申请和续期 HTTPS 证书，并自动处理 WebSocket 与常用转发请求头。请确保两个域名均已解析到主控服务器，且 80、443 端口可访问。

#### 安装 Caddy

以下命令使用 Caddy 官方 Debian/Ubuntu 稳定版软件源；安装完成后会创建并启动 caddy systemd 服务。

```
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo chmod o+r /usr/share/keyrings/caddy-stable-archive-keyring.gpg
sudo chmod o+r /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy
```

#### 配置 /etc/caddy/Caddyfile

将 {master_domain} 和 {subscription_domain} 替换为实际域名。主控域名开放完整面板；订阅域名只放行短链接和订阅 API，其他请求返回 404。

```
{master_domain} {
    reverse_proxy 127.0.0.1:12889
}

{subscription_domain} {
    @subscriptions {
        path /x/* /api/clash/subscribe /api/user/package-subscribe /api/subscribe
    }

    handle @subscriptions {
        reverse_proxy 127.0.0.1:12889
    }

    handle {
        respond 404
    }
}
```

默认无需填写证书路径。Caddy 会自动申请并续期证书；如需使用已有证书，可在对应站点块中添加 tls /绝对路径/cert.pem /绝对路径/key.pem。

使用独立订阅域名时，同样必须前往 [系统设置](/docs/system-settings)填写完整订阅域名，否则生成的订阅链接仍会使用主控域名。

保存 Caddyfile 后，先验证配置，再重新加载服务：

```
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

建议在「系统设置」的「系统」选项卡中开启「禁止公网访问」。

### 5.6 可选：使用 Cloudflare Tunnel 直接提供 HTTPS

如果域名已托管到 Cloudflare，可以通过 Tunnel 发布主控，无需安装 Nginx/Caddy、申请证书或开放 80/443 入站端口。建议分别使用面板域名和订阅域名，并在 Cloudflare 侧限制订阅域名只能访问订阅路径。

完整配置步骤、Docker 注意事项和验证命令请参阅 [使用 Cloudflare Tunnel 发布主控](/docs/cloudflare-tunnel)。

## 6 添加服务器

本示例中我们将妙妙屋X主控服务器同时作为 Agent 服务器接入。

点击「服务管理」→「添加服务器」，按以下参数填写：

| 输入项            | 填写内容                | 备注                           |
| ----------------- | ----------------------- | ------------------------------ |
| 服务器名称        | 自定义名称              |                                |
| 服务器地址        | 域名或 IP               |                                |
| 流量限制          | 服务器月流量            |                                |
| 已用流量          | 服务器已用流量          |                                |
| 重置日期          | 流量重置日期            |                                |
| 我要偷自己        | 是否开启 REALITY 偷自己 | 默认关闭，开启前需准备一个域名 |
| 前置选择          | Xray                    | 目前仅支持 Xray                |
| 部署模式          | Tunnel / Fallback       | 默认 Tunnel 模式               |
| 使用 443 端口部署 | 443                     | 默认无法修改                   |
| 域名              | 偷自己的服务域名        | 如 steal.example.com           |
| 网站类型          | 静态页面 / 反向代理     |                                |
| 静态页面          | 静态页面路径            |                                |
| 反向代理          | 反向代理地址            |                                |

使用 443 端口部署时，请确保服务器的 443 端口没有被其他程序占用。

无需担心无法部署其他服务，点击「Agent 管理」→「添加网站」即可复用 443 端口部署其他服务。

开启「我要偷自己」时，必须提前准备好一个域名并解析到该服务器，用于填写下方的「域名」字段。该域名将作为 REALITY 偷自己的目标网站。

![服务管理页面截图](/images/screenshots/tutorial-step6-servers-list.webp)

服务管理页面，已添加的服务器以卡片形式展示

### 6.1 Agent 偷自己

注意：妙妙屋X主控部署 HTTPS 后会占用 443 端口，因此不要为安装在主控服务器上的 Agent 开启「偷自己」。

添加 Agent 服务器时开启「偷自己」。以 Tunnel 模式为例，填写以下配置：

- 域名：准备部署的服务域名
- 网站类型：反向代理或静态页面
- 反向代理地址：127.0.0.1:8080（例如反代本机 8080 端口）；静态页面目录：/usr/local/nginx/html（主机上的静态资源目录）

配置完成后进入下一步，安装 Agent。

## 7 安装 Agent

1. 在服务器卡片中点击「生成 Token」
2. 复制底部的一键安装命令
3. 在目标服务器上运行该命令，等待安装完成
4. 安装成功后，服务器卡片名称后会显示「已连接」

详细说明请参考 [Agent 部署](/docs/install-agent)

Agent 安装完成后会自动配置 tunnel-in 入站，并分流到添加的部署服务域名。此时使用 https://部署的服务域名 即可访问部署的服务。

## 8 添加节点

偷自己场景请添加一个 VLESS REALITY Vision 节点。

点击「节点管理」→「添加节点」，选择服务器后填写以下参数：

### 开启偷自己后的首个 Reality 节点

首个 Reality 节点会强制使用 443 端口，并自动选择已部署的网站作为 dest。

创建节点时看到的端口可能不是 443，因为偷自己使用的是 tunnel-in 入站的 settings.port，默认值为 46174，无需关注。添加完成后再按下方步骤检查节点。

| 输入项       | 填写内容           | 备注                 |
| ------------ | ------------------ | -------------------- |
| 协议类型     | 自行选择           |                      |
| 节点名称     | 显示在列表中的名称 |                      |
| REALITY 域名 | 默认为偷自己的域名 | 也可自行填写其他域名 |
| 选择用户     | 选择已存在的用户   |                      |

点击保存后，节点会出现在节点管理列表中，用户即可通过订阅链接使用。

![节点管理页面截图](/images/screenshots/tutorial-step8-nodes-list.webp)

节点管理页面，列出所有入站及其状态

### 节点检查

添加完成后，确认节点管理中该节点的端口为 443，并通过浏览器访问 https://部署的服务域名；能够正常打开已部署的网站即表示配置成功。

## 9 创建套餐

进入「套餐管理」页面，点击「创建套餐模板」可设置流量额度、计量周期、计量方式（单向/双向）、限速、设备数限制，并在右侧勾选套餐包含的节点和设置节点倍率。

![套餐管理页面截图](/images/screenshots/tutorial-step9-packages-list.webp)

套餐管理页面，已创建的套餐以卡片形式展示

![创建套餐对话框截图](/images/screenshots/tutorial-step9-package-create-dialog.webp)

创建套餐模板对话框，左侧为套餐参数、右侧为关联节点选择

## 10 绑定套餐

进入「用户管理」页面，在目标用户行的操作菜单里点「管理套餐」，选择已创建的套餐并设置到期时间，用户保存后即获得套餐内节点的访问权限。

![用户管理页面截图](/images/screenshots/tutorial-step10-users-list.webp)

用户管理页面，列出所有用户及其套餐状态

![管理套餐对话框截图](/images/screenshots/tutorial-step10-bind-package-dialog.webp)

管理套餐对话框，选择套餐 + 到期时间 + 流量重置周期

## 11 流量信息

点击「流量信息」页面，可以从用户、节点、服务器三个维度查看流量使用情况。

### 用户视图

查看所有用户的已用流量信息；点击用户名展开，展示该用户在每个节点下的已用流量。

![用户视图截图](/images/screenshots/tutorial-step11-user-view.webp)

按用户周期流量排序，点击用户名展开节点维度细分

### 节点视图

查看每个节点的已用流量信息；点击节点名称展开，展示该节点下每个用户的已用流量。

![节点视图截图](/images/screenshots/tutorial-step11-node-view.webp)

按节点周期流量排序，点击节点名称展开用户维度细分

### 服务器视图

查看每台服务器当前的实时网速、已用流量、剩余流量和使用率。

![服务器视图截图](/images/screenshots/tutorial-step11-server-view.webp)

服务器维度的网速 / 已用 / 总量 / 剩余 / 使用率概览

## 12 小工具（TG Bot & MiniApp）

在 Telegram 机器人内管理用户与套餐绑定。机器人提供命令交互、每日通知和免登录 Mini App 面板。

详见「系统设置」→「TG Bot」。

### 管理员视图（Mini App）

![TG MiniApp 管理员视图截图](/images/screenshots/tutorial-step12-miniapp-admin.webp)

管理员视图：含账号 / 流量 / 订阅 / 兑换码（手机分辨率）

### 用户视图（Mini App）

![TG MiniApp 用户视图截图](/images/screenshots/tutorial-step12-miniapp-user.webp)

普通用户视图：仅含本人账号 / 流量 / 订阅
