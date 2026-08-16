---
title: "协议与入站"
description: "协议选择、入站配置、证书等相关问答。"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

### 推荐使用什么协议？

推荐 VLESS + TCP + REALITY + XTLS-Vision，无需域名和证书，性能最佳。如果需要 CDN 中转，使用 VLESS/VMess + WebSocket + TLS。

### REALITY 和 TLS 有什么区别？

TLS 需要域名和证书，REALITY 不需要。REALITY 通过伪装成目标网站的 TLS 握手来避免检测，安全性更高。但 REALITY 不支持 CDN 中转。

### 为什么 Trojan 不支持 XTLS-Vision？

Xray-core 已移除 Trojan 的 flow（XTLS-Vision）支持。如需 Vision 流控，请使用 VLESS 协议。
