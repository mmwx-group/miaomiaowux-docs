import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { XDocLayout } from '@/components/docs/x-doc-layout'
import { Card, CardContent } from '@/components/ui/card'

export const Route = createFileRoute('/docs/protocol-vless')({
  component: ProtocolVlessPage,
})

function ProtocolVlessPage() {
  const { t } = useTranslation('xdocs')

  return (
    <XDocLayout title='VLESS' description={t('protocolVless.description')}>
      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('protocolVless.overview')}</h2>
        <p className='text-muted-foreground'>{t('protocolVless.overviewText')}</p>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('protocolVless.combinationsHeading')}</h2>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead><tr className='border-b'><th className='text-left py-3 px-4'>{t('protocolVless.transportCol')}</th><th className='text-left py-3 px-4'>{t('protocolVless.securityCol')}</th><th className='text-left py-3 px-4'>{t('protocolVless.descCol')}</th></tr></thead>
            <tbody>
              <tr className='border-b'><td className='py-3 px-4'>TCP</td><td className='py-3 px-4'>REALITY</td><td className='py-3 px-4'>{t('protocolVless.realityDesc')}</td></tr>
              <tr className='border-b'><td className='py-3 px-4'>TCP</td><td className='py-3 px-4'>REALITY + XTLS-Vision</td><td className='py-3 px-4'>{t('protocolVless.realityVisionDesc')}</td></tr>
              <tr className='border-b'><td className='py-3 px-4'>TCP</td><td className='py-3 px-4'>TLS</td><td className='py-3 px-4'>{t('protocolVless.tlsDesc')}</td></tr>
              <tr className='border-b'><td className='py-3 px-4'>TCP</td><td className='py-3 px-4'>TLS + XTLS-Vision</td><td className='py-3 px-4'>{t('protocolVless.tlsVisionDesc')}</td></tr>
              <tr className='border-b'><td className='py-3 px-4'>WebSocket</td><td className='py-3 px-4'>TLS</td><td className='py-3 px-4'>{t('protocolVless.wssDesc')}</td></tr>
              <tr className='border-b'><td className='py-3 px-4'>gRPC</td><td className='py-3 px-4'>REALITY</td><td className='py-3 px-4'>{t('protocolVless.grpcDesc')}</td></tr>
              <tr><td className='py-3 px-4'>XHTTP</td><td className='py-3 px-4'>REALITY</td><td className='py-3 px-4'>{t('protocolVless.xhttpDesc')}</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>XTLS-Vision</h2>
        <p className='text-muted-foreground mb-4'>{t('protocolVless.visionText')}</p>
      </section>

      <section>
        <h2 className='text-2xl font-bold mb-4'>{t('protocolVless.configExampleHeading')}</h2>
        <Card>
          <CardContent className='pt-6'>
            <h3 className='font-semibold mb-2'>{t('protocolVless.configExampleTitle')}</h3>
            <div className='bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto'>
              <pre>{`{
  "protocol": "vless",
  "settings": {
    "clients": [{ "id": "uuid", "flow": "xtls-rprx-vision" }],
    "decryption": "none"
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
