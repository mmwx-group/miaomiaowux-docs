---
title: "Protocol Matrix"
description: "All protocol x transport x security combinations supported by MiaoMiaoWu X"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

## Full Matrix

Below are all available combinations (17 total) that have been tested and verified with mihomo connectivity tests.

| #   | Protocol    | Transport | Security              | Notes                                                              |
| --- | ----------- | --------- | --------------------- | ------------------------------------------------------------------ |
| 1   | VLESS       | TCP       | REALITY               |                                                                    |
| 2   | VLESS       | TCP       | REALITY + XTLS-Vision | flow: xtls-rprx-vision                                             |
| 3   | VLESS       | TCP       | TLS                   |                                                                    |
| 4   | VLESS       | TCP       | TLS + XTLS-Vision     | flow: xtls-rprx-vision                                             |
| 5   | VLESS       | WS        | TLS                   | WSS                                                                |
| 6   | VLESS       | gRPC      | REALITY               |                                                                    |
| 7   | VLESS       | XHTTP     | REALITY               |                                                                    |
| 8   | Trojan      | TCP       | TLS                   |                                                                    |
| 9   | Trojan      | TCP       | REALITY               |                                                                    |
| 10  | Trojan      | gRPC      | REALITY               |                                                                    |
| 11  | VMess       | TCP       | None                  |                                                                    |
| 12  | VMess       | TCP       | TLS                   |                                                                    |
| 13  | VMess       | WS        | None                  |                                                                    |
| 14  | VMess       | WS        | TLS                   |                                                                    |
| 15  | Shadowsocks | TCP       | None                  | AEAD: aes-256-gcm                                                  |
| 16  | Shadowsocks | TCP       | None                  | SS2022: 2022-blake3-aes-256-gcm                                    |
| 17  | Hysteria2   | UDP       | TLS                   | Requires TLS certificate                                           |
| 18  | AnyTLS      | TCP       | TLS                   | Requires TLS cert (recommended; mihomo/sing-box compatible)        |
| 19  | AnyTLS      | TCP       | REALITY               | Backend supported, but no Clash/Mihomo/sing-box client supports it |
| 20  | Snell       | TCP       | None                  | Snell v4 / v5: per-user PSK, supports obfs                         |
| 21  | Snell       | TCP       | None                  | Snell v6: shared PSK + clientID, hidden salt + shaping             |

## Deprecated Combinations

The following combinations have been deprecated or removed in Xray-core:

- \- HTTP/H2 transport: migrated to XHTTP stream-one (H2 & H3)
- \- Trojan + Flow (XTLS-Vision): Xray-core has removed flow support for Trojan

## mihomo Compatibility Notes

- \- Trojan in mihomo uses the sni field (not servername)
- \- XHTTP requires xhttp-opts to include headers: {}, with mode at the top level
- \- REALITY's short-id and public-key go in reality-opts
- \- Hysteria2 uses the hysteria2 type (not hysteria)
