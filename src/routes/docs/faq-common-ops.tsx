import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { XDocLayout } from '@/components/docs/x-doc-layout'
import { Card, CardContent } from '@/components/ui/card'

export const Route = createFileRoute('/docs/faq-common-ops')({
  component: Page,
})

function FaqItem({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <Card className='mb-4'>
      <CardContent className='pt-6'>
        <h3 className='font-semibold mb-2'>{q}</h3>
        <div className='text-sm text-muted-foreground space-y-2'>{children}</div>
      </CardContent>
    </Card>
  )
}

function Page() {
  const { t } = useTranslation('xdocs')

  return (
    <XDocLayout title={t('faq.commonOps.heading')} description={t('faq.commonOps.description')}>
      <section className='mb-10'>
        <FaqItem q={t('faq.commonOps.q1')}>
          <p>{t('faq.commonOps.a1')}</p>
        </FaqItem>
        <FaqItem q={t('faq.commonOps.q2')}>
          <p>{t('faq.commonOps.a2')}</p>
        </FaqItem>
        <FaqItem q={t('faq.commonOps.q3')}>
          <p>{t('faq.commonOps.a3p1')}</p>
          <p>{t('faq.commonOps.a3p2')}</p>
          <p>{t('faq.commonOps.a3p3')}</p>
          <p>{t('faq.commonOps.a3p4')}</p>
        </FaqItem>
        <FaqItem q={t('faq.commonOps.q4')}>
          <p>{t('faq.commonOps.a4')}</p>
        </FaqItem>
        <FaqItem q={t('faq.commonOps.q5')}>
          <p>{t('faq.commonOps.a5p1')}</p>
          <p>{t('faq.commonOps.a5p2')}</p>
          <p>{t('faq.commonOps.a5p3')}</p>
          <p>{t('faq.commonOps.a5p4')}</p>
          <p>{t('faq.commonOps.a5p5')}</p>
          <p>{t('faq.commonOps.a5p6')}</p>
          <p>{t('faq.commonOps.a5p7')}</p>
        </FaqItem>
      </section>
    </XDocLayout>
  )
}
