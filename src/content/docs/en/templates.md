---
title: "Template Management"
description: "Manage the Clash/Mihomo YAML templates used for subscription output: customize proxy-groups and rules; bind to a package or individual subscription file. Built on the V3 template system with mihomo-style include-all / filter syntax — new nodes are automatically synced into subscriptions."
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

templatesV3.prerequisite.heading

templatesV3.prerequisite.text

templatesV3.intro

templatesV3.badges.adminOnlytemplatesV3.badges.mihomoCompattemplatesV3.badges.visualEdit

## templatesV3.coreConcepts.heading

templatesV3.coreConcepts.desc

#### templatesV3.coreConcepts.includeTitle

- • `include-all` - templatesV3.coreConcepts.includeAll
- • `include-all-proxies` - templatesV3.coreConcepts.includeAllProxies
- • `include-all-providers` - templatesV3.coreConcepts.includeAllProviders
- • `include-type` - templatesV3.coreConcepts.includeType

#### templatesV3.coreConcepts.filterTitle

- • `filter` - templatesV3.coreConcepts.filter
- • `exclude-filter` - templatesV3.coreConcepts.excludeFilter
- • `exclude-type` - templatesV3.coreConcepts.excludeType

## Proxy Group Attributes — with examples for each

All available proxy group attributes. Each attribute's expandable panel below contains a real YAML snippet pulled from the production redirhost\_\_v3.yaml template — copy-paste them directly.

`name`

Proxy group name. This is what the client UI displays. You can include emoji directly in the name (👌 🚀 ♻️ etc.).

**View example code**

`type`

Proxy group type. select (manual choice), url-test (auto-select fastest), fallback (priority-based switching), load-balance, relay (chained via dialer-proxy-group).

**View example code**

`proxies`

List of proxies in the group. Can be other proxy group names, node names, DIRECT/REJECT system outbounds, or placeholders \_\_PROXY_NODES\_\_ / \_\_PROXY_PROVIDERS\_\_ (expanded into all nodes / proxy providers at subscription generation).

**View example code**

`include-all`

Pull in all outbound proxies + all proxy providers (equivalent to enabling both include-all-proxies and include-all-providers). Most commonly used — the core of V3 template's 'auto-sync new nodes'.

**View example code**

`include-all-proxies`

Only pull in nodes from the node table, not external proxy-providers. Use when you only want your own provider's nodes.

**View example code**

`include-all-providers`

Only pull in external proxy-providers, not nodes from the node table. Use in mixed subscription scenarios.

**View example code**

`include-type`

Filter by protocol type, separated by |. Common values: vless / vmess / trojan / ss / hysteria / hysteria2 / tuic. Case-insensitive.

**View example code**

`exclude-type`

Exclude nodes by protocol. Same syntax as include-type but for exclusion. Can be combined with include-\* for multi-layer filtering.

**View example code**

`filter`

Regex filter matching node names — matched nodes are pulled into this group. Use | for multiple keywords. e.g. filter: 'HK|Hong Kong' pulls any node matching either.

**View example code**

`exclude-filter`

Regex to exclude node names. Common use: filter out 'test', 'TEST', 'DEAD' keywords. Stackable with filter — filter pulls in first, exclude-filter pushes out.

**View example code**

`url`

Latency test URL for url-test / fallback / load-balance types. Default: https://cp.cloudflare.com/generate\_204 (empty response, fast).

**View example code**

`interval`

Test interval (seconds), used by url-test / fallback / load-balance. Default 300 (5 min). Smaller = more responsive to node state changes but more bandwidth.

**View example code**

`tolerance`

url-test tolerance (ms), default 50. Prevents frequent switching between nodes with similar latency — switches only when the current node is slower than (fastest + tolerance).

**View example code**

`dialer-proxy-group`

Relay proxy group name. Once set, traffic from this group's nodes goes through the relay group's selected node first — chained routing: client → relay node → this group's node → target. The visual editor has a chain link icon on each group for quick setup.

**View example code**

`hidden`

Default false. Set to true to hide this proxy group from the client UI (not in selection list), but rules can still reference it. Common for internal bridge groups.

**View example code**

`icon`

Proxy group icon. Can be an image URL, or just embed an emoji in the name field. Clients render based on the icon field.

