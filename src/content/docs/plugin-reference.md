---
title: "插件参考"
description: "妙妙屋X 插件的完整参考：plugin.json 字段、权限、后端 mmwx.* 接口、事件、前端 SDK 与插槽、设置项、插件包格式、开发者模式与各项限制"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

本页是查阅用的。第一次写插件先看 [插件开发教程](/docs/plugin-dev)。

## 插件包

插件包是一个 zip，根目录必须有 `plugin.json`：

```
my-plugin-1.0.0.zip
├── plugin.json        清单(必须)
├── server.js          后端脚本(backend.entry)
├── dist/index.js      前端入口(frontend.entry)
├── dist/index.css     前端样式(frontend.style)
├── locales/zh-CN.json 文案
├── locales/en.json
├── assets/…           其它静态资源
└── plugin.sig         官方签名(可选)
```

| 限制 | 值 |
| --- | --- |
| 包大小 | ≤ 10 MB |
| 解压后总大小 | ≤ 30 MB |
| 文件数 | ≤ 500 |
| 路径 | 不能是绝对路径、不能含 `..` 和反斜杠 |

`mmwx-plugin pack` 会按上表自动收集文件：`plugin.json`、后端入口、前端入口所在目录、样式、文案、`assets/`。

**摘要与签名**：摘要 = 按路径字典序，把每个文件的「路径 + `\0` + 内容 sha256 的十六进制 + `\n`」拼起来再做 sha256（不含 `plugin.sig`）。`plugin.sig` 是对摘要的 ed25519 签名（base64）。主控只认官方构建里内置的公钥，没签名或签名不对都按「未签名」处理。

## plugin.json

```json
{
  "manifest": 1,
  "id": "my-plugin",
  "name": "我的插件",
  "name_en": "My Plugin",
  "version": "1.0.0",
  "description": "一句话说明",
  "author": "you",
  "homepage": "https://example.com",
  "sdk": "^1.0.0",
  "minMaster": "0.6.4",
  "frontend": {
    "entry": "dist/index.js",
    "style": "dist/index.css",
    "locales": { "zh-CN": "locales/zh-CN.json", "en": "locales/en.json" },
    "pages": [{ "id": "home", "title": "我的插件", "title_en": "My Plugin", "role": "admin", "icon": "puzzle", "nav": { "order": 10 } }],
    "slots": ["dashboard.card", "nodes.row.action"]
  },
  "backend": { "runtime": "script", "entry": "server.js" },
  "permissions": ["routes:admin", "packages:read"],
  "settings": {
    "type": "object",
    "properties": {
      "apiKey": { "type": "string", "title": "密钥", "format": "password" },
      "limit": { "type": "integer", "title": "上限", "default": 10 }
    },
    "required": ["apiKey"]
  }
}
```

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `manifest` | 是 | 固定 `1` |
| `id` | 是 | 小写字母开头，2–32 位小写字母 / 数字 / `-`；不能是 `ui`、`admin`、`api`、`sdk` |
| `name` / `name_en` | `name` 必填 | 显示名，英文界面优先用 `name_en` |
| `version` | 是 | semver，如 `1.2.0`、`1.3.0-beta.1` |
| `description`、`author`、`homepage` | 否 | 显示在插件详情里 |
| `sdk` | 否 | 依赖的前端 SDK 版本范围，目前为 `^1.0.0` |
| `minMaster` | 否 | 要求的最低主控版本，低于它拒绝安装 |
| `frontend` / `backend` | 至少一个 | 见下 |
| `permissions` | 是 | 权限列表，可以为空数组 |
| `settings` | 否 | 设置项（面板自动生成设置表单） |

### frontend

