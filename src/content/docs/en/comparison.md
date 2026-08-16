---
title: "MMW vs MMW-X"
description: "Detailed comparison of similarities and differences between MiaoMiaoWu and MiaoMiaoWu X"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

MiaoMiaoWu X is an enhanced version of MiaoMiaoWu, inheriting all core features (subscription generation, template system, custom rules, etc.) while adding enterprise-grade capabilities like remote server management, full Xray management, certificate management, and package management.

In short: MiaoMiaoWu is a subscription management platform, while MiaoMiaoWu X is a complete proxy service management platform. Below is a detailed feature comparison.

## Feature Comparison Overview

| Feature | MiaoMiaoWu | MiaoMiaoWu X |
| ------- | ---------- | ------------ |

|
Traffic Management

| Probe-based, imprecise stats | Agent-based, precise + auto-expiry |
|

Node Management

| Manual import / external sub sync | UI creation + steal-self / routed outbound / tunnel |
|

User Management

| Basic, local config still works after expiry | Package-bound, auto-revoke on expiry |
|

Server Management

| Not supported | Master-Agent remote management |
|

Certificate Management

| Not supported | ACME auto-apply / renew / deploy |
|

Package Management

| Not supported | Traffic quota / validity / rate limit |
|

Monitoring

| Probe traffic collection, node-level | Precise stats + real-time online tracking |
|

Subscription Generation

| 12+ client formats | 12+ client formats (inherited) |
|

Template System

| V3 template engine | V3 template engine (inherited) |
|

Custom Rules

| DNS / routing / rule sets | DNS / routing / rule sets (inherited) |
|

Security

| Silent mode / TOTP 2FA | Silent mode / TOTP 2FA (inherited) |
|

Deployment

| Docker / binary | Docker / binary (Master + Agent) |

## Traffic Management

### MiaoMiaoWu

- •Reads node traffic data through the probe system
- •Can only track node-level traffic, not per-user
- ✗After user expiry, local subscription configs still work since node info hasn't changed

### MiaoMiaoWu X

- Install MMW-Agent on servers to directly manage Xray service users and traffic
- Precise traffic statistics per user and per node
- Auto-revokes node access on user expiry, subscription credentials become invalid immediately
- Supports traffic quotas, rate limiting, device limits, and auto-ban on expiry

## Node Management

### MiaoMiaoWu

- •Manual node addition (fill in node info)
- •Sync nodes via external subscription links
- •Chain proxy, node grouping, sorting and basic management
- ✗To add nodes on a server, you must manually log in to configure, then import to MiaoMiaoWu

### MiaoMiaoWu X

- Create nodes for all protocols (VLESS/VMess/Trojan/SS/Hysteria2) via UI, 19 protocol combos with one click
- Steal-self: reuse existing inbound configs to quickly create new nodes
- Routed Outbound: transit node reuse for traffic splitting and multi-layer forwarding
- Port Forwarding Tunnel (dokodemo-door): create outbounds on existing servers, designate nodes as outbound targets
- Most Xray configuration needs can be done through the UI without logging into the server

## User Management

### MiaoMiaoWu

- •Create users, assign subscription files, manage user status
- •Supports setting user expiry, but requires manual handling after expiry
- ✗Local configs still work after user expiry (node info unchanged)

### MiaoMiaoWu X

- Users bound to packages with traffic quota, validity period, and accessible nodes
- Auto-revokes node access on expiry, credentials invalidated instantly
- Rate limiting and device count limits, auto-throttle on excess
- Precise traffic statistics and online user tracking

## Server Management

### MiaoMiaoWu

MiaoMiaoWu does not provide server management. All node configuration must be done manually on the server, then imported into the system.

### MiaoMiaoWu X

- Master-Agent architecture: control panel manages remote servers via WebSocket/HTTP/Pull
- Remote install/uninstall Xray and Nginx with SSE streaming progress
- Visual management of Xray inbounds, outbounds, and routing configuration
- Remote online Agent upgrade and uninstall without server login
- Share Server: encrypted communication (HTTPS + ECDH) for multi-user collaboration

## MMW-X Exclusive Features

### Embedded Xray (PRO)

Built-in Xray core with rate limiting, device limits, auto-throttle, online tracking, and more. No separate Xray installation needed, with hot-update capability.

### Routed Outbound

Node-level and per-user outbound routing. Landing node and transit node concepts for flexible traffic forwarding strategies.

### Share Server

Owner-Consumer model with encrypted communication (HTTPS + ECDH). Consumers have limited permissions (add inbounds, manage nodes, but cannot start/stop services or edit server settings).

### Certificate Management

ACME auto-apply and renew TLS certificates. Supports Cloudflare/Alibaba Cloud/Tencent Cloud/Namesilo DNS providers with auto-deployment to remote servers.

### Package Management

Create traffic packages with quota, validity, accessible nodes, and rate limit policies. Auto-managed once assigned to users.

### Nginx Management

Remote install/uninstall Nginx, manage config files, deploy SSL certificates, and manage Stream ports.

## Shared Features

MiaoMiaoWu X inherits all core features from MiaoMiaoWu. The following features are identical in both versions:

Subscription generation for 12+ client formats (Clash/Surge/Shadowrocket/Loon/QX, etc.)

V3 template engine with flexible subscription config templates

Custom DNS, routing rules, and rule set management

External subscription sync (scheduled auto-updates)

Chain proxy (multi-layer transit acceleration)

Silent mode and TOTP two-factor authentication

Telegram push notifications and daily reports

Backup and restore functionality

Override scripts (JavaScript Hooks)

Docker and binary deployment options

## Summary

If you only need subscription management and node import, MiaoMiaoWu is sufficient. It's simple, lightweight, and great for personal use.

If you need to manage multiple remote servers, precisely control user traffic and permissions, automate certificate management, or configure Xray through a UI without logging into servers, MiaoMiaoWu X is the better choice. Most of MMW-X's features are inherited from MMW, making the upgrade migration very straightforward.

[→ View Core Features](/docs/en/features)[→ Quick Start](/docs/en/quick-start)[→ Upgrade from MMW](/docs/en/upgrade-from-mmw)
