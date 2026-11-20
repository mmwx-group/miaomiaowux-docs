---
title: "Plugin reference"
description: "Complete reference for MiaomiaowuX plugins: plugin.json fields, permissions, the backend mmwx.* API, events, the frontend SDK and slots, settings, package format, developer mode and limits"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

This page is for looking things up. If it's your first plugin, start with the [plugin development tutorial](/docs/plugin-dev).

## Package

A plugin package is a zip with `plugin.json` at its root:

```
my-plugin-1.0.0.zip
├── plugin.json        manifest (required)
├── server.js          backend script (backend.entry)
├── dist/index.js      frontend entry (frontend.entry)
├── dist/index.css     frontend styles (frontend.style)
├── locales/zh-CN.json strings
├── locales/en.json
├── assets/…           other static files
└── plugin.sig         official signature (optional)
```

| Limit | Value |
| --- | --- |
| Package size | ≤ 10 MB |
| Unpacked size | ≤ 30 MB |
| Files | ≤ 500 |
| Paths | no absolute paths, `..` or backslashes |

`mmwx-plugin pack` collects files accordingly: `plugin.json`, the backend entry, the frontend entry's folder, styles, locales and `assets/`.

**Digest and signature**: the digest is the sha256 of every file's "path + `\0` + hex sha256 of its content + `\n`", concatenated in path order (excluding `plugin.sig`). `plugin.sig` is a base64 ed25519 signature of the digest. The master only accepts the public keys built into official releases; a missing or bad signature means "unsigned".

## plugin.json

```json
{
  "manifest": 1,
  "id": "my-plugin",
  "name": "我的插件",
  "name_en": "My Plugin",
  "version": "1.0.0",
  "description": "One line about it",
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
      "apiKey": { "type": "string", "title": "密钥", "title_en": "API key", "format": "password" },
      "limit": { "type": "integer", "title": "上限", "title_en": "Limit", "default": 10 }
    },
    "required": ["apiKey"]
  }
}
```

| Field | Required | Notes |
| --- | --- | --- |
| `manifest` | yes | Always `1` |
| `id` | yes | 2–32 lowercase letters / digits / `-`, starting with a letter; not `ui`, `admin`, `api` or `sdk` |
| `name` / `name_en` | `name` | Display name; the English UI prefers `name_en` |
| `version` | yes | semver, e.g. `1.2.0`, `1.3.0-beta.1` |
| `description`, `author`, `homepage` | no | Shown in plugin details |
| `sdk` | no | Frontend SDK range, currently `^1.0.0` |
| `minMaster` | no | Minimum master version; older masters refuse to install |
| `frontend` / `backend` | at least one | See below |
| `permissions` | yes | Permission list, may be empty |
| `settings` | no | Settings (the panel generates the form) |

### frontend

