---
title: "内嵌 Xray"
description: "将 Xray 内核直接运行在 Agent 进程内，解锁限速推送和实时流量控制（PRO）"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

## 在线演示:外置 vs 内嵌 Xray

切换上方模式按钮,下面 3 台服务器的「进程关系图」会实时变化:外置模式下 mmw-agent + xray 是两个独立进程,内嵌模式下 xray-core 嵌进 mmw-agent 进程内,共进退、共享内存。

Mock 演示PRO切换模式 → 进程图实时变 + 对比表对应高亮

Xray 运行模式

外置 Xray

独立 xray 进程,Agent 通过 gRPC 控制。免费、官方标准布局。

内嵌 XrayPRO

xray-core 编进 Agent 二进制,同进程运行。占用少、升级方便。

各服务器进程视图

hk1.example.com

mmw-agent

PID 1234

主控通信 + Xray gRPC 控制端

gRPC

xray

PID 5678

独立 xray 进程,处理代理流量

us1.example.com

mmw-agent

PID 1234

主控通信 + Xray gRPC 控制端

gRPC

xray

PID 5678

独立 xray 进程,处理代理流量

jp1.example.com

mmw-agent

PID 1234

主控通信 + Xray gRPC 控制端

gRPC

xray

PID 5678

独立 xray 进程,处理代理流量

| 对比项     | 外置 Xray                           | 内嵌 Xray             |
| ---------- | ----------------------------------- | --------------------- |
| 进程数     | 2 (mmw-agent + xray)                | 1 (mmw-agent 含 xray) |
| 磁盘占用   | ~30 MB(agent) + ~30 MB(xray 二进制) | ~50 MB(只装 agent)    |
| 内存占用   | agent + xray 各自常驻               | 单进程,共享内存       |
| Xray 升级  | 需重装 xray-core                    | 随 agent 升级         |
| 配置文件   | /usr/local/etc/xray/config.json     | 由 agent 持有         |
| gRPC 通讯  | 需要                                | 不需要(进程内调用)    |
| 故障隔离   | 独立进程,互不影响                   | 同进程,一同生死       |
| 排障熟悉度 | 官方 Xray 标准布局                  | 需通过 agent 日志     |
| PRO 许可证 | ✓ 免费                              | ✗ 仅 PRO 可用         |

当前模式:外置 Xraymmw-agent ↔ xray 两个进程独立运行

## 概述

内嵌 Xray（Embedded Xray）是 PRO 功能，它将 Xray 内核作为库直接嵌入到 Agent 进程中运行，替代传统的外置 Xray 服务。内嵌模式下，Agent 拥有对 Xray 内核的完整控制权，可以实现外置模式无法支持的高级功能，如实时限速推送、设备数限制、自动限速规则和精确的在线用户追踪。

内嵌 Xray 是 PRO 功能，需要有效的许可证且许可证包含 limiter 特性。

## 内嵌 vs 外置模式

| 对比项           | 内嵌模式 (Embedded)               | 外置模式 (External)    |
| ---------------- | --------------------------------- | ---------------------- |
| Xray 运行方式    | 作为库嵌入 Agent 进程内           | 独立 systemd 服务      |
| PRO 许可证       | 需要                              | 不需要                 |
| 限速推送         | ✓ 支持                            | ✗ 不支持               |
| 设备数限制       | ✓ 支持                            | ✗ 不支持               |
| 自动限速规则     | ✓ 支持                            | ✗ 不支持               |
| 在线用户/IP 追踪 | ✓ 精确追踪                        | ✗ 不支持               |
| XTLS Vision 限速 | ✓ 通过 Hook 支持                  | ✗ 不支持               |
| 热更新限速       | 无需重启即时生效                  | \-                     |
| 配置路径         | `/usr/local/etc/xray/config.json` | 自动检测多路径         |
| 安装 Xray        | 无需单独安装                      | 需要安装独立 Xray 服务 |

## 工作原理

```
Agent 启动 (xray_mode: embedded)
     │
     ├─ 停止外置 Xray 服务 (systemctl stop xray)
     ├─ 加载 /usr/local/etc/xray/config.json
     ├─ 注入自定义调度器 (Dispatcher) + 统计 + 策略
     ├─ 注册 Vision 限速 Hook
     └─ 启动内嵌 Xray 内核实例
          │
          ▼
主控通过 WebSocket 推送 limiter_config
     │
     ▼
Agent 实时更新限速桶 (Rate Bucket)
     │
     ├─ 每个用户独立的速度限制 (bytes/s)
     ├─ 每个用户独立的设备数限制
     └─ 自动限速规则 (sustained / burst)
          │
          ▼
自定义调度器拦截所有流量
     │
     ├─ RateWriter: 普通连接限速
     ├─ VisionLimiterHook: XTLS Vision 零拷贝连接限速
     └─ 设备数超限 → 拒绝新连接
```

## 核心能力

### 实时限速推送

