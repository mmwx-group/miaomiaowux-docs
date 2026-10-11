---
title: "Creating and Using Nodes (Inbounds and Outbounds)"
description: "How to create a node in MiaomiaowuX, how to send its traffic out through another machine (landing node / routed outbound / relay group), and what the key buttons on the node page do."
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

This page answers the two most common questions: **how to create a node**, and **how to change where a node's traffic exits**. For the full reference of buttons and parameters see [Node Management](/docs/en/nodes).

## Inbound vs. outbound

| Term | What it is | Where |
| --- | --- | --- |
| Inbound | A protocol port a server listens on; clients connect to it. **Creating a node = creating an inbound** | Nodes → "Add node" |
| Outbound | Where traffic leaves after entering the server. By default it leaves from the server itself | "Create chained outbound" on a node row, or Servers → Xray config → Outbounds |
| Node | The inbound as it appears in subscriptions. It shows up in the node list automatically once the inbound exists | Nodes |

So the usual order is: create the node (inbound) first, then configure an outbound when you need a different exit.

## Create a node

1. Open "Nodes" and click "**Add node**" at the top right
2. **Pick a server**: choose one marked "Xray ready" and whether the node address uses IPv4 or IPv6. With many servers, use the search box and group filter above the list. The "Forward chain" tab creates a node on the entry of a [forward chain](/docs/en/forward)
3. **Configure the inbound**: choose protocol, transport and security. In "Simple mode" the port and UUID / password are generated for you; switch to "Expert mode" to change the port, listen address and so on
4. Click "Submit". The master creates the inbound on the server and the node appears in the list

Protocols that need a certificate (Trojan + TLS, Hysteria2, AnyTLS…) require a domain and certificate on the server first — the wizard prompts for this in step one. REALITY, Shadowsocks and Snell need none. See the [protocol matrix](/docs/en/protocol-matrix) for valid combinations.

Then add the node to a package so it appears in users' subscriptions, see [Packages](/docs/en/packages).

## Send a node's traffic out through another machine

Click "**Create chained outbound**" (two-way arrow icon) on the node row to open "Add landing node". Three options:

| Tab | What it does | Use when |
| --- | --- | --- |
| Pick a landing node | Use an existing node (your own or an imported external one) as the exit. The master adds the outbound and routing on this server | You already have a landing node |
| Pick a server | Choose another server; the master creates an inbound there as the landing and configures outbound and routing. You can also reuse an outbound that already exists on this server | The landing machine is also your server |
| Pick a load balancer | Hand this inbound's traffic to a load balancer already configured on the server; no outbound or node is created | You built a balancer in Xray routing |

This adds a "routed outbound" child node. It **shares the same port and address** as the original node; only the exit differs. The original node is unaffected, and the two can go into different packages. See [Routed outbound](/docs/en/routed-outbound).

:::tip[One line node, several landings]
You can use "Create chained outbound" on the same node repeatedly; each landing adds one child node. A single entry port can then offer "via Hong Kong", "via Japan" and so on — handy on NAT machines with few ports.
:::

### Relay groups

For the opposite case — a fixed landing node that clients should reach through **the fastest of several relays** — click "**Create relay group**" on the landing node's row: pick relay nodes and name the group. In subscriptions the landing node's `dialer-proxy` then points at this auto-selecting group.

- Relay groups already created on other nodes are listed at the top of the dialog; click one to reuse it
- Changing the members on one node updates every other node using the same group name
- This is chaining on the **client side** (done by Clash-type clients). Nothing is forwarded on your servers, so that leg is not counted against package users

## Other entry points

| Button | Where | What it does |
| --- | --- | --- |
| Node routing | Node row (route icon) | Shows the routing rules in effect for this inbound: its own rules and the global ones. See [Xray routing](/docs/en/xray-routing) |
| Tunnel management | Top right | Manages port forwards on servers: forward a server port to another node or a fixed address, and point a node at an external relay address. Tunnels are not in the node list; add and remove them here |
| Routed outbounds | Top right | Lists and removes all routed-outbound child nodes |
| View / edit config | Node row (edit icon) | Reopens the inbound wizard; node ID and user credentials stay the same |

To arrange several servers as "entry → relay → exit" with monitoring, use [Forwarding](/docs/en/forward) rather than individual tunnels.

## FAQ

**I created a node but it is not in the subscription.**
A node must be in a package and the package bound to a user. The administrator's own subscription is generated on the "Subscription" page.

**Does deleting a node remove the inbound?**
Deleting a self-built node also removes its inbound on the server; an imported external node is only removed from the list. Edits and deletions are synced to all subscriptions.

**How is traffic counted for landing / routed-outbound child nodes?**
The traffic passes through your server and is counted against the user's package as usual. Only client-side chains (relay groups, chained proxy) have a relay leg that never touches your server and cannot be measured.

**What is the difference between "Create outbound from node" in Outbounds and "Create chained outbound" here?**
The former only adds an outbound on the server; you still have to write routing rules to use it. The latter does everything: outbound, routing and the child node. Prefer the latter.
