// 文档站由 astro 独立构建到 dist/docs,不在落地页的 SPA 路由表里,所有 /docs/* 链接都必须整页跳转。
// 生产环境两者在同一个域名下,直接用相对路径;本地开发时 astro dev 跑在另一个端口(默认 4321),
// 这里把链接指过去,让 `npm run dev:landing` 点「文档」也能打开真实的 Starlight 页面。
const DEV_DOCS_ORIGIN =
  (import.meta.env.VITE_DOCS_DEV_ORIGIN as string | undefined) ?? 'http://localhost:4321'

export function docsUrl(path: string): string {
  if (!import.meta.env.DEV) return path
  return DEV_DOCS_ORIGIN.replace(/\/$/, '') + path
}
