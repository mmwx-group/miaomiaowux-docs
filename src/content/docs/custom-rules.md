---
title: "自定义规则"
description: "订阅分流规则自定义"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

![自定义规则页面截图](/images/screenshots/doc-custom-rules-page.webp)

自定义规则管理页面 — 创建 / 编辑 / 启停分流规则集

## 概述

自定义规则允许在订阅输出中添加额外的分流规则，控制特定域名或 IP 的代理行为。规则会插入到模板规则之前，优先级更高。

## 规则类型

| 类型           | 格式           | 示例                           |
| -------------- | -------------- | ------------------------------ |
| DOMAIN         | 精确域名匹配   | DOMAIN,example.com,PROXY       |
| DOMAIN-SUFFIX  | 域名后缀匹配   | DOMAIN-SUFFIX,google.com,PROXY |
| DOMAIN-KEYWORD | 域名关键词匹配 | DOMAIN-KEYWORD,github,PROXY    |
| IP-CIDR        | IP 段匹配      | IP-CIDR,10.0.0.0/8,DIRECT      |
| GEOIP          | GeoIP 匹配     | GEOIP,CN,DIRECT                |

## 策略

| 策略   | 说明         |
| ------ | ------------ |
| PROXY  | 通过代理访问 |
| DIRECT | 直接连接     |
| REJECT | 拒绝连接     |

## 配置示例

```
# 自定义规则示例
DOMAIN-SUFFIX,openai.com,PROXY
DOMAIN-SUFFIX,anthropic.com,PROXY
DOMAIN-KEYWORD,github,PROXY
IP-CIDR,192.168.0.0/16,DIRECT
GEOIP,CN,DIRECT
```
