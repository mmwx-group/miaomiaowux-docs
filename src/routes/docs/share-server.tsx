import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { XDocLayout } from '@/components/docs/x-doc-layout'
import { Card, CardContent } from '@/components/ui/card'
import { AlertTriangle, Info } from 'lucide-react'
import { ShareServerDemo } from '@/components/docs/share-server-demo'

export const Route = createFileRoute('/docs/share-server')({
  component: ShareServerPage,
})

function ShareServerPage() {
  const { t } = useTranslation('xdocs')

  return (
    <XDocLayout title={t('shareServer.title')} description={t('shareServer.description')}>

      {/* mock 左右双视图演示 */}
      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('shareServer.demo.heading')}</h2>
        <p className='text-muted-foreground mb-4'>{t('shareServer.demo.description')}</p>
        <ShareServerDemo />
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('shareServer.overview')}</h2>
        <p className='text-muted-foreground mb-4'>{t('shareServer.overviewText1')}</p>
        <p className='text-muted-foreground mb-4'>{t('shareServer.overviewText2')}</p>
        <div className='flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20'>
          <Info className='size-4 text-blue-500 mt-0.5 shrink-0' />
          <p className='text-sm text-blue-700 dark:text-blue-400'>{t('shareServer.proNote')}</p>
        </div>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('shareServer.architectureHeading')}</h2>
        <Card>
          <CardContent className='pt-6'>
            <div className='bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto'>
              <pre>{`消费方主控 ──(HTTPS + ECDH 加密)──▶ 拥有方主控 ──(securechan)──▶ Agent
    │                                      │
    │  填入: 拥有方地址 + 分享令牌           │  始终是 Agent 的唯一控制者
    │  操作: 添加入站、管理节点              │  转发消费方的管理命令
    │  限制: 不能启停服务、不能编辑服务器     │  校验令牌、管理分享
    │                                      │
    └─── 本地 remote_server 记录 ───────────┘`}</pre>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('shareServer.ownerHeading')}</h2>
        <p className='text-muted-foreground mb-4'>{t('shareServer.ownerText')}</p>

        <div className='space-y-4'>
          <Card>
            <CardContent className='pt-6'>
              <h3 className='font-semibold mb-3'>{t('shareServer.ownerStepsHeading')}</h3>
              <ol className='space-y-2 text-sm text-muted-foreground'>
                <li>{t('shareServer.ownerStep1')}</li>
                <li>{t('shareServer.ownerStep2')}</li>
                <li>{t('shareServer.ownerStep3')}</li>
                <li>{t('shareServer.ownerStep4')}</li>
              </ol>
              <div className='flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 mt-4'>
                <AlertTriangle className='size-4 text-amber-500 mt-0.5 shrink-0' />
                <p className='text-sm text-amber-700 dark:text-amber-400'>{t('shareServer.tokenOnceNote')}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-6'>
              <h3 className='font-semibold mb-3'>{t('shareServer.tokenMgmtHeading')}</h3>
              <div className='overflow-x-auto'>
                <table className='w-full text-sm'>
                  <thead><tr className='border-b'><th className='text-left py-2 pr-4 font-medium'>{t('shareServer.operationCol')}</th><th className='text-left py-2 font-medium'>{t('shareServer.descCol')}</th></tr></thead>
                  <tbody>
                    <tr className='border-b'>
                      <td className='py-2 pr-4'>{t('shareServer.tokenGenerate')}</td>
                      <td className='py-2'>{t('shareServer.tokenGenerateDesc')}</td>
                    </tr>
                    <tr className='border-b'>
                      <td className='py-2 pr-4'>{t('shareServer.tokenRevoke')}</td>
                      <td className='py-2'>{t('shareServer.tokenRevokeDesc')}</td>
                    </tr>
                    <tr>
                      <td className='py-2 pr-4'>{t('shareServer.tokenView')}</td>
                      <td className='py-2'>{t('shareServer.tokenViewDesc')}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('shareServer.consumerHeading')}</h2>
        <p className='text-muted-foreground mb-4'>{t('shareServer.consumerText')}</p>

        <div className='space-y-4'>
          <Card>
            <CardContent className='pt-6'>
              <h3 className='font-semibold mb-3'>{t('shareServer.consumerStepsHeading')}</h3>
              <ol className='space-y-2 text-sm text-muted-foreground'>
                <li>{t('shareServer.consumerStep1')}</li>
                <li>{t('shareServer.consumerStep2')}</li>
                <li>{t('shareServer.consumerStep3')}</li>
                <li>{t('shareServer.consumerStep4')}</li>
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-6'>
              <h3 className='font-semibold mb-3'>{t('shareServer.consumerParamsHeading')}</h3>
              <div className='overflow-x-auto'>
                <table className='w-full text-sm'>
                  <thead><tr className='border-b'><th className='text-left py-2 pr-4 font-medium'>{t('shareServer.paramCol')}</th><th className='text-left py-2 pr-4 font-medium'>{t('shareServer.requiredCol')}</th><th className='text-left py-2 font-medium'>{t('shareServer.descCol')}</th></tr></thead>
                  <tbody>
                    <tr className='border-b'>
                      <td className='py-2 pr-4'>{t('shareServer.paramOwnerAddr')}</td>
                      <td className='py-2 pr-4'>{t('shareServer.yes')}</td>
                      <td className='py-2'>{t('shareServer.paramOwnerAddrDesc')}</td>
                    </tr>
                    <tr className='border-b'>
                      <td className='py-2 pr-4'>{t('shareServer.paramShareToken')}</td>
                      <td className='py-2 pr-4'>{t('shareServer.yes')}</td>
                      <td className='py-2'>{t('shareServer.paramShareTokenDesc')}</td>
                    </tr>
                    <tr className='border-b'>
                      <td className='py-2 pr-4'>{t('shareServer.paramServerName')}</td>
                      <td className='py-2 pr-4'>{t('shareServer.no')}</td>
                      <td className='py-2'>{t('shareServer.paramServerNameDesc')}</td>
                    </tr>
                    <tr>
                      <td className='py-2 pr-4'>{t('shareServer.paramInboundPrefix')}</td>
                      <td className='py-2 pr-4'>{t('shareServer.no')}</td>
                      <td className='py-2'>{t('shareServer.paramInboundPrefixDesc')}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('shareServer.permissionsHeading')}</h2>
        <p className='text-muted-foreground mb-4'>{t('shareServer.permissionsText')}</p>

        <div className='space-y-4'>
          <Card>
            <CardContent className='pt-6'>
              <h3 className='font-semibold mb-3 text-green-600 dark:text-green-400'>{t('shareServer.canDoHeading')}</h3>
              <div className='overflow-x-auto'>
                <table className='w-full text-sm'>
                  <thead><tr className='border-b'><th className='text-left py-2 pr-4 font-medium'>{t('shareServer.operationCol')}</th><th className='text-left py-2 font-medium'>{t('shareServer.descCol')}</th></tr></thead>
                  <tbody>
                    <tr className='border-b'><td className='py-2 pr-4'>{t('shareServer.canViewStatus')}</td><td className='py-2'>{t('shareServer.canViewStatusDesc')}</td></tr>
                    <tr className='border-b'><td className='py-2 pr-4'>{t('shareServer.canAddInbound')}</td><td className='py-2'>{t('shareServer.canAddInboundDesc')}</td></tr>
                    <tr className='border-b'><td className='py-2 pr-4'>{t('shareServer.canManageInbound')}</td><td className='py-2'>{t('shareServer.canManageInboundDesc')}</td></tr>
                    <tr className='border-b'><td className='py-2 pr-4'>{t('shareServer.canAddNode')}</td><td className='py-2'>{t('shareServer.canAddNodeDesc')}</td></tr>
                    <tr><td className='py-2 pr-4'>{t('shareServer.canViewService')}</td><td className='py-2'>{t('shareServer.canViewServiceDesc')}</td></tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card className='border-red-200 dark:border-red-900'>
            <CardContent className='pt-6'>
              <h3 className='font-semibold mb-3 text-red-600 dark:text-red-400'>{t('shareServer.cannotDoHeading')}</h3>
              <div className='overflow-x-auto'>
                <table className='w-full text-sm'>
                  <thead><tr className='border-b'><th className='text-left py-2 pr-4 font-medium'>{t('shareServer.restrictionCol')}</th><th className='text-left py-2 font-medium'>{t('shareServer.reasonCol')}</th></tr></thead>
                  <tbody>
                    <tr className='border-b'><td className='py-2 pr-4'>{t('shareServer.cantXrayControl')}</td><td className='py-2'>{t('shareServer.cantXrayControlReason')}</td></tr>
                    <tr className='border-b'><td className='py-2 pr-4'>{t('shareServer.cantNginxControl')}</td><td className='py-2'>{t('shareServer.cantNginxControlReason')}</td></tr>
                    <tr className='border-b'><td className='py-2 pr-4'>{t('shareServer.cantInstall')}</td><td className='py-2'>{t('shareServer.cantInstallReason')}</td></tr>
                    <tr className='border-b'><td className='py-2 pr-4'>{t('shareServer.cantEditServer')}</td><td className='py-2'>{t('shareServer.cantEditServerReason')}</td></tr>
                    <tr className='border-b'><td className='py-2 pr-4'>{t('shareServer.cantReshare')}</td><td className='py-2'>{t('shareServer.cantReshareReason')}</td></tr>
                    <tr><td className='py-2 pr-4'>{t('shareServer.cantDirectAgent')}</td><td className='py-2'>{t('shareServer.cantDirectAgentReason')}</td></tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('shareServer.securityHeading')}</h2>
        <div className='space-y-4'>
          <Card>
            <CardContent className='pt-6'>
              <div className='overflow-x-auto'>
                <table className='w-full text-sm'>
                  <thead><tr className='border-b'><th className='text-left py-2 pr-4 font-medium'>{t('shareServer.mechanismCol')}</th><th className='text-left py-2 font-medium'>{t('shareServer.descCol')}</th></tr></thead>
                  <tbody>
                    <tr className='border-b'><td className='py-2 pr-4'>{t('shareServer.secTokenHash')}</td><td className='py-2'>{t('shareServer.secTokenHashDesc')}</td></tr>
                    <tr className='border-b'><td className='py-2 pr-4'>{t('shareServer.secECDH')}</td><td className='py-2'>{t('shareServer.secECDHDesc')}</td></tr>
                    <tr className='border-b'><td className='py-2 pr-4'>{t('shareServer.secPathWhitelist')}</td><td className='py-2'>{t('shareServer.secPathWhitelistDesc')}</td></tr>
                    <tr className='border-b'><td className='py-2 pr-4'>{t('shareServer.secTokenRevoke')}</td><td className='py-2'>{t('shareServer.secTokenRevokeDesc')}</td></tr>
                    <tr><td className='py-2 pr-4'>{t('shareServer.secAutoDowngrade')}</td><td className='py-2'>{t('shareServer.secAutoDowngradeDesc')}</td></tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('shareServer.scenariosHeading')}</h2>
        <div className='space-y-4'>
          <div className='bg-muted/30 rounded-lg p-4 border-l-4 border-blue-500'>
            <h4 className='font-semibold text-sm mb-2'>{t('shareServer.scenarioCoRent')}</h4>
            <p className='text-xs text-muted-foreground'>{t('shareServer.scenarioCoRentDesc')}</p>
          </div>
          <div className='bg-muted/30 rounded-lg p-4 border-l-4 border-green-500'>
            <h4 className='font-semibold text-sm mb-2'>{t('shareServer.scenarioRental')}</h4>
            <p className='text-xs text-muted-foreground'>{t('shareServer.scenarioRentalDesc')}</p>
          </div>
          <div className='bg-muted/30 rounded-lg p-4 border-l-4 border-purple-500'>
            <h4 className='font-semibold text-sm mb-2'>{t('shareServer.scenarioDistributed')}</h4>
            <p className='text-xs text-muted-foreground'>{t('shareServer.scenarioDistributedDesc')}</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className='text-2xl font-bold mb-4'>{t('shareServer.notesHeading')}</h2>
        <div className='space-y-3'>
          <div className='flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20'>
            <AlertTriangle className='size-4 text-amber-500 mt-0.5 shrink-0' />
            <p className='text-sm text-amber-700 dark:text-amber-400'>{t('shareServer.noteBothPro')}</p>
          </div>
          <div className='flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20'>
            <AlertTriangle className='size-4 text-amber-500 mt-0.5 shrink-0' />
            <p className='text-sm text-amber-700 dark:text-amber-400'>{t('shareServer.notePrefix')}</p>
          </div>
          <div className='flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20'>
            <AlertTriangle className='size-4 text-amber-500 mt-0.5 shrink-0' />
            <p className='text-sm text-amber-700 dark:text-amber-400'>{t('shareServer.noteRevokeCleanup')}</p>
          </div>
          <div className='flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20'>
            <Info className='size-4 text-blue-500 mt-0.5 shrink-0' />
            <p className='text-sm text-blue-700 dark:text-blue-400'>{t('shareServer.noteLatency')}</p>
          </div>
        </div>
      </section>
    </XDocLayout>
  )
}
