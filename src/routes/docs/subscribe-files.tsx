import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { XDocLayout } from '@/components/docs/x-doc-layout'
import { Screenshot } from '@/components/docs/screenshot'
import { Card, CardContent } from '@/components/ui/card'

export const Route = createFileRoute('/docs/subscribe-files')({
  component: SubscribeFilesPage,
})

function SubscribeFilesPage() {
  const { t } = useTranslation('xdocs')

  return (
    <XDocLayout title={t('subscribeFiles.title')} description={t('subscribeFiles.description')}>
      <Screenshot
        src='/images/screenshots/doc-subscribe-files-list.webp'
        alt={t('subscribeFiles.screenshot.alt')}
        caption={t('subscribeFiles.screenshot.caption')}
      />
      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('subscribeFiles.overview.heading')}</h2>
        <p className='text-muted-foreground'>{t('subscribeFiles.overview.text')}</p>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('subscribeFiles.formats.heading')}</h2>
        <ul className='space-y-2 text-sm text-muted-foreground'>
          <li>{t('subscribeFiles.formats.item1')}</li>
          <li>{t('subscribeFiles.formats.item2')}</li>
          <li>{t('subscribeFiles.formats.item3')}</li>
        </ul>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('subscribeFiles.addSub.heading')}</h2>
        <Card>
          <CardContent className='pt-6'>
            <div className='text-sm space-y-3 text-muted-foreground'>
              <p>{t('subscribeFiles.addSub.step1')}</p>
              <p>{t('subscribeFiles.addSub.step2')}</p>
              <p>{t('subscribeFiles.addSub.step3')}</p>
              <p>{t('subscribeFiles.addSub.step4')}</p>
              <p>{t('subscribeFiles.addSub.step5')}</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('subscribeFiles.autoUpdate.heading')}</h2>
        <p className='text-muted-foreground mb-4'>
          {t('subscribeFiles.autoUpdate.text')}
        </p>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead><tr className='border-b'><th className='text-left py-3 px-4'>{t('subscribeFiles.autoUpdate.intervalCol')}</th><th className='text-left py-3 px-4'>{t('subscribeFiles.autoUpdate.scenarioCol')}</th></tr></thead>
            <tbody>
              <tr className='border-b'><td className='py-3 px-4'>{t('subscribeFiles.autoUpdate.manual')}</td><td className='py-3 px-4'>{t('subscribeFiles.autoUpdate.manualDesc')}</td></tr>
              <tr className='border-b'><td className='py-3 px-4'>{t('subscribeFiles.autoUpdate.hourly')}</td><td className='py-3 px-4'>{t('subscribeFiles.autoUpdate.hourlyDesc')}</td></tr>
              <tr className='border-b'><td className='py-3 px-4'>{t('subscribeFiles.autoUpdate.daily')}</td><td className='py-3 px-4'>{t('subscribeFiles.autoUpdate.dailyDesc')}</td></tr>
              <tr><td className='py-3 px-4'>{t('subscribeFiles.autoUpdate.custom')}</td><td className='py-3 px-4'>{t('subscribeFiles.autoUpdate.customDesc')}</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className='text-2xl font-bold mb-4'>{t('subscribeFiles.notes.heading')}</h2>
        <ul className='space-y-2 text-sm text-muted-foreground'>
          <li>{t('subscribeFiles.notes.item1')}</li>
          <li>{t('subscribeFiles.notes.item2')}</li>
          <li>{t('subscribeFiles.notes.item3')}</li>
        </ul>
      </section>
    </XDocLayout>
  )
}
