import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { XDocLayout } from '@/components/docs/x-doc-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Screenshot } from '@/components/docs/screenshot'

export const Route = createFileRoute('/docs/tool-cloudflare-turnstile')({
  component: ToolCloudflareTurnstilePage,
})

function ToolCloudflareTurnstilePage() {
  const { t } = useTranslation('xdocs')

  return (
    <XDocLayout title={t('toolCloudflareTurnstile.title')} description={t('toolCloudflareTurnstile.description')}>
      {/* 概述 */}
      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('toolCloudflareTurnstile.overview.heading')}</h2>
        <p className='text-muted-foreground mb-4'>{t('toolCloudflareTurnstile.overview.text1')}</p>
        <p className='text-muted-foreground'>{t('toolCloudflareTurnstile.overview.text2')}</p>
      </section>

      {/* 前置准备 */}
      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('toolCloudflareTurnstile.prereq.heading')}</h2>
        <Card>
          <CardContent className='pt-6'>
            <p className='text-sm text-muted-foreground'>{t('toolCloudflareTurnstile.prereq.text')}</p>
          </CardContent>
        </Card>
      </section>

      {/* 第 1 步:在 CF Dashboard 申请 */}
      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('toolCloudflareTurnstile.step1.heading')}</h2>
        <p className='text-muted-foreground mb-4'>{t('toolCloudflareTurnstile.step1.intro')}</p>
        <div className='space-y-3'>
          <Card><CardContent className='pt-5'><h3 className='font-semibold mb-2'>1. {t('toolCloudflareTurnstile.step1.s1Heading')}</h3><p className='text-sm text-muted-foreground'>{t('toolCloudflareTurnstile.step1.s1Text')}</p></CardContent></Card>
          <Card><CardContent className='pt-5'><h3 className='font-semibold mb-2'>2. {t('toolCloudflareTurnstile.step1.s2Heading')}</h3><p className='text-sm text-muted-foreground'>{t('toolCloudflareTurnstile.step1.s2Text')}</p></CardContent></Card>
          <Card>
            <CardContent className='pt-5'>
              <h3 className='font-semibold mb-2'>3. {t('toolCloudflareTurnstile.step1.s3Heading')}</h3>
              <p className='text-sm text-muted-foreground mb-3'>{t('toolCloudflareTurnstile.step1.s3Text')}</p>
              <div className='overflow-x-auto'>
                <table className='w-full text-sm'>
                  <thead><tr className='border-b'><th className='text-left py-2 px-3'>{t('toolCloudflareTurnstile.step1.colField')}</th><th className='text-left py-2 px-3'>{t('toolCloudflareTurnstile.step1.colValue')}</th></tr></thead>
                  <tbody>
                    <tr className='border-b'><td className='py-2 px-3 font-mono text-xs'>Site Name</td><td className='py-2 px-3'>{t('toolCloudflareTurnstile.step1.fSiteName')}</td></tr>
                    <tr className='border-b'><td className='py-2 px-3 font-mono text-xs'>Domain</td><td className='py-2 px-3'>{t('toolCloudflareTurnstile.step1.fDomain')}</td></tr>
                    <tr className='border-b'><td className='py-2 px-3 font-mono text-xs'>Widget Mode</td><td className='py-2 px-3'>{t('toolCloudflareTurnstile.step1.fWidgetMode')}</td></tr>
                    <tr><td className='py-2 px-3 font-mono text-xs'>Pre-clearance</td><td className='py-2 px-3'>{t('toolCloudflareTurnstile.step1.fPreClearance')}</td></tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          <Card><CardContent className='pt-5'><h3 className='font-semibold mb-2'>4. {t('toolCloudflareTurnstile.step1.s4Heading')}</h3><p className='text-sm text-muted-foreground'>{t('toolCloudflareTurnstile.step1.s4Text')}</p></CardContent></Card>
        </div>
      </section>

      {/* 第 2 步:配回妙妙屋X */}
      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('toolCloudflareTurnstile.step2.heading')}</h2>
        <p className='text-muted-foreground mb-4'>{t('toolCloudflareTurnstile.step2.intro')}</p>
        <div className='space-y-3'>
          <Card><CardContent className='pt-5'><h3 className='font-semibold mb-2'>1. {t('toolCloudflareTurnstile.step2.s1Heading')}</h3><p className='text-sm text-muted-foreground'>{t('toolCloudflareTurnstile.step2.s1Text')}</p></CardContent></Card>
          <Card><CardContent className='pt-5'><h3 className='font-semibold mb-2'>2. {t('toolCloudflareTurnstile.step2.s2Heading')}</h3><p className='text-sm text-muted-foreground'>{t('toolCloudflareTurnstile.step2.s2Text')}</p></CardContent></Card>
          <Screenshot
            src='/images/screenshots/system-settings-turnstile-empty.webp'
            alt={t('toolCloudflareTurnstile.screenshots.turnstileEmptyAlt')}
            caption={t('toolCloudflareTurnstile.screenshots.turnstileEmpty')}
          />
          <Card><CardContent className='pt-5'><h3 className='font-semibold mb-2'>3. {t('toolCloudflareTurnstile.step2.s3Heading')}</h3><p className='text-sm text-muted-foreground'>{t('toolCloudflareTurnstile.step2.s3Text')}</p></CardContent></Card>
          <Screenshot
            src='/images/screenshots/system-settings-turnstile-filled.webp'
            alt={t('toolCloudflareTurnstile.screenshots.turnstileFilledAlt')}
            caption={t('toolCloudflareTurnstile.screenshots.turnstileFilled')}
          />
        </div>
      </section>

      {/* 第 3 步:验证生效 */}
      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('toolCloudflareTurnstile.step3.heading')}</h2>
        <Screenshot
          src='/images/screenshots/login-page-with-widget.webp'
          alt={t('toolCloudflareTurnstile.screenshots.loginWidgetAlt')}
          caption={t('toolCloudflareTurnstile.screenshots.loginWidget')}
        />
        <Card>
          <CardContent className='pt-6'>
            <ul className='text-sm text-muted-foreground space-y-2 list-disc list-inside'>
              <li>{t('toolCloudflareTurnstile.step3.bullet1')}</li>
              <li>{t('toolCloudflareTurnstile.step3.bullet2')}</li>
              <li>{t('toolCloudflareTurnstile.step3.bullet3')}</li>
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* FAQ */}
      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('toolCloudflareTurnstile.faq.heading')}</h2>
        <div className='space-y-3'>
          <Card><CardContent className='pt-5'><h3 className='font-semibold mb-2'>{t('toolCloudflareTurnstile.faq.q1')}</h3><p className='text-sm text-muted-foreground'>{t('toolCloudflareTurnstile.faq.a1')}</p></CardContent></Card>
          <Card><CardContent className='pt-5'><h3 className='font-semibold mb-2'>{t('toolCloudflareTurnstile.faq.q2')}</h3><p className='text-sm text-muted-foreground'>{t('toolCloudflareTurnstile.faq.a2')}</p></CardContent></Card>
          <Card><CardContent className='pt-5'><h3 className='font-semibold mb-2'>{t('toolCloudflareTurnstile.faq.q3')}</h3><p className='text-sm text-muted-foreground'>{t('toolCloudflareTurnstile.faq.a3')}</p></CardContent></Card>
          <Card><CardContent className='pt-5'><h3 className='font-semibold mb-2'>{t('toolCloudflareTurnstile.faq.q4')}</h3><p className='text-sm text-muted-foreground'>{t('toolCloudflareTurnstile.faq.a4')}</p></CardContent></Card>
        </div>
      </section>

      {/* 延伸阅读 */}
      <section>
        <h2 className='text-2xl font-bold mb-4'>{t('toolCloudflareTurnstile.links.heading')}</h2>
        <ul className='space-y-2 text-sm'>
          <li>
            <a href='https://developers.cloudflare.com/turnstile/' target='_blank' rel='noopener noreferrer' className='text-primary hover:underline'>
              {t('toolCloudflareTurnstile.links.cfDocs')}
            </a>
          </li>
          <li>
            <a href='https://dash.cloudflare.com/?to=/:account/turnstile' target='_blank' rel='noopener noreferrer' className='text-primary hover:underline'>
              {t('toolCloudflareTurnstile.links.cfDashboard')}
            </a>
          </li>
        </ul>
      </section>
    </XDocLayout>
  )
}
