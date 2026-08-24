---
title: "Remote Servers"
description: "Add and manage remote servers, Master-Agent architecture"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

![Server Management page screenshot](/images/screenshots/doc-xray-servers-page.webp)

Server Management — servers shown as cards, with status / live speed / traffic / Xray info / one-click actions

## Overview

MiaoMiaoWu X uses a Master-Agent architecture. The master communicates with Agents on remote servers over the network to install, configure, and manage Xray/Nginx remotely.

## Add Server

1. Go to Service Management, click Add Server
2. Enter server name (for identification)
3. Enter server IP address
4. Enter domain (optional, for TLS certificates and Nginx camouflage)
5. Select steal mode (tunnel/steal, affects node port generation)
6. System automatically generates Server Token and Agent Token
7. Use Token to deploy Agent on the remote server

**Two deployment options:** One-click script (bare metal + systemd) or Docker image (embedded xray + nginx built-in, host network required). Full commands and constraints in [Install Agent docs](/docs/en/install-agent)。

## Connection Modes

### WebSocket (Recommended)

Agent actively connects to master, maintaining a persistent connection. Real-time bidirectional communication, supports scan result push.

### HTTP

Master directly calls Agent HTTP API. Requires Agent port (default 23889) to be reachable from master.

### Pull

Agent periodically pulls commands from master. Suitable for NAT or firewall-restricted environments.

### Auto

Automatically tries WebSocket -> HTTP -> Pull fallback chain, selecting the optimal connection method.

## Token Management

Each server has two Tokens:

- \- Server Token: Credential for Agent to connect to master
- \- Agent Token: Credential for master to call Agent API

Tokens can be reset on the server details page. After reset, Agent will automatically receive the new Token via WebSocket.

## Server Status

| Status       | Description                          |
| ------------ | ------------------------------------ |
| connected    | Agent connected, manageable          |
| disconnected | Agent disconnected                   |
| pending      | Waiting for Agent's first connection |

## Server Traffic Data Source

The "used traffic" and quota limits in server management support two data sources. Switch via Server Traffic Source in the create/edit dialog. Xray traffic is the default; choose System NIC when you need to align with a provider's NIC meter.

### System NIC Traffic

The Agent reads physical-NIC RX/TX from `/proc/net/dev`, including Xray forwarding, SSH, updates, monitoring, and tunnel overhead. This is usually closer to a VPS provider's NIC meter, although provider sampling can still differ. Virtual interfaces such as WARP, Tailscale, Docker, and WireGuard are excluded.

### Xray Protocol Traffic

Aggregates Xray inbound and outbound counters in the server's `node_traffic` rows. Traffic · Nodes additionally performs user attribution, routed-child splitting, and parent subtraction, so the two views are not guaranteed to match.

Switching = automatic history migration, continuous display value

Xray → System: the master automatically copies the Xray cumulative + daily-snapshot history to the system dimension. The displayed "used traffic" stays the same the instant you switch. After that, system mode accumulates from real NIC counters and diverges naturally from Xray. Reverse (System → Xray) needs no migration — Xray daily snapshots are always captured regardless of source.

Stats Mode (Upload / Download / Both / Maximum direction) applies to either source.

Live upload/download rates on the card always come from the system NIC and do not follow this source or mode.

Node View, User View, and package traffic limit enforcement always use the Xray dimension (system NIC counters can't be split per tag or per user). This option does not affect them.

Server cards, the home summary, Traffic views, and public probes do not all use the same time window. See [Traffic accounting](/docs/en/traffic-accounting) for formulas and page-by-page differences.

## Batch Agent Upgrade

After the master releases a new version, you can batch upgrade Agents across multiple servers in remote server management without SSH-ing into each one. The upgrade progress is displayed via streaming logs.

## Share Server with Other MiaoMiaoWu X

You can share one of your servers with another MiaoMiaoWu X master, allowing them to manage the server (create inbounds, nodes, etc.) from their panel without directly sharing the Agent token.

### Sharer (Owner)

Generate a share token for the server in server management (with optional prefix) and give it to the other party. Their operations will be forwarded through your master to the server.

### Receiver

In Add Server, select Join Shared Server and enter the share token. After joining, the server appears as a federated server in your list, with status refreshed by the owner; inbound / node / Tunnel management are all available.

Communication between master and Agent, and between masters in federation, uses encrypted channels (key negotiation + session caching). Token rotation does not affect online management.
