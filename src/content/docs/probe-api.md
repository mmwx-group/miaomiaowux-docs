---
title: "探针 API 字段说明"
description: "内置与独立探针的数据接口、字段单位、返回条件和历史序列查询说明。"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

## 开启探针

探针在「系统设置 → 探针」选项卡开启：可把站点伪装为公开监控页，配置标题、Logo、隐蔽登录、展示的服务器范围，以及 CPU / 内存 / 硬盘 / Ping 等 Agent 采集项；服务器的地区、服务商、续费价格等展示信息在「服务管理 → 编辑服务器 → 探针展示信息」里填写。

![系统设置探针选项卡截图](../../assets/screenshots/settings-probe.webp)

系统设置 → 探针：伪装探针的各项开关

## 探针页面

除「高级黑金」外，各主题的探针页（包括 [外置探针](/docs/install-external-probe)）都用下面这套布局。

### 顶部指标

| 指标 | 说明 |
| --- | --- |
| 总节点 | 展示的服务器台数，点击显示全部 |
| 在线 | 在线台数 |
| 总下行 / 上行 | 全部服务器的实时网速合计 |
| 今日流量 | 全部服务器今天的流量合计 |
| 平均负载 | 在线服务器的平均 CPU 占用 |
| 待续费 | 30 天内到期的台数和续费金额合计（填了续费价格的才算） |

在「系统设置 → 探针」打开地球时，六个指标排成左侧三列两行，地球放在右侧。地球上每个有服务器的地区旁显示国旗和服务器数量；地区挨得太近时自动错开，实在放不下的就不显示。

### 工具条

- **搜索**：按服务器名称筛选。
- **地区**：只看某个地区。
- **告警 N**：只看 CPU、内存、硬盘或计费用量超过 90% 的服务器；**待续费 N**：只看 30 天内到期的。
- **排序**：默认顺序（管理员排好的）、名称、CPU、内存、网速、流量、到期日、延迟。没有该项数据的排最后。
- **按地区**：卡片按地区分组显示。
- **标准 / 紧凑**：紧凑模式只留 CPU / 内存 / 硬盘占用、计费用量和网速，一屏放更多台。

排序、分组和紧凑的选择记在访客自己的浏览器里。宽屏时工具条在滚动时固定在顶部。

### 服务器卡片

- 进度条下写出规格：CPU 核心数、内存和硬盘的「已用 / 总量」。
- 卡片右上角显示健康状态；有告警的卡片带红色描边。
- 离线的服务器只保留规格、续费信息和「最后在线 xx 分钟前」。

## 访问与鉴权

内置探针使用同源浏览器请求。独立探针开启接口保护后必须发送 X-MMwx-Probe-Token 请求头。通道或探针未开启时通常返回 404。

<table class="w-full min-w-[620px] text-sm"><tbody><tr class="border-b"><td class="px-4 py-3 font-mono">GET /api/public/probe-servers</td><td class="px-4 py-3">当前状态及近一小时延迟摘要</td></tr><tr class="border-b"><td class="px-4 py-3 font-mono">WS /api/public/probe-ws</td><td class="px-4 py-3">每 5 秒推送相同的快照结构</td></tr><tr><td class="px-4 py-3 font-mono">GET /api/public/probe-series</td><td class="px-4 py-3">延迟或系统指标历史</td></tr></tbody></table>

## 服务器快照字段

| 字段          | 类型/单位 | 说明                                     |
| ------------- | --------- | ---------------------------------------- |
| enabled       | boolean   | 探针数据是否启用；关闭时仅保证返回此字段 |
| title         | string    | 自定义探针标题                           |
| logo          | string    | Logo URL 或 data: URI                    |
| appearance    | object    | 主题信息：theme、color_mode、revision    |
| block_login   | boolean   | 是否禁止访问原登录页                     |
| show_name     | boolean   | 是否返回服务器名称                       |
| show_globe    | boolean   | 是否显示 3D 地球                         |
| license_badge | object    | 可选许可证铭牌：name、display_name       |
| servers       | array     | 管理员选择展示的服务器列表               |

