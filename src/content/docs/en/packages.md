---
title: "Package Management"
description: "User packages and traffic quotas"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

## Try it: package management

4 mock packages — create, edit, delete; each picks bound nodes / quota / cycle / direction-based metering.

Mock demoPackage grid · create/edit dialog with node multi-select · fully local

Try it: package management4

**Create package**

基础版

18 users

Quota

100 GB

Cycle

30 days

Metering

Two-way

Bound nodes (3)

🇭🇰 香港 GoMami - HKT🇭🇰 香港 GoMami - Trojan🇸🇬 新加坡 LightNode

进阶版

24 users

Quota

300 GB

Cycle

30 days

Metering

Two-way

Bound nodes (5)

🇭🇰 香港 GoMami - HKT🇭🇰 香港 GoMami - Trojan🇺🇸 美国 Megabox - Reality🇯🇵 日本 Pulse - Hy2🇸🇬 新加坡 LightNode

尊享版

7 users

Quota

1024 GB

Cycle

30 days

Metering

Two-way

Bound nodes (6)

🇭🇰 香港 GoMami - HKT🇭🇰 香港 GoMami - Trojan🇺🇸 美国 Megabox - Reality🇯🇵 日本 Pulse - Hy2🇸🇬 新加坡 LightNode🇩🇪 德国 Hetzner - Reality

体验版(7天)

5 users

Quota

20 GB

Cycle

7 days

Metering

Download only

Bound nodes (2)

🇭🇰 香港 GoMami - HKT🇸🇬 新加坡 LightNode

## Overview

Packages define the traffic quota, validity period, and accessible node scope for users. Each user can be bound to one package.

## Package Attributes

| Attribute       | Description                                   |
| --------------- | --------------------------------------------- |
| Name            | Package display name                          |
| Traffic Quota   | Monthly available traffic (GB), 0 = unlimited |
| Validity Period | Package validity in days                      |
| Node Access     | Accessible nodes/node groups                  |
| Rate Limit      | Bandwidth limit (optional)                    |

## Create Package

1\. Go to the "Package Management" page

2\. Click "Add Package"

3\. Enter package name and quotas

4\. Select accessible node scope

5\. Save the package

## Rate Limit & Devices

Packages can set speed limits (Mbps) and device limits; individual user overrides can also be set in user management (user-level overrides package-level).

### Rate Limit

Set the limit in Mbps, 0 means unlimited. Once set, the Agent-side rate limiter enforces it on user connections; the UI provides unit conversion hints.

### Auto Rate Limit / Release

You can enable auto rate limiting on quota exceed: when user traffic exceeds quota, speed is automatically reduced (instead of cutting subscription), and automatically released when traffic resets next month or quota is restored.

## Traffic Statistics & Billing Multiplier

The system uses the Xray traffic collector to track each user's traffic in real-time. When a user's billed traffic exceeds the package quota, the subscription automatically stops returning nodes (or reduces speed via auto rate limiting).

- \- The underlying user_traffic table stores raw traffic (upload + download), tracked by node and user separately
- \- Packages can select billing direction: unidirectional (oneway, x1) or bidirectional (twoway, x2)
- \- Billed traffic = raw traffic (upload + download) x multiplier; quota exceedance is judged by billed traffic
- \- Traffic resets monthly; administrators can manually reset user traffic

The "Used Traffic" shown on the homepage and user list shows per-server billing figures for admins (unlimited servers are marked separately), and for users shows billed traffic converted by their package multiplier.
