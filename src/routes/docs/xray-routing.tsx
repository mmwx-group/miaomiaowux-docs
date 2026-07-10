import { createFileRoute, Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { XDocLayout } from '@/components/docs/x-doc-layout'
import { Card, CardContent } from '@/components/ui/card'

export const Route = createFileRoute('/docs/xray-routing')({
  component: XrayRoutingPage,
})

function XrayRoutingPage() {
  const { t } = useTranslation('xdocs')

  return (
    <XDocLayout title={t('xrayRouting.title')} description={t('xrayRouting.description')}>
      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('xrayRouting.overview')}</h2>
        <p className='text-muted-foreground mb-4'>{t('xrayRouting.overviewText')}</p>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead><tr className='border-b'><th className='text-left py-3 px-4'>{t('xrayRouting.entryCol')}</th><th className='text-left py-3 px-4'>{t('xrayRouting.locationCol')}</th><th className='text-left py-3 px-4'>{t('xrayRouting.descCol')}</th></tr></thead>
            <tbody>
              <tr className='border-b'><td className='py-3 px-4'>{t('xrayRouting.entryNodeRouting')}</td><td className='py-3 px-4'>{t('xrayRouting.entryNodeRoutingLocation')}</td><td className='py-3 px-4'>{t('xrayRouting.entryNodeRoutingDesc')}</td></tr>
              <tr><td className='py-3 px-4'>{t('xrayRouting.entryRoutingPanel')}</td><td className='py-3 px-4'>{t('xrayRouting.entryRoutingPanelLocation')}</td><td className='py-3 px-4'>{t('xrayRouting.entryRoutingPanelDesc')}</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('xrayRouting.matchSemanticsHeading')}</h2>
        <Card>
          <CardContent className='pt-6'>
            <div className='text-sm space-y-3 text-muted-foreground'>
              <p>{t('xrayRouting.matchSemanticsIntro')}</p>
              <ul className='space-y-2 ml-4'>
                <li>- {t('xrayRouting.matchRule1')}</li>
                <li>- {t('xrayRouting.matchRule2')}</li>
                <li>- {t('xrayRouting.matchRule3')}</li>
                <li>- {t('xrayRouting.matchRule4')}</li>
                <li>- {t('xrayRouting.matchRule5')}</li>
              </ul>
              <p className='mt-3'>{t('xrayRouting.matchOrderNote')}</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('xrayRouting.nodeRoutingHeading')}</h2>
        <p className='text-muted-foreground mb-4'>{t('xrayRouting.nodeRoutingText')}</p>
        <div className='space-y-4'>
          <Card>
            <CardContent className='pt-6'>
              <h3 className='font-semibold mb-3'>{t('xrayRouting.exclusiveGlobalHeading')}</h3>
              <div className='text-sm text-muted-foreground space-y-2'>
                <p>{t('xrayRouting.exclusiveGlobalIntro')}</p>
                <ul className='space-y-1 ml-4'>
                  <li>- {t('xrayRouting.exclusiveRule')}</li>
                  <li>- {t('xrayRouting.globalRule')}</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-6'>
              <h3 className='font-semibold mb-3'>{t('xrayRouting.catchAllHeading')}</h3>
              <div className='text-sm text-muted-foreground space-y-2'>
                <p>{t('xrayRouting.catchAllText')}</p>
                <div className='bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-md p-3 text-amber-600 dark:text-amber-400 text-xs mt-2'>
                  {t('xrayRouting.catchAllWarning')}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-6'>
              <h3 className='font-semibold mb-3'>{t('xrayRouting.outboundNameResolveHeading')}</h3>
              <p className='text-sm text-muted-foreground'>{t('xrayRouting.outboundNameResolveText')}</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('xrayRouting.routingPanelHeading')}</h2>
        <p className='text-muted-foreground mb-4'>{t('xrayRouting.routingPanelText')}</p>
        <div className='space-y-4'>
          <Card>
            <CardContent className='pt-6'>
              <h3 className='font-semibold mb-3'>{t('xrayRouting.splitLayoutHeading')}</h3>
              <div className='text-sm text-muted-foreground space-y-2'>
                <p>{t('xrayRouting.splitLayoutIntro')}</p>
                <ul className='space-y-1 ml-4'>
                  <li>- {t('xrayRouting.splitLeft')}</li>
                  <li>- {t('xrayRouting.splitRight')}</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-6'>
              <h3 className='font-semibold mb-3'>{t('xrayRouting.dragSortHeading')}</h3>
              <div className='text-sm text-muted-foreground space-y-2'>
                <p>{t('xrayRouting.dragSortText')}</p>
                <p>{t('xrayRouting.dragSortApi')}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('xrayRouting.shortcutRulesHeading')}</h2>
        <p className='text-muted-foreground mb-4'>{t('xrayRouting.shortcutRulesText')}</p>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead><tr className='border-b'><th className='text-left py-3 px-4'>{t('xrayRouting.ruleCol')}</th><th className='text-left py-3 px-4'>{t('xrayRouting.matchConditionCol')}</th><th className='text-left py-3 px-4'>{t('xrayRouting.outboundCol')}</th><th className='text-left py-3 px-4'>{t('xrayRouting.descCol')}</th></tr></thead>
            <tbody>
              <tr className='border-b'><td className='py-3 px-4'>{t('xrayRouting.ruleBanBT')}</td><td className='py-3 px-4 font-mono text-xs'>protocol: bittorrent</td><td className='py-3 px-4'>block</td><td className='py-3 px-4'>{t('xrayRouting.ruleBanBTDesc')}</td></tr>
              <tr className='border-b'><td className='py-3 px-4'>{t('xrayRouting.ruleBanCN')}</td><td className='py-3 px-4 font-mono text-xs'>ip: geoip:cn</td><td className='py-3 px-4'>block</td><td className='py-3 px-4'>{t('xrayRouting.ruleBanCNDesc')}</td></tr>
              <tr className='border-b'><td className='py-3 px-4'>{t('xrayRouting.ruleOpenAIDirect')}</td><td className='py-3 px-4 font-mono text-xs'>domain: geosite:openai</td><td className='py-3 px-4'>direct</td><td className='py-3 px-4'>{t('xrayRouting.ruleOpenAIDirectDesc')}</td></tr>
              <tr className='border-b'><td className='py-3 px-4'>{t('xrayRouting.ruleBanPrivate')}</td><td className='py-3 px-4 font-mono text-xs'>ip: geoip:private</td><td className='py-3 px-4'>block</td><td className='py-3 px-4'>{t('xrayRouting.ruleBanPrivateDesc')}</td></tr>
              <tr className='border-b'><td className='py-3 px-4'>RFC EMBY</td><td className='py-3 px-4 font-mono text-xs'>domain: rfc.uhdnow.com</td><td className='py-3 px-4'>{t('xrayRouting.needSelect')}</td><td className='py-3 px-4'>{t('xrayRouting.ruleEmbyDesc')}</td></tr>
              <tr><td className='py-3 px-4'>{t('xrayRouting.ruleTikTok')}</td><td className='py-3 px-4 font-mono text-xs'>domain: geosite:tiktok</td><td className='py-3 px-4'>{t('xrayRouting.needSelect')}</td><td className='py-3 px-4'>{t('xrayRouting.ruleTikTokDesc')}</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('xrayRouting.balancerHeading')}</h2>
        <p className='text-muted-foreground mb-4'>{t('xrayRouting.balancerText')}</p>
        <div className='space-y-4'>
          <Card>
            <CardContent className='pt-6'>
              <h3 className='font-semibold mb-3'>{t('xrayRouting.balancerStepsHeading')}</h3>
              <div className='text-sm text-muted-foreground space-y-2'>
                <p>{t('xrayRouting.balancerStep1')}</p>
                <p>{t('xrayRouting.balancerStep2')}</p>
                <p>{t('xrayRouting.balancerStep3')}</p>
                <p>{t('xrayRouting.balancerStep4')}</p>
                <p>{t('xrayRouting.balancerStep5')}</p>
              </div>
            </CardContent>
          </Card>
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead><tr className='border-b'><th className='text-left py-3 px-4'>{t('xrayRouting.strategyCol')}</th><th className='text-left py-3 px-4'>{t('xrayRouting.descCol')}</th></tr></thead>
              <tbody>
                <tr className='border-b'><td className='py-3 px-4 font-mono text-xs'>random</td><td className='py-3 px-4'>{t('xrayRouting.strategyRandom')}</td></tr>
                <tr className='border-b'><td className='py-3 px-4 font-mono text-xs'>roundRobin</td><td className='py-3 px-4'>{t('xrayRouting.strategyRoundRobin')}</td></tr>
                <tr className='border-b'><td className='py-3 px-4 font-mono text-xs'>leastPing</td><td className='py-3 px-4'>{t('xrayRouting.strategyLeastPing')}</td></tr>
                <tr><td className='py-3 px-4 font-mono text-xs'>leastLoad</td><td className='py-3 px-4'>{t('xrayRouting.strategyLeastLoad')}</td></tr>
              </tbody>
            </table>
          </div>
          <Card>
            <CardContent className='pt-6 text-sm text-muted-foreground'>{t('xrayRouting.balancerObservatoryNote')}</CardContent>
          </Card>
        </div>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('xrayRouting.customRulesHeading')}</h2>
        <p className='text-muted-foreground mb-4'>{t('xrayRouting.customRulesText')}</p>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead><tr className='border-b'><th className='text-left py-3 px-4'>{t('xrayRouting.fieldCol')}</th><th className='text-left py-3 px-4'>{t('xrayRouting.typeCol')}</th><th className='text-left py-3 px-4'>{t('xrayRouting.exampleCol')}</th><th className='text-left py-3 px-4'>{t('xrayRouting.descCol')}</th></tr></thead>
            <tbody>
              <tr className='border-b'><td className='py-3 px-4 font-mono text-xs'>domain</td><td className='py-3 px-4'>{t('xrayRouting.fieldArray')}</td><td className='py-3 px-4 font-mono text-xs'>geosite:openai, example.com</td><td className='py-3 px-4'>{t('xrayRouting.domainFieldDesc')}</td></tr>
              <tr className='border-b'><td className='py-3 px-4 font-mono text-xs'>ip</td><td className='py-3 px-4'>{t('xrayRouting.fieldArray')}</td><td className='py-3 px-4 font-mono text-xs'>geoip:cn, 10.0.0.0/8</td><td className='py-3 px-4'>{t('xrayRouting.ipFieldDesc')}</td></tr>
              <tr className='border-b'><td className='py-3 px-4 font-mono text-xs'>protocol</td><td className='py-3 px-4'>{t('xrayRouting.fieldArray')}</td><td className='py-3 px-4 font-mono text-xs'>bittorrent, http, tls</td><td className='py-3 px-4'>{t('xrayRouting.protocolFieldDesc')}</td></tr>
              <tr className='border-b'><td className='py-3 px-4 font-mono text-xs'>port</td><td className='py-3 px-4'>{t('xrayRouting.fieldString')}</td><td className='py-3 px-4 font-mono text-xs'>80, 443, 1000-2000</td><td className='py-3 px-4'>{t('xrayRouting.portFieldDesc')}</td></tr>
              <tr className='border-b'><td className='py-3 px-4 font-mono text-xs'>sourcePort</td><td className='py-3 px-4'>{t('xrayRouting.fieldString')}</td><td className='py-3 px-4 font-mono text-xs'>1234</td><td className='py-3 px-4'>{t('xrayRouting.sourcePortFieldDesc')}</td></tr>
              <tr className='border-b'><td className='py-3 px-4 font-mono text-xs'>network</td><td className='py-3 px-4'>{t('xrayRouting.fieldString')}</td><td className='py-3 px-4 font-mono text-xs'>tcp / udp / tcp,udp</td><td className='py-3 px-4'>{t('xrayRouting.networkFieldDesc')}</td></tr>
              <tr className='border-b'><td className='py-3 px-4 font-mono text-xs'>source</td><td className='py-3 px-4'>{t('xrayRouting.fieldArray')}</td><td className='py-3 px-4 font-mono text-xs'>10.0.0.1</td><td className='py-3 px-4'>{t('xrayRouting.sourceFieldDesc')}</td></tr>
              <tr className='border-b'><td className='py-3 px-4 font-mono text-xs'>user</td><td className='py-3 px-4'>{t('xrayRouting.fieldArray')}</td><td className='py-3 px-4 font-mono text-xs'>user@example.com</td><td className='py-3 px-4'>{t('xrayRouting.userFieldDesc')}</td></tr>
              <tr className='border-b'><td className='py-3 px-4 font-mono text-xs'>inboundTag</td><td className='py-3 px-4'>{t('xrayRouting.fieldArray')}</td><td className='py-3 px-4 font-mono text-xs'>inbound-tag-1</td><td className='py-3 px-4'>{t('xrayRouting.inboundTagFieldDesc')}</td></tr>
              <tr><td className='py-3 px-4 font-mono text-xs'>attrs</td><td className='py-3 px-4'>{t('xrayRouting.fieldString')}</td><td className='py-3 px-4 font-mono text-xs'>{"attrs[':method'] == 'GET'"}</td><td className='py-3 px-4'>{t('xrayRouting.attrsFieldDesc')}</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('xrayRouting.autoRestartHeading')}</h2>
        <Card>
          <CardContent className='pt-6'>
            <p className='text-sm text-muted-foreground'>{t('xrayRouting.autoRestartText')}</p>
          </CardContent>
        </Card>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('xrayRouting.apiRefHeading')}</h2>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead><tr className='border-b'><th className='text-left py-3 px-4'>{t('xrayRouting.apiCol')}</th><th className='text-left py-3 px-4'>{t('xrayRouting.methodCol')}</th><th className='text-left py-3 px-4'>{t('xrayRouting.descCol')}</th></tr></thead>
            <tbody>
              <tr className='border-b'><td className='py-3 px-4 font-mono text-xs'>/api/admin/remote/routing?server_id=N</td><td className='py-3 px-4'>GET</td><td className='py-3 px-4'>{t('xrayRouting.apiGetRouting')}</td></tr>
              <tr className='border-b'><td className='py-3 px-4 font-mono text-xs'>/api/admin/remote/routing?server_id=N</td><td className='py-3 px-4'>POST</td><td className='py-3 px-4'>{t('xrayRouting.apiPostRouting')}</td></tr>
              <tr className='border-b'><td className='py-3 px-4 font-mono text-xs'>/api/admin/remote/outbounds?server_id=N</td><td className='py-3 px-4'>GET</td><td className='py-3 px-4'>{t('xrayRouting.apiGetOutbounds')}</td></tr>
              <tr><td className='py-3 px-4 font-mono text-xs'>/api/admin/remote/services/control?server_id=N</td><td className='py-3 px-4'>POST</td><td className='py-3 px-4'>{t('xrayRouting.apiPostControl')}</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <div className='flex gap-4'>
          <Link to='/docs/xray-outbounds' className='text-primary hover:underline'>{t('xrayRouting.linkOutbounds')}</Link>
          <Link to='/docs/xray-system-config' className='text-primary hover:underline'>{t('xrayRouting.linkSystemConfig')}</Link>
        </div>
      </section>
    </XDocLayout>
  )
}
