import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { XDocLayout } from '@/components/docs/x-doc-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'
import {
  Sparkles,
  Shield,
  FileCode,
  Globe,
  Settings,
  Database,
  ChevronDown,
  ChevronUp,
  Filter,
  Layers,
  MapPin,
  Link2,
  RefreshCw,
  Upload,
  FileText,
  Zap,
  Lightbulb,
  Code,
  Pencil,
} from 'lucide-react'

export const Route = createFileRoute('/docs/templates')({
  component: TemplatesPage,
})

// V3 模板完整示例(取自 miaomiaowuX rule_templates/redirhost__v3.yaml,redir-host DNS 模式的生产模板)
const v3TemplateExample = `mode: rule
dns:
  enable: true
  enhanced-mode: redir-host
  nameserver:
    - https://8.8.8.8/dns-query/dns-query#🚀 节点选择
  direct-nameserver:
    - https://120.53.53.53/dns-query
  proxy-server-nameserver:
    - https://120.53.53.53/dns-query
  ipv6: false

proxies: null

proxy-groups:
  - name: 🚀 手动选择
    type: select
    include-all: true
    include-all-proxies: true
    include-all-providers: true
    proxies:
      - ♻️ 自动选择
      - __PROXY_PROVIDERS__
      - __PROXY_NODES__
      - 🌄 落地节点
  - name: ♻️ 自动选择
    type: url-test
    include-all: true
    proxies:
      - __PROXY_PROVIDERS__
      - __PROXY_NODES__
    url: https://cp.cloudflare.com/generate_204
    interval: 300
    tolerance: 50
  - name: 🌠 中转节点
    type: select
    include-all: true
    filter: 中转|CO|co
    proxies:
      - __PROXY_PROVIDERS__
      - __PROXY_NODES__
  - name: 🌄 落地节点
    type: select
    include-all: true
    filter: LD|落地|Bage|bage|jinx|ctc|Jinx|JINX|CTC|Luodi|luodi|LUODI
    proxies:
      - __PROXY_PROVIDERS__
      - __PROXY_NODES__
    dialer-proxy-group: 🌠 中转节点
  - name: 🚀 GitHub
    type: select
    include-all: true
    proxies:
      - 🚀 手动选择
      - ♻️ 自动选择
      - 🎯 全球直连
  - name: 🎯 全球直连
    type: select
    proxies:
      - DIRECT
  - name: 🐟 漏网之鱼
    type: select
    include-all: true
    proxies:
      - 🚀 手动选择
      - ♻️ 自动选择
      - 🎯 全球直连

rules:
  - GEOSITE,private,🎯 全球直连
  - GEOIP,private,🎯 全球直连,no-resolve
  - GEOSITE,github,🚀 GitHub
  - GEOSITE,cn,🎯 全球直连
  - GEOIP,cn,🎯 全球直连,no-resolve
  - MATCH,🐟 漏网之鱼
`

