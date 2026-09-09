---
title: "模板管理"
description: "管理订阅输出使用的 Clash/Mihomo YAML 模板:自定义 proxy-groups(分流策略组)、rules(规则集),可绑定到套餐或单个订阅文件;基于 V3 模板系统,支持 include-all / filter 等高级语法,新增节点自动同步到订阅。"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

![模板管理页面截图](../../assets/screenshots/templates-list.webp)

模板管理 — 按 Clash / Surge / Loon 分类列出所有模板，可编辑 / 预览 / 删除，并控制对用户的可见性

:::note[前置条件]
需要在 [系统设置 → 功能](/docs/system-settings) 中开启「使用新模板系统」并选择「V3 版本模板」，才会显示模板管理菜单。
:::

模板管理 V3 是妙妙屋X 的模板系统，采用 mihomo 风格的代理组配置语法，支持 include-all、filter 等高级特性，可以解决添加节点时需要手动编辑订阅的问题：现在可以根据模板自动把新节点加入订阅。

**管理员功能 · mihomo 兼容 · 可视化编辑**

## 页面功能

| 功能       | 说明                                                                                             |
| ---------- | ------------------------------------------------------------------------------------------------ |
| 分类筛选   | 全部 / Clash / Surge / Loon，系统内置了 fake ip、redirhost（Clash）与 surge cn 等默认模板          |
| 用户可见性 | 控制普通用户在个人订阅页能选择哪些模板                                                            |
| 新建模板   | 见下方「模板创建方式」                                                                            |
| 编辑       | 可视化编辑器 + YAML 代码双模式                                                                    |
| 预览       | 左侧模板配置，右侧套上当前节点后生成的最终订阅配置                                                |

![预览模板对话框截图](../../assets/screenshots/templates-preview-dialog.webp)

预览：左侧为模板 YAML，右侧为按当前节点表渲染出的最终订阅

## 核心概念

V3 模板基于 mihomo 的代理组语法，通过声明式配置自动匹配和分配节点：

#### 节点引入

- `include-all` - 引入所有节点和代理集合
- `include-all-proxies` - 仅引入所有代理节点
- `include-all-providers` - 仅引入所有代理集合
- `include-type` - 按节点类型引入

#### 节点筛选

- `filter` - 筛选匹配关键词的节点
- `exclude-filter` - 排除匹配关键词的节点
- `exclude-type` - 按节点类型排除

## 代理组配置属性 — 每条都附实例

代理组的所有可用配置属性。每个属性下方的 YAML 片段都是从生产模板 redirhost\_\_v3.yaml 抽出来的真实配置，可以直接复制粘贴使用。

### `name`

代理组名称。客户端 UI 上显示的就是这个,emoji 直接写在 name 里就行(👌 🚀 ♻️ 等)。

```yaml
proxy-groups:
  - name: 🚀 手动选择        # 代理组名称,客户端 UI 上显示的就是这个
    type: select
```

### `type`

代理组类型。select(手动选)、url-test(自动选最快)、fallback(主备切换)、load-balance(负载均衡)、relay(链式代理,通过 dialer-proxy-group 实现)。

```yaml
# 5 种类型示例
proxy-groups:
  - name: 🚀 手动选择
    type: select              # 手动选,客户端展示节点列表让用户挑

  - name: ♻️ 自动选择
    type: url-test            # 自动选延迟最低的节点
    url: https://cp.cloudflare.com/generate_204
    interval: 300

  - name: 🛡️ 故障转移
    type: fallback            # 按顺序优先,主节点挂掉切下一个

  - name: ⚖️ 负载均衡
    type: load-balance        # 流量按算法分配到多个节点
    strategy: round-robin

  - name: 🌌 中转入口
    type: select              # relay 链式代理走 dialer-proxy-group
```

### `proxies`

代理组里包含的代理列表。可以是其他代理组名、节点名,或 DIRECT/REJECT 系统出站,或占位符 \_\_PROXY_NODES\_\_ / \_\_PROXY_PROVIDERS\_\_(生成订阅时自动展开成所有节点/代理集合)。

