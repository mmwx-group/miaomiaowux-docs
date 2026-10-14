---
title: "Miu"
description: "Miu protocol reference: lane pool, inner TLS 1.3 forwarded as is, PSK auth, TLS / REALITY outer layers, and the rule that sends Miu nodes to the officially recommended client only"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

## Overview

Miu is MiaomiaowuX's own proxy protocol, running on top of TLS 1.3 or REALITY: a lane pool instead of multiplexing, and data that already is TLS 1.3 ciphertext is not encrypted a second time.

- **A lane pool instead of multiplexing.** A lane is one TCP connection + outer TLS + one authentication. It carries one stream at a time and goes back to the pool when the stream ends. Opening a stream on a warm lane needs no handshake and waits for no reply; with no multiplexing there is no head-of-line blocking between streams.
- **Inner TLS 1.3 forwarded as is.** When you visit an HTTPS site, the ciphertext after the inner handshake is no longer wrapped in the outer encryption, which saves one round of encryption and decryption. Plaintext, the plaintext part of the inner handshake and TLS 1.2 stay inside the outer encryption. The protocol decides this by itself; there is no switch.
- **An abort does not cost a lane.** When the application closes a connection only that stream ends, and the lane still returns to the pool.
- The first packets of every stream are shaped by padding rules; UDP runs as UDP-over-TCP, handled by the server automatically with nothing to configure.

MiaomiaowuX implements the Miu server inside its embedded (forked) xray core. Per-user traffic statistics, rate limits and device limits use the same path as VLESS / Trojan.

| Item           | Details                                                                                                              |
| -------------- | -------------------------------------------------------------------------------------------------------------------- |
| Auth           | One PSK per user (any string of at least 16 characters); the key is the identity and must match exactly on both ends |
| Transport      | TCP                                                                                                                  |
| Security layer | TLS (needs a certificate) or REALITY (no certificate)                                                                |
| UDP            | Supported (UDP-over-TCP)                                                                                             |
| Core           | Only servers running [embedded xray](/docs/en/embedded-xray); the external (official) xray has no such protocol      |
| Versions       | Master v0.5.6 or later, Agent v1.1.1 or later                                                                        |
| Clients        | Sent to the officially recommended client MeowX only by default, see [Subscription rule](#subscription-rule)         |

## Adding a node (wizard)

In Node Management → Add Node, pick MIU. The only transport is TCP; the security layer is TLS or REALITY.

- **TLS**: the server needs a domain and a certificate first. Simple mode matches an existing certificate by the server's domain; when nothing matches, follow the prompt to issue one, or switch to expert mode and pick it by hand.
- **REALITY**: no certificate. The wizard probes a REALITY target domain and generates the key pair, as it does for VLESS.
- **PSK** is generated for you. When users are added from the panel, or the node is bound to a package, every user gets their own PSK, and traffic and rate limits are counted per user.

Miu has no protocol-level options: pick the security layer and submit. On servers running external xray the MIU button is disabled; switch the server to embedded mode first.

## Subscription rule

Miu is an in-house protocol that other clients do not know. The official mihomo **fails to load the whole config** when it meets a node type it does not recognise (no node works at all), so subscriptions treat clients differently by default:

- **The officially recommended client MeowX** gets Miu nodes.
- **Other clients** have Miu nodes filtered out, together with the references to them in proxy groups; a group that ends up empty gets DIRECT. Regular subscriptions, package subscriptions and temporary subscriptions all follow this rule.
- Nodes imported from one MiaomiaowuX panel into another are not filtered.

If the people using a subscription run a client that supports Miu (a mihomo build with the Miu outbound, for example), turn on **"Send Miu nodes to all clients"** under Node Management → Utilities (since v0.5.7). With it on, every client and every temporary subscription gets Miu nodes. It is off by default.

:::caution
Before turning this on, make sure everyone using the subscription runs a client that supports Miu. A client that does not will fail to load the whole subscription once it receives a Miu node.
:::

## Client compatibility

| Client                                                                          | Support                                                       |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| MeowX (officially recommended client)                                           | Supported; use the latest version                             |
| mihomo builds with the Miu outbound                                             | Supported; the node type is `type: miu`                       |
| Official mihomo / Clash.Meta family (Clash Verge Rev, FlClash, Mihomo Party, …) | Not supported; a Miu node makes the whole config fail to load |
| sing-box, Shadowrocket, Surge, Loon, Quantumult X, Stash                        | Not supported                                                 |

The master's own node speed test downloads a mihomo core with the Miu outbound automatically to test Miu nodes; nothing to set up. A master with a core pinned through `MIHOMO_BIN` keeps that core, which then has to support Miu itself.

## Notes

- **Upgrade the master, the Agent and the client together.** The first wire format, used during the beta, has been retired and does not talk to today's nodes; with only one side upgraded, Miu nodes will not connect.
- Miu works as an inbound only. It cannot be an Xray outbound, nor the landing of a relay node.
- Before switching a server from embedded xray to external xray, delete its Miu inbounds; otherwise the panel refuses the switch (external xray cannot load the protocol).
- Credentials live in `settings.users[]` (not `clients[]`); each user has only a `psk`, no UUID.
- TLS nodes carry `client-fingerprint: chrome` by default, so the client uses a browser's handshake fingerprint; a fingerprint set explicitly on the inbound wins.

## Configuration examples

### Miu + TCP + TLS

```json
{
  "tag": "miu-in",
  "listen": "0.0.0.0",
  "port": 443,
  "protocol": "miu",
  "settings": {
    "users": [
      {
        "psk": "your-psk-at-least-16-chars",
        "email": "alice@example.com"
      }
    ]
  },
  "streamSettings": {
    "network": "tcp",
    "security": "tls",
    "tlsSettings": {
      "serverName": "example.com",
      "certificates": [
        {
          "certificateFile": "/path/to/cert.pem",
          "keyFile": "/path/to/key.pem"
        }
      ]
    }
  }
}
```

The mihomo node generated for subscriptions:

```yaml
- name: Tokyo Miu
  type: miu
  server: example.com
  port: 443
  psk: your-psk-at-least-16-chars
  udp: true
  sni: example.com
  client-fingerprint: chrome
```

### Miu + TCP + REALITY

A REALITY node adds `reality-opts`, written the same way as for a VLESS REALITY node:

```yaml
- name: Tokyo Miu REALITY
  type: miu
  server: 203.0.113.10
  port: 443
  psk: your-psk-at-least-16-chars
  udp: true
  sni: www.example.com
  client-fingerprint: chrome
  reality-opts:
    public-key: xxxx
    short-id: xxxx
```
