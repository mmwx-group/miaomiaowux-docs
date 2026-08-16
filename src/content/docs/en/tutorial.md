---
title: "Beginner Tutorial"
description: "Complete guide to deploying MiaoMiaoWu X from scratch"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

1

Preparation

2

DNS Resolution

3

Install Master

4

Initialize

5

HTTPS

6

Add Server

7

Install Agent

8

Add Node

9

Create Package

10

Bind Package

11

Traffic Info

12

Tools

Steal Yourself is not recommended for the master

Sharing port 443 between the master and REALITY Steal Yourself increases routing complexity and troubleshooting cost. Prefer a direct Nginx reverse proxy for the master with a separate subscription domain; Steal Yourself is better suited to regular Agent nodes.

## 1 Preparation

Before starting, make sure you have the following resources ready:

| Item   | Quantity                                        |
| ------ | ----------------------------------------------- |
| Domain | 1 (master domain) (if using REALITY steal-self) |
| Server | 1                                               |

If you need to use the REALITY steal-self feature, you must prepare a domain for the steal-self target website. This website can be MiaoMiaoWu X.

## 2 Add DNS Resolution

### Master Domain (Required)

Add a DNS resolution for the MiaoMiaoWu X master, e.g., mmwx.example.com, replacing example.com with your actual domain.

### Server Domain (Recommended)

It's recommended to add independent domains for each server, e.g., jp.example.com, us.example.com.

## 3 Install MiaoMiaoWu X

Run the one-click install script on the server:

```
curl -sL https://raw.githubusercontent.com/iluobei/miaomiaowuX/main/install.sh | sudo bash
```

For more installation methods, see [Docker Installation](/docs/en/install-docker) or [Direct Installation](/docs/en/install-direct)

## 4 Initialize

Access the master panel in your browser:

```
http://mmwx.example.com:12889
```

Enter username and password to complete registration. For domain, enter the master domain added in step 2 (e.g., mmwx.example.com).

![Initialization wizard screenshot](/images/screenshots/tutorial-step4-setup-wizard.webp)

First-launch initialization wizard for creating the admin account

## 5 Enable HTTPS

### 5.1 Configure DNS Provider

1. Click Certificate Management -> DNS Providers -> Add Provider
2. Enter DNS provider name, select provider type
3. Enter API Key / API Secret (required fields vary by provider)

### 5.2 Apply for Certificate

Click Certificate List -> Apply Certificate, fill in the following:

![Certificate management page screenshot](/images/screenshots/tutorial-step5-certificates-list.webp)

Certificate management page, listing applied certificates

![Apply certificate dialog screenshot](/images/screenshots/tutorial-step5-apply-cert-dialog.webp)

Apply certificate dialog — fill in domain, email, DNS provider, etc.

| Input               | Content               | Note                                   |
| ------------------- | --------------------- | -------------------------------------- |
| Domain              | `*.example.com`       | Apply for wildcard certificate         |
| Email               | Your email            | For certificate notifications          |
| CA Provider         | Let's Encrypt         | Default option                         |
| Target Server       | Master                | Default is fine                        |
| Verification Method | DNS-01                | Wildcard certificates must use DNS-01  |
| DNS Provider        | Select added provider |                                        |
| Auto Renew          | Enabled               | Enabled by default                     |
| Auto Deploy         | Disabled              | When enabled, auto-redeploy on renewal |

After filling in, click Apply and wait for success.

### 5.3 Deploy Certificate

Only a one-click installation can configure HTTPS automatically. For Docker installations, install Nginx or a similar tool to manage master HTTPS yourself; skip this step and see section 5.4.

After successful application, a prompt appears at the top. Click Deploy Certificate to Master to enable HTTPS. You can also manually click deploy in the certificate list.

Nginx will be installed during deployment. Wait time depends on server performance and network conditions.

### 5.4 Recommended: reverse-proxy the master with Nginx

Configure HTTPS separately for the master and subscription domains. The master domain proxies the full panel, while the subscription domain permits only subscription paths and returns 404 elsewhere. Point both domains to the master server and prepare their certificates first.

#### Install Nginx

```
curl -fsSL https://raw.githubusercontent.com/iluobei/miaomiaowuX/main/install-nginx.sh | bash
```

Use the one-click script from the MiaoMiaoWu X master repository. It installs to /usr/local/nginx by default; additional server blocks can be placed in /usr/local/nginx/servers/.

#### Download and place certificates from the master