```yaml
proxy-groups:
  - name: 🚀 手动选择
    type: select
    include-all: true
    proxies:
      - ♻️ 自动选择            # 引用其他代理组
      - __PROXY_PROVIDERS__   # 占位符:展开成所有 proxy-providers
      - __PROXY_NODES__       # 占位符:展开成节点表里所有节点
      - 🌄 落地节点
      - DIRECT                # 系统出站:直连
      - REJECT                # 系统出站:阻断
```

### `include-all`

引入所有出站代理 + 所有代理集合(等同于同时开启 include-all-proxies 和 include-all-providers)。最常用,V3 模板「新增节点自动同步」的核心。

```yaml
proxy-groups:
  - name: 🚀 手动选择
    type: select
    include-all: true         # 引入所有出站节点 + 所有代理集合(等同两个开关)
    proxies:
      - __PROXY_NODES__
      - __PROXY_PROVIDERS__
```

### `include-all-proxies`

只引入节点表里的节点,不引入外部 proxy-providers。适合只想要自己机场节点的场景。

```yaml
proxy-groups:
  - name: 🚀 只要节点
    type: select
    include-all-proxies: true # 只引入节点表里的节点,不引入外部 provider
    proxies:
      - __PROXY_NODES__
```

### `include-all-providers`

只引入外部 proxy-providers(代理集合),不引入节点表里的节点。适合混合订阅场景。

```yaml
proxy-groups:
  - name: 🚀 只要 Provider
    type: select
    include-all-providers: true   # 只引入外部 proxy-providers,不要节点表
    proxies:
      - __PROXY_PROVIDERS__
```

### `include-type`

按协议类型引入节点,用 | 分隔多个类型。常见值:vless / vmess / trojan / ss / hysteria / hysteria2 / tuic 等。不区分大小写。

```yaml
proxy-groups:
  - name: 🚀 VLESS 专属
    type: select
    include-all: true
    include-type: 'vless|vmess'   # 仅 VLESS 和 VMess 协议节点会进来(| 分隔多协议)
    proxies:
      - __PROXY_NODES__
```

### `exclude-type`

按协议类型排除节点。同 include-type 的语法,但用于排除。可与 include-\* 同时用,形成多层筛选。

```yaml
proxy-groups:
  - name: 🚀 不要 SS
    type: select
    include-all: true
    exclude-type: 'ss|hysteria'   # 排除 SS 和 Hysteria 协议节点
    proxies:
      - __PROXY_NODES__
```

### `filter`

正则表达式筛选节点名,匹配的节点会被引入本组。多个关键词用 | 分隔。例如 filter: 'HK|香港|Hong Kong' 把含三种关键词任一的节点拉进来。

```yaml
proxy-groups:
  - name: 🌠 中转节点
    type: select
    include-all: true
    filter: 中转|CO|co            # 正则匹配节点名,含「中转」「CO」「co」的进来
    proxies:
      - __PROXY_PROVIDERS__
      - __PROXY_NODES__

  - name: 🌄 落地节点
    type: select
    include-all: true
    filter: LD|落地|Bage|bage|jinx|ctc   # 多关键词正则,任一匹配即引入
```

### `exclude-filter`

正则表达式排除节点名,匹配的节点不会进本组。常用于排除「测试」「TEST」「故障」「失效」等关键词。可与 filter 同时用 — filter 先筛入,exclude-filter 再筛出。

```yaml
proxy-groups:
  - name: 🚀 可用节点
    type: select
    include-all: true
    exclude-filter: 测试|TEST|故障|失效|DEAD    # 这些关键词的节点全跳过
    proxies:
      - __PROXY_NODES__
```

### `url`

测速 URL,url-test / fallback / load-balance 类型用。默认值 https://cp.cloudflare.com/generate\_204(无返回内容,速度快)。

```yaml
proxy-groups:
  - name: ♻️ 自动选择
    type: url-test
    include-all: true
    url: https://cp.cloudflare.com/generate_204  # 测速 URL,默认即此值
    interval: 300
    tolerance: 50
```

### `interval`

测速间隔(秒)。url-test / fallback / load-balance 类型用,默认 300(5 分钟)。值越小测速越频繁、越能感知节点状态变化,但消耗更多带宽。

```yaml
proxy-groups:
  - name: ♻️ 自动选择
    type: url-test
    include-all: true
    url: https://cp.cloudflare.com/generate_204
    interval: 300                                # 测速间隔(秒),默认 300
```