| Field | Notes |
| --- | --- |
| `entry` | ES module whose `default export` is `definePlugin({ activate })` |
| `style` | Stylesheet, injected the first time the plugin loads |
| `locales` | Only `zh-CN` and `en` |
| `pages[]` | `id` (starts with a letter, ≤ 32 chars), `title` / `title_en`, `role` (`admin` or `user`; the latter needs `ui:user`), `icon`, `nav.order` (menu position), `nav.hidden` (not in the menu, reachable by link only) |
| `slots[]` | Slots you use, see [Slots](#slots); `settings.section` needn't be declared |

Page URLs are `/p/<plugin id>/<page id>`.

`icon` can be: activity, alarm-clock, bar-chart, bell, bot, calendar, chart-line, chart-pie, circle-dollar-sign, clipboard-list, cloud, coins, credit-card, database, download, external-link, file-text, flag, gauge, gift, globe, hard-drive, heart, history, inbox, key-round, layout-dashboard, link, list, lock, mail, message-square, network, package, play, puzzle, radar, receipt, refresh-cw, rocket, scroll-text, search, send, server, settings, shield, shield-check, shopping-cart, sparkles, star, tag, terminal, ticket, timer, trending-up, upload, user, users, wallet, wifi, wrench, zap.

### backend

| Field | Notes |
| --- | --- |
| `runtime` | Always `script` (the master's built-in JavaScript runtime) |
| `entry` | Script file |

### settings

A subset of JSON Schema: `type` is `object`; each property's `type` is `string` / `number` / `integer` / `boolean`, with optional `title` / `title_en`, `description`, `default`, `enum` and `format` (`password` is masked, `textarea` is multi-line, `url`); `required` lists required properties. Property names are letters, digits and underscores, starting with a letter or underscore.

The panel builds the form in property order. `password` values read back masked (`******` + last 4 characters); submitting the masked value means "unchanged".

## Permissions

This is what admins see when they enable a plugin. **Only request what you use**; adding a permission in an update disables the plugin until an admin confirms again.

| Permission | Allows |
| --- | --- |
| `routes:admin` | Admin endpoints |
| `routes:user` | Endpoints for signed-in users |
| `routes:public` | Public endpoints without sign-in (e.g. payment callbacks) |
| `users:read` | Read users |
| `users:create` | Create users |
| `users:password` | Change user passwords |
| `packages:read` | Read packages |
| `assignments:read` | Read users' packages |
| `assignments:write` | Assign, change and remove users' packages |
| `servers:read` | Read the server list |
| `nodes:read` | Read the node list |
| `notify:send` | Send messages through the admin's notification channels |
| `filter:subscription` | Modify subscriptions before they're served |
| `cron` | Scheduled jobs |
| `ui:user` | Show content in the regular-user UI (user pages, `user.dashboard.card`) |
| `http:fetch:<domain>` | Access that domain, e.g. `http:fetch:api.example.com`, `http:fetch:*.example.com` |
| `events:<event>` | Receive that event; `events:*` receives all |

## Backend script

### How it runs

- Each enabled plugin gets 2 separate JavaScript runtimes; each runs the entry script once and registers the same handlers. **Globals aren't shared between requests** — persist with `mmwx.kv`.
- `mmwx.route` / `on` / `filter` / `cron` / `settings.onChange` can only be called while the script loads, and every load must register the same things (don't depend on randomness or time).
- All host APIs return synchronously. Handlers may be `async`, but the returned Promise must settle in the same turn (no `setTimeout`, no real network waits).
- No `require` / `import`, `process` or file system. Inline third-party libraries when you bundle (the backend is a single file).

| Timeout | Value |
| --- | --- |
| Script load | 2 s |
| Endpoints, events | 10 s |
| Subscription filters | 300 ms |
| Scheduled jobs | 60 s |
| `settings.onChange` | 2 s |

**Circuit breaker**: 5 uncaught errors or timeouts in a row disable the plugin, record why and notify admins; one success resets the count. Not applied in developer mode.

### mmwx.route

```js
mmwx.route(method, path, { role }, handler)   // role: 'admin' (default) | 'user' | 'public'
```

- `method`: `GET` `POST` `PUT` `PATCH` `DELETE`.
- `path`: path inside the plugin, may contain parameters: `/orders/:id`. Static segments win over parameters.
- External URL: `/api/plugins/<plugin id><path>`.
- `public` endpoints aren't authenticated, are limited to 60 requests per minute per plugin and IP (600 in developer mode), and can be called in plaintext (handy for third-party callbacks).

`handler(req)` receives:

| Field | Notes |
| --- | --- |
| `method`, `path` | Method and path inside the plugin |
| `params` | Path parameters |
| `query` | Query parameters (arrays for repeated names) |
| `headers` | Lowercased headers (without credentials such as Cookie and Authorization) |
| `body` | Parsed JSON / form; raw string if it can't be parsed; `null` if empty; ≤ 1 MB |
| `user` | `{ username, role }`; always `null` for `public` endpoints |
| `ip` | Client IP (set `MMWX_TRUSTED_PROXIES` when the master is behind a reverse proxy) |

Return values:

| Return | Response |
| --- | --- |
| object / array | 200, JSON |
| string | 200, `text/plain` |
| `{ status, headers?, body? }` | Custom status, headers and body |
| `null` / nothing | 204 |
| throw | 500, `{ error: "plugin_error", message }` |

Plugins can't set `Set-Cookie`, CORS, CSP or HSTS headers.

### mmwx.* API

| API | Permission | Notes |
| --- | --- | --- |
| `mmwx.on(type, fn)` | `events:<type>` | `fn(event)`, `event = { type, time, data: { title, message } }` |
| `mmwx.filter('subscription', fn)` | `filter:subscription` | `fn(config, ctx)` returns a new Clash config object, or `null` for no change; `ctx = { username, client, file \| package }` |
| `mmwx.cron(spec, fn)` | `cron` | 5-field cron "min hour day month weekday" with `*` `,` `-` `/`, in the master's time zone |
| `mmwx.kv.get(key)` / `set(key, value)` / `delete(key)` / `list(prefix)` | — | The plugin's key-value store; values must be JSON-serializable; ≤ 256 KB per value, ≤ 5 MB in total, keys ≤ 256 bytes |
| `mmwx.settings.get()` / `onChange(fn)` | — | Read settings; callback after an admin saves |
| `mmwx.log.info / warn / error(...)`, `console.log` | — | Plugin log (panel "Logs" tab, terminal while developing) |
| `mmwx.http.fetch(url, { method, headers, body, timeout })` | `http:fetch:<domain>` | Returns `{ status, ok, headers, body, json() }`; refuses private and loopback addresses and checks every redirect hop; responses ≤ 5 MB; timeout 10 s by default, 15 s max; 120 calls per minute |
| `mmwx.notify.send({ title, text })` | `notify:send` | Notify through the admin's channels |
| `mmwx.users.get(username)` / `create(body)` / `setPassword(username, pw)` | `users:*` | Same shapes as the open API |
| `mmwx.packages.list()` | `packages:read` | Returns `{ packages: [...] }` |
| `mmwx.assignments.list(u)` / `create(u, body)` / `update(u, id, body)` / `delete(u, id)` | `assignments:*` | A user's package assignments |
| `mmwx.servers.list()` | `servers:read` | `[{ id, name, ip, status, … }]` |
| `mmwx.nodes.list()` | `nodes:read` | `[{ id, name, protocol, … }]` |
| `mmwx.uid()`, `mmwx.now()` | — | Random id, millisecond timestamp |
| `mmwx.id`, `mmwx.version` | — | Plugin id and version |

Calls without the permission throw `permission denied: …`.

### Events

Event types are the panel's notification events (**plugins receive them whether or not the admin turned that notification on**). Common ones:

| Event | When |
| --- | --- |
| `login` | Someone signs in |
| `user_registered` | A new user signs up |
| `subscribe_fetch` | Someone fetches a subscription |
| `over_limit` | A user goes over quota |
| `package_expiring` / `package_expired` | A package is about to expire / expired |
| `traffic_threshold`, `daily_traffic` | Traffic alerts, daily traffic |
| `server_offline` / `server_online` | A server goes offline / recovers |
| `cert_result` | Certificate issuance result |
| `device_limit_exceeded` | Device limit exceeded |

The full list matches the events under System settings → Notifications. `events:*` receives everything.

## Frontend SDK

A plugin frontend is an ES module whose `default export` is a plugin definition:

```jsx
import { definePlugin } from '@mmwx/plugin-sdk'

export default definePlugin({
  activate(ctx) {
    ctx.pages.register('home', HomePage)
    ctx.slots.add('dashboard.card', { id: 'stats', title: 'Stats', size: 'third', component: StatsCard })
  },
})
```

A plugin loads and `activate` runs the first time it's needed (its page opens or one of its slots renders); loading and `activate` each have a 10 s limit.

### ctx

| Member | Notes |
| --- | --- |
| `ctx.id`, `ctx.version` | Plugin id and version |
| `ctx.api` | Client for the plugin's own backend, same as `useApi()` |
| `ctx.pages.register(pageId, Component)` | Register a page |
| `ctx.slots.add(slot, contribution)` | Add to a slot |
| `ctx.settings.get()` | Read settings (Promise) |
| `ctx.t(key, vars)` | Get a string |

### Exports

| Export | Notes |
| --- | --- |
| `useApi()` | `get / post / put / patch / delete(path, …)` against `/api/plugins/<id>/<path>`; returns parsed JSON, throws on non-2xx |
| `useT()` | String function, `t('key', { n: 1 })` with `{{n}}` interpolation |
| `useCurrentUser()` | `{ username, nickname, role, isAdmin }` or `null` |
| `useTheme()` | `{ theme, resolvedTheme }` |
| `useQuery`, `useMutation`, `useQueryClient` | TanStack Query sharing the panel's cache; start `queryKey` with your plugin id |
| `toast`, `toast.success / error / info / warning` | Toasts |
| `confirm({ title, description, confirmText, destructive })` | Confirmation dialog, `Promise<boolean>` |
| `navigate(to)` | Navigate within the panel |
| `ui.*` | UI components, see below |
| `React` | The panel's React (same as `import React from 'react'`) |

### ui components

Button, Card (CardHeader / CardTitle / CardDescription / CardContent / CardFooter), Badge, Input, Textarea, Label, Switch, Checkbox, Skeleton, Separator, ScrollArea and Table (TableHeader / TableBody / TableRow / TableHead / TableCell) are the panel components as is. These are simplified:

| Component | Props |
| --- | --- |
| `Select` | `value`, `onChange(v)`, `options: [{ value, label, disabled }]`, `placeholder`, `disabled` |
| `Tabs` | `items: [{ value, label, content }]`, `value` / `defaultValue`, `onChange` |
| `Dialog` / `Sheet` | `open`, `onOpenChange`, `title`, `description`, `footer`, `children`; Sheet also takes `side` |
| `DataTable` | `rows`, `columns: [{ key, title, render(row) }]`, `rowKey`, `empty` |
| `Tooltip` | `content`, `children` |
| `Alert` | `title`, `variant: 'default' \| 'destructive'`, `children` |

### Slots

| Slot | Where | Contribution |
| --- | --- | --- |
| `dashboard.card` | Admin traffic overview | `{ id, title?, size?: 'third' \| 'half' \| 'full', component }` |
| `user.dashboard.card` | Regular user's home (needs `ui:user`) | Same |
| `nodes.row.action` | Every node row | `{ id, label, icon?, visible?(row), onClick?(row), dialog? }` |
| `servers.row.action` | Every server row | Same |
| `users.row.action` | Every user row | Same |
| `packages.row.action` | Every package | Same |
| `nodes.bulk.action` / `users.bulk.action` | Bulk actions | `{ id, label, icon?, onClick?(rows), dialog? }` |
| `nodes.toolbar` / `servers.toolbar` / `users.toolbar` | Page toolbar | `{ id, label, icon?, onClick?(), dialog? }` |
| `settings.section` | The plugin's own settings | Component `({ values, save })` replacing the generated form |

`dialog` is a component that receives `{ row, close }` (`rows` for bulk, just `close` for toolbars) and opens in a dialog when the button is clicked.

Row data (`row`) only has these fields:

| Slot | Fields |
| --- | --- |
| Nodes | `id, name, protocol, server_id, server_name, server, port, tags, node_type` |
| Servers | `id, name, ip, status` |
| Users | `username, nickname, role, enabled` |
| Packages | `id, name` |

A UI error in a plugin only breaks its own area, not the panel; a plugin that errors repeatedly in a session stops being loaded for that session.

## Loading rules

| Who | Whose frontends load |
| --- | --- |
| Admins | Enabled, and either validly signed or trusted by an admin |
| Regular users | Enabled, validly signed and declaring `ui:user`; only `role: user` pages and user-side slots |

Backends run whenever the plugin is enabled, signed or not.

## Developer mode

Admins open a dev session for a plugin id in System settings → Plugins → Developer mode and get a dev token (`mmwxdev_<plugin id>_…`, valid 24 hours, one per plugin). For a plugin in development:

- errors don't trip the circuit breaker, and error responses and logs carry full stacks;
- rate limits for `http.fetch` and public endpoints are relaxed 10×;
- packages pushed with the token keep "Trust".

Endpoints a dev token can use (plaintext, `Authorization: Bearer <token>`):

| Endpoint | Purpose |
| --- | --- |
| `GET /api/plugin-dev/<id>/info` | Plugin status |
| `POST /api/plugin-dev/<id>/push` | Push a package (raw zip body, or multipart field `file`) and hot-reload; the package id must match |
| `GET /api/plugin-dev/<id>/logs?backlog=N` | Live logs (SSE), starting with the last N entries |
| `GET /api/plugin-dev/<id>/tunnel` | WebSocket tunnel; the backend runs on the developer's machine |
| `POST /api/plugin-dev/<id>/host` | Host API calls from the local runtime `{ fn, args }` |

`mmwx-plugin dev` uses these; you rarely need to call them directly.

## When things break

- Add `?safe=1` to the address: no plugins load in this session; `?safe=0` to leave.
- Set `MMWX_DISABLE_PLUGINS=1` on the master and restart: no plugins load and all plugin endpoints return 404.
