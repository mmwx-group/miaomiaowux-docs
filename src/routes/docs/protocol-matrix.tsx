import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { XDocLayout } from '@/components/docs/x-doc-layout'

export const Route = createFileRoute('/docs/protocol-matrix')({
  component: ProtocolMatrixPage,
})

function ProtocolMatrixPage() {
  const { t } = useTranslation('xdocs')

  const matrix = [
    { protocol: 'VLESS', transport: 'TCP', security: 'REALITY', note: '' },
    { protocol: 'VLESS', transport: 'TCP', security: 'REALITY + XTLS-Vision', note: 'flow: xtls-rprx-vision' },
    { protocol: 'VLESS', transport: 'TCP', security: 'TLS', note: '' },
    { protocol: 'VLESS', transport: 'TCP', security: 'TLS + XTLS-Vision', note: 'flow: xtls-rprx-vision' },
    { protocol: 'VLESS', transport: 'WS', security: 'TLS', note: 'WSS' },
    { protocol: 'VLESS', transport: 'gRPC', security: 'REALITY', note: '' },
    { protocol: 'VLESS', transport: 'XHTTP', security: 'REALITY', note: '' },
    { protocol: 'Trojan', transport: 'TCP', security: 'TLS', note: '' },
    { protocol: 'Trojan', transport: 'TCP', security: 'REALITY', note: '' },
    { protocol: 'Trojan', transport: 'gRPC', security: 'REALITY', note: '' },
    { protocol: 'VMess', transport: 'TCP', security: 'None', note: '' },
    { protocol: 'VMess', transport: 'TCP', security: 'TLS', note: '' },
    { protocol: 'VMess', transport: 'WS', security: 'None', note: '' },
    { protocol: 'VMess', transport: 'WS', security: 'TLS', note: '' },
    { protocol: 'Shadowsocks', transport: 'TCP', security: 'None', note: 'AEAD: aes-256-gcm' },
    { protocol: 'Shadowsocks', transport: 'TCP', security: 'None', note: 'SS2022: 2022-blake3-aes-256-gcm' },
    { protocol: 'Hysteria2', transport: 'UDP', security: 'TLS', note: t('protocolMatrix.noteNeedsCert') },
    { protocol: 'AnyTLS', transport: 'TCP', security: 'TLS', note: t('protocolMatrix.noteAnytlsTls') },
    { protocol: 'AnyTLS', transport: 'TCP', security: 'REALITY', note: t('protocolMatrix.noteAnytlsReality') },
    { protocol: 'Snell', transport: 'TCP', security: 'None', note: t('protocolMatrix.noteSnellV45') },
    { protocol: 'Snell', transport: 'TCP', security: 'None', note: t('protocolMatrix.noteSnellV6') },
  ]

  return (
    <XDocLayout title={t('protocolMatrix.title')} description={t('protocolMatrix.description')}>
      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('protocolMatrix.fullMatrixHeading')}</h2>
        <p className='text-muted-foreground mb-4'>{t('protocolMatrix.fullMatrixText')}</p>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b'>
                <th className='text-left py-3 px-4'>#</th>
                <th className='text-left py-3 px-4'>{t('protocolMatrix.protocolCol')}</th>
                <th className='text-left py-3 px-4'>{t('protocolMatrix.transportCol')}</th>
                <th className='text-left py-3 px-4'>{t('protocolMatrix.securityCol')}</th>
                <th className='text-left py-3 px-4'>{t('protocolMatrix.noteCol')}</th>
              </tr>
            </thead>
            <tbody>
              {matrix.map((row, i) => (
                <tr key={i} className='border-b'>
                  <td className='py-3 px-4 text-muted-foreground'>{i + 1}</td>
                  <td className='py-3 px-4 font-medium'>{row.protocol}</td>
                  <td className='py-3 px-4'>{row.transport}</td>
                  <td className='py-3 px-4'>{row.security}</td>
                  <td className='py-3 px-4 text-muted-foreground'>{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('protocolMatrix.deprecatedHeading')}</h2>
        <p className='text-muted-foreground mb-4'>{t('protocolMatrix.deprecatedText')}</p>
        <ul className='space-y-2 text-sm text-muted-foreground'>
          <li>- {t('protocolMatrix.deprecated1')}</li>
          <li>- {t('protocolMatrix.deprecated2')}</li>
        </ul>
      </section>

      <section>
        <h2 className='text-2xl font-bold mb-4'>{t('protocolMatrix.mihomoCompatHeading')}</h2>
        <ul className='space-y-2 text-sm text-muted-foreground'>
          <li>- {t('protocolMatrix.compat1')}</li>
          <li>- {t('protocolMatrix.compat2')}</li>
          <li>- {t('protocolMatrix.compat3')}</li>
          <li>- {t('protocolMatrix.compat4')}</li>
        </ul>
      </section>
    </XDocLayout>
  )
}
