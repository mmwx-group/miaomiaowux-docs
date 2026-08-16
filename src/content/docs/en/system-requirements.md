---
title: "System Requirements"
description: "System requirements and port information for deploying MiaoMiaoWu X"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

## Master Requirements

| Item             | Requirement                   |
| ---------------- | ----------------------------- |
| Operating System | Linux (amd64/arm64) / Windows |
| Memory           | 128MB+                        |
| Disk             | 100MB+ (including database)   |
| Port             | 12889 (default, configurable) |

## Agent Requirements

| Item             | Requirement                                                             |
| ---------------- | ----------------------------------------------------------------------- |
| Operating System | Linux (amd64/arm64)                                                     |
| Memory           | 64MB+                                                                   |
| Port             | 23889 (Agent API, default)                                              |
| Network          | Can access master (WebSocket mode) or be accessed by master (HTTP mode) |

## Firewall Ports

| Port   | Usage                                  | Location      |
| ------ | -------------------------------------- | ------------- |
| 12889  | Master Web panel and API               | Master        |
| 23889  | Agent API (required for HTTP mode)     | Remote Server |
| 443    | TLS/REALITY inbound (Nginx camouflage) | Remote Server |
| Custom | Xray inbound port                      | Remote Server |
