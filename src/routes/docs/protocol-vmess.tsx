import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { XDocLayout } from '@/components/docs/x-doc-layout'
import { Card, CardContent } from '@/components/ui/card'

export const Route = createFileRoute('/docs/protocol-vmess')({
  component: ProtocolVmessPage,
})

function ProtocolVmessPage() {
  const { t } = useTranslation('xdocs')

  return (
    <XDocLayout title='VMess' description={t('protocolVmess.description')}>
      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('protocolVmess.overview')}</h2>
        <p className='text-muted-foreground'>{t('protocolVmess.overviewText')}</p>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('protocolVmess.combinationsHeading')}</h2>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead><tr className='border-b'><th className='text-left py-3 px-4'>{t('protocolVmess.transportCol')}</th><th className='text-left py-3 px-4'>{t('protocolVmess.securityCol')}</th><th className='text-left py-3 px-4'>{t('protocolVmess.descCol')}</th></tr></thead>
            <tbody>
              <tr className='border-b'><td className='py-3 px-4'>TCP</td><td className='py-3 px-4'>None</td><td className='py-3 px-4'>{t('protocolVmess.tcpNoneDesc')}</td></tr>
              <tr className='border-b'><td className='py-3 px-4'>TCP</td><td className='py-3 px-4'>TLS</td><td className='py-3 px-4'>{t('protocolVmess.tcpTlsDesc')}</td></tr>
              <tr className='border-b'><td className='py-3 px-4'>WebSocket</td><td className='py-3 px-4'>None</td><td className='py-3 px-4'>{t('protocolVmess.wsNoneDesc')}</td></tr>
              <tr><td className='py-3 px-4'>WebSocket</td><td className='py-3 px-4'>TLS</td><td className='py-3 px-4'>{t('protocolVmess.wsTlsDesc')}</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className='text-2xl font-bold mb-4'>{t('protocolVmess.configExampleHeading')}</h2>
        <Card>
          <CardContent className='pt-6'>
            <h3 className='font-semibold mb-2'>VMess + WS + TLS</h3>
            <div className='bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto'>
              <pre>{`{
  "protocol": "vmess",
  "settings": {
    "clients": [{ "id": "uuid", "alterId": 0 }]
  },
  "streamSettings": {
    "network": "ws",
    "security": "tls",
    "wsSettings": { "path": "/vmess" },
    "tlsSettings": {
      "serverName": "example.com",
      "certificates": [{ "certificateFile": "...", "keyFile": "..." }]
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
