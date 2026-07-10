import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { XDocLayout } from '@/components/docs/x-doc-layout'
import { Card, CardContent } from '@/components/ui/card'
import { NodeManagementMock } from '@/components/docs/node-management-mock'

export const Route = createFileRoute('/docs/faq-node-management')({
  component: FaqNodeManagementPage,
})

function FaqNodeManagementPage() {
  const { t } = useTranslation('xdocs')

  return (
    <XDocLayout title={t('faqNodeMgmt.title')} description={t('faqNodeMgmt.description')}>
      <section className='mb-10 space-y-4'>
        <Card className='border-l-4 border-l-primary'>
          <CardContent className='pt-6'>
            <h3 className='font-semibold mb-2'>{t('faqNodeMgmt.overview.heading')}</h3>
            <p className='text-sm text-muted-foreground'>{t('faqNodeMgmt.overview.text')}</p>
          </CardContent>
        </Card>

        <NodeManagementMock />

        {/* 5 项功能详解 */}
        <div className='grid gap-3 sm:grid-cols-2'>
          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center gap-2 mb-2'>
                <span className='size-2.5 rounded-sm bg-red-500 shrink-0' />
                <h4 className='font-semibold text-sm'>{t('faqNodeMgmt.detail.add.heading')}</h4>
              </div>
              <p className='text-xs text-muted-foreground'>{t('faqNodeMgmt.detail.add.text')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center gap-2 mb-2'>
                <span className='size-2.5 rounded-sm bg-blue-500 shrink-0' />
                <h4 className='font-semibold text-sm'>{t('faqNodeMgmt.detail.routedRow.heading')}</h4>
              </div>
              <p className='text-xs text-muted-foreground'>{t('faqNodeMgmt.detail.routedRow.text')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center gap-2 mb-2'>
                <span className='size-2.5 rounded-sm bg-green-500 shrink-0' />
                <h4 className='font-semibold text-sm'>{t('faqNodeMgmt.detail.viewRow.heading')}</h4>
              </div>
              <p className='text-xs text-muted-foreground'>{t('faqNodeMgmt.detail.viewRow.text')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center gap-2 mb-2'>
                <span className='size-2.5 rounded-sm bg-black shrink-0' />
                <h4 className='font-semibold text-sm'>{t('faqNodeMgmt.detail.tunnel.heading')}</h4>
              </div>
              <p className='text-xs text-muted-foreground'>{t('faqNodeMgmt.detail.tunnel.text')}</p>
            </CardContent>
          </Card>

          <Card className='sm:col-span-2'>
            <CardContent className='pt-6'>
              <div className='flex items-center gap-2 mb-2'>
                <span className='size-2.5 rounded-sm bg-yellow-500 shrink-0' />
                <h4 className='font-semibold text-sm'>{t('faqNodeMgmt.detail.routedAll.heading')}</h4>
              </div>
              <p className='text-xs text-muted-foreground'>{t('faqNodeMgmt.detail.routedAll.text')}</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </XDocLayout>
  )
}
