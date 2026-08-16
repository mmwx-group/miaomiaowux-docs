---
title: "System Settings"
description: "Detailed explanation of each MiaoMiaoWu X system setting"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

![System Settings page screenshot](/images/screenshots/doc-system-settings-overview.webp)

System Settings full page — function areas grouped as Cards (sync / system / security / Turnstile / scheduling / master URL / API token / license)

## Try it: System Settings

Local mock of the master /system-settings page — 8 Cards stacked, every toggle/input/radio is clickable, the Save button simulates persistence; all local state, no network calls.

Mock demoEvery toggle / field is interactive · «Save» fires a toast

Subscription sync

Refresh strategy, traffic accounting, node filtering, etc.

Sync traffic stats

Pull per-user traffic from remote servers; off = accounted locally only.

Node-name filter (separate keywords with |)

Typically used to strip announcement nodes like 'Remaining X GB' / 'site example.com' / 'Expires yyyy-mm-dd'.

Append traffic & expiry info to subscription

Add used/remaining quota + expiry to the HTTP response header when serving subscriptions, so clients can display them.

Force-sync external subscriptions

Pull external subs even if the cache is still warm. Mostly for troubleshooting.

Node matching rule

By name

By server:port

By protocol + server:port

Which fields define «the same node» during sync. Default is protocol+server+port (most reliable).

Sync scope

Only saved nodes

All nodes (including new ones)

Keep locally renamed nodes

Even if upstream renames a node, names you edited locally are preserved.

Subscription cache TTL (minutes)

How long the master caches external subscriptions. Shorter = more real-time, longer = lighter load.

**Save**

System options

Short links, override scripts, mmw compat, node multiplier prefix, etc.

Enable short-link generation

Distribute subscription URLs as /x/{code} so the user's token isn't exposed.

Enable override scripts

Run user-provided JS/Lua scripts as the last stage of subscription rendering.

Compat with miaomiaowu (legacy)

Also support the older mmw API shape and fields — helps migrating users.

mmw short-link compatibility (/x/{file}{user})

Make legacy mmw two-segment short links work on mmwx so clients do not have to switch.

Add multiplier prefix to node names

Tag nodes whose multiplier ≠ 1 in subscription output, e.g. \[×2\] HK Node.

**Save**

Security thresholds

Login-attempt lockout, token lifetime, 2FA.

Max failed login attempts

Consecutive failures past this trigger a lockout. Lower = stricter.

Lockout duration (minutes)

How long the account is locked once it trips the limit.

Session token TTL (hours)

How long a session credential lasts; expires → re-login. Default 168 (7 days).

Require 2FA for admins

When on, admins must configure TOTP before they can finish login.

**Save**

Cloudflare Turnstile

Add CF Turnstile (frictionless CAPTCHA) to the login page.

Enable Turnstile

When on, the login page mounts the Turnstile widget; off = no CAPTCHA.

Site Key

Get from Cloudflare Dashboard → Turnstile. Public key, safe to expose.

Secret Key

Secret key — the master uses it to verify tokens against CF. Keep private.

**Save**

Scheduled jobs

Cron for traffic reset / cache cleanup / node sync.

Traffic reset cron

When to zero users whose reset_day matures. Default: 00:00 on the 1st of each month.

Cleanup cron

Clear expired sessions, logs, subscription cache. Default: 03:00 daily.

Node auto-sync cron

Actively poll agents for node status. Default: every 30 minutes.

**Save**

Master public URL

URL used by subscription links, notifications, Mini App, etc.

Master URL

Prefix for subscription links and entry point for the Telegram Mini App. Use HTTPS and make sure every user can reach it.

**Save**

API Token (admin)

Long-lived token for /api/admin/\* calls — used by MCP / TG Bot etc.

Bearer token

Treat as a password — anyone with this token is admin. 👁 to reveal, 📋 to copy.

**Regenerate**

PRO licensePRO active

Activate to unlock node speed-test / rate-limit / server sharing / embedded Xray and more.

Machine IDa1b2c3d4e5f6

StatusActive

Expires2027-06-07

License key

Apply at mmwxlicense.com with your machine ID, paste the key here, then click Activate.

Unlocked PRO features

- Node speed test — mihomo real latency + throughput
- Node rate limit — per-node Mbps caps for upload/download
- Server sharing — expose nodes to other mmwx instances
- Embedded Xray — Agent embeds xray-core, no standalone binary

