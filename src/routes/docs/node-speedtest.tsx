import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { XDocLayout } from '@/components/docs/x-doc-layout'
import { Card, CardContent } from '@/components/ui/card'
import { SpeedtestDemo } from '@/components/docs/speedtest-demo'

export const Route = createFileRoute('/docs/node-speedtest')({
  component: NodeSpeedtestPage,
})

function NodeSpeedtestPage() {
  const { t } = useTranslation('xdocs')

  return (
    <XDocLayout
      title={t('nodeSpeedtest.title')}
      description={t('nodeSpeedtest.description')}
    >
      {/* 节点测速 mock 演示 */}
      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('nodeSpeedtest.demo.heading')}</h2>
        <p className='text-muted-foreground mb-4'>{t('nodeSpeedtest.demo.description')}</p>
        <SpeedtestDemo />
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('nodeSpeedtest.overview')}</h2>
        <p className='text-muted-foreground mb-4'>{t('nodeSpeedtest.overviewText')}</p>
        <div className='grid gap-4 md:grid-cols-2'>
          <Card>
            <CardContent className='pt-6'>
              <h3 className='font-semibold mb-2'>{t('nodeSpeedtest.localHeading')}</h3>
              <p className='text-sm text-muted-foreground'>{t('nodeSpeedtest.localText')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='pt-6'>
              <h3 className='font-semibold mb-2'>{t('nodeSpeedtest.homeHeading')}</h3>
              <p className='text-sm text-muted-foreground'>{t('nodeSpeedtest.homeText')}</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('nodeSpeedtest.testTypesHeading')}</h2>
        <div className='grid gap-4 md:grid-cols-2'>
          <Card>
            <CardContent className='pt-6'>
              <h3 className='font-semibold mb-2'>{t('nodeSpeedtest.speedTestHeading')}</h3>
              <p className='text-sm text-muted-foreground mb-2'>{t('nodeSpeedtest.speedTestText')}</p>
              <p className='text-xs text-muted-foreground'>{t('nodeSpeedtest.speedTestTrigger')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='pt-6'>
              <h3 className='font-semibold mb-2'>{t('nodeSpeedtest.latencyTestHeading')}</h3>
              <p className='text-sm text-muted-foreground mb-2'>{t('nodeSpeedtest.latencyTestText')}</p>
              <p className='text-xs text-muted-foreground'>{t('nodeSpeedtest.latencyTestTrigger')}</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('nodeSpeedtest.usageStepsHeading')}</h2>
        <div className='space-y-4'>
          <Card>
            <CardContent className='pt-6'>
              <h3 className='font-semibold mb-3'>{t('nodeSpeedtest.startSpeedtest')}</h3>
              <ol className='text-sm text-muted-foreground space-y-2 list-decimal pl-5'>
                <li>{t('nodeSpeedtest.usageStep1')}</li>
                <li>{t('nodeSpeedtest.usageStep2')}</li>
                <li>{t('nodeSpeedtest.usageStep3')}</li>
                <li>{t('nodeSpeedtest.usageStep4')}
                  <ul className='list-disc pl-5 mt-1 space-y-1'>
                    <li>{t('nodeSpeedtest.usageStep4a')}</li>
                    <li>{t('nodeSpeedtest.usageStep4b')}</li>
                    <li>{t('nodeSpeedtest.usageStep4c')}</li>
                  </ul>
                </li>
                <li>{t('nodeSpeedtest.usageStep5')}</li>
                <li>{t('nodeSpeedtest.usageStep6')}</li>
              </ol>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='pt-6 text-sm text-muted-foreground'>{t('nodeSpeedtest.collapseNote')}</CardContent>
          </Card>
        </div>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('nodeSpeedtest.configHomeHeading')}</h2>
        <div className='space-y-4'>
          <Card>
            <CardContent className='pt-6'>
              <h3 className='font-semibold mb-3'>{t('nodeSpeedtest.configStepsHeading')}</h3>
              <ol className='text-sm text-muted-foreground space-y-2 list-decimal pl-5'>
                <li>{t('nodeSpeedtest.configStep1')}</li>
                <li>{t('nodeSpeedtest.configStep2')}
                  <pre className='bg-muted text-xs p-3 rounded mt-2 overflow-x-auto'>{`# Linux / macOS
curl -fsSL <脚本URL>/install.sh | bash -s -- \\
  -master https://你的主控.example.com -token <令牌>

# Windows PowerShell
irm <脚本URL>/install.ps1 -OutFile install.ps1
.\\install.ps1 -Master https://你的主控.example.com -Token <令牌>`}</pre>
                </li>
                <li>{t('nodeSpeedtest.configStep3')}</li>
                <li>{t('nodeSpeedtest.configStep4')}</li>
              </ol>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='pt-6'>
              <h3 className='font-semibold mb-3'>{t('nodeSpeedtest.capabilitiesHeading')}</h3>
              <p className='text-sm text-muted-foreground'>{t('nodeSpeedtest.capabilitiesText')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='pt-6 text-sm text-muted-foreground'>
              {t('nodeSpeedtest.binaryNote')} <a href='https://github.com/MMWOrg/mmwX-plugins/releases/latest' target='_blank' rel='noopener noreferrer' className='text-primary underline'>mmwX-plugins releases</a> {t('nodeSpeedtest.binaryNoteSuffix')}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('nodeSpeedtest.scenariosHeading')}</h2>
        <Card>
          <CardContent className='pt-6'>
            <div className='overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead className='text-muted-foreground'>
                  <tr className='border-b'>
                    <th className='py-2 text-left font-normal'>{t('nodeSpeedtest.scenarioWhatCol')}</th>
                    <th className='py-2 text-left font-normal'>{t('nodeSpeedtest.scenarioChoiceCol')}</th>
                    <th className='py-2 text-left font-normal'>{t('nodeSpeedtest.scenarioExplainCol')}</th>
                  </tr>
                </thead>
                <tbody className='[&_td]:py-2'>
                  <tr className='border-b'>
                    <td>{t('nodeSpeedtest.scenario1What')}</td>
                    <td>{t('nodeSpeedtest.scenario1Choice')}</td>
                    <td>{t('nodeSpeedtest.scenario1Explain')}</td>
                  </tr>
                  <tr className='border-b'>
                    <td>{t('nodeSpeedtest.scenario2What')}</td>
                    <td>{t('nodeSpeedtest.scenario2Choice')}</td>
                    <td>{t('nodeSpeedtest.scenario2Explain')}</td>
                  </tr>
                  <tr className='border-b'>
                    <td>{t('nodeSpeedtest.scenario3What')}</td>
                    <td>{t('nodeSpeedtest.scenario3Choice')}</td>
                    <td>{t('nodeSpeedtest.scenario3Explain')}</td>
                  </tr>
                  <tr className='border-b'>
                    <td>{t('nodeSpeedtest.scenario4What')}</td>
                    <td>{t('nodeSpeedtest.scenario4Choice')}</td>
                    <td>{t('nodeSpeedtest.scenario4Explain')}</td>
                  </tr>
                  <tr>
                    <td>{t('nodeSpeedtest.scenario5What')}</td>
                    <td>{t('nodeSpeedtest.scenario5Choice')}</td>
                    <td>{t('nodeSpeedtest.scenario5Explain')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('nodeSpeedtest.notesHeading')}</h2>
        <Card>
          <CardContent className='pt-6 text-sm text-muted-foreground space-y-2'>
            <p>{t('nodeSpeedtest.note1')}</p>
            <p>{t('nodeSpeedtest.note2')}</p>
            <p>{t('nodeSpeedtest.note3')}</p>
            <p>{t('nodeSpeedtest.note4')} <a href='/docs/about' className='text-primary underline'>{t('nodeSpeedtest.license')}</a>{t('nodeSpeedtest.note4Suffix')}</p>
            <p>{t('nodeSpeedtest.note5')}</p>
          </CardContent>
        </Card>
      </section>
    </XDocLayout>
  )
}
