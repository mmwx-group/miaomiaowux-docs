import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { XDocLayout } from '@/components/docs/x-doc-layout'
import { Card, CardContent } from '@/components/ui/card'
import { AlertTriangle, Info } from 'lucide-react'
import { RatelimitDemo } from '@/components/docs/ratelimit-demo'

export const Route = createFileRoute('/docs/node-ratelimit')({
  component: NodeRateLimitPage,
})

function NodeRateLimitPage() {
  const { t } = useTranslation('xdocs')

  return (
    <XDocLayout title={t('nodeRatelimit.title')} description={t('nodeRatelimit.description')}>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('nodeRatelimit.demo.heading')}</h2>
        <p className='text-muted-foreground mb-4'>{t('nodeRatelimit.demo.description')}</p>
        <RatelimitDemo />
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('nodeRatelimit.overview')}</h2>
        <p className='text-muted-foreground mb-4'>{t('nodeRatelimit.overviewText')}</p>
        <div className='flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20'>
          <Info className='size-4 text-blue-500 mt-0.5 shrink-0' />
          <p className='text-sm text-blue-700 dark:text-blue-400'>{t('nodeRatelimit.proNote')}</p>
        </div>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('nodeRatelimit.howItWorksHeading')}</h2>
        <Card>
          <CardContent className='pt-6'>
            <div className='bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto'>
              <pre>{`套餐配置 (speed_limit_mbps / device_limit)
     │
     ▼
主控查询用户关联的入站 (inbound tags)
     │
     ▼
为每个入站构建限速规则 (WSLimiterConfigPayload)
     │
     ▼
通过 WebSocket 推送到内嵌 Xray Agent
     │
     ▼
Agent 在 Xray 内核层面实施速度和设备限制`}</pre>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('nodeRatelimit.paramsHeading')}</h2>
        <p className='text-muted-foreground mb-4'>{t('nodeRatelimit.paramsText')}</p>
        <div className='space-y-6'>
          <Card>
            <CardContent className='pt-6'>
              <h3 className='font-semibold mb-2'>{t('nodeRatelimit.speedLimitHeading')}</h3>
              <div className='overflow-x-auto'>
                <table className='w-full text-sm'>
                  <tbody>
                    <tr className='border-b'><td className='py-2 pr-4 font-medium w-28'>{t('nodeRatelimit.fieldLabel')}</td><td className='py-2'><code className='bg-muted px-1.5 py-0.5 rounded text-xs'>speed_limit_mbps</code></td></tr>
                    <tr className='border-b'><td className='py-2 pr-4 font-medium'>{t('nodeRatelimit.unitLabel')}</td><td className='py-2'>{t('nodeRatelimit.unitMbps')}</td></tr>
                    <tr className='border-b'><td className='py-2 pr-4 font-medium'>{t('nodeRatelimit.defaultLabel')}</td><td className='py-2'>{t('nodeRatelimit.defaultNoLimit')}</td></tr>
                    <tr><td className='py-2 pr-4 font-medium'>{t('nodeRatelimit.descLabel')}</td><td className='py-2'>{t('nodeRatelimit.speedLimitDesc')}</td></tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-6'>
              <h3 className='font-semibold mb-2'>{t('nodeRatelimit.deviceLimitHeading')}</h3>
              <div className='overflow-x-auto'>
                <table className='w-full text-sm'>
                  <tbody>
                    <tr className='border-b'><td className='py-2 pr-4 font-medium w-28'>{t('nodeRatelimit.fieldLabel')}</td><td className='py-2'><code className='bg-muted px-1.5 py-0.5 rounded text-xs'>device_limit</code></td></tr>
                    <tr className='border-b'><td className='py-2 pr-4 font-medium'>{t('nodeRatelimit.defaultLabel')}</td><td className='py-2'>{t('nodeRatelimit.defaultNoLimit')}</td></tr>
                    <tr><td className='py-2 pr-4 font-medium'>{t('nodeRatelimit.descLabel')}</td><td className='py-2'>{t('nodeRatelimit.deviceLimitDesc')}</td></tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('nodeRatelimit.connExplainHeading')}</h2>
        <p className='text-muted-foreground mb-4'>{t('nodeRatelimit.connExplainIntro')}</p>
        <ul className='list-disc pl-5 space-y-2 text-sm text-muted-foreground mb-4'>
          <li>{t('nodeRatelimit.connExample1')}</li>
          <li>{t('nodeRatelimit.connExample2')}</li>
          <li>{t('nodeRatelimit.connExample3')}</li>
        </ul>
        <div className='flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20'>
          <Info className='size-4 text-blue-500 mt-0.5 shrink-0' />
          <p className='text-sm text-blue-700 dark:text-blue-400'>{t('nodeRatelimit.connExplainNote')}</p>
        </div>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('nodeRatelimit.connRecommendHeading')}</h2>
        <Card>
          <CardContent className='pt-6'>
            <div className='overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead>
                  <tr className='border-b'>
                    <th className='text-left py-2 pr-4 font-medium'>{t('nodeRatelimit.connScenarioCol')}</th>
                    <th className='text-left py-2 pr-4 font-medium whitespace-nowrap'>{t('nodeRatelimit.connValueCol')}</th>
                    <th className='text-left py-2 font-medium'>{t('nodeRatelimit.connReasonCol')}</th>
                  </tr>
                </thead>
                <tbody>
                  {(t('nodeRatelimit.connScenarios', { returnObjects: true }) as { scene: string; value: string; why: string }[]).map((row, i, arr) => (
                    <tr key={row.scene} className={i < arr.length - 1 ? 'border-b' : ''}>
                      <td className='py-2 pr-4'>{row.scene}</td>
                      <td className='py-2 pr-4 font-medium text-primary whitespace-nowrap'>{row.value}</td>
                      <td className='py-2 text-muted-foreground'>{row.why}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        <div className='flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 mt-4'>
          <AlertTriangle className='size-4 text-amber-500 mt-0.5 shrink-0' />
          <p className='text-sm text-amber-700 dark:text-amber-400'>{t('nodeRatelimit.connRecommendTip')}</p>
        </div>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('nodeRatelimit.userOverrideHeading')}</h2>
        <p className='text-muted-foreground mb-4'>{t('nodeRatelimit.userOverrideText')}</p>
        <Card>
          <CardContent className='pt-6'>
            <div className='overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead><tr className='border-b'><th className='text-left py-2 pr-4 font-medium'>{t('nodeRatelimit.priorityCol')}</th><th className='text-left py-2 pr-4 font-medium'>{t('nodeRatelimit.sourceCol')}</th><th className='text-left py-2 font-medium'>{t('nodeRatelimit.descCol')}</th></tr></thead>
                <tbody>
                  <tr className='border-b'>
                    <td className='py-2 pr-4'>{t('nodeRatelimit.priorityHighest')}</td>
                    <td className='py-2 pr-4'>{t('nodeRatelimit.sourceUserOverride')}</td>
                    <td className='py-2'>{t('nodeRatelimit.userOverrideDesc2')}</td>
                  </tr>
                  <tr>
                    <td className='py-2 pr-4'>{t('nodeRatelimit.priorityDefault')}</td>
                    <td className='py-2 pr-4'>{t('nodeRatelimit.sourcePackage')}</td>
                    <td className='py-2'>{t('nodeRatelimit.packageDesc')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('nodeRatelimit.autoPushHeading')}</h2>
        <p className='text-muted-foreground mb-4'>{t('nodeRatelimit.autoPushText')}</p>
        <Card>
          <CardContent className='pt-6'>
            <div className='overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead><tr className='border-b'><th className='text-left py-2 pr-4 font-medium'>{t('nodeRatelimit.triggerEventCol')}</th><th className='text-left py-2 font-medium'>{t('nodeRatelimit.behaviorCol')}</th></tr></thead>
                <tbody>
                  <tr className='border-b'><td className='py-2 pr-4'>{t('nodeRatelimit.triggerConnect')}</td><td className='py-2'>{t('nodeRatelimit.triggerConnectDesc')}</td></tr>
                  <tr className='border-b'><td className='py-2 pr-4'>{t('nodeRatelimit.triggerPackageChange')}</td><td className='py-2'>{t('nodeRatelimit.triggerPackageChangeDesc')}</td></tr>
                  <tr className='border-b'><td className='py-2 pr-4'>{t('nodeRatelimit.triggerUserToggle')}</td><td className='py-2'>{t('nodeRatelimit.triggerUserToggleDesc')}</td></tr>
                  <tr className='border-b'><td className='py-2 pr-4'>{t('nodeRatelimit.triggerUserDelete')}</td><td className='py-2'>{t('nodeRatelimit.triggerUserDeleteDesc')}</td></tr>
                  <tr><td className='py-2 pr-4'>{t('nodeRatelimit.triggerExpire')}</td><td className='py-2'>{t('nodeRatelimit.triggerExpireDesc')}</td></tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('nodeRatelimit.configStepsHeading')}</h2>
        <div className='space-y-4'>
          <Card>
            <CardContent className='pt-6'>
              <ol className='space-y-3 text-sm text-muted-foreground'>
                <li>{t('nodeRatelimit.configStep1')}</li>
                <li>{t('nodeRatelimit.configStep2')}</li>
                <li>{t('nodeRatelimit.configStep3')}</li>
                <li>{t('nodeRatelimit.configStep4')}</li>
                <li>{t('nodeRatelimit.configStep5')}</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('nodeRatelimit.packageParamsHeading')}</h2>
        <p className='text-muted-foreground mb-4'>{t('nodeRatelimit.packageParamsText')}</p>
        <Card>
          <CardContent className='pt-6'>
            <div className='overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead><tr className='border-b'><th className='text-left py-2 pr-4 font-medium'>{t('nodeRatelimit.paramCol')}</th><th className='text-left py-2 pr-4 font-medium'>{t('nodeRatelimit.descCol')}</th><th className='text-left py-2 font-medium'>{t('nodeRatelimit.defaultCol')}</th></tr></thead>
                <tbody>
                  <tr className='border-b'><td className='py-2 pr-4'>{t('nodeRatelimit.pkgName')}</td><td className='py-2 pr-4'>{t('nodeRatelimit.pkgNameDesc')}</td><td className='py-2'>-</td></tr>
                  <tr className='border-b'><td className='py-2 pr-4'>{t('nodeRatelimit.pkgTraffic')}</td><td className='py-2 pr-4'>{t('nodeRatelimit.pkgTrafficDesc')}</td><td className='py-2'>{t('nodeRatelimit.defaultNoLimit')}</td></tr>
                  <tr className='border-b'><td className='py-2 pr-4'>{t('nodeRatelimit.pkgCycle')}</td><td className='py-2 pr-4'>{t('nodeRatelimit.pkgCycleDesc')}</td><td className='py-2'>30</td></tr>
                  <tr className='border-b'><td className='py-2 pr-4'>{t('nodeRatelimit.pkgNodes')}</td><td className='py-2 pr-4'>{t('nodeRatelimit.pkgNodesDesc')}</td><td className='py-2'>{t('nodeRatelimit.pkgNodesAll')}</td></tr>
                  <tr className='border-b'><td className='py-2 pr-4'>{t('nodeRatelimit.pkgSpeedLimit')}</td><td className='py-2 pr-4'>{t('nodeRatelimit.pkgSpeedLimitDesc')}</td><td className='py-2'>{t('nodeRatelimit.defaultNoLimit')}</td></tr>
                  <tr className='border-b'><td className='py-2 pr-4'>{t('nodeRatelimit.pkgDeviceLimit')}</td><td className='py-2 pr-4'>{t('nodeRatelimit.pkgDeviceLimitDesc')}</td><td className='py-2'>{t('nodeRatelimit.defaultNoLimit')}</td></tr>
                  <tr><td className='py-2 pr-4'>{t('nodeRatelimit.pkgTrafficMode')}</td><td className='py-2 pr-4'>{t('nodeRatelimit.pkgTrafficModeDesc')}</td><td className='py-2'>{t('nodeRatelimit.pkgTrafficModeBidirectional')}</td></tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className='text-2xl font-bold mb-4'>{t('nodeRatelimit.notesHeading')}</h2>
        <div className='space-y-3'>
          <div className='flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20'>
            <AlertTriangle className='size-4 text-amber-500 mt-0.5 shrink-0' />
            <p className='text-sm text-amber-700 dark:text-amber-400'>{t('nodeRatelimit.noteEmbeddedOnly')}</p>
          </div>
          <div className='flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20'>
            <AlertTriangle className='size-4 text-amber-500 mt-0.5 shrink-0' />
            <p className='text-sm text-amber-700 dark:text-amber-400'>{t('nodeRatelimit.noteReconnect')}</p>
          </div>
          <div className='flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20'>
            <Info className='size-4 text-blue-500 mt-0.5 shrink-0' />
            <p className='text-sm text-blue-700 dark:text-blue-400'>{t('nodeRatelimit.noteDeviceTracking')}</p>
          </div>
        </div>
      </section>
    </XDocLayout>
  )
}
