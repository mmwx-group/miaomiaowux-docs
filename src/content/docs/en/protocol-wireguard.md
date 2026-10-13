---
title: "WireGuard"
description: "WireGuard inbound reference: keys and tunnel addresses assigned by the master, per-user credentials, MTU, scope and limitations"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

## Overview

WireGuard is a UDP-based tunnel protocol with its own encryption: no certificate, and no transport or security layer to choose. MiaomiaowuX provides a WireGuard inbound in its embedded xray core. The server key, the tunnel address pool and every user's keys are assigned by the master, so there is no key to type in when you create a node.

| Item           | Details                                                                                                  |
| -------------- | -------------------------------------------------------------------------------------------------------- |
| Auth           | One key pair per user, plus a set of in-tunnel addresses (IPv4 + IPv6)                                   |
| Transport      | UDP                                                                                                      |
| Security layer | None (the protocol encrypts by itself; no certificate needed)                                            |
| Core           | Only servers running [embedded xray](/docs/en/embedded-xray); not selectable on external (official) xray |
| Versions       | Master v0.5.5 or later                                                                                   |

## Adding a node (wizard)

In Node Management → Add Node, pick WIREGUARD. The form has a single field:

- **MTU**: the tunnel's maximum transmission unit, 1280–1500, default 1420. Usually left as is.

The server key and tunnel addresses are assigned by the master, and user credentials are handed out one by one when a package is bound, so none of them needs to be filled in. Open the inbound's **UDP** port in the firewall.

Once the node is bound to a package, every user of the package gets their own keys and tunnel addresses, and subscriptions carry each user's own credentials. When a user is removed from the package, their keys and addresses are taken back.

## Limitations

- **No switching to or from another protocol**: when editing a node you cannot change between WireGuard and anything else (the address pool and the users' address leases cannot be migrated). Create another inbound instead.
- **Edit it in Node Management only**: editing a WireGuard inbound directly on the Xray Inbounds page is refused. An edit there deletes and re-adds the inbound, which would wipe the address pool and replace the server key.
- **Not supported in forward chains**, and it cannot be the source of a port forward (Tunnel), a landing exit or the end of a forward chain.
- When the server has no IPv6, subscriptions do not carry an IPv6 tunnel address.
- Before switching a server from embedded xray to external xray, delete its WireGuard inbounds.
- "Reset user credentials" by an administrator also replaces that user's WireGuard keys; the user only needs to refresh the subscription.

## Client compatibility

Subscriptions carry a mihomo `type: wireguard` node. mihomo / Clash.Meta clients use it directly; when a subscription is converted to another client's format, clients without WireGuard support skip these nodes.

:::note
This page is about offering WireGuard to users as a **proxy node**. The panel uses WireGuard in two other places that are unrelated to this page: [reverse tunnels](/docs/en/reverse-tunnel) (private tunnels between servers) and the [WARP outbound](/docs/en/xray-outbounds).
:::

## Configuration example

The mihomo node generated for subscriptions (keys and addresses differ per user):

```yaml
- name: Tokyo WireGuard
  type: wireguard
  server: 203.0.113.10
  port: 51820
  ip: 10.66.0.2
  ipv6: fd00:1234:5678::2
  private-key: <user private key>
  public-key: <server public key>
  udp: true
  mtu: 1420
```

---

"WireGuard" and the "WireGuard" logo are registered trademarks of Jason A. Donenfeld.