Open Certificate Management on the master, locate the certificate for the domain, and click Download. Extract the downloaded archive to obtain these two files:

- `fullchain.pem`: the domain certificate and complete certificate chain.
- `privkey.pem`: the certificate private key; never publish it or send it to others.

Use a separate directory for each domain. The example below uploads both files to the master server and places them under /usr/local/nginx/cert/{domain}/. Replace {server_ip} and {domain} with actual values. Repeat this process for the subscription domain.

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

#### Master domain configuration

Replace {domain} with the master domain and confirm that fullchain.pem and privkey.pem exist in its directory. Save this as, for example, /usr/local/nginx/servers/master.conf.

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

#### Separate subscription domain

Replace {domain} with the subscription domain and confirm that its certificate files are in the corresponding directory. This server exposes only short links and subscription APIs, not the administration panel.

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

After configuring Nginx, open [System Settings](/docs/en/system-settings) and enter the full subscription domain in the master address section (for example, https://sub.example.com). Otherwise generated links will continue using the master domain.

Finally, run /usr/local/nginx/sbin/nginx -t to validate the configuration, then systemctl reload nginx to reload it.

### 5.5 Optional: reverse-proxy the master with Caddy

Caddy automatically obtains and renews HTTPS certificates and handles WebSocket connections and common forwarding headers. Point both domains to the master server and ensure ports 80 and 443 are reachable.

#### Install Caddy

These commands use Caddy's official stable Debian/Ubuntu repository. The package creates and starts the caddy systemd service.

```
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo chmod o+r /usr/share/keyrings/caddy-stable-archive-keyring.gpg
sudo chmod o+r /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy
```

#### Configure /etc/caddy/Caddyfile

Replace {master_domain} and {subscription_domain} with the actual domains. The master domain exposes the full panel; the subscription domain permits only short links and subscription APIs and returns 404 elsewhere.

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

Certificate paths are not required by default: Caddy obtains and renews certificates automatically. To use existing certificates, add tls /absolute/path/cert.pem /absolute/path/key.pem to the relevant site block.

When using a separate subscription domain, you must also open [System Settings](/docs/en/system-settings) and enter its full URL. Otherwise generated subscription links will continue using the master domain.

After saving the Caddyfile, validate it and reload the service:

```
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

We recommend enabling Block Public Network Access under System Settings → System.

### 5.6 Optional: provide HTTPS with Cloudflare Tunnel

If your domain is managed by Cloudflare, Tunnel can publish the master without installing Nginx/Caddy, managing certificates, or opening inbound ports 80 and 443. Use separate panel and subscription domains, and restrict the subscription domain to subscription paths at the Cloudflare edge.

See [Publish the master with Cloudflare Tunnel](/docs/en/cloudflare-tunnel) for complete setup steps, Docker notes, and verification commands.

## 6 Add Server

In this example, we use the MiaoMiaoWu X master server simultaneously as an Agent server.

Click Service Management -> Add Server, fill in the following:

| Input              | Content                     | Note                                                   |
| ------------------ | --------------------------- | ------------------------------------------------------ |
| Server Name        | Custom name                 |                                                        |
| Server Address     | Domain or IP                |                                                        |
| Traffic Limit      | Server monthly traffic      |                                                        |
| Used Traffic       | Server used traffic         |                                                        |
| Reset Date         | Traffic reset date          |                                                        |
| Steal Self         | Enable REALITY steal-self   | Disabled by default, requires a domain before enabling |
| Frontend Selection | Xray                        | Currently only supports Xray                           |
| Deploy Mode        | Tunnel / Fallback           | Default Tunnel mode                                    |
| Deploy on Port 443 | 443                         | Cannot be modified by default                          |
| Domain             | Steal-self service domain   | e.g., steal.example.com                                |
| Website Type       | Static Page / Reverse Proxy |                                                        |
| Static Page        | Static page path            |                                                        |
| Reverse Proxy      | Reverse proxy address       |                                                        |

When deploying on port 443, ensure that the server's port 443 is not occupied by other programs.

Don't worry about deploying other services. Click Agent Management -> Add Website to reuse port 443 for other services.

When enabling Steal Self, you must prepare a domain and resolve it to this server beforehand, to fill in the Domain field below. This domain will serve as the REALITY steal-self target website.

![Server Management page screenshot](/images/screenshots/tutorial-step6-servers-list.webp)

Server Management page, with added servers shown as cards

### 6.1 Agent Steal Yourself

Important: Deploying HTTPS for the MiaoMiaoWu X master occupies port 443. Do not enable Steal Yourself for an Agent installed on the master server.

Enable Steal Yourself when adding the Agent server. For Tunnel mode, use the following settings:

- Domain: the domain of the service being deployed
- Website type: Reverse Proxy or Static Page
- Reverse proxy address: 127.0.0.1:8080 (for example, proxy local port 8080); static page directory: /usr/local/nginx/html (the static asset directory on the host)

After saving the configuration, continue to the next step and install the Agent.

## 7 Install Agent

1. Click Generate Token on the server card
2. Copy the one-click install command at the bottom
3. Run the command on the target server, wait for installation to complete
4. After successful installation, the server card name shows Connected

For detailed instructions, see [Agent Deployment](/docs/en/install-agent)

After installation, the Agent automatically configures a tunnel-in inbound and routes traffic to the domain of the deployed service. You can then access that service at https://your-service-domain.

## 8 Add Node

For Steal Yourself, add a VLESS REALITY Vision node.

Click Node Management -> Add Node, select server and fill in the following:

### First Reality Node After Enabling Steal Yourself

The first Reality node is forced to use port 443 and automatically selects the deployed website as its dest.

The port shown while creating the node may not be 443 because Steal Yourself uses settings.port from the tunnel-in inbound, which defaults to 46174. You can ignore this value and check the node after it has been added.

| Input          | Content                       | Note                           |
| -------------- | ----------------------------- | ------------------------------ |
| Protocol Type  | Choose yourself               |                                |
| Node Name      | Name displayed in the list    |                                |
| REALITY Domain | Defaults to steal-self domain | Can also enter a custom domain |
| Select User    | Select an existing user       |                                |

After saving, the node appears in the node management list and users can use it via subscription links.

![Node Management page screenshot](/images/screenshots/tutorial-step8-nodes-list.webp)

Node Management page, listing all inbounds and their status

### Check the Node

After adding the node, confirm that its port is 443 in Node Management. Then open https://your-service-domain in a browser. If the deployed website loads successfully, the configuration is working.

## 9 Create Package

Open the Package Management page and click "Create Package Template" to set traffic quota, billing period, billing mode (one-way/two-way), speed limit, and device limit; on the right, select nodes included in the package and set per-node multipliers.

![Package Management page screenshot](/images/screenshots/tutorial-step9-packages-list.webp)

Package Management page — created packages displayed as cards

![Create package dialog screenshot](/images/screenshots/tutorial-step9-package-create-dialog.webp)

Create package dialog — parameters on the left, associated nodes on the right

## 10 Bind Package

Open the User Management page, click "Manage Package" in the row of the target user, choose a created package and set an expiration date — the user gains access to the package's nodes after saving.

![User Management page screenshot](/images/screenshots/tutorial-step10-users-list.webp)

User Management page, listing all users and their package status

![Manage package dialog screenshot](/images/screenshots/tutorial-step10-bind-package-dialog.webp)

Manage package dialog — pick package + expiration + reset cycle

## 11 Traffic Info

Open the Traffic Info page to view usage from three angles: by user, by node, and by server.

### User View

See used traffic for every user. Click a username to expand and view that user's per-node breakdown.

![User view screenshot](/images/screenshots/tutorial-step11-user-view.webp)

Sorted by per-cycle usage; click a username to expand by node

### Node View

See used traffic for every node. Click a node name to expand and view that node's per-user breakdown.

![Node view screenshot](/images/screenshots/tutorial-step11-node-view.webp)

Sorted by per-cycle usage; click a node name to expand by user

### Server View

See each server's current network speed, used/remaining traffic and utilization.

![Server view screenshot](/images/screenshots/tutorial-step11-server-view.webp)

Per-server speed / used / total / remaining / utilization overview

## 12 Tools (TG Bot & MiniApp)

Manage user-package bindings from within Telegram. The bot offers commands, daily notifications, and a login-free Mini App dashboard.

See System Settings → TG Bot for details.

### Admin view (Mini App)

![TG MiniApp admin view screenshot](/images/screenshots/tutorial-step12-miniapp-admin.webp)

Admin view — account / traffic / subscription / redeem codes (phone resolution)

### User view (Mini App)

![TG MiniApp user view screenshot](/images/screenshots/tutorial-step12-miniapp-user.webp)

Normal user view — own account / traffic / subscription only