### `tolerance`

url-test 类型的容差(毫秒),默认 50。当前节点延迟低于「最快节点延迟 + 容差」时不切换,避免在两个延迟接近的节点间频繁切换。

```yaml
proxy-groups:
  - name: ♻️ 自动选择
    type: url-test
    include-all: true
    url: https://cp.cloudflare.com/generate_204
    interval: 300
    tolerance: 50                                # 容差(毫秒),新节点比当前快超过 50ms 才切换
```

### `dialer-proxy-group`

中转代理组名。设置后,本组节点的流量会先经该中转组选中的节点转发,实现链式代理:客户端 → 中转节点 → 本组节点 → 目标。可视化编辑里通过组右侧的链接图标快速配置。

```yaml
proxy-groups:
  - name: 🌠 中转节点
    type: select
    include-all: true
    filter: 中转|CO|co

  - name: 🌄 落地节点
    type: select
    include-all: true
    filter: LD|落地|Bage|bage
    proxies:
      - __PROXY_PROVIDERS__
      - __PROXY_NODES__
    dialer-proxy-group: 🌠 中转节点           # 链式代理:本组流量先经中转节点选中的出口
```

### `hidden`

默认 false。设为 true 时该代理组在客户端 UI 隐藏(不出现在选择列表),但 rules 里依然可以引用。常用于内部桥接组等用户不需手动切换的场景。

```yaml
proxy-groups:
  - name: 🔒 内部桥接
    type: select
    hidden: true                                 # 客户端 UI 隐藏该组(规则可引用但不在选择列表显示)
    proxies:
      - DIRECT
```

### `icon`

代理组图标。可以是图片 URL,也可以直接把 emoji 写在 name 里(👌 🚀)。客户端会按 icon 字段渲染。

```yaml
proxy-groups:
  - name: 🚀 手动选择
    type: select
    icon: https://example.com/icons/proxy.png   # 客户端展示用的图标(可 emoji 直接写在 name 里或独立 URL)
    proxies:
      - __PROXY_NODES__
```

### YAML 变量

V3 模板支持在顶层定义自定义变量，避免在多个代理组中重复编写复杂的正则表达式：

- 在 YAML 顶层定义非 Clash 标准字段的字符串即可作为变量
- 代理组的 filter 和 exclude-filter 可以直接引用变量名
- 最终生成的配置中会自动移除这些自定义变量

```yaml
hkFilter: 'HK|香港|Hong Kong'

proxy-groups:
  - name: 🇭🇰 香港节点
    type: url-test
    include-all: true
    filter: hkFilter          # 引用顶层变量
  - name: 🇭🇰 香港手动
    type: select
    include-all: true
    filter: hkFilter          # 同一段正则复用,改一处即可
```

## 支持的节点类型

include-type 和 exclude-type 支持以下节点类型（不区分大小写）：

`vless` `vmess` `trojan` `ss` `shadowsocks` `hysteria` `hysteria2` `tuic` `wireguard` `anytls` `socks5` `http`

## 区域代理组

妙妙屋X V3 模板支持自动生成区域代理组，在编辑模板时开启「区域代理组」开关即可。系统会根据节点名称自动匹配地区，并创建对应的代理组。

![编辑模板对话框截图](../../assets/screenshots/templates-edit-dialog.webp)

编辑模板：左上角「开启区域代理组」，下方可视化编辑各代理组（手动选择 / 自动测速），可切换 YAML 代码模式

- 开启区域代理组开关后，可引入所有区域代理组
- 区域代理组会自动根据节点名称中的地区关键词进行匹配
- 「其他地区」组会包含所有未匹配到特定地区的节点
- 未匹配到任何节点的区域代理组会自动在订阅中移除，不需在模板删除不用的区域代理组

## 模板创建方式

点「新建模板」，先选模板类型（Clash .yaml / Surge .conf / Loon .lcf），再选来源：

![创建模板对话框截图](../../assets/screenshots/templates-create-dialog.webp)

创建模板：上传 / 粘贴 / 空白 / 链接 / V2 导入 / 从订阅

#### 上传文件

上传本地的 YAML 模板文件，文件名将作为模板名称。

#### 粘贴文本

直接粘贴 YAML 格式的模板内容，输入模板名称后保存。

#### 创建空白模板

