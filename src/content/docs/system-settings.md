---
title: "系统设置"
description: "妙妙屋X 系统设置的每个配置项详解"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

![系统设置完整页面截图](/images/screenshots/doc-system-settings-overview.webp)

系统设置完整页面 — 按 Card 划分各功能区(订阅同步 / 系统设置 / 安全阈值 / Turnstile / 定时配置 / 主控地址 / API Token / 许可证)

## 在线演示:系统设置

主控 /system-settings 页面的本地 mock 复刻 — 8 个 Card 一字排开,所有 toggle/input/radio 都可点,「保存」按钮模拟落盘;全部本地状态,不发任何请求。

Mock 演示所有开关 / 输入框即点即响应 · 「保存」会出 toast

订阅同步

订阅刷新策略、流量同步、节点过滤等。

同步流量统计

从远程服务器拉流量,允许按用户精细统计。关掉则只在主控本地累计。

节点名过滤(用 | 分隔关键字)

常用于剔除上游订阅里的「剩余流量 X GB」「官网 example.com」「套餐到期 yyyy-mm-dd」之类公告节点。

订阅追加流量与到期信息

客户端拉订阅时,把当前已用 / 剩余流量 + 套餐到期写到响应头,客户端能据此显示。

强制从外部订阅同步

即使缓存未过期也强制重新拉取外部订阅。一般用于排障。

节点匹配规则

按节点名

按服务器:端口

按协议+服务器:端口

订阅同步识别"同一个节点"用的字段。默认按协议+服务器+端口,准确率最高。

同步范围

仅同步已保存的节点

同步所有节点(含新增)

保留本地修改过的节点名

即使上游名字变了,本地手改过的名字也不会被覆盖。

订阅缓存过期(分钟)

主控对外部订阅的缓存有效期;越短越实时,越长越省 CPU/流量。

**保存**

系统选项

短链、覆写脚本、妙妙屋兼容、节点倍率等系统级开关。

启用短链生成

订阅链接以 /x/{code} 形式分发,免暴露用户名 token。

启用覆写脚本

允许在订阅生成最后阶段跑用户编写的 JS/Lua 脚本对节点做最终修改。

兼容妙妙屋(老版本)特性

开启后会同时支持 mmw 的旧 API 形态与字段,方便迁移用户。

妙妙屋短链兼容(/x/{file}{user})

让老 mmw 用户的双段短链 URL 在 mmwx 里也能用,无须改客户端。

节点名添加倍率前缀

订阅输出时给倍率不为 1 的节点加前缀,例如 \[×2\] 香港节点。

**保存**

安全阈值

登录失败锁定、Token 寿命、二步验证。

允许最大失败次数

连续登录失败超过此数会触发锁定;数字越小越严。

账户锁定时长(分钟)

触发锁定后多少分钟内禁止登录。

会话 Token 有效期(小时)

登录后生成的会话凭据有效时间;到期需重新登录。默认 168(7天)。

强制管理员开启 2FA

开启后管理员必须配置 TOTP 才能继续登录,提升账户安全。

**保存**

Cloudflare Turnstile 验证码

登录页接入 CF Turnstile 免交互验证,无需 reCAPTCHA。

启用 Turnstile 验证

开启后登录页会插入 Turnstile widget;关闭等于无验证码。

Site Key

在 Cloudflare Dashboard → Turnstile 申请,公开可见的 key。

Secret Key

保密 key,主控用它向 CF 验证 token。请勿泄露。

**保存**

定时任务

流量重置 / 缓存清理 / 节点自动同步的 cron 配置。

流量重置 cron

何时触发 reset_day 到期的用户流量清零。默认每月 1 号零点。

缓存清理 cron

清理过期会话、日志、订阅缓存。默认每天 03:00。

节点自动同步 cron

主动触发 Agent 同步节点状态;默认每 30 分钟一次。

**保存**

主控对外 URL

订阅链接 / 通知 / Mini App 使用的对外地址。

主控 URL

订阅链接前缀 + Telegram MiniApp 入口都基于此地址。务必填 HTTPS 且确保所有用户都能访问。

