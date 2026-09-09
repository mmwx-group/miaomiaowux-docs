---
title: "Xray 系统配置"
description: "Xray 全局配置项：日志、DNS、策略等"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

## 概述

Xray 系统配置包含全局级别的设置，影响所有入站和出站的行为。它们与入站 / 出站 / 路由一起保存在同一份 config.json 中，可在服务管理 → 服务器卡片「Xray配置」→「配置管理」选项卡里直接查看和编辑。

![Xray 配置管理选项卡截图](../../assets/screenshots/servers-xray-manage-config.webp)

配置管理：完整的 config.json，包含 api / dns / inbounds / outbounds / routing / policy / stats 等顶层字段

## 配置项

| 配置     | 说明                                  |
| -------- | ------------------------------------- |
| 日志级别 | none / error / warning / info / debug |
| DNS      | 自定义 DNS 服务器配置                 |
| 策略     | 连接策略、缓冲区大小等                |
| 统计     | 流量统计开关                          |
| API      | gRPC API 配置（用于流量统计）         |

截图中开头的 `api` 段（HandlerService / LoggerService / StatsService / RoutingService）与 `inbounds[0]` 的 `dokodemo-door` 入站（tag 为 api，监听 127.0.0.1）就是主控远程管理和流量统计所依赖的接口，请勿删除。

## 修改方式

1. 打开服务器卡片「Xray配置」，停留在「配置管理」选项卡
2. 直接在编辑器里修改，例如把 `log.loglevel` 改为 `warning`，或在 `dns.servers` 里加入自定义 DNS
3. 点「格式化」检查 JSON 合法性，再点「保存配置」，主控下发并重启 Xray
4. 如需回退，到「Agent → 配置历史」选择之前的快照「下发」

对于内联 Xray 模式的服务器，Agent 在启动时会自动向配置注入统计、策略与自定义调度器等运行时组件，手工修改这些字段会在下次启动时被覆盖。

## 注意事项

- 修改系统配置后需要重启 Xray 服务生效（保存配置会自动重启）
- 开启流量统计会略微增加内存占用
- API 入站用于 gRPC 流量统计，请勿删除
