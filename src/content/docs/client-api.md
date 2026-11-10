---
title: "客户端接入 API"
description: "给第三方客户端开发者：怎样像 MeowX 一样接入妙妙屋X 主控——加密通道、登录、订阅列表与下载、解锁查询、三网回程、实时推送、喵窝等接口的请求与返回格式"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

本页写给想自己做客户端（或给现有客户端加「登录主控」功能）的开发者，内容就是官方 MeowX 客户端和主控之间实际用的那一套接口。普通用户怎么登录、主控要准备什么，见 [客户端登录主控](/docs/client-login)。

## 总览

客户端和主控之间有两条路：

| 用途 | 走哪里 | 凭据 |
| --- | --- | --- |
| 登录、订阅列表、账户信息、解锁、回程、喵窝等 | **加密通道** `POST /api/secure/rpc` | 会话令牌或个人 API 令牌 |
| 实时推送（入口切换、订阅变更） | **加密 WebSocket** `/api/secure/ws` | 同上 |
| 下载订阅内容 | **普通 HTTPS** 直接 GET 订阅地址 | 订阅令牌，或短链本身 |

一次完整的流程：

1. `GET /api/secure/cert` 取主控证书并验签，得到主控公钥。
2. 经加密通道调 `/login`（或扫码 `/login/qr`），拿到会话令牌。
3. 经加密通道调 `/subscriptions` 列出订阅，`/user/token` 取订阅令牌，拼出订阅地址后直接下载。
4. 连上 `/api/secure/ws`，收到 `subscription_changed` 时重新下载订阅。
5. 按需调 `/user/features`、`/user/unlocks`、`/user/return-routes` 等。

