---
title: "Core Features"
description: "Overview of MiaoMiaoWu X main features and capabilities"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

### Remote Server Management

Master-Agent architecture with WebSocket/HTTP/Pull modes for managing remote servers. Supports auto-reconnect, token rotation, and status monitoring.

### Xray Service Management

Remote install/uninstall Xray and Nginx, service start/stop control, SSE streaming installation progress.

### Xray Inbound Management

Visual inbound configuration wizard supporting VLESS/VMess/Trojan/Shadowsocks/Hysteria2 protocols, TCP/WS/gRPC/XHTTP transport, TLS/REALITY security.

### Protocol Matrix

Complete protocol x transport x security combination support with auto-generated mihomo/Clash compatible node configs.

### Certificate Management

ACME auto certificate issuance supporting Cloudflare/Alibaba Cloud/Tencent Cloud/Namesilo DNS providers with auto-deployment to remote servers.

### Package Management

Traffic package configuration with traffic/time quotas and user-package binding.

### User Management

Multi-user management, role-based access control, subscription assignment, traffic statistics.

### Subscription Generation

Supports 12 client formats including Clash/Stash/Shadowrocket/Surge/Loon/QX/SingBox.

### Template System

V3 template engine with flexible subscription configuration templates, supporting custom rules and proxy groups.

### Custom Rules

Custom DNS, routing rules, rulesets for fine-grained traffic control.

### Nginx Management

Remote install/uninstall Nginx, config file management, SSL certificate deployment, Stream port management.

### Agent Upgrade Management

Remote online Agent upgrade and uninstall with SSE streaming progress, no manual server login required.

### System Monitoring

Remote server system info (CPU, memory, disk), real-time network speed monitoring, traffic statistics and reporting.

### Domain Latency Probe

Batch TCP latency probing (up to 200 domains), 16 concurrent checks, for node quality assessment.

### System Settings

External subscription sync, feature toggles (silent mode/short links/override scripts/proxy collections), Telegram notifications, proxy group config sync, all settings take effect immediately.

[\-> Start Using MiaoMiaoWu X](/docs/en/quick-start)
