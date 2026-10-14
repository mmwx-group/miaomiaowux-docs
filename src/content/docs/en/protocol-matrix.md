---
title: "Protocol Matrix"
description: "All protocol x transport x security combinations supported by MiaoMiaoWu X"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

## Full Matrix

Below are all 27 combinations the add-node wizard offers. Unless a note says otherwise, they all work with mihomo-family clients. The add-node wizard only shows the transports and security layers valid for the selected protocol:

![Add node wizard protocol selection screenshot](../../../assets/screenshots/nodes-add-vless-reality.webp)

The three button rows at the top of the wizard: protocol → transport → security

| #   | Protocol    | Transport | Security              | Notes                                                                                   |
| --- | ----------- | --------- | --------------------- | --------------------------------------------------------------------------------------- |
| 1   | VLESS       | TCP       | REALITY               |                                                                                         |
| 2   | VLESS       | TCP       | REALITY + XTLS-Vision | flow: xtls-rprx-vision                                                                  |
| 3   | VLESS       | TCP       | TLS                   |                                                                                         |
| 4   | VLESS       | TCP       | TLS + XTLS-Vision     | flow: xtls-rprx-vision                                                                  |
| 5   | VLESS       | TCP       | Encryption (ENC)      | VLESS's own encryption, no certificate; not supported by sing-box, Quantumult X or Loon |
| 6   | VLESS       | WS        | TLS                   | WSS                                                                                     |
| 7   | VLESS       | gRPC      | REALITY               |                                                                                         |
| 8   | VLESS       | XHTTP     | REALITY               |                                                                                         |
| 9   | Trojan      | TCP       | TLS                   |                                                                                         |
| 10  | Trojan      | TCP       | REALITY               |                                                                                         |
| 11  | Trojan      | gRPC      | REALITY               |                                                                                         |
| 12  | VMess       | TCP       | None                  |                                                                                         |
| 13  | VMess       | TCP       | TLS                   |                                                                                         |
| 14  | VMess       | WS        | None                  |                                                                                         |
| 15  | VMess       | WS        | TLS                   |                                                                                         |
| 16  | Shadowsocks | TCP       | None                  | AEAD, aes-256-gcm by default                                                            |
| 17  | Shadowsocks | TCP       | None                  | SS2022: 2022-blake3-aes-128-gcm / aes-256-gcm / chacha20-poly1305                       |
| 18  | Hysteria2   | UDP       | TLS                   | Requires TLS certificate                                                                |
| 19  | AnyTLS      | TCP       | TLS                   | Requires TLS cert (recommended; mihomo / sing-box compatible)                           |
| 20  | AnyTLS      | TCP       | REALITY               | Officially recommended client MeowX only; subscriptions drop it for other clients       |
| 21  | Miu         | TCP       | TLS                   | Requires TLS cert; sent to the officially recommended client MeowX only by default      |
| 22  | Miu         | TCP       | REALITY               | No certificate; sent to the officially recommended client MeowX only by default         |
| 23  | Snell       | TCP       | None                  | Snell v4 / v5: per-user PSK, supports obfs                                              |
| 24  | Snell       | TCP       | None                  | Snell v6: per-user PSK, hidden salt + shaping                                           |
| 25  | Mieru       | TCP       | None                  | Username + password, self-encrypted                                                     |
| 26  | Mieru       | UDP       | None                  | Listens on TCP and UDP on one port; MeowX Mac / iOS supports TCP only                   |
| 27  | WireGuard   | UDP       | None                  | Keys and tunnel addresses assigned by the master; no forward chains                     |

The wizard can also create SOCKS5 and HTTP inbounds (general-purpose proxies), which are not counted in the table above.

## Protocols that need embedded Xray

AnyTLS, Miu, Snell, Mieru and WireGuard are provided by MiaomiaowuX's [embedded Xray](/docs/en/embedded-xray) core; the official xray does not have them. On a server in external Xray mode these protocols cannot be selected in the wizard, and a server that already hosts such inbounds must delete them before it can switch to external mode.

## Deprecated Combinations

The following combinations have been deprecated or removed in Xray-core:

- HTTP/H2 transport: migrated to XHTTP stream-one (H2 & H3)
- Trojan + Flow (XTLS-Vision): Xray-core has removed flow support for Trojan

## mihomo Compatibility Notes

- Trojan in mihomo uses the sni field (not servername)
- XHTTP requires xhttp-opts to include headers: {}, with mode at the top level
- REALITY's short-id and public-key go in reality-opts
- Hysteria2 uses the hysteria2 type (not hysteria)
