---
title: "Client Integration API"
description: "For third-party client developers: how to integrate with a MiaomiaowuX master the way MeowX does — the encrypted channel, sign-in, subscription list and download, unlock checks, return routes, realtime push and MeowNest"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

This page is for developers building their own client (or adding "sign in to the master" to an existing one). It describes the exact interface the official MeowX client uses to talk to the master. For how end users sign in and what the master needs first, see [Signing in to the Master from the Client](/docs/client-login).

## Overview

There are two paths between a client and the master:

| Purpose | Path | Credential |
| --- | --- | --- |
| Sign-in, subscription list, account info, unlocks, return routes, MeowNest… | **Encrypted channel** `POST /api/secure/rpc` | Session token or personal API token |
| Realtime push (entry failover, subscription changes) | **Encrypted WebSocket** `/api/secure/ws` | Same as above |
| Downloading subscription content | **Plain HTTPS** GET of the subscription URL | Subscription token, or the short link itself |

A full session looks like this:

1. `GET /api/secure/cert`, verify the certificate, and take the master's public key from it.
2. Call `/login` (or `/login/qr` for QR sign-in) over the encrypted channel to get a session token.
3. Call `/subscriptions` to list subscriptions and `/user/token` to get the subscription token, build the subscription URL and download it directly.
4. Connect to `/api/secure/ws` and download the subscription again whenever `subscription_changed` arrives.
5. Call `/user/features`, `/user/unlocks`, `/user/return-routes` and so on as needed.

