---
title: "About MiaoMiaoWu X"
description: "MiaoMiaoWu X is an enhanced version of MiaoMiaoWu, focused on remote server management and Xray configuration"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

## What is MiaoMiaoWu X

MiaoMiaoWu X (MMWX) is an enhanced version based on MiaoMiaoWu. It retains all existing subscription management features while adding advanced capabilities such as remote server management, full Xray service management, certificate management, and package management.

It uses a Master-Agent architecture where the master node communicates with Agents on remote servers via WebSocket/HTTP, enabling unified management of multiple servers.

## Architecture Overview

```
┌─────────────────────────────────────────┐
│           妙妙屋X (Master)              │
│                                         │
│  ┌──────────┐  ┌──────────┐  ┌───────┐ │
│  │ 节点管理  │  │ 用户管理  │  │ 证书  │ │
│  └──────────┘  └──────────┘  └───────┘ │
│  ┌──────────┐  ┌──────────┐  ┌───────┐ │
│  │ 订阅生成  │  │ 套餐管理  │  │ 模板  │ │
│  └──────────┘  └──────────┘  └───────┘ │
│                                         │
│         WebSocket / HTTP / Pull         │
└────────┬──────────┬──────────┬──────────┘
         │          │          │
    ┌────▼───┐ ┌───▼────┐ ┌──▼─────┐
    │ Agent  │ │ Agent  │ │ Agent  │
    │ Server1│ │ Server2│ │ Server3│
    │ (Xray) │ │ (Xray) │ │ (Xray) │
    └────────┘ └────────┘ └────────┘
```

## Differences from MiaoMiaoWu

| Feature                  | MiaoMiaoWu        | MiaoMiaoWu X               |
| ------------------------ | ----------------- | -------------------------- |
| Node Management          | Manual add/import | Manual + Remote sync       |
| Remote Server Management | \-                | Master-Agent               |
| Xray Inbound/Outbound    | \-                | Visual Management          |
| Certificate Management   | \-                | ACME Automation            |
| Package Management       | \-                | Traffic Packages           |
| Subscription Generation  | 12 client formats | 12 client formats          |
| User Management          | Basic             | Enhanced (package binding) |
| Template System          | V3 Template       | V3 Template                |

## Next Steps

[\-> View Core Features](/docs/en/features)[\-> Quick Start](/docs/en/quick-start)
