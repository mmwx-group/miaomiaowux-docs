---
title: "User portal (separating users from admins)"
description: "Let the subscription domain double as the panel entry for regular users: they sign in and use the panel there, while admin pages, admin APIs, MCP and Agent endpoints are never served on that domain. Optionally stop regular users from signing in on the panel domain; the TG Mini App user page moves over too"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

By default the panel (master) domain serves both admins and regular users. Handing users the panel address also tells them where the admin backend is.

The **user portal** separates the two. The [subscription domain](/docs/en/domain-subscription) keeps serving subscription links and also gives regular users the full user panel (sign-in, home, subscriptions, traffic, personal settings…). But it **never serves anything admin-only**:

- **Pages**: admin pages, the TG Mini App admin page and MCP return 404 on the user portal.
- **APIs**: admin APIs and the Agent / child-server / shared-server endpoints return 404. The user panel only uses the user API set, and calling it with an admin token returns 404 too.
- **Sign-in**: admin accounts cannot sign in on the user portal. The error is identical to a wrong password, so it doesn't reveal whether the account exists or is an admin.

| Domain | Admins | Regular users | Subscription links |
| --- | --- | --- | --- |
| Panel domain | ✅ | ✅ (❌ once "Don't let regular users sign in on the panel domain" is on) | ✅ |
| Subscription domain (portal off) | ❌ 404 | ❌ 404 | ✅ |
| Subscription domain (portal on) | ❌ | ✅ | ✅ |

The master decides by the request's domain (Host) alone and enforces it itself; path rules on the reverse proxy are only an extra layer.

## Requirements

- The [master address](/docs/en/domain-master) is set.
- A [subscription domain](/docs/en/domain-subscription) is set, and it:
  - is an `https://` address (sign-in and passkeys need a secure connection);
  - is a domain, not an IP;
  - differs from the panel domain (otherwise there is no separate entry).

If any of these is missing, the switch cannot be turned on and the panel tells you why.

## Turning it on