The master needs the same things as for normal client sign-in: **a main server address, an activated license, and `/api/secure/*` reachable from the internet**. Otherwise it cannot obtain a certificate and the encrypted channel is unavailable (subscription downloads still work). See [What the master needs first](/docs/client-login#what-the-master-needs-first).

:::note
The plain panel APIs (`/api/user/*` and so on) are protected by the web panel's own encryption by default; plain requests are rejected even with a valid token. Clients can only use the `/api/secure/*` endpoints on this page, plus the plain subscription download URLs.
:::

## Encrypted channel

### Fetching the master certificate

```http
GET /api/secure/cert
```

Plain, no authentication. On success:

```json
{
  "masterPub": "base64, 32-byte X25519 public key",
  "domain": "panel.example.com",
  "expireUnix": 1796688000,
  "sig": "base64, 64-byte Ed25519 signature"
}
```

The client must make three checks and refuse to connect if any of them fails:

1. **Signature**: verify `sig` with the license service's Ed25519 public key. The signed bytes are these four lines joined with `\n` (no trailing newline), with `masterPub` as the original base64 string:

   ```text
   mmx-cert-v1
   <masterPub>
   <domain>
   <expireUnix in decimal>
   ```

   License service verification key (base64, 32 bytes): `/cKXW8AIOPE6ChoZtXjP8N+KkIYvKLvnpLyaLPrpTQM=`
2. **Domain**: `domain` must equal the host name you are connecting to (lowercase, no port). The certificate is bound to the domain of the master's main server address, so connecting by IP or another domain will not match.
3. **Validity**: the current time is before `expireUnix`.

Certificates are valid for 30 days and the master renews them when fewer than 5 days remain. You may cache the master's public key until `expireUnix`, but fetch the certificate again periodically.

If the master cannot obtain a certificate it returns `503`:

```json
{ "error": "explanation", "code": "backoff", "retry_after": 30, "cause": "issuer_error" }
```

| code | Meaning |
| --- | --- |
| `no_domain` | The master has no main server address (and no subscription address) |
| `no_license` | The master has no activated license |
| `domain_claimed` | The domain is already bound to another license |
| `backoff` | Issuance just failed and is backing off; includes `retry_after` (seconds, also sent as a `Retry-After` header) and the previous failure's `cause` |
| `issuer_error` | The license service failed to issue, signature check failed, etc. |

### Encrypted requests

```http
POST /api/secure/rpc
Content-Type: application/octet-stream
```

Generate a fresh X25519 key pair for **every request**. The parameters below must match byte for byte; any mismatch only shows up as "cannot decrypt":

| Item | Value |
| --- | --- |
| Shared secret | X25519(ephemeral private key, masterPub), the raw 32 bytes, **not hashed again** |
| KDF | HKDF-SHA256, 32-byte output |
| salt | `ephemeral public key (32) ‖ masterPub (32)`, in that order |
| info | Request direction `mmx-secure-rpc-c2s-v1`, response direction `mmx-secure-rpc-s2c-v1` (one key each) |
| Cipher | ChaCha20-Poly1305 (IETF), random 12-byte nonce, no associated data |

Byte layout:

| | Layout |
| --- | --- |
| Request body | `ephemeral public key (32) ‖ nonce (12) ‖ ciphertext ‖ tag (16)`, at most 1 MiB |
| Response body | `nonce (12) ‖ ciphertext ‖ tag (16)`, decrypted with the response-direction key |

The decrypted request is a JSON object with **business fields at the top level**:

```json
{
  "path": "/user/api-tokens",
  "method": "POST",
  "token": "session token",
  "ts": 1794000000,
  "nonce": "a different random string every time",
  "name": "MyClient iPhone"
}
```

| Field | Meaning |
| --- | --- |
| `path` | The master API path without the `/api` prefix, e.g. `/user/unlocks` for `/api/user/unlocks`. Put GET / DELETE query parameters right in it: `/user/package-subscribe?merged=1`. Must not contain `..`, `//`, whitespace or backslashes |
| `method` | `GET` (default) / `POST` / `PUT` / `PATCH` / `DELETE` |
| `token` | Session token or personal API token (starting with `mmwx_`). Leave empty for sign-in endpoints |
| `ts` | Current Unix time in seconds. Rejected if it differs from the master's clock by more than 120 seconds |
| `nonce` | A random string (a UUID is fine) that must not repeat within 5 minutes |
| Others | For anything other than GET / DELETE the whole object is passed through as the request body, so business fields sit at the same level as the fields above |

Only these paths are allowed: `/user/*`, `/clash/*`, `/public/*`, `/login`, `/login/qr`, `/login/2fa`, `/login/recovery`, `/subscriptions`. **Admin APIs (`/admin/*`) are never allowed**, not even when signed in as an admin.

The HTTP status of the response is the endpoint's own status, and the body is the endpoint's response, encrypted. **The endpoint's response headers are not passed back**, which is why subscriptions are downloaded separately in plain HTTPS (see [Downloading subscriptions](#downloading-subscriptions)).

Errors from the channel itself:

| Status | Body | Cause |
| --- | --- | --- |
| 400 | Plain `{"error":"bad envelope"}` | The envelope cannot be opened: wrong master key, mismatched parameters, or corrupted data |
| 400 | Encrypted `{"error":"bad request"}` | The decrypted content is not valid JSON |
| 403 | Encrypted `{"error":"missing nonce"}` / `"stale request"` / `"replayed request"` | No nonce, clock off by more than 120 seconds, or nonce reused |
| 403 | Encrypted `{"error":"path not allowed"}` | The path is not in the list above |
| 401 | Encrypted `{"error":"unauthorized"}` | The token is invalid or expired; go back to the signed-out state |

Sign-in over the encrypted channel skips the web captcha (Turnstile), but login rate limiting still applies: the master counts by the real client IP.

### Three kinds of token

| Token | Looks like | Used for | Where it comes from |
| --- | --- | --- | --- |
| Session token | Opaque string | Encrypted channel, realtime push | Returned by sign-in, valid for 30 days |
| Personal API token | Starts with `mmwx_` | Encrypted channel, realtime push | Created with `/user/api-tokens`, valid until revoked |
| Subscription token | UUID | **Only** the `?token=` of subscription downloads | `/user/token` |

They are not interchangeable: the encrypted channel and realtime push do not accept subscription tokens, and `/api/clash/subscribe` does not accept API tokens. After signing in, MeowX creates an API token named "MeowX <device name>" for realtime push and revokes it on sign-out, so push keeps working if the session expires. Using the session token directly is fine too.

## Sign-in

### Username and password

```json
{ "path": "/login", "method": "POST", "ts": 1794000000, "nonce": "…",
  "username": "alice", "password": "…", "remember_me": true }
```

On success:

```json
{
  "token": "session token",
  "expires_at": "2026-12-08T10:00:00.123+08:00",
  "username": "alice",
  "email": "",
  "nickname": "Alice",
  "avatar_url": "/api/user/avatar/abc.png",
  "role": "user",
  "is_admin": false
}
```

- With `remember_me: true` the session lasts 30 days, otherwise 24 hours. Clients should always send `true`. Sessions are not renewed automatically; sign in again when one expires.
- `avatar_url` may be a relative path on the master (prefix it with the master address; no auth needed) or an external URL.

If the account has two-factor authentication enabled, the response is:

```json
{ "requires_2fa": true, "two_factor_token": "temporary token" }
```

Use `two_factor_token` (valid for 5 minutes) with one of the following; success returns the same body as above:

| Path | Request fields | Notes |
| --- | --- | --- |
| `/login/2fa` | `two_factor_token`, `code` (6-digit authenticator code) | |
| `/login/recovery` | `two_factor_token`, `recovery_code` | **After a successful recovery-code sign-in the master turns off two-factor authentication for the account.** Tell the user |

Errors:

| Status | `error` | Cause |
| --- | --- | --- |
| 400 | `username and password are required` | Missing fields |
| 401 | `invalid credentials` | Wrong username or password |
| 401 | `invalid or expired 2FA token` / `invalid 2FA code` / `invalid recovery code` | Two-factor step failed |
| 403 | `账号已被禁用` | The account is disabled |
| 429 | `too many login attempts, please try again later` | Login rate limit, counted per IP + username |

### QR code / sign-in link

The web panel (or the Telegram Mini App) gives a signed-in user a one-time sign-in code in this form:

```text
miaomiaowu://login?host=https%3A%2F%2Fpanel.example.com&code=one-time-code
```

`host` is the master address bound in the certificate (not necessarily the address the user opened the panel with); treat it as `https://` if it has no scheme. The client fetches the certificate from `host`, sets up the encrypted channel and redeems the code:

```json
{ "path": "/login/qr", "method": "POST", "ts": 1794000000, "nonce": "…", "code": "one-time-code" }
```

- Success returns the same body as password sign-in, always with a 30-day session and **no two-factor step**.
- Codes are valid for 5 minutes, single use, and all of them are discarded when the master restarts.
- Every failure is 401 `{"error":"二维码已失效，请重新生成"}` ("QR code expired, please generate a new one"), without saying whether the code expired, was used, or never existed; 429 when rate limited.

To generate a sign-in code from your own web page or device, call `POST /user/qr-login/create` with a signed-in token (no body); it returns `{"code":"…","expires_in":300}`.

## Subscriptions

### Subscription list

```json
{ "path": "/subscriptions", "method": "GET", "token": "…", "ts": 1794000000, "nonce": "…" }
```

```json
{
  "subscriptions": [
    { "id": 0, "name": "全部套餐", "filename": "__merged__", "type": "merged",
      "file_short_code": "AbC123", "expire_at": "2027-01-01T00:00:00Z",
      "subscription_path": "/x/AbC123", "traffic_used": 0, "traffic_total": 0 },
    { "id": -7, "name": "Monthly", "filename": "__package__:7", "type": "package",
      "file_short_code": "Pk7xyz", "expire_at": null,
      "subscription_path": "/x/Pk7xyz", "traffic_used": 123456789, "traffic_total": 107374182400 },
    { "id": 12, "name": "My subscription", "filename": "my.yaml",
      "custom_short_code": "mine", "latest_version": 3,
      "subscription_path": "/x/mineU5r", "traffic_used": 0, "traffic_total": 0 }
  ],
  "user_short_code": "U5r"
}
```

- A regular user sees subscriptions assigned to them, one card per package they hold, and subscriptions they created. With more than one active package and merged subscriptions enabled, an "all packages" card comes first.
- **Admin accounts see every subscription file on the master**; it is best to let admins pick.
- Traffic is in bytes and `traffic_total` is 0 when there is no quota; `expire_at` may be `null`; the short-code, version and `subscription_path` fields are omitted when empty.

### Building the subscription URL

1. Call `/user/token` (GET) for the subscription token:

   ```json
   { "token": "1b4e28ba-2fa1-11d2-883f-0016d3cca427", "user_short_code": "U5r" }
   ```

2. Build the URL from `subscription_path`:
   - Starts with `/x/`: use `https://<master>/x/…` as is. **The short code is the credential**; no token needed.
   - Anything else (e.g. `/api/user/package-subscribe?assignment_id=7`, `/api/clash/subscribe?filename=my.yaml`): add `token=<subscription token>` to the query string.
   - No `subscription_path`: use `/api/clash/subscribe?filename=<filename>&token=<subscription token>`.

:::caution
`POST /user/token` **resets the subscription token and also the user's connection credentials on every node**, invalidating all existing subscriptions. Do not call it unless the user explicitly asks.
:::

### Downloading subscriptions

Download subscription content with a plain HTTPS GET (not through the encrypted channel) so that you get the usage headers.

| URL | Notes |
| --- | --- |
| `/x/{short code}` | Short link, forwards to one of the two below; only when short links are enabled |
| `/api/clash/subscribe?filename=…&token=…` | A subscription file |
| `/api/user/package-subscribe?assignment_id=N&token=…` | One package; `merged=1` for the merged subscription |

Response headers:

| Header | Content |
| --- | --- |
| `subscription-userinfo` | `upload=0; download=<used bytes>; total=<quota bytes>; expire=<Unix seconds>`. Not sent when there is no quota; `expire=4102444799` when there is no expiry date |
| `profile-update-interval` | `24` (hours) |
| `profile-title` | `base64:<subscription name>` (only when the User-Agent does not look like a browser) |

**The User-Agent decides the format and which nodes you get**:

- The master detects the client type from the User-Agent. For a mihomo-based client, a User-Agent starting with `mihomo/<version>` yields Clash YAML; you can also add `t=<type>` to the URL (only effective with `filename` or a short link).
- The official client's User-Agent is `mihomo/1.19.0 MeowX/<version> (<platform>)`. Only when the master sees the `MeowX/` marker does it include nodes that only the MeowX core supports (AnyTLS + REALITY, Miu, Snell v6 and others). **Third-party clients must not copy this marker**, or they will receive nodes their core cannot parse.
- With an invalid token the master does not return 401; it returns a config containing only a "token invalid" placeholder.

Subscription downloads are rate limited per IP and return 429 when too frequent; repeated requests for non-existent short codes are treated as probing and the IP gets blocked. Do not poll; download again when [realtime push](#realtime-push) sends `subscription_changed`.

## Account info

| Path | Method | Returns |
| --- | --- | --- |
| `/user/profile` | GET | `username`, `email`, `nickname`, `avatar_url`, `role`, `is_admin`, plus `telegram_id` and `telegram_username` when Telegram is bound |
| `/user/features` | GET | `{"success":true,"return_routes":true,"unlock_check":true}`: whether the master has return-route and unlock checks enabled, so the client knows whether to show those entries |

## Unlock checks

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

- Only nodes the current user can use are returned. To match them with the nodes in the subscription, match by `name` first, then by `type` + `server` + `port` if the name differs (for example, renamed in the client).
- `status`: `yes` unlocked, `no` not unlocked, `originals_only` originals only, `banned` blocked; failed checks are not returned. `region` is the unlock region and may be missing.
- `service`: `netflix`, `disneyplus`, `youtube_premium`, `prime_video`, `tvb_anywhere`, `iqiyi`, `bing`, `apple`, `openai`, `gemini`, `claude`, `wikipedia`, `google_play`, `google_search`, `steam`, `reddit`, `dazn`, `onetrust`, `youtube_cdn`, `netflix_cdn`, `sdggge`, `bybit`, `binance`, `okx`. Which ones appear is chosen by the admin; show unknown values as they are or ignore them.
- Results follow each service's **actual exit**: if a node routes a service to another server, that server's result is shown; services routed to WARP, an external proxy or blocked are not shown.
- The master checks everything daily at 04:40 (master time zone), and checks newly online servers within 10 minutes. There is no check timestamp in the response, and no user-side endpoint to trigger a re-check.
- When unlock checks are disabled on the master the response is `{"success":true,"nodes":[]}`.

## Return routes

Return routes are the backhaul paths from the server to the three Chinese carriers.

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

- Nodes are matched the same way as for unlock checks.
- `carrier`: `telecom` (China Telecom), `unicom` (China Unicom), `mobile` (China Mobile), always in this order. `region` is the Chinese name of the target province and may be missing.
- `route_type` is the detected route name, `Unknown` when not recognized. `gold` marks premium routes (CN2 GIA, CTG GIA, 9929, CMIN2, 163 PP).
- `medal`: `gold` if any carrier has a premium route, otherwise `silver` if any route was recognized; nodes with no recognized route at all are not returned.
- Forwarded / relayed nodes show the return routes of the **entry server**.
- The target provinces are chosen by the admin; a carrier without a chosen province gets a random one each time. The master checks daily at 04:20 and checks new servers within 10 minutes; there is no check timestamp in the response.
- This endpoint does not check the master switch and returns whatever data exists, so check `return_routes` in `/user/features` before showing it.

## Other endpoints

### Personal API tokens

| Path | Method | Request | Returns |
| --- | --- | --- | --- |
| `/user/api-tokens` | GET | — | `{"success":true,"tokens":[{"id":5,"name":"…","created_at":"…","last_used_at":"…"}]}` |
| `/user/api-tokens` | POST | `name` (optional, at most 64 bytes) | 201 `{"success":true,"token":"mmwx_…","name":"…"}`; the plaintext is only returned once and there is no `id` |
| `/user/api-tokens/{id}` | DELETE | — | `{"success":true}` |

To revoke a token you created, GET the list and find its `id` by name.

### IP allowlist

When servers have the IP allowlist enabled, clients must report their egress IP regularly or they cannot connect to nodes.

| Path | Method | Notes |
| --- | --- | --- |
| `/user/firewall-token` | GET | Returns `{"success":true,"token":"…","report_url":"https://panel.example.com/api/fw/<token>/add","po0_links":[…],"enabled":true}`. When `enabled` is `false` no server uses the allowlist and nothing needs reporting |
| `/user/firewall-token` | POST | Rotate to a new token; the old one stops working immediately |
| `/user/po0-servers` | GET | po0 devices on the user's node paths: `{"success":true,"servers":[{"server_id":3,"name":"HK","ip":"203.0.113.10","url":"https://203.0.113.10/api/firewall/<token>/add?slot=2"}]}` |

To report, request `report_url` (on the master) and each po0 `url` (on the po0 device itself) directly over plain HTTPS, GET or POST. Without parameters the request's source IP is recorded; you may also pass `ip` and `note`. A 404 from the master's report URL means the token was rotated; GET `/user/firewall-token` again. MeowX reports to the master about once an hour and to po0 devices every 10 minutes.

:::note
`report_url` is built from the master's main server address. If the master only has a subscription address configured the URL may be wrong; ask the admin to set the main server address.
:::

### Speed-test board upload grant

`POST /user/speedtest/grant` with `{"payload_hash":"<sha256 of the result, 64 lowercase hex chars>"}` returns `{"success":true,"grant":"…","expires_at":"…"}` on success. At most 60 calls per user per hour; when no grant is available (`success:false`), upload anonymously.

## MeowNest

Endpoints for the master's built-in mesh network ([MeowNest](/docs/meownest)) live under `/user/mesh/`.

| Path | Method | Notes |
| --- | --- | --- |
| `/user/mesh/status` | GET | Availability: `{"available":true,"control_url":"…","magic_dns":"…","device_cidr":"100.64.0.0/10","device_limit":10,"account_id":"…","joined_admin":"root"}`. See below for `joined_admin` |
| `/user/mesh/enroll` | POST | Request `hostname`, `os`, `client`, `version`, `previous_node_id`; returns a one-time join key: `{"control_url","auth_key","expires_at","magic_dns","device_cidr","sites":[…]}`. The key is valid for 10 minutes, at most 5 calls per account per minute |
| `/user/mesh/devices` | GET | The account's devices: `{"devices":[{"id","name","dns_name","ipv4","online","last_seen","routes","pending_routes"}],"sites":[…],"shared_devices":[…]}`. See below for `shared_devices` |
| `/user/mesh/devices/{id}` | PATCH / DELETE | Rename (`name`) / remove a device |
| `/user/mesh/sites` | POST | A router declares the subnets it serves: `networks`, `force_map`, `router` |

When MeowNest is unavailable `status` still returns 200 with `available: false` and a `reason`:

| reason | Meaning | Suggestion |
| --- | --- | --- |
| `not_admin` | MeowNest is not open to this account (admins can open it to selected accounts in system settings) | Hide the MeowNest entry, or show `message` |
| `disabled` | MeowNest is off on the master | Show the reason and disable the switch |
| `starting` | MeowNest is starting on the master | Retry later |

The other MeowNest endpoints return 403 when unavailable.

### Joining an admin's MeowNest

In System settings › MeowNest, an admin can set an allowed account to join a given admin's MeowNest: the account then shares one network with that admin and the other accounts that joined, and their devices and site subnets can reach each other both ways; devices still belong to each account and can only be managed by their owner. In that case:

- `/user/mesh/status` includes `joined_admin`: the username of the admin it joined. Missing or empty means its own MeowNest.
- `/user/mesh/devices` adds `shared_devices`: other members' devices in the same network, with the same fields as `devices` plus `username` (the owner). They are read-only; renaming or deleting them returns 404. The field is absent for an account with its own MeowNest.

Clients can show "Joined xx's MeowNest" on the MeowNest page and list `shared_devices` separately as "Devices in this network" without delete or rename. Older masters do not return these fields; treat that as an account with its own MeowNest.

## Realtime push

```text
wss://panel.example.com/api/secure/ws
```

1. Right after connecting, send the **first frame**: the 32-byte ephemeral X25519 public key as a binary frame. Both sides derive two keys the same way as encrypted requests, with info `mmx-secure-ws-c2s-v1` (client to master) and `mmx-secure-ws-s2c-v1` (master to client).
2. Send the **second frame**, an encrypted auth frame whose plaintext is `{"token":"session token or API token","ts":1794000000,"nonce":"…"}`, with the same time and nonce rules as encrypted requests. Do not put the token in the URL. On auth failure the master just closes the connection without an error.
3. Every following frame (both directions, binary) is laid out as `counter (8 bytes, big-endian) ‖ ciphertext ‖ tag (16)`, with nonce `four 0x00 bytes ‖ counter`. Each direction counts from 0 on its own, and **the counter in client frames must strictly increase**, or the master disconnects.

Messages pushed by the master:

| type | Example | Handling |
| --- | --- | --- |
| `entry_failover` | `{"type":"entry_failover","domain":"entry.example.com","healthyIPs":["203.0.113.5"],"chainId":12}` | Forward-chain entry failover: resolve `domain` to the addresses in `healthyIPs`; an empty array clears the override. The current state is pushed once right after auth succeeds |
| `subscription_changed` | `{"type":"subscription_changed","rev":"3f2a9c01b7de"}` | Subscription content changed; download it again. `rev` can be used to deduplicate |

Keepalive: the master sends a WebSocket ping every 30 seconds and disconnects if it receives no frame (or pong) from the client for 70 seconds. Clients can send an encrypted `{"type":"ping"}` every 55–60 seconds (the master does not reply). Each user can have at most 16 connections (web and clients combined). The master closes the connections when the session is revoked or the account is disabled.

## Implementation tips

- A wrong crypto parameter only ever shows up as "cannot decrypt". Check your implementation against a real master first: encrypt a `/user/features` request; if you can decrypt the master's response, everything is right.
- When the admin changes the master's domain the certificate domain changes with it. If verification fails, ask the user to sign in again; do not relax the domain check.
- An encrypted 401 `unauthorized`, or being disconnected right after realtime auth, means the session is gone: clear the token and return to the signed-out state while keeping the subscriptions usable.
- Do not poll subscriptions, unlocks or return routes: subscriptions wait for push, and unlocks and return routes only update once a day, so fetching them when a page opens is enough.