**Activate / renew**

## Overview

System Settings is organized into 11 tabs covering subscriptions, features, notifications, security, probe, appearance, announcements, TGBot, verification, system, and license. Most settings hot-update after saving; a few listener settings, such as blocking public access, require a master restart.

System settings are visible only to admins. Regular users cannot access this page.

## Current Settings Overview

This overview follows the current /system-settings implementation in the MiaoMiaoWu X main project. Mobile uses a selector; desktop uses tabs.

| Tab           | Main capabilities                                                                                                                                                    | Activation                    |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| Subscriptions | External traffic sync, node-name regex filtering, forced refresh, matching rules, sync scope, name preservation, and cache lifetime.                                 | Effective after saving        |
| Features      | Short links, override scripts, update CDN, Clash output, legacy compatibility, silent mode, mandatory Agent encryption, default templates, and multiplier prefixes.  | Effective after saving        |
| Notifications | Telegram notifications, test messages, and independent events for login, subscription fetches, server status, daily traffic, and threshold alerts.                   | Effective after saving        |
| Security      | Login rate limiting, brute-force protection, and subscription request limits. Fields auto-save on blur and hot-update the limiters.                                  | Effective after saving        |
| Probe         | Disguise the site as a public monitor; configure title, logo, hidden login, visible servers, and Agent CPU, memory, disk, and Ping collection.                       | Effective after saving        |
| Appearance    | Set the default theme, login wallpaper, and custom branding. A user's theme takes priority; custom branding requires the matching PRO feature.                       | Effective after saving        |
| Announcements | Configure blocked/recovered node, maintenance, subscription update, and general templates; select Bot/Mini App channels and probes, or publish immediately.          | Effective after saving        |
| TGBot         | Enable the built-in Bot and Mini App, configure the Bot Token and administrator Telegram IDs, and control the development-only preview. Saving hot-restarts the Bot. | Effective after saving        |
| Verification  | Configure and test Cloudflare Turnstile Site Key and Secret Key. Login verification is enabled only when both keys are configured.                                   | Effective after saving        |
| System        | Sync custom proxy groups, tune scheduled tasks, set the public master URL and listener scope, configure TG redemption copy, and view or regenerate the API Token.    | Some settings require restart |
| License       | Review license status, plan, expiry, and server/node/user quotas; update the key and verify PRO feature availability.                                                | Effective after saving        |

Block Public Access makes the master listen only on 127.0.0.1 and requires a restart. It only suits a reverse proxy on the same host; Docker port mapping, cross-server proxying, and direct IP:port access will stop working. Regenerating the API Token invalidates the old token immediately.

## External Subscription Sync Settings

Configure sync behavior for external subscriptions (airport subscriptions). When external subscription links are imported, these settings control how external nodes are fetched and updated.

### Sync External Subscription Traffic Info

<table class="w-full text-sm"><tbody><tr class="border-b"><td class="py-2 pr-4 font-medium w-28">Type</td><td class="py-2">Toggle</td></tr><tr class="border-b"><td class="py-2 pr-4 font-medium">Default</td><td class="py-2">Off</td></tr><tr><td class="py-2 pr-4 font-medium">Description</td><td class="py-2">When enabled, traffic info page data includes external subscription traffic. The system reads the subscription-userinfo response header when fetching subscriptions and merges traffic data into total statistics.</td></tr></tbody></table>

### Append Subscription Info to Node Names

<table class="w-full text-sm"><tbody><tr class="border-b"><td class="py-2 pr-4 font-medium w-28">Type</td><td class="py-2">Toggle</td></tr><tr class="border-b"><td class="py-2 pr-4 font-medium">Default</td><td class="py-2">Off</td></tr><tr><td class="py-2 pr-4 font-medium">Description</td><td class="py-2">When enabled, remaining traffic and days are appended to node names during external subscription sync. Example: NodeName 398.22GB 26Days. Convenient for users to view subscription traffic and validity directly in clients.</td></tr></tbody></table>

### Node Name Filter

<table class="w-full text-sm"><tbody><tr class="border-b"><td class="py-2 pr-4 font-medium w-28">Type</td><td class="py-2">Text input (regex)</td></tr><tr class="border-b"><td class="py-2 pr-4 font-medium">Default</td><td class="py-2"><code class="bg-muted px-1.5 py-0.5 rounded text-xs">剩余|流量|到期|订阅|时间|重置</code></td></tr><tr><td class="py-2 pr-4 font-medium">Description</td><td class="py-2">Uses regex to match node names. Matched nodes are filtered out during sync. Commonly used to filter traffic info nodes, announcement nodes, and other non-proxy nodes from airport subscriptions. Leave empty for no filtering.</td></tr></tbody></table>