**View example code**

## templatesV3.nodeTypes.heading

templatesV3.nodeTypes.desc

vlessvmesstrojanssshadowsockshysteriahysteria2tuicwireguardanytlssocks5http

## templatesV3.regionGroups.heading

templatesV3.regionGroups.desc

- • templatesV3.regionGroups.usage1
- • templatesV3.regionGroups.usage2
- • templatesV3.regionGroups.usage3
- • templatesV3.regionGroups.usage4

## templatesV3.createMethods.heading

#### templatesV3.createMethods.uploadTitle

templatesV3.createMethods.uploadDesc

#### templatesV3.createMethods.pasteTitle

templatesV3.createMethods.pasteDesc

#### templatesV3.createMethods.convertTitle

templatesV3.createMethods.convertDesc

## templatesV3.subBinding.heading

templatesV3.subBinding.desc

#### templatesV3.subBinding.flowTitle

1.  1templatesV3.subBinding.flow1
2.  2templatesV3.subBinding.flow2
3.  3templatesV3.subBinding.flow3

#### templatesV3.subBinding.autoUpdateTitle

- • templatesV3.subBinding.autoUpdate1
- • templatesV3.subBinding.autoUpdate2
- • templatesV3.subBinding.autoUpdate3

## templatesV3.commonScenarios.heading

templatesV3.commonScenarios.desc

#### templatesV3.commonScenarios.s1Title

templatesV3.commonScenarios.scenarioGoal: templatesV3.commonScenarios.s1Goal

templatesV3.commonScenarios.scenarioConfig: templatesV3.commonScenarios.s1Config

templatesV3.commonScenarios.scenarioEffect: templatesV3.commonScenarios.s1Effect

#### templatesV3.commonScenarios.s2Title

templatesV3.commonScenarios.scenarioGoal: templatesV3.commonScenarios.s2Goal

templatesV3.commonScenarios.scenarioConfig: templatesV3.commonScenarios.s2Config

templatesV3.commonScenarios.scenarioEffect: templatesV3.commonScenarios.s2Effect

#### templatesV3.commonScenarios.s3Title

templatesV3.commonScenarios.scenarioGoal: templatesV3.commonScenarios.s3Goal

templatesV3.commonScenarios.scenarioConfig: templatesV3.commonScenarios.s3Config

templatesV3.commonScenarios.scenarioEffect: templatesV3.commonScenarios.s3Effect

#### templatesV3.commonScenarios.s4Title

templatesV3.commonScenarios.scenarioGoal: templatesV3.commonScenarios.s4Goal

templatesV3.commonScenarios.scenarioConfig: templatesV3.commonScenarios.s4Config

templatesV3.commonScenarios.scenarioEffect: templatesV3.commonScenarios.s4Effect

#### templatesV3.commonScenarios.s5Title

templatesV3.commonScenarios.scenarioGoal: templatesV3.commonScenarios.s5Goal

templatesV3.commonScenarios.scenarioConfig: templatesV3.commonScenarios.s5Config

templatesV3.commonScenarios.scenarioEffect: templatesV3.commonScenarios.s5Effect

#### templatesV3.commonScenarios.tipsTitle

- • templatesV3.commonScenarios.tip1
- • templatesV3.commonScenarios.tip2
- • templatesV3.commonScenarios.tip3
- • templatesV3.commonScenarios.tip4

## templatesV3.fullExample.heading

The complete template below is taken from MiaoMiaoWu X's built-in rule_templates/redirhost\_\_v3.yaml and works as a starting point for your own templates.

**templatesV3.fullExample.title**

## templatesV3.notes.heading

- ⚠**templatesV3.notes.formatTitle**templatesV3.notes.formatDesc
- ⚠**templatesV3.notes.filterRuleTitle**templatesV3.notes.filterRuleDesc
- ⚠**templatesV3.notes.regexTitle**templatesV3.notes.regexDesc
- ⚠**templatesV3.notes.orderTitle**templatesV3.notes.orderDesc
- ⚠**templatesV3.notes.emptyGroupTitle**templatesV3.notes.emptyGroupDesc
- ⚠**templatesV3.notes.bindingTitle**templatesV3.notes.bindingDesc
