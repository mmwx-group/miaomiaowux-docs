---
title: "服务器管理"
description: "远程服务器添加、Token、状态、连接相关问答。"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

### 远程服务器连接不上怎么办？

检查以下几点：1) Agent 是否正在运行；2) 防火墙是否放行了 Agent 端口；3) Token 是否正确；4) 网络是否可达。可在服务器管理页面查看连接状态和错误信息。

### WebSocket、HTTP、Pull 连接模式怎么选？

WebSocket 适合大多数场景，实时性好。HTTP 适合网络不稳定的环境。Pull 模式由 Agent 主动拉取，适合 Agent 在 NAT 后面的场景。Auto 模式会自动选择最佳方式。
