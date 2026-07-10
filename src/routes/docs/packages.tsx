import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { XDocLayout } from '@/components/docs/x-doc-layout'
import { Card, CardContent } from '@/components/ui/card'
import { PackagesDemo } from '@/components/docs/packages-demo'

export const Route = createFileRoute('/docs/packages')({
  component: PackagesPage,
})

function PackagesPage() {
  const { t } = useTranslation('xdocs')

  return (
    <XDocLayout title={t('packages.title')} description={t('packages.description')}>
      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('packages.demo.heading')}</h2>
        <p className='text-muted-foreground mb-4'>{t('packages.demo.description')}</p>
        <PackagesDemo />
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('packages.overview.heading')}</h2>
        <p className='text-muted-foreground'>{t('packages.overview.text')}</p>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('packages.attributes.heading')}</h2>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead><tr className='border-b'><th className='text-left py-3 px-4'>{t('packages.attributes.attrCol')}</th><th className='text-left py-3 px-4'>{t('packages.attributes.descCol')}</th></tr></thead>
            <tbody>
              <tr className='border-b'><td className='py-3 px-4'>{t('packages.attributes.name')}</td><td className='py-3 px-4'>{t('packages.attributes.nameDesc')}</td></tr>
              <tr className='border-b'><td className='py-3 px-4'>{t('packages.attributes.trafficQuota')}</td><td className='py-3 px-4'>{t('packages.attributes.trafficQuotaDesc')}</td></tr>
              <tr className='border-b'><td className='py-3 px-4'>{t('packages.attributes.validity')}</td><td className='py-3 px-4'>{t('packages.attributes.validityDesc')}</td></tr>
              <tr className='border-b'><td className='py-3 px-4'>{t('packages.attributes.nodeAccess')}</td><td className='py-3 px-4'>{t('packages.attributes.nodeAccessDesc')}</td></tr>
              <tr><td className='py-3 px-4'>{t('packages.attributes.rateLimit')}</td><td className='py-3 px-4'>{t('packages.attributes.rateLimitDesc')}</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('packages.createPackage.heading')}</h2>
        <Card>
          <CardContent className='pt-6'>
            <div className='text-sm space-y-3 text-muted-foreground'>
              <p>{t('packages.createPackage.step1')}</p>
              <p>{t('packages.createPackage.step2')}</p>
              <p>{t('packages.createPackage.step3')}</p>
              <p>{t('packages.createPackage.step4')}</p>
              <p>{t('packages.createPackage.step5')}</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('packages.rateLimitDevices.heading')}</h2>
        <p className='text-muted-foreground mb-4'>
          {t('packages.rateLimitDevices.text')}
        </p>
        <div className='space-y-4'>
          <Card>
            <CardContent className='pt-6'>
              <h3 className='font-semibold mb-2'>{t('packages.rateLimitDevices.rateLimitTitle')}</h3>
              <p className='text-sm text-muted-foreground'>
                {t('packages.rateLimitDevices.rateLimitText')}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='pt-6'>
              <h3 className='font-semibold mb-2'>{t('packages.rateLimitDevices.autoRateLimitTitle')}</h3>
              <p className='text-sm text-muted-foreground'>
                {t('packages.rateLimitDevices.autoRateLimitText')}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section>
        <h2 className='text-2xl font-bold mb-4'>{t('packages.trafficBilling.heading')}</h2>
        <p className='text-muted-foreground mb-4'>
          {t('packages.trafficBilling.text')}
        </p>
        <ul className='space-y-2 text-sm text-muted-foreground mb-4'>
          <li>{t('packages.trafficBilling.item1')}</li>
          <li>{t('packages.trafficBilling.item2')}</li>
          <li>{t('packages.trafficBilling.item3')}</li>
          <li>{t('packages.trafficBilling.item4')}</li>
        </ul>
        <Card>
          <CardContent className='pt-6 text-sm text-muted-foreground'>
            {t('packages.trafficBilling.displayNote')}
          </CardContent>
        </Card>
      </section>
    </XDocLayout>
  )
}
