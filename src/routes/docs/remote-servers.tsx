import { createFileRoute, Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { XDocLayout } from '@/components/docs/x-doc-layout'
import { Screenshot } from '@/components/docs/screenshot'
import { Card, CardContent } from '@/components/ui/card'

export const Route = createFileRoute('/docs/remote-servers')({
  component: RemoteServersPage,
})

function RemoteServersPage() {
  const { t } = useTranslation('xdocs')

  return (
    <XDocLayout title={t('remoteServers.title')} description={t('remoteServers.description')}>
      <Screenshot
        src='/images/screenshots/doc-xray-servers-page.webp'
        alt={t('remoteServers.screenshot.alt')}
        caption={t('remoteServers.screenshot.caption')}
      />
      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('remoteServers.overview')}</h2>
        <p className='text-muted-foreground mb-4'>{t('remoteServers.overviewText')}</p>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('remoteServers.addServerHeading')}</h2>
        <Card>
          <CardContent className='pt-6'>
            <ol className='space-y-3 text-sm'>
              <li>{t('remoteServers.addStep1')}</li>
              <li>{t('remoteServers.addStep2')}</li>
              <li>{t('remoteServers.addStep3')}</li>
              <li>{t('remoteServers.addStep4')}</li>
              <li>{t('remoteServers.addStep5')}</li>
              <li>{t('remoteServers.addStep6')}</li>
              <li>{t('remoteServers.addStep7')}</li>
            </ol>
          </CardContent>
        </Card>
        <Card className='mt-4 border-blue-200 dark:border-blue-900'>
          <CardContent className='pt-6'>
            <p className='text-sm'>
              <strong>{t('remoteServers.deployMethodsLabel')}:</strong> {t('remoteServers.deployMethodsText')}{' '}
              <Link to='/docs/install-agent' className='text-primary hover:underline font-medium'>
                {t('remoteServers.deployMethodsLink')}
              </Link>。
            </p>
          </CardContent>
        </Card>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('remoteServers.connectionModeHeading')}</h2>
        <div className='grid gap-4 md:grid-cols-2'>
          <Card>
            <CardContent className='pt-6'>
              <h3 className='font-semibold mb-2'>{t('remoteServers.wsRecommended')}</h3>
              <p className='text-sm text-muted-foreground'>{t('remoteServers.wsDesc')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='pt-6'>
              <h3 className='font-semibold mb-2'>HTTP</h3>
              <p className='text-sm text-muted-foreground'>{t('remoteServers.httpDesc')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='pt-6'>
              <h3 className='font-semibold mb-2'>Pull</h3>
              <p className='text-sm text-muted-foreground'>{t('remoteServers.pullDesc')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='pt-6'>
              <h3 className='font-semibold mb-2'>Auto</h3>
              <p className='text-sm text-muted-foreground'>{t('remoteServers.autoDesc')}</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('remoteServers.tokenHeading')}</h2>
        <p className='text-muted-foreground mb-4'>{t('remoteServers.tokenText')}</p>
        <ul className='space-y-2 text-sm text-muted-foreground'>
          <li>- {t('remoteServers.serverToken')}</li>
          <li>- {t('remoteServers.agentToken')}</li>
        </ul>
        <p className='text-sm text-muted-foreground mt-4'>{t('remoteServers.tokenResetNote')}</p>
      </section>

      <section>
        <h2 className='text-2xl font-bold mb-4'>{t('remoteServers.statusHeading')}</h2>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead><tr className='border-b'><th className='text-left py-3 px-4'>{t('remoteServers.statusCol')}</th><th className='text-left py-3 px-4'>{t('remoteServers.descCol')}</th></tr></thead>
            <tbody>
              <tr className='border-b'><td className='py-3 px-4 font-mono text-green-600'>connected</td><td className='py-3 px-4'>{t('remoteServers.statusConnected')}</td></tr>
              <tr className='border-b'><td className='py-3 px-4 font-mono text-yellow-600'>disconnected</td><td className='py-3 px-4'>{t('remoteServers.statusDisconnected')}</td></tr>
              <tr><td className='py-3 px-4 font-mono text-gray-500'>pending</td><td className='py-3 px-4'>{t('remoteServers.statusPending')}</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('remoteServers.trafficSourceHeading')}</h2>
        <p className='text-muted-foreground mb-4'>{t('remoteServers.trafficSourceText')}</p>
        <div className='grid gap-4 md:grid-cols-2'>
          <Card>
            <CardContent className='pt-6'>
              <h3 className='font-semibold mb-2'>{t('remoteServers.trafficSourceSystemName')}</h3>
              <p className='text-sm text-muted-foreground'>{t('remoteServers.trafficSourceSystemDesc')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='pt-6'>
              <h3 className='font-semibold mb-2'>{t('remoteServers.trafficSourceXrayName')}</h3>
              <p className='text-sm text-muted-foreground'>{t('remoteServers.trafficSourceXrayDesc')}</p>
            </CardContent>
          </Card>
        </div>
        <div className='mt-4 space-y-2'>
          <Card className='border-blue-200 dark:border-blue-900'>
            <CardContent className='pt-6 text-sm'>
              <p className='font-medium mb-1'>{t('remoteServers.trafficSourceSwitchLabel')}</p>
              <p className='text-muted-foreground'>{t('remoteServers.trafficSourceSwitchNote')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='pt-6 text-sm text-muted-foreground'>
              <p className='mb-2'>{t('remoteServers.trafficSourceStatsModeNote')}</p>
              <p>{t('remoteServers.trafficSourceUnaffected')}</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('remoteServers.batchUpgradeHeading')}</h2>
        <p className='text-muted-foreground'>{t('remoteServers.batchUpgradeText')}</p>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('remoteServers.shareHeading')}</h2>
        <p className='text-muted-foreground mb-4'>{t('remoteServers.shareText')}</p>
        <div className='space-y-4'>
          <Card>
            <CardContent className='pt-6'>
              <h3 className='font-semibold mb-2'>{t('remoteServers.shareOwnerHeading')}</h3>
              <p className='text-sm text-muted-foreground'>{t('remoteServers.shareOwnerText')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='pt-6'>
              <h3 className='font-semibold mb-2'>{t('remoteServers.shareConsumerHeading')}</h3>
              <p className='text-sm text-muted-foreground'>{t('remoteServers.shareConsumerText')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='pt-6 text-sm text-muted-foreground'>{t('remoteServers.shareSecurityNote')}</CardContent>
          </Card>
        </div>
      </section>
    </XDocLayout>
  )
}
