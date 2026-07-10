import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { XDocLayout } from '@/components/docs/x-doc-layout'
import { Card, CardContent } from '@/components/ui/card'

export const Route = createFileRoute('/docs/faq-server-management')({
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
    <XDocLayout title={t('faq.serverManagement.heading')} description={t('faq.serverManagement.description')}>
      <section className='mb-10'>
        <FaqItem q={t('faq.serverManagement.q1')}>
          <p>{t('faq.serverManagement.a1')}</p>
        </FaqItem>
        <FaqItem q={t('faq.serverManagement.q2')}>
          <p>{t('faq.serverManagement.a2')}</p>
        </FaqItem>
      </section>
    </XDocLayout>
  )
}
