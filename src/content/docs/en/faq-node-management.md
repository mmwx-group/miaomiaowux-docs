---
title: "Node creation & usage (inbound + outbound)"
description: "Five key buttons on the Node Management page, with an interactive mock that reveals each sub-UI on hover."
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

### Quick orientation

Node Management groups five capabilities on one page: «add inbound», «chained / routed outbound», «tunnel forwarding» and the global «routed outbound manager». The mock below recreates the top button strip — hover any color-ringed button to preview the sub-UI that opens.

Mock demoEach button's color ring matches the legend below; hover to see the sub-UI bubble.

Node list3

Heads up: edits & deletions on nodes propagate to all subscriptions

**Add node\*\***Tunnel mgr\***\*Routed outbound\*\***Speed test\*\*

ProtoNameActionsTagConfigOps

VLESS

🇭🇰香港 GoMami - KAZE

HK GoMami Pro N

🇭🇰

manual

TROJAN

🇭🇰香港 GoMami - Trojan

HK GoMami Pro N

🇭🇰

manual

SHADOWSOCKS

🇭🇰香港 GoMami - SS2022

HK GoMami Pro N

🇭🇰

manual

Red = Add node (create inbound)Black = Tunnel manager (port forwarding)Yellow = All routed outbounds (global)Blue = Add routed child on a rowGreen = View routing of a nodeHover a ringed button to preview the sub-UI it opens

#### Red — Add node (inbound)

Opens the inbound wizard. Pick a protocol (VLESS / Trojan / SS / VMess / Hysteria2 / AnyTLS / Tunnel / Socks), then transport + security. Simple mode jumps straight to the must-fill fields (REALITY domain / cert path…); expert mode shows the generated Xray JSON live.

#### Blue — Add routed child (inline)

Inline button on a node row. Opens «Add routed node» with three add modes: pick another node as the egress / pick a server (its default outbound) / pick a load balancer (bundles multiple egresses). Scope can be «whole-node share» or «per-user isolation».

#### Green — View node routing (inline)

Shows the effective routing for this inbound: «exclusive rules» plus the global rules (read-only here; edit them in Custom Rules).

#### Black — Tunnel manager

Central manager for every tunnel inbound (xray «dokodemo-door»). Tunnel-type inbounds never appear in the Node list — this is the only place to delete them. Common use: transparently forward a port on box A to a port on box B.

#### Yellow — Routed outbound manager (global)

Global view of every routed child node — review / delete / add. Each routed child shares its parent inbound credential but routes traffic through its own outbound. Add it to a package → bound users auto-provision a sub-account + rule.user, achieving «per-user routed egress» at scale.
