import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { XDocLayout } from '@/components/docs/x-doc-layout'

export const Route = createFileRoute('/docs/xray-system-config')({
  component: XraySystemConfigPage,
})

function XraySystemConfigPage() {
  const { t } = useTranslation('xdocs')

  return (
    <XDocLayout title={t('xraySystemConfig.title')} description={t('xraySystemConfig.description')}>
      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('xraySystemConfig.overview')}</h2>
        <p className='text-muted-foreground mb-4'>{t('xraySystemConfig.overviewText')}</p>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('xraySystemConfig.configItemsHeading')}</h2>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead><tr className='border-b'><th className='text-left py-3 px-4'>{t('xraySystemConfig.configCol')}</th><th className='text-left py-3 px-4'>{t('xraySystemConfig.descCol')}</th></tr></thead>
            <tbody>
              <tr className='border-b'><td className='py-3 px-4'>{t('xraySystemConfig.logLevel')}</td><td className='py-3 px-4'>none / error / warning / info / debug</td></tr>
              <tr className='border-b'><td className='py-3 px-4'>DNS</td><td className='py-3 px-4'>{t('xraySystemConfig.dnsDesc')}</td></tr>
              <tr className='border-b'><td className='py-3 px-4'>{t('xraySystemConfig.policy')}</td><td className='py-3 px-4'>{t('xraySystemConfig.policyDesc')}</td></tr>
              <tr className='border-b'><td className='py-3 px-4'>{t('xraySystemConfig.stats')}</td><td className='py-3 px-4'>{t('xraySystemConfig.statsDesc')}</td></tr>
              <tr><td className='py-3 px-4'>API</td><td className='py-3 px-4'>{t('xraySystemConfig.apiDesc')}</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className='text-2xl font-bold mb-4'>{t('xraySystemConfig.notesHeading')}</h2>
        <ul className='space-y-2 text-sm text-muted-foreground'>
          <li>- {t('xraySystemConfig.note1')}</li>
          <li>- {t('xraySystemConfig.note2')}</li>
          <li>- {t('xraySystemConfig.note3')}</li>
        </ul>
      </section>
    </XDocLayout>
  )
}