**保存**

API Token(管理员)

管理员用于调用 /api/admin/\* 接口的长期令牌,MCP / TG Bot 等也用这个。

Bearer Token

请妥善保存,谁拿到这个 token 谁就是管理员。点 👁 查看,📋 复制。

**重新生成**

PRO 许可证PRO 已激活

激活后解锁节点测速、节点限速、分享服务器、内嵌 Xray 等 PRO 功能。

机器 IDa1b2c3d4e5f6

状态已激活

到期2027-06-07

许可证

在 mmwxlicense.com 用机器 ID 申请;粘贴到此处后点激活。

已解锁 PRO 功能

- 节点测速 — mihomo 真实延迟 + 速度测试
- 节点限速 — 按节点设置 Mbps 上下行限速
- 分享服务器 — 把节点开放给别的 mmwx 实例使用
- 内嵌 Xray — Agent 自身嵌入 xray-core,无须独立 xray 二进制

**激活 / 续期**

## 概述

系统设置按 11 个选项卡组织，覆盖订阅、功能、推送、安全、探针、外观、公告、TGBot、验证、系统与许可证。大部分设置保存后热更新；关闭公网访问等少数监听配置需要重启主控。

系统设置仅管理员可见，普通用户无法访问此页面。

## 当前设置页功能总览

以下内容依据妙妙屋X主项目当前的 /system-settings 页面整理。移动端使用下拉菜单切换，桌面端使用选项卡切换。

| 选项卡 | 主要功能                                                                                                          | 生效方式       |
| ------ | ----------------------------------------------------------------------------------------------------------------- | -------------- |
| 订阅   | 外部订阅流量同步、节点名正则过滤、强制刷新、匹配规则、同步范围、保留节点名与缓存时间。                            | 保存后生效     |
| 功能   | 短链接、覆写脚本、更新 CDN、Clash 输出格式、妙妙屋兼容功能、静默模式、强制 Agent 加密、默认模板与节点倍率前缀。   | 保存后生效     |
| 推送   | Telegram 通知配置、测试消息，以及登录、订阅获取、服务器上下线、每日流量和阈值告警等独立开关。                     | 保存后生效     |
| 安全   | 登录限流、暴力破解防护和订阅请求频率限制；字段失焦后自动保存并热更新限流器。                                      | 保存后生效     |
| 探针   | 将站点伪装为公开监控页，配置标题、Logo、隐蔽登录、服务器范围，以及 CPU、内存、硬盘、Ping 等 Agent 采集项。        | 保存后生效     |
| 外观   | 设置默认主题、登录页壁纸与自定义品牌。用户个人主题优先；自定义品牌需要对应 PRO 功能。                             | 保存后生效     |
| 公告   | 配置节点被墙、恢复、维护、订阅更新和通用公告模板；选择 Bot/Mini App 渠道、探测源并立即发布。                      | 保存后生效     |
| TGBot  | 启停内置 Bot 与 Mini App，填写 Bot Token、管理员 Telegram ID，并控制仅限调试的 Mini App 预览。保存后 Bot 热重启。 | 保存后生效     |
| 验证   | 配置 Cloudflare Turnstile Site Key 与 Secret Key，并在页面内自测。两项都配置后登录验证才会启用。                  | 保存后生效     |
| 系统   | 同步自定义代理组、调整定时任务、设置主控公开地址与公网监听、配置 TG 兑换文案，以及查看或重新生成 API Token。      | 部分设置需重启 |
| 许可证 | 查看许可证状态、套餐、有效期和服务器/节点/用户额度，更新许可证密钥并确认 PRO 功能。                               | 保存后生效     |

「关闭公网访问」会让主控仅监听 127.0.0.1，必须重启主控后生效。它只适合同机反向代理；Docker 端口映射、跨服务器反代和 IP:端口直连会失效。API Token 重新生成后，旧 Token 会立即失效。

## 外部订阅同步设置

配置外部订阅（机场订阅）的同步行为。当系统导入了外部订阅链接时，这些设置控制如何获取和更新外部节点。

### 同步外部订阅流量信息

