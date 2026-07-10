import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { XDocLayout } from '@/components/docs/x-doc-layout'
import { Card, CardContent } from '@/components/ui/card'
import { AlertTriangle, Info } from 'lucide-react'
import { EmbeddedXrayDemo } from '@/components/docs/embedded-xray-demo'

export const Route = createFileRoute('/docs/embedded-xray')({
  component: EmbeddedXrayPage,
})

function EmbeddedXrayPage() {
  const { t } = useTranslation('xdocs')

  return (
    <XDocLayout title={t('embeddedXray.title')} description={t('embeddedXray.description')}>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('embeddedXray.demo.heading')}</h2>
        <p className='text-muted-foreground mb-4'>{t('embeddedXray.demo.description')}</p>
        <EmbeddedXrayDemo />
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('embeddedXray.overview')}</h2>
        <p className='text-muted-foreground mb-4'>{t('embeddedXray.overviewText')}</p>
        <div className='flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20'>
          <Info className='size-4 text-blue-500 mt-0.5 shrink-0' />
          <p className='text-sm text-blue-700 dark:text-blue-400'>{t('embeddedXray.proNote')}</p>
        </div>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('embeddedXray.comparisonHeading')}</h2>
        <Card>
          <CardContent className='pt-6'>
            <div className='overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead>
                  <tr className='border-b'>
                    <th className='text-left py-2 pr-4 font-medium'>{t('embeddedXray.compareItemCol')}</th>
                    <th className='text-left py-2 pr-4 font-medium'>{t('embeddedXray.embeddedCol')}</th>
                    <th className='text-left py-2 font-medium'>{t('embeddedXray.externalCol')}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className='border-b'><td className='py-2 pr-4 font-medium'>{t('embeddedXray.cmpRunMethod')}</td><td className='py-2 pr-4'>{t('embeddedXray.cmpRunMethodEmbedded')}</td><td className='py-2'>{t('embeddedXray.cmpRunMethodExternal')}</td></tr>
                  <tr className='border-b'><td className='py-2 pr-4 font-medium'>{t('embeddedXray.cmpProLicense')}</td><td className='py-2 pr-4'>{t('embeddedXray.cmpNeeded')}</td><td className='py-2'>{t('embeddedXray.cmpNotNeeded')}</td></tr>
                  <tr className='border-b'><td className='py-2 pr-4 font-medium'>{t('embeddedXray.cmpRateLimit')}</td><td className='py-2 pr-4 text-green-600 dark:text-green-400'>{t('embeddedXray.cmpSupported')}</td><td className='py-2 text-muted-foreground'>{t('embeddedXray.cmpNotSupported')}</td></tr>
                  <tr className='border-b'><td className='py-2 pr-4 font-medium'>{t('embeddedXray.cmpDeviceLimit')}</td><td className='py-2 pr-4 text-green-600 dark:text-green-400'>{t('embeddedXray.cmpSupported')}</td><td className='py-2 text-muted-foreground'>{t('embeddedXray.cmpNotSupported')}</td></tr>
                  <tr className='border-b'><td className='py-2 pr-4 font-medium'>{t('embeddedXray.cmpAutoRateLimit')}</td><td className='py-2 pr-4 text-green-600 dark:text-green-400'>{t('embeddedXray.cmpSupported')}</td><td className='py-2 text-muted-foreground'>{t('embeddedXray.cmpNotSupported')}</td></tr>
                  <tr className='border-b'><td className='py-2 pr-4 font-medium'>{t('embeddedXray.cmpOnlineTracking')}</td><td className='py-2 pr-4 text-green-600 dark:text-green-400'>{t('embeddedXray.cmpPreciseTracking')}</td><td className='py-2 text-muted-foreground'>{t('embeddedXray.cmpNotSupported')}</td></tr>
                  <tr className='border-b'><td className='py-2 pr-4 font-medium'>{t('embeddedXray.cmpVisionRateLimit')}</td><td className='py-2 pr-4 text-green-600 dark:text-green-400'>{t('embeddedXray.cmpVisionHook')}</td><td className='py-2 text-muted-foreground'>{t('embeddedXray.cmpNotSupported')}</td></tr>
                  <tr className='border-b'><td className='py-2 pr-4 font-medium'>{t('embeddedXray.cmpHotUpdate')}</td><td className='py-2 pr-4'>{t('embeddedXray.cmpHotUpdateDesc')}</td><td className='py-2'>-</td></tr>
                  <tr className='border-b'><td className='py-2 pr-4 font-medium'>{t('embeddedXray.cmpConfigPath')}</td><td className='py-2 pr-4'><code className='bg-muted px-1.5 py-0.5 rounded text-xs'>/usr/local/etc/xray/config.json</code></td><td className='py-2'>{t('embeddedXray.cmpAutoDetect')}</td></tr>
                  <tr><td className='py-2 pr-4 font-medium'>{t('embeddedXray.cmpInstallXray')}</td><td className='py-2 pr-4'>{t('embeddedXray.cmpNoInstall')}</td><td className='py-2'>{t('embeddedXray.cmpNeedInstall')}</td></tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('embeddedXray.howItWorksHeading')}</h2>
        <Card>
          <CardContent className='pt-6'>
            <div className='bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto'>
              <pre>{`Agent 启动 (xray_mode: embedded)
     │
     ├─ 停止外置 Xray 服务 (systemctl stop xray)
     ├─ 加载 /usr/local/etc/xray/config.json
     ├─ 注入自定义调度器 (Dispatcher) + 统计 + 策略
     ├─ 注册 Vision 限速 Hook
     └─ 启动内嵌 Xray 内核实例
          │
          ▼
主控通过 WebSocket 推送 limiter_config
     │
     ▼
Agent 实时更新限速桶 (Rate Bucket)
     │
     ├─ 每个用户独立的速度限制 (bytes/s)
     ├─ 每个用户独立的设备数限制
     └─ 自动限速规则 (sustained / burst)
          │
          ▼
自定义调度器拦截所有流量
     │
     ├─ RateWriter: 普通连接限速
     ├─ VisionLimiterHook: XTLS Vision 零拷贝连接限速
     └─ 设备数超限 → 拒绝新连接`}</pre>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('embeddedXray.coreCapabilitiesHeading')}</h2>
        <div className='space-y-6'>
          <Card>
            <CardContent className='pt-6'>
              <h3 className='font-semibold mb-3'>{t('embeddedXray.realTimeRateLimitHeading')}</h3>
              <p className='text-sm text-muted-foreground mb-3'>{t('embeddedXray.realTimeRateLimitText')}</p>
              <div className='overflow-x-auto'>
                <table className='w-full text-sm'>
                  <thead><tr className='border-b'><th className='text-left py-2 pr-4 font-medium'>{t('embeddedXray.paramCol')}</th><th className='text-left py-2 pr-4 font-medium'>{t('embeddedXray.typeCol')}</th><th className='text-left py-2 font-medium'>{t('embeddedXray.descCol')}</th></tr></thead>
                  <tbody>
                    <tr className='border-b'><td className='py-2 pr-4'><code className='bg-muted px-1.5 py-0.5 rounded text-xs'>inbound_tag</code></td><td className='py-2 pr-4'>string</td><td className='py-2'>{t('embeddedXray.paramInboundTag')}</td></tr>
                    <tr className='border-b'><td className='py-2 pr-4'><code className='bg-muted px-1.5 py-0.5 rounded text-xs'>node_limit</code></td><td className='py-2 pr-4'>uint64</td><td className='py-2'>{t('embeddedXray.paramNodeLimit')}</td></tr>
                    <tr className='border-b'><td className='py-2 pr-4'><code className='bg-muted px-1.5 py-0.5 rounded text-xs'>users[].speed_limit</code></td><td className='py-2 pr-4'>uint64</td><td className='py-2'>{t('embeddedXray.paramUserSpeedLimit')}</td></tr>
                    <tr><td className='py-2 pr-4'><code className='bg-muted px-1.5 py-0.5 rounded text-xs'>users[].device_limit</code></td><td className='py-2 pr-4'>int</td><td className='py-2'>{t('embeddedXray.paramUserDeviceLimit')}</td></tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-6'>
              <h3 className='font-semibold mb-3'>{t('embeddedXray.visionRateLimitHeading')}</h3>
              <p className='text-sm text-muted-foreground'>{t('embeddedXray.visionRateLimitText')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-6'>
              <h3 className='font-semibold mb-3'>{t('embeddedXray.autoRateLimitHeading')}</h3>
              <p className='text-sm text-muted-foreground mb-3'>{t('embeddedXray.autoRateLimitText')}</p>
              <div className='overflow-x-auto'>
                <table className='w-full text-sm'>
                  <thead><tr className='border-b'><th className='text-left py-2 pr-4 font-medium'>{t('embeddedXray.ruleTypeCol')}</th><th className='text-left py-2 pr-4 font-medium'>{t('embeddedXray.triggerConditionCol')}</th><th className='text-left py-2 font-medium'>{t('embeddedXray.descCol')}</th></tr></thead>
                  <tbody>
                    <tr className='border-b'>
                      <td className='py-2 pr-4'><code className='bg-muted px-1.5 py-0.5 rounded text-xs'>sustained</code></td>
                      <td className='py-2 pr-4'>{t('embeddedXray.sustainedTrigger')}</td>
                      <td className='py-2'>{t('embeddedXray.sustainedDesc')}</td>
                    </tr>
                    <tr>
                      <td className='py-2 pr-4'><code className='bg-muted px-1.5 py-0.5 rounded text-xs'>burst</code></td>
                      <td className='py-2 pr-4'>{t('embeddedXray.burstTrigger')}</td>
                      <td className='py-2'>{t('embeddedXray.burstDesc')}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-6'>
              <h3 className='font-semibold mb-3'>{t('embeddedXray.onlineTrackingHeading')}</h3>
              <p className='text-sm text-muted-foreground'>{t('embeddedXray.onlineTrackingText')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-6'>
              <h3 className='font-semibold mb-3'>{t('embeddedXray.customDispatcherHeading')}</h3>
              <p className='text-sm text-muted-foreground'>{t('embeddedXray.customDispatcherText')}</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('embeddedXray.enableHeading')}</h2>
        <div className='space-y-4'>
          <Card>
            <CardContent className='pt-6'>
              <h3 className='font-semibold mb-3'>{t('embeddedXray.enableMethod1Heading')}</h3>
              <p className='text-sm text-muted-foreground mb-3'>{t('embeddedXray.enableMethod1Text')}</p>
              <ol className='space-y-2 text-sm text-muted-foreground'>
                <li>{t('embeddedXray.enableMethod1Step1')}</li>
                <li>{t('embeddedXray.enableMethod1Step2')}</li>
                <li>{t('embeddedXray.enableMethod1Step3')}</li>
                <li>{t('embeddedXray.enableMethod1Step4')}</li>
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-6'>
              <h3 className='font-semibold mb-3'>{t('embeddedXray.enableMethod2Heading')}</h3>
              <p className='text-sm text-muted-foreground mb-3'>{t('embeddedXray.enableMethod2Text')}</p>
              <div className='bg-muted rounded-lg p-4 font-mono text-sm'>
                <pre>{`xray_mode: "embedded"  # 可选值: "external"（默认）或 "embedded"`}</pre>
              </div>
              <p className='text-sm text-muted-foreground mt-3'>
                {t('embeddedXray.enableMethod2Restart')}<code className='bg-muted px-1.5 py-0.5 rounded text-xs'>systemctl restart mmw-agent</code>
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('embeddedXray.startupHeading')}</h2>
        <p className='text-muted-foreground mb-4'>{t('embeddedXray.startupText')}</p>
        <Card>
          <CardContent className='pt-6'>
            <ol className='space-y-3 text-sm text-muted-foreground'>
              <li><strong>{t('embeddedXray.startupStep1')}</strong></li>
              <li><strong>{t('embeddedXray.startupStep2')}</strong></li>
              <li><strong>{t('embeddedXray.startupStep3')}</strong></li>
              <li><strong>{t('embeddedXray.startupStep4')}</strong></li>
              <li><strong>{t('embeddedXray.startupStep5')}</strong></li>
              <li><strong>{t('embeddedXray.startupStep6')}</strong></li>
              <li><strong>{t('embeddedXray.startupStep7')}</strong></li>
            </ol>
          </CardContent>
        </Card>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('embeddedXray.trafficStatsHeading')}</h2>
        <p className='text-muted-foreground mb-4'>{t('embeddedXray.trafficStatsText')}</p>
        <Card>
          <CardContent className='pt-6'>
            <div className='overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead><tr className='border-b'><th className='text-left py-2 pr-4 font-medium'>{t('embeddedXray.counterFormatCol')}</th><th className='text-left py-2 font-medium'>{t('embeddedXray.descCol')}</th></tr></thead>
                <tbody>
                  <tr className='border-b'><td className='py-2 pr-4'><code className='bg-muted px-1.5 py-0.5 rounded text-xs'>{'inbound>>>tag>>>traffic>>>uplink'}</code></td><td className='py-2'>{t('embeddedXray.counterInboundUp')}</td></tr>
                  <tr className='border-b'><td className='py-2 pr-4'><code className='bg-muted px-1.5 py-0.5 rounded text-xs'>{'inbound>>>tag>>>traffic>>>downlink'}</code></td><td className='py-2'>{t('embeddedXray.counterInboundDown')}</td></tr>
                  <tr className='border-b'><td className='py-2 pr-4'><code className='bg-muted px-1.5 py-0.5 rounded text-xs'>{'user>>>email>>>traffic>>>uplink'}</code></td><td className='py-2'>{t('embeddedXray.counterUserUp')}</td></tr>
                  <tr><td className='py-2 pr-4'><code className='bg-muted px-1.5 py-0.5 rounded text-xs'>{'user>>>email>>>traffic>>>downlink'}</code></td><td className='py-2'>{t('embeddedXray.counterUserDown')}</td></tr>
                </tbody>
              </table>
            </div>
            <p className='text-sm text-muted-foreground mt-3'>{t('embeddedXray.counterNote')}</p>
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className='text-2xl font-bold mb-4'>{t('embeddedXray.notesHeading')}</h2>
        <div className='space-y-3'>
          <div className='flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20'>
            <AlertTriangle className='size-4 text-amber-500 mt-0.5 shrink-0' />
            <p className='text-sm text-amber-700 dark:text-amber-400'>{t('embeddedXray.noteAutoStop')}</p>
          </div>
          <div className='flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20'>
            <AlertTriangle className='size-4 text-amber-500 mt-0.5 shrink-0' />
            <p className='text-sm text-amber-700 dark:text-amber-400'>{t('embeddedXray.noteFixedPath')}</p>
          </div>
          <div className='flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20'>
            <AlertTriangle className='size-4 text-amber-500 mt-0.5 shrink-0' />
            <p className='text-sm text-amber-700 dark:text-amber-400'>{t('embeddedXray.noteLimiterLicense')}</p>
          </div>
          <div className='flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20'>
            <Info className='size-4 text-blue-500 mt-0.5 shrink-0' />
            <p className='text-sm text-blue-700 dark:text-blue-400'>{t('embeddedXray.noteNoInstall')}</p>
          </div>
          <div className='flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20'>
            <Info className='size-4 text-blue-500 mt-0.5 shrink-0' />
            <p className='text-sm text-blue-700 dark:text-blue-400'>{t('embeddedXray.noteBadge')}</p>
          </div>
        </div>
      </section>
    </XDocLayout>
  )
}
