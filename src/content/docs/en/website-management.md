---
title: "Nginx Website Management"
description: "Manage static sites and reverse proxies deployed by MiaomiaowuX on an Agent"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

![Server management page](/images/screenshots/doc-xray-servers-page.webp)

## Open Website Management

Open Server Management and choose Website Management from the target server's Agent menu. The page scans MiaomiaowuX's default Nginx servers directory, identifies static and reverse-proxy sites, and lets you add or remove them.

### Static site

Enter a domain and an absolute directory on the server. Ensure the Agent can read it before saving.

### Reverse proxy

Enter a domain and upstream such as 127.0.0.1:8080. The template supplies WebSocket and common forwarding headers.

## Installation and runtime

The Agent can install Nginx when absent and reuse a compatible existing installation. Service control is selected for the environment:

- • systemd, OpenRC, or SysV service management
- • direct nginx start, reload, and stop commands when no service manager exists
- • the Docker image includes Nginx and does not require systemctl

Port and master protection

Port 80/443 conflicts are checked before changes. When the master already serves HTTPS, a same-host Agent cannot enable Steal Self because taking port 443 would disconnect the panel. Removing a site deletes only the MiaomiaowuX-managed config, not its static files or upstream application.
