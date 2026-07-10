import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { XDocLayout } from '@/components/docs/x-doc-layout'
import { Card, CardContent } from '@/components/ui/card'

export const Route = createFileRoute('/docs/mcp')({
  component: McpPage,
})

function McpPage() {
  const { t } = useTranslation('xdocs')

  return (
    <XDocLayout
      title={t('mcp.title')}
      description={t('mcp.description')}
    >
      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('mcp.overview')}</h2>
        <p className='text-muted-foreground mb-4'>
          {t('mcp.overviewText1a')}{' '}
          <code className='bg-muted px-1 py-0.5 rounded'>/mcp</code> {t('mcp.overviewText1b')}
        </p>
        <p className='text-muted-foreground'>
          {t('mcp.overviewText2')}
        </p>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('mcp.step1Heading')}</h2>
        <Card>
          <CardContent className='pt-6 text-sm text-muted-foreground space-y-2'>
            <p>{t('mcp.step1Item1')}</p>
            <p>{t('mcp.step1Item2a')} <code className='bg-muted px-1 py-0.5 rounded'>openclaw</code>{t('mcp.step1Item2b')}</p>
            <p><strong>{t('mcp.step1Item3Bold')}</strong>{t('mcp.step1Item3Rest')}</p>
            <p>{t('mcp.step1Item4')}</p>
          </CardContent>
        </Card>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('mcp.step2Heading')}</h2>

        <h3 className='font-semibold mb-2'>OpenClaw(openclaw.json)</h3>
        <div className='bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto mb-6'>
          <pre>{`{
  "mcp": {
    "servers": {
      "miaomiaowux": {
        "url": "https://你的主控/mcp",
        "transport": "streamable-http",
        "headers": { "Authorization": "Bearer <你的 API 令牌>" }
      }
    }
  }
}`}</pre>
        </div>

        <h3 className='font-semibold mb-2'>{t('mcp.hermesHeading')}</h3>
        <div className='bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto mb-3'>
          <pre>{`mcp_servers:
  miaomiaowux:
    url: "https://你的主控/mcp"
    headers:
      Authorization: "Bearer <你的 API 令牌>"
    connect_timeout: 15
    timeout: 600        # 安装 xray/nginx 等工具会阻塞数分钟,超时给大点
    # 可选:只放开想用的工具
    # tools:
    #   include: [server_list, user_list, package_list, traffic_summary, node_list]`}</pre>
        </div>
        <p className='text-sm text-muted-foreground mb-4'>
          {t('mcp.hermesNote')}
          <code className='bg-muted px-1 py-0.5 rounded'>registered 26 tool(s)</code>{t('mcp.hermesNoteSuffix')}
        </p>

        <Card>
          <CardContent className='pt-6 text-sm text-muted-foreground'>
            {t('mcp.otherClients')} <code className='bg-muted px-1 py-0.5 rounded'>/mcp</code> {t('mcp.otherClientsUrl')}{' '}
            <code className='bg-muted px-1 py-0.5 rounded'>Authorization: Bearer</code> {t('mcp.otherClientsSuffix')}
          </CardContent>
        </Card>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('mcp.toolsHeading')}</h2>
        <p className='text-muted-foreground mb-4'>{t('mcp.toolsDesc')}</p>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead><tr className='border-b'><th className='text-left py-2 px-3'>{t('mcp.toolsDomain')}</th><th className='text-left py-2 px-3'>{t('mcp.toolsRepresentative')}</th></tr></thead>
            <tbody>
              <tr className='border-b'><td className='py-2 px-3'>{t('mcp.domainNodes')}</td><td className='py-2 px-3'>node_list、node_speedtest、tunnel_list、node_delete*</td></tr>
              <tr className='border-b'><td className='py-2 px-3'>{t('mcp.domainSubTraffic')}</td><td className='py-2 px-3'>subscribe_file_list、traffic_summary、traffic_user_detail、temp_subscription_create</td></tr>
              <tr className='border-b'><td className='py-2 px-3'>{t('mcp.domainServerService')}</td><td className='py-2 px-3'>server_list、server_service_status/control、server_inbound_list/apply、server_xray_install*、server_sync_nodes</td></tr>
              <tr><td className='py-2 px-3'>{t('mcp.domainUserPackage')}</td><td className='py-2 px-3'>user_list/detail/create/set_status/set_limits/delete*、package_list/create/assign/unassign</td></tr>
            </tbody>
          </table>
        </div>
        <p className='text-xs text-muted-foreground mt-3'>
          {t('mcp.toolsNote')} <code className='bg-muted px-1 py-0.5 rounded'>confirm: true</code> {t('mcp.toolsNoteSuffix')}
        </p>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('mcp.skillsHeading')}</h2>
        <p className='text-muted-foreground mb-4'>
          {t('mcp.skillsDesc')}(<code className='bg-muted px-1 py-0.5 rounded'>SKILL.md</code>){t('mcp.skillsDescSuffix')}
        </p>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead><tr className='border-b'><th className='text-left py-2 px-3'>{t('mcp.skillName')}</th><th className='text-left py-2 px-3'>{t('mcp.skillUsage')}</th></tr></thead>
            <tbody>
              <tr className='border-b'><td className='py-2 px-3'>mmwx-onboard-user</td><td className='py-2 px-3'>{t('mcp.skillOnboard')}</td></tr>
              <tr className='border-b'><td className='py-2 px-3'>mmwx-add-server</td><td className='py-2 px-3'>{t('mcp.skillAddServer')}</td></tr>
              <tr className='border-b'><td className='py-2 px-3'>mmwx-traffic-report</td><td className='py-2 px-3'>{t('mcp.skillTrafficReport')}</td></tr>
              <tr className='border-b'><td className='py-2 px-3'>mmwx-node-speedtest</td><td className='py-2 px-3'>{t('mcp.skillSpeedtest')}</td></tr>
              <tr><td className='py-2 px-3'>mmwx-troubleshoot</td><td className='py-2 px-3'>{t('mcp.skillTroubleshoot')}</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('mcp.securityHeading')}</h2>
        <Card>
          <CardContent className='pt-6 text-sm text-muted-foreground space-y-2'>
            <p>{t('mcp.securityItem1')}</p>
            <p>{t('mcp.securityItem2a')} <code className='bg-muted px-1 py-0.5 rounded'>tools.include</code>{t('mcp.securityItem2b')}</p>
            <p>{t('mcp.securityItem3')}</p>
            <p>{t('mcp.securityItem4a')} <code className='bg-muted px-1 py-0.5 rounded'>confirm</code> {t('mcp.securityItem4b')}</p>
          </CardContent>
        </Card>
      </section>
    </XDocLayout>
  )
}
