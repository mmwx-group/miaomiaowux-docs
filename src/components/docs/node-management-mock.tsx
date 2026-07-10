// 节点管理 mock — 真实可点击按钮 + mock 数据。
// 顶部 4 按钮 & 行内 2 按钮 onClick 弹真实 Dialog;数据全 mock,关闭无副作用。
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  Zap,
  Network,
  Gauge,
  Workflow,
  Edit3,
  ArrowLeftRight,
  Route as RouteIcon,
  Trash2,
  Eye,
  Copy,
  Link as LinkIcon,
  RotateCcw,
  Activity,
  Check,
  ChevronDown,
  Plus,
  X,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

// 高亮:跟用户截图中的红/黑/黄/蓝/绿 边框对应
const HL = {
  add: 'ring-2 ring-red-500/70 ring-offset-1',
  tunnel: 'ring-2 ring-zinc-900/70 dark:ring-zinc-100/70 ring-offset-1',
  routedAll: 'ring-2 ring-yellow-500/70 ring-offset-1',
  routedRow: 'ring-2 ring-blue-500/70 ring-offset-1',
  viewRow: 'ring-2 ring-green-500/70 ring-offset-1',
}

type DialogKind = 'addInbound' | 'addRouted' | 'viewRouting' | 'tunnel' | 'routedMgr' | null

export function NodeManagementMock() {
  const { t } = useTranslation('xdocs')
  const [openDialog, setOpenDialog] = useState<DialogKind>(null)

  return (
    <>
      {/* lg+ 突破文档容器宽度,让节点表格 6 列完整展示不重叠 */}
      <Card className='border-dashed lg:-mx-8 xl:-mx-20 2xl:-mx-32'>
        <CardContent className='pt-6 space-y-4'>
          <div className='flex items-center gap-2 flex-wrap'>
            <Badge variant='outline' className='text-xs'>{t('faqNodeMgmt.badge')}</Badge>
            <span className='text-xs text-muted-foreground'>{t('faqNodeMgmt.intro')}</span>
          </div>

          {/* 主面板:内部表格用 overflow-x-auto + min-width 兜底,小屏可滚 */}
          <div className='rounded-lg border bg-card p-4 space-y-3 overflow-x-auto'>
            {/* 顶部:节点列表 + 4 个关键按钮 */}
            <div className='flex items-start justify-between flex-wrap gap-3'>
              <div>
                <div className='font-semibold text-sm flex items-center gap-2'>
                  {t('faqNodeMgmt.mock.listHeading')}
                  <Badge variant='secondary' className='text-[10px]'>3</Badge>
                </div>
                <div className='text-[11px] text-red-600 dark:text-red-400 font-medium mt-1'>
                  {t('faqNodeMgmt.mock.listSyncWarn')}
                </div>
              </div>

              <div className='flex items-center gap-2 flex-wrap'>
                <button
                  className={`inline-flex items-center gap-1.5 rounded-md border bg-card px-3 py-1.5 text-xs hover:bg-muted ${HL.add}`}
                  onClick={() => setOpenDialog('addInbound')}
                >
                  <Zap className='size-3.5' />
                  {t('faqNodeMgmt.mock.addNodeBtn')}
                </button>
                <button
                  className={`inline-flex items-center gap-1.5 rounded-md border bg-card px-3 py-1.5 text-xs hover:bg-muted ${HL.tunnel}`}
                  onClick={() => setOpenDialog('tunnel')}
                >
                  <Workflow className='size-3.5' />
                  {t('faqNodeMgmt.mock.tunnelBtn')}
                </button>
                <button
                  className={`inline-flex items-center gap-1.5 rounded-md border bg-card px-3 py-1.5 text-xs hover:bg-muted ${HL.routedAll}`}
                  onClick={() => setOpenDialog('routedMgr')}
                >
                  <Network className='size-3.5' />
                  {t('faqNodeMgmt.mock.routedAllBtn')}
                </button>
                <button
                  className='inline-flex items-center gap-1.5 rounded-md border bg-card px-3 py-1.5 text-xs hover:bg-muted'
                  onClick={() => toast.info(t('faqNodeMgmt.mock.speedtestComing'))}
                >
                  <Gauge className='size-3.5' />
                  {t('faqNodeMgmt.mock.speedtestBtn')}
                </button>
              </div>
            </div>

            {/* 表头 */}
            <div className='border-t pt-2 grid grid-cols-[60px_minmax(180px,1fr)_auto_120px_auto_auto] gap-3 min-w-[860px] text-[11px] font-medium text-muted-foreground'>
              <span>{t('faqNodeMgmt.mock.col.protocol')}</span>
              <span>{t('faqNodeMgmt.mock.col.name')}</span>
              <span>{t('faqNodeMgmt.mock.col.actions')}</span>
              <span>{t('faqNodeMgmt.mock.col.tag')}</span>
              <span className='text-right'>{t('faqNodeMgmt.mock.col.config')}</span>
              <span className='text-right'>{t('faqNodeMgmt.mock.col.ops')}</span>
            </div>

            {MOCK_NODES.map((n, idx) => (
              <div
                key={n.id}
                className={`grid grid-cols-[60px_minmax(180px,1fr)_auto_120px_auto_auto] gap-3 min-w-[860px] items-center py-2 px-1 rounded ${
                  idx === 0 ? 'bg-orange-50 dark:bg-orange-950/20' : ''
                }`}
              >
                <Badge variant='outline' className={`justify-center text-[10px] ${n.protoColor}`}>{n.proto}</Badge>
                <div className='min-w-0'>
                  <div className='text-sm flex items-center gap-1.5'>
                    <span>{n.flag}</span>
                    <span className='font-medium truncate'>{n.name}</span>
                  </div>
                  <div className='text-[10px] text-muted-foreground truncate'>{n.server}</div>
                </div>
                <div className='flex items-center gap-0.5'>
                  <Check className='size-3.5 text-green-600' />
                  <button className='p-1 rounded hover:bg-muted' onClick={() => toast.info(t('faqNodeMgmt.mock.editComing'))}>
                    <Edit3 className='size-3.5 text-muted-foreground' />
                  </button>
                  {/* 蓝框:创建链式出站 */}
                  <button
                    className={`p-1 rounded hover:bg-muted ${idx === 0 ? HL.routedRow : ''}`}
                    onClick={() => setOpenDialog('addRouted')}
                    title={t('faqNodeMgmt.mock.tooltipAddRouted')}
                  >
                    <ArrowLeftRight className='size-3.5 text-orange-600' />
                  </button>
                  {/* 绿框:查看路由 */}
                  <button
                    className={`p-1 rounded hover:bg-muted ${idx === 0 ? HL.viewRow : ''}`}
                    onClick={() => setOpenDialog('viewRouting')}
                    title={t('faqNodeMgmt.mock.tooltipViewRouting')}
                  >
                    <RouteIcon className='size-3.5 text-orange-600' />
                  </button>
                  <span className='text-base ml-0.5'>{n.flag}</span>
                </div>
                <Badge variant='outline' className='text-[10px] bg-orange-50 dark:bg-orange-950/20 border-orange-300 text-orange-700'>
                  {t('faqNodeMgmt.mock.manualTag')}
                </Badge>
                <div className='flex items-center gap-0.5 justify-end'>
                  <button className='p-1 rounded hover:bg-muted'><RotateCcw className='size-3.5' /></button>
                  <button className='p-1 rounded hover:bg-muted'><Activity className='size-3.5' /></button>
                </div>
                <div className='flex items-center gap-0.5 justify-end'>
                  <button className='p-1 rounded hover:bg-muted'><Eye className='size-3.5' /></button>
                  <button className='p-1 rounded hover:bg-muted'><Copy className='size-3.5' /></button>
                  <button className='p-1 rounded hover:bg-muted'><LinkIcon className='size-3.5' /></button>
                  <button className='p-1 rounded hover:bg-muted hover:text-destructive'><Trash2 className='size-3.5' /></button>
                </div>
              </div>
            ))}
          </div>

          {/* 颜色图例 */}
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-muted-foreground'>
            <Legend color='bg-red-500'   label={t('faqNodeMgmt.legend.add')} />
            <Legend color='bg-black'     label={t('faqNodeMgmt.legend.tunnel')} />
            <Legend color='bg-yellow-500' label={t('faqNodeMgmt.legend.routedAll')} />
            <Legend color='bg-blue-500'  label={t('faqNodeMgmt.legend.routedRow')} />
            <Legend color='bg-green-500' label={t('faqNodeMgmt.legend.viewRow')} />
            <span className='text-[11px] text-muted-foreground italic'>{t('faqNodeMgmt.legend.hint')}</span>
          </div>
        </CardContent>
      </Card>

      {/* 5 个真实可交互的 Dialog */}
      <AddInboundDialog open={openDialog === 'addInbound'} onClose={() => setOpenDialog(null)} />
      <AddRoutedNodeDialog open={openDialog === 'addRouted'} onClose={() => setOpenDialog(null)} />
      <ViewRoutingDialog open={openDialog === 'viewRouting'} onClose={() => setOpenDialog(null)} />
      <TunnelManagerDialog open={openDialog === 'tunnel'} onClose={() => setOpenDialog(null)} />
      <RoutedManagerDialog open={openDialog === 'routedMgr'} onClose={() => setOpenDialog(null)} />
    </>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className='flex items-center gap-1.5'>
      <span className={`inline-block size-2.5 rounded-sm ${color}`} />
      <span>{label}</span>
    </span>
  )
}