### External Subscription Sync

<table class="w-full text-sm"><tbody><tr class="border-b"><td class="py-2 pr-4 font-medium w-28">Type</td><td class="py-2">Toggle</td></tr><tr class="border-b"><td class="py-2 pr-4 font-medium">Default</td><td class="py-2">Off</td></tr><tr><td class="py-2 pr-4 font-medium">Description</td><td class="py-2">When enabled, the system re-fetches the latest nodes from external subscription links every time a user gets a subscription, updating the database. When disabled, only uses nodes already saved in the database.</td></tr></tbody></table>

Enabling increases subscription API response time since external subscription links must be accessed each time. Recommended to use with cache TTL.

When enabled, the following sub-configurations expand:

#### Match Rule

Controls how local and remote nodes are matched during sync.

| Option           | Description                                                                                 |
| ---------------- | ------------------------------------------------------------------------------------------- |
| Node Name        | Match by node name (default), suitable for subscriptions with stable node names             |
| Server:Port      | Match by server address and port, suitable for subscriptions with frequently changing names |
| Type:Server:Port | Match by protocol type + server + port, most precise matching                               |

#### Sync Scope

Controls which nodes are updated during sync.

| Option                | Description                                                                   |
| --------------------- | ----------------------------------------------------------------------------- |
| Sync Saved Nodes Only | Only update nodes already in the database (default), won't auto-add new nodes |
| Sync All Nodes        | Sync all nodes from remote subscription, new nodes auto-added to database     |

#### Keep Current Node Names

<table class="w-full text-sm"><tbody><tr class="border-b"><td class="py-2 pr-4 font-medium w-28">Default</td><td class="py-2">On</td></tr><tr><td class="py-2 pr-4 font-medium">Description</td><td class="py-2">When enabled, preserves database node names during sync instead of using external subscription names. Suitable when node names have been manually modified.</td></tr></tbody></table>

#### Cache TTL (minutes)

<table class="w-full text-sm"><tbody><tr class="border-b"><td class="py-2 pr-4 font-medium w-28">Default</td><td class="py-2">0 (re-fetch every time)</td></tr><tr><td class="py-2 pr-4 font-medium">Description</td><td class="py-2">Set to 0 to re-fetch external subscription on every subscription request. When &gt; 0, only re-fetches if the set minutes have passed since last fetch. Recommended 30-60 minutes to balance freshness and response speed.</td></tr></tbody></table>

## Feature Toggles

Manage the enabled status of system feature modules.

### Silent Mode

<table class="w-full text-sm"><tbody><tr class="border-b"><td class="py-2 pr-4 font-medium w-28">Type</td><td class="py-2">Toggle</td></tr><tr class="border-b"><td class="py-2 pr-4 font-medium">Default</td><td class="py-2">Off</td></tr><tr><td class="py-2 pr-4 font-medium">Description</td><td class="py-2">When enabled, MiaoMiaoWu X returns 404 pages for all requests, hiding the panel's existence. When a user fetches a subscription via subscription link, the server resumes normal access for a duration set by Recovery Duration. After timeout, it re-enters silent mode.</td></tr></tbody></table>

After enabling silent mode, you cannot directly access the panel. Only fetching a subscription can temporarily restore access. Ensure subscription links are properly configured before enabling.

#### Recovery Duration (minutes)

<table class="w-full text-sm"><tbody><tr class="border-b"><td class="py-2 pr-4 font-medium w-28">Default</td><td class="py-2">15 minutes</td></tr><tr class="border-b"><td class="py-2 pr-4 font-medium">Range</td><td class="py-2">1 - 1440 minutes</td></tr><tr><td class="py-2 pr-4 font-medium">Description</td><td class="py-2">Duration of normal access after a user fetches a subscription. After timeout, re-enters 404 silent mode.</td></tr></tbody></table>

### Enable Short Links

<table class="w-full text-sm"><tbody><tr class="border-b"><td class="py-2 pr-4 font-medium w-28">Type</td><td class="py-2">Toggle</td></tr><tr class="border-b"><td class="py-2 pr-4 font-medium">Default</td><td class="py-2">Off</td></tr><tr><td class="py-2 pr-4 font-medium">Description</td><td class="py-2">When enabled, the subscription link page shows an additional 6-character short link. Short links are easier to share and type. Users can reset short links in personal settings.</td></tr></tbody></table>

