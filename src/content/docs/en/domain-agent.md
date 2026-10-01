---
title: "Report domain (Agent connection address)"
description: "Give Agents their own address to reach the master: only Agent traffic is allowed, and the whole fleet migrates safely via check → single-server test → switch all"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

The report domain is called **Agent connection address** in the panel. It is the address the Agent on every server uses to reach the master: the WebSocket connection, heartbeats, traffic reports, replies to config pushes and the install script all go through it.

Once set separately:

- The domain **only accepts Agent communication** (`/api/remote/*`, including WebSocket). Opening the panel returns 404 without redirecting (a redirect would reveal the panel domain).
- The panel domain no longer appears on any Agent; changing the panel domain later does not touch the Agents.
- The panel domain still accepts Agent communication, as a fallback for offline Agents, old Agents and failed switches.

When empty, it is the same as the master address.

## Why switching takes three steps

A wrong address here would **disconnect the whole fleet at once**. So the panel does not push on save; it goes through three steps:

### ① Check

In System Settings → "System" → **Agent connection address**, enter the new address (`https://agent.example.com`, or `http://IP:port`) and click **Check**:

- DNS must resolve to this host (or a recognized CDN).
- The panel shows the HTTPS reverse-proxy status of the domain: if the local Nginx is managed by the master it can be **configured in one click**; otherwise copy the Nginx / Caddy config below. The config only allows `/api/remote/` (including WebSocket) and returns 404 for everything else; the Nginx config includes the reject-unknown-domains catch-all.

### ② Single-server test

Pick an online server and click **Test with this server**. The master first has that Agent probe the new address with authentication, then actually switches it and waits — up to 90 seconds — until it reconnects through the new address (the master can see which domain it connected with).

**If it does not come back, it is switched back to the old address automatically**, and the server keeps working. Agents on the master's own host and federated servers do not take part; if there really is no online Agent to test with, you can confirm and skip.

### ③ Switch all Agents

Within 30 minutes of a passed test, click **Switch all agents and save**. The remaining online Agents are handled one by one — probe first, then switch — with these results:

| Result | Meaning |
| --- | --- |
| Switched | Now uses the new address |
| Kept old address | This server cannot reach the new address and stays on the old one (still works) |
| Offline, will switch on reconnect | Currently offline; the new address is pushed when it reconnects |

The setting is saved only after all of them are processed.

## Switching back

Click **Revert to the master address** and the Agents go back to using the master address. The master address is already in use, so no DNS check is needed.

## Configuration examples

At the "Check" step the panel shows the config with your domain and port filled in, ready to copy; or write it from the examples below. They assume the report domain is `agent.example.com`, the master listens on the default port `12889`, and the reverse proxy runs on the same host.

### Nginx

Put the certificate under `/usr/local/nginx/cert/agent.example.com/` (or use your own path) and save as, for example, `/usr/local/nginx/servers/agent.conf`:

```nginx
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;
    server_name agent.example.com;

    ssl_certificate     /usr/local/nginx/cert/agent.example.com/fullchain.pem;
    ssl_certificate_key /usr/local/nginx/cert/agent.example.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    # Agent long-lived connection (WebSocket): forward Upgrade and use long timeouts so idle periods are not cut
    location = /api/remote/ws {
        proxy_pass http://127.0.0.1:12889;
        proxy_http_version 1.1;
        proxy_set_header Upgrade            $http_upgrade;
        proxy_set_header Connection         "upgrade";
        proxy_set_header Host               $host;
        proxy_set_header X-Real-IP          $remote_addr;
        proxy_set_header X-Forwarded-For    $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto  https;
        proxy_buffering off;
        proxy_connect_timeout 60s;
        proxy_send_timeout    1h;
        proxy_read_timeout    1h;
    }

    # Agent HTTP reports / heartbeats / install script
    location ^~ /api/remote/ {
        proxy_pass http://127.0.0.1:12889;
        proxy_http_version 1.1;
        proxy_set_header Host               $host;
        proxy_set_header X-Real-IP          $remote_addr;
        proxy_set_header X-Forwarded-For    $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto  https;
        proxy_buffering off;
        proxy_connect_timeout 60s;
        proxy_send_timeout    120s;
        proxy_read_timeout    120s;
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

Run `/usr/local/nginx/sbin/nginx -t` to check, then `systemctl reload nginx`.

### Caddy

Caddy's `reverse_proxy` supports WebSocket out of the box and does not cut long-lived connections:

```caddy
agent.example.com {
    # Agent communication (WebSocket + HTTP reports)
    @agent path /api/remote/*
    handle @agent {
        reverse_proxy 127.0.0.1:12889
    }
    # Everything else returns 404
    handle {
        respond 404
    }
}
```

Run `caddy validate --config /etc/caddy/Caddyfile`, then `systemctl reload caddy`.

### Sharing a domain with subscriptions

One `server_name` can only have one server block, so both sets of paths go into the same site.

Nginx: put the subscription `location ~ ...` block from the [subscription domain example](/docs/en/domain-subscription#nginx) and the two `/api/remote/` locations above into one server block, keeping `location / { return 404; }` last.

Caddy:

```caddy
edge.example.com {
    @subscriptions path /x/* /api/fw/* /api/clash/subscribe /api/user/package-subscribe /api/subscribe
    handle @subscriptions {
        reverse_proxy 127.0.0.1:12889
    }
    @agent path /api/remote/*
    handle @agent {
        reverse_proxy 127.0.0.1:12889
    }
    handle {
        respond 404
    }
}
```

## Notes

- The report domain can be the same domain as the subscription domain: both sets of paths are allowed and the panel still returns 404.
- Behind Cloudflare or another CDN, make sure WebSocket is allowed (Cloudflare allows it by default).
- After enabling [Disable public access](/docs/en/domain-master#disabling-public-access), Agent communication on the report domain is still allowed (WebSocket cannot follow redirects); other paths return 404.
