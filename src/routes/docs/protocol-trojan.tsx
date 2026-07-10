import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { XDocLayout } from '@/components/docs/x-doc-layout'
import { Card, CardContent } from '@/components/ui/card'

export const Route = createFileRoute('/docs/protocol-trojan')({
  component: ProtocolTrojanPage,
})

function ProtocolTrojanPage() {
  const { t } = useTranslation('xdocs')

  return (
    <XDocLayout title='Trojan' description={t('protocolTrojan.description')}>
      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('protocolTrojan.overview')}</h2>
        <p className='text-muted-foreground'>{t('protocolTrojan.overviewText')}</p>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('protocolTrojan.combinationsHeading')}</h2>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead><tr className='border-b'><th className='text-left py-3 px-4'>{t('protocolTrojan.transportCol')}</th><th className='text-left py-3 px-4'>{t('protocolTrojan.securityCol')}</th><th className='text-left py-3 px-4'>{t('protocolTrojan.descCol')}</th></tr></thead>
            <tbody>
              <tr className='border-b'><td className='py-3 px-4'>TCP</td><td className='py-3 px-4'>TLS</td><td className='py-3 px-4'>{t('protocolTrojan.classicDesc')}</td></tr>
              <tr className='border-b'><td className='py-3 px-4'>TCP</td><td className='py-3 px-4'>REALITY</td><td className='py-3 px-4'>{t('protocolTrojan.realityDesc')}</td></tr>
              <tr><td className='py-3 px-4'>gRPC</td><td className='py-3 px-4'>REALITY</td><td className='py-3 px-4'>{t('protocolTrojan.grpcDesc')}</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('protocolTrojan.notesHeading')}</h2>
        <ul className='space-y-2 text-sm text-muted-foreground'>
          <li>- {t('protocolTrojan.note1')}</li>
          <li>- {t('protocolTrojan.note2')}</li>
        </ul>
      </section>

      <section>
        <h2 className='text-2xl font-bold mb-4'>{t('protocolTrojan.configExampleHeading')}</h2>
        <Card>
          <CardContent className='pt-6'>
            <h3 className='font-semibold mb-2'>Trojan + TCP + REALITY</h3>
            <div className='bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto'>
              <pre>{`{
  "protocol": "trojan",
  "settings": {
    "clients": [{ "password": "your-password" }]
  },
  "streamSettings": {
    "network": "tcp",
    "security": "reality",
    "realitySettings": {
      "dest": "dl.google.com:443",
      "serverNames": ["dl.google.com"],
      "privateKey": "...",
      "shortIds": [""]
    }
  }
}`}</pre>
            </div>
          </CardContent>
        </Card>
      </section>
    </XDocLayout>
  )
}