创建一个包含基础配置的空白模板，然后通过可视化编辑器添加代理组。

#### 从链接导入

填入一个远程 YAML 地址，系统拉取后作为模板保存。

#### 从 V2 模板转换

将现有的 V2（subconverter INI 格式）模板转换为 V3 格式，系统会自动解析 custom_proxy_group 并生成对应的代理组配置。

#### 从现有订阅生成

分析现有订阅配置中的代理组，自动生成 filter 正则表达式和 include-all 配置，快速创建与现有订阅结构一致的模板。

## 可视化编辑器

V3 模板提供可视化编辑界面，无需手动编写 YAML 代码即可配置代理组：

- **筛选关键词**：输入关键词自动生成 filter 正则表达式
- **排除关键词**：输入关键词自动生成 exclude-filter 正则表达式
- **节点类型选择**：弹出气泡多选需要引入/排除的节点类型
- **引入选项**：一键开启 include-all、include-all-proxies 等选项
- **图标与隐藏**：可以配置代理组的图标以及设置隐藏该代理组
- **代理组引用**：选择并拖动排序其他代理组
- **中转代理组**：点击链接图标设置中转代理组，实现链式代理
- **实时预览**：右侧实时显示生成的 YAML 配置

可视化模式与 YAML 模式可以随时切换，数据会自动同步。

## 订阅绑定

V3 模板可以绑定到订阅，绑定后订阅配置将完全基于模板生成：

#### 绑定流程

1. 在 [订阅管理](/docs/subscribe-files) 页面找到要绑定的订阅文件
2. 在「V3 模板」列选择要绑定的模板
3. 系统自动根据模板规则重新生成订阅配置

套餐也可以分别指定 Clash / Surge / Loon 模板，见 [套餐管理](/docs/packages)。

#### 绑定后的行为

- 订阅配置完全基于模板生成，原有的规则配置将被忽略
- 根据模板中代理组的 filter 规则匹配节点表中的所有节点
- 匹配到的节点会添加到代理组的 proxies 列表和顶层 proxies 中
- 模板中的 include-\*、filter、exclude-\* 等属性会在生成时被移除
- 一个订阅只能绑定一个模板

#### 自动更新触发

- 新增节点时，如果代理组规则匹配到新节点，会自动更新绑定的订阅
- 删除节点时，会自动从绑定模板的订阅中移除该节点
- 修改模板后，绑定该模板的订阅会自动重新生成

## 常见使用场景

下面是几个典型配置示例，直接复制到模板里使用，也可以组合搭配。

#### 场景一：新增节点自动同步到订阅（最常用）

- **目标**：管理员每次添加新节点后，所有绑定该模板的订阅自动包含新节点，无需手动编辑订阅文件。这是 V3 模板最核心的能力。
- **配置**：在代理组里声明 include-all（引入所有出站代理 + 代理集合）或 include-all-proxies（只引入节点）。
- **效果**：节点表里每加一个新节点，立刻被自动同步到所有绑定该模板的订阅。删除节点同理。

#### 场景二：按地区分组（自动识别香港/日本/美国等）

- **目标**：订阅里自动出现「香港节点」「日本节点」「美国节点」等地区分组，新增节点自动归类。
- **配置**：在「编辑模板」对话框开启「区域代理组」开关；也可以手动写 filter：每组代理组声明 `filter: 'HK|香港|Hong'`。
- **效果**：新增名字含「香港」的节点 → 自动加入「香港节点」分组。「其他地区」分组兜底，没匹配到节点的地区分组自动从订阅移除。

#### 场景三：排除测试节点 / 失效节点

- **目标**：某些节点名字里带「测试」「TEST」「故障」等标识，希望订阅里自动排除掉。
- **配置**：在代理组里声明 exclude-filter。filter 和 exclude-filter 可同时使用：filter 先筛入，exclude-filter 再筛出。
- **效果**：节点名含任一关键词 → 不会出现在该代理组里。新增节点也会按这条规则自动判断。

#### 场景四：按协议类型筛选（只要 VLESS / 排除 Shadowsocks）

- **目标**：让某个代理组只包含 vless 协议节点，或者排除某些协议（如 ss）。
- **配置**：include-type 按协议类型引入（用 | 分隔多个）；exclude-type 按协议排除。不区分大小写。
- **效果**：`include-type: vless|vmess` → 该组只显示 vless 和 vmess 节点；`exclude-type: ss|hysteria` → 该组排除 ss 和 hysteria 节点。

