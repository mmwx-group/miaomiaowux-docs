---
title: "插件开发教程"
description: "从零写一个妙妙屋X 插件：新建项目、开发者模式、本机热更新、实时日志、后端在本机跑并下断点、打包发布"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

插件可以给主控加功能，而不用改主控本身：

- **前端**：加一整个页面（出现在菜单里），或者往现有页面里加东西——首页卡片、节点 / 服务器 / 用户 / 套餐每一行的按钮、批量操作、工具栏按钮、插件自己的设置界面。
- **后端**：提供接口（管理员用、登录用户用、或者公开的回调地址）、订阅面板事件（登录、注册、超额……）、定时任务、在订阅下发前改 Clash 配置、调用外部网址、读写自己的数据。

本页一步一步带你写一个插件并在自己的主控上调试。所有字段和接口的完整说明见 [插件参考](/docs/plugin-reference)，写插件要遵守的约定见 [插件开发规范](/docs/plugin-guidelines)。

## 准备

- 一台**测试用的主控**（别在正式环境上开发），版本要带插件系统。
- 本机装好 **Node.js 20.12 或更新**。
- 主控的管理员账号。
- 开发工具是 npm 上的 [`@mmwx/plugin-sdk`](https://www.npmjs.com/package/@mmwx/plugin-sdk)（源码 [mmwx-group/plugin-sdk](https://github.com/mmwx-group/plugin-sdk)），不用单独安装：第 1 步的 `npx` 会临时拉它来新建项目，项目里再作为开发依赖装一份。

:::tip
开发令牌只能操作你指定的那一个插件，但开发中的插件跑的是你本机的代码。请用测试主控，或者至少不要在用户多的时段调试。
:::

## 第 1 步：新建项目

```bash
npx @mmwx/plugin-sdk create my-plugin
cd my-plugin
npm install
```

得到的目录：

| 文件 | 作用 |
| --- | --- |
| `plugin.json` | 插件清单：id、名字、版本、要哪些权限、前端入口、后端入口、设置项 |
| `server.js` | 后端脚本（可以没有） |
| `src/index.jsx` | 前端入口（可以没有）；`mmwx-plugin build` 打包成 `dist/index.js` |
| `src/style.css` | 前端样式，打包成 `dist/index.css` |
| `locales/zh-CN.json`、`locales/en.json` | 前端文案 |
| `.gitignore` | 已经忽略 `dist/`、`*.zip` 和存开发令牌的 `.mmwx-dev.json` |

模板自带一个管理页（`/p/my-plugin/home`）、一张首页卡片和一个后端接口 `GET /hello`，可以直接跑。

插件 id 只能是小写字母开头的 2–32 位小写字母、数字、连字符，装上之后不能改（数据、设置、开发令牌都按 id 记）。

## 第 2 步：拿开发令牌

在主控面板打开 **系统设置 → 插件 → 开发者模式**：

1. 填插件 id（`my-plugin`，**插件还没装也可以**），点「生成开发令牌」。
2. 令牌**只显示这一次**，旁边还有一条现成的命令，复制下来。

开发令牌的范围很小：

- 只对这一个插件有效，24 小时后自动过期；
- 只能推送这个插件的新版本、看它的日志、把它的后端换到你本机运行；
- 够不到任何管理接口。

同一个插件再点一次「换新令牌」，旧令牌立即作废；点「结束开发」，令牌作废、后端换回最后一次推送的版本。

## 第 3 步：跑起来

在插件目录里：

```bash
npx mmwx-plugin dev --master https://你的面板 --token <开发令牌> --save
```

`--save` 会把主控地址和令牌存进 `.mmwx-dev.json`，以后直接 `npx mmwx-plugin dev`（也可以用环境变量 `MMWX_MASTER` / `MMWX_DEV_TOKEN`）。

第一次运行会把插件**推送到主控并安装**。新装的插件不会自动启用：回到面板「系统设置 → 插件」，点「启用」，看一眼它要的权限后确认。没有签名的插件（自己写的都是）还要点「信任」，前端才会加载。这两步只需要做一次，之后的推送会保持启用和信任。

终端里会看到类似这样的输出：

```
✓ 主控 https://你的面板(0.6.x),插件 my-plugin 已安装 v0.1.0
✓ 已推送 v0.1.0(启动)
✓ 本机开发服务器 http://localhost:5174
  打开 http://localhost:5174 —— 反代的主控面板,插件前端来自本机
✓ 前端已构建,监听 src/ 变化
```

## 第 4 步：写前端，浏览器里热更新

打开 **http://localhost:5174**，看到的就是你的主控面板（第一次要在这个地址登录一次）。区别只有一个：**插件的前端来自你本机**。改 `src/` 里的代码，保存后浏览器里的插件立刻换成新版本，不用刷新页面，也不用推送。

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
    // 节点列表每一行加一个按钮
    ctx.slots.add('nodes.row.action', {
      id: 'check',
      label: '检查一下',
      icon: 'search',
      onClick: (node) => toast(`${node.name} → ${node.server}:${node.port}`),
    })
  },
})
```

- `react`、`@mmwx/plugin-sdk` 直接 import，打包时会指到面板自带的那一份，插件包里不带 React。
- 页面和插槽都要先在 `plugin.json` 的 `frontend.pages` / `frontend.slots` 里声明，没声明的会被忽略。
- 界面组件用 SDK 的 `ui.*`（按钮、卡片、表格、对话框……），这样会跟着面板的主题和深浅色走。
- 文案放 `locales/*.json`，用 `useT()` 取；改文案也会热更新。

### 不想用反代？

也可以直接在原来的面板里调：**系统设置 → 插件 → 开发者模式**，在开发中的插件下面打开「这台浏览器从本机加载前端」（地址默认 `http://localhost:5174/__mmwx/my-plugin/`）。

- 只对这台浏览器生效，别的管理员、别的浏览器看到的还是主控上的版本；
- 只能填本机地址，防止被人诱导加载别人的代码；
- 开着的时候右下角一直有提示，点 × 就停掉。

:::note
Safari 不允许 https 页面加载 http://localhost 的脚本，用 Safari 请走反代地址。Chrome / Edge / Firefox 两种方式都行。
:::

## 第 5 步：写后端，终端里看实时日志

```js
/// <reference types="@mmwx/plugin-sdk/server" />

// 管理员接口:GET /api/plugins/my-plugin/hello
mmwx.route('GET', '/hello', { role: 'admin' }, (req) => {
  const hits = (mmwx.kv.get('hits') || 0) + 1
  mmwx.kv.set('hits', hits)
  console.log('hello', req.user.username, hits)
  return { message: `你好, ${req.user.username}`, hits }
})

// 有用户注册时做点什么(要权限 events:user_registered)
mmwx.on('user_registered', (ev) => {
  mmwx.log.info('新用户', ev.data.message)
})
```

保存 `server.js`，`mmwx-plugin dev` 会自动推送到主控并热重载。终端里能看到：

- 插件自己 `console.log` / `mmwx.log` 打的日志；
- 每个请求：方法、路径、状态码、耗时（`GET /hello → 200 · 3ms`）；
- 事件、定时任务、订阅过滤器的执行情况；
- 每次推送的结果；出错时是带文件名和行号的完整调用栈。

改 `plugin.json`（加页面、加权限……）也会自动推送，面板会重新读取插件清单。**加了新权限**时插件会停用，要到面板里重新确认一次。

调试期间主控对这个插件更宽松：出错不会被自动停用（平时连续出错 5 次会停用），错误响应里带完整调用栈，`http.fetch` 和公开接口的频率限制放宽 10 倍。会话结束后一切恢复正常。

## 第 6 步：后端放在本机跑，下断点

```bash
npx mmwx-plugin dev --inspect
```

加了 `--inspect`（或 `--local-backend` 不开调试器），主控就把这个插件的接口请求、事件、定时任务、订阅过滤器**转到你电脑上执行**：

- `mmwx.kv`、`mmwx.http.fetch`、`mmwx.users` 这些宿主接口由主控代为执行，权限和在主控里跑完全一样；
- Chrome 打开 `chrome://inspect` →「Open dedicated DevTools for Node」，或者 VS Code 附加到 9229 端口，就能在 `server.js` 里下断点、单步、看变量；
- 停在断点上的时候，主控那边的请求会等着（最长 2 分钟）；
- 改 `server.js` 会自动重启本机运行时并重新接上。

退出 `dev`（Ctrl+C），主控换回最后一次推送的版本。

:::caution
本机运行和主控里运行有一处差别：主控里异步处理函数的 Promise 必须立刻完成（宿主接口都是同步的，没有定时器），本机则可以真的等待。上线前不带 `--inspect` 再跑一遍。
:::

## 第 7 步：发布

```bash
npx mmwx-plugin deploy   # 生产构建(压缩、不带 sourcemap)并推送到主控
npx mmwx-plugin pack     # 打成插件包 my-plugin-0.1.0.zip
```

- 每次发布前把 `plugin.json` 里的 `version` 加一（[语义化版本](https://semver.org/lang/zh-CN/)）。
- 插件包可以在任何主控的「系统设置 → 插件 → 上传插件」安装。
- 自己写的插件是**未签名**的，别人安装时要点「信任」才会加载前端，面板会提示这一点。签名由官方完成：官方构建内置签名公钥，签过的插件不需要「信任」。

用完记得在面板里「结束开发」，或者等令牌 24 小时后自动过期。

## SDK 包含什么、怎么升级

`@mmwx/plugin-sdk` 一个包里有四样东西：

| 部分 | 用途 |
| --- | --- |
| `mmwx-plugin` 命令 | 新建、开发、构建、打包、推送、看日志（见下面的命令速查） |
| `@mmwx/plugin-sdk` | 前端用的 `definePlugin`、`ui.*`、`useApi`、`useT`、`toast` 等。打包时指到面板自带的那一份，插件包里不带它 |
| `@mmwx/plugin-sdk/server` | 后端 `server.js` 的类型定义，只给编辑器补全和检查用（`/// <reference types="@mmwx/plugin-sdk/server" />`） |
| 项目模板 | `create` 新建项目时用的模板 |

升级到最新版：

```bash
npm install -D @mmwx/plugin-sdk@latest
```

查看项目里装的版本：`npm ls @mmwx/plugin-sdk`。主控的插件系统加了新接口后，升级 SDK 才有对应的类型和命令。SDK 的问题和建议请到 [GitHub](https://github.com/mmwx-group/plugin-sdk/issues) 提。

## 命令速查

| 命令 | 作用 |
| --- | --- |
| `mmwx-plugin create <id> [目录]` | 新建插件项目 |
| `mmwx-plugin dev` | 开发：推送、反代面板、热更新、实时日志 |
| `mmwx-plugin dev --inspect[=端口]` | 同上，并把后端放在本机跑、可下断点 |
| `mmwx-plugin dev --no-proxy` | 不反代面板，只提供插件资源（配合「从本机加载前端」） |
| `mmwx-plugin dev --port 5175` | 换本机开发服务器的端口 |
| `mmwx-plugin build` | 生产构建前端 |
| `mmwx-plugin pack [-o 文件名]` | 构建并打包 |
| `mmwx-plugin deploy` | 构建、打包、推送 |
| `mmwx-plugin logs` | 只看实时日志 |
| `mmwx-plugin keygen -o <私钥文件>` | 生成签名密钥对 |
| `mmwx-plugin pack --key <私钥文件>` | 打包并用这把私钥签名 |

`keygen` / `pack --key` 生成的签名只对**自己编译**的主控有效（编译时把公钥注入 `PLUGIN_SIGN_PUB_KEYS`）。官方发布的主控只认官方签名，第三方插件在这些主控上仍是未签名的，安装后要点「信任」。

## 常见问题

**`npx @mmwx/plugin-sdk` 很慢或者装不上？**
国内网络可以先切到 npm 镜像再装：`npm config set registry https://registry.npmmirror.com`（想换回官方源：`npm config set registry https://registry.npmjs.org`）。刚发布的新版本，镜像同步可能会晚几分钟。

**插件启用了，但页面 / 卡片没出来？**
未签名的插件要在「系统设置 → 插件」点「信任」前端才会加载。另外确认页面、插槽在 `plugin.json` 里声明过。

**提示「开发令牌无效或已过期」？**
令牌 24 小时过期，或者有人点了「换新令牌」/「结束开发」。到开发者模式里重新生成。

**提示「端口 5174 被占用」？**
用 `--port` 换一个；用「从本机加载前端」时，面板里的地址也要跟着改。

**本机运行时连不上（隧道断开）？**
插件要先在面板里启用；如果刚加了权限，要先在面板确认。改好后保存任意文件会自动重连。

**面板被插件弄坏了，页面打不开？**
地址后面加 `?safe=1` 进入安全模式（本次会话不加载任何插件），加 `?safe=0` 恢复；或者在主控上设环境变量 `MMWX_DISABLE_PLUGINS=1` 后重启，整个关掉插件系统。
