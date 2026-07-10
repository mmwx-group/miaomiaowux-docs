import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { XDocLayout } from '@/components/docs/x-doc-layout'
import { Card, CardContent } from '@/components/ui/card'

export const Route = createFileRoute('/docs/protocol-snell')({
  component: ProtocolSnellPage,
})

function ProtocolSnellPage() {
  const { t } = useTranslation('xdocs')

  return (
    <XDocLayout title='Snell' description={t('protocolSnell.description')}>
      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('protocolSnell.overview')}</h2>
        <p className='text-muted-foreground'>{t('protocolSnell.overviewText')}</p>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('protocolSnell.versionsHeading')}</h2>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b'>
                <th className='text-left py-3 px-4'>{t('protocolSnell.versionCol')}</th>
                <th className='text-left py-3 px-4'>{t('protocolSnell.multiUserCol')}</th>
                <th className='text-left py-3 px-4'>{t('protocolSnell.obfsCol')}</th>
                <th className='text-left py-3 px-4'>{t('protocolSnell.descCol')}</th>
              </tr>
            </thead>
            <tbody>
              <tr className='border-b'>
                <td className='py-3 px-4'>v4</td>
                <td className='py-3 px-4'>{t('protocolSnell.v4Multi')}</td>
                <td className='py-3 px-4'>obfs: none / http / tls</td>
                <td className='py-3 px-4'>{t('protocolSnell.v4Desc')}</td>
              </tr>
              <tr className='border-b'>
                <td className='py-3 px-4'>v5</td>
                <td className='py-3 px-4'>{t('protocolSnell.v5Multi')}</td>
                <td className='py-3 px-4'>obfs: none / http / tls</td>
                <td className='py-3 px-4'>{t('protocolSnell.v5Desc')}</td>
              </tr>
              <tr>
                <td className='py-3 px-4'>v6</td>
                <td className='py-3 px-4'>{t('protocolSnell.v6Multi')}</td>
                <td className='py-3 px-4'>mode: default / unshaped / unsafe-raw</td>
                <td className='py-3 px-4'>{t('protocolSnell.v6Desc')}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('protocolSnell.wizardHeading')}</h2>
        <p className='text-muted-foreground mb-3'>{t('protocolSnell.wizardText')}</p>
        <div className='space-y-4'>
          <Card>
            <CardContent className='pt-6'>
              <h3 className='font-semibold mb-2'>{t('protocolSnell.wizardSimpleHeading')}</h3>
              <p className='text-sm text-muted-foreground'>{t('protocolSnell.wizardSimpleText')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='pt-6'>
              <h3 className='font-semibold mb-2'>{t('protocolSnell.wizardExpertHeading')}</h3>
              <p className='text-sm text-muted-foreground'>{t('protocolSnell.wizardExpertText')}</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('protocolSnell.clientCompatHeading')}</h2>
        <Card>
          <CardContent className='pt-6'>
            <ul className='space-y-2 text-sm text-muted-foreground'>
              <li>- {t('protocolSnell.client1')}</li>
              <li>- {t('protocolSnell.client2')}</li>
              <li>- {t('protocolSnell.client3')}</li>
              <li>- {t('protocolSnell.client4')}</li>
            </ul>
          </CardContent>
        </Card>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('protocolSnell.notesHeading')}</h2>
        <ul className='space-y-2 text-sm text-muted-foreground'>
          <li>- {t('protocolSnell.note1')}</li>
          <li>- {t('protocolSnell.note2')}</li>
          <li>- {t('protocolSnell.note3')}</li>
          <li>- {t('protocolSnell.note4')}</li>
        </ul>
      </section>

      <section>
        <h2 className='text-2xl font-bold mb-4'>{t('protocolSnell.configExampleHeading')}</h2>
        <div className='space-y-6'>
          <Card>
            <CardContent className='pt-6'>
              <h3 className='font-semibold mb-2'>Snell v4 / v5</h3>
              <div className='bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto'>
                <pre>{`{
  "tag": "snell-in",
  "listen": "0.0.0.0",
  "port": 8443,
  "protocol": "snell",
  "settings": {
    "users": [
      {
        "psk": "your-psk",
        "version": 4,
        "obfsMode": "none",
        "email": "user@example.com"
      }
    ]
  }
}`}</pre>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='pt-6'>
              <h3 className='font-semibold mb-2'>Snell v6</h3>
              <div className='bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto'>
                <pre>{`{
  "tag": "snell-in",
  "listen": "0.0.0.0",
  "port": 8443,
  "protocol": "snell",
  "settings": {
    "users": [
      {
        "psk": "shared-psk",
        "version": 6,
        "v6Mode": "default",
        "clientId": "a1b2c3d4e5f6",
        "email": "user@example.com"
      }
    ]
  }
}`}</pre>
              </div>
              <p className='text-xs text-muted-foreground mt-3'>{t('protocolSnell.configNote')}</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </XDocLayout>
  )
}
