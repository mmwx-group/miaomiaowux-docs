---
title: "Protocols & Inbounds"
description: "Protocol choice, inbound config, certificates."
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

### Which protocol is recommended?

Recommended: VLESS + TCP + REALITY + XTLS-Vision. No domain or certificate needed, best performance. For CDN relay, use VLESS/VMess + WebSocket + TLS.

### What's the difference between REALITY and TLS?

TLS requires a domain and certificate, REALITY does not. REALITY disguises itself as the target website's TLS handshake to avoid detection, offering higher security. However, REALITY does not support CDN relay.

### Why doesn't Trojan support XTLS-Vision?

Xray-core has removed flow (XTLS-Vision) support for Trojan. For Vision flow control, please use the VLESS protocol.