主控这边的前提条件和普通用户登录一样：**填了主服务器地址、激活了许可证、外网能访问 `/api/secure/*`**，否则主控拿不到证书，加密通道用不了（下载订阅不受影响）。详见 [主控要先准备什么](/docs/client-login#主控要先准备什么)。

:::note
明文的面板接口（`/api/user/*` 等）默认受网页加密通道保护，带着令牌直接明文请求也会被拒。客户端只能用本页的 `/api/secure/*`，加上订阅下载这几个明文地址。
:::

## 加密通道

### 取主控证书

```http
GET /api/secure/cert
```

明文、无需鉴权。成功返回：

```json
{
  "masterPub": "base64，32 字节 X25519 公钥",
  "domain": "panel.example.com",
  "expireUnix": 1796688000,
  "sig": "base64，64 字节 Ed25519 签名"
}
```

客户端必须做三项校验，任何一项不过都要拒绝连接：

1. **签名**：用许可证服务的 Ed25519 公钥验 `sig`。被签名的是下面四行用 `\n` 拼起来的字节（末尾没有换行），`masterPub` 用原样的 base64 字符串：

   ```text
   mmx-cert-v1
   <masterPub>
   <domain>
   <expireUnix 的十进制>
   ```

   许可证服务验签公钥（base64，32 字节）：`/cKXW8AIOPE6ChoZtXjP8N+KkIYvKLvnpLyaLPrpTQM=`
2. **域名**：`domain` 必须等于你正在连接的主机名（小写，不含端口）。证书绑定的是主控「主服务器地址」的域名，用 IP 或别的域名连接会对不上。
3. **有效期**：当前时间早于 `expireUnix`。

证书有效期 30 天，主控在剩余不足 5 天时自动续期。客户端可以按 `expireUnix` 缓存主控公钥，但要定期重新拉取。

主控拿不到证书时返回 `503`：

```json
{ "error": "原因说明", "code": "backoff", "retry_after": 30, "cause": "issuer_error" }
```

| code | 含义 |
| --- | --- |
| `no_domain` | 主控没填主服务器地址（也没填订阅地址） |
| `no_license` | 主控没激活许可证 |
| `domain_claimed` | 这个域名已绑定在另一份许可证名下 |
| `backoff` | 刚签发失败过，正在退避重试；带 `retry_after`（秒，同时有 `Retry-After` 响应头）和上次失败的 `cause` |
| `issuer_error` | 许可证服务签发失败、验签不过等 |

### 加密请求

```http
POST /api/secure/rpc
Content-Type: application/octet-stream
```

**每个请求**都临时生成一对 X25519 密钥，算法参数如下，必须逐字节一致，否则只会得到「解不开」：

| 项 | 取值 |
| --- | --- |
| 共享密钥 | X25519(临时私钥, masterPub)，32 字节原样使用，**不再做哈希** |
| 密钥派生 | HKDF-SHA256，输出 32 字节 |
| salt | `临时公钥(32) ‖ masterPub(32)`，顺序不能反 |
| info | 请求方向 `mmx-secure-rpc-c2s-v1`，响应方向 `mmx-secure-rpc-s2c-v1`（各派生一把） |
| 加密 | ChaCha20-Poly1305（IETF），随机 12 字节 nonce，无附加数据 |

字节布局：

| | 布局 |
| --- | --- |
| 请求体 | `临时公钥(32) ‖ nonce(12) ‖ 密文 ‖ tag(16)`，最大 1 MiB |
| 响应体 | `nonce(12) ‖ 密文 ‖ tag(16)`，用响应方向的密钥解 |

解密后的请求是一个 JSON 对象，**业务字段直接平铺在顶层**：

```json
{
  "path": "/user/api-tokens",
  "method": "POST",
  "token": "会话令牌",
  "ts": 1794000000,
  "nonce": "每次都不同的随机串",
  "name": "MyClient iPhone"
}
```

| 字段 | 说明 |
| --- | --- |
| `path` | 主控接口去掉 `/api` 前缀，例如 `/user/unlocks` 对应 `/api/user/unlocks`。GET / DELETE 的查询参数直接写在里面：`/user/package-subscribe?merged=1`。不能含 `..`、`//`、空白和反斜杠 |
| `method` | `GET`（缺省）/ `POST` / `PUT` / `PATCH` / `DELETE` |
| `token` | 会话令牌或个人 API 令牌（`mmwx_` 开头）。登录类接口留空 |
| `ts` | 当前 Unix 秒。与主控时间相差超过 120 秒会被拒 |
| `nonce` | 随机串（UUID 即可），5 分钟内不能重复 |
| 其它 | 非 GET / DELETE 时，整个对象会原样作为接口的请求体，所以业务字段和上面几个字段写在同一层 |

能调用的路径只有：`/user/*`、`/clash/*`、`/public/*`、`/login`、`/login/qr`、`/login/2fa`、`/login/recovery`、`/subscriptions`。**管理接口（`/admin/*`）一律不放行**，用管理员账号登录也一样。

响应的 HTTP 状态码就是接口本身的状态码，响应体是接口返回内容加密后的结果。**接口的响应头不会带回来**，所以订阅下载要另走明文（见 [下载订阅](#下载订阅)）。

加密通道本身的错误：

| 状态码 | 内容 | 原因 |
| --- | --- | --- |
| 400 | 明文 `{"error":"bad envelope"}` | 信封解不开：主控公钥不对、参数不一致或数据损坏 |
| 400 | 加密 `{"error":"bad request"}` | 解密后不是合法 JSON |
| 403 | 加密 `{"error":"missing nonce"}` / `"stale request"` / `"replayed request"` | 没带 nonce、时间差超过 120 秒、nonce 重复 |
| 403 | 加密 `{"error":"path not allowed"}` | 路径不在上面的清单里 |
| 401 | 加密 `{"error":"unauthorized"}` | 令牌无效或已过期，应回到未登录状态 |

经加密通道登录时，主控会跳过网页用的人机验证（Turnstile），但登录限流照常生效：主控按真实来源 IP 计数。

### 三种令牌

| 令牌 | 长什么样 | 用在哪 | 怎么来 |
| --- | --- | --- | --- |
| 会话令牌 | 不透明字符串 | 加密通道、实时推送 | 登录接口返回，30 天有效 |
| 个人 API 令牌 | `mmwx_` 开头 | 加密通道、实时推送 | `/user/api-tokens` 创建，手动吊销前一直有效 |
| 订阅令牌 | UUID | **只用于**下载订阅的 `?token=` | `/user/token` |

三者不能混用：加密通道和实时推送不认订阅令牌，`/api/clash/subscribe` 不认 API 令牌。MeowX 登录后会建一个名为「MeowX 设备名」的 API 令牌给实时推送用，退出登录时再吊销，这样会话过期也不影响推送；你也可以直接用会话令牌。

## 登录

### 账号密码

```json
{ "path": "/login", "method": "POST", "ts": 1794000000, "nonce": "…",
  "username": "alice", "password": "…", "remember_me": true }
```

成功：

```json
{
  "token": "会话令牌",
  "expires_at": "2026-12-08T10:00:00.123+08:00",
  "username": "alice",
  "email": "",
  "nickname": "Alice",
  "avatar_url": "/api/user/avatar/abc.png",
  "role": "user",
  "is_admin": false
}
```

- `remember_me: true` 时会话 30 天有效，否则 24 小时。客户端应始终传 `true`。会话不会自动续期，过期后重新登录。
- `avatar_url` 可能是站内相对路径（拼上主控地址即可，免鉴权），也可能是外链。

账号开了两步验证时返回：

```json
{ "requires_2fa": true, "two_factor_token": "临时令牌" }
```

拿 `two_factor_token`（5 分钟有效）再调下面两个之一，成功返回和上面一样：

| 路径 | 请求字段 | 说明 |
| --- | --- | --- |
| `/login/2fa` | `two_factor_token`、`code`（验证器 6 位码） | |
| `/login/recovery` | `two_factor_token`、`recovery_code` | **用恢复码登录成功后，主控会关闭该账号的两步验证**，界面上要提示用户 |

错误：

| 状态码 | `error` | 原因 |
| --- | --- | --- |
| 400 | `username and password are required` | 缺字段 |
| 401 | `invalid credentials` | 用户名或密码错 |
| 401 | `invalid or expired 2FA token` / `invalid 2FA code` / `invalid recovery code` | 两步验证失败 |
| 403 | `账号已被禁用` | |
| 429 | `too many login attempts, please try again later` | 触发登录限流，按 IP + 用户名计数 |

### 扫码 / 登录链接

网页面板（或 Telegram Mini App）给已登录的用户生成一次性登录码，内容是：

```text
miaomiaowu://login?host=https%3A%2F%2Fpanel.example.com&code=一次性码
```

`host` 是证书绑定的主控地址（不一定是用户打开面板用的那个地址），没带协议时按 `https://` 处理。客户端拿 `host` 取证书、建立加密通道后兑换：

```json
{ "path": "/login/qr", "method": "POST", "ts": 1794000000, "nonce": "…", "code": "一次性码" }
```

- 成功返回和账号登录一样，会话固定 30 天，**不需要两步验证**。
- 登录码 5 分钟有效、只能用一次，主控重启后全部作废。
- 失败一律是 401 `{"error":"二维码已失效，请重新生成"}`，不区分过期、用过还是不存在；限流时 429。

自己的网页或设备想生成登录码，可以用已登录的令牌调 `POST /user/qr-login/create`（无请求体），返回 `{"code":"…","expires_in":300}`。

## 订阅

### 订阅列表

```json
{ "path": "/subscriptions", "method": "GET", "token": "…", "ts": 1794000000, "nonce": "…" }
```

```json
{
  "subscriptions": [
    { "id": 0, "name": "全部套餐", "filename": "__merged__", "type": "merged",
      "file_short_code": "AbC123", "expire_at": "2027-01-01T00:00:00Z",
      "subscription_path": "/x/AbC123", "traffic_used": 0, "traffic_total": 0 },
    { "id": -7, "name": "月付套餐", "filename": "__package__:7", "type": "package",
      "file_short_code": "Pk7xyz", "expire_at": null,
      "subscription_path": "/x/Pk7xyz", "traffic_used": 123456789, "traffic_total": 107374182400 },
    { "id": 12, "name": "我的订阅", "filename": "my.yaml",
      "custom_short_code": "mine", "latest_version": 3,
      "subscription_path": "/x/mineU5r", "traffic_used": 0, "traffic_total": 0 }
  ],
  "user_short_code": "U5r"
}
```

- 普通用户看到：分配给自己的订阅、自己的套餐（每个套餐一张）、自己建的订阅；有一个以上生效套餐且开了合并订阅时，最前面多一张「全部套餐」。
- **管理员账号会看到主控上的全部订阅文件**，客户端最好让管理员自己挑。
- 流量单位是字节，没有额度时 `traffic_total` 为 0；`expire_at` 可能为 `null`；带短码、版本号、`subscription_path` 的字段在没有值时不出现。

### 拼订阅地址

1. 调 `/user/token`（GET）取订阅令牌：

   ```json
   { "token": "1b4e28ba-2fa1-11d2-883f-0016d3cca427", "user_short_code": "U5r" }
   ```

2. 按 `subscription_path` 拼：
   - 以 `/x/` 开头：直接用 `https://主控/x/…`，**短码本身就是凭证**，不用加令牌。
   - 其它（如 `/api/user/package-subscribe?assignment_id=7`、`/api/clash/subscribe?filename=my.yaml`）：在查询参数里补上 `token=订阅令牌`。
   - 没有 `subscription_path`：用 `/api/clash/subscribe?filename=<filename>&token=<订阅令牌>`。

:::caution
`POST /user/token` 会**重置订阅令牌，同时重置该用户在所有节点上的连接凭据**，旧订阅全部失效。除非用户明确要求，不要调用。
:::

### 下载订阅

订阅内容用普通 HTTPS GET 直接下载（不走加密通道），这样才能拿到用量响应头。

| 地址 | 说明 |
| --- | --- |
| `/x/{短码}` | 短链，按类型转到下面两种之一；开了短链功能才有 |
| `/api/clash/subscribe?filename=…&token=…` | 订阅文件 |
| `/api/user/package-subscribe?assignment_id=N&token=…` | 某个套餐；`merged=1` 为合并订阅 |

响应头：

| 响应头 | 内容 |
| --- | --- |
| `subscription-userinfo` | `upload=0; download=<已用字节>; total=<总量字节>; expire=<Unix 秒>`。没有额度时不发；没有到期日时 `expire=4102444799` |
| `profile-update-interval` | `24`（小时） |
| `profile-title` | `base64:<订阅名>`（请求的 User-Agent 不像浏览器时才发） |

**User-Agent 决定拿到什么格式和哪些节点**：

- 主控按 User-Agent 判断客户端类型。用 mihomo 内核的客户端，User-Agent 以 `mihomo/版本` 开头即可拿到 Clash YAML；也可以在地址后加 `t=<类型>` 显式指定（只在带了 `filename` 或使用短链时有效）。
- 官方客户端的 User-Agent 是 `mihomo/1.19.0 MeowX/版本 (平台)`。主控认出 `MeowX/` 标记后才会下发只有 MeowX 内核支持的节点（AnyTLS + REALITY、Miu、Snell v6 等）。**第三方客户端不要冒用这个标记**，否则会收到自己内核解析不了的节点。
- 令牌无效时主控不返回 401，而是返回一份只含「令牌失效」提示的配置。

订阅下载按 IP 限频，过于频繁会收到 429；连续请求不存在的短码会被当成探测封禁 IP。不要轮询，收到 [实时推送](#实时推送) 的 `subscription_changed` 再重新下载。

## 账户信息

| 路径 | 方法 | 返回 |
| --- | --- | --- |
| `/user/profile` | GET | `username`、`email`、`nickname`、`avatar_url`、`role`、`is_admin`，绑定了 Telegram 时还有 `telegram_id`、`telegram_username` |
| `/user/features` | GET | `{"success":true,"return_routes":true,"unlock_check":true}`：主控有没有开回程检测、解锁检测，客户端据此决定显不显示对应入口 |

## 解锁查询

```json
{ "path": "/user/unlocks", "method": "GET", "token": "…", "ts": 1794000000, "nonce": "…" }
```

```json
{
  "success": true,
  "nodes": [
    {
      "name": "🇭🇰 HK-01",
      "type": "vless",
      "server": "hk.example.com",
      "port": 443,
      "unlocks": [
        { "service": "netflix", "status": "yes", "region": "HK" },
        { "service": "openai", "status": "yes", "region": "HK" },
        { "service": "disneyplus", "status": "no" }
      ]
    }
  ]
}
```

- 只返回当前用户能用的节点。和订阅里的节点对应时，先按 `name` 匹配，名字对不上（例如客户端改了名）再用 `type` + `server` + `port` 匹配。
- `status`：`yes` 解锁、`no` 不解锁、`originals_only` 仅自制剧、`banned` 被封；检测失败的不返回。`region` 是解锁地区，可能没有。
- `service`：`netflix`、`disneyplus`、`youtube_premium`、`prime_video`、`tvb_anywhere`、`iqiyi`、`bing`、`apple`、`openai`、`gemini`、`claude`、`wikipedia`、`google_play`、`google_search`、`steam`、`reddit`、`dazn`、`onetrust`、`youtube_cdn`、`netflix_cdn`、`sdggge`、`bybit`、`binance`、`okx`。实际出现哪些由管理员在主控里选；遇到不认识的值请原样显示或忽略。
- 结果按每个服务**实际的出口**取：节点的某个服务分流到别的服务器，就显示那台服务器的检测结果；分流到 WARP、外部代理或被屏蔽的服务不显示。
- 主控每天 04:40（主控时区）全量检测一次，新上线的服务器会在 10 分钟内补测。返回里没有检测时间，用户侧也没有触发重测的接口。
- 主控关了解锁检测时返回 `{"success":true,"nodes":[]}`。

## 三网回程

```json
{ "path": "/user/return-routes", "method": "GET", "token": "…", "ts": 1794000000, "nonce": "…" }
```

```json
{
  "success": true,
  "nodes": [
    {
      "name": "🇯🇵 JP-01",
      "type": "vless",
      "server": "jp.example.com",
      "port": 443,
      "medal": "gold",
      "routes": [
        { "carrier": "telecom", "region": "广东", "route_type": "CN2 GIA", "gold": true },
        { "carrier": "unicom", "region": "上海", "route_type": "9929", "gold": true },
        { "carrier": "mobile", "region": "北京", "route_type": "CMI", "gold": false }
      ]
    }
  ]
}
```

- 节点匹配方式同解锁查询。
- `carrier`：`telecom` 电信、`unicom` 联通、`mobile` 移动，固定按这个顺序。`region` 是测试目标省份的中文名，可能没有。
- `route_type` 是识别出的线路名，认不出的统一为 `Unknown`。`gold` 表示优质线路（CN2 GIA、CTG GIA、9929、CMIN2、163 PP）。
- `medal`：任一家是优质线路为 `gold`，否则有识别出的线路为 `silver`；三家都认不出的节点不返回。
- 转发 / 中转节点显示的是**入口服务器**的回程。
- 测试省份由管理员在主控里指定，没指定的那家每次随机挑。主控每天 04:20 检测一次，新服务器 10 分钟内补测；返回里没有检测时间。
- 这个接口不看主控开关，有数据就返回，请先用 `/user/features` 的 `return_routes` 判断要不要显示。

## 其它接口

### 个人 API 令牌

| 路径 | 方法 | 请求 | 返回 |
| --- | --- | --- | --- |
| `/user/api-tokens` | GET | — | `{"success":true,"tokens":[{"id":5,"name":"…","created_at":"…","last_used_at":"…"}]}` |
| `/user/api-tokens` | POST | `name`（可省，最长 64 字节） | 201 `{"success":true,"token":"mmwx_…","name":"…"}`，明文只返回这一次，不带 `id` |
| `/user/api-tokens/{id}` | DELETE | — | `{"success":true}` |

要吊销自己建的令牌，先 GET 列表按名字找到 `id`。

### IP 白名单

服务器开了 IP 白名单时，客户端要定期上报自己的出口 IP，否则连不上节点。

| 路径 | 方法 | 说明 |
| --- | --- | --- |
| `/user/firewall-token` | GET | 返回 `{"success":true,"token":"…","report_url":"https://panel.example.com/api/fw/<token>/add","po0_links":[…],"enabled":true}`。`enabled` 为 `false` 时没有服务器开白名单，不用上报 |
| `/user/firewall-token` | POST | 换一个新令牌，旧的立即失效 |
| `/user/po0-servers` | GET | 用户节点经过的 po0 设备：`{"success":true,"servers":[{"server_id":3,"name":"HK","ip":"203.0.113.10","url":"https://203.0.113.10/api/firewall/<token>/add?slot=2"}]}` |

上报直接请求 `report_url`（主控）和每个 po0 的 `url`（po0 设备本身），明文 GET 或 POST 均可，不带参数时按请求来源 IP 记录，也可以带 `ip`、`note`。主控上报地址返回 404 表示令牌已换，重新 GET `/user/firewall-token`。MeowX 大约每小时上报一次主控、每 10 分钟上报一次 po0。

:::note
`report_url` 用主控的主服务器地址拼出。主控只填了订阅地址时这个地址可能不对，此时请提示管理员填写主服务器地址。
:::

### 测速榜上传凭证

`POST /user/speedtest/grant`，请求 `{"payload_hash":"<测速结果的 sha256，64 位小写十六进制>"}`，成功返回 `{"success":true,"grant":"…","expires_at":"…"}`。每个用户每小时最多 60 次；拿不到凭证（`success:false`）时匿名上传即可。

## 喵窝

主控内置组网（[喵窝](/docs/meownest)）的接口，都在 `/user/mesh/` 下。

| 路径 | 方法 | 说明 |
| --- | --- | --- |
| `/user/mesh/status` | GET | 能不能用：`{"available":true,"control_url":"…","magic_dns":"…","device_cidr":"100.64.0.0/10","device_limit":10,"account_id":"…","joined_admin":"root"}`。`joined_admin` 见下文 |
| `/user/mesh/enroll` | POST | 请求 `hostname`、`os`、`client`、`version`、`previous_node_id`；返回一次性入网 key：`{"control_url","auth_key","expires_at","magic_dns","device_cidr","sites":[…]}`。key 10 分钟有效，每账号每分钟最多 5 次 |
| `/user/mesh/devices` | GET | 本账号的设备：`{"devices":[{"id","name","dns_name","ipv4","online","last_seen","routes","pending_routes"}],"sites":[…],"shared_devices":[…]}`。`shared_devices` 见下文 |
| `/user/mesh/devices/{id}` | PATCH / DELETE | 改名（`name`）/ 删除设备 |
| `/user/mesh/sites` | POST | 路由器申报自己负责的网段：`networks`、`force_map`、`router` |

不能用时 `status` 仍返回 200，`available` 为 `false`，`reason` 说明原因：

| reason | 含义 | 建议 |
| --- | --- | --- |
| `not_admin` | 喵窝没对这个账号开放（管理员可在系统设置里给指定账号开放） | 隐藏喵窝入口，或显示 `message` |
| `disabled` | 主控没开喵窝 | 显示原因，开关不可用 |
| `starting` | 主控的喵窝正在启动 | 稍后重试 |

其它喵窝接口在不能用时返回 403。

### 加入管理员的喵窝

管理员可以在「系统设置 › 喵窝」把名单里的账号设成「加入某位管理员的喵窝」：这个账号与那位管理员、以及加入他的其他账号在同一个网络里，彼此的设备和站点网段双向互通；设备仍记在各自名下，只能管理自己的。这时：

- `/user/mesh/status` 带 `joined_admin`：加入了哪位管理员（用户名）。没有这个字段或为空 = 独立喵窝。
- `/user/mesh/devices` 多一个 `shared_devices`：同一网络里别人的设备，字段与 `devices` 相同，另带 `username`（设备主人）。它们是只读的，对它们改名或删除会返回 404。独立喵窝时没有这个字段。

客户端可以在喵窝页显示「已加入 xx 的喵窝」，并把 `shared_devices` 单独列成「同网络的设备」，不提供删除和改名。较早版本的主控不返回这两个字段，按独立喵窝处理即可。

## 实时推送

```text
wss://panel.example.com/api/secure/ws
```

1. 连上后**第一帧**发二进制的 32 字节临时 X25519 公钥。双方按加密请求的同一套方法派生两把密钥，info 换成 `mmx-secure-ws-c2s-v1`（客户端发）和 `mmx-secure-ws-s2c-v1`（主控发）。
2. **第二帧**发加密的鉴权帧，明文是 `{"token":"会话令牌或 API 令牌","ts":1794000000,"nonce":"…"}`，时间和 nonce 规则同加密请求。令牌不要放在 URL 里。鉴权失败主控直接断开，不回错误。
3. 之后每一帧（双向，二进制）的布局是 `计数器(8 字节大端) ‖ 密文 ‖ tag(16)`，nonce 是 `4 个 0x00 ‖ 计数器`。两个方向各自从 0 开始计数，**客户端发的计数器必须严格递增**，否则主控断开。

主控推给客户端的消息：

| type | 示例 | 处理 |
| --- | --- | --- |
| `entry_failover` | `{"type":"entry_failover","domain":"entry.example.com","healthyIPs":["203.0.113.5"],"chainId":12}` | 转发链入口故障切换：把 `domain` 解析成 `healthyIPs` 里的地址；`healthyIPs` 为空数组表示取消覆盖。鉴权成功后会立刻推一次当前状态 |
| `subscription_changed` | `{"type":"subscription_changed","rev":"3f2a9c01b7de"}` | 订阅内容变了，重新下载；可以用 `rev` 去重 |

保活：主控每 30 秒发一次 WebSocket ping；70 秒内收不到客户端任何帧（或 pong）就断开。客户端可以每 55～60 秒发一个加密的 `{"type":"ping"}`（主控不回复）。每个用户最多 16 条连接（网页和客户端合计）。会话被吊销或账号被停用时，主控会主动断开。

## 实现建议

- 加密参数写错的唯一表现是解不开，先用主控的证书和自己的实现对一遍：自己加密一个 `/user/features` 请求，能解出主控的响应就说明全对了。
- 主控地址变了（管理员换域名）证书域名会跟着变，验证不过时提示用户重新登录，不要放宽域名校验。
- 收到加密的 401 `unauthorized`，或实时推送鉴权后被断开，说明会话失效：清掉令牌回到未登录状态，保留订阅照常使用。
- 不要轮询订阅、解锁和回程：订阅等推送，解锁和回程每天只更新一次，打开页面时取一次即可。
