---
title: "模板管理"
description: "管理订阅输出使用的 Clash/Mihomo YAML 模板:自定义 proxy-groups(分流策略组)、rules(规则集),可绑定到套餐或单个订阅文件;基于 V3 模板系统,支持 include-all / filter 等高级语法,新增节点自动同步到订阅。"
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

## 代理组配置属性 — 每条都附实例

代理组的所有可用配置属性。每个属性下方的折叠面板里都是从生产模板 redirhost\_\_v3.yaml 抽出来的真实 YAML 片段,可以直接复制粘贴使用。

`name`

代理组名称。客户端 UI 上显示的就是这个,emoji 直接写在 name 里就行(👌 🚀 ♻️ 等)。

**查看示例代码**

`type`

代理组类型。select(手动选)、url-test(自动选最快)、fallback(主备切换)、load-balance(负载均衡)、relay(链式代理,通过 dialer-proxy-group 实现)。

**查看示例代码**

`proxies`

代理组里包含的代理列表。可以是其他代理组名、节点名,或 DIRECT/REJECT 系统出站,或占位符 \_\_PROXY_NODES\_\_ / \_\_PROXY_PROVIDERS\_\_(生成订阅时自动展开成所有节点/代理集合)。

**查看示例代码**

`include-all`

引入所有出站代理 + 所有代理集合(等同于同时开启 include-all-proxies 和 include-all-providers)。最常用,V3 模板「新增节点自动同步」的核心。

**查看示例代码**

`include-all-proxies`

只引入节点表里的节点,不引入外部 proxy-providers。适合只想要自己机场节点的场景。

**查看示例代码**

`include-all-providers`

只引入外部 proxy-providers(代理集合),不引入节点表里的节点。适合混合订阅场景。

**查看示例代码**

`include-type`

按协议类型引入节点,用 | 分隔多个类型。常见值:vless / vmess / trojan / ss / hysteria / hysteria2 / tuic 等。不区分大小写。

**查看示例代码**

`exclude-type`

按协议类型排除节点。同 include-type 的语法,但用于排除。可与 include-\* 同时用,形成多层筛选。

**查看示例代码**

`filter`

正则表达式筛选节点名,匹配的节点会被引入本组。多个关键词用 | 分隔。例如 filter: 'HK|香港|Hong Kong' 把含三种关键词任一的节点拉进来。

**查看示例代码**

`exclude-filter`

正则表达式排除节点名,匹配的节点不会进本组。常用于排除「测试」「TEST」「故障」「失效」等关键词。可与 filter 同时用 — filter 先筛入,exclude-filter 再筛出。

**查看示例代码**

`url`

测速 URL,url-test / fallback / load-balance 类型用。默认值 https://cp.cloudflare.com/generate\_204(无返回内容,速度快)。

**查看示例代码**

`interval`

测速间隔(秒)。url-test / fallback / load-balance 类型用,默认 300(5 分钟)。值越小测速越频繁、越能感知节点状态变化,但消耗更多带宽。

**查看示例代码**

`tolerance`

url-test 类型的容差(毫秒),默认 50。当前节点延迟低于「最快节点延迟 + 容差」时不切换,避免在两个延迟接近的节点间频繁切换。

**查看示例代码**

`dialer-proxy-group`

中转代理组名。设置后,本组节点的流量会先经该中转组选中的节点转发,实现链式代理:客户端 → 中转节点 → 本组节点 → 目标。可视化编辑里通过组右侧的链接图标快速配置。

**查看示例代码**

`hidden`

默认 false。设为 true 时该代理组在客户端 UI 隐藏(不出现在选择列表),但 rules 里依然可以引用。常用于内部桥接组等用户不需手动切换的场景。

**查看示例代码**

`icon`

代理组图标。可以是图片 URL,也可以直接把 emoji 写在 name 里(👌 🚀)。客户端会按 icon 字段渲染。

**查看示例代码**

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

下方完整模板取自妙妙屋X 内置 rule_templates/redirhost\_\_v3.yaml,可作为你自己模板的起点。

**templatesV3.fullExample.title**

## templatesV3.notes.heading

- ⚠**templatesV3.notes.formatTitle**templatesV3.notes.formatDesc
- ⚠**templatesV3.notes.filterRuleTitle**templatesV3.notes.filterRuleDesc
- ⚠**templatesV3.notes.regexTitle**templatesV3.notes.regexDesc
- ⚠**templatesV3.notes.orderTitle**templatesV3.notes.orderDesc
- ⚠**templatesV3.notes.emptyGroupTitle**templatesV3.notes.emptyGroupDesc
- ⚠**templatesV3.notes.bindingTitle**templatesV3.notes.bindingDesc