### Client Compatibility Mode

<table class="w-full text-sm"><tbody><tr class="border-b"><td class="py-2 pr-4 font-medium w-28">Type</td><td class="py-2">Toggle</td></tr><tr class="border-b"><td class="py-2 pr-4 font-medium">Default</td><td class="py-2">Off</td></tr><tr><td class="py-2 pr-4 font-medium">Description</td><td class="py-2">When enabled, subscription generation auto-filters node types unsupported by the target client (e.g., WireGuard nodes unsupported by Clash), only logging instead of erroring. When disabled, incompatible nodes produce error messages.</td></tr></tbody></table>

### Override Scripts

<table class="w-full text-sm"><tbody><tr class="border-b"><td class="py-2 pr-4 font-medium w-28">Type</td><td class="py-2">Toggle</td></tr><tr class="border-b"><td class="py-2 pr-4 font-medium">Default</td><td class="py-2">Off</td></tr><tr><td class="py-2 pr-4 font-medium">Description</td><td class="py-2">When enabled, the override management page shows script functionality. Use JavaScript scripts to modify subscription configs, such as changing node properties, adding custom fields, adjusting proxy group structure, etc. For users with advanced customization needs.</td></tr></tbody></table>

### Probe Server Binding

<table class="w-full text-sm"><tbody><tr class="border-b"><td class="py-2 pr-4 font-medium w-28">Type</td><td class="py-2">Toggle</td></tr><tr class="border-b"><td class="py-2 pr-4 font-medium">Default</td><td class="py-2">Off</td></tr><tr><td class="py-2 pr-4 font-medium">Description</td><td class="py-2">When enabled, each node in the node management list shows a probe binding button, allowing nodes to be bound to specific probe servers. Once bound, traffic statistics only aggregate probe data for that node, enabling more precise traffic attribution.</td></tr></tbody></table>

### Enable Proxy Provider

<table class="w-full text-sm"><tbody><tr class="border-b"><td class="py-2 pr-4 font-medium w-28">Type</td><td class="py-2">Toggle</td></tr><tr class="border-b"><td class="py-2 pr-4 font-medium">Default</td><td class="py-2">Off</td></tr><tr><td class="py-2 pr-4 font-medium">Description</td><td class="py-2">Proxy Provider allows dynamically loading nodes from external subscriptions. When enabled, proxy providers can be configured on the subscription files page and dragged into proxy groups during editing. Suitable for mixed use of local and external airport nodes.</td></tr></tbody></table>

### Template Version

<table class="w-full text-sm"><tbody><tr class="border-b"><td class="py-2 pr-4 font-medium w-28">Type</td><td class="py-2">Radio</td></tr><tr class="border-b"><td class="py-2 pr-4 font-medium">Default</td><td class="py-2">v2 (Universal Backend)</td></tr><tr><td class="py-2 pr-4 font-medium">Description</td><td class="py-2">Select the template engine version used for subscription generation. Different versions have different template syntax and capabilities.</td></tr></tbody></table>

| Version | Name              | Description                                                                                                             |
| ------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `v1`    | Legacy            | Uses file templates from rule_templates directory, direct YAML file editing                                             |
| `v2`    | Universal Backend | Uses database-stored templates, supports web-based visual management, compatible with universal backend template format |
| `v3`    | New               | New template system, mihomo-like config style, supports visual proxy group and rule editing                             |

### Subscription Response Header Traffic Info

<table class="w-full text-sm"><tbody><tr class="border-b"><td class="py-2 pr-4 font-medium w-28">Type</td><td class="py-2">Toggle</td></tr><tr class="border-b"><td class="py-2 pr-4 font-medium">Default</td><td class="py-2">On</td></tr><tr><td class="py-2 pr-4 font-medium">Description</td><td class="py-2">When enabled, the system reads probe and external subscription traffic data during subscription fetch and writes subscription-userinfo info to HTTP response headers. Clients (like Clash, Stash) display traffic usage and expiry accordingly. When disabled, skips traffic data reading and doesn't write response headers.</td></tr></tbody></table>

### Subscription Serialization Format

