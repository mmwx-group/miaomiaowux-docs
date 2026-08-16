---
title: "Xray 系统配置"
description: "Xray 全局配置项：日志、DNS、策略等"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

## 概述

Xray 系统配置包含全局级别的设置，影响所有入站和出站的行为。可在服务器详情页的「系统配置」标签页中管理。

## 配置项

| 配置     | 说明                                  |
| -------- | ------------------------------------- |
| 日志级别 | none / error / warning / info / debug |
| DNS      | 自定义 DNS 服务器配置                 |
| 策略     | 连接策略、缓冲区大小等                |
| 统计     | 流量统计开关                          |
| API      | gRPC API 配置（用于流量统计）         |

## 注意事项

- \- 修改系统配置后需要重启 Xray 服务生效
- \- 开启流量统计会略微增加内存占用
- \- API 入站用于 gRPC 流量统计，请勿删除
