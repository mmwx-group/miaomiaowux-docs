import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { XDocLayout } from '@/components/docs/x-doc-layout'
import { Card, CardContent } from '@/components/ui/card'

export const Route = createFileRoute('/docs/protocol-shadowsocks')({
  component: ProtocolShadowsocksPage,
})

function ProtocolShadowsocksPage() {
  const { t } = useTranslation('xdocs')

  return (
    <XDocLayout title='Shadowsocks' description={t('protocolShadowsocks.description')}>
      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('protocolShadowsocks.overview')}</h2>
        <p className='text-muted-foreground'>{t('protocolShadowsocks.overviewText')}</p>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('protocolShadowsocks.encryptionHeading')}</h2>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead><tr className='border-b'><th className='text-left py-3 px-4'>{t('protocolShadowsocks.typeCol')}</th><th className='text-left py-3 px-4'>{t('protocolShadowsocks.algorithmCol')}</th><th className='text-left py-3 px-4'>{t('protocolShadowsocks.descCol')}</th></tr></thead>
            <tbody>
              <tr className='border-b'><td className='py-3 px-4'>AEAD</td><td className='py-3 px-4'>aes-256-gcm</td><td className='py-3 px-4'>{t('protocolShadowsocks.aeadDesc')}</td></tr>
              <tr className='border-b'><td className='py-3 px-4'>AEAD</td><td className='py-3 px-4'>chacha20-ietf-poly1305</td><td className='py-3 px-4'>{t('protocolShadowsocks.chachaDesc')}</td></tr>
              <tr><td className='py-3 px-4'>SS2022</td><td className='py-3 px-4'>2022-blake3-aes-256-gcm</td><td className='py-3 px-4'>{t('protocolShadowsocks.ss2022Desc')}</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('protocolShadowsocks.ss2022PasswordHeading')}</h2>
        <p className='text-muted-foreground mb-4'>{t('protocolShadowsocks.ss2022PasswordText')}</p>
      </section>

      <section>
        <h2 className='text-2xl font-bold mb-4'>{t('protocolShadowsocks.configExampleHeading')}</h2>
        <Card>
          <CardContent className='pt-6'>
            <h3 className='font-semibold mb-2'>SS2022</h3>
            <div className='bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto'>
              <pre>{`{
  "protocol": "shadowsocks",
  "settings": {
    "method": "2022-blake3-aes-256-gcm",
    "password": "server-base64-key",
    "network": "tcp,udp",
    "clients": [{ "password": "client-base64-key" }]
  }
}`}</pre>
            </div>
          </CardContent>
        </Card>
      </section>
    </XDocLayout>
  )
}
