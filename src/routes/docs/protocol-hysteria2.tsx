import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { XDocLayout } from '@/components/docs/x-doc-layout'
import { Card, CardContent } from '@/components/ui/card'

export const Route = createFileRoute('/docs/protocol-hysteria2')({
  component: ProtocolHysteria2Page,
})

function ProtocolHysteria2Page() {
  const { t } = useTranslation('xdocs')

  return (
    <XDocLayout title='Hysteria2' description={t('protocolHysteria2.description')}>
      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('protocolHysteria2.overview')}</h2>
        <p className='text-muted-foreground'>{t('protocolHysteria2.overviewText')}</p>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('protocolHysteria2.prerequisitesHeading')}</h2>
        <ul className='space-y-2 text-sm text-muted-foreground'>
          <li>- {t('protocolHysteria2.prereq1')}</li>
          <li>- {t('protocolHysteria2.prereq2')}</li>
          <li>- {t('protocolHysteria2.prereq3')}</li>
        </ul>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('protocolHysteria2.xrayConfigHeading')}</h2>
        <p className='text-muted-foreground mb-4'>{t('protocolHysteria2.xrayConfigText')}</p>
      </section>

      <section>
        <h2 className='text-2xl font-bold mb-4'>{t('protocolHysteria2.configExampleHeading')}</h2>
        <Card>
          <CardContent className='pt-6'>
            <div className='bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto'>
              <pre>{`{
  "protocol": "hysteria",
  "settings": {
    "version": 2,
    "clients": [{ "auth": "your-password" }]
  },
  "streamSettings": {
    "network": "hysteria",
    "security": "tls",
    "tlsSettings": {
      "serverName": "example.com",
      "alpn": ["h3"],
      "certificates": [{
        "certificateFile": "/path/to/cert.pem",
        "keyFile": "/path/to/key.pem"
      }]
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