主控通过 WebSocket 向内嵌 Xray Agent 推送限速配置，Agent 在不重启的情况下即时更新限速规则。每个入站的每个用户都有独立的速率桶（Rate Bucket）。

| 参数                   | 类型   | 说明                                  |
| ---------------------- | ------ | ------------------------------------- |
| `inbound_tag`          | string | 目标入站标签                          |
| `node_limit`           | uint64 | 节点级速度上限（bytes/s），0 表示不限 |
| `users[].speed_limit`  | uint64 | 用户速度上限（bytes/s），0 表示不限   |
| `users[].device_limit` | int    | 用户最大设备数，0 表示不限            |

### XTLS Vision 限速

XTLS-RPRX-VISION 协议使用零拷贝（splice）优化，普通的流量拦截无法生效。内嵌模式通过注册 Vision Limiter Hook，在 splice 之前插入限速层，对 Vision 连接也能精确控速。当用户没有设置限速时（无速率桶），Hook 返回空值，连接直接使用原始 splice 路径，零额外开销。

### 自动限速规则

内嵌模式内置速度监控器（SpeedMonitor），可配置自动限速规则，当用户流量行为触发阈值时自动施加临时限速。

| 规则类型    | 触发条件 | 说明                                                                                          |
| ----------- | -------- | --------------------------------------------------------------------------------------------- |
| `sustained` | 持续超速 | 用户速度持续超过阈值达到指定秒数后触发。例：连续 5 秒超过 100 Mbps → 限速 50 Mbps 持续 30 秒  |
| `burst`     | 突发超速 | 在时间窗口内超速次数达到阈值后触发。例：10 秒内超过 80 Mbps 达 3 次 → 限速 40 Mbps 持续 60 秒 |

### 在线用户与设备追踪

内嵌模式精确追踪每个用户的在线 IP 地址和连接数。当用户连接数达到设备数上限时，新连接会被拒绝。已建立的连接不受影响。在线信息通过 WebSocket 定期上报给主控。

### 自定义调度器

内嵌模式替换了 Xray 默认的调度器，使用自定义调度器来拦截所有出站流量。自定义调度器集成了限速模块，通过 RateWriter 对每个连接的写入操作施加速率限制，同时保持完整的流量统计能力。

## 启用内嵌模式

### 方式一：主控切换

在主控的服务器管理页面，可以直接切换服务器的 Xray 模式。切换后 Agent 会自动重启并以新模式运行。

1. 进入「远程服务器」页面
2. 点击目标服务器的设置
3. 将 Xray 模式切换为「内嵌」
4. Agent 自动重启，切换完成

### 方式二：Agent 配置文件

直接编辑 Agent 的配置文件 config.yaml：

```
xray_mode: "embedded"  # 可选值: "external"（默认）或 "embedded"
```

修改后重启 Agent 服务：`systemctl restart mmw-agent`

## 启动行为

Agent 以内嵌模式启动时，会执行以下步骤：

1.  **1\. 停止外置 Xray — 自动执行 systemctl stop xray，避免端口冲突**
2.  **2\. 配置迁移 — 如果存在外置 Xray 的 confdir 配置，自动合并到标准路径**
3.  **3\. 确保 geodata — 检查 geoip.dat / geosite.dat 是否存在**
4.  **4\. 注入运行时组件 — 向 Xray 配置注入自定义调度器、统计模块和策略配置**
5.  **5\. 注册 Vision Hook — 注册 XTLS Vision 零拷贝连接的限速拦截器**
6.  **6\. 启动内核 — 创建并启动内嵌 Xray 实例**
7.  **7\. 连接主控 — 建立 WebSocket 连接，开始接收限速配置推送**

## 流量统计

内嵌模式使用 Xray 内置的统计计数器收集流量数据，支持按入站和按用户维度统计：

| 计数器格式                           | 说明         |
| ------------------------------------ | ------------ |
| `inbound>>>tag>>>traffic>>>uplink`   | 入站上行流量 |
| `inbound>>>tag>>>traffic>>>downlink` | 入站下行流量 |
| `user>>>email>>>traffic>>>uplink`    | 用户上行流量 |
| `user>>>email>>>traffic>>>downlink`  | 用户下行流量 |

计数器采用累积模式（非破坏性读取），Agent 定期上报增量数据给主控。

## 注意事项

切换到内嵌模式时，Agent 会自动停止外置 Xray 服务。切换回外置模式后需要确保 Xray 服务正常启动。

内嵌模式的配置路径固定为 /usr/local/etc/xray/config.json，不会像外置模式那样自动检测多路径。请确保该路径可访问。

限速推送需要 PRO 许可证包含 limiter 特性。未授权时 Agent 会忽略主控推送的限速配置。

内嵌模式无需单独安装 Xray，Agent 自身即包含完整的 Xray 内核。切换后不会影响已有的入站配置。

主控 UI 中，内嵌模式的服务器会显示蓝色「内置」标识，外置模式显示灰色「外置」标识，便于区分。
