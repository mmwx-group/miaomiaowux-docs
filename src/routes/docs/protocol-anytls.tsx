import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { XDocLayout } from '@/components/docs/x-doc-layout'
import { Card, CardContent } from '@/components/ui/card'

export const Route = createFileRoute('/docs/protocol-anytls')({
  component: ProtocolAnytlsPage,
})

function ProtocolAnytlsPage() {
  const { t } = useTranslation('xdocs')

  return (
    <XDocLayout title='AnyTLS' description={t('protocolAnytls.description')}>
      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('protocolAnytls.overview')}</h2>
        <p className='text-muted-foreground'>{t('protocolAnytls.overviewText')}</p>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('protocolAnytls.combinationsHeading')}</h2>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b'>
                <th className='text-left py-3 px-4'>{t('protocolAnytls.transportCol')}</th>
                <th className='text-left py-3 px-4'>{t('protocolAnytls.securityCol')}</th>
                <th className='text-left py-3 px-4'>{t('protocolAnytls.descCol')}</th>
              </tr>
            </thead>
            <tbody>
              <tr className='border-b'>
                <td className='py-3 px-4'>TCP</td>
                <td className='py-3 px-4'>TLS</td>
                <td className='py-3 px-4'>{t('protocolAnytls.tlsDesc')}</td>
              </tr>
              <tr>
                <td className='py-3 px-4'>TCP</td>
                <td className='py-3 px-4'>REALITY</td>
                <td className='py-3 px-4 text-destructive'>{t('protocolAnytls.realityDesc')}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('protocolAnytls.clientCompatHeading')}</h2>
        <Card>
          <CardContent className='pt-6'>
            <ul className='space-y-2 text-sm text-muted-foreground'>
              <li>- {t('protocolAnytls.client1')}</li>
              <li>- {t('protocolAnytls.client2')}</li>
              <li>- {t('protocolAnytls.client3')}</li>
              <li>- {t('protocolAnytls.client4')}</li>
            </ul>
            <p className='text-xs text-muted-foreground mt-4'>
              {t('protocolAnytls.docsLinkPrefix')}{' '}
              <a
                href='https://wiki.metacubex.one/config/proxies/anytls/'
                target='_blank'
                rel='noopener noreferrer'
                className='underline text-primary'
              >
                wiki.metacubex.one/config/proxies/anytls
              </a>
            </p>
          </CardContent>
        </Card>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('protocolAnytls.paddingSchemeHeading')}</h2>
        <p className='text-muted-foreground mb-3'>{t('protocolAnytls.paddingSchemeText')}</p>
        <Card>
          <CardContent className='pt-6'>
            <div className='bg-muted rounded-lg p-4 font-mono text-xs overflow-x-auto'>
              <pre>{`stop=8
0=30-30
1=100-400
2=400-500,c,500-1000,c,500-1000,c,500-1000,c,500-1000
3=9-9,500-1000
4=500-1000
5=500-1000
6=500-1000
7=500-1000`}</pre>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('protocolAnytls.notesHeading')}</h2>
        <ul className='space-y-2 text-sm text-muted-foreground'>
          <li>- {t('protocolAnytls.note1')}</li>
          <li>- {t('protocolAnytls.note2')}</li>
          <li>- {t('protocolAnytls.note3')}</li>
          <li>- {t('protocolAnytls.note4')}</li>
        </ul>
      </section>

      <section>
        <h2 className='text-2xl font-bold mb-4'>{t('protocolAnytls.configExampleHeading')}</h2>
        <Card>
          <CardContent className='pt-6'>
            <h3 className='font-semibold mb-2'>AnyTLS + TCP + TLS</h3>
            <div className='bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto'>
              <pre>{`{
  "tag": "anytls-in",
  "listen": "0.0.0.0",
  "port": 443,
  "protocol": "anytls",
  "settings": {
    "users": [
      {
        "password": "your-password",
        "email": "user@example.com",
        "level": 0
      }
    ],
    "paddingScheme": [
      "stop=8",
      "0=30-30",
      "1=100-400"
    ]
  },
  "streamSettings": {
    "network": "tcp",
    "security": "tls",
    "tlsSettings": {
      "certificates": [
        {
          "certificateFile": "/path/to/fullchain.pem",
          "keyFile": "/path/to/privkey.pem"
        }
      ],
      "serverName": "your.domain.com"
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
