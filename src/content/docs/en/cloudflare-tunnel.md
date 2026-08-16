---
title: "Publish the master with Cloudflare Tunnel"
description: "Provide HTTPS for the master and subscription domains without local certificates or inbound ports"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

Cloudflare Tunnel provides HTTPS through an outbound connection initiated by the master server. This avoids installing Nginx/Caddy, managing TLS certificates, or exposing inbound ports 80 and 443, and it hides the origin IP.

Use two hostnames:

- `panel.example.com`: forwards every path for the admin panel and Agent WebSocket connections.
- `sub.example.com`: forwards only subscription paths and returns 404 for everything else.

:::caution[Before you continue]
Your domain must be managed by Cloudflare. Panel and subscription traffic passes through Cloudflare. If you do not want traffic handled by a third party, use [Nginx or Caddy](/docs/en/tutorial#54-recommended-reverse-proxy-the-master-with-nginx) instead.
:::

## 1. Restrict the master listener

### Bare-metal or systemd installation

Open **System Settings → System**, enable **Block Public Network Access**, save, and restart the master. The setting binds the master to `127.0.0.1` and takes effect only after a restart.

### Docker installation

Do not enable Block Public Network Access, because it prevents Docker port forwarding from working. Bind the published port to the host loopback interface instead:

```bash
docker run ... -p 127.0.0.1:12889:12889 ...
```

Compose configuration:

```yaml
ports:
  - "127.0.0.1:12889:12889"
```

The examples assume `cloudflared` runs on the host. If it runs in a container, replace `127.0.0.1` with the master's address on their shared Docker network.

Verify the local service:

```bash
curl -sI http://127.0.0.1:12889/login | head -1
ss -lnt | grep 12889
```

## 2. Create the Tunnel

1. Open **Networking → Tunnels** in the Cloudflare Dashboard.
2. Select **Create Tunnel** and choose Cloudflared.
3. Run the installation command shown by Cloudflare on the master server. It installs and registers the `cloudflared` service.
4. Wait until the Tunnel status becomes **Healthy**.

The Dashboard command contains a Tunnel Token. Treat it as a credential and never include it in documentation, screenshots, or Git commits.

## 3. Add published routes

Open the Tunnel's **Routes** section and add two **Published application** routes:

| Purpose       | Hostname            | Path        | Service URL              |
| ------------- | ------------------- | ----------- | ------------------------ |
| Admin panel   | `panel.example.com` | Empty       | `http://127.0.0.1:12889` |
| Subscriptions | `sub.example.com`   | Regex below | `http://127.0.0.1:12889` |

Path for the subscription hostname:

```regex
^/(x/.*|api/(clash/subscribe|user/package-subscribe|subscribe))$
```

This permits only:

- `/x/*`: short links and package subscriptions.
- `/api/clash/subscribe`: Clash/Mihomo subscriptions.
- `/api/user/package-subscribe`: package subscriptions.
- `/api/subscribe`: compatibility endpoint.

Unmatched requests must return 404. Do not add another rule that forwards every path on `sub.example.com` to the master.

## 4. Local configuration file (optional)

For a locally managed Tunnel, configure `~/.cloudflared/config.yml`. Rules are evaluated from top to bottom, and the 404 catch-all must be last:

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

Validate the rules and start the service:

```bash
cloudflared tunnel ingress validate
cloudflared tunnel ingress rule https://sub.example.com/login
sudo systemctl enable --now cloudflared
```

## 5. Update MiaoMiaoWu X settings

Open **System Settings** and set:

- Master server URL: `https://panel.example.com`
- Subscription domain: `https://sub.example.com`

Save, then regenerate or copy a subscription URL and confirm that it uses the dedicated subscription hostname.

## 6. Verify the deployment

```bash
curl -sI https://sub.example.com/ | head -1
curl -sI https://sub.example.com/login | head -1
curl -sI https://sub.example.com/api/clash/subscribe | head -1
curl -sI https://panel.example.com/login | head -1
```

The first two requests should return 404. The subscription API should reach the master (missing parameters or authentication can produce another 4xx response, but it should not be the Tunnel 404), and the panel login page should respond normally. Finally, update one real subscription in a client and confirm that nodes are returned.

## Security and troubleshooting

- Never configure an all-path route for the subscription hostname; doing so exposes the login page.
- For `502` errors, check the master listener, port, and `cloudflared` logs.
- If the Dashboard refuses to save a hostname, check for an existing A, AAAA, or CNAME record with the same name.
- WebSocket requires no separate route. If Agents cannot connect, confirm that the panel hostname forwards all paths.
- Cloudflare Access can protect the admin hostname. Do not apply an interactive login policy to the public subscription hostname, because subscription clients cannot complete it.

This guide is based on the tested proposal in [community Issue #2](https://github.com/mmwx-group/miaomiaowux-docs/issues/2). If the Dashboard changes, refer to the [official Cloudflare Tunnel setup guide](https://developers.cloudflare.com/tunnel/setup/).