1. Open "System Settings" → "System" and find **Subscription URL**.
2. Turn on **Also use as the user portal**. Once it's in effect you'll see "User portal: https://sub.example.com".
3. The user portal needs the reverse proxy to forward the **whole site** to the master. The old subscription-only config leaves the user panel unreachable:
   - If the master configured Nginx for this domain automatically, it is rewritten when you flip the switch.
   - If the page says the Nginx config doesn't match the current setting, click **Reconfigure Nginx**.
   - If you maintain Nginx / Caddy yourself, update it as shown in [Manual configuration](#manual-configuration).
4. Send the user portal address to your users and have them sign in there.

:::note
The sign-in page, branding and theme on the user portal are the same as on the panel; users won't notice a difference. The only difference is that nothing admin-only exists there.
:::

## Don't let regular users sign in on the panel domain

The user portal only stops admins from signing in on it. To make regular users sign in **only** on the user portal, also turn on **Don't let regular users sign in on the panel domain**:

- When a regular user signs in on the panel domain, they're told the panel domain doesn't accept regular users and to go to the user portal (with its address).
- Admins are not affected.
- Client apps (MeowX, etc.) are not affected: apps can only connect to the panel domain.
- It requires the user portal to be on. Turning the portal off turns this switch off too, so users are never locked out everywhere.

With both switches on, admins only sign in on the panel domain and regular users only on the user portal.

## Telegram Mini App

With the user portal on, the [TG bot](/docs/en/tool-mmwx-tgbot) Mini App is split by role as well:

| Page | Address | Who opens it |
| --- | --- | --- |
| User page | `https://sub.example.com/tg-app` (on the user portal) | The bot's default menu button |
| Admin page | `https://panel.example.com/tg-app/admin` (panel domain only) | Telegram accounts configured as admins get their own menu button pointing here |

- Opening the wrong page switches you to the right one for your role.
- The user page contains nothing admin-only.
- Both addresses are shown on the Subscription URL card.
- The bot restarts automatically after you change the switch, so the menu buttons update.

## Manual configuration

If you run your own reverse proxy, the Subscription URL card shows configs with your domain and port already filled in; just copy them. The examples below assume the subscription domain `sub.example.com`, the master on its default port `12889`, and the reverse proxy on the same machine.

Both configs **forward the whole site to the master** and only block the obvious admin paths at the proxy. Even if a path slips through here, the master has its own complete allowlist per domain, so the admin side is never exposed.

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

    # Subscription paths (short links, subscription endpoints, client IP allowlist reports): no buffering
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

    # MMWX user portal: serve the user panel; block the admin side here first (the master has a full allowlist per domain)
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

    # Live updates (WebSocket)
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

    # Everything else (pages, static assets, user APIs, sign-in) goes to the master, which only serves the user panel on this domain
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

# Only one default_server is needed on 443; skip this if you already have one (nginx -t reports duplicates)
server {
    listen                     443 ssl default_server;
    listen                     [::]:443 ssl default_server;
    ssl_reject_handshake       on;
}
```

Don't drop `proxy_set_header Host $host`: the master recognizes the user portal by its domain. If the Host is rewritten to the upstream address, the master treats the request as coming through the panel domain.

After saving, run `/usr/local/nginx/sbin/nginx -t`, then `systemctl reload nginx`.

### Caddy

```caddy
sub.example.com {
	# MMWX user portal: serve the user panel; block the admin side here first (the master has a full allowlist per domain)
	@admin path /api/v3 /mcp /tg-app/admin /api/secure/rpc /api/secure/ws /api/admin/* /mcp/* /tg-app/admin/* /api/tg-webapp/admin/* /api/remote/* /api/child/* /api/federation/* /api/setup/* /api/xray/* /api/speedtest/* /api/user/debug/*
	handle @admin {
		respond 404
	}
	handle {
		reverse_proxy 127.0.0.1:12889
	}
}
```

Caddy's `reverse_proxy` keeps the original Host by default and handles WebSockets on its own. After saving, run `caddy validate --config /etc/caddy/Caddyfile`, then `systemctl reload caddy`.

### Cloudflare

When the user portal goes through Cloudflare:

1. **DNS**: add A / AAAA records for the subscription domain pointing at the master, with proxy status "Proxied" (orange cloud). Cloudflare keeps the original Host when it reaches the origin, which is how the master recognizes the user portal.
2. **SSL/TLS → Overview**: set the encryption mode to "Full (strict)" and put a certificate covering the domain on the origin (one issued in Certificates, or a Cloudflare Origin CA certificate).
3. **Origin port**: if the origin doesn't listen on 443, add a rule under "Rules → Origin Rules": hostname equals the subscription domain → rewrite the destination port to the origin port.
4. **Cache**: don't enable "Cache Everything". Subscriptions and APIs are per-user, and caching mixes users up. To be safe, add a cache rule: hostname equals the subscription domain and URI path starts with `/api/` → bypass cache.
5. **Network → WebSockets**: keep it on; live updates need it.

:::danger[Don't forward through a Worker]
When a Worker forwards with `fetch()` to the panel domain, the master sees the panel domain as the Host and treats the request as coming through the panel. The user portal's "no admin side" separation is then gone entirely.

Having the Worker add a secret header to declare "this is the user portal" doesn't help either: if the Worker forgets it, gets it wrong or is modified, the admin side is exposed. DNS proxying decides by Host, so a misconfiguration only makes the site unreachable.
:::

## Turning it off

After you turn off "Also use as the user portal", the subscription domain goes back to serving subscription paths only.

- **Nginx managed by the master**: it **first** rewrites Nginx back to subscription paths only, and only then turns the switch off. If rewriting Nginx fails, the switch stays on and you're told why. That way there's never a gap where Nginx still forwards the whole site while the master has stopped enforcing the portal rules.
- **Your own reverse proxy**: switch your config back to the subscription-only version in [Subscription domain](/docs/en/domain-subscription#manual-configuration) yourself. Otherwise, once the switch is off, the whole panel, admin pages included, is exposed on the subscription domain.

## Emergency switch

Setting the environment variable `MMWX_FORCE_PUBLIC_ACCESS=1` and restarting the master disables all user-portal separation. It exists for recovering access when you're locked out of the panel; see [Master domain](/docs/en/domain-master). Remove it afterwards.

## FAQ

### An admin signing in on the user portal gets "wrong username or password"

That's by design: admins only sign in on the panel domain. The error matches a wrong password so it doesn't reveal whether the account exists or is an admin.

### Users can't use their passkey on the user portal

Passkeys are bound to a domain. A passkey added on the panel domain usually won't work on the user portal. Users can sign in on the user portal with their password, then add another passkey in "Personal settings".

### The switch is on but says it's not in effect yet

Fix the reason shown: the subscription URL isn't `https://`, it's an IP, it's the same as the panel domain, or the master address isn't set.

### The user portal shows 404, or only subscriptions work

The reverse proxy still has the old subscription-only config. Click "Reconfigure Nginx", or switch to whole-site forwarding as in [Manual configuration](#manual-configuration) above.
