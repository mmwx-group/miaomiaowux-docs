import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { XDocLayout } from '@/components/docs/x-doc-layout'
import { Card, CardContent } from '@/components/ui/card'
import { MigrationDemo } from '@/components/docs/migration-demo'

export const Route = createFileRoute('/docs/upgrade-from-mmw')({
  component: UpgradeFromMmwPage,
})

function UpgradeFromMmwPage() {
  const { t } = useTranslation('xdocs')

  return (
    <XDocLayout
      title={t('upgradeFromMmw.title')}
      description={t('upgradeFromMmw.description')}
    >
      {/* 完整迁移向导 mock 演示:5 步 / 全本地状态 / 跟主控 /migrate-from-mmw 一致 */}
      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('upgradeFromMmw.demo.heading')}</h2>
        <p className='text-muted-foreground mb-4'>{t('upgradeFromMmw.demo.intro')}</p>
        <MigrationDemo />
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('upgradeFromMmw.whoNeeds.heading')}</h2>
        <Card>
          <CardContent className='pt-6 text-sm text-muted-foreground space-y-2'>
            <p>{t('upgradeFromMmw.whoNeeds.intro')}</p>
            <ul className='list-disc pl-6 space-y-1'>
              <li>{t('upgradeFromMmw.whoNeeds.item1')}</li>
              <li>{t('upgradeFromMmw.whoNeeds.item2')}</li>
              <li>{t('upgradeFromMmw.whoNeeds.item3')}</li>
              <li>{t('upgradeFromMmw.whoNeeds.item4')}</li>
            </ul>
            <p className='pt-2'>{t('upgradeFromMmw.whoNeeds.conclusion')}</p>
          </CardContent>
        </Card>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('upgradeFromMmw.guarantees.heading')}</h2>
        <div className='grid gap-4 md:grid-cols-2'>
          <Card>
            <CardContent className='pt-6'>
              <h3 className='font-semibold mb-2 text-green-700 dark:text-green-400'>{t('upgradeFromMmw.guarantees.guaranteeTitle')}</h3>
              <ul className='text-sm text-muted-foreground list-disc pl-5 space-y-1'>
                <li>{t('upgradeFromMmw.guarantees.g1')}</li>
                <li>{t('upgradeFromMmw.guarantees.g2')}</li>
                <li>{t('upgradeFromMmw.guarantees.g3')}</li>
                <li>{t('upgradeFromMmw.guarantees.g4')}</li>
                <li>{t('upgradeFromMmw.guarantees.g5')}</li>
                <li>{t('upgradeFromMmw.guarantees.g6')}</li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='pt-6'>
              <h3 className='font-semibold mb-2 text-red-700 dark:text-red-400'>{t('upgradeFromMmw.guarantees.prereqTitle')}</h3>
              <ul className='text-sm text-muted-foreground list-disc pl-5 space-y-1'>
                <li>{t('upgradeFromMmw.guarantees.p1')}</li>
                <li>{t('upgradeFromMmw.guarantees.p2')}</li>
                <li>{t('upgradeFromMmw.guarantees.p3')}</li>
                <li>{t('upgradeFromMmw.guarantees.p4')}</li>
                <li>{t('upgradeFromMmw.guarantees.p5')}</li>
                <li>{t('upgradeFromMmw.guarantees.p6')}</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('upgradeFromMmw.entry.heading')}</h2>
        <Card>
          <CardContent className='pt-6 text-sm text-muted-foreground'>
            <p className='mb-3'>{t('upgradeFromMmw.entry.text')}</p>
            <p>{t('upgradeFromMmw.entry.time')}</p>
          </CardContent>
        </Card>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('upgradeFromMmw.step1.heading')}</h2>
        <Card>
          <CardContent className='pt-6 text-sm text-muted-foreground'>
            <p>{t('upgradeFromMmw.step1.text')}</p>
          </CardContent>
        </Card>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('upgradeFromMmw.step2.heading')}</h2>
        <div className='space-y-4'>
          <Card>
            <CardContent className='pt-6'>
              <h3 className='font-semibold mb-2'>{t('upgradeFromMmw.step2.autoMode')}</h3>
              <ol className='text-sm text-muted-foreground list-decimal pl-5 space-y-1'>
                <li>{t('upgradeFromMmw.step2.auto1')}</li>
                <li>{t('upgradeFromMmw.step2.auto2')}</li>
                <li>{t('upgradeFromMmw.step2.auto3')}</li>
                <li>{t('upgradeFromMmw.step2.auto4')}</li>
              </ol>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='pt-6'>
              <h3 className='font-semibold mb-2'>{t('upgradeFromMmw.step2.manualMode')}</h3>
              <p className='text-sm text-muted-foreground mb-2'>{t('upgradeFromMmw.step2.manualText')}</p>
              <pre className='bg-muted text-xs p-3 rounded overflow-x-auto'>{`# 在 mmw 机器上:
systemctl stop miaomiaowu
cd /path/to/miaomiaowu
zip -r /tmp/mmw-backup.zip data/ subscribes/
scp /tmp/mmw-backup.zip 你@mmwx 主控:/tmp/`}</pre>
              <p className='text-xs text-muted-foreground mt-2'>{t('upgradeFromMmw.step2.manualNote')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='pt-6 text-sm text-muted-foreground'>
              <strong>{t('upgradeFromMmw.step2.rollbackLabel')}</strong> {t('upgradeFromMmw.step2.rollbackText')}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('upgradeFromMmw.step3.heading')}</h2>
        <Card>
          <CardContent className='pt-6'>
            <h3 className='font-semibold mb-2'>{t('upgradeFromMmw.step3.importTypes')}</h3>
            <ul className='text-sm text-muted-foreground list-disc pl-5 space-y-1 mb-3'>
              <li>{t('upgradeFromMmw.step3.importAuto')}</li>
              <li>{t('upgradeFromMmw.step3.importUpload')}</li>
            </ul>
            <h3 className='font-semibold mb-2'>{t('upgradeFromMmw.step3.whatItDoes')}</h3>
            <ul className='text-sm text-muted-foreground list-disc pl-5 space-y-1'>
              <li>{t('upgradeFromMmw.step3.does1')}</li>
              <li>{t('upgradeFromMmw.step3.does2')}</li>
              <li>{t('upgradeFromMmw.step3.does3')}</li>
              <li>{t('upgradeFromMmw.step3.does4')}</li>
              <li>{t('upgradeFromMmw.step3.does5')}</li>
            </ul>
            <p className='text-xs text-muted-foreground mt-3'>{t('upgradeFromMmw.step3.transactionNote')}</p>
          </CardContent>
        </Card>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('upgradeFromMmw.step4.heading')}</h2>
        <div className='space-y-4'>
          <Card>
            <CardContent className='pt-6'>
              <p className='text-sm text-muted-foreground mb-3'>
                {t('upgradeFromMmw.step4.intro')}
              </p>
              <ol className='text-sm text-muted-foreground list-decimal pl-5 space-y-2'>
                <li>
                  {t('upgradeFromMmw.step4.addServer')}
                </li>
                <li>
                  {t('upgradeFromMmw.step4.takeoverXray')}
                </li>
              </ol>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='pt-6'>
              <h3 className='font-semibold mb-2'>{t('upgradeFromMmw.step4.smartClaim')}</h3>
              <p className='text-sm text-muted-foreground'>
                {t('upgradeFromMmw.step4.smartClaimText')}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('upgradeFromMmw.step5.heading')}</h2>
        <Card>
          <CardContent className='pt-6'>
            <h3 className='font-semibold mb-2'>{t('upgradeFromMmw.step5.verifyTitle')}</h3>
            <ol className='text-sm text-muted-foreground list-decimal pl-5 space-y-2'>
              <li>
                {t('upgradeFromMmw.step5.verify1')}
              </li>
              <li>
                {t('upgradeFromMmw.step5.verify2')}
              </li>
              <li>
                {t('upgradeFromMmw.step5.verify3')}
              </li>
            </ol>
            <p className='text-sm text-muted-foreground mt-4'>{t('upgradeFromMmw.step5.conclusion')}</p>
          </CardContent>
        </Card>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('upgradeFromMmw.faq.heading')}</h2>
        <div className='space-y-3'>
          <Card>
            <CardContent className='pt-6'>
              <h3 className='font-semibold mb-2 text-sm'>{t('upgradeFromMmw.faq.q1')}</h3>
              <p className='text-xs text-muted-foreground'>
                {t('upgradeFromMmw.faq.a1')}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='pt-6'>
              <h3 className='font-semibold mb-2 text-sm'>{t('upgradeFromMmw.faq.q2')}</h3>
              <p className='text-xs text-muted-foreground'>
                {t('upgradeFromMmw.faq.a2')}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='pt-6'>
              <h3 className='font-semibold mb-2 text-sm'>{t('upgradeFromMmw.faq.q3')}</h3>
              <p className='text-xs text-muted-foreground'>
                {t('upgradeFromMmw.faq.a3')}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='pt-6'>
              <h3 className='font-semibold mb-2 text-sm'>{t('upgradeFromMmw.faq.q4')}</h3>
              <p className='text-xs text-muted-foreground'>
                {t('upgradeFromMmw.faq.a4')}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='pt-6'>
              <h3 className='font-semibold mb-2 text-sm'>{t('upgradeFromMmw.faq.q5')}</h3>
              <p className='text-xs text-muted-foreground'>
                {t('upgradeFromMmw.faq.a5')}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('upgradeFromMmw.rollback.heading')}</h2>
        <Card>
          <CardContent className='pt-6 text-sm text-muted-foreground space-y-2'>
            <p>{t('upgradeFromMmw.rollback.intro')}</p>
            <ol className='list-decimal pl-5 space-y-1'>
              <li>{t('upgradeFromMmw.rollback.step1')}</li>
              <li>{t('upgradeFromMmw.rollback.step2')}</li>
              <li>{t('upgradeFromMmw.rollback.step3')}</li>
              <li>{t('upgradeFromMmw.rollback.step4')}</li>
            </ol>
            <p className='pt-2'>{t('upgradeFromMmw.rollback.conclusion')}</p>
          </CardContent>
        </Card>
      </section>
    </XDocLayout>
  )
}