<table class="w-full text-sm"><tbody><tr class="border-b"><td class="py-2 pr-4 font-medium w-28">Type</td><td class="py-2">Radio</td></tr><tr class="border-b"><td class="py-2 pr-4 font-medium">Default</td><td class="py-2">YAML</td></tr><tr class="border-b"><td class="py-2 pr-4 font-medium">Options</td><td class="py-2"><code class="bg-muted px-1.5 py-0.5 rounded text-xs">YAML</code> / <code class="bg-muted px-1.5 py-0.5 rounded text-xs">JSON</code></td></tr><tr><td class="py-2 pr-4 font-medium">Description</td><td class="py-2">Select Clash subscription output format. Default YAML. When JSON is selected, Clash subscriptions output in JSON format. This setting only affects Clash format subscriptions, not other client formats (Surge, Sing-Box, Shadowrocket, etc.).</td></tr></tbody></table>

### Subscription Info Nodes

<table class="w-full text-sm"><tbody><tr class="border-b"><td class="py-2 pr-4 font-medium w-28">Type</td><td class="py-2">Toggle</td></tr><tr class="border-b"><td class="py-2 pr-4 font-medium">Default</td><td class="py-2">Off</td></tr><tr><td class="py-2 pr-4 font-medium">Description</td><td class="py-2">When enabled, two info nodes are added at the top of the node list during subscription output, showing expiry time and remaining traffic. These are not real proxy nodes, only for displaying subscription info in client node lists.</td></tr></tbody></table>

When enabled, you can customize info node prefix text:

#### Expiry Time Prefix

<table class="w-full text-sm"><tbody><tr class="border-b"><td class="py-2 pr-4 font-medium w-28">Default</td><td class="py-2">Expiry</td></tr><tr><td class="py-2 pr-4 font-medium">Example Output</td><td class="py-2"><code class="bg-muted px-1.5 py-0.5 rounded text-xs">Expiry: 2025-12-31</code></td></tr></tbody></table>

#### Remaining Traffic Prefix

<table class="w-full text-sm"><tbody><tr class="border-b"><td class="py-2 pr-4 font-medium w-28">Default</td><td class="py-2">Traffic</td></tr><tr><td class="py-2 pr-4 font-medium">Example Output</td><td class="py-2"><code class="bg-muted px-1.5 py-0.5 rounded text-xs">Traffic: 156.8 GB</code></td></tr></tbody></table>

## Notification Push Configuration

Push system critical event notifications via Telegram Bot.

### Enable Push Notifications

<table class="w-full text-sm"><tbody><tr class="border-b"><td class="py-2 pr-4 font-medium w-28">Type</td><td class="py-2">Toggle</td></tr><tr class="border-b"><td class="py-2 pr-4 font-medium">Default</td><td class="py-2">Off</td></tr><tr><td class="py-2 pr-4 font-medium">Description</td><td class="py-2">When enabled, the system sends event notifications via Telegram Bot. First configure Bot Token and Chat ID by clicking the gear icon next to the notification push toggle.</td></tr></tbody></table>

### Telegram Bot Configuration

Click the gear icon next to the notification push toggle to expand the config panel.

| Config Item | Format              | Description                                                                   |
| ----------- | ------------------- | ----------------------------------------------------------------------------- |
| Bot Token   | `123456:ABC-DEF...` | API Token obtained after creating a Bot from @BotFather                       |
| Chat ID     | `-1001234567890`    | Telegram chat ID to receive notifications, can be personal, group, or channel |

After configuration, click Send Test Notification to verify the setup.

### Notification Events

Each notification event can be independently toggled:

| Event               | Default | Description                                                                                               |
| ------------------- | ------- | --------------------------------------------------------------------------------------------------------- |
| Subscription Fetch  | On      | Send notification when user fetches subscription, includes username, client type, and IP                  |
| Login               | On      | Send notification when user logs into panel, includes username and IP                                     |
| IP Ban              | On      | Send notification when IP is auto-banned due to multiple bad requests                                     |
| Silent Mode         | On      | Send notification on silent mode status changes (entering/exiting 404 state)                              |
| Subscription Expiry | On      | Send reminder when user subscription is about to expire                                                   |
| Daily Traffic       | Off     | Send daily traffic statistics report. When enabled, set send time (default 08:00) in 24-hour HH:MM format |

## Proxy Group Config Sync