<table class="w-full text-sm"><tbody><tr class="border-b"><td class="py-2 pr-4 font-medium w-28">类型</td><td class="py-2">开关</td></tr><tr class="border-b"><td class="py-2 pr-4 font-medium">默认值</td><td class="py-2">关闭</td></tr><tr><td class="py-2 pr-4 font-medium">说明</td><td class="py-2">开启后，流量信息页面的数据将包含外部订阅的流量信息。系统会在获取订阅时读取外部订阅的 subscription-userinfo 响应头，并将流量数据合并到总流量统计中。</td></tr></tbody></table>

### 节点名称追加订阅信息

<table class="w-full text-sm"><tbody><tr class="border-b"><td class="py-2 pr-4 font-medium w-28">类型</td><td class="py-2">开关</td></tr><tr class="border-b"><td class="py-2 pr-4 font-medium">默认值</td><td class="py-2">关闭</td></tr><tr><td class="py-2 pr-4 font-medium">说明</td><td class="py-2">开启后，同步外部订阅时会在节点名称后追加剩余流量和剩余天数。例如：节点名 398.22GB 26Days。方便用户在客户端直接查看各订阅的流量和有效期信息。</td></tr></tbody></table>

### 节点名称过滤

<table class="w-full text-sm"><tbody><tr class="border-b"><td class="py-2 pr-4 font-medium w-28">类型</td><td class="py-2">文本输入（正则表达式）</td></tr><tr class="border-b"><td class="py-2 pr-4 font-medium">默认值</td><td class="py-2"><code class="bg-muted px-1.5 py-0.5 rounded text-xs">剩余|流量|到期|订阅|时间|重置</code></td></tr><tr><td class="py-2 pr-4 font-medium">说明</td><td class="py-2">使用正则表达式匹配节点名称，匹配成功的节点会在同步时被过滤掉。常用于过滤机场订阅中的流量信息节点、公告节点等非代理节点。留空则不进行任何过滤。</td></tr></tbody></table>

### 外部订阅同步

<table class="w-full text-sm"><tbody><tr class="border-b"><td class="py-2 pr-4 font-medium w-28">类型</td><td class="py-2">开关</td></tr><tr class="border-b"><td class="py-2 pr-4 font-medium">默认值</td><td class="py-2">关闭</td></tr><tr><td class="py-2 pr-4 font-medium">说明</td><td class="py-2">开启后，每次用户通过订阅链接获取订阅时，系统都会重新拉取外部订阅链接的最新节点并更新数据库。关闭时仅使用数据库中已保存的节点。</td></tr></tbody></table>

开启后会增加获取订阅接口的响应时间，因为每次都需要访问外部订阅链接。建议配合缓存过期时间使用。

开启后展开以下子配置：

#### 匹配规则

控制同步时如何匹配本地节点和远程节点的对应关系。

| 选项             | 说明                                                 |
| ---------------- | ---------------------------------------------------- |
| 节点名称         | 通过节点名称匹配（默认），适合节点名称稳定的订阅     |
| 服务器:端口      | 通过服务器地址和端口匹配，适合节点名称经常变化的订阅 |
| 类型:服务器:端口 | 通过协议类型+服务器+端口匹配，最精确的匹配方式       |

#### 同步范围

控制同步时更新哪些节点。

| 选项             | 说明                                                       |
| ---------------- | ---------------------------------------------------------- |
| 仅同步已保存节点 | 只更新数据库中已存在的节点信息（默认），不会自动添加新节点 |
| 同步所有节点     | 同步远程订阅的所有节点，新增的节点会自动添加到数据库       |

#### 保留当前节点名称

<table class="w-full text-sm"><tbody><tr class="border-b"><td class="py-2 pr-4 font-medium w-28">默认值</td><td class="py-2">开启</td></tr><tr><td class="py-2 pr-4 font-medium">说明</td><td class="py-2">开启后，同步时保留数据库中的节点名称，不使用外部订阅的节点名称。适合已手动修改过节点名称的场景。</td></tr></tbody></table>

#### 缓存过期时间（分钟）