| 字段 | 说明 |
| --- | --- |
| `entry` | ES module 入口，`default export` 一个 `definePlugin({ activate })` |
| `style` | 样式表，插件第一次加载时注入 |
| `locales` | 只支持 `zh-CN` 和 `en` |
| `pages[]` | `id`（小写字母开头，≤32 位）、`title` / `title_en`、`role`（`admin` 或 `user`，后者需要 `ui:user` 权限）、`icon`、`nav.order`（菜单里的顺序）、`nav.hidden`（不进菜单，只能经链接打开） |
| `slots[]` | 要用到的插槽，见 [插槽](#插槽)；`settings.section` 不用声明 |

页面地址是 `/p/<插件 id>/<页面 id>`。

`icon` 可选：activity、alarm-clock、bar-chart、bell、bot、calendar、chart-line、chart-pie、circle-dollar-sign、clipboard-list、cloud、coins、credit-card、database、download、external-link、file-text、flag、gauge、gift、globe、hard-drive、heart、history、inbox、key-round、layout-dashboard、link、list、lock、mail、message-square、network、package、play、puzzle、radar、receipt、refresh-cw、rocket、scroll-text、search、send、server、settings、shield、shield-check、shopping-cart、sparkles、star、tag、terminal、ticket、timer、trending-up、upload、user、users、wallet、wifi、wrench、zap。

### backend

| 字段 | 说明 |
| --- | --- |
| `runtime` | 固定 `script`（主控内置的 JavaScript 运行时） |
| `entry` | 脚本文件 |

### settings

JSON Schema 的一个子集：`type` 固定 `object`；每个属性的 `type` 是 `string` / `number` / `integer` / `boolean`；可选 `title` / `title_en`、`description`、`default`、`enum`、`format`（`password` 遮罩显示、`textarea` 多行、`url`）；`required` 列出必填项。属性名只能是字母、数字、下划线，字母或下划线开头。

面板按属性顺序生成表单；`password` 类型的值读回来是遮罩的（`******` + 末 4 位），提交遮罩值表示不改。

## 权限

管理员启用插件时看到的就是这张表里的说明。**只申请用得到的权限**；升级时新增权限，插件会停用并等管理员重新确认。

| 权限 | 允许 |
| --- | --- |
| `routes:admin` | 注册管理员接口 |
| `routes:user` | 注册登录用户可用的接口 |
| `routes:public` | 注册无需登录的公开接口（例如收款回调） |
| `users:read` | 查看用户 |
| `users:create` | 创建用户 |
| `users:password` | 修改用户密码 |
| `packages:read` | 查看套餐 |
| `assignments:read` | 查看用户的套餐 |
| `assignments:write` | 给用户开通、修改、移除套餐 |
| `servers:read` | 查看服务器列表 |
| `nodes:read` | 查看节点列表 |
| `notify:send` | 通过管理员设置的通知渠道发消息 |
| `filter:subscription` | 在订阅下发前修改内容 |
| `cron` | 定时运行任务 |
| `ui:user` | 在普通用户的界面里显示内容（用户侧页面、`user.dashboard.card`） |
| `http:fetch:<域名>` | 访问这个域名，如 `http:fetch:api.example.com`、`http:fetch:*.example.com` |
| `events:<事件>` | 接收这个事件，`events:*` 接收全部 |

## 后端脚本

### 运行方式

- 每个启用的插件有 2 个独立的 JavaScript 运行环境，各执行一遍入口脚本、注册同一组处理函数。**全局变量不在请求之间共享**，要持久化用 `mmwx.kv`。
- `mmwx.route` / `on` / `filter` / `cron` / `settings.onChange` 只能在脚本加载时调用，而且每次加载注册的内容必须一样（不能依赖随机数、时间）。
- 宿主接口全部同步返回。处理函数可以是 `async`，但返回的 Promise 必须在同一轮里完成（没有 `setTimeout`、没有真正的网络等待）。
- 没有 `require` / `import`、`process`、文件系统。需要第三方库请在打包时自行内联（后端脚本是单文件）。

| 超时 | 值 |
| --- | --- |
| 脚本加载 | 2 秒 |
| 接口、事件 | 10 秒 |
| 订阅过滤器 | 300 毫秒 |
| 定时任务 | 60 秒 |
| `settings.onChange` | 2 秒 |

**熔断**：未捕获的异常或超时连续 5 次，插件自动停用、记录原因并通知管理员；成功一次就清零。开发者模式下不熔断。

### mmwx.route

```js
mmwx.route(method, path, { role }, handler)   // role: 'admin'(默认) | 'user' | 'public'
```

- `method`：`GET` `POST` `PUT` `PATCH` `DELETE`。
- `path`：插件内路径，可带参数：`/orders/:id`。静态段优先于参数段。
- 外部地址：`/api/plugins/<插件 id><path>`。
- `public` 接口不鉴权，按「插件 + IP」每分钟限 60 次（开发中 600 次），可以用明文访问（适合第三方回调）。

`handler(req)` 收到：

| 字段 | 说明 |
| --- | --- |
| `method`、`path` | 请求方法与插件内路径 |
| `params` | 路径参数 |
| `query` | 查询参数（同名多值时是数组） |
| `headers` | 小写的请求头（不含 Cookie、Authorization 等凭据） |
| `body` | JSON / 表单解析后的值；解析不了是原字符串；空为 `null`；≤ 1 MB |
| `user` | `{ username, role }`；`public` 接口恒为 `null` |
| `ip` | 客户端 IP（主控在反代后面时要配 `MMWX_TRUSTED_PROXIES`） |

返回值：

| 返回 | 响应 |
| --- | --- |
| 对象 / 数组 | 200，JSON |
| 字符串 | 200，`text/plain` |
| `{ status, headers?, body? }` | 自定义状态码、响应头、内容 |
| `null` / 不返回 | 204 |
| 抛出异常 | 500，`{ error: "plugin_error", message }` |

插件不能设置 `Set-Cookie`、CORS、CSP、HSTS 这几个响应头。

### mmwx.* 接口

| 接口 | 权限 | 说明 |
| --- | --- | --- |
| `mmwx.on(type, fn)` | `events:<type>` | `fn(event)`，`event = { type, time, data: { title, message } }` |
| `mmwx.filter('subscription', fn)` | `filter:subscription` | `fn(config, ctx)`，返回新的 Clash 配置对象，返回 `null` 不改；`ctx = { username, client, file \| package }` |
| `mmwx.cron(spec, fn)` | `cron` | 5 段 cron「分 时 日 月 周」，支持 `*` `,` `-` `/`，按主控时区 |
| `mmwx.kv.get(key)` / `set(key, value)` / `delete(key)` / `list(prefix)` | — | 插件自己的键值存储；值要能 JSON 序列化；单值 ≤ 256 KB，总量 ≤ 5 MB，键 ≤ 256 字节 |
| `mmwx.settings.get()` / `onChange(fn)` | — | 读设置；管理员保存设置后回调 |
| `mmwx.log.info / warn / error(...)`、`console.log` | — | 写插件日志（面板「日志」页、开发时的终端） |
| `mmwx.http.fetch(url, { method, headers, body, timeout })` | `http:fetch:<域名>` | 返回 `{ status, ok, headers, body, json() }`；拒绝内网和回环地址，重定向每一跳都检查；响应 ≤ 5 MB；超时默认 10 秒、最长 15 秒；每分钟 120 次 |
| `mmwx.notify.send({ title, text })` | `notify:send` | 经管理员配置的渠道发通知 |
| `mmwx.users.get(username)` / `create(body)` / `setPassword(username, pw)` | `users:*` | 返回值与开放 API 同结构 |
| `mmwx.packages.list()` | `packages:read` | 返回 `{ packages: [...] }` |
| `mmwx.assignments.list(u)` / `create(u, body)` / `update(u, id, body)` / `delete(u, id)` | `assignments:*` | 用户的套餐绑定 |
| `mmwx.servers.list()` | `servers:read` | `[{ id, name, ip, status, … }]` |
| `mmwx.nodes.list()` | `nodes:read` | `[{ id, name, protocol, … }]` |
| `mmwx.uid()`、`mmwx.now()` | — | 随机 id、毫秒时间戳 |
| `mmwx.id`、`mmwx.version` | — | 插件 id 与版本 |

没有权限时调用会抛出 `permission denied: …`。

### 事件

事件类型就是面板通知的事件名（**不管管理员有没有开这个通知，插件都会收到**）。常用的：

| 事件 | 时机 |
| --- | --- |
| `login` | 有人登录 |
| `user_registered` | 新用户注册 |
| `subscribe_fetch` | 有人拉取订阅 |
| `over_limit` | 用户流量超额 |
| `package_expiring` / `package_expired` | 套餐快到期 / 已到期 |
| `traffic_threshold`、`daily_traffic` | 流量提醒、每日流量 |
| `server_offline` / `server_online` | 服务器离线 / 恢复 |
| `cert_result` | 证书申请结果 |
| `device_limit_exceeded` | 设备数超限 |

完整列表以面板「系统设置 → 推送」里的事件为准。`events:*` 接收全部事件。

## 前端 SDK

插件前端是一个 ES module，`default export` 一个插件定义：

```jsx
import { definePlugin } from '@mmwx/plugin-sdk'

export default definePlugin({
  activate(ctx) {
    ctx.pages.register('home', HomePage)
    ctx.slots.add('dashboard.card', { id: 'stats', title: '统计', size: 'third', component: StatsCard })
  },
})
```

插件在第一次用到时（打开它的页面、渲染它的插槽）才加载并调用 `activate`，加载和 `activate` 各限 10 秒。

### ctx

| 成员 | 说明 |
| --- | --- |
| `ctx.id`、`ctx.version` | 插件 id 与版本 |
| `ctx.api` | 调插件自己后端的客户端，同 `useApi()` |
| `ctx.pages.register(pageId, Component)` | 注册页面 |
| `ctx.slots.add(slot, contribution)` | 往插槽里加东西 |
| `ctx.settings.get()` | 读设置（Promise） |
| `ctx.t(key, vars)` | 取文案 |

### 导出

| 导出 | 说明 |
| --- | --- |
| `useApi()` | `get / post / put / patch / delete(path, …)`，打 `/api/plugins/<id>/<path>`，返回解析后的 JSON，非 2xx 抛错 |
| `useT()` | 文案函数，`t('key', { n: 1 })`，`{{n}}` 插值 |
| `useCurrentUser()` | `{ username, nickname, role, isAdmin }` 或 `null` |
| `useTheme()` | `{ theme, resolvedTheme }` |
| `useQuery`、`useMutation`、`useQueryClient` | TanStack Query，和面板共用一个缓存；`queryKey` 请以插件 id 开头 |
| `toast`、`toast.success / error / info / warning` | 提示条 |
| `confirm({ title, description, confirmText, destructive })` | 确认框，返回 `Promise<boolean>` |
| `navigate(to)` | 面板内跳转 |
| `ui.*` | 界面组件，见下 |
| `React` | 面板的 React（直接 `import React from 'react'` 也一样） |

### ui 组件

Button、Card（CardHeader / CardTitle / CardDescription / CardContent / CardFooter）、Badge、Input、Textarea、Label、Switch、Checkbox、Skeleton、Separator、ScrollArea、Table（TableHeader / TableBody / TableRow / TableHead / TableCell）按面板组件原样提供。下面几个是简化过的：

| 组件 | 属性 |
| --- | --- |
| `Select` | `value`、`onChange(v)`、`options: [{ value, label, disabled }]`、`placeholder`、`disabled` |
| `Tabs` | `items: [{ value, label, content }]`、`value` / `defaultValue`、`onChange` |
| `Dialog` / `Sheet` | `open`、`onOpenChange`、`title`、`description`、`footer`、`children`；Sheet 另有 `side` |
| `DataTable` | `rows`、`columns: [{ key, title, render(row) }]`、`rowKey`、`empty` |
| `Tooltip` | `content`、`children` |
| `Alert` | `title`、`variant: 'default' \| 'destructive'`、`children` |

### 插槽

| 插槽 | 位置 | 贡献的形状 |
| --- | --- | --- |
| `dashboard.card` | 管理员流量信息页 | `{ id, title?, size?: 'third' \| 'half' \| 'full', component }` |
| `user.dashboard.card` | 普通用户首页（需 `ui:user`） | 同上 |
| `nodes.row.action` | 节点列表每一行 | `{ id, label, icon?, visible?(row), onClick?(row), dialog? }` |
| `servers.row.action` | 服务器列表每一行 | 同上 |
| `users.row.action` | 用户列表每一行 | 同上 |
| `packages.row.action` | 套餐列表每一项 | 同上 |
| `nodes.bulk.action` / `users.bulk.action` | 批量操作 | `{ id, label, icon?, onClick?(rows), dialog? }` |
| `nodes.toolbar` / `servers.toolbar` / `users.toolbar` | 页面顶部工具栏 | `{ id, label, icon?, onClick?(), dialog? }` |
| `settings.section` | 插件自己的设置页 | 组件 `({ values, save })`，替代自动生成的表单 |

`dialog` 是一个组件，收到 `{ row, close }`（批量是 `rows`，工具栏只有 `close`），点按钮时在对话框里打开。

行数据（`row`）只给精简字段：

| 插槽 | 字段 |
| --- | --- |
| 节点 | `id, name, protocol, server_id, server_name, server, port, tags, node_type` |
| 服务器 | `id, name, ip, status` |
| 用户 | `username, nickname, role, enabled` |
| 套餐 | `id, name` |

插件的界面出错只会让它自己那一块显示错误，不影响面板；同一个插件在本次会话里出错多次会被暂停加载。

## 加载规则

| 谁 | 加载哪些插件的前端 |
| --- | --- |
| 管理员 | 已启用，且签名有效或管理员点过「信任」 |
| 普通用户 | 已启用、签名有效、声明了 `ui:user`；只给 `role: user` 的页面和用户侧插槽 |

后端只要启用就运行，与签名无关。

## 开发者模式

管理员在「系统设置 → 插件 → 开发者模式」给某个插件 id 开开发会话，得到开发令牌（`mmwxdev_<插件 id>_…`，24 小时有效，同一插件只有一枚）。开发中的插件：

- 出错不熔断，错误响应与日志带完整调用栈；
- `http.fetch` 与公开接口的频率限制放宽 10 倍；
- 用令牌推送的新包保持「信任」。

开发令牌能用的接口（明文，`Authorization: Bearer <令牌>`）：

| 接口 | 作用 |
| --- | --- |
| `GET /api/plugin-dev/<id>/info` | 插件状态 |
| `POST /api/plugin-dev/<id>/push` | 推送插件包（zip 原始请求体，或 multipart 字段 `file`）并热重载；包里的 id 必须是这个插件 |
| `GET /api/plugin-dev/<id>/logs?backlog=N` | 实时日志（SSE），先补最近 N 条 |
| `GET /api/plugin-dev/<id>/tunnel` | WebSocket 隧道，后端在开发者本机运行 |
| `POST /api/plugin-dev/<id>/host` | 本机运行时代调宿主接口 `{ fn, args }` |

`mmwx-plugin dev` 用的就是这几个接口，一般不需要直接调。

## 救急

- 地址后面加 `?safe=1`：本次会话不加载任何插件；`?safe=0` 恢复。
- 主控环境变量 `MMWX_DISABLE_PLUGINS=1` 后重启：不加载任何插件，插件接口全部 404。
