---
title: "Subscription domain"
description: "A dedicated subscription domain that only serves subscriptions and allowlist reports; configure the HTTPS reverse proxy in one click or copy the Nginx / Caddy config"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

The subscription domain is for proxy clients only: fetching subscriptions and reporting allowlist IPs. Once set, **only subscription paths are allowed on it and opening the panel returns 404**, so a shared subscription link never reveals the panel address.

## Allowed paths

| Path | Purpose |
| --- | --- |
| `/x/*` | Short links and package subscription links |
| `/api/clash/subscribe` | Clash / Mihomo subscriptions |
| `/api/user/package-subscribe` | Package subscriptions |
| `/api/subscribe` | Compatibility endpoint |
| `/api/fw/*` | Client IP allowlist reports (the official client reports automatically, see [Client settings](/docs/en/client-settings)) |

Everything else returns 404.

## Configuring it in the panel

1. Point the subscription domain at the master server and prepare a certificate covering it in [Certificates](/docs/en/certificates) (a wildcard certificate works).
2. Open System Settings → "System" tab, enter it under **Subscription URL**, e.g. `https://sub.example.com`, and save.
3. The panel then checks:
   - whether DNS resolves to this host. Behind a CDN (such as Cloudflare's orange cloud) the origin cannot be verified, and you are asked to confirm the CDN points back to this host.
   - whether Certificates has a certificate covering the domain.
   - whether the local Nginx is managed by the master.
4. If the master's HTTPS was enabled with "Deploy certificate to master" (Nginx managed by the master), click **Configure Nginx**; otherwise add the Nginx or Caddy config shown below by hand.

After saving, **every** subscription URL copied or pushed from the panel, the TG Bot and the TG Mini App uses this domain; when empty, the master address is used.

:::note
If the subscription domain equals the master domain, the master's HTTPS config already covers it and nothing else is needed.
:::

## Manual configuration

When you maintain Nginx or Caddy yourself, copy the config shown by the panel (domain and port already filled in), or write it from the examples below. They assume the subscription domain is `sub.example.com`, the master listens on the default port `12889`, and the reverse proxy runs on the same host.

### Nginx

Put the certificate under `/usr/local/nginx/cert/sub.example.com/` (or use your own path) and save as, for example, `/usr/local/nginx/servers/sub.conf`:

```nginx
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;
    server_name sub.example.com;

    ssl_certificate     /usr/local/nginx/cert/sub.example.com/fullchain.pem;
    ssl_certificate_key /usr/local/nginx/cert/sub.example.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    # Only subscription paths (short links, subscription endpoints, client IP allowlist reports); no login page or admin API
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

# Reject unknown domains: only one default_server on 443; skip it if you already have one
server {
    listen 443 ssl default_server;
    listen [::]:443 ssl default_server;
    ssl_reject_handshake on;
}
```

Keep `X-Real-IP`: allowlist reports rely on it to get the client's real egress IP; without it the report fails with "the master sees a proxy / private address".

Run `/usr/local/nginx/sbin/nginx -t` to check, then `systemctl reload nginx`.

### Caddy

```caddy
sub.example.com {
    # Only subscription paths (short links, subscription endpoints, client IP allowlist reports)
    @subscriptions path /x/* /api/fw/* /api/clash/subscribe /api/user/package-subscribe /api/subscribe
    handle @subscriptions {
        reverse_proxy 127.0.0.1:12889
    }
    # Everything else returns 404
    handle {
        respond 404
    }
}
```

Run `caddy validate --config /etc/caddy/Caddyfile`, then `systemctl reload caddy`.

### Cloudflare Tunnel

When publishing the subscription domain through a Tunnel, restrict paths on the Cloudflare side; see [Cloudflare Tunnel](/docs/en/cloudflare-tunnel).

:::note
When the subscription domain and the [report domain](/docs/en/domain-agent) are the same domain, one site must allow both sets of paths; see [Report domain · Sharing a domain with subscriptions](/docs/en/domain-agent#sharing-a-domain-with-subscriptions).
:::

## With "Disable public access"

After enabling [Disable public access](/docs/en/domain-master#disabling-public-access), the paths above keep working on the subscription domain; anything else is redirected to the master domain.