#### 场景五：中转代理（链式：客户端 → 中转节点 → 落地节点 → 目标）

- **目标**：实现链式代理。比如香港落地 → 日本中转 → 目标。
- **配置**：在落地代理组上设置 `dialer-proxy-group: 中转代理组名`。可视化编辑里通过代理组右侧的链接图标快速配置。
- **效果**：用户选「香港落地」分组里的节点 → 实际流量路径变成 客户端 → 日本中转节点 → 香港落地节点 → 目标。

#### 组合搭配的常用招式

- include-all + filter：所有节点先全引入，再用正则筛你想要的（比如「只看含 IPLC 字样的节点」）
- include-all + exclude-filter + exclude-type：全引入 → 排除不想要的关键词 → 再排掉某些协议
- 在 YAML 顶层定义自定义变量（如 hkFilter: 'HK|香港'），多个代理组复用同一段正则，避免改一处漏一处
- url-test/fallback 类自动选择组：搭配 include-all + filter 自动从对应地区里挑最快的节点

## 完整模板示例

下方完整模板取自妙妙屋X 内置 rule_templates/redirhost\_\_v3.yaml,可作为你自己模板的起点。

```yaml
mode: rule
dns:
  enable: true
  enhanced-mode: redir-host
  nameserver:
    - https://8.8.8.8/dns-query/dns-query#🚀 节点选择
  direct-nameserver:
    - https://120.53.53.53/dns-query
  proxy-server-nameserver:
    - https://120.53.53.53/dns-query
  ipv6: false

proxies: null

proxy-groups:
  - name: 🚀 手动选择
    type: select
    include-all: true
    include-all-proxies: true
    include-all-providers: true
    proxies:
      - ♻️ 自动选择
      - __PROXY_PROVIDERS__
      - __PROXY_NODES__
      - 🌄 落地节点
  - name: ♻️ 自动选择
    type: url-test
    include-all: true
    proxies:
      - __PROXY_PROVIDERS__
      - __PROXY_NODES__
    url: https://cp.cloudflare.com/generate_204
    interval: 300
    tolerance: 50
  - name: 🌠 中转节点
    type: select
    include-all: true
    filter: 中转|CO|co
    proxies:
      - __PROXY_PROVIDERS__
      - __PROXY_NODES__
  - name: 🌄 落地节点
    type: select
    include-all: true
    filter: LD|落地|Bage|bage|jinx|ctc|Jinx|JINX|CTC|Luodi|luodi|LUODI
    proxies:
      - __PROXY_PROVIDERS__
      - __PROXY_NODES__
    dialer-proxy-group: 🌠 中转节点
  - name: 🚀 GitHub
    type: select
    include-all: true
    proxies:
      - 🚀 手动选择
      - ♻️ 自动选择
      - 🎯 全球直连
  - name: 🎯 全球直连
    type: select
    proxies:
      - DIRECT
  - name: 🐟 漏网之鱼
    type: select
    include-all: true
    proxies:
      - 🚀 手动选择
      - ♻️ 自动选择
      - 🎯 全球直连

rules:
  - GEOSITE,private,🎯 全球直连
  - GEOIP,private,🎯 全球直连,no-resolve
  - GEOSITE,github,🚀 GitHub
  - GEOSITE,cn,🎯 全球直连
  - GEOIP,cn,🎯 全球直连,no-resolve
  - MATCH,🐟 漏网之鱼
```

## 注意事项

- **模板格式**：V3 模板使用 YAML 格式，与 V2（INI 格式）不兼容，但可以通过转换功能迁移
- **节点过滤规则(filter)**：默认会使用所有节点匹配，与显式开启代理集合+节点(include-all)结果一致
- **正则表达式**：filter 和 exclude-filter 使用正则表达式语法，特殊字符需要转义
- **代理组顺序**：代理组的顺序会影响最终配置，建议将常用的代理组放在前面
- **空代理组**：如果代理组的 filter 没有匹配到任何节点，该代理组会被自动移除
- **绑定影响**：绑定模板后，订阅的规则配置将被模板完全覆盖
