import { createFileRoute, Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { XDocLayout } from '@/components/docs/x-doc-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'

export const Route = createFileRoute('/docs/xray-inbounds')({
  component: XrayInboundsPage,
})

function XrayInboundsPage() {
  const { t } = useTranslation('xdocs')

  return (
    <XDocLayout title={t('xrayInbounds.title')} description={t('xrayInbounds.description')}>
      <Alert variant='destructive' className='mb-8 border-amber-400 bg-amber-50 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100 [&>svg]:text-amber-600 dark:[&>svg]:text-amber-400'>
        <AlertTriangle className='h-5 w-5' />
        <AlertTitle className='text-base font-bold'>{t('xrayInbounds.scopeAlertTitle')}</AlertTitle>
        <AlertDescription className='mt-2'>
          {t('xrayInbounds.scopeAlertText')} <Link to='/docs/nodes' className='underline font-medium'>{t('xrayInbounds.scopeAlertLink')}</Link>。
        </AlertDescription>
      </Alert>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('xrayInbounds.wizardHeading')}</h2>
        <p className='text-muted-foreground mb-4'>{t('xrayInbounds.wizardText')}</p>
        <Card>
          <CardContent className='pt-6'>
            <ol className='space-y-3 text-sm'>
              <li>{t('xrayInbounds.wizardStep1')}</li>
              <li>{t('xrayInbounds.wizardStep2')}</li>
              <li>{t('xrayInbounds.wizardStep3')}</li>
              <li>{t('xrayInbounds.wizardStep4')}</li>
              <li>{t('xrayInbounds.wizardStep5')}</li>
              <li>{t('xrayInbounds.wizardStep6')}</li>
            </ol>
          </CardContent>
        </Card>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('xrayInbounds.combinationsHeading')}</h2>
        <p className='text-muted-foreground mb-4'>
          {t('xrayInbounds.combinationsText')} <Link to='/docs/protocol-matrix' className='text-primary hover:underline'>{t('xrayInbounds.protocolMatrixLink')}</Link>{t('xrayInbounds.combinationsTextSuffix')}
        </p>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead><tr className='border-b'><th className='text-left py-3 px-4'>{t('xrayInbounds.protocolCol')}</th><th className='text-left py-3 px-4'>{t('xrayInbounds.transportCol')}</th><th className='text-left py-3 px-4'>{t('xrayInbounds.securityCol')}</th></tr></thead>
            <tbody>
              <tr className='border-b'><td className='py-3 px-4'>VLESS</td><td className='py-3 px-4'>TCP, WS, gRPC, XHTTP</td><td className='py-3 px-4'>TLS, REALITY, XTLS-Vision</td></tr>
              <tr className='border-b'><td className='py-3 px-4'>VMess</td><td className='py-3 px-4'>TCP, WS</td><td className='py-3 px-4'>TLS, None</td></tr>
              <tr className='border-b'><td className='py-3 px-4'>Trojan</td><td className='py-3 px-4'>TCP, gRPC</td><td className='py-3 px-4'>TLS, REALITY</td></tr>
              <tr className='border-b'><td className='py-3 px-4'>Shadowsocks</td><td className='py-3 px-4'>TCP</td><td className='py-3 px-4'>None</td></tr>
              <tr><td className='py-3 px-4'>Hysteria2</td><td className='py-3 px-4'>UDP</td><td className='py-3 px-4'>TLS</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('xrayInbounds.operationsHeading')}</h2>
        <ul className='space-y-2 text-sm text-muted-foreground'>
          <li>- {t('xrayInbounds.op1')}</li>
          <li>- {t('xrayInbounds.op2')}</li>
          <li>- {t('xrayInbounds.op3')}</li>
          <li>- {t('xrayInbounds.op4')}</li>
        </ul>
      </section>

      <section>
        <h2 className='text-2xl font-bold mb-4'>{t('xrayInbounds.autoSyncHeading')}</h2>
        <p className='text-muted-foreground'>{t('xrayInbounds.autoSyncText')}</p>
      </section>
    </XDocLayout>
  )
}
