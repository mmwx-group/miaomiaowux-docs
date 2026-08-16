---
title: "Xray Inbound Management"
description: "Create and manage Xray inbound configurations using the inbound wizard"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

This page only manages Xray inbounds — it's NOT the node management page

Node operations (add / enable / disable / delete / rename) belong to [Node Management](/docs/en/nodes)。

## Inbound Wizard

The inbound wizard provides a visual configuration flow, guiding you through protocol, transport, security layer, and parameter selection to automatically generate complete Xray inbound configurations.

1. Select protocol: VLESS / VMess / Trojan / Shadowsocks / Hysteria2
2. Select transport: TCP / WebSocket / gRPC / XHTTP
3. Select security layer: TLS / REALITY / None / XTLS-Vision
4. Configure port (auto conflict detection)
5. Configure protocol parameters (UUID/password auto-generated)
6. Preview and create

## Supported Combinations

Different protocols support different transport and security layer combinations. For the detailed combination matrix, see [Protocol Matrix](/docs/en/protocol-matrix).

| Protocol    | Transport            | Security                  |
| ----------- | -------------------- | ------------------------- |
| VLESS       | TCP, WS, gRPC, XHTTP | TLS, REALITY, XTLS-Vision |
| VMess       | TCP, WS              | TLS, None                 |
| Trojan      | TCP, gRPC            | TLS, REALITY              |
| Shadowsocks | TCP                  | None                      |
| Hysteria2   | UDP                  | TLS                       |

## Inbound Operations

- \- Inbounds auto-sync as nodes after creation (viewable in Node Management)
- \- Deleting an inbound auto-deletes the corresponding node
- \- View complete JSON configuration of inbounds
- \- Filtering: auto-hides API inbounds and runtime inbounds with empty tags

## Auto Sync

Inbound creation/deletion automatically syncs to the node table via event bus. The sync process automatically converts Xray inbound configurations to mihomo/Clash compatible proxy configuration format.
