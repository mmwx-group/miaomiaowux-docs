import { Link } from '@tanstack/react-router'
import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ThemeSwitch } from '@/components/theme-switch'
import { LanguageSwitch } from '@/components/language-switch'
import { AnimatedX } from '@/components/animated-x'
import { TrafficDemo } from '@/components/landing/traffic-demo'
import { useTranslation } from 'react-i18next'
import {
  Server,
  Shield,
  Network,
  Zap,
  BookOpen,
  ArrowRight,
  Globe,
  Lock,
  Activity,
  Users,
  ChevronDown,
  Github,
  Send,
  Sparkles,
  FileText,
  ShoppingCart,
} from 'lucide-react'

export const Route = createFileRoute('/')({
  component: XHomePage,
})

const featureDefs = [
  { icon: Globe, key: 'remoteServer' },
  { icon: Network, key: 'xrayInbound' },
  { icon: Shield, key: 'reality' },
  { icon: Lock, key: 'certificates' },
  { icon: Activity, key: 'trafficMonitor' },
  { icon: Users, key: 'userPackage' },
  { icon: Globe, key: 'multiFormat' },
  { icon: Zap, key: 'autoSync' },
]

const comparisonKeys = [
  { key: 'subscriptionMgmt', mmw: true, mmwx: true },
  { key: 'multiClient', mmw: true, mmwx: true },
  { key: 'trafficProbe', mmw: true, mmwx: true },
  { key: 'customRulesTemplates', mmw: true, mmwx: true },
  { key: 'remoteServer', mmw: false, mmwx: true },
  { key: 'xrayInOut', mmw: false, mmwx: true },
  { key: 'acmeCert', mmw: false, mmwx: true },
  { key: 'connectivityTest', mmw: false, mmwx: true },
]

const quickLinkDefs = [
  { key: 'quickStart', href: '/docs/quick-start', icon: Zap },
  { key: 'install', href: '/docs/install-docker', icon: Server },
  { key: 'protocols', href: '/docs/protocol-matrix', icon: Network },
  { key: 'fullDocs', href: '/docs', icon: BookOpen },
]

// 当前支持的入站协议(权威顺序参照 x-doc-sidebar 的 protocol-ref 分组);各卡链到对应协议文档专页。
const protocolDefs = [
  { key: 'vless', name: 'VLESS', href: '/docs/protocol-vless', icon: Shield, color: 'text-purple-500' },
  { key: 'vmess', name: 'VMess', href: '/docs/protocol-vmess', icon: Lock, color: 'text-blue-500' },
  { key: 'trojan', name: 'Trojan', href: '/docs/protocol-trojan', icon: Activity, color: 'text-red-500' },
  { key: 'shadowsocks', name: 'Shadowsocks', href: '/docs/protocol-shadowsocks', icon: Network, color: 'text-green-500' },
  { key: 'hysteria2', name: 'Hysteria2', href: '/docs/protocol-hysteria2', icon: Zap, color: 'text-indigo-500' },
  { key: 'anytls', name: 'AnyTLS', href: '/docs/protocol-anytls', icon: Globe, color: 'text-teal-500', badge: 'NEW' },
  { key: 'snell', name: 'Snell', href: '/docs/protocol-snell', icon: Server, color: 'text-lime-500', badge: 'NEW' },
]

