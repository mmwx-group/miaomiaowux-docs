import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { XDocLayout } from '@/components/docs/x-doc-layout'
import { Card, CardContent } from '@/components/ui/card'
import { RoutedOutboundDemo } from '@/components/docs/routed-outbound-demo'

export const Route = createFileRoute('/docs/routed-outbound')({
  component: RoutedOutboundPage,
})

function RoutedOutboundPage() {
  const { t } = useTranslation('xdocs')

  return (
    <XDocLayout
      title={t('routedOutbound.title')}
      description={t('routedOutbound.description')}
    >
      {/* mock 节点管理表 + 创建落地节点 Dialog */}
      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('routedOutbound.demo.heading')}</h2>
        <p className='text-muted-foreground mb-4'>{t('routedOutbound.demo.description')}</p>
        <RoutedOutboundDemo />
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('routedOutbound.twoModesHeading')}</h2>
        <p className='text-muted-foreground mb-4'>{t('routedOutbound.twoModesText')}</p>
        <Card className='mb-4 border-amber-200 dark:border-amber-800'>
          <CardContent className='pt-6 text-sm text-muted-foreground space-y-2'>
            <p><strong className='text-foreground'>{t('routedOutbound.prerequisiteLabel')}</strong>{t('routedOutbound.prerequisiteText')}</p>
            <p>{t('routedOutbound.prerequisiteDisabledText')}</p>
            <ul className='ml-4 space-y-1'>
              <li>- {t('routedOutbound.prerequisiteErr1')}</li>
              <li>- {t('routedOutbound.prerequisiteErr2')}</li>
              <li>- {t('routedOutbound.prerequisiteErr3')}</li>
            </ul>
          </CardContent>
        </Card>
        <p className='text-muted-foreground mb-4'>{t('routedOutbound.dialogModesText')}</p>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b'>
                <th className='text-left py-3 px-4'>{t('routedOutbound.scopeCol')}</th>
                <th className='text-left py-3 px-4'>{t('routedOutbound.impactCol')}</th>
                <th className='text-left py-3 px-4'>{t('routedOutbound.newNodeCol')}</th>
              </tr>
            </thead>
            <tbody>
              <tr className='border-b'>
                <td className='py-3 px-4 font-medium'>{t('routedOutbound.scopeWholeNode')}</td>
                <td className='py-3 px-4'>{t('routedOutbound.scopeWholeNodeImpact')}</td>
                <td className='py-3 px-4'>{t('routedOutbound.scopeWholeNodeNewNode')}</td>
              </tr>
              <tr>
                <td className='py-3 px-4 font-medium'>{t('routedOutbound.scopePerUser')}</td>
                <td className='py-3 px-4'>{t('routedOutbound.scopePerUserImpact')}</td>
                <td className='py-3 px-4'>{t('routedOutbound.scopePerUserNewNode')}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className='text-sm text-muted-foreground mt-4'>{t('routedOutbound.focusNote')}</p>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('routedOutbound.nodeLevelHeading')}</h2>
        <Card>
          <CardContent className='pt-6 text-sm text-muted-foreground space-y-2'>
            <p>{t('routedOutbound.nodeLevelText')}</p>
            <p>{t('routedOutbound.nodeLevelActions')}</p>
            <ul className='space-y-1 ml-4'>
              <li>{t('routedOutbound.nodeLevelAction1')}</li>
              <li>{t('routedOutbound.nodeLevelAction2')}</li>
            </ul>
            <p className='mt-3'><strong>{t('routedOutbound.nodeLevelUseCase')}</strong></p>
          </CardContent>
        </Card>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('routedOutbound.problemHeading')}</h2>
        <p className='text-muted-foreground mb-4'>{t('routedOutbound.problemText')}</p>

        <p className='text-muted-foreground mb-3'>{t('routedOutbound.exampleIntro')}</p>
        <div className='overflow-x-auto mb-6'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b'>
                <th className='text-left py-3 px-4'>{t('routedOutbound.nodeTypeCol')}</th>
                <th className='text-left py-3 px-4'>{t('routedOutbound.nodeNameCol')}</th>
                <th className='text-left py-3 px-4'>{t('routedOutbound.nodeAddrCol')}</th>
              </tr>
            </thead>
            <tbody>
              <tr className='border-b'>
                <td className='py-3 px-4'>{t('routedOutbound.typeLanding')}</td>
                <td className='py-3 px-4 font-mono text-xs'>HKT</td>
                <td className='py-3 px-4 font-mono text-xs'>hkt.example.com</td>
              </tr>
              <tr className='border-b'>
                <td className='py-3 px-4'>{t('routedOutbound.typeLanding')}</td>
                <td className='py-3 px-4 font-mono text-xs'>HINET</td>
                <td className='py-3 px-4 font-mono text-xs'>hinet.example.com</td>
              </tr>
              <tr>
                <td className='py-3 px-4'>{t('routedOutbound.typeTransit')}</td>
                <td className='py-3 px-4 font-mono text-xs'>HK直连</td>
                <td className='py-3 px-4 font-mono text-xs'>hkdirect.example.com（vless reality vision，443）</td>
              </tr>
            </tbody>
          </table>
        </div>

        <Card>
          <CardContent className='pt-6 text-sm text-muted-foreground space-y-3'>
            <p>{t('routedOutbound.problemExample')}</p>
            <pre className='bg-muted/50 border rounded-md p-3 text-xs overflow-x-auto'>{`{
  "type": "field",
  "domain": ["geosite:openai"],
  "inboundTag": ["HK直连"],
  "outboundTag": "HINET"
}`}</pre>
            <p>{t('routedOutbound.problemConflict')}</p>
            <p className='font-medium text-foreground'>{t('routedOutbound.problemRoot')}</p>
          </CardContent>
        </Card>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('routedOutbound.solutionHeading')}</h2>
        <Card>
          <CardContent className='pt-6 text-sm text-muted-foreground space-y-3'>
            <p>{t('routedOutbound.solutionText')}</p>
            <div className='bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-md p-3 text-amber-700 dark:text-amber-300 text-xs mt-2'>
              {t('routedOutbound.solutionAdminNote')}
            </div>
          </CardContent>
        </Card>

        <h3 className='text-lg font-semibold mt-6 mb-3'>{t('routedOutbound.stepsHeading')}</h3>
        <Card>
          <CardContent className='pt-6 text-sm text-muted-foreground space-y-2'>
            <ol className='space-y-2 ml-4 list-decimal'>
              <li>{t('routedOutbound.step1')}</li>
              <li>{t('routedOutbound.step2')}</li>
              <li>{t('routedOutbound.step3')}</li>
              <li>{t('routedOutbound.step4')}</li>
              <li>{t('routedOutbound.step5')}</li>
              <li>{t('routedOutbound.step6')}</li>
            </ol>
          </CardContent>
        </Card>

        <h3 className='text-lg font-semibold mt-6 mb-3'>{t('routedOutbound.routingExampleHeading')}</h3>
        <Card>
          <CardContent className='pt-6 text-sm text-muted-foreground space-y-3'>
            <p>{t('routedOutbound.routingExampleText')}</p>
            <pre className='bg-muted/50 border rounded-md p-3 text-xs overflow-x-auto'>{`// 管理员占位规则(尚无用户分配时也存在,user 是占位 admin email)
{
  "type": "field",
  "user": ["_admin__a1b2c3__hinet"],
  "domain": ["geosite:openai"],
  "inboundTag": ["HK直连"],
  "outboundTag": "HINET"
}

// 用户 A 被套餐分配到 HK直连-rout-seednet 后,
// A 的子账号 email 会被自动加进这条规则的 user 列表
{
  "type": "field",
  "user": ["userA__d4e5f6__seednet"],
  "domain": ["geosite:openai"],
  "inboundTag": ["HK直连"],
  "outboundTag": "Seednet"
}`}</pre>
            <p className='text-xs'>{t('routedOutbound.emailFormatNote')}</p>
          </CardContent>
        </Card>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('routedOutbound.userViewHeading')}</h2>
        <p className='text-muted-foreground mb-4'>{t('routedOutbound.userViewText')}</p>

        <h3 className='text-lg font-semibold mb-3'>{t('routedOutbound.switchQuotaHeading')}</h3>
        <Card className='mb-4'>
          <CardContent className='pt-6 text-sm text-muted-foreground space-y-2'>
            <p>{t('routedOutbound.switchQuotaLocation')}</p>
            <ul className='space-y-1 ml-4'>
              <li>- {t('routedOutbound.switchOff')}</li>
              <li>- {t('routedOutbound.switchOn')}</li>
              <li>- {t('routedOutbound.switchQuantity')}</li>
              <li>- {t('routedOutbound.switchDaily')}</li>
              <li>- {t('routedOutbound.switchWindow')}</li>
              <li>- {t('routedOutbound.switchSaveImmediate')}</li>
            </ul>
          </CardContent>
        </Card>

        <h3 className='text-lg font-semibold mb-3'>{t('routedOutbound.userCreateStepsHeading')}</h3>
        <Card className='mb-4'>
          <CardContent className='pt-6 text-sm text-muted-foreground space-y-2'>
            <ol className='space-y-2 ml-4 list-decimal'>
              <li>{t('routedOutbound.userStep1')}</li>
              <li>{t('routedOutbound.userStep2')}</li>
              <li>{t('routedOutbound.userStep3')}</li>
              <li>{t('routedOutbound.userStep4')}</li>
              <li>{t('routedOutbound.userStep5')}</li>
            </ol>
            <p className='mt-3'>{t('routedOutbound.userCreateResult')}</p>
          </CardContent>
        </Card>

        <h3 className='text-lg font-semibold mb-3'>{t('routedOutbound.userDeleteHeading')}</h3>
        <Card className='mb-4'>
          <CardContent className='pt-6 text-sm text-muted-foreground'>{t('routedOutbound.userDeleteText')}</CardContent>
        </Card>

        <h3 className='text-lg font-semibold mb-3'>{t('routedOutbound.suspendResumeHeading')}</h3>
        <Card>
          <CardContent className='pt-6 text-sm text-muted-foreground space-y-2'>
            {t('routedOutbound.suspendTriggerIntro')}
            <ul className='space-y-1 ml-4'>
              <li>- {t('routedOutbound.suspendTrigger1')}</li>
              <li>- {t('routedOutbound.suspendTrigger2')}</li>
              <li>- {t('routedOutbound.suspendTrigger3')}</li>
            </ul>
            {t('routedOutbound.resumeTriggerIntro')}
            <ul className='space-y-1 ml-4'>
              <li>- {t('routedOutbound.resumeTrigger1')}</li>
              <li>- {t('routedOutbound.resumeTrigger2')}</li>
            </ul>
            <p>{t('routedOutbound.suspendPackageExpireNote')}</p>
          </CardContent>
        </Card>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('routedOutbound.advancedHeading')}</h2>
        <p className='text-muted-foreground mb-4'>{t('routedOutbound.advancedText')}</p>

        <h3 className='text-lg font-semibold mb-3'>{t('routedOutbound.advancedScenarioHeading')}</h3>
        <p className='text-muted-foreground mb-3'>{t('routedOutbound.advancedScenarioText')}</p>
        <div className='overflow-x-auto mb-6'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b'>
                <th className='text-left py-3 px-4'>{t('routedOutbound.subNodeNameCol')}</th>
                <th className='text-left py-3 px-4'>{t('routedOutbound.parentInboundCol')}</th>
                <th className='text-left py-3 px-4'>{t('routedOutbound.outboundCol')}</th>
                <th className='text-left py-3 px-4'>{t('routedOutbound.outboundTagCol')}</th>
              </tr>
            </thead>
            <tbody>
              <tr className='border-b'>
                <td className='py-3 px-4 font-mono text-xs'>HK直连-rout-hkt</td>
                <td className='py-3 px-4'>HK直连</td>
                <td className='py-3 px-4'>HKT</td>
                <td className='py-3 px-4 font-mono text-xs'>{'routed:p<父 id>:rout-hkt'}</td>
              </tr>
              <tr>
                <td className='py-3 px-4 font-mono text-xs'>HK直连-rout-hinet</td>
                <td className='py-3 px-4'>HK直连</td>
                <td className='py-3 px-4'>HINET</td>
                <td className='py-3 px-4 font-mono text-xs'>{'routed:p<父 id>:rout-hinet'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className='text-lg font-semibold mb-3'>{t('routedOutbound.advancedEffectHeading')}</h3>
        <Card>
          <CardContent className='pt-6 text-sm text-muted-foreground space-y-2'>
            <p>{t('routedOutbound.advancedEffectText')}</p>
            <ul className='space-y-1 ml-4'>
              <li>{t('routedOutbound.advancedEffect1')}</li>
              <li>{t('routedOutbound.advancedEffect2')}</li>
              <li>{t('routedOutbound.advancedEffect3')}</li>
              <li>{t('routedOutbound.advancedEffect4')}</li>
            </ul>
          </CardContent>
        </Card>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('routedOutbound.implementationHeading')}</h2>
        <div className='space-y-4'>
          <Card>
            <CardContent className='pt-6'>
              <h3 className='font-semibold mb-3'>{t('routedOutbound.implCreateHeading')}</h3>
              <div className='text-sm text-muted-foreground space-y-1 ml-4'>
                <p>{t('routedOutbound.implCreate1')}</p>
                <p>{t('routedOutbound.implCreate2')}</p>
                <p>{t('routedOutbound.implCreate3')}</p>
                <p>{t('routedOutbound.implCreate4')}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-6'>
              <h3 className='font-semibold mb-3'>{t('routedOutbound.implAssignHeading')}</h3>
              <div className='text-sm text-muted-foreground space-y-1 ml-4'>
                <p>{t('routedOutbound.implAssign1')}</p>
                <p>{t('routedOutbound.implAssign2')}</p>
                <p>{t('routedOutbound.implAssign3')}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-6'>
              <h3 className='font-semibold mb-3'>{t('routedOutbound.implSubscriptionHeading')}</h3>
              <div className='text-sm text-muted-foreground space-y-2'>
                <p>{t('routedOutbound.implSubscriptionText')}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-6'>
              <h3 className='font-semibold mb-3'>{t('routedOutbound.implTrafficHeading')}</h3>
              <div className='text-sm text-muted-foreground space-y-2'>
                <p>{t('routedOutbound.implTrafficText')}</p>
                <p>{t('routedOutbound.implTrafficMerge')}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('routedOutbound.comparisonHeading')}</h2>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b'>
                <th className='text-left py-3 px-4'>{t('routedOutbound.dimensionCol')}</th>
                <th className='text-left py-3 px-4'>{t('routedOutbound.wholeNodeCol')}</th>
                <th className='text-left py-3 px-4'>{t('routedOutbound.perUserCol')}</th>
              </tr>
            </thead>
            <tbody>
              <tr className='border-b'><td className='py-3 px-4'>{t('routedOutbound.cmpScope')}</td><td className='py-3 px-4'>{t('routedOutbound.cmpScopeWhole')}</td><td className='py-3 px-4'>{t('routedOutbound.cmpScopeUser')}</td></tr>
              <tr className='border-b'><td className='py-3 px-4'>{t('routedOutbound.cmpNewNode')}</td><td className='py-3 px-4'>{t('routedOutbound.no')}</td><td className='py-3 px-4'>{t('routedOutbound.cmpNewNodeYes')}</td></tr>
              <tr className='border-b'><td className='py-3 px-4'>{t('routedOutbound.cmpDiffOutbound')}</td><td className='py-3 px-4'>✗</td><td className='py-3 px-4'>✓</td></tr>
              <tr className='border-b'><td className='py-3 px-4'>{t('routedOutbound.cmpMultiLanding')}</td><td className='py-3 px-4'>✗</td><td className='py-3 px-4'>✓</td></tr>
              <tr className='border-b'><td className='py-3 px-4'>{t('routedOutbound.cmpXrayRestart')}</td><td className='py-3 px-4'>{t('routedOutbound.yes')}</td><td className='py-3 px-4'>{t('routedOutbound.cmpXrayRestartUser')}</td></tr>
              <tr><td className='py-3 px-4'>{t('routedOutbound.cmpTrafficGranularity')}</td><td className='py-3 px-4'>{t('routedOutbound.cmpTrafficWhole')}</td><td className='py-3 px-4'>{t('routedOutbound.cmpTrafficUser')}</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('routedOutbound.faqHeading')}</h2>
        <div className='space-y-4'>
          <Card>
            <CardContent className='pt-6'>
              <h3 className='font-semibold mb-2'>{t('routedOutbound.faq1Q')}</h3>
              <p className='text-sm text-muted-foreground'>{t('routedOutbound.faq1A')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='pt-6'>
              <h3 className='font-semibold mb-2'>{t('routedOutbound.faq2Q')}</h3>
              <p className='text-sm text-muted-foreground'>{t('routedOutbound.faq2A')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='pt-6'>
              <h3 className='font-semibold mb-2'>{t('routedOutbound.faq3Q')}</h3>
              <p className='text-sm text-muted-foreground'>{t('routedOutbound.faq3A')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='pt-6'>
              <h3 className='font-semibold mb-2'>{t('routedOutbound.faq4Q')}</h3>
              <p className='text-sm text-muted-foreground'>{t('routedOutbound.faq4A')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='pt-6'>
              <h3 className='font-semibold mb-2'>{t('routedOutbound.faq5Q')}</h3>
              <p className='text-sm text-muted-foreground'>{t('routedOutbound.faq5A')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='pt-6'>
              <h3 className='font-semibold mb-2'>{t('routedOutbound.faq6Q')}</h3>
              <p className='text-sm text-muted-foreground'>{t('routedOutbound.faq6A')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='pt-6'>
              <h3 className='font-semibold mb-2'>{t('routedOutbound.faq7Q')}</h3>
              <p className='text-sm text-muted-foreground'>{t('routedOutbound.faq7A')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='pt-6'>
              <h3 className='font-semibold mb-2'>{t('routedOutbound.faq8Q')}</h3>
              <p className='text-sm text-muted-foreground'>{t('routedOutbound.faq8A')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='pt-6'>
              <h3 className='font-semibold mb-2'>{t('routedOutbound.faq9Q')}</h3>
              <p className='text-sm text-muted-foreground'>{t('routedOutbound.faq9A')}</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </XDocLayout>
  )
}
