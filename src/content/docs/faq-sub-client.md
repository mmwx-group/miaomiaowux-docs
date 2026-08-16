---
title: "订阅与客户端"
description: "订阅链接、客户端兼容、格式转换相关问答。"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

### 订阅链接打不开或节点为空？

检查：1) Token 是否正确；2) 用户是否绑定了套餐；3) 是否有可用节点；4) 节点是否被禁用。

### mihomo 中 Trojan 节点连不上？

mihomo 中 Trojan 使用 sni 字段而非 servername，系统已自动处理此差异。如仍有问题，检查证书域名是否匹配。