// 每个属性单独的 YAML 示例片段(直接从生产模板 redirhost__v3.yaml 抽出)
const attrExamples: Record<string, string> = {
  name: `proxy-groups:
  - name: 🚀 手动选择        # 代理组名称,客户端 UI 上显示的就是这个
    type: select
`,
  type: `# 5 种类型示例
proxy-groups:
  - name: 🚀 手动选择
    type: select              # 手动选,客户端展示节点列表让用户挑

  - name: ♻️ 自动选择
    type: url-test            # 自动选延迟最低的节点
    url: https://cp.cloudflare.com/generate_204
    interval: 300

  - name: 🛡️ 故障转移
    type: fallback            # 按顺序优先,主节点挂掉切下一个

  - name: ⚖️ 负载均衡
    type: load-balance        # 流量按算法分配到多个节点
    strategy: round-robin

  - name: 🌌 中转入口
    type: select              # relay 链式代理走 dialer-proxy-group
`,
  proxies: `proxy-groups:
  - name: 🚀 手动选择
    type: select
    include-all: true
    proxies:
      - ♻️ 自动选择            # 引用其他代理组
      - __PROXY_PROVIDERS__   # 占位符:展开成所有 proxy-providers
      - __PROXY_NODES__       # 占位符:展开成节点表里所有节点
      - 🌄 落地节点
      - DIRECT                # 系统出站:直连
      - REJECT                # 系统出站:阻断
`,
  includeAll: `proxy-groups:
  - name: 🚀 手动选择
    type: select
    include-all: true         # 引入所有出站节点 + 所有代理集合(等同两个开关)
    proxies:
      - __PROXY_NODES__
      - __PROXY_PROVIDERS__
`,
  includeAllProxies: `proxy-groups:
  - name: 🚀 只要节点
    type: select
    include-all-proxies: true # 只引入节点表里的节点,不引入外部 provider
    proxies:
      - __PROXY_NODES__
`,
  includeAllProviders: `proxy-groups:
  - name: 🚀 只要 Provider
    type: select
    include-all-providers: true   # 只引入外部 proxy-providers,不要节点表
    proxies:
      - __PROXY_PROVIDERS__
`,
  includeType: `proxy-groups:
  - name: 🚀 VLESS 专属
    type: select
    include-all: true
    include-type: 'vless|vmess'   # 仅 VLESS 和 VMess 协议节点会进来(| 分隔多协议)
    proxies:
      - __PROXY_NODES__
`,
  excludeType: `proxy-groups:
  - name: 🚀 不要 SS
    type: select
    include-all: true
    exclude-type: 'ss|hysteria'   # 排除 SS 和 Hysteria 协议节点
    proxies:
      - __PROXY_NODES__
`,
  filter: `proxy-groups:
  - name: 🌠 中转节点
    type: select
    include-all: true
    filter: 中转|CO|co            # 正则匹配节点名,含「中转」「CO」「co」的进来
    proxies:
      - __PROXY_PROVIDERS__
      - __PROXY_NODES__

  - name: 🌄 落地节点
    type: select
    include-all: true
    filter: LD|落地|Bage|bage|jinx|ctc   # 多关键词正则,任一匹配即引入
`,
  excludeFilter: `proxy-groups:
  - name: 🚀 可用节点
    type: select
    include-all: true
    exclude-filter: 测试|TEST|故障|失效|DEAD    # 这些关键词的节点全跳过
    proxies:
      - __PROXY_NODES__
`,
  url: `proxy-groups:
  - name: ♻️ 自动选择
    type: url-test
    include-all: true
    url: https://cp.cloudflare.com/generate_204  # 测速 URL,默认即此值
    interval: 300
    tolerance: 50
`,
  interval: `proxy-groups:
  - name: ♻️ 自动选择
    type: url-test
    include-all: true
    url: https://cp.cloudflare.com/generate_204
    interval: 300                                # 测速间隔(秒),默认 300
`,
  tolerance: `proxy-groups:
  - name: ♻️ 自动选择
    type: url-test
    include-all: true
    url: https://cp.cloudflare.com/generate_204
    interval: 300
    tolerance: 50                                # 容差(毫秒),新节点比当前快超过 50ms 才切换
`,
  dialerProxyGroup: `proxy-groups:
  - name: 🌠 中转节点
    type: select
    include-all: true
    filter: 中转|CO|co

  - name: 🌄 落地节点
    type: select
    include-all: true
    filter: LD|落地|Bage|bage
    proxies:
      - __PROXY_PROVIDERS__
      - __PROXY_NODES__
    dialer-proxy-group: 🌠 中转节点           # 链式代理:本组流量先经中转节点选中的出口
`,
  hidden: `proxy-groups:
  - name: 🔒 内部桥接
    type: select
    hidden: true                                 # 客户端 UI 隐藏该组(规则可引用但不在选择列表显示)
    proxies:
      - DIRECT
`,
  icon: `proxy-groups:
  - name: 🚀 手动选择
    type: select
    icon: https://example.com/icons/proxy.png   # 客户端展示用的图标(可 emoji 直接写在 name 里或独立 URL)
    proxies:
      - __PROXY_NODES__
`,
}

