---
title: "Xray Routing Management"
description: "Manage Xray routing rules, control traffic forwarding policies"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

## Overview

The Xray routing module uses first-match semantics: rules are matched top to bottom, stopping at the first hit. Unmatched traffic goes to the default outbound (outbounds\[0\]). MiaoMiaoWu X provides two entry points for managing routing rules:

| Entry         | Location                              | Description                                                |
| ------------- | ------------------------------------- | ---------------------------------------------------------- |
| Node Routing  | Node Management -> Node Action Button | View and manage routing rules for a single node (inbound)  |
| Routing Panel | Xray Server -> Routing Tab            | Manage all server routing rules with drag-and-drop sorting |

## Routing Match Semantics

Xray routing rules follow these semantics:

- \- Rules match top to bottom, stopping at first hit (first-match)
- \- Multiple conditions in a single rule are AND (e.g., domain + protocol must both match)
- \- A rule with only inboundTag + outboundTag and no other conditions = catch-all, matching 100% of that inbound's traffic
- \- Global rules after catch-all no longer apply to that inbound
- \- When no rule matches, traffic goes to outbounds\[0\] (default outbound)

Therefore, rule order is critical. More specific rules should come first, catch-all rules last.

## Node Routing

On the node management page, each remote server node has a routing button. Click to open the node routing dialog.

### Exclusive Rules vs Global Rules

The dialog categorizes routing rules into two types:

- \- Exclusive rules: Rules containing the current node's inboundTag, only effective for this inbound
- \- Global rules: Rules without inboundTag, effective for all inbounds

### Catch-all Detection

If a catch-all rule exists in exclusive rules (only inboundTag + outboundTag, no domain/ip/protocol conditions), the system auto-hides the global rules and default outbound sections, showing a warning:

All traffic has been routed to \[outboundTag\], subsequent global rules and default outbound no longer take effect

### Outbound Name Resolution

The outboundTag in routing rules is automatically resolved to the corresponding node name. The system maps by matching the server:port in outbound config with the node's clash_config address.

## Routing Panel

In the Routing Tab of the Xray server management page, you can manage all routing rules for the remote server.

### Split Layout

The routing panel uses a left-right split design:

- \- Left (40%): Rule list, drag-and-drop sortable, click to select
- \- Right (60%): Selected rule detailed fields + JSON preview + delete button

### Drag and Drop Sorting

Since Xray routing uses first-match semantics, rule order directly affects matching results. Drag the handle on the left side of rule cards to reorder. Changes auto-save and restart Xray on release.

Sorting is implemented via action: 'set' to fully replace routing rules. API rules (outboundTag = api) are automatically kept at the top.

## Quick Rules

Built-in common quick rules that can be added with one click:

| Rule                  | Match Condition        | Outbound        | Description                                 |
| --------------------- | ---------------------- | --------------- | ------------------------------------------- |
| Block BT              | protocol: bittorrent   | block           | Block BitTorrent download traffic           |
| Block China IP        | ip: geoip:cn           | block           | Block access to mainland China IPs          |
| OpenAI Direct         | domain: geosite:openai | direct          | OpenAI related domains direct connection    |
| Block Private Network | ip: geoip:private      | block           | Block access to private network addresses   |
| RFC EMBY              | domain: rfc.uhdnow.com | Select required | EMBY unlock, requires specifying outbound   |
| TikTok Unlock         | domain: geosite:tiktok | Select required | TikTok unlock, requires specifying outbound |

## Outbound Load Balancing

Create a balancer to distribute traffic matching a routing rule across a group of outbounds, enabling multi-landing distribution / failover. Creation is available in Service Management routing config and Node Management routing dialog.

### Creation Steps

1\. Click Create Load Balancer in routing config.

2\. Use outbound prefix (selector) to select a group of outbounds (matched by tag prefix).

3\. Select distribution strategy (see table below).

4\. Add a routing rule pointing balancerTag to the balancer (not a single outboundTag).

5\. When creating from node management routing dialog, default rule's inboundTag = node's TAG, can be changed to apply to all nodes.

| Strategy   | Description                                                                     |
| ---------- | ------------------------------------------------------------------------------- |
| random     | Randomly pick one outbound                                                      |
| roundRobin | Round-robin through outbounds                                                   |
| leastPing  | Select lowest latency outbound (requires observation, auto-enables observatory) |
| leastLoad  | Select lowest load outbound (requires observation)                              |

When selecting leastPing / leastLoad, the system auto-configures observatory / burstObservatory for candidate outbound probing; random / roundRobin don't need probing.

## Custom Rules

Custom rules support all Xray routing fields. Empty fields are not submitted. Multiple values separated by commas.

| Field      | Type   | Example                     | Description                                                 |
| ---------- | ------ | --------------------------- | ----------------------------------------------------------- |
| domain     | Array  | geosite:openai, example.com | Domain matching, supports geosite:, domain:, full:, regexp: |
| ip         | Array  | geoip:cn, 10.0.0.0/8        | IP matching, supports geoip:, CIDR, plain IP                |
| protocol   | Array  | bittorrent, http, tls       | Protocol matching                                           |
| port       | String | 80, 443, 1000-2000          | Target port, supports ranges                                |
| sourcePort | String | 1234                        | Source port                                                 |
| network    | String | tcp / udp / tcp,udp         | Network type                                                |
| source     | Array  | 10.0.0.1                    | Source IP                                                   |
| user       | Array  | user@example.com            | User identifier                                             |
| inboundTag | Array  | inbound-tag-1               | Inbound tag, limits rule scope                              |
| attrs      | String | attrs\[':method'\] == 'GET' | Attribute matching expression                               |

## Auto Restart

After adding, deleting, or reordering routing rules on remote servers, the system automatically restarts Xray to apply changes. A toast notification is shown after completion.

## API Reference

| Endpoint                                       | Method | Description                                  |
| ---------------------------------------------- | ------ | -------------------------------------------- |
| /api/admin/remote/routing?server_id=N          | GET    | Get remote server routing config             |
| /api/admin/remote/routing?server_id=N          | POST   | Modify routing: add_rule / remove_rule / set |
| /api/admin/remote/outbounds?server_id=N        | GET    | Get remote server outbound list              |
| /api/admin/remote/services/control?server_id=N | POST   | Service control (restart Xray)               |

[< Xray Outbound Management](/docs/en/xray-outbounds)[\> Xray System Config](/docs/en/xray-system-config)
