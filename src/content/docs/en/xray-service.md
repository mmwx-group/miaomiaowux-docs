---
title: "Xray Service Management"
description: "Remote install/uninstall Xray and Nginx, service start/stop control"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

## Xray Installation

On the Service Management page, click the Install Xray button on the server card.

- \- Installation progress displayed via SSE streaming in real-time
- \- Auto-downloads latest Xray-core and configures as system service
- \- Auto-triggers certificate deployment after installation (if configured)
- \- Auto-scans and syncs inbounds to node table after installation

## Nginx Installation

Nginx is used for TLS camouflage, forwarding port 443 traffic to Xray.

- \- If the server has a domain configured, Nginx reverse proxy is auto-configured during installation
- \- Supports SSE streaming installation progress
- \- Auto-triggers certificate deployment after installation

## Service Control

| Operation | Description                                                  |
| --------- | ------------------------------------------------------------ |
| Start     | Start Xray/Nginx service                                     |
| Stop      | Stop Xray/Nginx service                                      |
| Restart   | Restart Xray/Nginx service (required after config changes)   |
| Uninstall | Completely uninstall Xray/Nginx                              |
| Scan      | Scan service status and version info, sync inbounds to nodes |

## Config File Management

View and edit Xray/Nginx configuration files directly on the server details page. Supports multi-config file list, online editing and saving. Restart the corresponding service after config changes.
