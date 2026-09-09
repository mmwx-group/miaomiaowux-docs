---
title: "覆写管理"
description: "订阅分流规则自定义：DNS / 规则 / 规则集 / 脚本四类覆写"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

![覆写管理页面截图](../../assets/screenshots/custom-rules-list.webp)

覆写管理 — 按 DNS / 规则 / 规则集 / 脚本分类的覆写列表，可启停 / 编辑 / 删除

## 概述

覆写（自定义规则）允许在订阅输出中叠加额外的配置片段，控制特定域名或 IP 的代理行为。规则会插入到模板规则之前，优先级更高。一条覆写由「类型 + 模式 + 内容」组成，可以绑定到某个模板，也可以全局生效。

## 添加覆写

点「添加覆写设置」：

![添加覆写设置对话框截图](../../assets/screenshots/custom-rules-add-dialog.webp)

添加覆写设置：启用开关、名称、类型、模式、模板（可选）、YAML 内容

| 字段         | 说明                                                                                   |
| ------------ | -------------------------------------------------------------------------------------- |
| 启用         | 关闭后保留配置但不参与订阅生成                                                         |
| 名称         | 便于识别的名称                                                                         |
| 类型         | DNS / 规则 / 规则集 / 脚本，决定覆写作用在配置的哪个部分                               |
| 模式         | 替换：整段替换模板中对应字段；追加 / 前置：在模板内容前后插入                          |
| 模板（可选） | 只对某个 V3 模板生效；不选则对所有订阅生效                                             |
| 规则内容     | YAML 格式，必须符合 mihomo 语法                                                        |

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

### 示例一：AI 与 GitHub 走代理、内网与国内直连

类型选「规则」，模式选「前置」，内容：

```yaml
rules:
  - DOMAIN-SUFFIX,openai.com,PROXY
  - DOMAIN-SUFFIX,anthropic.com,PROXY
  - DOMAIN-KEYWORD,github,PROXY
  - IP-CIDR,192.168.0.0/16,DIRECT
  - GEOIP,CN,DIRECT
```

### 示例二：替换 DNS 配置

类型选「DNS」，模式选「替换」，内容：

```yaml
dns:
  enable: true
  enhanced-mode: fake-ip
  nameserver:
    - https://dns.alidns.com/dns-query
    - https://doh.pub/dns-query
```

保存后重新拉取订阅即可看到效果；覆写脚本（类型「脚本」）需要在「系统设置 → 功能」里开启「覆写脚本」开关。
