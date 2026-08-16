---
title: "Subscription Files"
description: "Import third-party subscriptions as external node sources: supports Clash / V2Ray / Shadowsocks / Trojan / Hysteria, auto-updates on schedule, merges those nodes alongside your own into the same package subscription."
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

![Subscription Files page screenshot](/images/screenshots/doc-subscribe-files-list.webp)

Subscription Files page — manage templates, V3 binding, node selection, short links

## Overview

The subscription files feature allows importing nodes from external subscription links, merging them with locally generated Xray inbound nodes, and distributing them uniformly through the subscription system.

## Supported Formats

- \- Clash/mihomo YAML format
- \- Base64 encoded node list
- \- Single-line URI format (ss://, vmess://, vless://, trojan://)

## Add Subscription

1\. Go to the Subscription Files management page

2\. Click Add Subscription

3\. Enter subscription name and URL

4\. Set auto-update interval (optional)

5\. After saving, the system automatically fetches and parses nodes

## Auto Update

You can set an auto-update interval for each subscription. The system will periodically fetch the latest subscription content and update the node list.

| Update Interval | Use Case                        |
| --------------- | ------------------------------- |
| Manual          | Nodes are stable, rarely change |
| Hourly          | Nodes change frequently         |
| Daily           | General use                     |
| Custom          | Set as needed                   |

## Notes

- \- Imported nodes are merged with local inbound nodes in output
- \- Imported nodes can be enabled/disabled and renamed
- \- After changing subscription URL, manually trigger an update