function CollapsibleCode({ title, code, language, defaultExpanded = false }: { title: string; code: string; language: string; defaultExpanded?: boolean }) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <div className='border rounded-lg overflow-hidden'>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className='w-full flex items-center justify-between p-3 bg-muted/50 hover:bg-muted/70 transition-colors text-left'
      >
        <span className='font-medium text-sm'>{title}</span>
        {isExpanded ? <ChevronUp className='size-4' /> : <ChevronDown className='size-4' />}
      </button>
      {isExpanded && (
        <div className='max-h-96 overflow-auto'>
          <pre className='p-4 text-xs bg-muted/30 overflow-x-auto'>
            <code className={`language-${language}`}>{code}</code>
          </pre>
        </div>
      )}
    </div>
  )
}

function TemplatesPage() {
  const { t } = useTranslation('docs') // 复用 mmwx 主端文档的 templatesV3.* keys
  const { t: tx } = useTranslation('xdocs') // mmwX 自有标题 + 属性示例的文案

  return (
    <XDocLayout
      title={tx('templates.title')}
      description={tx('templates.description')}
    >
      {/* 前置条件 */}
      <section className='mb-8'>
        <Card className='border-primary/20 bg-primary/5'>
          <CardContent className='pt-6'>
            <div className='flex items-start gap-3'>
              <Settings className='size-5 text-primary mt-0.5' />
              <div className='text-sm'>
                <p className='font-semibold mb-1'>{t('templatesV3.prerequisite.heading')}</p>
                <p className='text-muted-foreground'>{t('templatesV3.prerequisite.text')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 介绍 */}
      <section className='mb-8'>
        <Card>
          <CardContent className='pt-6'>
            <p className='text-muted-foreground'>{t('templatesV3.intro')}</p>
            <div className='flex flex-wrap gap-2 mt-4'>
              <Badge variant='secondary'><Globe className='size-3 mr-1' />{t('templatesV3.badges.adminOnly')}</Badge>
              <Badge variant='secondary'><Sparkles className='size-3 mr-1' />{t('templatesV3.badges.mihomoCompat')}</Badge>
              <Badge variant='secondary'><Pencil className='size-3 mr-1' />{t('templatesV3.badges.visualEdit')}</Badge>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 核心概念 */}
      <section className='mb-8'>
        <h2 className='text-xl font-bold mb-4 flex items-center gap-2'>
          <Sparkles className='size-5 text-primary' />
          {t('templatesV3.coreConcepts.heading')}
        </h2>
        <Card>
          <CardContent className='pt-6'>
            <p className='text-muted-foreground mb-4'>{t('templatesV3.coreConcepts.desc')}</p>
            <div className='grid gap-4 md:grid-cols-2'>
              <div className='bg-primary/5 rounded-lg p-4 border border-primary/20'>
                <h4 className='font-semibold text-sm mb-2'>{t('templatesV3.coreConcepts.includeTitle')}</h4>
                <ul className='text-xs text-muted-foreground space-y-1'>
                  <li>• <code className='bg-muted px-1 rounded'>include-all</code> - {t('templatesV3.coreConcepts.includeAll')}</li>
                  <li>• <code className='bg-muted px-1 rounded'>include-all-proxies</code> - {t('templatesV3.coreConcepts.includeAllProxies')}</li>
                  <li>• <code className='bg-muted px-1 rounded'>include-all-providers</code> - {t('templatesV3.coreConcepts.includeAllProviders')}</li>
                  <li>• <code className='bg-muted px-1 rounded'>include-type</code> - {t('templatesV3.coreConcepts.includeType')}</li>
                </ul>
              </div>
              <div className='bg-primary/5 rounded-lg p-4 border border-primary/20'>
                <h4 className='font-semibold text-sm mb-2'>{t('templatesV3.coreConcepts.filterTitle')}</h4>
                <ul className='text-xs text-muted-foreground space-y-1'>
                  <li>• <code className='bg-muted px-1 rounded'>filter</code> - {t('templatesV3.coreConcepts.filter')}</li>
                  <li>• <code className='bg-muted px-1 rounded'>exclude-filter</code> - {t('templatesV3.coreConcepts.excludeFilter')}</li>
                  <li>• <code className='bg-muted px-1 rounded'>exclude-type</code> - {t('templatesV3.coreConcepts.excludeType')}</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 代理组配置属性 + 实例(本文档新增) */}
      <section className='mb-8'>
        <h2 className='text-xl font-bold mb-4 flex items-center gap-2'>
          <Code className='size-5 text-primary' />
          {tx('templates.attrExamples.heading')}
        </h2>
        <Card>
          <CardContent className='pt-6'>
            <p className='text-muted-foreground mb-6'>{tx('templates.attrExamples.desc')}</p>
            <div className='space-y-4'>
              {[
                { key: 'name', icon: FileText, color: 'text-blue-500', codeKey: 'name' },
                { key: 'type', icon: Layers, color: 'text-purple-500', codeKey: 'type' },
                { key: 'proxies', icon: Database, color: 'text-emerald-500', codeKey: 'proxies' },
                { key: 'includeAll', icon: Globe, color: 'text-green-500', codeKey: 'includeAll' },
                { key: 'includeAllProxies', icon: Globe, color: 'text-green-500', codeKey: 'includeAllProxies' },
                { key: 'includeAllProviders', icon: Globe, color: 'text-green-500', codeKey: 'includeAllProviders' },
                { key: 'includeType', icon: Filter, color: 'text-cyan-500', codeKey: 'includeType' },
                { key: 'excludeType', icon: Filter, color: 'text-orange-500', codeKey: 'excludeType' },
                { key: 'filter', icon: Filter, color: 'text-cyan-500', codeKey: 'filter' },
                { key: 'excludeFilter', icon: Filter, color: 'text-orange-500', codeKey: 'excludeFilter' },
                { key: 'url', icon: Zap, color: 'text-yellow-500', codeKey: 'url' },
                { key: 'interval', icon: RefreshCw, color: 'text-yellow-500', codeKey: 'interval' },
                { key: 'tolerance', icon: Zap, color: 'text-yellow-500', codeKey: 'tolerance' },
                { key: 'dialerProxyGroup', icon: Link2, color: 'text-indigo-500', codeKey: 'dialerProxyGroup' },
                { key: 'hidden', icon: Shield, color: 'text-gray-500', codeKey: 'hidden' },
                { key: 'icon', icon: MapPin, color: 'text-pink-500', codeKey: 'icon' },
              ].map((attr) => {
                const Icon = attr.icon
                return (
                  <div key={attr.key} className='border rounded-lg p-4'>
                    <div className='flex items-center gap-2 mb-2'>
                      <Icon className={`size-4 ${attr.color}`} />
                      <code className='font-mono font-semibold text-sm bg-muted px-2 py-0.5 rounded'>
                        {tx(`templates.attrExamples.${attr.key}.name`)}
                      </code>
                    </div>
                    <p className='text-xs text-muted-foreground mb-3'>{tx(`templates.attrExamples.${attr.key}.desc`)}</p>
                    <CollapsibleCode
                      title={tx('templates.attrExamples.viewExample')}
                      code={attrExamples[attr.codeKey]}
                      language='yaml'
                    />
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 节点类型 */}
      <section className='mb-8'>
        <h2 className='text-xl font-bold mb-4 flex items-center gap-2'>
          <Layers className='size-5 text-primary' />
          {t('templatesV3.nodeTypes.heading')}
        </h2>
        <Card>
          <CardContent className='pt-6'>
            <p className='text-muted-foreground mb-4'>{t('templatesV3.nodeTypes.desc')}</p>
            <div className='flex flex-wrap gap-2'>
              {['vless', 'vmess', 'trojan', 'ss', 'shadowsocks', 'hysteria', 'hysteria2', 'tuic', 'wireguard', 'anytls', 'socks5', 'http'].map((type) => (
                <Badge key={type} variant='outline' className='font-mono'>{type}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 区域代理组 */}
      <section className='mb-8'>
        <h2 className='text-xl font-bold mb-4 flex items-center gap-2'>
          <MapPin className='size-5 text-primary' />
          {t('templatesV3.regionGroups.heading')}
        </h2>
        <Card>
          <CardContent className='pt-6'>
            <p className='text-muted-foreground mb-3'>{t('templatesV3.regionGroups.desc')}</p>
            <ul className='text-xs text-muted-foreground space-y-1.5 ml-4'>
              <li>• {t('templatesV3.regionGroups.usage1')}</li>
              <li>• {t('templatesV3.regionGroups.usage2')}</li>
              <li>• {t('templatesV3.regionGroups.usage3')}</li>
              <li>• {t('templatesV3.regionGroups.usage4')}</li>
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* 模板创建方式 */}
      <section className='mb-8'>
        <h2 className='text-xl font-bold mb-4 flex items-center gap-2'>
          <Upload className='size-5 text-primary' />
          {t('templatesV3.createMethods.heading')}
        </h2>
        <Card>
          <CardContent className='pt-6'>
            <div className='grid gap-4 md:grid-cols-2'>
              <div className='bg-muted/30 rounded-lg p-4'>
                <h4 className='font-semibold text-sm mb-2 flex items-center gap-2'><Upload className='size-4' />{t('templatesV3.createMethods.uploadTitle')}</h4>
                <p className='text-xs text-muted-foreground'>{t('templatesV3.createMethods.uploadDesc')}</p>
              </div>
              <div className='bg-muted/30 rounded-lg p-4'>
                <h4 className='font-semibold text-sm mb-2 flex items-center gap-2'><FileText className='size-4' />{t('templatesV3.createMethods.pasteTitle')}</h4>
                <p className='text-xs text-muted-foreground'>{t('templatesV3.createMethods.pasteDesc')}</p>
              </div>
              <div className='bg-muted/30 rounded-lg p-4 md:col-span-2'>
                <h4 className='font-semibold text-sm mb-2 flex items-center gap-2'><RefreshCw className='size-4' />{t('templatesV3.createMethods.convertTitle')}</h4>
                <p className='text-xs text-muted-foreground'>{t('templatesV3.createMethods.convertDesc')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 订阅绑定 */}
      <section className='mb-8'>
        <h2 className='text-xl font-bold mb-4 flex items-center gap-2'>
          <Link2 className='size-5 text-primary' />
          {t('templatesV3.subBinding.heading')}
        </h2>
        <Card>
          <CardContent className='pt-6'>
            <p className='text-muted-foreground mb-4'>{t('templatesV3.subBinding.desc')}</p>
            <div className='space-y-4'>
              <div className='bg-green-500/10 rounded-lg p-4 border border-green-500/20'>
                <h4 className='font-semibold text-sm mb-2 text-green-600'>{t('templatesV3.subBinding.flowTitle')}</h4>
                <ol className='space-y-2 text-sm'>
                  <li className='flex gap-3'>
                    <span className='flex-shrink-0 size-5 rounded-full bg-green-500/20 text-green-600 flex items-center justify-center text-xs font-semibold'>1</span>
                    <span className='text-muted-foreground'>{t('templatesV3.subBinding.flow1')}</span>
                  </li>
                  <li className='flex gap-3'>
                    <span className='flex-shrink-0 size-5 rounded-full bg-green-500/20 text-green-600 flex items-center justify-center text-xs font-semibold'>2</span>
                    <span className='text-muted-foreground'>{t('templatesV3.subBinding.flow2')}</span>
                  </li>
                  <li className='flex gap-3'>
                    <span className='flex-shrink-0 size-5 rounded-full bg-green-500/20 text-green-600 flex items-center justify-center text-xs font-semibold'>3</span>
                    <span className='text-muted-foreground'>{t('templatesV3.subBinding.flow3')}</span>
                  </li>
                </ol>
              </div>
              <div className='bg-primary/5 rounded-lg p-4 border border-primary/20'>
                <h4 className='font-semibold text-sm mb-2'>{t('templatesV3.subBinding.autoUpdateTitle')}</h4>
                <ul className='text-xs text-muted-foreground space-y-1'>
                  <li>• {t('templatesV3.subBinding.autoUpdate1')}</li>
                  <li>• {t('templatesV3.subBinding.autoUpdate2')}</li>
                  <li>• {t('templatesV3.subBinding.autoUpdate3')}</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 常见使用场景 */}
      <section className='mb-8'>
        <h2 className='text-xl font-bold mb-4 flex items-center gap-2'>
          <Lightbulb className='size-5 text-primary' />
          {t('templatesV3.commonScenarios.heading')}
        </h2>
        <Card>
          <CardContent className='pt-6'>
            <p className='text-muted-foreground mb-6'>{t('templatesV3.commonScenarios.desc')}</p>
            <div className='space-y-4'>
              {['s1', 's2', 's3', 's4', 's5'].map((s) => (
                <div key={s} className='border-l-4 border-primary/40 pl-4 py-1'>
                  <h4 className='font-semibold text-sm mb-3'>{t(`templatesV3.commonScenarios.${s}Title`)}</h4>
                  <div className='space-y-1.5 text-xs'>
                    <div><span className='font-semibold text-primary'>{t('templatesV3.commonScenarios.scenarioGoal')}:</span> <span className='text-muted-foreground'>{t(`templatesV3.commonScenarios.${s}Goal`)}</span></div>
                    <div><span className='font-semibold text-primary'>{t('templatesV3.commonScenarios.scenarioConfig')}:</span> <span className='text-muted-foreground'>{t(`templatesV3.commonScenarios.${s}Config`)}</span></div>
                    <div><span className='font-semibold text-primary'>{t('templatesV3.commonScenarios.scenarioEffect')}:</span> <span className='text-muted-foreground'>{t(`templatesV3.commonScenarios.${s}Effect`)}</span></div>
                  </div>
                </div>
              ))}
            </div>
            <div className='mt-6 bg-primary/5 rounded-lg p-4 border border-primary/20'>
              <h4 className='font-semibold text-sm mb-2 flex items-center gap-2'>
                <Sparkles className='size-4 text-primary' />
                {t('templatesV3.commonScenarios.tipsTitle')}
              </h4>
              <ul className='text-xs text-muted-foreground space-y-1.5'>
                <li>• {t('templatesV3.commonScenarios.tip1')}</li>
                <li>• {t('templatesV3.commonScenarios.tip2')}</li>
                <li>• {t('templatesV3.commonScenarios.tip3')}</li>
                <li>• {t('templatesV3.commonScenarios.tip4')}</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 完整模板示例 */}
      <section className='mb-8'>
        <h2 className='text-xl font-bold mb-4 flex items-center gap-2'>
          <FileCode className='size-5 text-primary' />
          {t('templatesV3.fullExample.heading')}
        </h2>
        <Card>
          <CardContent className='pt-6'>
            <p className='text-xs text-muted-foreground mb-3'>{tx('templates.fullExampleNote')}</p>
            <CollapsibleCode
              title={t('templatesV3.fullExample.title')}
              code={v3TemplateExample}
              language='yaml'
            />
          </CardContent>
        </Card>
      </section>

      {/* 注意事项 */}
      <section className='mb-8'>
        <h2 className='text-xl font-bold mb-4 flex items-center gap-2'>
          <Shield className='size-5 text-orange-500' />
          {t('templatesV3.notes.heading')}
        </h2>
        <Card className='border-orange-500/20'>
          <CardContent className='pt-6'>
            <ul className='space-y-2 text-sm text-muted-foreground'>
              {['format', 'filterRule', 'regex', 'order', 'emptyGroup', 'binding'].map((k) => (
                <li key={k} className='flex items-start gap-2'>
                  <span className='text-orange-500 mt-1'>⚠</span>
                  <span><strong>{t(`templatesV3.notes.${k}Title`)}</strong>{t(`templatesV3.notes.${k}Desc`)}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>
    </XDocLayout>
  )
}

