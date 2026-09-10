# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

妙妙屋X（miaomiaowuX）**独立文档站** — 代理订阅 + Xray 多服务器管理系统的落地页与文档站点。由 miaomiaowu-docs 混合站复制而来,只保留妙妙屋X 内容,`/x` 路由前缀已去除(X 内容直接挂在根)。纯静态文档站,无后端/鉴权/API。部署 miaomiaowux.com。

## Commands

- `npm run dev` — 文档站 astro dev（`astro.config.docs.mjs`,默认 http://localhost:4321/docs）
- `npm run dev:landing` — 落地页 Vite 开发服务器。开发模式下所有文档链接经 `src/lib/docs-url.ts` 指向 astro dev(默认 `http://localhost:4321`,可用 `VITE_DOCS_DEV_ORIGIN` 覆盖),所以想在落地页点「文档」看到页面,要**同时**跑 `npm run dev`;生产构建里链接是相对路径 `/docs/...`
- `npm run build` — `build:landing`(搜索索引 → tsc → vite build → 注入 site.json)+ `build:docs`(astro build → 校验站内链接)
- `npm run check:docs` — 只跑站内链接校验(需先 build:docs)
- `npm run preview:docs` — 构建文档并用 astro preview 起本地预览。**文档站的 Pagefind 搜索只在构建产物里可用**,`npm run dev` 下搜索框会提示「搜索仅适用于生产版本」,要试搜索请用这个命令
- `npm run lint` / `npm run format` / `npm run knip`

## Architecture

站点是**两套独立构建拼在同一个 dist 里**,由 wrangler 以静态资产 + SPA fallback 部署:

- **落地页** `/` — React 19 + TanStack Router + Vite,`src/routes/index.tsx`(hero + 协议卡片 + 功能 + 快速导航)。`src/routeTree.gen.ts` 自动生成,**不要手动编辑**。落地页里所有指向 `/docs/*` 的链接都是普通 `<a href={docsUrl(...)}>` 整页跳转,不走 SPA 路由——文档不在 SPA 路由表里,用 `<Link>` 会落到 404;新增文档链接一律经 `docsUrl()`。
- **文档站** `/docs/*` — Astro **Starlight**,配置在 `astro.config.docs.mjs`(`base: "/docs"`,`outDir: dist/docs`)。内容是 `src/content/docs/*.md(x)`(中文,默认 locale)与 `src/content/docs/en/*.md(x)`(英文),侧栏在 astro 配置的 `sidebar` 里维护,两种语言共用同一份 slug。
  - mdx 页里的「在线演示」是 React island:`src/components/docs/islands/*.tsx` → `src/components/docs/*-demo.tsx`,用 `demo-shell.tsx` 挂 i18n(`xdocs` 命名空间)。
  - **配图必须放 `src/assets/screenshots/` 并用相对路径引用**(中文页 `../../assets/...`,英文页 `../../../assets/...`)。不要写 `/images/...`:astro dev 只在 `/docs/` 前缀下提供 `public/`,绝对路径会 404;线上能显示只是因为 vite 也把 `public/` 复制到了 dist 根。图片段落后面紧跟的普通段落即图注(`src/styles/starlight.css` 有对应样式)。
  - `public/images/screenshots/` 里的老截图只剩落地页在用。
  - 落地页 hero 与文档首页 hero 的「网格波纹」动画共用 `public/scripts/grid-wave.js`(Canvas 绘制,网格顶点随同心波位移;文档站经 astro 配置 `head` 注入,落地页由 `src/components/landing/grid-wave.tsx` 动态加载)。CSS 里的静态网格只是无 JS / 减少动效时的回退。

**i18n**: `src/i18n/`,命名空间 `common/layout/sidebar/landing/search/xdocs`,locales 在 `src/i18n/locales/{zh,en}`。`xdocs` 给 mdx 里的 React 演示用。

**搜索**: `scripts/generate-search-index.mjs` 扫 `src/content/docs`(中英合并)生成 `src/generated/search-index.ts`;`src/lib/search-data.ts` + `src/components/search/` 提供落地页命令面板搜索,选中后整页跳转到文档。

**站点配置**: `site.json`（品牌/域名/og）由 `scripts/inject-site-config.js` 注入 dist。

## Conventions

- 路径别名 `@/` → `src/`；UI 基础组件 `src/components/ui/`（shadcn 生成,ESLint/knip 忽略,勿手改）
- 暗色模式 `.dark` class；类型导入用 inline `import { type Foo }`
- 支持协议(权威顺序,见 `astro.config.docs.mjs` 的「协议参考」分组 + `src/content/docs/protocol-matrix.md`): VLESS / VMess / Trojan / Shadowsocks / Hysteria2 / AnyTLS / Snell
