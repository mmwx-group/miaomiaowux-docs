---
title: "Client Settings"
description: "What each setting in the MeowX client (iOS / macOS / Android / Windows) does, and how to use po0 allowlisting"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

The four MeowX platforms share almost the same settings, in the same group order. This page walks through each group and has a dedicated section on the new [po0 allowlisting](#po0-allowlisting).

Where to find Settings:

| Platform | Location |
| --- | --- |
| iOS | The "Settings" tab at the bottom |
| macOS | Menu bar icon → drop-down panel → "Settings" page (MeowX has no main window) |
| Android / Windows | "Settings" in the bottom bar / sidebar |

Unless noted otherwise, changes **take effect immediately while connected**; no reconnect needed.

## Proxy

### DNS mode

| Option | Description |
| --- | --- |
| Follow subscription (default) | Uses the subscription's `dns.enhanced-mode` |
| Redir-Host | Returns real IPs; best compatibility |
| Fake-IP | Returns fake IPs from `198.18.0.0/16`; faster routing, a few apps that depend on real IPs may misbehave |

Changing DNS mode needs one reconnect. On iOS / macOS the app reconnects automatically if you change it while connected.

### Latency test

The three methods measure different things, so their numbers are not comparable:

| Method | What it measures |
| --- | --- |
| HTTPS latency (default) | Fetches the test URL through the node and counts one round trip on the warmed-up connection, same as the mihomo / FlClash default. Handshake cost is excluded, so it is the fairest way to compare nodes |
| Real connection latency | Measured from dialing: TCP, TLS / protocol handshake and the node connecting to the target. Roughly "how long the first page load takes" |
| TCPing | Only the TCP handshake to the node server, without the proxy protocol. Closest to network distance |

### Test URL

Presets: Cloudflare (default), Google, Google (connectivitycheck), Apple, or a custom URL. On networks in mainland China, Google URLs may be interfered with and show higher latency.

### Speed mode (iOS / macOS)

Direct traffic uses native system sockets for higher throughput. Turn it off to compare if a site misbehaves on direct connections.

### IPv6 (macOS)

| Option | Description |
| --- | --- |
| Off (default, recommended) | Does not take over IPv6; the system prefers IPv4 for global IPv6 destinations |
| Blackhole | Captures IPv6 into the tunnel and rejects it, forcing apps back to IPv4. No leaks, but apps that do not fall back (e.g. Telegram) may fail to connect |
| Proxy | Truly proxies IPv6; requires nodes with an IPv6 exit |

## Traffic control

These are **local client overrides**. They take priority over the subscription and survive subscription refreshes.

### Block QUIC

Drops UDP to port 443 so browsers, YouTube and similar fall back to TCP. Turn it on when a node handles UDP poorly; pages and video become more stable.

### Proxy APNs / Proxy push services

- **iOS / macOS "Proxy APNs"**: off by default, so Apple Push (`push.apple.com` and port 5223) always goes direct for timely notifications. If your network blocks some apps' push channels, turn it on to send push traffic through the proxy.
- **Android "Proxy push services"**: same idea; when off, FCM / GMS push goes direct.

### Per-app proxy (Android)

Choose per app whether it uses the proxy, in allowlist or blocklist mode.

### DNS override

Pins a domain's resolution to a fixed IP, ahead of the subscription's `hosts` and DNS. Domain syntax:

| Syntax | Matches |
| --- | --- |
| `+.example.com` | example.com and all subdomains |
| `*.example.com` | One level of subdomains |
| `example.com` | This exact domain |

### Bypass proxy

Matching domains or IP ranges always go direct. Enter domains (same syntax as above) or IP-CIDRs such as `10.0.0.0/8` or `2001:db8::/32`. Up to 1000 entries.

## Local proxy

Opens an HTTP + SOCKS5 mixed port on this device (both protocols share one port) for programs that ignore the system proxy, or for other devices on your LAN.

| Option | Description |
| --- | --- |
| Port | Default 7890 |
| Allow LAN | Lets other LAN devices connect to the port; when off only this device can. iOS asks for "Local Network" permission the first time |
| Username / Password | Optional. When set, LAN connections must authenticate; local connections never need to |

On macOS, "Copy terminal command" produces an `export https_proxy=…` command, and "Open terminal with proxy" opens a terminal window with the proxy already set.

## Subscription

### Sync interval

Manual / every 6 hours / every 12 hours / daily / every 3 days. When due, the current subscription is re-fetched the next time you open the app.

### po0 allowlisting switch

Off by default. See the next section, [po0 allowlisting](#po0-allowlisting).

## Logs

**Record logs**: warnings and errors are always recorded; when on, per-connection routing results, DNS failures and other details are recorded too.

- iOS: the "Connections" page, switched to "Logs".
- macOS: the panel's "Logs" page. Filter by source, "MeowX" (client events: connections, subscriptions, sign-in, system proxy, allowlist reports and so on) or "Engine" (the proxy core), by level, search, copy, and clear.
- Android / Windows: the "Logs" page.

## macOS only

| Option | Description |
| --- | --- |
| Launch at login | Starts MeowX after you log in |
| Show speed in menu bar | Shows live upload / download speed next to the menu bar icon |
| Default terminal | The terminal app used by "Open terminal with proxy" |
| Auto switch by Wi-Fi | Turns the proxy on / off when you join specific Wi-Fi networks, with separate choices for wired and other Wi-Fi. After you toggle manually, automatic decisions pause until the next network change. Requires Location permission the first time (macOS needs it to read the Wi-Fi name) |
| Check for updates | Checks manually; the app also checks once a day |
| Network extension (TUN) / System proxy helper | Install status of the system extension used by TUN mode and the helper used by system proxy mode |
| Exit IP | Two columns: "Direct" is your exit without the proxy, "Proxy" is the exit the current rules would use, with the node in parentheses |

## po0 allowlisting

### What it is

Some exit servers sit behind a **po0** firewall: only IPs on the po0 allowlist can reach the server's proxy ports. po0's allowlist endpoint adds **the source IP the request comes from**. It can only add yourself, not someone else, so the panel cannot report for you; your client has to connect to po0 directly.

Limits to keep in mind:

- **Each po0 server has only 5 allowlist slots, shared by all users**, evicted by "longest time since last report". Clients must re-report regularly to keep their slot.
- **The report must go direct.** If it goes through a proxy, the node's exit IP gets allowlisted and your own IP still cannot connect.

MeowX's "po0 allowlisting" handles all of this: it fetches the po0 servers you need to report to from the panel, reports to them directly on a schedule, and adds direct rules for their IPs.

### Requirements

| Component | Version |
| --- | --- |
| iOS / macOS | MeowX 0.3.4 or later |
| Android / Windows | MeowX 0.1.8 or later |
| Panel | Must support po0 server configuration (System Settings → "Security" → "Client IP allowlist" card has a "po0 server configuration" button) |

### Admin: register po0 servers in the panel

1. Open System Settings → the "Security" tab and find the "Client IP allowlist" card.
2. Click "po0 server configuration" and tick the servers that are po0 servers.
3. Enter each server's po0 token: the whole string starting with `pgnfw_` in the po0 allowlist link `https://<IP>/api/firewall/pgnfw_…/add`.
4. To pin an IP on that machine so it is never evicted, append `@slot`, for example `pgnfw_xxxx@0`; clients then request `…/add?slot=0` to pin it to slot 0. Each IP can occupy only one slot.
5. Save.

The panel only gives each user the po0 servers **hosting subscription nodes that user can access**. If there are none, the client gets an empty list and reports nothing.

### User: turn it on in the client

Turn on Settings → "po0 allowlisting" (in "Traffic control" on iOS / macOS, in "Subscription" on Android / Windows). You must be signed in to a panel account.

Once on, the client:

1. Fetches the po0 server list right away and reports to each server once.
2. Re-reports **every 10 minutes** to keep the slot. The server list is refreshed periodically too, so changes made by the admin are picked up automatically.
3. Reports immediately on **network changes** (switching Wi-Fi / cellular, joining a new network). On iOS / macOS it also reports when the app returns to the foreground while the tunnel is disconnected.
4. Adds a direct rule for each po0 server IP:

   ```
   IP-CIDR,<po0 server IP>/32,DIRECT,no-resolve
   ```

   IPv6 addresses use `IP-CIDR6,<IP>/128,DIRECT,no-resolve`. The rule sits ahead of all subscription rules, so traffic to the po0 server itself goes direct and comes from the IP you just allowlisted. It is not written into the subscription config and survives subscription refreshes. On iOS / macOS it applies in rule mode only.

Turning the switch off stops reporting immediately and removes these direct rules. Signing out stops it as well.

Reports are sent whether or not the tunnel is connected, so you do not need to stay connected. On iOS, the app reports while the tunnel is down and is suspended by the system in the background; while the tunnel is up, the network extension reports and keeps the schedule in the background too.

Reports always bypass proxies and VPNs and leave through the physical network interface. On macOS this holds even if another VPN client is running at the same time.

### Check that it works

- **Client logs**: with "Record logs" on, search the logs page for `po0`. A success looks like this (wording varies slightly by platform):

  ```
  po0 加白（启动 · 1.2.3.4）成功：名单 2/5，当前 IP 203.0.113.9
  ```

  "当前 IP" (current IP) is the source IP po0 saw. It should match your broadband / mobile exit.
- **macOS rules page**: the top of the rule list shows `<po0 IP>/32 · IP-CIDR → DIRECT`, with hit counts in the "Stats" column.
- **Panel**: Personal Settings → "Client IP allowlist" lists your po0 server report URLs.

### FAQ

**"Current IP" is not my broadband exit**

The report did not truly go direct. Common causes:

- Another proxy on this device or on your router is taking over traffic (for example a transparent proxy on the router).
- You are on an old client. Upgrade to the versions listed above.

**The log says "token invalid (403)"**

The po0 token has changed. The admin should enter the new token in the panel's "po0 server configuration"; clients pick it up the next time they fetch the list, without toggling the switch.

**It stops working after a while**

Each po0 server has only 5 slots, and users sharing it evict whoever reported longest ago. Keep "po0 allowlisting" on; the client re-reports every 10 minutes. If there are more users than slots, the admin can pin always-on devices to fixed slots or spread users across servers.

**The switch is on but nothing is reported**

- The panel does not support po0 server configuration yet, so the client gets an empty list.
- None of the nodes you can access are on a po0 server.
- You are not signed in to a panel account.

**Reporting from your own script**

Personal Settings → "Client IP allowlist" in the panel lists the po0 report URLs. Alongside the panel allowlist link, your script should also `POST` to these URLs **directly** (`Content-Type: application/json`, empty body). po0 servers use self-signed certificates, so skip certificate verification for these requests.
