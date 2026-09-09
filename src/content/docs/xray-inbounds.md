---
title: "Xray 入站管理"
description: "使用入站向导创建和管理 Xray 入站配置"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

![Xray 入站管理页面截图](../../assets/screenshots/xray-inbounds-list.webp)

Xray 入站管理 — 选择服务器后列出该服务器的全部入站：标签 / 协议 / 端口 / 用户数，可查看 JSON、编辑或删除

:::note[本页只管 Xray 入站,不是节点管理页]
添加/启用/禁用/删除/重命名节点等节点操作请前往 [节点管理](/docs/nodes)。入站与节点是联动的：删除入站会同时删除其管理的节点，删除节点后对应入站也会自动删除。
:::

## 页面入口

有两个地方可以看到同一份入站列表：

- 左侧菜单「Xray 入站管理」：顶部「选择服务器」下拉切换服务器，右侧有卡片 / 列表视图切换与「添加入站」
- 服务管理 → 服务器卡片「Xray配置」→「入站管理」选项卡

![Xray 管理对话框入站选项卡截图](../../assets/screenshots/servers-xray-manage-inbounds.webp)

服务器卡片内的入站管理选项卡，与独立页面内容一致

## 入站向导

入站向导提供可视化的配置流程，按步骤选择协议、传输、安全层和参数，自动生成完整的 Xray 入站配置。它与「节点管理 → 添加节点」第二步是同一个向导。

![添加入站向导截图](../../assets/screenshots/xray-inbounds-add-dialog.webp)

添加入站 - 向导模式：基于 Xray 官方示例配置，右侧实时预览生成的 JSON

1. 选择协议：Shadowsocks / Shadowsocks2022 / SOCKS5 / Trojan / VLESS / VMess / Hysteria2 / AnyTLS / HTTP / Snell / Mieru
2. 选择传输：TCP / WebSocket / gRPC / XHTTP（随协议变化）
3. 选择安全层：REALITY / TLS / XTLS-Vision / XTLS-Vision-REALITY / ENC / 无
4. 配置模式：简易模式自动分配端口并生成凭据；专家模式可改端口、监听地址、嗅探、中转等
5. 填写节点名称；REALITY 类协议选择或探测目标域名，可开启「防止 Reality 被盗用」
6. 配置用户（UUID / 密码 / PSK 自动生成，可添加多个）
7. 预览 JSON 并「提交配置」

### 示例：给服务器加一个 Shadowsocks 2022 入站

1. 「选择服务器」选目标服务器，点「添加入站」
2. 协议点「SHADOWSOCKS2022」，其他保持默认（简易模式）
3. 节点名称填「香港 01 · SS2022」
4. 右侧 JSON 预览可以看到 method 为 `2022-blake3-aes-128-gcm`、随机端口与自动生成的 PSK
5. 「提交配置」→ 列表新增 `shadowsocks2022-<端口>` 入站，节点管理同时出现同名节点

## 支持的组合

不同协议支持不同的传输和安全层组合。详细的组合矩阵请参考 [协议矩阵](/docs/protocol-matrix)。

| 协议        | 传输                 | 安全层                    |
| ----------- | -------------------- | ------------------------- |
| VLESS       | TCP, WS, gRPC, XHTTP | TLS, REALITY, XTLS-Vision |
| VMess       | TCP, WS              | TLS, None                 |
| Trojan      | TCP, gRPC            | TLS, REALITY              |
| Shadowsocks | TCP                  | None                      |
| Hysteria2   | UDP                  | TLS                       |
| AnyTLS      | TCP                  | TLS, REALITY              |
| Snell       | TCP                  | None（obfs 可选）         |
| Mieru       | TCP / UDP            | None                      |

## 入站操作

- 创建入站后自动同步为节点（可在节点管理中查看）
- 删除入站时自动删除对应节点
- 「查看」显示入站的完整 JSON 配置；「编辑」打开与添加相同的向导
- 过滤：自动隐藏 API 入站和空 tag 的运行时入站

## 自动同步

入站创建/删除时会通过事件总线自动同步到节点表。同步过程会自动将 Xray 入站配置转换为 mihomo/Clash 兼容的代理配置格式。
