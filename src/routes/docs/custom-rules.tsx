import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { XDocLayout } from '@/components/docs/x-doc-layout'
import { Screenshot } from '@/components/docs/screenshot'
import { Card, CardContent } from '@/components/ui/card'

export const Route = createFileRoute('/docs/custom-rules')({
  component: CustomRulesPage,
})

function CustomRulesPage() {
  const { t } = useTranslation('xdocs')

  return (
    <XDocLayout title={t('customRules.title')} description={t('customRules.description')}>
      <Screenshot
        src='/images/screenshots/doc-custom-rules-page.webp'
        alt={t('customRules.screenshot.alt')}
        caption={t('customRules.screenshot.caption')}
      />
      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('customRules.overview.heading')}</h2>
        <p className='text-muted-foreground'>{t('customRules.overview.text')}</p>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('customRules.ruleTypes.heading')}</h2>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead><tr className='border-b'><th className='text-left py-3 px-4'>{t('customRules.ruleTypes.typeCol')}</th><th className='text-left py-3 px-4'>{t('customRules.ruleTypes.formatCol')}</th><th className='text-left py-3 px-4'>{t('customRules.ruleTypes.exampleCol')}</th></tr></thead>
            <tbody>
              <tr className='border-b'><td className='py-3 px-4'>DOMAIN</td><td className='py-3 px-4'>{t('customRules.ruleTypes.domainDesc')}</td><td className='py-3 px-4 font-mono text-xs'>DOMAIN,example.com,PROXY</td></tr>
              <tr className='border-b'><td className='py-3 px-4'>DOMAIN-SUFFIX</td><td className='py-3 px-4'>{t('customRules.ruleTypes.domainSuffixDesc')}</td><td className='py-3 px-4 font-mono text-xs'>DOMAIN-SUFFIX,google.com,PROXY</td></tr>
              <tr className='border-b'><td className='py-3 px-4'>DOMAIN-KEYWORD</td><td className='py-3 px-4'>{t('customRules.ruleTypes.domainKeywordDesc')}</td><td className='py-3 px-4 font-mono text-xs'>DOMAIN-KEYWORD,github,PROXY</td></tr>
              <tr className='border-b'><td className='py-3 px-4'>IP-CIDR</td><td className='py-3 px-4'>{t('customRules.ruleTypes.ipCidrDesc')}</td><td className='py-3 px-4 font-mono text-xs'>IP-CIDR,10.0.0.0/8,DIRECT</td></tr>
              <tr><td className='py-3 px-4'>GEOIP</td><td className='py-3 px-4'>{t('customRules.ruleTypes.geoipDesc')}</td><td className='py-3 px-4 font-mono text-xs'>GEOIP,CN,DIRECT</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('customRules.policies.heading')}</h2>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead><tr className='border-b'><th className='text-left py-3 px-4'>{t('customRules.policies.policyCol')}</th><th className='text-left py-3 px-4'>{t('customRules.policies.descCol')}</th></tr></thead>
            <tbody>
              <tr className='border-b'><td className='py-3 px-4'>PROXY</td><td className='py-3 px-4'>{t('customRules.policies.proxy')}</td></tr>
              <tr className='border-b'><td className='py-3 px-4'>DIRECT</td><td className='py-3 px-4'>{t('customRules.policies.direct')}</td></tr>
              <tr><td className='py-3 px-4'>REJECT</td><td className='py-3 px-4'>{t('customRules.policies.reject')}</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className='text-2xl font-bold mb-4'>{t('customRules.configExample.heading')}</h2>
        <Card>
          <CardContent className='pt-6'>
            <div className='bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto'>
              <pre>{`# 自定义规则示例
DOMAIN-SUFFIX,openai.com,PROXY
DOMAIN-SUFFIX,anthropic.com,PROXY
DOMAIN-KEYWORD,github,PROXY
IP-CIDR,192.168.0.0/16,DIRECT
GEOIP,CN,DIRECT`}</pre>
            </div>
          </CardContent>
        </Card>
      </section>
    </XDocLayout>
  )
}