<table class="w-full text-sm"><tbody><tr class="border-b"><td class="py-2 pr-4 font-medium w-28">默认值</td><td class="py-2">0（每次都重新拉取）</td></tr><tr><td class="py-2 pr-4 font-medium">说明</td><td class="py-2">设置为 0 表示每次获取订阅时都重新拉取外部订阅。设置大于 0 时，只有距离上次拉取超过设定的分钟数才会重新拉取。建议设置为 30-60 分钟以平衡数据新鲜度和响应速度。</td></tr></tbody></table>

## 功能开关

管理系统各功能模块的启用状态。

### 静默模式

<table class="w-full text-sm"><tbody><tr class="border-b"><td class="py-2 pr-4 font-medium w-28">类型</td><td class="py-2">开关</td></tr><tr class="border-b"><td class="py-2 pr-4 font-medium">默认值</td><td class="py-2">关闭</td></tr><tr><td class="py-2 pr-4 font-medium">说明</td><td class="py-2">开启后，妙妙屋X 服务对所有请求返回 404 页面，隐藏面板的真实存在。当用户通过订阅链接获取一次订阅后，服务器恢复正常访问，恢复时长由「恢复访问时长」设置决定。超时后重新进入静默状态。</td></tr></tbody></table>

静默模式开启后你将无法直接访问面板，只有获取一次订阅才能临时恢复。请确保已正确配置好订阅链接后再开启。

#### 恢复访问时长（分钟）

<table class="w-full text-sm"><tbody><tr class="border-b"><td class="py-2 pr-4 font-medium w-28">默认值</td><td class="py-2">15 分钟</td></tr><tr class="border-b"><td class="py-2 pr-4 font-medium">范围</td><td class="py-2">1 ~ 1440 分钟</td></tr><tr><td class="py-2 pr-4 font-medium">说明</td><td class="py-2">用户通过订阅链接获取订阅后，服务器恢复正常访问的持续时长。超时后重新进入 404 静默状态。</td></tr></tbody></table>

### 启用短链接

<table class="w-full text-sm"><tbody><tr class="border-b"><td class="py-2 pr-4 font-medium w-28">类型</td><td class="py-2">开关</td></tr><tr class="border-b"><td class="py-2 pr-4 font-medium">默认值</td><td class="py-2">关闭</td></tr><tr><td class="py-2 pr-4 font-medium">说明</td><td class="py-2">开启后，订阅链接页面会额外显示一个 6 位字符的短链接。短链接更便于分享和输入。用户可在个人设置页面重置短链接。</td></tr></tbody></table>

### 客户端兼容模式

<table class="w-full text-sm"><tbody><tr class="border-b"><td class="py-2 pr-4 font-medium w-28">类型</td><td class="py-2">开关</td></tr><tr class="border-b"><td class="py-2 pr-4 font-medium">默认值</td><td class="py-2">关闭</td></tr><tr><td class="py-2 pr-4 font-medium">说明</td><td class="py-2">开启后，生成订阅时会自动过滤目标客户端不支持的节点类型（如 Clash 不支持的 WireGuard 节点），仅记录日志而不报错。关闭时遇到不兼容节点会输出错误信息。</td></tr></tbody></table>

### 覆写脚本

<table class="w-full text-sm"><tbody><tr class="border-b"><td class="py-2 pr-4 font-medium w-28">类型</td><td class="py-2">开关</td></tr><tr class="border-b"><td class="py-2 pr-4 font-medium">默认值</td><td class="py-2">关闭</td></tr><tr><td class="py-2 pr-4 font-medium">说明</td><td class="py-2">开启后，覆写管理页面会显示脚本功能入口。可使用 JavaScript 脚本对订阅配置进行二次修改，例如修改节点属性、添加自定义字段、调整代理组结构等。适合有高级定制需求的用户。</td></tr></tbody></table>

### 探针服务器绑定

