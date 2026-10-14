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

### Why are there no Miu nodes in my subscription?

Miu is an in-house protocol and is sent to the officially recommended client MeowX only by default. When another client pulls the subscription, or a temporary subscription is used, Miu nodes are filtered out — a core that does not know Miu, such as the official mihomo, fails to load the whole config when it meets one. Once you are sure the people using the subscription run a client that supports Miu, turn on "Send Miu nodes to all clients" under Node Management → Utilities. See [Miu](/docs/en/protocol-miu#subscription-rule).

### Why can't I pick AnyTLS / Snell / Mieru / Miu / WireGuard on some servers?

These protocols are provided by the embedded Xray core; the official xray does not have them. On a server in external Xray mode they cannot be selected in the wizard. Switch the server to embedded mode to use them, see [Embedded Xray](/docs/en/embedded-xray).
