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

### 订阅里为什么没有 Miu 节点？

Miu 是自研协议，默认只下发给官方客户端 MeowX。用其它客户端拉订阅、或者用临时订阅时，Miu 节点会被自动滤掉——官方 mihomo 等不认识 Miu 的内核遇到它会整份配置加载失败。确认订阅的使用者用的是支持 Miu 的客户端后，可以在「节点管理 → 辅助功能」里打开「向所有客户端下发 Miu 节点」。详见 [Miu](/docs/protocol-miu#订阅下发规则)。

### 为什么有的服务器上选不了 AnyTLS / Snell / Mieru / Miu / WireGuard？

这几个协议由内联 Xray 内核提供，官方 xray 没有。服务器是外置 Xray 模式时，向导里它们不可选；把服务器切换到内联模式后即可使用，见 [内联 Xray](/docs/embedded-xray)。