<table class="w-full text-sm"><tbody><tr class="border-b"><td class="py-2 pr-4 font-medium w-28">类型</td><td class="py-2">开关</td></tr><tr class="border-b"><td class="py-2 pr-4 font-medium">默认值</td><td class="py-2">关闭</td></tr><tr><td class="py-2 pr-4 font-medium">说明</td><td class="py-2">开启后，节点管理列表中每个节点会显示探针绑定按钮，可将节点绑定到特定的探针服务器。绑定后，流量统计只汇总该节点绑定的探针数据，实现更精确的流量归属统计。</td></tr></tbody></table>

### 启用代理集合

<table class="w-full text-sm"><tbody><tr class="border-b"><td class="py-2 pr-4 font-medium w-28">类型</td><td class="py-2">开关</td></tr><tr class="border-b"><td class="py-2 pr-4 font-medium">默认值</td><td class="py-2">关闭</td></tr><tr><td class="py-2 pr-4 font-medium">说明</td><td class="py-2">代理集合（Proxy Provider）允许从外部订阅动态加载节点。开启后可在订阅文件页面配置代理集合，并在编辑代理组时将代理集合拖入代理组。适合需要混合使用本地节点和外部机场节点的场景。</td></tr></tbody></table>

### 模板版本

<table class="w-full text-sm"><tbody><tr class="border-b"><td class="py-2 pr-4 font-medium w-28">类型</td><td class="py-2">单选</td></tr><tr class="border-b"><td class="py-2 pr-4 font-medium">默认值</td><td class="py-2">v2（通用后端）</td></tr><tr><td class="py-2 pr-4 font-medium">说明</td><td class="py-2">选择订阅生成时使用的模板引擎版本。不同版本的模板语法和功能不同。</td></tr></tbody></table>

| 版本 | 名称     | 说明                                                           |
| ---- | -------- | -------------------------------------------------------------- |
| `v1` | 旧版     | 使用 rule_templates 目录下的文件模板，直接编辑 YAML 文件       |
| `v2` | 通用后端 | 使用数据库存储模板，支持网页端可视化管理，兼容通用后端模板格式 |
| `v3` | 新版     | 新版模板系统，类 mihomo 配置风格，支持可视化编辑代理组和规则   |

### 订阅响应头流量信息

<table class="w-full text-sm"><tbody><tr class="border-b"><td class="py-2 pr-4 font-medium w-28">类型</td><td class="py-2">开关</td></tr><tr class="border-b"><td class="py-2 pr-4 font-medium">默认值</td><td class="py-2">开启</td></tr><tr><td class="py-2 pr-4 font-medium">说明</td><td class="py-2">开启后，用户获取订阅时系统会读取探针和外部订阅的流量数据，并在 HTTP 响应头中写入 subscription-userinfo 信息。客户端（如 Clash、Stash）会据此显示流量用量和到期时间。关闭后跳过流量数据读取，不写入响应头。</td></tr></tbody></table>

### 订阅序列化格式

<table class="w-full text-sm"><tbody><tr class="border-b"><td class="py-2 pr-4 font-medium w-28">类型</td><td class="py-2">单选</td></tr><tr class="border-b"><td class="py-2 pr-4 font-medium">默认值</td><td class="py-2">YAML</td></tr><tr class="border-b"><td class="py-2 pr-4 font-medium">可选值</td><td class="py-2"><code class="bg-muted px-1.5 py-0.5 rounded text-xs">YAML</code> / <code class="bg-muted px-1.5 py-0.5 rounded text-xs">JSON</code></td></tr><tr><td class="py-2 pr-4 font-medium">说明</td><td class="py-2">选择 Clash 订阅的输出格式。默认 YAML 格式，选择 JSON 后 Clash 订阅将以 JSON 格式输出。此设置仅影响 Clash 格式的订阅，不影响其他客户端格式（Surge、Sing-Box、Shadowrocket 等）。</td></tr></tbody></table>

### 订阅信息节点

<table class="w-full text-sm"><tbody><tr class="border-b"><td class="py-2 pr-4 font-medium w-28">类型</td><td class="py-2">开关</td></tr><tr class="border-b"><td class="py-2 pr-4 font-medium">默认值</td><td class="py-2">关闭</td></tr><tr><td class="py-2 pr-4 font-medium">说明</td><td class="py-2">开启后，订阅输出时会在节点列表顶部额外添加两个信息节点，分别显示过期时间和剩余流量。这些节点并非真实代理节点，仅用于在客户端节点列表中直观展示订阅信息。</td></tr></tbody></table>