// ───────── Dialog 1:添加节点(入站向导)
//
// 布局严格对照真实页面:
//   1. 顶部 4 段(协议/传输/安全/模式)占满整宽,水平横排
//   2. 配置模式 = 简易/专家 两个 50% 通栏大按钮
//   3. 节点名 / REALITY 域名 / 用户管理 三张 Card 全宽
//   4. JSON 预览作为右侧 sticky panel(只显示在 lg+ 宽屏)
// ─────────
function AddInboundDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation('xdocs')
  const [protocol, setProtocol] = useState('VLESS')
  const [transport, setTransport] = useState('TCP')
  const [security, setSecurity] = useState('XTLS-Vision-REALITY')
  const [mode, setMode] = useState<'simple' | 'expert'>('simple')
  const [nodeName, setNodeName] = useState('')
  const [reality, setReality] = useState('')
  const [uuid, setUuid] = useState('f7699111-7456-467e-ba6e-b8990e214ad8')
  const [email, setEmail] = useState('')

  const protocols = ['SHADOWSOCKS2022', 'SOCKS5', 'TROJAN', 'VLESS', 'VMESS', 'HYSTERIA2', 'ANYTLS', 'HTTP', 'TUNNEL']
  const transports = ['GRPC', 'TCP', 'WSS', 'XHTTP']
  const securities = ['REALITY', 'TLS', 'TLS-WS', 'XTLS-Vision', 'XTLS-Vision-REALITY']

  // 协议:浅橙底带橙文,**选中只是文字加深 + 边框变橙(不变背景色)**,跟真实页面 VLESS 一致
  const chipProto = (active: boolean) =>
    active
      ? 'bg-orange-100 text-orange-900 border-orange-400 dark:bg-orange-950/40 dark:text-orange-200 dark:border-orange-600'
      : 'bg-orange-50/60 text-orange-700 border-orange-100 hover:bg-orange-100 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-950'
  // 传输 / 安全 / 模式:outline,选中实心橙
  const chipSolid = (active: boolean) =>
    active
      ? 'bg-orange-500 text-white border-orange-500 hover:bg-orange-500'
      : 'bg-card text-foreground border-border hover:bg-muted'

  const showReality = security === 'REALITY' || security === 'XTLS-Vision-REALITY'

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className='max-w-[95vw] xl:max-w-[1400px] max-h-[92vh] overflow-hidden flex flex-col p-0'>
        <DialogHeader className='p-6 pb-3 border-b'>
          <DialogTitle>{t('faqNodeMgmt.dialog.addInbound.title')}</DialogTitle>
          <DialogDescription>{t('faqNodeMgmt.dialog.addInbound.desc')}</DialogDescription>
        </DialogHeader>

        <div className='flex-1 overflow-y-auto'>
          <div className='grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 p-6'>
            {/* 主区:协议/传输/安全/模式 横排,然后 Cards */}
            <div className='space-y-6 min-w-0'>
              {/* 协议(横排全宽) */}
              <div>
                <Label className='text-base font-bold mb-3 block'>{t('faqNodeMgmt.dialog.addInbound.protocol')}</Label>
                <div className='flex flex-wrap gap-2'>
                  {protocols.map((p) => (
                    <button
                      key={p}
                      onClick={() => setProtocol(p)}
                      className={`px-4 py-2 rounded-md text-xs font-bold border transition-colors ${chipProto(p === protocol)}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* 传输 */}
              <div>
                <Label className='text-base font-bold mb-3 block'>{t('faqNodeMgmt.dialog.addInbound.transport')}</Label>
                <div className='flex flex-wrap gap-2'>
                  {transports.map((p) => (
                    <button
                      key={p}
                      onClick={() => setTransport(p)}
                      className={`px-5 py-2 rounded-md text-sm font-medium border transition-colors ${chipSolid(p === transport)}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* 安全 */}
              <div>
                <Label className='text-base font-bold mb-3 block'>{t('faqNodeMgmt.dialog.addInbound.security')}</Label>
                <div className='flex flex-wrap gap-2'>
                  {securities.map((p) => (
                    <button
                      key={p}
                      onClick={() => setSecurity(p)}
                      className={`px-5 py-2 rounded-md text-sm font-medium border transition-colors ${chipSolid(p === security)}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* 配置模式:**两个 50% 通栏大按钮**(关键差异:跟真实页面一样占满整行) */}
              <div>
                <Label className='text-base font-bold mb-3 block'>{t('faqNodeMgmt.dialog.addInbound.configMode')}</Label>
                <div className='grid grid-cols-2 gap-3'>
                  <button
                    className={`py-3 text-base font-semibold rounded-md border transition-colors ${chipSolid(mode === 'simple')}`}
                    onClick={() => setMode('simple')}
                  >
                    {t('faqNodeMgmt.dialog.addInbound.simple')}
                  </button>
                  <button
                    className={`py-3 text-base font-semibold rounded-md border transition-colors ${chipSolid(mode === 'expert')}`}
                    onClick={() => setMode('expert')}
                  >
                    {t('faqNodeMgmt.dialog.addInbound.expert')}
                  </button>
                </div>
              </div>

              {/* 简易模式:节点名/REALITY/用户管理 三张全宽 Card */}
              {mode === 'simple' && (
                <>
                  <div className='rounded-lg border p-5 space-y-3'>
                    <div>
                      <Label className='text-base font-bold'>{t('faqNodeMgmt.dialog.addInbound.nodeName')}</Label>
                      <p className='text-xs text-muted-foreground mt-1'>{t('faqNodeMgmt.dialog.addInbound.nodeNameHint')}</p>
                    </div>
                    <div className='flex items-center gap-3'>
                      <span className='rounded border px-3 py-2 text-sm font-semibold bg-orange-50 dark:bg-orange-950/20 shrink-0'>🇭🇰</span>
                      <Input
                        value={nodeName}
                        onChange={(e) => setNodeName(e.target.value)}
                        placeholder={t('faqNodeMgmt.dialog.addInbound.nodeNamePlaceholder')}
                        className='flex-1'
                      />
                    </div>
                  </div>

                  {showReality && (
                    <div className='rounded-lg border p-5 space-y-3'>
                      <div>
                        <Label className='text-base font-bold'>{t('faqNodeMgmt.dialog.addInbound.realityDomain')}</Label>
                        <p className='text-xs text-muted-foreground mt-1 inline-flex items-center gap-1.5'>
                          <span className='inline-block size-3 border-2 border-muted-foreground/30 border-t-foreground rounded-full animate-spin' />
                          {t('faqNodeMgmt.dialog.addInbound.realityDetecting')}
                        </p>
                      </div>
                      <div>
                        <Label className='text-sm font-medium mb-1.5 block'>{t('faqNodeMgmt.dialog.addInbound.realityCustom')}</Label>
                        <div className='flex gap-2'>
                          <Input
                            value={reality}
                            onChange={(e) => setReality(e.target.value)}
                            placeholder={t('faqNodeMgmt.dialog.addInbound.realityPlaceholder')}
                            className='flex-1'
                          />
                          <Button variant='outline' onClick={() => toast.info(t('faqNodeMgmt.dialog.addInbound.probingToast'))}>
                            {t('faqNodeMgmt.dialog.addInbound.detect')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className='rounded-lg border p-5 space-y-3'>
                    <div>
                      <Label className='text-base font-bold'>{t('faqNodeMgmt.dialog.addInbound.userMgmt')}</Label>
                      <p className='text-xs text-muted-foreground mt-1'>{t('faqNodeMgmt.dialog.addInbound.clientConfig')}</p>
                    </div>
                    <Label className='text-sm font-medium'>
                      {t('faqNodeMgmt.dialog.addInbound.user')} <span className='text-destructive'>*</span>
                    </Label>
                    <div className='rounded-md border bg-muted/20 p-4 space-y-3'>
                      <div className='text-sm font-semibold'>{t('faqNodeMgmt.dialog.addInbound.user')} #1</div>
                      <div>
                        <Label className='text-xs font-medium'>UUID <span className='text-destructive'>*</span></Label>
                        <Input value={uuid} onChange={(e) => setUuid(e.target.value)} className='mt-1 font-mono text-xs' />
                        <p className='text-[11px] text-muted-foreground mt-1'>{t('faqNodeMgmt.dialog.addInbound.uuidHint')}</p>
                      </div>
                      <div>
                        <Label className='text-xs font-medium'>{t('faqNodeMgmt.dialog.addInbound.emailLabel')}</Label>
                        <Input value={email} onChange={(e) => setEmail(e.target.value)} className='mt-1' />
                        <p className='text-[11px] text-muted-foreground mt-1'>{t('faqNodeMgmt.dialog.addInbound.emailHint')}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* 专家模式:1:1 复刻截图的多 Card 网格 — 通用配置 / 用户管理 / 安全协议 / 协议特定 */}
              {mode === 'expert' && (
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  {/* 通用配置 Card */}
                  <div className='rounded-lg border p-4 space-y-3'>
                    <div>
                      <Label className='text-base font-bold'>{t('faqNodeMgmt.dialog.addInbound.expert.common', { defaultValue: '通用配置' })}</Label>
                      <p className='text-xs text-muted-foreground mt-0.5'>{t('faqNodeMgmt.dialog.addInbound.expert.commonDesc', { defaultValue: '适用于所有入站的基础配置' })}</p>
                    </div>
                    <div>
                      <Label className='text-sm font-medium'>{t('faqNodeMgmt.dialog.addInbound.nodeName')}</Label>
                      <div className='flex items-center gap-2 mt-1'>
                        <span className='rounded border px-2 py-1.5 text-sm bg-orange-50 dark:bg-orange-950/20 shrink-0'>🇭🇰</span>
                        <Input value={nodeName} onChange={(e) => setNodeName(e.target.value)} placeholder={t('faqNodeMgmt.dialog.addInbound.nodeNamePlaceholder')} className='flex-1' />
                      </div>
                    </div>
                    <div>
                      <Label className='text-sm font-medium'>{t('faqNodeMgmt.dialog.addInbound.expert.port', { defaultValue: '端口' })} <span className='text-destructive'>*</span></Label>
                      <Input defaultValue='35546' className='mt-1' />
                      <p className='text-[11px] text-muted-foreground mt-1'>{t('faqNodeMgmt.dialog.addInbound.expert.portHint', { defaultValue: '监听端口号' })}</p>
                    </div>
                    <div>
                      <Label className='text-sm font-medium'>{t('faqNodeMgmt.dialog.addInbound.expert.listen', { defaultValue: '监听地址' })}</Label>
                      <Input defaultValue='0.0.0.0' className='mt-1' />
                      <p className='text-[11px] text-muted-foreground mt-1'>{t('faqNodeMgmt.dialog.addInbound.expert.listenHint', { defaultValue: '0.0.0.0 表示监听所有网卡' })}</p>
                    </div>
                    <div>
                      <Label className='text-sm font-medium'>{t('faqNodeMgmt.dialog.addInbound.expert.tag', { defaultValue: '入站标识' })}</Label>
                      <Input value={`${protocol.toLowerCase()}-${transport.toLowerCase()}-${security.toLowerCase()}-35546`} readOnly className='mt-1 font-mono text-xs' />
                      <p className='text-[11px] text-muted-foreground mt-1'>{t('faqNodeMgmt.dialog.addInbound.expert.tagHint', { defaultValue: '会根据协议-传输-安全-端口自动生成' })}</p>
                    </div>
                    <label className='flex items-start gap-2 rounded-md bg-orange-50/60 dark:bg-orange-950/20 p-2 cursor-pointer'>
                      <input type='checkbox' defaultChecked className='mt-0.5 accent-orange-500' />
                      <div>
                        <div className='text-sm font-medium'>{t('faqNodeMgmt.dialog.addInbound.expert.sniff', { defaultValue: '启用流量嗅探' })}</div>
                        <div className='text-[11px] text-muted-foreground'>{t('faqNodeMgmt.dialog.addInbound.expert.sniffHint', { defaultValue: '自动识别并覆盖目标地址' })}</div>
                      </div>
                    </label>
                  </div>

                  {/* 用户管理 Card */}
                  <div className='rounded-lg border p-4 space-y-3'>
                    <div>
                      <Label className='text-base font-bold'>{t('faqNodeMgmt.dialog.addInbound.userMgmt')}</Label>
                      <p className='text-xs text-muted-foreground mt-0.5'>{t('faqNodeMgmt.dialog.addInbound.clientConfig')}</p>
                    </div>
                    <Label className='text-sm font-medium'>{t('faqNodeMgmt.dialog.addInbound.user')} <span className='text-destructive'>*</span></Label>
                    <div className='rounded-md border bg-muted/20 p-3 space-y-3'>
                      <div className='text-sm font-semibold'>{t('faqNodeMgmt.dialog.addInbound.user')} #1</div>
                      <div>
                        <Label className='text-xs font-medium'>UUID <span className='text-destructive'>*</span></Label>
                        <Input value={uuid} onChange={(e) => setUuid(e.target.value)} className='mt-1 font-mono text-xs' />
                        <p className='text-[11px] text-muted-foreground mt-1'>{t('faqNodeMgmt.dialog.addInbound.uuidHint')}</p>
                      </div>
                      <div>
                        <Label className='text-xs font-medium'>{t('faqNodeMgmt.dialog.addInbound.emailLabel')}</Label>
                        <Input value={email} onChange={(e) => setEmail(e.target.value)} className='mt-1' />
                        <p className='text-[11px] text-muted-foreground mt-1'>{t('faqNodeMgmt.dialog.addInbound.emailHint')}</p>
                      </div>
                      <div>
                        <Label className='text-xs font-medium'>{t('faqNodeMgmt.dialog.addInbound.expert.userLevel', { defaultValue: '用户等级' })}</Label>
                        <Input defaultValue='' placeholder='0' className='mt-1' />
                      </div>
                      <div>
                        <Label className='text-xs font-medium'>{t('faqNodeMgmt.dialog.addInbound.expert.flow', { defaultValue: '流控' })}</Label>
                        <select className='mt-1 w-full rounded-md border bg-card px-3 py-2 text-sm'>
                          <option value='xtls-rprx-vision'>xtls-rprx-vision</option>
                          <option value=''>{t('faqNodeMgmt.dialog.addInbound.expert.flowNone', { defaultValue: '无' })}</option>
                        </select>
                        <p className='text-[11px] text-muted-foreground mt-1'>{t('faqNodeMgmt.dialog.addInbound.expert.flowHint', { defaultValue: 'XTLS流控模式' })}</p>
                      </div>
                    </div>
                  </div>

                  {/* 安全协议配置 Card */}
                  <div className='rounded-lg border p-4 space-y-3'>
                    <div>
                      <Label className='text-base font-bold'>{t('faqNodeMgmt.dialog.addInbound.expert.security', { defaultValue: '安全协议配置' })}</Label>
                      <p className='text-xs text-muted-foreground mt-0.5'>{security} {t('faqNodeMgmt.dialog.addInbound.expert.securityDesc', { defaultValue: '安全设置' })}</p>
                    </div>
                    <div className='flex items-center gap-3'>
                      <Button variant='outline' size='sm'>{t('faqNodeMgmt.dialog.addInbound.expert.stealMyself', { defaultValue: '我要偷自己' })}</Button>
                      <span className='text-[11px] text-muted-foreground'>{t('faqNodeMgmt.dialog.addInbound.expert.stealHint', { defaultValue: '读取所有服务器配置域名,并由当前服务器探测延迟' })}</span>
                    </div>
                    <select className='w-full rounded-md border bg-card px-3 py-2 text-sm'>
                      <option>www.lovelive-anime.jp (2ms)</option>
                      <option>www.microsoft.com</option>
                    </select>
                    <div>
                      <Label className='text-sm font-medium'>{t('faqNodeMgmt.dialog.addInbound.realityCustom')}</Label>
                      <div className='flex gap-2 mt-1'>
                        <Input value={reality} onChange={(e) => setReality(e.target.value)} placeholder={t('faqNodeMgmt.dialog.addInbound.realityPlaceholder')} className='flex-1' />
                        <Button variant='outline'>{t('faqNodeMgmt.dialog.addInbound.detect')}</Button>
                      </div>
                    </div>
                    <div>
                      <Label className='text-sm font-medium'>{t('faqNodeMgmt.dialog.addInbound.expert.targetSite', { defaultValue: '目标网站' })} <span className='text-destructive'>*</span></Label>
                      <div className='flex gap-2 mt-1'>
                        <Input defaultValue='www.lovelive-anime.jp' className='flex-1' />
                        <Input defaultValue='443' className='w-20' />
                      </div>
                      <p className='text-[11px] text-muted-foreground mt-1'>{t('faqNodeMgmt.dialog.addInbound.expert.targetHint', { defaultValue: '支持 TLS 1.3 和 H2 的目标网站' })}</p>
                    </div>
                    <div>
                      <Label className='text-sm font-medium'>{t('faqNodeMgmt.dialog.addInbound.expert.serverNames', { defaultValue: '服务器名称列表' })}</Label>
                      <Input defaultValue='www.lovelive-anime.jp' className='mt-1' />
                      <p className='text-[11px] text-muted-foreground mt-1'>{t('faqNodeMgmt.dialog.addInbound.expert.serverNamesHint', { defaultValue: '目标网站证书中的服务器名称,逗号分隔' })}</p>
                    </div>
                  </div>

                  {/* 协议特定配置 Card */}
                  <div className='rounded-lg border p-4 space-y-3'>
                    <div>
                      <Label className='text-base font-bold'>{t('faqNodeMgmt.dialog.addInbound.expert.protocolSpecific', { defaultValue: '协议特定配置' })}</Label>
                      <p className='text-xs text-muted-foreground mt-0.5'>{protocol} {t('faqNodeMgmt.dialog.addInbound.expert.protocolSpecificDesc', { defaultValue: '协议设置' })}</p>
                    </div>
                    <Label className='text-sm font-medium'>{t('faqNodeMgmt.dialog.addInbound.expert.decryption', { defaultValue: '解密方式' })}</Label>
                    <div className='grid grid-cols-2 gap-2'>
                      <button className='py-2 text-sm font-medium rounded-md border bg-orange-500 text-white border-orange-500'>
                        none ({t('faqNodeMgmt.dialog.addInbound.expert.noEncryption', { defaultValue: '无加密' })})
                      </button>
                      <button className='py-2 text-sm font-medium rounded-md border bg-card hover:bg-muted'>
                        {t('faqNodeMgmt.dialog.addInbound.expert.encrypted', { defaultValue: '加密' })}
                      </button>
                    </div>
                    <p className='text-[11px] text-muted-foreground'>{t('faqNodeMgmt.dialog.addInbound.expert.vlessDecHint', { defaultValue: 'VLESS解密方式,支持后量子加密' })}</p>
                    <div>
                      <Label className='text-sm font-medium'>{t('faqNodeMgmt.dialog.addInbound.expert.decValue', { defaultValue: 'Decryption 配置值' })}</Label>
                      <Input defaultValue='none' className='mt-1' />
                      <p className='text-[11px] text-muted-foreground mt-1'>{t('faqNodeMgmt.dialog.addInbound.expert.noEncryptHint', { defaultValue: '无加密配置' })}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 右栏:JSON 预览 — sticky */}
            <div className='lg:sticky lg:top-0 lg:self-start space-y-2'>
              <div>
                <Label className='text-base font-bold'>{t('faqNodeMgmt.dialog.addInbound.jsonPreview')}</Label>
                <p className='text-xs text-muted-foreground mt-1'>{t('faqNodeMgmt.dialog.addInbound.jsonPreviewHint')}</p>
              </div>
              <pre className='rounded-md border bg-muted/20 p-3 text-[11px] font-mono leading-relaxed overflow-x-auto max-h-[60vh] overflow-y-auto'>{`{
  "port": 443,
  "protocol": "${protocol.toLowerCase()}",
  "tag": "${protocol.toLowerCase()}-${transport.toLowerCase()}-${security.toLowerCase()}-443",
  "sniffing": {
    "enabled": true,
    "destOverride": [
      "http",
      "tls",
      "quic"
    ]
  },
  "settings": {
    "decryption": "none",
    "encryption": "none",
    "clients": [
      {
        "id": "${uuid.slice(0, 36)}",
        "level": 0,
        "email": "${email || 'user@x'}",
        "flow": "xtls-rprx-vision"
      }
    ]
  },
  "streamSettings": {
    "network": "${transport.toLowerCase()}",
    "security": "${showReality ? 'reality' : security.toLowerCase()}",
    "realitySettings": {
      "dest": "${reality || 'www.microsoft.com'}:443",
      "serverNames": [
        "${reality || 'www.microsoft.com'}"
      ]
    }
  }
}`}</pre>
            </div>
          </div>
        </div>

        <DialogFooter className='p-4 border-t'>
          <Button variant='outline' onClick={onClose}>{t('faqNodeMgmt.dialog.cancel')}</Button>
          <Button onClick={() => { toast.success(t('faqNodeMgmt.dialog.addInbound.savedToast')); onClose() }}>{t('faqNodeMgmt.dialog.save')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ───────── Dialog 2:新增落地节点 ─────────
function AddRoutedNodeDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation('xdocs')
  const [scope, setScope] = useState<'all' | 'user'>('all')
  const [tab, setTab] = useState<'node' | 'server' | 'lb'>('node')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'direct' | 'routed' | string>('routed')

  const candidates = [
    { id: 1, name: '香港 BAGE | OUT', protocol: 'shadowsocks', via: 'HK 香港 BAGE HKS', emoji: '🇭🇰' },
    { id: 2, name: 'HINET | OUT', protocol: 'ss', via: '', emoji: '🇹🇼' },
    { id: 3, name: '日本 BAGE | OUT', protocol: 'shadowsocks', via: 'JP 日本 BAGE JPS', emoji: '🇯🇵' },
    { id: 4, name: '台湾家宽 SEEDNET | OUT', protocol: 'shadowsocks', via: 'TW 台湾 SEEDNET', emoji: '🇹🇼' },
    { id: 5, name: '新加坡 LEGEND | OUT', protocol: 'shadowsocks', via: 'SG 新加坡 LEGEND', emoji: '🇸🇬' },
    { id: 6, name: '新加坡 BAGE | OUT', protocol: 'shadowsocks', via: 'SG 新加坡 BAGE SGS', emoji: '🇸🇬' },
    { id: 7, name: 'HKBN | OUT', protocol: 'shadowsocks', via: 'HK Kaze HKBN', emoji: '🇭🇰' },
  ]
  const filtered = candidates.filter((c) => !search || c.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>{t('faqNodeMgmt.dialog.routed.title')}</DialogTitle>
          <DialogDescription>{t('faqNodeMgmt.dialog.routed.desc', { name: 'HK 香港 PRO G' })}</DialogDescription>
        </DialogHeader>

        <div className='space-y-3'>
          {/* 作用范围 */}
          <div className='rounded-md bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900 p-3 space-y-2'>
            <Label className='text-sm font-semibold'>{t('faqNodeMgmt.dialog.routed.scope')}</Label>
            <label className='flex items-start gap-2 text-sm cursor-pointer'>
              <input type='radio' checked={scope === 'all'} onChange={() => setScope('all')} className='mt-1' />
              <span>
                <span className='font-medium'>{t('faqNodeMgmt.dialog.routed.scopeAll')}</span>
                <span className='block text-xs text-muted-foreground'>{t('faqNodeMgmt.dialog.routed.scopeAllDesc')}</span>
              </span>
            </label>
            <label className='flex items-start gap-2 text-sm cursor-pointer'>
              <input type='radio' checked={scope === 'user'} onChange={() => setScope('user')} className='mt-1' />
              <span>
                <span className='font-medium'>{t('faqNodeMgmt.dialog.routed.scopeUser')}</span>
                <span className='block text-xs text-muted-foreground'>{t('faqNodeMgmt.dialog.routed.scopeUserDesc')}</span>
              </span>
            </label>
          </div>

          {/* 3 标签页 */}
          <div className='grid grid-cols-3 gap-2'>
            {(['node', 'server', 'lb'] as const).map((k) => (
              <button
                key={k}
                onClick={() => setTab(k)}
                className={`py-2 rounded text-sm font-medium ${
                  tab === k ? 'border-2 border-orange-500 bg-card' : 'bg-orange-50 dark:bg-orange-950/20 text-muted-foreground'
                }`}
              >
                {k === 'node' && t('faqNodeMgmt.dialog.routed.tabNode')}
                {k === 'server' && t('faqNodeMgmt.dialog.routed.tabServer')}
                {k === 'lb' && t('faqNodeMgmt.dialog.routed.tabLB')}
              </button>
            ))}
          </div>

          {tab === 'node' && (
            <>
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('faqNodeMgmt.dialog.routed.searchPlaceholder')} />
              <div className='flex items-center gap-1 flex-wrap text-xs'>
                {['all', 'direct', 'routed', 'remote:JP', 'remote:SG'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-2.5 py-1 rounded ${f === filter ? 'bg-orange-500 text-white' : 'border'}`}
                  >
                    {f === 'all' ? t('faqNodeMgmt.dialog.routed.filterAll') : f === 'direct' ? t('faqNodeMgmt.dialog.routed.filterDirect') : f === 'routed' ? t('faqNodeMgmt.dialog.routed.filterRouted') : f}
                  </button>
                ))}
              </div>
              <p className='text-[11px] text-muted-foreground'>{t('faqNodeMgmt.dialog.routed.autoExclude')}</p>
              <div className='space-y-1.5 max-h-[40vh] overflow-y-auto'>
                {filtered.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      toast.success(t('faqNodeMgmt.dialog.routed.pickedToast', { name: c.name }))
                      onClose()
                    }}
                    className='w-full text-left rounded-md border bg-card p-3 hover:bg-muted/30 transition-colors space-y-1'
                  >
                    <div className='flex items-center gap-1.5 text-sm'>
                      <span>{c.emoji}</span>
                      <span className='font-semibold'>{c.name}</span>
                      <span className='text-muted-foreground'>{c.protocol}</span>
                      {c.via && (
                        <>
                          <span className='text-muted-foreground'>-</span>
                          <span className='text-xs text-muted-foreground'>{c.via}</span>
                        </>
                      )}
                    </div>
                    <Badge variant='secondary' className='text-[10px] bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'>
                      {t('faqNodeMgmt.dialog.routed.routedBadge')}
                    </Badge>
                  </button>
                ))}
              </div>
            </>
          )}
          {tab === 'server' && (
            <div className='rounded border bg-muted/20 p-6 text-center text-sm text-muted-foreground'>
              {t('faqNodeMgmt.dialog.routed.tabServerHint')}
            </div>
          )}
          {tab === 'lb' && (
            <div className='rounded border bg-muted/20 p-6 text-center text-sm text-muted-foreground'>
              {t('faqNodeMgmt.dialog.routed.tabLBHint')}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ───────── Dialog 3:查看节点路由 ─────────
function ViewRoutingDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation('xdocs')
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className='max-w-xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-1.5'>
            {t('faqNodeMgmt.dialog.routing.title')} — 🇭🇰 {t('faqNodeMgmt.dialog.routing.nodeName')}
          </DialogTitle>
          <DialogDescription>
            {t('faqNodeMgmt.dialog.routing.serverLabel')}: HK 香港 GOMAMI | {t('faqNodeMgmt.dialog.routing.inboundLabel')}: vless-tcp-xtls-vision-reality-443
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-3'>
          <div>
            <div className='flex items-center gap-1.5 text-sm font-medium mb-1.5'>
              <ChevronDown className='size-4' />
              {t('faqNodeMgmt.dialog.routing.exclusive')} (0)
              <span className='text-xs text-muted-foreground font-normal'>{t('faqNodeMgmt.dialog.routing.forThisInbound')}</span>
            </div>
            <div className='rounded border bg-muted/20 py-3 text-center text-xs text-muted-foreground'>
              {t('faqNodeMgmt.dialog.routing.noExclusive')}
            </div>
          </div>

          <div>
            <div className='flex items-center gap-1.5 text-sm font-medium mb-1.5'>
              <ChevronDown className='size-4' />
              {t('faqNodeMgmt.dialog.routing.global')} (4)
              <span className='text-xs text-muted-foreground font-normal'>{t('faqNodeMgmt.dialog.routing.forAllInbounds')}</span>
            </div>
            <div className='space-y-1.5'>
              {[
                { type: 'protocol', label: '禁止 BT: bittorrent', verdict: 'block' },
                { type: 'ip',       label: '禁止访问大陆 IP: geoip:cn', verdict: 'block' },
                { type: 'domain',   label: 'OpenAI 直连: geosite:openai', verdict: 'direct' },
                { type: 'ip',       label: 'geoip:private', verdict: 'block' },
              ].map((r, i) => (
                <div key={i} className='flex items-center gap-2 rounded border bg-card px-3 py-2 text-sm'>
                  <Badge variant='outline' className='text-[10px]'>{r.type}</Badge>
                  <span className='flex-1 truncate'>{r.label}</span>
                  <span className='text-muted-foreground'>→</span>
                  <Badge className={`text-[10px] ${r.verdict === 'direct' ? 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100' : 'bg-red-500 text-white hover:bg-red-500'}`}>
                    {r.verdict}
                  </Badge>
                  <Eye className='size-3.5 text-muted-foreground' />
                  <Trash2 className='size-3.5 text-destructive' />
                </div>
              ))}
            </div>
          </div>

          <div className='border-t pt-3 space-y-1'>
            <div className='text-sm font-medium flex items-center gap-2'>
              {t('faqNodeMgmt.dialog.routing.default')}
              <span className='text-xs text-muted-foreground font-normal'>{t('faqNodeMgmt.dialog.routing.noRuleMatch')}</span>
            </div>
            <div className='flex items-center gap-2 rounded border bg-muted/20 px-3 py-2 text-sm'>
              <Badge variant='outline' className='text-[10px]'>freedom</Badge>
              <span className='text-muted-foreground'>direct</span>
            </div>
          </div>
        </div>

        <DialogFooter className='flex sm:justify-between sm:flex-row gap-2'>
          <div className='flex gap-2 flex-wrap'>
            <Button size='sm' className='gap-1'>
              <Plus className='size-3.5' />
              {t('faqNodeMgmt.dialog.routing.quickAdd')}
              <ChevronDown className='size-3' />
            </Button>
            <Button size='sm' variant='outline' className='gap-1'>
              <Plus className='size-3.5' />
              {t('faqNodeMgmt.dialog.routing.custom')}
            </Button>
            <Button size='sm' variant='outline' className='gap-1'>
              <Network className='size-3.5' />
              {t('faqNodeMgmt.dialog.routing.balancer')}
            </Button>
          </div>
          <Button size='sm' variant='outline' onClick={onClose}>{t('faqNodeMgmt.dialog.close')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ───────── Dialog 4:Tunnel 管理 ─────────
function TunnelManagerDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation('xdocs')
  const [tunnels, setTunnels] = useState([
    { tag: 'tunnel-hkt25', from: 'HK 香港 BAGE HKS', fromPort: '4300', to: 'XX.XX.XX.XX:43XX' },
    { tag: 'tunnel-sg',    from: 'HK 香港 BAGE HKS', fromPort: '56XX', to: 'SG 新加坡 BAGE SGS:28XX3' },
  ])

  const del = (tag: string) => {
    setTunnels((prev) => prev.filter((tn) => tn.tag !== tag))
    toast.success(t('faqNodeMgmt.dialog.tunnel.deletedToast'))
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className='max-w-lg'>
        <DialogHeader>
          <DialogTitle>{t('faqNodeMgmt.dialog.tunnel.title')}</DialogTitle>
          <DialogDescription>{t('faqNodeMgmt.dialog.tunnel.desc')}</DialogDescription>
        </DialogHeader>

        <div className='space-y-2'>
          {tunnels.map((tn) => (
            <div key={tn.tag} className='flex items-center gap-2 rounded-md border bg-card px-3 py-2.5'>
              <div className='flex-1 min-w-0'>
                <Badge variant='outline' className='text-[10px] bg-orange-50 dark:bg-orange-950/20 mb-1'>{tn.tag}</Badge>
                <div className='text-xs text-muted-foreground'>
                  {tn.from} :{tn.fromPort} → {tn.to}
                </div>
              </div>
              <Badge variant='outline' className='text-[10px]'>TCP</Badge>
              <button onClick={() => del(tn.tag)} className='p-1 rounded text-destructive hover:bg-destructive/10'>
                <Trash2 className='size-4' />
              </button>
            </div>
          ))}
          {tunnels.length === 0 && (
            <div className='rounded border bg-muted/20 py-6 text-center text-sm text-muted-foreground'>
              {t('faqNodeMgmt.dialog.tunnel.empty')}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={onClose}>{t('faqNodeMgmt.dialog.close')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ───────── Dialog 5:路由出站管理(全局) ─────────
function RoutedManagerDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation('xdocs')
  const [rows, setRows] = useState([
    { id: 1, parent: '#275 HK 香港 PRO G', label: 'HK 香港 PRO B', server: 'HK 香港 GOMAMI', tag: 'routed:p275:rout-bage-out' },
  ])
  const del = (id: number) => {
    setRows((prev) => prev.filter((r) => r.id !== id))
    toast.success(t('faqNodeMgmt.dialog.routedMgr.deletedToast'))
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className='max-w-3xl'>
        <DialogHeader className='flex sm:flex-row sm:items-start sm:justify-between gap-2'>
          <div>
            <DialogTitle>{t('faqNodeMgmt.dialog.routedMgr.title')}</DialogTitle>
          </div>
          <Button size='sm' className='gap-1 shrink-0'>
            <Plus className='size-3.5' />
            {t('faqNodeMgmt.dialog.routedMgr.addBtn')}
          </Button>
        </DialogHeader>

        <div className='rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground space-y-1.5'>
          <div className='font-medium text-foreground'>{t('faqNodeMgmt.dialog.routedMgr.explainHeading')}</div>
          <p>{t('faqNodeMgmt.dialog.routedMgr.explainP1')}</p>
          <p>{t('faqNodeMgmt.dialog.routedMgr.explainP2')}</p>
        </div>

        <div className='rounded-md border overflow-hidden'>
          <div className='grid grid-cols-[1fr_1fr_1fr_1.5fr_auto_auto] gap-2 px-3 py-2 bg-muted/40 text-xs font-medium text-muted-foreground'>
            <span>{t('faqNodeMgmt.dialog.routedMgr.colParent')}</span>
            <span>{t('faqNodeMgmt.dialog.routedMgr.colLabel')}</span>
            <span>Server</span>
            <span>Outbound Tag</span>
            <span>{t('faqNodeMgmt.dialog.routedMgr.colCred')}</span>
            <span className='text-right'>{t('faqNodeMgmt.dialog.routedMgr.colOps')}</span>
          </div>
          {rows.map((r) => (
            <div key={r.id} className='grid grid-cols-[1fr_1fr_1fr_1.5fr_auto_auto] gap-2 px-3 py-2.5 text-xs items-center border-t'>
              <span className='font-mono text-muted-foreground truncate'>{r.parent}</span>
              <span className='truncate'>{r.label}</span>
              <Badge variant='outline' className='text-[10px] justify-self-start max-w-full'>{r.server}</Badge>
              <div className='min-w-0'>
                <div className='truncate'>HK 香港 BAGE | OUT · HK 香港 BAGE HKS</div>
                <div className='text-[10px] text-muted-foreground font-mono truncate'>{r.tag}</div>
              </div>
              <button className='inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground justify-self-end'>
                <Copy className='size-3.5' />
                {t('faqNodeMgmt.dialog.routedMgr.viewBtn')}
              </button>
              <button onClick={() => del(r.id)} className='inline-flex items-center gap-1 text-xs text-destructive hover:underline justify-self-end'>
                <Trash2 className='size-3.5' />
                {t('faqNodeMgmt.dialog.routedMgr.deleteBtn')}
              </button>
            </div>
          ))}
          {rows.length === 0 && (
            <div className='py-6 text-center text-xs text-muted-foreground border-t'>
              {t('faqNodeMgmt.dialog.routedMgr.empty')}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={onClose} className='gap-1'>
            <X className='size-3.5' />
            {t('faqNodeMgmt.dialog.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ───────── 顶部 mock 节点数据 ─────────
const MOCK_NODES = [
  { id: 1, proto: 'VLESS',       name: '香港 GoMami - KAZE', server: 'HK GoMami Pro N', flag: '🇭🇰', protoColor: 'border-purple-300 text-purple-700 bg-purple-50 dark:bg-purple-950/20' },
  { id: 2, proto: 'TROJAN',      name: '香港 GoMami - Trojan', server: 'HK GoMami Pro N', flag: '🇭🇰', protoColor: 'border-rose-300 text-rose-700 bg-rose-50 dark:bg-rose-950/20' },
  { id: 3, proto: 'SHADOWSOCKS', name: '香港 GoMami - SS2022', server: 'HK GoMami Pro N', flag: '🇭🇰', protoColor: 'border-gray-300 text-gray-700 bg-gray-50 dark:bg-gray-900/40' },
]
