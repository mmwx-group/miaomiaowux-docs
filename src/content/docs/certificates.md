---
title: "证书管理"
description: "TLS 证书申请与自动续期"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

## 在线演示:证书管理

4 个 mock 域名,可以申请新证书、续期、下载、删除。完全本地。

Mock 演示4 张证书 · 一键申请 / 续期 / 删除 · 多 DNS provider

2正常1即将到期1已过期

**申请新证书**

| 域名 | DNS 提供商 | 关联服务器 | 到期时间 | 状态 | 操作 |
| ---- | ---------- | ---------- | -------- | ---- | ---- |

|
hk.example.com

| Cloudflare |

hk1.example.com

|

2026-09-12(97 天后到期)

| 正常 |

|
|

us.example.com

| Cloudflare |

us1.example.com

|

2026-07-03(26 天后到期)

| 即将到期 |

|
|

jp.example.com

| Aliyun |

jp1.example.comjp2.example.com

|

2026-11-28(174 天后到期)

| 正常 |

|
|

old.example.com

| Tencent | 未关联服务器 |

2026-05-15(23 天前到期)

| 已过期 |

|

## 概述

证书管理模块通过 ACME 协议自动申请和续期 TLS 证书。支持多种 DNS 提供商，证书自动同步到远程服务器。

## 支持的 DNS 提供商

| 提供商        | 所需凭证              |
| ------------- | --------------------- |
| Cloudflare    | API Token             |
| 阿里云 DNS    | AccessKey ID + Secret |
| 腾讯云 DNSPod | SecretId + SecretKey  |
| Namesilo      | API Key               |

## 申请证书

1\. 进入「证书管理」页面

2\. 点击「申请证书」

3\. 选择 DNS 提供商并填写凭证

4\. 输入域名（支持通配符，如 \*.example.com）

5\. 申请泛域名时可同时勾选根域名，系统会把 example.com 与 \*.example.com 作为同一张证书的 SAN

6\. 提交后系统完成 DNS 验证；签发结果同时保存到数据库与证书目录

## 下载与自动部署

证书列表的「下载」会生成包含 fullchain.pem 与 privkey.pem 的压缩包。续期、重新签发或 Webhook 更新后，系统会重新下发到所有引用该证书的 Nginx 与 Xray 目录并替换旧文件；从 Agent 恢复历史 Xray 配置时也会先补发配置引用的证书。

## 自动续期

证书到期前系统自动续期。续期成功后，证书文件自动更新到所有使用该证书的远程服务器。

## 证书存储

```
证书文件路径（远程服务器）：
  证书: /root/cert/{domain}/fullchain.pem
  私钥: /root/cert/{domain}/privkey.pem
```

## 使用场景

- \- VLESS/VMess/Trojan + TLS 入站需要 TLS 证书
- \- Hysteria2 / AnyTLS 入站需要 TLS 证书
- \- REALITY 入站不需要证书（使用目标站点证书）

## Webhook 上传证书（Certimate 集成）

妙妙屋X 提供 HTTP 接口接收外部证书签发系统（如 Certimate）通过 webhook 推送的证书内容，落库后自动部署到所有标记了该域名的远程服务器。

### 接口

Method: POST

URL: https://your-mmwx-host/api/admin/certificates/upload

鉴权: Authorization: Bearer <token> 或 MM-Authorization: <token>（系统设置里的全局 API Token，或 admin 用户在「API Token」管理页签发的个人 Token）

Content-Type: application/json

### 请求字段

- \- domain — 证书绑定的主域名（如 \*.example.com 或 a.example.com）
- \- cert_pem — 证书 PEM 文本，兼容两种格式：裸 PEM（以 -----BEGIN 开头）或 base64 编码（旧 UI 上传格式）
- \- key_pem — 私钥 PEM 文本，同样兼容裸 PEM 或 base64

### 行为

- \- 同域名已存在 → 更新现有证书记录（cert_path / key_path / 有效期），并触发自动部署
- \- 首次上传 → 新建一条 manual / no-deploy 类型的证书记录，后续可在 UI 切换 deploy target
- \- 成功返回 {success: true, certificate_id: N}；失败返回 {success: false, message: "..."}

### Certimate 配置示例

Certimate webhook 部署器支持 ${CERTIMATE_DEPLOYER\_\*} 模板变量替换为实际证书内容（裸 PEM，无 base64）。妙妙屋X 接口自动嗅探 -----BEGIN 开头识别 PEM，与原 base64 上传两路兼容。

```
URL:    https://your-mmwx-host/api/admin/certificates/upload
Method: POST
Headers:
  Authorization: Bearer <your-api-token>
  Content-Type:  application/json
Body:
  {
    "domain":   "${CERTIMATE_DEPLOYER_COMMONNAME}",
    "cert_pem": "${CERTIMATE_DEPLOYER_CERTIFICATE}",
    "key_pem":  "${CERTIMATE_DEPLOYER_PRIVATEKEY}"
  }
```

### curl 验证（PEM 直传）

用文件内容直接 POST，无需 base64 转码。文件路径替换成实际证书位置。

```
curl -X POST https://your-mmwx-host/api/admin/certificates/upload \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$(jq -n --rawfile cert /path/to/fullchain.pem \
                --rawfile key  /path/to/privkey.pem \
                '{domain:"*.example.com", cert_pem:$cert, key_pem:$key}')"
```
