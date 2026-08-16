---
title: "Xray Outbound Management"
description: "Manage Xray outbound configurations and routing rules"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

## Outbound Configuration

Outbounds define how traffic leaves Xray. Default includes freedom (direct) and blackhole (block) outbounds.

| Type                  | Description                                                                                                                                             |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Freedom               | Direct outbound, traffic sent directly to target                                                                                                        |
| Blackhole             | Block outbound, drops all traffic                                                                                                                       |
| VLESS/VMess/Trojan/SS | Proxy outbound, traffic forwarded through another proxy server                                                                                          |
| Tunnel                | Tunnel outbound                                                                                                                                         |
| WARP v0.2.3+          | Cloudflare WARP egress (WireGuard). One-click install from "Add Outbound → Cloudflare WARP"; each agent gets its own WARP account for traffic isolation |

## Routing Rules

Routing rules determine how inbound traffic is distributed to different outbounds. Can route based on domain, IP, protocol, and other conditions.

- \- Supports domain matching (domain, full, regexp)
- \- Supports IP matching (CIDR, GeoIP)
- \- Supports protocol matching
- \- Supports port matching
- \- Supports inbound tag matching

## Operations

Managed in the Outbound and Routing tabs on the server details page. Supports adding, editing, and deleting outbounds and routing rules. Xray service restart required after changes.

## Cloudflare WARP Outbound

Since v0.2.3, miaomiaowuX ships one-click Cloudflare WARP integration. Each agent registers its own WARP account directly via the Cloudflare API (no wgcf binary required) and generates two WireGuard outbounds, warp-v4 and warp-v6, ready to be targeted from routing rules.

1\. Under the Outbound tab click "Add Outbound" → "Cloudflare WARP" to open the WARP panel.

2\. Click "Install WARP". The agent registers with Cloudflare, writes warp.json, and adds the warp-v4 + warp-v6 outbounds; the server card shows an orange W badge.

3\. To upgrade to WARP+, paste the license key and click "Upgrade WARP+". "Refresh Config" re-pulls and re-injects the outbounds idempotently (same tag, no duplicates).

### Quick Routing — Anti-CN-Routing

On servers with WARP installed, the routing panel's "Quick rules" dropdown gains an "Anti-CN-Routing" entry: one click routes geosite:google + geosite:meta through warp-v4, preventing Google/Meta traffic from being routed via Chinese exits.

### Notes

- \- Default MTU is 1420 (WireGuard standard). noKernelTun=false forces userspace gVisor TUN, so it works without host tun module / CAP_NET_ADMIN.
- \- Uninstall removes the Cloudflare account, deletes warp.json on the host, and drops warp-v4 / warp-v6 from xray in one shot.
