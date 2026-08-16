---
title: "Node Management"
description: "Manage all proxy nodes — three sources (Xray inbounds auto-sync / remote servers / external subscriptions), enable/disable, rename, sort, group, plus tunnel forwarding and visual online-status indicators."
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

![Node Management page screenshot](/images/screenshots/doc-nodes-page.webp)

Node Management — inbound nodes grouped by server, supports batch edit / toggle / sync

## Overview

Nodes are the subscription system's representation of inbound configurations. After each inbound is created, the system automatically generates corresponding nodes for subscription distribution.

## Node Sources

| Source                       | Description                                      | Sync Method      |
| ---------------------------- | ------------------------------------------------ | ---------------- |
| Xray Inbound                 | Protocol inbounds created via the inbound wizard | Auto Sync        |
| Remote Server Inbound        | Inbound configurations on remote servers         | Auto Sync        |
| External Subscription Import | Nodes imported from external subscription links  | Manual/Scheduled |

## Auto Sync

When inbound configurations change, the system automatically triggers node sync via the event bus. The sync process converts inbound configurations to mihomo/Clash compatible proxy node format.

Sync trigger conditions:

- \- Create new inbound
- \- Modify inbound configuration
- \- Delete inbound
- \- Remote server inbound changes

## Node Operations

| Operation         | Description                                                                                                                                                                                                                             |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Rename            | Customize the node's display name in subscriptions                                                                                                                                                                                      |
| Sort              | Adjust the node's order in subscriptions                                                                                                                                                                                                |
| Group             | Assign nodes to different proxy groups                                                                                                                                                                                                  |
| Multi-Tag v0.2.3+ | Since v0.2.3 nodes support multiple tags: the edit dialog lets you add / remove tags freely; frontend filters and package selected_tags match if any tag hits. Existing single-tag nodes are auto-backfilled to a single-element array. |

## Port Forwarding

### Tunnel Configuration

#### Chained Tunnel

Use multiple Agent servers to forward traffic to a selected exit node, or enter the target address and port manually.

#### Port Forwarding

Forward a port on one Agent to a selected exit node, or enter the target address and port manually.

### Relay Configuration

Relay configuration does not make MiaoMiaoWu X handle the forwarding. It is typically used after configuring forwarding externally, then adding that forwarding configuration to a node.

## URI Management

View the protocol:// URI configurations for every node belonging to every user.

## Sort Mode

When enabled, drag nodes or use the quick-move buttons to reorder them. Disable sort mode afterward to save the new order.

## Tunnel (Dokodemo-door) Management

A Tunnel (dokodemo-door) inbound forwards traffic on a port of one server to another target (an existing node or a fixed address) — commonly used for entry→exit relay chains. Tunnel inbounds do not appear in the node list; manage them from the "Tunnel Management" entry at the top of Node Management (aggregated across all remote / shared servers).

### Adding a Tunnel (two modes)

Add from "Tunnel Management", or pick the Tunnel protocol when adding an inbound. The forward target can be given two ways:

### ① Forward an Existing Node (Recommended)

When adding an inbound, select Tunnel protocol, then choose "Forward Existing Node" - it automatically fills in the forwarding address/port/network type based on the selected node. After creation, a companion node is auto-generated: named "Original Node Name | Tunnel", with the inbound tag of the tunnel. The Clash config clones the original node but changes the server address and port to the tunnel server's IP and listen port - so clients connecting to the tunnel server use the forwarding chain.

### ② Port Forward (to a fixed target)

Enter the target address and port directly (no existing node needed); the tunnel server forwards traffic from a listen port straight to that target. Good for relaying arbitrary exits (non-panel nodes) or custom chains. You can also forward UDP — required for games / voice, otherwise UDP is dropped.

### Port-forward Reuse Mode (split by domain / IP)

Under "Tunnel Management → Port Forward", you can reuse an existing tunnel inbound and only divert specific domains / IPs through it — internally this adds a routing rule + a freedom outbound to that inbound, instead of opening a new listen port.

Such rules carry a yellow "Port Forward" badge in the Routing panel; delete them from the "Tunnel Management" list, not directly in Routing, to avoid orphaned outbounds.

### Switching a Node's Server Address (Relay)

In the node list, each node's server address can be switched to a relay entry: its clash server / port is changed to a tunnel server's entry address & port, so clients go through the relay chain, while the original exit address is kept as "original server".

After setting up a port-forward to an exit node, MiaomiaowuX automatically switches that node’s address to the tunnel entry (entryHost:listenPort), saving a manual step; if auto-switch fails it does not affect the forward and you can switch manually.

A relayed node shows an extra "original server" line under its address — click to edit or revert to the original address.

### "Forwarded by Tunnel" Indicator

If a node is being forwarded by a tunnel, it shows a "Forwarded by Tunnel" tag in the node list. Hovering shows which server's tunnel is forwarding it.

Tunnel management is an admin feature; also works with received shared servers. Deleting a tunnel also cleans up its companion node.

## Notes

- \- Nodes auto-generated from inbounds are automatically updated when the inbound is modified
- \- Manually renamed nodes will not be overwritten by auto sync
- \- Disabled nodes will not appear in any subscription output
- \- After a node resolves to IP, you can one-click "Restore Domain" to restore the original domain before resolution (does not affect the node's server)
- \- New nodes default to their owning server's name as the tag, making it easy to filter by server. Legacy tags like "manual entry" are left untouched.
