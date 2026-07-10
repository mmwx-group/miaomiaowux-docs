// 给每个文档路由生成独立的 dist/{path}/index.html,head 里的 title / og / twitter meta
// 替换成路由特定值。Cloudflare Pages 静态资源优先返回 dist/{path}/index.html,所以:
//   - Telegram / Twitter / Slack 等爬虫拿到的是 path-specific HTML,卡片显示页面标题与摘要
//   - 浏览器访问也拿到这份 HTML,内含 SPA bundle 引用,React 接管后正常运行
//
// 数据来源:src/generated/search-index.ts(已由 generate-search-index.mjs 产出,含 href/pageTitle/description)
// 模板:dist/index.html(已被 inject-site-config 处理过)
// 时机:vite build → inject-site-config → 本脚本

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const distDir = path.join(rootDir, 'dist')

// 1) 读 search-index.ts,提取 JSON 数组(它本身是 JSON.stringify 的输出,合法 JSON)
const idxPath = path.join(rootDir, 'src/generated/search-index.ts')
if (!fs.existsSync(idxPath)) {
  console.error('search-index.ts 不存在,跳过路由 HTML 生成')
  process.exit(0)
}
const idxTxt = fs.readFileSync(idxPath, 'utf-8')
const m = idxTxt.match(/searchIndex:\s*SearchEntry\[\]\s*=\s*(\[[\s\S]+\])\s*$/)
if (!m) {
  console.error('search-index.ts 格式异常,无法解析')
  process.exit(0)
}
const entries = JSON.parse(m[1])

// 2) 读模板
const tmplPath = path.join(distDir, 'index.html')
if (!fs.existsSync(tmplPath)) {
  console.error('dist/index.html 不存在,先跑 vite build')
  process.exit(0)
}
const tmpl = fs.readFileSync(tmplPath, 'utf-8')

// 3) 读 site.json 拿 base URL
const siteCfg = JSON.parse(fs.readFileSync(path.join(rootDir, 'site.json'), 'utf-8'))
const baseUrl = siteCfg.url && siteCfg.url !== 'auto' ? siteCfg.url.replace(/\/$/, '') : ''
const siteName = siteCfg.name || ''

function escAttr(s) {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
function escHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

let count = 0
for (const entry of entries) {
  if (!entry.href || !entry.pageTitle) continue
  // 跳过根路径 / 和 /docs(它们是落地/文档首页,跟模板 index.html 重叠就不动)
  if (entry.href === '/' || entry.href === '/docs') continue

  // 独立妙妙屋X 文档站:品牌固定
  const brand = '妙妙屋X'
  const title = `${brand} - ${entry.pageTitle}`
  const description = (entry.description || siteName).slice(0, 200).trim() || siteName
  const fullUrl = baseUrl + entry.href

  let html = tmpl
    // <title>
    .replace(/<title>[^<]*<\/title>/, `<title>${escHtml(title)}</title>`)
    // <meta name="title">
    .replace(/<meta\s+name="title"\s+content="[^"]*"\s*\/?>/, `<meta name="title" content="${escAttr(title)}" />`)
    // <meta name="description"> (可能多行)
    .replace(/<meta\s+name="description"[^>]*\/?>/, `<meta name="description" content="${escAttr(description)}" />`)
    // og:url
    .replace(/<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/, `<meta property="og:url" content="${escAttr(fullUrl)}" />`)
    // og:title
    .replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${escAttr(title)}" />`)
    // og:description
    .replace(/<meta\s+property="og:description"[^>]*\/?>/, `<meta property="og:description" content="${escAttr(description)}" />`)
    // twitter:url
    .replace(/<meta\s+property="twitter:url"\s+content="[^"]*"\s*\/?>/, `<meta property="twitter:url" content="${escAttr(fullUrl)}" />`)
    // twitter:title
    .replace(/<meta\s+property="twitter:title"\s+content="[^"]*"\s*\/?>/, `<meta property="twitter:title" content="${escAttr(title)}" />`)
    // twitter:description
    .replace(/<meta\s+property="twitter:description"[^>]*\/?>/, `<meta property="twitter:description" content="${escAttr(description)}" />`)

  // 多行 description 的兜底:html 已被 inject-site-config 处理过,但内置模板里 description 是多行的
  // 上面正则 [^>]*?\/?> 已经能 match 单行;若 inject-site-config 把它压缩成单行,正则也命中。
  // 写入 dist/{href}/index.html
  const outDir = path.join(distDir, entry.href.replace(/^\//, ''))
  fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(path.join(outDir, 'index.html'), html)
  count++
}
console.log(`Generated ${count} per-route index.html for OG/Twitter meta`)