## servers\[\] 字段

| 字段                                                     | 类型/单位        | 说明                                                          |
| -------------------------------------------------------- | ---------------- | ------------------------------------------------------------- |
| name                                                     | string           | 服务器名称；受显示名称开关控制                                |
| online                                                   | boolean          | Agent WebSocket 或数据库状态是否在线                          |
| last_seen                                                | string, ISO 8601 | 最后心跳时间；只有离线服务器才返回                            |
| region                                                   | string           | 地区 Emoji                                                    |
| region_country / region_name / region_city               | string           | 国家、完整地域和城市                                          |
| provider_name / provider_url                             | string           | 服务商名称与安全的 HTTP(S) 网址                               |
| telecom_paid_peer                                        | boolean          | 服务商是否标记为电信 163 Paid Peer                            |
| upload_speed / download_speed                            | integer, B/s     | 当前上行、下行网速                                            |
| traffic_used / traffic_limit                             | integer, byte    | 按服务器统计模式计算的当前周期计费用量和限额；限额 0 表示不限 |
| traffic_used_up / traffic_used_down / traffic_used_total | integer, byte    | 当前周期实际上行、下行及两者合计                              |
| period_start / period_end                                | YYYY-MM-DD       | 计费周期起点（含）和下一重置日（不含）                        |
| cumulative_up / cumulative_down                          | integer, byte    | 系统网卡当前周期累计上行、下行                                |
| daily_traffic                                            | array            | 当前重置周期每日流量                                          |
| cpu_pct                                                  | number, %        | CPU 使用率                                                    |
| loadavg                                                  | string           | 系统负载文本                                                  |
| mem_used / mem_total                                     | integer, byte    | 内存使用量和总量                                              |
| disk_used / disk_total                                   | integer, byte    | 磁盘使用量和总量                                              |
| uptime                                                   | integer, second  | 系统在线时长                                                  |
| cpu_model / cpu_cores / cpu_threads                      | string / integer | CPU 型号、核心数和线程数                                      |
| os / kernel / arch                                       | string           | 操作系统、内核版本和架构                                      |
| ping                                                     | array            | 近一小时延迟与丢包摘要                                        |
| expires_at                                               | YYYY-MM-DD       | 服务器到期日期；可回退到下个流量重置日                        |
| renewal_price / renewal_currency                         | number / string  | 原币续费价格与 ISO 货币代码                                   |
| renewal_cycle                                            | string           | month、quarter、half_year 或 year                             |
| renewal_price_cny                                        | number           | 按许可证服务器汇率折算的人民币价格                            |
| return_routes                                            | array            | 三网回程测试结果                                              |

## 嵌套结构

`daily_traffic[]`: `date` (YYYY-MM-DD), `uplink`, `downlink`, `total` (byte).

`ping[]`: `key`, `label`, `isp`, `current_ms`, `loss_pct`, `buckets`. 列表包含 12 个五分钟桶；桶内 ms 为平均延迟，loss 为 0–100 丢包率，-1 表示无数据。

`return_routes[]`: `carrier` (telecom/unicom/mobile), `region`, `route_type`, `tested_at` (RFC 3339).

## 历史序列

参数：server 为 servers 数组下标（不是数据库 ID）；metric 为 ping（默认）或 system；range 为 1h、6h、24h；target 为 ping key；all=1 返回全部目标。

粒度：1h = 12×5 分钟，6h = 36×10 分钟，24h = 48×30 分钟。通用字段为 success、bucket_sec、generated_at 和 series；all=1 额外返回 all_series。

`metric=system`: `cpu_pct`, `mem_used`, `mem_total`, `upload_speed`, `download_speed`, `cumulative_up`, `cumulative_down`. 每项都是 { t: Unix 秒, value: 数值 } 数组。

## 字段缺省规则

大多数采集指标使用可选字段：开关关闭、Agent 版本不支持或尚无数据时字段会直接缺省，而不是返回 0。接口不会返回服务器 ID、IP、Token、Agent 地址、主机名或 Xray 配置。