开启后可自定义信息节点的前缀文本：

#### 过期时间前缀

<table class="w-full text-sm"><tbody><tr class="border-b"><td class="py-2 pr-4 font-medium w-28">默认值</td><td class="py-2">📅过期时间</td></tr><tr><td class="py-2 pr-4 font-medium">示例输出</td><td class="py-2"><code class="bg-muted px-1.5 py-0.5 rounded text-xs">📅过期时间：2025-12-31</code></td></tr></tbody></table>

#### 剩余流量前缀

<table class="w-full text-sm"><tbody><tr class="border-b"><td class="py-2 pr-4 font-medium w-28">默认值</td><td class="py-2">⌛剩余流量</td></tr><tr><td class="py-2 pr-4 font-medium">示例输出</td><td class="py-2"><code class="bg-muted px-1.5 py-0.5 rounded text-xs">⌛剩余流量：156.8 GB</code></td></tr></tbody></table>

## 通知推送配置

通过 Telegram Bot 推送系统关键事件通知。

### 启用通知推送

<table class="w-full text-sm"><tbody><tr class="border-b"><td class="py-2 pr-4 font-medium w-28">类型</td><td class="py-2">开关</td></tr><tr class="border-b"><td class="py-2 pr-4 font-medium">默认值</td><td class="py-2">关闭</td></tr><tr><td class="py-2 pr-4 font-medium">说明</td><td class="py-2">开启后，系统会通过 Telegram Bot 发送事件通知。需要先在功能开关卡片中的通知推送旁点击齿轮图标配置 Bot Token 和 Chat ID。</td></tr></tbody></table>

### Telegram Bot 配置

点击通知推送开关旁的齿轮图标展开配置面板。

| 配置项    | 格式                | 说明                                                |
| --------- | ------------------- | --------------------------------------------------- |
| Bot Token | `123456:ABC-DEF...` | 从 @BotFather 创建 Bot 后获取的 API Token           |
| Chat ID   | `-1001234567890`    | 接收通知的 Telegram 聊天 ID，可以是个人、群组或频道 |

配置完成后可点击「发送测试通知」按钮验证配置是否正确。

### 通知事件

可独立开关每种通知事件：

| 事件         | 默认值 | 说明                                                                                 |
| ------------ | ------ | ------------------------------------------------------------------------------------ |
| 订阅获取通知 | 开启   | 用户通过订阅链接获取订阅时发送通知，包含用户名、客户端类型和 IP 地址                 |
| 登录通知     | 开启   | 用户登录面板时发送通知，包含用户名和 IP 地址                                         |
| IP 封禁通知  | 开启   | IP 因多次错误请求被系统自动封禁时发送通知                                            |
| 静默模式通知 | 开启   | 静默模式状态变更（进入/退出 404 状态）时发送通知                                     |
| 订阅到期通知 | 开启   | 用户订阅即将到期时发送提醒通知                                                       |
| 每日流量通知 | 关闭   | 每日定时发送流量统计报告。开启后可设置发送时间（默认 08:00），格式为 24 小时制 HH:MM |

## 代理组配置同步

<table class="w-full text-sm"><tbody><tr class="border-b"><td class="py-2 pr-4 font-medium w-28">说明</td><td class="py-2">从远程地址同步最新的预设代理组配置。代理组配置包含常用规则分类和对应的 rule-providers 设置。同步后将更新生成订阅页面的规则选择器和预置代理组。</td></tr><tr class="border-b"><td class="py-2 pr-4 font-medium">远程配置地址</td><td class="py-2">可自定义远程配置的 URL 地址。留空使用系统默认地址或环境变量配置的地址。</td></tr><tr><td class="py-2 pr-4 font-medium">操作</td><td class="py-2">点击「同步代理组配置」按钮手动触发同步。同步成功后页面会显示确认提示。</td></tr></tbody></table>

