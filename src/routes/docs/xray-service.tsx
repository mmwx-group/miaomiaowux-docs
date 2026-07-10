import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { XDocLayout } from '@/components/docs/x-doc-layout'
import { Card, CardContent } from '@/components/ui/card'

export const Route = createFileRoute('/docs/xray-service')({
  component: XrayServicePage,
})

function XrayServicePage() {
  const { t } = useTranslation('xdocs')

  return (
    <XDocLayout title={t('xrayService.title')} description={t('xrayService.description')}>
      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('xrayService.xrayInstallHeading')}</h2>
        <Card>
          <CardContent className='pt-6'>
            <p className='text-muted-foreground mb-3'>{t('xrayService.xrayInstallText')}</p>
            <ul className='space-y-2 text-sm text-muted-foreground'>
              <li>- {t('xrayService.xrayInstall1')}</li>
              <li>- {t('xrayService.xrayInstall2')}</li>
              <li>- {t('xrayService.xrayInstall3')}</li>
              <li>- {t('xrayService.xrayInstall4')}</li>
            </ul>
          </CardContent>
        </Card>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('xrayService.nginxInstallHeading')}</h2>
        <Card>
          <CardContent className='pt-6'>
            <p className='text-muted-foreground mb-3'>{t('xrayService.nginxInstallText')}</p>
            <ul className='space-y-2 text-sm text-muted-foreground'>
              <li>- {t('xrayService.nginxInstall1')}</li>
              <li>- {t('xrayService.nginxInstall2')}</li>
              <li>- {t('xrayService.nginxInstall3')}</li>
            </ul>
          </CardContent>
        </Card>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('xrayService.controlHeading')}</h2>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead><tr className='border-b'><th className='text-left py-3 px-4'>{t('xrayService.operationCol')}</th><th className='text-left py-3 px-4'>{t('xrayService.descCol')}</th></tr></thead>
            <tbody>
              <tr className='border-b'><td className='py-3 px-4'>{t('xrayService.opStart')}</td><td className='py-3 px-4'>{t('xrayService.opStartDesc')}</td></tr>
              <tr className='border-b'><td className='py-3 px-4'>{t('xrayService.opStop')}</td><td className='py-3 px-4'>{t('xrayService.opStopDesc')}</td></tr>
              <tr className='border-b'><td className='py-3 px-4'>{t('xrayService.opRestart')}</td><td className='py-3 px-4'>{t('xrayService.opRestartDesc')}</td></tr>
              <tr className='border-b'><td className='py-3 px-4'>{t('xrayService.opUninstall')}</td><td className='py-3 px-4'>{t('xrayService.opUninstallDesc')}</td></tr>
              <tr><td className='py-3 px-4'>{t('xrayService.opScan')}</td><td className='py-3 px-4'>{t('xrayService.opScanDesc')}</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className='text-2xl font-bold mb-4'>{t('xrayService.configFileHeading')}</h2>
        <p className='text-muted-foreground'>{t('xrayService.configFileText')}</p>
      </section>
    </XDocLayout>
  )
}
