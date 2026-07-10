import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { XDocLayout } from '@/components/docs/x-doc-layout'
import { Card, CardContent } from '@/components/ui/card'

export const Route = createFileRoute('/docs/xray-outbounds')({
  component: XrayOutboundsPage,
})

function XrayOutboundsPage() {
  const { t } = useTranslation('xdocs')

  return (
    <XDocLayout title={t('xrayOutbounds.title')} description={t('xrayOutbounds.description')}>
      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('xrayOutbounds.configHeading')}</h2>
        <p className='text-muted-foreground mb-4'>{t('xrayOutbounds.configText')}</p>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead><tr className='border-b'><th className='text-left py-3 px-4'>{t('xrayOutbounds.typeCol')}</th><th className='text-left py-3 px-4'>{t('xrayOutbounds.descCol')}</th></tr></thead>
            <tbody>
              <tr className='border-b'><td className='py-3 px-4'>Freedom</td><td className='py-3 px-4'>{t('xrayOutbounds.freedomDesc')}</td></tr>
              <tr className='border-b'><td className='py-3 px-4'>Blackhole</td><td className='py-3 px-4'>{t('xrayOutbounds.blackholeDesc')}</td></tr>
              <tr className='border-b'><td className='py-3 px-4'>VLESS/VMess/Trojan/SS</td><td className='py-3 px-4'>{t('xrayOutbounds.proxyDesc')}</td></tr>
              <tr className='border-b'><td className='py-3 px-4'>Tunnel</td><td className='py-3 px-4'>{t('xrayOutbounds.tunnelDesc')}</td></tr>
              <tr><td className='py-3 px-4'>WARP <span className='text-xs text-amber-600'>v0.2.3+</span></td><td className='py-3 px-4'>{t('xrayOutbounds.warpDesc')}</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('xrayOutbounds.routingHeading')}</h2>
        <p className='text-muted-foreground mb-4'>{t('xrayOutbounds.routingText')}</p>
        <ul className='space-y-2 text-sm text-muted-foreground'>
          <li>- {t('xrayOutbounds.routing1')}</li>
          <li>- {t('xrayOutbounds.routing2')}</li>
          <li>- {t('xrayOutbounds.routing3')}</li>
          <li>- {t('xrayOutbounds.routing4')}</li>
          <li>- {t('xrayOutbounds.routing5')}</li>
        </ul>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('xrayOutbounds.operationsHeading')}</h2>
        <p className='text-muted-foreground'>{t('xrayOutbounds.operationsText')}</p>
      </section>

      <section>
        <h2 className='text-2xl font-bold mb-4'>{t('xrayOutbounds.warpHeading')}</h2>
        <p className='text-muted-foreground mb-4'>{t('xrayOutbounds.warpIntro')}</p>
        <div className='space-y-2 text-sm text-muted-foreground mb-6'>
          <p>{t('xrayOutbounds.warpStep1')}</p>
          <p>{t('xrayOutbounds.warpStep2')}</p>
          <p>{t('xrayOutbounds.warpStep3')}</p>
        </div>

        <Card className='mb-4'>
          <CardContent className='pt-6'>
            <h3 className='font-semibold mb-2'>{t('xrayOutbounds.warpAntiChinaHeading')}</h3>
            <p className='text-sm text-muted-foreground'>{t('xrayOutbounds.warpAntiChinaText')}</p>
          </CardContent>
        </Card>

        <h3 className='font-semibold mb-2'>{t('xrayOutbounds.warpNotesHeading')}</h3>
        <ul className='space-y-2 text-sm text-muted-foreground'>
          <li>- {t('xrayOutbounds.warpNote1')}</li>
          <li>- {t('xrayOutbounds.warpNote2')}</li>
        </ul>
      </section>
    </XDocLayout>
  )
}
