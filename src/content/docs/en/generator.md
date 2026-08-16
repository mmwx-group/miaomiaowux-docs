---
title: "Generate Subscription"
description: "One-click subscription link generation; automatic conversion to 12+ client formats (Clash / Mihomo / Shadowrocket / Surge / Stash / Surfboard / V2Ray / SingBox / Quantumult X, etc.); supports template overlay and custom rules."
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

![Generate Subscription page screenshot](/images/screenshots/doc-generator-page.webp)

Generate Subscription page — pick nodes / client format / rules, generate the link in one click

## Overview

The subscription system converts nodes into formats supported by various clients and distributes them to users through unique links. Supports multiple mainstream client formats.

## Supported Client Formats

| Format          | Client              | Platform          |
| --------------- | ------------------- | ----------------- |
| Clash/ClashMeta | mihomo, Clash Verge | All Platforms     |
| Surge           | Surge               | macOS / iOS       |
| Loon            | Loon                | iOS               |
| Quantumult X    | Quantumult X        | iOS               |
| Shadowrocket    | Shadowrocket        | iOS               |
| SingBox         | sing-box            | All Platforms     |
| Stash           | Stash               | macOS / iOS       |
| Surfboard       | Surfboard           | Android           |
| V2Ray           | V2RayN, V2RayNG     | Windows / Android |
| Egern           | Egern               | iOS               |

## Subscription Link

```
https://your-domain.com/api/clash/subscribe?token=<用户Token>&format=<格式>
```

`token` — User's subscription token (generated in user management)

`format` — Output format (clash, surge, loon, qx, shadowrocket, singbox, stash, surfboard, v2ray, egern)

## Conversion Flow

1\. User requests subscription via subscription link

2\. System verifies Token and retrieves user's available nodes

3\. Selects the corresponding format converter based on the format parameter

4\. Applies subscription template (if configured)

5\. Outputs final subscription content