<table class="w-full text-sm"><tbody><tr class="border-b"><td class="py-2 pr-4 font-medium w-28">Description</td><td class="py-2">Sync the latest preset proxy group config from a remote address. Proxy group config contains common rule categories and corresponding rule-providers settings. After sync, updates the rule selector and preset proxy groups on the subscription generation page.</td></tr><tr class="border-b"><td class="py-2 pr-4 font-medium">Remote Config Address</td><td class="py-2">Customize the remote config URL. Leave empty to use system default or environment variable configured address.</td></tr><tr><td class="py-2 pr-4 font-medium">Operation</td><td class="py-2">Click Sync Proxy Group Config button to manually trigger sync. A confirmation prompt appears after successful sync.</td></tr></tbody></table>

## Master Config File

Master service configuration is set via config file or environment variables, independent of Web UI system settings.

```
# config.yaml
port: 12889
database_path: data/traffic.db
jwt_secret: your-secret-key
log_level: info
allowed_origins: "*"
```

Config file specified via -c config.yaml, can also be overridden by environment variables.

| Config          | Description                                    | Default         |
| --------------- | ---------------------------------------------- | --------------- |
| port            | Backend HTTP service listen port               | 12889           |
| database_path   | SQLite database file path                      | data/traffic.db |
| jwt_secret      | JWT signing key for user authentication        | \-              |
| log_level       | System log level (debug / info / warn / error) | info            |
| allowed_origins | CORS allowed origins, \* allows all            | \*              |

## Master Environment Variables

Environment variables override same-named config in config.yaml:

| Variable        | Description          |
| --------------- | -------------------- |
| PORT            | Service port         |
| JWT_SECRET      | JWT signing key      |
| LOG_LEVEL       | Log level            |
| ALLOWED_ORIGINS | CORS allowed origins |

## Agent Connection Config

Agent is deployed on remote proxy servers and needs to configure the connection to Master.

```
# config.yaml (Agent 端)
master_url: "https://your-master-domain.com"
token: "your-server-token"
listen_port: "23889"
connection_mode: "auto"
traffic_report_interval: "1m"
speed_report_interval: "3s"
restart_method: "auto"
restart_command: ""
```

| Config                  | Description                                                        | Default |
| ----------------------- | ------------------------------------------------------------------ | ------- |
| master_url              | Master server address                                              | \-      |
| token                   | Server authentication Token                                        | \-      |
| listen_port             | Agent API listen port                                              | 23889   |
| connection_mode         | Connection mode (see below)                                        | auto    |
| traffic_report_interval | Traffic data report interval                                       | 1m      |
| speed_report_interval   | Speed data report interval                                         | 3s      |
| restart_method          | Xray restart method (auto / systemctl / custom command)            | auto    |
| restart_command         | Custom restart command (effective when restart_method is not auto) | \-      |

## Connection Modes

Agent and Master support multiple communication methods. Choose the most suitable mode based on your network environment.

#### auto (Recommended)

Automatically selects the best connection method. Prioritizes WebSocket, falls back to HTTP, then Pull mode. Supports exponential backoff auto-reconnection.

#### websocket

Full-duplex WebSocket connection with real-time bidirectional communication. Heartbeat interval 30 seconds, idle timeout 5 minutes. Suitable for stable networks.

#### http

Actively pushes data to Master via HTTP POST. Suitable for environments that cannot establish persistent connections.

#### pull

Passive mode, Master actively pulls Agent data. Agent only exposes local API, no need to actively connect to Master. Suitable when Agent is behind NAT or cannot make outbound connections.

## Agent Environment Variables

Environment variables override same-named config in config.yaml:

| Variable              | Description                                      |
| --------------------- | ------------------------------------------------ |
| MMWX_MASTER_URL       | Master address                                   |
| MMWX_TOKEN            | Server authentication Token                      |
| MMWX_CONNECTION_MODE  | Connection mode (auto / websocket / http / pull) |
| MMWX_LISTEN_PORT      | Agent API listen port                            |
| MMWX_XRAY_CONFIG      | Xray config file path (config.json)              |
| MMWX_XRAY_CONFDIR     | Xray config directory path (multi-file mode)     |
| MMWX_TRAFFIC_INTERVAL | Traffic report interval (e.g., 1m, 30s)          |
| MMWX_SPEED_INTERVAL   | Speed report interval (e.g., 3s, 5s)             |
| MMWX_RESTART_METHOD   | Xray restart method                              |
| MMWX_RESTART_COMMAND  | Custom Xray restart command                      |
