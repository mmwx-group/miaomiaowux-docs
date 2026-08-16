---
title: "Xray 入站管理"
description: "使用入站向导创建和管理 Xray 入站配置"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

本页只管 Xray 入站,不是节点管理页

添加/启用/禁用/删除/重命名节点等节点操作请前往 [节点管理](/docs/nodes)。

## 入站向导

入站向导提供可视化的配置流程，按步骤选择协议、传输、安全层和参数，自动生成完整的 Xray 入站配置。

1. 选择协议：VLESS / VMess / Trojan / Shadowsocks / Hysteria2
2. 选择传输：TCP / WebSocket / gRPC / XHTTP
3. 选择安全层：TLS / REALITY / None / XTLS-Vision
4. 配置端口（自动检测冲突）
5. 配置协议参数（UUID/密码自动生成）
6. 预览并创建

## 支持的组合

不同协议支持不同的传输和安全层组合。详细的组合矩阵请参考 [协议矩阵](/docs/protocol-matrix)。

| 协议        | 传输                 | 安全层                    |
| ----------- | -------------------- | ------------------------- |
| VLESS       | TCP, WS, gRPC, XHTTP | TLS, REALITY, XTLS-Vision |
| VMess       | TCP, WS              | TLS, None                 |
| Trojan      | TCP, gRPC            | TLS, REALITY              |
| Shadowsocks | TCP                  | None                      |
| Hysteria2   | UDP                  | TLS                       |

## 入站操作

- \- 创建入站后自动同步为节点（可在节点管理中查看）
- \- 删除入站时自动删除对应节点
- \- 支持查看入站的完整 JSON 配置
- \- 过滤：自动隐藏 API 入站和空 tag 的运行时入站

## 自动同步

入站创建/删除时会通过事件总线自动同步到节点表。同步过程会自动将 Xray 入站配置转换为 mihomo/Clash 兼容的代理配置格式。
