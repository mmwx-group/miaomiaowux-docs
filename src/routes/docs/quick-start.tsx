import { createFileRoute, Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { XDocLayout } from '@/components/docs/x-doc-layout'
import { Card, CardContent } from '@/components/ui/card'
import { StepIndicator } from '@/components/docs/step-indicator'

export const Route = createFileRoute('/docs/quick-start')({
  component: QuickStartPage,
})

function QuickStartPage() {
  const { t } = useTranslation('xdocs')

  const steps = [t('quickStart.steps.deployMaster'), t('quickStart.steps.addServer'), t('quickStart.steps.installXray'), t('quickStart.steps.createInbound'), t('quickStart.steps.syncNodes'), t('quickStart.steps.generateSub')]

  return (
    <XDocLayout title={t('quickStart.title')} description={t('quickStart.description')}>
      <div className='mb-8 overflow-x-auto pb-4'>
        <StepIndicator currentStep={0} totalSteps={6} labels={steps} />
      </div>

      <section id='step-1' className='mb-10'>
        <h2 className='text-2xl font-bold mb-4 flex items-center gap-3'>
          <div className='size-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold'>1</div>
          {t('quickStart.step1.heading')}
        </h2>
        <Card>
          <CardContent className='pt-6'>
            <p className='text-muted-foreground mb-4'>{t('quickStart.step1.recommend')}</p>
            <div className='bg-muted rounded-lg p-4 font-mono text-sm mb-4 overflow-x-auto'>
              <pre>{`# 一键安装(自动检测架构、下载最新版、创建 systemd 服务)
curl -sL https://raw.githubusercontent.com/iluobei/miaomiaowuX/main/install.sh | sudo bash

# 安装完成后访问 http://服务器IP:12889 进入初始化向导`}</pre>
            </div>
            <p className='text-sm text-muted-foreground'>
              {t('quickStart.step1.moreInstall')} <Link to='/docs/install-docker' className='text-primary hover:underline'>{t('quickStart.step1.dockerInstall')}</Link> {t('quickStart.step1.or')} <Link to='/docs/install-direct' className='text-primary hover:underline'>{t('quickStart.step1.directInstall')}</Link>
            </p>
          </CardContent>
        </Card>
      </section>

      <section id='step-2' className='mb-10'>
        <h2 className='text-2xl font-bold mb-4 flex items-center gap-3'>
          <div className='size-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold'>2</div>
          {t('quickStart.step2.heading')}
        </h2>
        <Card>
          <CardContent className='pt-6'>
            <ol className='space-y-3 text-sm'>
              <li>{t('quickStart.step2.item1')}</li>
              <li>{t('quickStart.step2.item2')}</li>
              <li>{t('quickStart.step2.item3')}</li>
              <li>4. {t('quickStart.step2.item4pre')} <Link to='/docs/install-agent' className='text-primary hover:underline'>{t('quickStart.step2.agentDeploy')}</Link>{t('quickStart.step2.item4post')}</li>
              <li>{t('quickStart.step2.item5')}</li>
            </ol>
          </CardContent>
        </Card>
      </section>

      <section id='step-3' className='mb-10'>
        <h2 className='text-2xl font-bold mb-4 flex items-center gap-3'>
          <div className='size-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold'>3</div>
          {t('quickStart.step3.heading')}
        </h2>
        <Card>
          <CardContent className='pt-6'>
            <p className='text-muted-foreground mb-3'>{t('quickStart.step3.text1')}</p>
            <p className='text-sm text-muted-foreground'>{t('quickStart.step3.text2')}</p>
          </CardContent>
        </Card>
      </section>

      <section id='step-4' className='mb-10'>
        <h2 className='text-2xl font-bold mb-4 flex items-center gap-3'>
          <div className='size-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold'>4</div>
          {t('quickStart.step4.heading')}
        </h2>
        <Card>
          <CardContent className='pt-6'>
            <p className='text-muted-foreground mb-3'>{t('quickStart.step4.text1')}</p>
            <ol className='space-y-2 text-sm'>
              <li>{t('quickStart.step4.item1')}</li>
              <li>{t('quickStart.step4.item2')}</li>
              <li>{t('quickStart.step4.item3')}</li>
              <li>{t('quickStart.step4.item4')}</li>
              <li>{t('quickStart.step4.item5')}</li>
            </ol>
            <p className='text-sm text-muted-foreground mt-3'>
              {t('quickStart.step4.protocolRef')} <Link to='/docs/protocol-matrix' className='text-primary hover:underline'>{t('quickStart.step4.protocolMatrix')}</Link>
            </p>
          </CardContent>
        </Card>
      </section>

      <section id='step-5' className='mb-10'>
        <h2 className='text-2xl font-bold mb-4 flex items-center gap-3'>
          <div className='size-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold'>5</div>
          {t('quickStart.step5.heading')}
        </h2>
        <Card>
          <CardContent className='pt-6'>
            <p className='text-muted-foreground mb-3'>{t('quickStart.step5.text1')}</p>
            <p className='text-sm text-muted-foreground'>{t('quickStart.step5.text2')}</p>
          </CardContent>
        </Card>
      </section>

      <section id='step-6' className='mb-10'>
        <h2 className='text-2xl font-bold mb-4 flex items-center gap-3'>
          <div className='size-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold'>6</div>
          {t('quickStart.step6.heading')}
        </h2>
        <Card>
          <CardContent className='pt-6'>
            <p className='text-muted-foreground mb-3'>{t('quickStart.step6.text1')}</p>
            <p className='text-sm text-muted-foreground'>
              {t('quickStart.step6.text2')} <Link to='/docs/generator' className='text-primary hover:underline'>{t('quickStart.step6.generateSub')}</Link>
            </p>
          </CardContent>
        </Card>
      </section>
    </XDocLayout>
  )
}
