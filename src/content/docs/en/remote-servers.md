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

The "used traffic" and quota limits in the server management list support two data sources. Switch via the "Server Traffic Source" option in the create/edit server dialog. "System NIC traffic" is the recommended default:

### System NIC Traffic (default, recommended)

Agent reads physical NIC RX + TX accumulation from /proc/net/dev — includes ALL traffic on the machine: Xray forwarding + SSH + apt update + monitoring/log uploads + tunnel overhead, etc. Matches the NIC billing meter shown on VPS provider panels. Excludes virtual NICs (WARP / Tailscale / Docker / wireguard).

### Xray Protocol Traffic

Aggregates inbound + outbound across all nodes on this server (SUM(uplink + downlink)). Only counts traffic that goes through Xray. Matches the Node View metric. Suitable for transit-only / pure-forwarding boxes — system traffic is negligible, and the number more closely reflects "actual user consumption".

Switching = automatic history migration, continuous display value

Xray → System: the master automatically copies the Xray cumulative + daily-snapshot history to the system dimension. The displayed "used traffic" stays the same the instant you switch. After that, system mode accumulates from real NIC counters and diverges naturally from Xray. Reverse (System → Xray) needs no migration — Xray daily snapshots are always captured regardless of source.

The "Stats Mode" option (Upload / Download / Both) applies to both data sources — each can be filtered to one direction or summed.

Node View, User View, and package traffic limit enforcement always use the Xray dimension (system NIC counters can't be split per tag or per user). This option does not affect them.

## Batch Agent Upgrade

After the master releases a new version, you can batch upgrade Agents across multiple servers in remote server management without SSH-ing into each one. The upgrade progress is displayed via streaming logs.

## Share Server with Other MiaoMiaoWu X

You can share one of your servers with another MiaoMiaoWu X master, allowing them to manage the server (create inbounds, nodes, etc.) from their panel without directly sharing the Agent token.

### Sharer (Owner)

Generate a share token for the server in server management (with optional prefix) and give it to the other party. Their operations will be forwarded through your master to the server.

### Receiver

In Add Server, select Join Shared Server and enter the share token. After joining, the server appears as a federated server in your list, with status refreshed by the owner; inbound / node / Tunnel management are all available.

Communication between master and Agent, and between masters in federation, uses encrypted channels (key negotiation + session caching). Token rotation does not affect online management.
