---
title: "Master domain"
description: "What the master domain (master server address) is used for, how to enable HTTPS, and the access rules after disabling public access"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

The master domain is the domain you open the panel on, and it is the system's "master server address". When the other two domains are not set, subscription links and Agent communication use it too.

## Where it is used

Set it in System Settings → "System" tab → **Master Server URL**, as scheme + domain (or IP and port), for example `https://panel.example.com`. When left empty, the address you are currently visiting is used.

Once saved, it is used for:

- The Agent install command generated when adding a server, and the address Agents connect back to (when no [report domain](/docs/en/domain-agent) is set).
- Subscription links (when no [subscription domain](/docs/en/domain-subscription) is set).
- The report link of the "Client IP allowlist" in personal settings.
- Places that need to know "who the master is", such as the passkey RP ID and certificate detection.

If the domain you are visiting over HTTPS differs from the one set here, the panel shows a "Master Domain Mismatch" prompt and can switch it to the current domain in one click.

## Enabling HTTPS

Pick one:

| Method | Best for | Notes |
| --- | --- | --- |
| Certificates → "Deploy certificate to master" | Most cases | The master installs and manages Nginx itself. Afterwards the subscription and report domains can be configured from the panel in one click |
| Your own Nginx / Caddy | You already have a reverse proxy, or share the host with other sites | Follow the [deployment tutorial](/docs/en/tutorial#54-recommended-reverse-proxy-the-master-with-nginx); the subscription and report domain configs shown by the panel can be copied as-is |
| [Cloudflare Tunnel](/docs/en/cloudflare-tunnel) | The master has no public entry, or you do not want to open ports | Cloudflare provides HTTPS |

See [Certificates](/docs/en/certificates) for issuing and deploying certificates.

## Configuration examples

The examples assume the master domain is `panel.example.com`, the master listens on the default port `12889` (replace it if you changed `PORT`), and the reverse proxy runs on the same host. The master domain must allow every path and support WebSocket (live panel refresh relies on it, and so do Agent connections when no report domain is set).

### Nginx

Put the certificate under `/usr/local/nginx/cert/panel.example.com/` (or use your own path) and save as, for example, `/usr/local/nginx/servers/panel.conf`:

```nginx
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;
    server_name panel.example.com;

    ssl_certificate     /usr/local/nginx/cert/panel.example.com/fullchain.pem;
    ssl_certificate_key /usr/local/nginx/cert/panel.example.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    # Restoring backups, uploading a logo, etc. need a larger request body
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

# Reject unknown domains: only one default_server on 443; skip it if you already have one
server {
    listen 443 ssl default_server;
    listen [::]:443 ssl default_server;
    ssl_reject_handshake on;
}
```

- `proxy_http_version 1.1` and the `Upgrade` / `Connection` headers are all required, otherwise the WebSocket handshake fails.
- `X-Real-IP` / `X-Forwarded-For` let the master see the real client IP for login rate limiting, the client IP allowlist and so on. The master trusts these headers automatically when the proxy is on the same host (or a private network); when the proxy is on another public server, add its IP to the `MMWX_TRUSTED_PROXIES` environment variable or the "Trusted proxies" setting.

Run `/usr/local/nginx/sbin/nginx -t` to check, then `systemctl reload nginx`.

### Caddy

Caddy issues and renews certificates and handles WebSocket and the `X-Forwarded-*` headers automatically. Add to `/etc/caddy/Caddyfile`:

```caddy
panel.example.com {
    reverse_proxy 127.0.0.1:12889
}
```

To use an existing certificate, add `tls /path/to/fullchain.pem /path/to/privkey.pem` inside the site block. Run `caddy validate --config /etc/caddy/Caddyfile`, then `systemctl reload caddy`. Caddy only answers the domains written in the Caddyfile, so no extra "reject unknown domains" site is needed.

## Disabling public access

After enabling **Disable public access** in the "System" tab and restarting the master, it only accepts requests coming through a reverse proxy:

- The master listens on `127.0.0.1` only, so IP + port access stops working. This is for a reverse proxy **on the same host**; Docker port mappings and cross-server proxies do not work with it.
- When the Master Server URL is `https://`, requests whose Host is not the master domain are redirected (307) to the master domain. Exceptions:
  - subscription paths on the [subscription domain](/docs/en/domain-subscription);
  - Agent communication paths on the [report domain](/docs/en/domain-agent) (WebSocket cannot follow redirects, so they must be let through);
  - requests from the host itself (127.0.0.1).

:::tip[Locked out of the panel?]
If a misconfiguration keeps you out, set the environment variable `MMWX_FORCE_PUBLIC_ACCESS=1` on the master and restart. It temporarily restores public listening and skips the redirect above; fix the setting, then remove the variable.
:::
