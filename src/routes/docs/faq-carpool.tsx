import { createFileRoute, Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { XDocLayout } from '@/components/docs/x-doc-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Screenshot } from '@/components/docs/screenshot'
import { Info, Bot, ShieldCheck } from 'lucide-react'

export const Route = createFileRoute('/docs/faq-carpool')({
  component: FaqCarpoolPage,
})

function FaqCarpoolPage() {
  const { t } = useTranslation('xdocs')

  return (
    <XDocLayout title={t('faq.carpool.heading')} description={t('faq.carpool.metering.text')}>
      <section className='mb-10'>
        {/* 流量计量方式说明 */}
        <Card className='mb-4 border-l-4 border-l-primary'>
          <CardContent className='pt-6'>
            <h3 className='font-semibold mb-2'>{t('faq.carpool.metering.heading')}</h3>
            <p className='text-sm text-muted-foreground'>{t('faq.carpool.metering.text')}</p>
          </CardContent>
        </Card>

        {/* 4 步操作 */}
        <h3 className='text-lg font-semibold mb-3 mt-6'>{t('faq.carpool.stepsHeading')}</h3>

        <Card className='mb-4'>
          <CardContent className='pt-6'>
            <h4 className='font-semibold mb-2'>{t('faq.carpool.step1.heading')}</h4>
            <p className='text-sm text-muted-foreground mb-3'>{t('faq.carpool.step1.text')}</p>
            <Screenshot
              src='/images/screenshots/doc-xray-servers-page.webp'
              alt={t('faq.carpool.step1.alt')}
              caption={t('faq.carpool.step1.caption')}
            />
          </CardContent>
        </Card>

        <Card className='mb-4'>
          <CardContent className='pt-6'>
            <h4 className='font-semibold mb-2'>{t('faq.carpool.step2.heading')}</h4>
            <p className='text-sm text-muted-foreground mb-3'>{t('faq.carpool.step2.text')}</p>
            <Screenshot
              src='/images/screenshots/doc-nodes-page.webp'
              alt={t('faq.carpool.step2.alt')}
              caption={t('faq.carpool.step2.caption')}
            />
          </CardContent>
        </Card>

        <Card className='mb-4'>
          <CardContent className='pt-6'>
            <h4 className='font-semibold mb-2'>{t('faq.carpool.step3.heading')}</h4>
            <p className='text-sm text-muted-foreground mb-3'>{t('faq.carpool.step3.text')}</p>
            <Screenshot
              src='/images/screenshots/tutorial-step9-package-create-dialog.webp'
              alt={t('faq.carpool.step3.alt')}
              caption={t('faq.carpool.step3.caption')}
            />
          </CardContent>
        </Card>

        <Card className='mb-4'>
          <CardContent className='pt-6'>
            <h4 className='font-semibold mb-2'>{t('faq.carpool.step4.heading')}</h4>
            <p className='text-sm text-muted-foreground mb-3'>{t('faq.carpool.step4.text')}</p>
            <Screenshot
              src='/images/screenshots/tutorial-step10-users-list.webp'
              alt={t('faq.carpool.step4.alt')}
              caption={t('faq.carpool.step4.caption')}
            />
            <Screenshot
              src='/images/screenshots/tutorial-step10-bind-package-dialog.webp'
              alt={t('faq.carpool.step4.bindAlt')}
              caption={t('faq.carpool.step4.bindCaption')}
            />
          </CardContent>
        </Card>

        {/* Tips */}
        <div className='flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 mb-6'>
          <Info className='size-4 text-blue-500 mt-0.5 shrink-0' />
          <p className='text-sm text-blue-700 dark:text-blue-400'>{t('faq.carpool.tips')}</p>
        </div>

        {/* 小工具 */}
        <h3 className='text-lg font-semibold mt-8 mb-3'>{t('faq.carpool.toolsHeading')}</h3>

        <Card className='mb-4'>
          <CardContent className='pt-6'>
            <h4 className='font-semibold mb-2 flex items-center gap-2'>
              <Bot className='size-5 text-primary' />
              {t('faq.carpool.tgbot.heading')}
            </h4>
            <p className='text-sm text-muted-foreground mb-3'>{t('faq.carpool.tgbot.text')}</p>
            <p className='text-sm text-muted-foreground mb-3'>
              {t('faq.carpool.tgbot.linkPre')}{' '}
              <Link to='/docs/tool-mmwx-tgbot' className='text-primary hover:underline'>
                {t('faq.carpool.tgbot.linkLabel')}
              </Link>
            </p>
            <div className='grid grid-cols-2 gap-3'>
              <Screenshot
                src='/images/screenshots/tutorial-step12-miniapp-admin.webp'
                alt={t('faq.carpool.tgbot.adminAlt')}
                caption={t('faq.carpool.tgbot.adminCaption')}
              />
              <Screenshot
                src='/images/screenshots/tutorial-step12-miniapp-user.webp'
                alt={t('faq.carpool.tgbot.userAlt')}
                caption={t('faq.carpool.tgbot.userCaption')}
              />
            </div>
          </CardContent>
        </Card>

        <Card className='mb-4'>
          <CardContent className='pt-6'>
            <h4 className='font-semibold mb-2 flex items-center gap-2'>
              <ShieldCheck className='size-5 text-primary' />
              {t('faq.carpool.mcp.heading')}
            </h4>
            <p className='text-sm text-muted-foreground mb-3'>{t('faq.carpool.mcp.text')}</p>
            <p className='text-sm text-muted-foreground mb-3'>
              {t('faq.carpool.mcp.linkPre')}{' '}
              <Link to='/docs/mcp' className='text-primary hover:underline'>
                {t('faq.carpool.mcp.linkLabel')}
              </Link>
            </p>
            <Screenshot
              src='/images/screenshots/system-settings-api-token.webp'
              alt={t('faq.carpool.mcp.alt')}
              caption={t('faq.carpool.mcp.caption')}
            />
          </CardContent>
        </Card>
      </section>
    </XDocLayout>
  )
}
