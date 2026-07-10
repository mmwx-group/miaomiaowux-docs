# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

妙妙屋X（miaomiaowuX）**独立文档站** — 代理订阅 + Xray 多服务器管理系统的落地页与文档站点。由 miaomiaowu-docs 混合站复制而来,只保留妙妙屋X 内容,`/x` 路由前缀已去除(X 内容直接挂在根)。纯静态文档站,无后端/鉴权/API。部署 miaomiaowux.com。

## Commands

- `npm run dev` — Vite 开发服务器（纯前端,无后端代理）
- `npm run build` — 生成搜索索引 → tsc → vite build → 注入 site.json 元数据 → 为每个文档路由生成 SSR-lite HTML
- `npm run build:only` — 仅构建(不生成 per-route HTML)
- `npm run lint` / `npm run format` / `npm run knip`

## Architecture

**技术栈**: React 19 + TypeScript + Vite 7 + Tailwind CSS 4 + shadcn/ui (new-york)。部署 Cloudflare（wrangler,SPA fallback）。

**路由**: TanStack Router 文件式路由,`src/routes/`,自动生成 `src/routeTree.gen.ts`（**不要手动编辑**,vite 插件在 dev/build 时重生成）。
- `/` — 落地页 `src/routes/index.tsx`（hero + 协议卡片 + 功能 + 对比 + 快速导航）
- `/docs` — 文档 layout `src/routes/docs.tsx`（`src/components/docs/x-doc-layout.tsx` + `x-doc-sidebar.tsx`）
- `/docs/*` — 52 个文档页 `src/routes/docs/*.tsx`（含 `protocol-*` 各协议专页）

**i18n**: `src/i18n/`,命名空间 `common/layout/sidebar/landing/search/xdocs`,locales 在 `src/i18n/locales/{zh,en}`。

**搜索**: `scripts/generate-search-index.mjs` 扫 `src/routes/docs` 生成 `src/generated/search-index.ts`；`src/lib/search-data.ts` + `src/components/search/` 提供命令面板搜索。

**站点配置**: `site.json`（品牌/域名/og）由 `scripts/inject-site-config.js` 注入 dist；`scripts/generate-route-html.mjs` 给每个文档路由生成带 `妙妙屋X` 品牌 title/og 的 `dist/{href}/index.html`。

## Conventions

- 路径别名 `@/` → `src/`；UI 基础组件 `src/components/ui/`（shadcn 生成,ESLint/knip 忽略,勿手改）
- 暗色模式 `.dark` class；类型导入用 inline `import { type Foo }`
- 支持协议(权威顺序,见 `src/components/docs/x-doc-sidebar.tsx` protocol-ref 分组 + `src/routes/docs/protocol-matrix.tsx`): VLESS / VMess / Trojan / Shadowsocks / Hysteria2 / AnyTLS / Snell
