import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

const docDirs = [
  { dir: path.join(rootDir, 'src/routes/docs'), section: 'docs' },
]

// ─── i18n locale loader ─────────────────────────────────────────────────────
function loadLocale(lang) {
  const localeDir = path.join(rootDir, `src/i18n/locales/${lang}`)
  if (!fs.existsSync(localeDir)) return {}
  const files = fs.readdirSync(localeDir).filter((f) => f.endsWith('.json'))
  const result = {}
  for (const f of files) {
    const ns = path.basename(f, '.json')
    try {
      result[ns] = JSON.parse(fs.readFileSync(path.join(localeDir, f), 'utf-8'))
    } catch {
      // ignore malformed
    }
  }
  return result
}

const zh = loadLocale('zh')
const en = loadLocale('en')

function getByPath(obj, dotted) {
  let cur = obj
  for (const seg of dotted.split('.')) {
    if (cur == null || typeof cur !== 'object') return undefined
    cur = cur[seg]
  }
  return typeof cur === 'string' ? cur : undefined
}

function resolveTKey(raw, defaultNs, locale) {
  let ns, key
  if (raw.includes(':')) {
    const i = raw.indexOf(':')
    ns = raw.slice(0, i)
    key = raw.slice(i + 1)
  } else {
    ns = defaultNs
    key = raw
  }
  const nsObj = locale[ns]
  if (!nsObj) return undefined
  return getByPath(nsObj, key)
}

// Collect every `t('...')` argument from the source.
function collectTCalls(content) {
  const out = []
  const re = /\bt\(\s*['"]([^'"]+)['"]/g
  let m
  while ((m = re.exec(content)) !== null) out.push(m[1])
  return out
}

function extractDefaultNs(content) {
  const m = content.match(/useTranslation\(\s*['"]([^'"]+)['"]/)
  return m ? m[1] : ''
}

// JSX 字面量、template literal、含中文/字母数字的 JSXText 节点 — 用于代码块、原文中文 attrs 等。
function extractLiterals(content) {
  const blocks = []
  // 模板字面量 {`...`} —— 代码块大多用这种
  const tplRe = /\{`([\s\S]*?)`\}/g
  let m
  while ((m = tplRe.exec(content)) !== null) blocks.push(m[1])
  // 字符串字面量 (含中文的)
  const strRe = /['"]([^'"\n]{2,})['"]/g
  while ((m = strRe.exec(content)) !== null) {
    if (/[一-鿿]/.test(m[1])) blocks.push(m[1])
  }
  // JSXText (粗略 — 标签之间纯文本)
  const txtRe = />\s*([^<>{}\n]+?)\s*</g
  while ((m = txtRe.exec(content)) !== null) {
    const t = m[1].trim()
    if (t && /[一-鿿 A-Za-z0-9]/.test(t)) blocks.push(t)
  }
  return blocks
}

function buildNgrams(text) {
  const tokens = []
  let i = 0
  while (i < text.length) {
    const ch = text[i]
    if (/[一-鿿]/.test(ch)) {
      if (i + 1 < text.length && /[一-鿿]/.test(text[i + 1])) {
        tokens.push(text.slice(i, i + 2))
      } else {
        tokens.push(ch)
      }
      i++
    } else if (/[A-Za-z0-9_]/.test(ch)) {
      let j = i
      while (j < text.length && /[A-Za-z0-9_]/.test(text[j])) j++
      tokens.push(text.slice(i, j))
      i = j
    } else {
      i++
    }
  }
  return tokens.join(' ')
}

function extractHref(content) {
  const m = content.match(/createFileRoute\(\s*['"]([^'"]+)['"]\s*\)/)
  return m ? m[1] : ''
}

function extractAttrTKey(content, attrName) {
  // title={t('foo.bar')} 或 title={t("foo.bar")}
  const re = new RegExp(`${attrName}\\s*=\\s*\\{\\s*t\\(\\s*['"]([^'"]+)['"]`)
  const m = content.match(re)
  return m ? m[1] : ''
}

function extractAttrLiteral(content, attrName) {
  const re = new RegExp(`(?:DocLayout|XDocLayout)\\s[^>]*?${attrName}\\s*=\\s*['"]([^'"]+)['"]`)
  const m = content.match(re)
  return m ? m[1] : ''
}

function normalize(text) {
  return text.replace(/\s+/g, ' ').trim()
}

function processFile(filePath, section) {
  const src = fs.readFileSync(filePath, 'utf-8')
  const href = extractHref(src)
  if (!href) return null

  const defaultNs = extractDefaultNs(src)
  const tKeys = collectTCalls(src)

  // 把 t() 调用回查到的字符串收集起来
  const zhFromT = []
  const enFromT = []
  for (const raw of tKeys) {
    const v = resolveTKey(raw, defaultNs, zh)
    if (v) zhFromT.push(v)
    const e = resolveTKey(raw, defaultNs, en)
    if (e) enFromT.push(e)
  }

  const literals = extractLiterals(src)

  // title / description:优先 t() 回查,fallback 字面量
  const titleKey = extractAttrTKey(src, 'title')
  const descKey = extractAttrTKey(src, 'description')
  const pageTitle =
    (titleKey && resolveTKey(titleKey, defaultNs, zh)) ||
    extractAttrLiteral(src, 'title') ||
    path.basename(filePath, '.tsx')
  const description =
    (descKey && resolveTKey(descKey, defaultNs, zh)) ||
    extractAttrLiteral(src, 'description') ||
    ''
  const pageTitleEn =
    (titleKey && resolveTKey(titleKey, defaultNs, en)) || ''
  const descriptionEn =
    (descKey && resolveTKey(descKey, defaultNs, en)) || ''

  const zhContent = normalize([...zhFromT, ...literals].join(' '))
  const enContent = normalize([pageTitleEn, descriptionEn, ...enFromT].join(' '))
  const content = normalize(zhContent + ' ' + enContent)
  const ngramContent = buildNgrams(zhContent)

  if (!pageTitle && !content) return null

  return {
    href,
    pageTitle,
    description,
    section,
    content,
    ngramContent,
    sections: [],
  }
}

const entries = []
for (const { dir, section } of docDirs) {
  if (!fs.existsSync(dir)) continue
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.tsx')).sort()
  for (const file of files) {
    const entry = processFile(path.join(dir, file), section)
    if (entry) entries.push(entry)
  }
}

const outputPath = path.join(rootDir, 'src/generated/search-index.ts')
const tsContent = `// Auto-generated by scripts/generate-search-index.mjs
// Do not edit manually

export type SearchEntry = {
  href: string
  pageTitle: string
  description: string
  section: 'docs' | 'x-docs'
  content: string
  ngramContent: string
  sections: Array<{ heading: string; text: string }>
}

export const searchIndex: SearchEntry[] = ${JSON.stringify(entries, null, 2)}
`

fs.mkdirSync(path.dirname(outputPath), { recursive: true })
fs.writeFileSync(outputPath, tsContent, 'utf-8')

console.log(`Generated search index: ${entries.length} pages indexed`)
for (const entry of entries) {
  console.log(
    `  ${entry.section.padEnd(6)} ${entry.href.padEnd(40)} ${entry.pageTitle.padEnd(24)} content=${entry.content.length} ngram=${entry.ngramContent.length}`
  )
}
