import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { XDocLayout } from '@/components/docs/x-doc-layout'
import { Screenshot } from '@/components/docs/screenshot'
import { Card, CardContent } from '@/components/ui/card'

export const Route = createFileRoute('/docs/generator')({
  component: GeneratorPage,
})

function GeneratorPage() {
  const { t } = useTranslation('xdocs')

  return (
    <XDocLayout title={t('generator.title')} description={t('generator.description')}>
      <Screenshot
        src='/images/screenshots/doc-generator-page.webp'
        alt={t('generator.screenshot.alt')}
        caption={t('generator.screenshot.caption')}
      />
      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('generator.overview.heading')}</h2>
        <p className='text-muted-foreground'>{t('generator.overview.text')}</p>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('generator.clientFormats.heading')}</h2>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead><tr className='border-b'><th className='text-left py-3 px-4'>{t('generator.clientFormats.formatCol')}</th><th className='text-left py-3 px-4'>{t('generator.clientFormats.clientCol')}</th><th className='text-left py-3 px-4'>{t('generator.clientFormats.platformCol')}</th></tr></thead>
            <tbody>
              <tr className='border-b'><td className='py-3 px-4'>Clash/ClashMeta</td><td className='py-3 px-4'>mihomo, Clash Verge</td><td className='py-3 px-4'>{t('generator.clientFormats.allPlatforms')}</td></tr>
              <tr className='border-b'><td className='py-3 px-4'>Surge</td><td className='py-3 px-4'>Surge</td><td className='py-3 px-4'>macOS / iOS</td></tr>
              <tr className='border-b'><td className='py-3 px-4'>Loon</td><td className='py-3 px-4'>Loon</td><td className='py-3 px-4'>iOS</td></tr>
              <tr className='border-b'><td className='py-3 px-4'>Quantumult X</td><td className='py-3 px-4'>Quantumult X</td><td className='py-3 px-4'>iOS</td></tr>
              <tr className='border-b'><td className='py-3 px-4'>Shadowrocket</td><td className='py-3 px-4'>Shadowrocket</td><td className='py-3 px-4'>iOS</td></tr>
              <tr className='border-b'><td className='py-3 px-4'>SingBox</td><td className='py-3 px-4'>sing-box</td><td className='py-3 px-4'>{t('generator.clientFormats.allPlatforms')}</td></tr>
              <tr className='border-b'><td className='py-3 px-4'>Stash</td><td className='py-3 px-4'>Stash</td><td className='py-3 px-4'>macOS / iOS</td></tr>
              <tr className='border-b'><td className='py-3 px-4'>Surfboard</td><td className='py-3 px-4'>Surfboard</td><td className='py-3 px-4'>Android</td></tr>
              <tr className='border-b'><td className='py-3 px-4'>V2Ray</td><td className='py-3 px-4'>V2RayN, V2RayNG</td><td className='py-3 px-4'>Windows / Android</td></tr>
              <tr><td className='py-3 px-4'>Egern</td><td className='py-3 px-4'>Egern</td><td className='py-3 px-4'>iOS</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('generator.subLink.heading')}</h2>
        <Card>
          <CardContent className='pt-6'>
            <div className='bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto'>
              <pre>{`https://your-domain.com/api/clash/subscribe?token=<用户Token>&format=<格式>`}</pre>
            </div>
            <div className='mt-4 text-sm text-muted-foreground space-y-1'>
              <p><code className='bg-muted px-1.5 py-0.5 rounded'>token</code> — {t('generator.subLink.tokenDesc')}</p>
              <p><code className='bg-muted px-1.5 py-0.5 rounded'>format</code> — {t('generator.subLink.formatDesc')}</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className='text-2xl font-bold mb-4'>{t('generator.conversionFlow.heading')}</h2>
        <div className='text-sm text-muted-foreground space-y-2'>
          <p>{t('generator.conversionFlow.step1')}</p>
          <p>{t('generator.conversionFlow.step2')}</p>
          <p>{t('generator.conversionFlow.step3')}</p>
          <p>{t('generator.conversionFlow.step4')}</p>
          <p>{t('generator.conversionFlow.step5')}</p>
        </div>
      </section>
    </XDocLayout>
  )
}
