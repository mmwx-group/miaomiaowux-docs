---
title: "Custom Rules"
description: "Customize subscription routing rules"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

![Custom Rules page screenshot](/images/screenshots/doc-custom-rules-page.webp)

Custom Rules management page — create / edit / toggle rule sets

## Overview

Custom rules allow you to add additional routing rules to subscription output, controlling proxy behavior for specific domains or IPs. Rules are inserted before template rules and have higher priority.

## Rule Types

| Type           | Format               | Example                        |
| -------------- | -------------------- | ------------------------------ |
| DOMAIN         | Exact domain match   | DOMAIN,example.com,PROXY       |
| DOMAIN-SUFFIX  | Domain suffix match  | DOMAIN-SUFFIX,google.com,PROXY |
| DOMAIN-KEYWORD | Domain keyword match | DOMAIN-KEYWORD,github,PROXY    |
| IP-CIDR        | IP CIDR match        | IP-CIDR,10.0.0.0/8,DIRECT      |
| GEOIP          | GeoIP match          | GEOIP,CN,DIRECT                |

## Policies

| Policy | Description          |
| ------ | -------------------- |
| PROXY  | Access through proxy |
| DIRECT | Direct connection    |
| REJECT | Reject connection    |

## Configuration Example

```
# 自定义规则示例
DOMAIN-SUFFIX,openai.com,PROXY
DOMAIN-SUFFIX,anthropic.com,PROXY
DOMAIN-KEYWORD,github,PROXY
IP-CIDR,192.168.0.0/16,DIRECT
GEOIP,CN,DIRECT
```