## Master 端配置文件

Master 端（主控）的服务配置通过配置文件或环境变量进行设置，与 Web UI 中的系统设置相互独立。

```
# config.yaml
port: 12889
database_path: data/traffic.db
jwt_secret: your-secret-key
log_level: info
allowed_origins: "*"
```

配置文件通过 -c config.yaml 指定，也可通过环境变量覆盖。

| 配置            | 说明                                        | 默认值          |
| --------------- | ------------------------------------------- | --------------- |
| port            | 后端 HTTP 服务监听端口                      | 12889           |
| database_path   | SQLite 数据库文件路径                       | data/traffic.db |
| jwt_secret      | JWT 签名密钥，用于用户认证                  | \-              |
| log_level       | 系统日志级别（debug / info / warn / error） | info            |
| allowed_origins | CORS 允许的来源，\* 表示允许所有            | \*              |

## Master 端环境变量

环境变量会覆盖 config.yaml 中的同名配置：

| 变量            | 说明            |
| --------------- | --------------- |
| PORT            | 服务端口        |
| JWT_SECRET      | JWT 签名密钥    |
| LOG_LEVEL       | 日志级别        |
| ALLOWED_ORIGINS | CORS 允许的来源 |

## Agent 端连接配置

Agent 部署在远程代理服务器上，需要配置与 Master 的连接方式。

```
# config.yaml (Agent 端)
master_url: "https://your-master-domain.com"
token: "your-server-token"
listen_port: "23889"
connection_mode: "auto"
traffic_report_interval: "1m"
speed_report_interval: "3s"
restart_method: "auto"
restart_command: ""
```

| 配置                    | 说明                                            | 默认值 |
| ----------------------- | ----------------------------------------------- | ------ |
| master_url              | Master 主控服务器地址                           | \-     |
| token                   | 服务器认证 Token                                | \-     |
| listen_port             | Agent API 监听端口                              | 23889  |
| connection_mode         | 连接模式（见下方说明）                          | auto   |
| traffic_report_interval | 流量数据上报间隔                                | 1m     |
| speed_report_interval   | 网速数据上报间隔                                | 3s     |
| restart_method          | Xray 重启方式（auto / systemctl / 自定义命令）  | auto   |
| restart_command         | 自定义重启命令（restart_method 非 auto 时生效） | \-     |

## 连接模式

Agent 与 Master 之间支持多种通信方式，可根据网络环境选择最合适的模式。

#### auto（推荐）

自动选择最佳连接方式。优先使用 WebSocket，失败后降级到 HTTP，再降级到 Pull 模式。支持指数退避自动重连。

#### websocket

全双工 WebSocket 连接，支持实时双向通信。心跳间隔 30 秒，空闲超时 5 分钟。适合网络稳定的环境。

#### http

通过 HTTP POST 主动推送数据到 Master。适用于无法建立长连接的网络环境。

#### pull

被动模式，由 Master 主动拉取 Agent 数据。Agent 仅暴露本地 API，无需主动连接 Master。适用于 Agent 在内网或无法主动出站的场景。

## Agent 端环境变量

环境变量会覆盖 config.yaml 中的同名配置：

| 变量                  | 说明                                       |
| --------------------- | ------------------------------------------ |
| MMWX_MASTER_URL       | Master 主控地址                            |
| MMWX_TOKEN            | 服务器认证 Token                           |
| MMWX_CONNECTION_MODE  | 连接模式（auto / websocket / http / pull） |
| MMWX_LISTEN_PORT      | Agent API 监听端口                         |
| MMWX_XRAY_CONFIG      | Xray 配置文件路径（config.json）           |
| MMWX_XRAY_CONFDIR     | Xray 配置目录路径（多文件模式）            |
| MMWX_TRAFFIC_INTERVAL | 流量上报间隔（如 1m、30s）                 |
| MMWX_SPEED_INTERVAL   | 网速上报间隔（如 3s、5s）                  |
| MMWX_RESTART_METHOD   | Xray 重启方式                              |
| MMWX_RESTART_COMMAND  | 自定义 Xray 重启命令                       |