function ScreenshotCard({ src, srcs, title, desc, srcAlts }: {
  src?: string
  srcs?: string[]      // 多张并排(MiniApp 管理员 + 用户视图一卡显示)
  title: string
  desc: string
  srcAlts?: string[]
}) {
  return (
    <div className="pixel-card overflow-hidden group flex flex-col">
      <div className="bg-muted/40 border-b">
        {srcs && srcs.length > 0 ? (
          <div className={`grid gap-1 p-2`} style={{ gridTemplateColumns: `repeat(${srcs.length}, minmax(0, 1fr))` }}>
            {srcs.map((s, i) => (
              <img
                key={s}
                src={s}
                alt={srcAlts?.[i] ?? title}
                loading="lazy"
                className="w-full h-auto object-contain transition-transform duration-500 group-hover:scale-[1.01]"
              />
            ))}
          </div>
        ) : (
          <img
            src={src}
            alt={title}
            loading="lazy"
            className="w-full h-auto transition-transform duration-500 group-hover:scale-[1.02]"
          />
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-base mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </div>
    </div>
  )
}

function XHomePage() {
  const { t } = useTranslation('landing')

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-[color:rgba(241,140,110,0.22)] bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <img
              src="/images/logo.webp"
              alt={t('xHome.logoAlt')}
              className="h-10 w-10 border-2 border-[color:rgba(241,140,110,0.4)] shadow-[4px_4px_0_rgba(0,0,0,0.2)]"
            />
            <span className="pixel-text text-base">
              <span className="text-primary">{t('common:brand')}</span>
              <AnimatedX size="sm" className="ml-1" />
            </span>
          </div>
          <nav className="flex items-center gap-2 sm:gap-4">
            <Link
              to="/docs/tutorial"
              className="pixel-button inline-flex items-center gap-2 px-3 py-2 h-9 text-sm font-semibold uppercase tracking-widest bg-background/75 text-foreground border-[color:rgba(137,110,96,0.45)] hover:bg-accent/35 hover:text-accent-foreground transition-all"
            >
              <BookOpen className="size-4" />
              <span className="hidden sm:inline">{t('xHome.navDocs')}</span>
            </Link>
            <Link
              to="/docs/changelog"
              className="pixel-button inline-flex items-center gap-2 px-3 py-2 h-9 text-sm font-semibold uppercase tracking-widest bg-background/75 text-foreground border-[color:rgba(137,110,96,0.45)] hover:bg-accent/35 hover:text-accent-foreground transition-all"
            >
              <FileText className="size-4" />
              <span className="hidden sm:inline">{t('xHome.navChangelog')}</span>
            </Link>
            <a
              href="https://license.miaomiaowux.com/pricing"
              target="_blank"
              rel="noopener noreferrer"
              className="pixel-button inline-flex items-center gap-2 px-3 py-2 h-9 text-sm font-semibold uppercase tracking-widest bg-primary/90 text-primary-foreground border-[color:rgba(137,110,96,0.45)] hover:bg-primary transition-all"
            >
              <ShoppingCart className="size-4" />
              <span className="hidden sm:inline">{t('xHome.navPricing')}</span>
            </a>
            <a
              href="https://github.com/iluobei/miaomiaowu"
              target="_blank"
              rel="noopener noreferrer"
              className="pixel-button inline-flex items-center gap-2 px-3 py-2 h-9 text-sm font-semibold uppercase tracking-widest bg-background/75 text-foreground border-[color:rgba(137,110,96,0.45)] hover:bg-accent/35 hover:text-accent-foreground transition-all"
            >
              <Github className="size-4" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
            <a
              href="https://t.me/miaomiaowux"
              target="_blank"
              rel="noopener noreferrer"
              className="pixel-button inline-flex items-center justify-center h-9 w-9 px-2 py-2 bg-background/75 text-foreground border-[color:rgba(137,110,96,0.45)] hover:bg-accent/35 transition-all"
              aria-label="Telegram"
            >
              <Send className="size-4" />
            </a>
            <LanguageSwitch />
            <ThemeSwitch />
          </nav>
        </div>
      </header>

      <section className="relative min-h-[80vh] flex items-center justify-center px-4 sm:px-6 py-12 sm:py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Sparkles className="size-4" />
            {t('xHome.advancedBadge')}
          </div>

          <h1 className="pixel-text text-4xl sm:text-5xl md:text-6xl font-bold mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            <span className="text-primary">{t('common:brand')}</span>
            <AnimatedX size="lg" className="ml-2" />
          </h1>

          <p className="text-xl sm:text-2xl md:text-3xl text-foreground/90 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            {t('xHome.slogan')}
          </p>

          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            {t('xHome.description')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400">
            <Link to="/docs/quick-start">
              <Button size="lg" className="pixel-button w-full sm:w-auto px-8 py-6 text-lg font-semibold">
                <Zap className="size-5 mr-2" />
                {t('xHome.quickStart')}
              </Button>
            </Link>
            <Link to="/docs">
              <Button variant="outline" size="lg" className="pixel-button w-full sm:w-auto px-8 py-6 text-lg font-semibold">
                <BookOpen className="size-5 mr-2" />
                {t('xHome.viewDocs')}
              </Button>
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
            <div className="pixel-card p-4 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-primary">19</div>
              <div className="text-sm text-muted-foreground">{t('xHome.stats.protocolCombos')}</div>
            </div>
            <div className="pixel-card p-4 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-primary">7</div>
              <div className="text-sm text-muted-foreground">{t('xHome.stats.protocols')}</div>
            </div>
            <div className="pixel-card p-4 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-primary">12+</div>
              <div className="text-sm text-muted-foreground">{t('xHome.stats.clientFormats')}</div>
            </div>
            <div className="pixel-card p-4 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-primary">4</div>
              <div className="text-sm text-muted-foreground">{t('xHome.stats.connectionModes')}</div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <ChevronDown className="size-6 text-primary" />
          <ChevronDown className="size-6 text-primary/60 -mt-4" />
        </div>
      </section>

      {/* 支持的协议:7 种入站协议卡片,点进各协议文档专页 */}
      <section className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="pixel-text text-3xl sm:text-4xl font-bold text-primary mb-4">{t('xHome.protocols.heading')}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t('xHome.protocols.description')}</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {protocolDefs.map((p) => (
              <Link key={p.key} to={p.href}>
                <Card className="pixel-card group hover:scale-[1.02] hover:shadow-[6px_6px_0_rgba(217,119,87,0.25)] transition-all duration-300 h-full cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 pixel-border flex items-center justify-center bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <p.icon className={`size-6 ${p.color}`} />
                      </div>
                      {p.badge && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-primary/15 text-primary">
                          {p.badge}
                        </span>
                      )}
                    </div>
                    <CardTitle className="text-lg mt-3 flex items-center gap-2">
                      {p.name}
                      <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm leading-relaxed">
                      {t(`xHome.protocols.items.${p.key}`)}
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 实时演示:流量信息 mock(网速跳动 + 用户/节点/服务器三维度 + 下钻 Dialog) */}
      <TrafficDemo />

      {/* 功能截图墙:展示几个核心功能的实际 UI 截图 */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="pixel-text text-3xl sm:text-4xl font-bold text-primary mb-3">
              {t('xHome.screenshotsWall.heading')}
            </h2>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">
              {t('xHome.screenshotsWall.description')}
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
            <ScreenshotCard
              src="/images/screenshots/tutorial-step8-nodes-list.webp"
              title={t('xHome.screenshotsWall.nodes.title')}
              desc={t('xHome.screenshotsWall.nodes.desc')}
            />
            <ScreenshotCard
              src="/images/screenshots/doc-xray-servers-page.webp"
              title={t('xHome.screenshotsWall.servers.title')}
              desc={t('xHome.screenshotsWall.servers.desc')}
            />
            <ScreenshotCard
              src="/images/screenshots/tutorial-step9-package-create-dialog.webp"
              title={t('xHome.screenshotsWall.createPackage.title')}
              desc={t('xHome.screenshotsWall.createPackage.desc')}
            />
            <ScreenshotCard
              srcs={[
                '/images/screenshots/tutorial-step12-miniapp-admin.webp',
                '/images/screenshots/tutorial-step12-miniapp-user.webp',
              ]}
              srcAlts={[
                t('xHome.screenshotsWall.miniappAdmin.title'),
                t('xHome.screenshotsWall.miniappUser.title'),
              ]}
              title={t('xHome.screenshotsWall.miniapp.title')}
              desc={t('xHome.screenshotsWall.miniapp.desc')}
            />
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="pixel-text text-3xl sm:text-4xl font-bold text-primary mb-4">{t('xHome.coreCapabilities')}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('xHome.coreCapabilitiesDesc')}
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {featureDefs.map((feature, index) => (
              <Card
                key={feature.key}
                className="pixel-card group hover:scale-[1.02] hover:shadow-[6px_6px_0_rgba(217,119,87,0.25)] transition-all duration-300"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardHeader className="pb-3">
                  <div className="w-12 h-12 pixel-border flex items-center justify-center mb-3 bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="size-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{t(`xHome.features.${feature.key}.title`)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">{t(`xHome.features.${feature.key}.desc`)}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="pixel-text text-3xl sm:text-4xl font-bold text-primary mb-4">{t('xHome.comparisonTitle')}</h2>
          </div>
          <div className="overflow-x-auto pixel-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-4 px-6">{t('xHome.comparisonHeaders.feature')}</th>
                  <th className="text-center py-4 px-6">{t('xHome.comparisonHeaders.mmw')}</th>
                  <th className="text-center py-4 px-6">
                    <span className="font-bold">{t('common:brand')}<AnimatedX size="sm" /></span>
                  </th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                {comparisonKeys.map((row, i) => (
                  <tr key={row.key} className={i < comparisonKeys.length - 1 ? 'border-b' : ''}>
                    <td className="py-3 px-6">{t(`xHome.comparisonRows.${row.key}`)}</td>
                    <td className="text-center py-3 px-6">{row.mmw ? <span className="text-primary">&#10003;</span> : '-'}</td>
                    <td className="text-center py-3 px-6"><span className="text-primary">&#10003;</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="pixel-text text-3xl sm:text-4xl font-bold text-primary mb-4">{t('xHome.quickNav')}</h2>
            <p className="text-lg text-muted-foreground">{t('xHome.quickNavDesc')}</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {quickLinkDefs.map((item) => (
              <Link key={item.href} to={item.href}>
                <Card className="pixel-card group hover:scale-[1.02] hover:shadow-[6px_6px_0_rgba(217,119,87,0.25)] transition-all duration-300 h-full cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 pixel-border flex items-center justify-center bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <item.icon className="size-5 text-primary" />
                      </div>
                      <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                    <CardTitle className="text-base mt-3">{t(`xHome.quickLinks.${item.key}.title`)}</CardTitle>
                    <CardDescription>{t(`xHome.quickLinks.${item.key}.desc`)}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-[color:rgba(241,140,110,0.22)] bg-background/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src="/images/logo.webp" alt={t('xHome.logoAlt')} className="h-8 w-8 border-2 border-[color:rgba(241,140,110,0.4)] shadow-[4px_4px_0_rgba(0,0,0,0.2)]" />
              <span className="pixel-text text-sm">
                <span className="text-primary">{t('common:brand')}</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-primary to-amber-500 ml-1">X</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{t('xHome.footerDesc')}</p>
            <div className="flex items-center gap-3">
              <a href="https://github.com/iluobei/miaomiaowu" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors"><Github className="size-4" /></a>
              <a href="https://t.me/miaomiaowux" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors"><Send className="size-4" /></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
