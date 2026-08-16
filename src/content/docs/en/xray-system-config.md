---
title: "Xray System Config"
description: "Xray global configuration: log, DNS, policy, etc."
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

## Overview

Xray system configuration contains global-level settings that affect all inbound and outbound behavior. Manageable in the System Config tab on the server details page.

## Configuration Items

| Config     | Description                                     |
| ---------- | ----------------------------------------------- |
| Log Level  | none / error / warning / info / debug           |
| DNS        | Custom DNS server configuration                 |
| Policy     | Connection policy, buffer size, etc.            |
| Statistics | Traffic statistics toggle                       |
| API        | gRPC API configuration (for traffic statistics) |

## Notes

- \- Restart Xray service after modifying system config
- \- Enabling traffic statistics slightly increases memory usage
- \- API inbound is for gRPC traffic statistics, do not delete
