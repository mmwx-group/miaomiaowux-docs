---
title: "Snell"
description: "Snell 协议配置详解"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

## 概述

Snell 是 Surge 推出的轻量加密代理协议(salt + AES-GCM 记录层)。妙妙屋X 在嵌入式 xray 内核(fork)中实现了 Snell v4 / v5 / v6 的服务端,支持 TCP + UDP、obfs 混淆与多用户;per-user 流量统计 / 限速 / 设备数限制全部走 xray dispatcher 现有通路,与 VLESS / Trojan 共享相同的多用户能力,并已与权威 sing-box / mihomo 双向互通验证。

## 版本对比

| 版本 | 多用户模型                     | 混淆 / 整形                           | 说明                                          |
| ---- | ------------------------------ | ------------------------------------- | --------------------------------------------- |
| v4   | 每用户独立 PSK(逐 PSK 试解)    | obfs: none / http / tls               | 兼容最广,主流客户端都支持                     |
| v5   | 每用户独立 PSK                 | obfs: none / http / tls               | 线格式与 v4 一致,细节增强                     |
| v6   | 共享 PSK + clientID(隐藏 salt) | mode: default / unshaped / unsafe-raw | 抗封锁更强(隐藏 salt + 流量整形),需较新客户端 |

## 添加节点(向导)

在「节点管理 → 添加节点」选择 Snell 协议,版本按钮为「v4/v5」或「v6」。保存后默认存 Clash 配置进节点表。

### 简易模式

只需填服务器地址与端口,PSK 自动生成(v6 的 clientID 也自动生成),直接提交即可。

### 专家模式

可额外配置混淆 / 整形与多用户:v4 / v5 设 obfs(none / http / tls)与 obfs-host;v6 设 mode(default / unshaped / unsafe-raw)。每个用户一条凭据(v4 / v5 各自 PSK;v6 共享 PSK + 各自 clientID)。

## 客户端兼容性

- \- Surge:原生支持 Snell(v1–v6),Snell 的原始客户端
- \- mihomo / Clash.Meta:支持 Snell v1–v5(v6 需较新内核);妙妙屋X 的 Clash 订阅输出 v4 / v5
- \- sing-box:较新版本支持 Snell;妙妙屋X 的 sing-box 订阅输出 v4–v6(v5 归一为 v4)
- \- 妙妙屋X 订阅转换目前仅覆盖 Clash 与 sing-box 两类客户端(其余客户端对 Snell 支持有限)

## 注意事项

- \- 鉴权字段为 settings.users\[\].psk(不是 clients\[\] / password);添加入站「简易模式」会自动生成 PSK,无需手填
- \- v4 与 v5 线格式一致(salt 明文 + AES-128-GCM 记录),多用户按「每用户独立 PSK」逐一试解;v6 改为「共享 PSK + clientID」并隐藏 salt(靠 PSK 派生的置换 / 掩码),因此每用户需一个 clientID(简易模式自动生成)
- \- v6 支持三种流量整形模式:default(默认整形)、unshaped(不整形)、unsafe-raw(裸核,仅调试);v4 / v5 支持 obfs 混淆(none / http / tls),v6 不再使用 obfs
- \- Snell 走标准 TCP 传输,无 TLS / streamSettings;per-user 流量统计 / 限速与 VLESS / Trojan 共享同一套 xray dispatcher 通路

## 配置示例

### Snell v4 / v5

```
{
  "tag": "snell-in",
  "listen": "0.0.0.0",
  "port": 8443,
  "protocol": "snell",
  "settings": {
    "users": [
      {
        "psk": "your-psk",
        "version": 4,
        "obfsMode": "none",
        "email": "user@example.com"
      }
    ]
  }
}
```

### Snell v6

```
{
  "tag": "snell-in",
  "listen": "0.0.0.0",
  "port": 8443,
  "protocol": "snell",
  "settings": {
    "users": [
      {
        "psk": "shared-psk",
        "version": 6,
        "v6Mode": "default",
        "clientId": "a1b2c3d4e5f6",
        "email": "user@example.com"
      }
    ]
  }
}
```

v6 为共享 PSK + 每用户 clientID;v4 / v5 则每个用户一条独立 PSK。obfsMode 为 none 时可省略;需要混淆时填 http 或 tls 并加 obfsHost。
