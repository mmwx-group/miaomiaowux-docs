---
title: "Plugin development tutorial"
description: "Write a MiaomiaowuX plugin from scratch: create a project, developer mode, local hot reload, live logs, run the backend on your machine with breakpoints, package and publish"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

Plugins add features to the master without changing the master itself:

- **Frontend**: add a whole page (it shows up in the menu), or add things to existing pages — dashboard cards, a button on every node / server / user / package row, bulk actions, toolbar buttons, and the plugin's own settings UI.
- **Backend**: serve endpoints (for admins, for signed-in users, or public callback URLs), subscribe to panel events (sign-in, sign-up, over quota…), run scheduled jobs, modify the Clash config before a subscription is served, call external URLs, and store its own data.

This page walks you through writing a plugin and debugging it against your own master. Every field and API is documented in the [plugin reference](/docs/plugin-reference); the conventions plugins should follow are in the [plugin guidelines](/docs/plugin-guidelines).

## Before you start

- A **test master** (don't develop on production) running a version with the plugin system.
- **Node.js 20.12 or newer** on your machine.
- An admin account on the master.
- The dev tooling is [`@mmwx/plugin-sdk`](https://www.npmjs.com/package/@mmwx/plugin-sdk) on npm (source: [mmwx-group/plugin-sdk](https://github.com/mmwx-group/plugin-sdk)). You don't install it separately: `npx` in step 1 fetches it to create the project, and the project then installs it as a dev dependency.

:::tip
A dev token can only touch the one plugin you choose, but while you develop, that plugin runs code from your machine. Use a test master, or at least avoid busy hours.
:::

## Step 1: create a project

```bash
npx @mmwx/plugin-sdk create my-plugin
cd my-plugin
npm install
```

You get:

| File | Purpose |
| --- | --- |
| `plugin.json` | The manifest: id, name, version, permissions, frontend entry, backend entry, settings |
| `server.js` | Backend script (optional) |
| `src/index.jsx` | Frontend entry (optional); `mmwx-plugin build` bundles it to `dist/index.js` |
| `src/style.css` | Frontend styles, bundled to `dist/index.css` |
| `locales/zh-CN.json`, `locales/en.json` | Frontend strings |
| `.gitignore` | Already ignores `dist/`, `*.zip` and `.mmwx-dev.json` (where the dev token is saved) |

The template ships with an admin page (`/p/my-plugin/home`), a dashboard card and a backend endpoint `GET /hello`, so it runs as is.

A plugin id is 2–32 lowercase letters, digits or hyphens, starting with a letter. It can't change after installation (data, settings and dev tokens are all keyed by id).

## Step 2: get a dev token

In the panel, open **System settings → Plugins → Developer mode**:

1. Enter the plugin id (`my-plugin` — **it doesn't need to be installed yet**) and click "Generate dev token".
2. The token is **shown only once**, next to a ready-made command. Copy it.

A dev token has a very small scope:

- it only works for this one plugin and expires after 24 hours;
- it can only push new versions of this plugin, read its logs, and move its backend to your machine;
- it can't reach any admin API.

Clicking "New token" for the same plugin revokes the old one immediately; "Stop developing" revokes the token and switches the backend back to the last pushed version.

## Step 3: run it

In the plugin folder:

```bash
npx mmwx-plugin dev --master https://your-panel --token <dev token> --save
```

`--save` stores the master address and token in `.mmwx-dev.json`, so next time `npx mmwx-plugin dev` is enough (environment variables `MMWX_MASTER` / `MMWX_DEV_TOKEN` work too).

The first run **pushes the plugin to the master and installs it**. New plugins aren't enabled automatically: go back to System settings → Plugins, click "Enable", review the permissions and confirm. Unsigned plugins (everything you write yourself) also need "Trust" before their frontend loads. You only do this once; later pushes keep the plugin enabled and trusted.

The terminal shows something like:

```
✓ 主控 https://your-panel(0.6.x),插件 my-plugin 已安装 v0.1.0
✓ 已推送 v0.1.0(启动)
✓ 本机开发服务器 http://localhost:5174
  打开 http://localhost:5174 —— 反代的主控面板,插件前端来自本机
✓ 前端已构建,监听 src/ 变化
```

## Step 4: frontend with hot reload

Open **http://localhost:5174**. It's your master panel (sign in once at this address) with one difference: **the plugin's frontend is served from your machine**. Edit anything under `src/`, save, and the plugin in the browser is swapped for the new build — no page refresh, no push.

```jsx
// src/index.jsx
import { definePlugin, ui, useApi, useT, toast } from '@mmwx/plugin-sdk'

const { Button } = ui

function HomePage() {
  const api = useApi()
  const t = useT()
  return (
    <Button onClick={async () => toast.success((await api.get('hello')).message)}>
      {t('say')}
    </Button>
  )
}

export default definePlugin({
  activate(ctx) {
    ctx.pages.register('home', HomePage)
    // a button on every row of the node list
    ctx.slots.add('nodes.row.action', {
      id: 'check',
      label: 'Check',
      icon: 'search',
      onClick: (node) => toast(`${node.name} → ${node.server}:${node.port}`),
    })
  },
})
```

- Import `react` and `@mmwx/plugin-sdk` directly; the bundler points them at the panel's copy, so your package doesn't ship React.
- Pages and slots must be declared in `plugin.json` (`frontend.pages` / `frontend.slots`); undeclared ones are ignored.
- Use the SDK's `ui.*` components (buttons, cards, tables, dialogs…) so your UI follows the panel theme and dark mode.
- Put strings in `locales/*.json` and read them with `useT()`; string changes hot-reload too.

### Rather not use the proxy?

You can debug right in the regular panel: **System settings → Plugins → Developer mode**, and under the plugin being developed turn on "Load frontend from this machine" (default address `http://localhost:5174/__mmwx/my-plugin/`).

- It only applies to this browser; other admins and browsers keep seeing the version on the master.
- Only local addresses are accepted, so nobody can trick you into loading their code.
- While it's on, a notice stays in the bottom-right corner; click × to stop.

:::note
Safari won't let an https page load scripts from http://localhost — use the proxy address in Safari. Chrome / Edge / Firefox work either way.
:::

## Step 5: backend with live logs

```js
/// <reference types="@mmwx/plugin-sdk/server" />

// admin endpoint: GET /api/plugins/my-plugin/hello
mmwx.route('GET', '/hello', { role: 'admin' }, (req) => {
  const hits = (mmwx.kv.get('hits') || 0) + 1
  mmwx.kv.set('hits', hits)
  console.log('hello', req.user.username, hits)
  return { message: `Hello, ${req.user.username}`, hits }
})

// do something when a user signs up (needs events:user_registered)
mmwx.on('user_registered', (ev) => {
  mmwx.log.info('new user', ev.data.message)
})
```

Save `server.js` and `mmwx-plugin dev` pushes it to the master and hot-reloads it. In the terminal you see:

- your own `console.log` / `mmwx.log` output;
- every request: method, path, status, duration (`GET /hello → 200 · 3ms`);
- events, scheduled jobs and subscription filters as they run;
- the result of every push; errors come with a full stack trace including file and line.

Editing `plugin.json` (new pages, new permissions…) pushes automatically and makes the panel reload the plugin list. **Adding a permission** disables the plugin until an admin confirms again in the panel.

While a dev session is open the master is more lenient with this plugin: errors don't auto-disable it (normally 5 errors in a row do), error responses include the full stack, and rate limits for `http.fetch` and public endpoints are relaxed 10×. Everything goes back to normal when the session ends.

## Step 6: run the backend locally with breakpoints

```bash
npx mmwx-plugin dev --inspect
```

With `--inspect` (or `--local-backend` without a debugger), the master **forwards this plugin's requests, events, scheduled jobs and subscription filters to your machine**:

- host APIs like `mmwx.kv`, `mmwx.http.fetch` and `mmwx.users` are executed by the master on your behalf, with exactly the same permissions as when the plugin runs on the master;
- open `chrome://inspect` in Chrome → "Open dedicated DevTools for Node", or attach VS Code to port 9229, to set breakpoints in `server.js`, step through and inspect variables;
- while you're paused on a breakpoint, the request on the master waits (up to 2 minutes);
- editing `server.js` restarts the local runtime and reconnects.

Quit `dev` (Ctrl+C) and the master switches back to the last pushed version.

:::caution
There's one difference between running locally and on the master: on the master, a Promise returned by an async handler must settle immediately (host APIs are synchronous and there are no timers), while locally it can really wait. Run once without `--inspect` before you ship.
:::

## Step 7: publish

```bash
npx mmwx-plugin deploy   # production build (minified, no sourcemap) and push to the master
npx mmwx-plugin pack     # build the package my-plugin-0.1.0.zip
```

- Bump `version` in `plugin.json` for every release ([semantic versioning](https://semver.org/)).
- A package can be installed on any master via System settings → Plugins → Upload plugin.
- Plugins you write are **unsigned**; whoever installs them has to click "Trust" before the frontend loads, and the panel says so. Signing is done by the official team: official builds embed the signing keys, and signed plugins don't need "Trust".

When you're done, click "Stop developing" in the panel, or let the token expire after 24 hours.

## What's in the SDK, and upgrading

`@mmwx/plugin-sdk` is one package with four parts:

| Part | Purpose |
| --- | --- |
| `mmwx-plugin` command | Create, develop, build, package, push and view logs (see the cheat sheet below) |
| `@mmwx/plugin-sdk` | Frontend APIs: `definePlugin`, `ui.*`, `useApi`, `useT`, `toast` and so on. Bundling points it at the copy shipped with the panel, so it isn't included in your package |
| `@mmwx/plugin-sdk/server` | Type definitions for the backend `server.js`, for editor completion and checks only (`/// <reference types="@mmwx/plugin-sdk/server" />`) |
| Project template | What `create` uses for new projects |

Upgrade to the latest version:

```bash
npm install -D @mmwx/plugin-sdk@latest
```

Check the version installed in a project with `npm ls @mmwx/plugin-sdk`. When the master's plugin system gains new APIs, upgrade the SDK to get the matching types and commands. Report SDK issues and suggestions on [GitHub](https://github.com/mmwx-group/plugin-sdk/issues).

## Command cheat sheet

| Command | What it does |
| --- | --- |
| `mmwx-plugin create <id> [dir]` | Create a plugin project |
| `mmwx-plugin dev` | Develop: push, proxy the panel, hot reload, live logs |
| `mmwx-plugin dev --inspect[=port]` | Same, plus run the backend locally with breakpoints |
| `mmwx-plugin dev --no-proxy` | Don't proxy the panel; only serve plugin assets (for "Load frontend from this machine") |
| `mmwx-plugin dev --port 5175` | Use another port for the local dev server |
| `mmwx-plugin build` | Production frontend build |
| `mmwx-plugin pack [-o file]` | Build and package |
| `mmwx-plugin deploy` | Build, package and push |
| `mmwx-plugin logs` | Live logs only |
| `mmwx-plugin keygen -o <key file>` | Generate a signing key pair |
| `mmwx-plugin pack --key <key file>` | Package and sign with that private key |

Signatures made with `keygen` / `pack --key` only count on masters **you build yourself** (inject the public key via `PLUGIN_SIGN_PUB_KEYS` at build time). Official master releases only trust the official signature, so third-party plugins stay unsigned there and need "Trust" after installing.

## FAQ

**`npx @mmwx/plugin-sdk` is slow or fails to install?**
On networks in mainland China, switch to an npm mirror first: `npm config set registry https://registry.npmmirror.com` (switch back with `npm config set registry https://registry.npmjs.org`). A freshly published version may take a few minutes to reach the mirror.

**The plugin is enabled but the page / card doesn't show?**
Unsigned plugins need "Trust" in System settings → Plugins before their frontend loads. Also check that the page or slot is declared in `plugin.json`.

**"Dev token is invalid or expired"?**
Tokens expire after 24 hours, or someone clicked "New token" / "Stop developing". Generate a new one in Developer mode.

**"Port 5174 is in use"?**
Pick another with `--port`; if you use "Load frontend from this machine", change the address in the panel too.

**The local runtime can't connect (tunnel closed)?**
The plugin has to be enabled in the panel first; if you just added a permission, confirm it in the panel. Save any file afterwards and it reconnects.

**A plugin broke the panel and pages won't open?**
Add `?safe=1` to the address for safe mode (no plugins load in this session), `?safe=0` to leave it; or set `MMWX_DISABLE_PLUGINS=1` on the master and restart to turn the plugin system off entirely.
