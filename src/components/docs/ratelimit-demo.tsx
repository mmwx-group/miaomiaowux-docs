// 节点限速 mock — PRO 功能。
// 1:1 复刻真实产品 UI:
//   - 「套餐限速」:套餐编辑右侧节点表内嵌 限速 Mbps + 客户端数 两栏
//   - 「用户限速」:统一 Dialog 含「全局覆盖」+「每节点覆盖」两段
// fallback 链:用户每节点 → 用户全局 → 套餐每节点 → 套餐通用 → 0(不限速)
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  Ban,
  Crown,
  Save,
  HelpCircle,
  Package as PackageIcon,
  User as UserIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

// ───────── 共享 mock 数据 ─────────
type MockNode = {
  id: number
  name: string
  badge: 'internal' | 'external'
}

const MOCK_NODES: MockNode[] = [
  { id: 1, name: '🇭🇰 HK 香港 PRO B',     badge: 'internal' },
  { id: 2, name: '🇭🇰 HK 香港家宽(HKT)',  badge: 'internal' },
  { id: 3, name: '🇭🇰 HK 香港 YXVM',     badge: 'external' },
  { id: 4, name: '🇺🇸 US 美国家宽(ATT)',  badge: 'internal' },
  { id: 5, name: '🇯🇵 JP 日本 PRO R',     badge: 'internal' },
  { id: 6, name: '🇸🇬 SG 新加坡 PRO B',   badge: 'internal' },
  { id: 7, name: '🇹🇼 TW 台湾家宽(HINET)', badge: 'internal' },
]

// 套餐通用限速 + per-node 限速(初始)
const INIT_PKG_SPEED = 100  // 套餐通用 Mbps
const INIT_PKG_DEVICE = 0   // 套餐通用客户端数(0 = 不限)
const INIT_PKG_NODE_SPEED: Record<number, number> = { 1: 30 }  // 节点 1 单独限 30 Mbps
const INIT_PKG_NODE_DEVICE: Record<number, number> = {}

export function RatelimitDemo() {
  const { t } = useTranslation('xdocs')
  const [pkgDialogOpen, setPkgDialogOpen] = useState(false)
  const [userDialogOpen, setUserDialogOpen] = useState(false)

  // 套餐配置(由套餐 dialog 编辑)
  const [pkgSpeed, setPkgSpeed] = useState(INIT_PKG_SPEED)
  const [pkgDevice, setPkgDevice] = useState(INIT_PKG_DEVICE)
  const [pkgNodeSpeed, setPkgNodeSpeed] = useState<Record<number, number>>(INIT_PKG_NODE_SPEED)
  const [pkgNodeDevice, setPkgNodeDevice] = useState<Record<number, number>>(INIT_PKG_NODE_DEVICE)
  const [pkgNodes, setPkgNodes] = useState<Set<number>>(new Set([1, 2, 4, 5, 6, 7]))

  // 用户覆盖
  const [userSpeedOverride, setUserSpeedOverride] = useState<number | null>(null)
  const [userDeviceOverride, setUserDeviceOverride] = useState<number | null>(null)
  const [userNodeSpeed, setUserNodeSpeed] = useState<Record<number, number>>({})
  const [userNodeDevice, setUserNodeDevice] = useState<Record<number, number>>({})

  return (
    <Card className='border-dashed'>
      <CardContent className='pt-6 space-y-4'>
        <div className='flex items-center gap-2 flex-wrap'>
          <Badge variant='outline' className='text-xs'>{t('nodeRatelimit.demo.badge')}</Badge>
          <Badge className='gap-1 bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300 text-xs'>
            <Crown className='size-3' />
            PRO
          </Badge>
          <span className='text-xs text-muted-foreground'>{t('nodeRatelimit.demo.intro')}</span>
        </div>

        {/* 概念说明 */}
        <div className='rounded-md border bg-blue-500/5 border-blue-500/20 p-3 text-xs space-y-1'>
          <div className='font-medium text-blue-700 dark:text-blue-400 flex items-center gap-1'>
            <HelpCircle className='size-3.5' />
            {t('nodeRatelimit.demo.concept.heading')}
          </div>
          <p className='text-muted-foreground'>{t('nodeRatelimit.demo.concept.text')}</p>
          <div className='font-mono text-[11px] text-muted-foreground bg-muted/40 rounded px-2 py-1.5 inline-block'>
            {t('nodeRatelimit.demo.concept.formula')}
          </div>
        </div>

        {/* 两个入口按钮 */}
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
          <Button
            variant='outline'
            className='h-auto py-3 justify-start gap-3'
            onClick={() => setPkgDialogOpen(true)}
          >
            <PackageIcon className='size-5 text-primary shrink-0' />
            <div className='text-left'>
              <div className='font-semibold text-sm'>{t('nodeRatelimit.demo.openPkgBtn')}</div>
              <div className='text-xs text-muted-foreground font-normal'>{t('nodeRatelimit.demo.openPkgHint')}</div>
            </div>
          </Button>
          <Button
            variant='outline'
            className='h-auto py-3 justify-start gap-3'
            onClick={() => setUserDialogOpen(true)}
          >
            <UserIcon className='size-5 text-primary shrink-0' />
            <div className='text-left'>
              <div className='font-semibold text-sm'>{t('nodeRatelimit.demo.openUserBtn')}</div>
              <div className='text-xs text-muted-foreground font-normal'>{t('nodeRatelimit.demo.openUserHint')}</div>
            </div>
          </Button>
        </div>

        {/* 当前生效一览 */}
        <EffectiveSummary
          pkgSpeed={pkgSpeed}
          pkgDevice={pkgDevice}
          pkgNodeSpeed={pkgNodeSpeed}
          pkgNodeDevice={pkgNodeDevice}
          pkgNodes={pkgNodes}
          userSpeed={userSpeedOverride}
          userDevice={userDeviceOverride}
          userNodeSpeed={userNodeSpeed}
          userNodeDevice={userNodeDevice}
        />

        {pkgDialogOpen && (
          <PackageDialog
            onClose={() => setPkgDialogOpen(false)}
            pkgSpeed={pkgSpeed}
            setPkgSpeed={setPkgSpeed}
            pkgDevice={pkgDevice}
            setPkgDevice={setPkgDevice}
            pkgNodes={pkgNodes}
            setPkgNodes={setPkgNodes}
            pkgNodeSpeed={pkgNodeSpeed}
            setPkgNodeSpeed={setPkgNodeSpeed}
            pkgNodeDevice={pkgNodeDevice}
            setPkgNodeDevice={setPkgNodeDevice}
          />
        )}
        {userDialogOpen && (
          <UserDialog
            onClose={() => setUserDialogOpen(false)}
            pkgSpeed={pkgSpeed}
            pkgDevice={pkgDevice}
            pkgNodeSpeed={pkgNodeSpeed}
            pkgNodeDevice={pkgNodeDevice}
            pkgNodes={pkgNodes}
            userSpeed={userSpeedOverride}
            setUserSpeed={setUserSpeedOverride}
            userDevice={userDeviceOverride}
            setUserDevice={setUserDeviceOverride}
            userNodeSpeed={userNodeSpeed}
            setUserNodeSpeed={setUserNodeSpeed}
            userNodeDevice={userNodeDevice}
            setUserNodeDevice={setUserNodeDevice}
          />
        )}
      </CardContent>
    </Card>
  )
}

// ───────── 当前生效一览(把 fallback 链显示出来) ─────────
function EffectiveSummary(props: {
  pkgSpeed: number
  pkgDevice: number
  pkgNodeSpeed: Record<number, number>
  pkgNodeDevice: Record<number, number>
  pkgNodes: Set<number>
  userSpeed: number | null
  userDevice: number | null
  userNodeSpeed: Record<number, number>
  userNodeDevice: Record<number, number>
}) {
  const { t } = useTranslation('xdocs')

  const resolveSpeed = (nodeId: number): { value: number; source: string } => {
    if (nodeId in props.userNodeSpeed) return { value: props.userNodeSpeed[nodeId], source: t('nodeRatelimit.demo.summary.fromUserNode') }
    if (props.userSpeed !== null) return { value: props.userSpeed, source: t('nodeRatelimit.demo.summary.fromUserGlobal') }
    if (nodeId in props.pkgNodeSpeed) return { value: props.pkgNodeSpeed[nodeId], source: t('nodeRatelimit.demo.summary.fromPkgNode') }
    return { value: props.pkgSpeed, source: t('nodeRatelimit.demo.summary.fromPkgGlobal') }
  }
  const resolveDevice = (nodeId: number): { value: number; source: string } => {
    if (nodeId in props.userNodeDevice) return { value: props.userNodeDevice[nodeId], source: t('nodeRatelimit.demo.summary.fromUserNode') }
    if (props.userDevice !== null) return { value: props.userDevice, source: t('nodeRatelimit.demo.summary.fromUserGlobal') }
    if (nodeId in props.pkgNodeDevice) return { value: props.pkgNodeDevice[nodeId], source: t('nodeRatelimit.demo.summary.fromPkgNode') }
    return { value: props.pkgDevice, source: t('nodeRatelimit.demo.summary.fromPkgGlobal') }
  }

  return (
    <div className='rounded-md border p-3 space-y-2'>
      <div className='text-sm font-semibold flex items-center gap-1.5'>
        <Ban className='size-4 text-primary' />
        {t('nodeRatelimit.demo.summary.heading')}
      </div>
      <div className='overflow-x-auto'>
        <table className='w-full text-xs'>
          <thead className='text-[10px] text-muted-foreground border-b'>
            <tr>
              <th className='text-left py-1 px-2 font-medium'>{t('nodeRatelimit.demo.summary.colNode')}</th>
              <th className='text-right py-1 px-2 font-medium'>{t('nodeRatelimit.demo.summary.colSpeed')}</th>
              <th className='text-right py-1 px-2 font-medium'>{t('nodeRatelimit.demo.summary.colDevice')}</th>
              <th className='text-left py-1 px-2 font-medium'>{t('nodeRatelimit.demo.summary.colSource')}</th>
            </tr>
          </thead>
          <tbody className='divide-y'>
            {MOCK_NODES.filter((n) => props.pkgNodes.has(n.id)).map((n) => {
              const s = resolveSpeed(n.id)
              const d = resolveDevice(n.id)
              return (
                <tr key={n.id}>
                  <td className='py-1 px-2 truncate max-w-[180px]'>{n.name}</td>
                  <td className='py-1 px-2 text-right tabular-nums'>{s.value === 0 ? '∞' : `${s.value} Mbps`}</td>
                  <td className='py-1 px-2 text-right tabular-nums'>{d.value === 0 ? '∞' : d.value}</td>
                  <td className='py-1 px-2 text-[10px] text-muted-foreground'>{s.source}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ───────── 套餐编辑 Dialog(节点表内嵌限速 + 客户端数) ─────────
function PackageDialog(props: {
  onClose: () => void
  pkgSpeed: number
  setPkgSpeed: (v: number) => void
  pkgDevice: number
  setPkgDevice: (v: number) => void
  pkgNodes: Set<number>
  setPkgNodes: (s: Set<number>) => void
  pkgNodeSpeed: Record<number, number>
  setPkgNodeSpeed: (m: Record<number, number>) => void
  pkgNodeDevice: Record<number, number>
  setPkgNodeDevice: (m: Record<number, number>) => void
}) {
  const { t } = useTranslation('xdocs')

  // 编辑期间用临时本地 state 避免实时改全局
  const [pkgSpeedDraft, setPkgSpeedDraft] = useState(props.pkgSpeed)
  const [pkgDeviceDraft, setPkgDeviceDraft] = useState(props.pkgDevice)
  const [nodesDraft, setNodesDraft] = useState(new Set(props.pkgNodes))
  const [nodeSpeedDraft, setNodeSpeedDraft] = useState({ ...props.pkgNodeSpeed })
  const [nodeDeviceDraft, setNodeDeviceDraft] = useState({ ...props.pkgNodeDevice })

  const toggleNode = (id: number) => {
    const next = new Set(nodesDraft)
    if (next.has(id)) {
      next.delete(id)
      const ns = { ...nodeSpeedDraft }
      delete ns[id]
      setNodeSpeedDraft(ns)
      const nd = { ...nodeDeviceDraft }
      delete nd[id]
      setNodeDeviceDraft(nd)
    } else {
      next.add(id)
    }
    setNodesDraft(next)
  }

  const save = () => {
    props.setPkgSpeed(pkgSpeedDraft)
    props.setPkgDevice(pkgDeviceDraft)
    props.setPkgNodes(nodesDraft)
    props.setPkgNodeSpeed(nodeSpeedDraft)
    props.setPkgNodeDevice(nodeDeviceDraft)
    toast.success(t('nodeRatelimit.demo.pkgDialog.savedToast'))
    props.onClose()
  }

  return (
    <Dialog open onOpenChange={(open) => !open && props.onClose()}>
      <DialogContent className='max-w-5xl max-h-[90vh] flex flex-col overflow-hidden p-0'>
        <DialogHeader className='p-4 border-b'>
          <DialogTitle>{t('nodeRatelimit.demo.pkgDialog.title')}</DialogTitle>
          <DialogDescription>{t('nodeRatelimit.demo.pkgDialog.desc')}</DialogDescription>
        </DialogHeader>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 p-4 flex-1 overflow-hidden'>
          {/* 左:基本参数 */}
          <div className='space-y-3 overflow-y-auto pr-2'>
            <div className='space-y-1.5'>
              <Label className='text-xs'>{t('nodeRatelimit.demo.pkgDialog.name')}</Label>
              <Input value='妙妙屋分享' readOnly />
            </div>
            <div className='space-y-1.5'>
              <Label className='text-xs'>{t('nodeRatelimit.demo.pkgDialog.description')}</Label>
              <Textarea value='' readOnly placeholder={t('nodeRatelimit.demo.pkgDialog.descPlaceholder')} rows={2} />
            </div>
            <div className='grid grid-cols-2 gap-2'>
              <div className='space-y-1'>
                <Label className='text-xs'>{t('nodeRatelimit.demo.pkgDialog.trafficGB')}</Label>
                <Input value='500' readOnly />
              </div>
              <div className='space-y-1'>
                <Label className='text-xs'>{t('nodeRatelimit.demo.pkgDialog.cycleDays')}</Label>
                <Input value='30' readOnly />
              </div>
            </div>
            <div className='grid grid-cols-2 gap-2 rounded-md border bg-primary/5 p-3'>
              <div className='space-y-1'>
                <Label className='text-xs flex items-center gap-1'>
                  {t('nodeRatelimit.demo.pkgDialog.speedLimit')}
                  <Badge className='text-[9px] bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100 px-1 py-0'>PRO</Badge>
                </Label>
                <Input
                  type='number'
                  min={0}
                  value={pkgSpeedDraft}
                  onChange={(e) => setPkgSpeedDraft(Number(e.target.value) || 0)}
                />
                <p className='text-[10px] text-muted-foreground'>{t('nodeRatelimit.demo.pkgDialog.speedHint')}</p>
              </div>
              <div className='space-y-1'>
                <Label className='text-xs'>{t('nodeRatelimit.demo.pkgDialog.deviceLimit')}</Label>
                <Input
                  type='number'
                  min={0}
                  value={pkgDeviceDraft}
                  onChange={(e) => setPkgDeviceDraft(Number(e.target.value) || 0)}
                />
                <p className='text-[10px] text-muted-foreground'>{t('nodeRatelimit.demo.pkgDialog.deviceHint')}</p>
              </div>
            </div>
          </div>

          {/* 右:节点表 */}
          <div className='flex flex-col overflow-hidden'>
            <div className='flex items-center justify-between mb-2'>
              <Label className='text-sm font-semibold'>{t('nodeRatelimit.demo.pkgDialog.relatedNodes')}</Label>
              <span className='text-[10px] text-muted-foreground tabular-nums'>{nodesDraft.size} / {MOCK_NODES.length}</span>
            </div>
            <div className='border rounded-md overflow-y-auto flex-1'>
              {/* 表头 */}
              <div className='sticky top-0 z-10 flex items-center gap-2 px-2.5 py-1.5 bg-muted/60 border-b text-[10px] font-medium text-muted-foreground'>
                <div className='w-4 shrink-0' />
                <span className='flex-1'>{t('nodeRatelimit.demo.pkgDialog.colNode')}</span>
                <span className='shrink-0 w-[60px] text-center'>{t('nodeRatelimit.demo.pkgDialog.colMult')}</span>
                <span className='shrink-0 w-[72px] text-center'>{t('nodeRatelimit.demo.pkgDialog.colSpeed')}</span>
                <span className='shrink-0 w-[60px] text-center'>{t('nodeRatelimit.demo.pkgDialog.colDevice')}</span>
              </div>
              <div className='divide-y'>
                {MOCK_NODES.map((node) => {
                  const isChecked = nodesDraft.has(node.id)
                  return (
                    <div
                      key={node.id}
                      className={`flex items-center gap-2 px-2.5 py-2 text-sm border-l-2 ${
                        isChecked ? 'border-l-primary bg-primary/5' : 'border-l-transparent hover:bg-muted/40'
                      }`}
                    >
                      <input
                        type='checkbox'
                        checked={isChecked}
                        onChange={() => toggleNode(node.id)}
                        className='size-4 shrink-0'
                      />
                      <span className='flex-1 flex items-center gap-1.5 min-w-0'>
                        <Badge variant='outline' className={`text-[9px] px-1 py-0 shrink-0 ${node.badge === 'external' ? 'border-amber-500 text-amber-600' : ''}`}>
                          {node.badge === 'external' ? t('nodeRatelimit.demo.pkgDialog.external') : t('nodeRatelimit.demo.pkgDialog.internal')}
                        </Badge>
                        <span className='truncate text-xs'>{node.name}</span>
                      </span>
                      <div className='flex items-center justify-end shrink-0 w-[60px]'>
                        {isChecked ? <span className='text-xs tabular-nums'>1 ×</span> : <span className='text-[10px] text-muted-foreground/50'>—</span>}
                      </div>
                      <div className='shrink-0 w-[72px]'>
                        {isChecked ? (
                          <Input
                            type='number'
                            min={0}
                            value={nodeSpeedDraft[node.id] ?? ''}
                            placeholder={pkgSpeedDraft > 0 ? String(pkgSpeedDraft) : '∞'}
                            onChange={(e) => {
                              const raw = e.target.value
                              const next = { ...nodeSpeedDraft }
                              if (raw === '') delete next[node.id]
                              else next[node.id] = Number(raw)
                              setNodeSpeedDraft(next)
                            }}
                            className='no-spin h-7 px-1.5 text-xs text-right tabular-nums'
                          />
                        ) : (
                          <div className='text-center text-[10px] text-muted-foreground/50'>—</div>
                        )}
                      </div>
                      <div className='shrink-0 w-[60px]'>
                        {isChecked ? (
                          <Input
                            type='number'
                            min={0}
                            value={nodeDeviceDraft[node.id] ?? ''}
                            placeholder={pkgDeviceDraft > 0 ? String(pkgDeviceDraft) : '∞'}
                            onChange={(e) => {
                              const raw = e.target.value
                              const next = { ...nodeDeviceDraft }
                              if (raw === '') delete next[node.id]
                              else next[node.id] = Number(raw)
                              setNodeDeviceDraft(next)
                            }}
                            className='no-spin h-7 px-1.5 text-xs text-right tabular-nums'
                          />
                        ) : (
                          <div className='text-center text-[10px] text-muted-foreground/50'>—</div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            <p className='text-[10px] text-muted-foreground mt-2'>{t('nodeRatelimit.demo.pkgDialog.nodesHint')}</p>
          </div>
        </div>

        <DialogFooter className='p-4 border-t bg-muted/20 sm:justify-end gap-2'>
          <Button variant='outline' onClick={props.onClose}>{t('nodeRatelimit.demo.cancelBtn')}</Button>
          <Button onClick={save}>
            <Save className='size-4 mr-1' />
            {t('nodeRatelimit.demo.saveBtn')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ───────── 用户限速 Dialog(全局覆盖 + 每节点覆盖) ─────────
function UserDialog(props: {
  onClose: () => void
  pkgSpeed: number
  pkgDevice: number
  pkgNodeSpeed: Record<number, number>
  pkgNodeDevice: Record<number, number>
  pkgNodes: Set<number>
  userSpeed: number | null
  setUserSpeed: (v: number | null) => void
  userDevice: number | null
  setUserDevice: (v: number | null) => void
  userNodeSpeed: Record<number, number>
  setUserNodeSpeed: (m: Record<number, number>) => void
  userNodeDevice: Record<number, number>
  setUserNodeDevice: (m: Record<number, number>) => void
}) {
  const { t } = useTranslation('xdocs')

  // hydration:打开 dialog 时把套餐当前值预填到所有空输入框
  const [globalSpeedStr, setGlobalSpeedStr] = useState(
    props.userSpeed !== null ? String(props.userSpeed) : String(props.pkgSpeed)
  )
  const [globalDeviceStr, setGlobalDeviceStr] = useState(
    props.userDevice !== null ? String(props.userDevice) : String(props.pkgDevice)
  )

  const effectivePkgSpeed = (nodeId: number) =>
    nodeId in props.pkgNodeSpeed ? props.pkgNodeSpeed[nodeId] : props.pkgSpeed
  const effectivePkgDevice = (nodeId: number) =>
    nodeId in props.pkgNodeDevice ? props.pkgNodeDevice[nodeId] : props.pkgDevice

  const visibleNodes = MOCK_NODES.filter((n) => props.pkgNodes.has(n.id))

  // 每节点 draft:用户已有覆盖优先,否则用套餐当前值预填
  const [nodeSpeedDraft, setNodeSpeedDraft] = useState<Record<number, string>>(() => {
    const m: Record<number, string> = {}
    for (const n of visibleNodes) {
      m[n.id] = n.id in props.userNodeSpeed ? String(props.userNodeSpeed[n.id]) : String(effectivePkgSpeed(n.id))
    }
    return m
  })
  const [nodeDeviceDraft, setNodeDeviceDraft] = useState<Record<number, string>>(() => {
    const m: Record<number, string> = {}
    for (const n of visibleNodes) {
      m[n.id] = n.id in props.userNodeDevice ? String(props.userNodeDevice[n.id]) : String(effectivePkgDevice(n.id))
    }
    return m
  })

  const save = () => {
    // 全局:用户填的等于套餐通用 → 视为 null(沿用套餐)
    const speedNum = globalSpeedStr === '' ? null : Number(globalSpeedStr)
    const deviceNum = globalDeviceStr === '' ? null : Number(globalDeviceStr)
    const newUserSpeed = speedNum !== null && speedNum !== props.pkgSpeed ? speedNum : null
    const newUserDevice = deviceNum !== null && deviceNum !== props.pkgDevice ? deviceNum : null

    // per-node:等于套餐对该节点的实际值 → 不写入 map
    const newNodeSpeed: Record<number, number> = {}
    for (const [k, raw] of Object.entries(nodeSpeedDraft)) {
      if (raw === '') continue
      const nodeId = Number(k)
      const n = Number(raw)
      if (!Number.isFinite(n)) continue
      if (n === effectivePkgSpeed(nodeId)) continue
      newNodeSpeed[nodeId] = n
    }
    const newNodeDevice: Record<number, number> = {}
    for (const [k, raw] of Object.entries(nodeDeviceDraft)) {
      if (raw === '') continue
      const nodeId = Number(k)
      const n = Number(raw)
      if (!Number.isFinite(n)) continue
      if (n === effectivePkgDevice(nodeId)) continue
      newNodeDevice[nodeId] = n
    }

    props.setUserSpeed(newUserSpeed)
    props.setUserDevice(newUserDevice)
    props.setUserNodeSpeed(newNodeSpeed)
    props.setUserNodeDevice(newNodeDevice)
    toast.success(t('nodeRatelimit.demo.userDialog.savedToast'))
    props.onClose()
  }

  return (
    <Dialog open onOpenChange={(open) => !open && props.onClose()}>
      <DialogContent className='max-w-3xl max-h-[90vh] flex flex-col overflow-hidden p-0'>
        <DialogHeader className='p-4 border-b'>
          <DialogTitle>{t('nodeRatelimit.demo.userDialog.title')}</DialogTitle>
          <DialogDescription>{t('nodeRatelimit.demo.userDialog.desc')}</DialogDescription>
        </DialogHeader>

        <div className='flex-1 overflow-y-auto p-4 space-y-5'>
          {/* 全局覆盖 */}
          <div>
            <div className='text-sm font-semibold mb-2'>{t('nodeRatelimit.demo.userDialog.globalHeader')}</div>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              <div className='space-y-1.5'>
                <Label className='text-xs'>{t('nodeRatelimit.demo.userDialog.globalSpeed')}</Label>
                <Input
                  type='number'
                  min={0}
                  value={globalSpeedStr}
                  placeholder={t('nodeRatelimit.demo.userDialog.followPkg')}
                  onChange={(e) => setGlobalSpeedStr(e.target.value)}
                />
                <p className='text-[10px] text-muted-foreground'>{t('nodeRatelimit.demo.userDialog.globalSpeedHint')}</p>
              </div>
              <div className='space-y-1.5'>
                <Label className='text-xs'>{t('nodeRatelimit.demo.userDialog.globalDevice')}</Label>
                <Input
                  type='number'
                  min={0}
                  value={globalDeviceStr}
                  placeholder={t('nodeRatelimit.demo.userDialog.followPkg')}
                  onChange={(e) => setGlobalDeviceStr(e.target.value)}
                />
                <p className='text-[10px] text-muted-foreground'>{t('nodeRatelimit.demo.userDialog.globalDeviceHint')}</p>
              </div>
            </div>
          </div>

          {/* 每节点覆盖 */}
          <div>
            <div className='text-sm font-semibold mb-2'>{t('nodeRatelimit.demo.userDialog.perNodeHeader')}</div>
            <div className='border rounded-md overflow-hidden'>
              <table className='w-full text-sm'>
                <thead className='text-[10px] text-muted-foreground bg-muted/40 border-b'>
                  <tr>
                    <th className='text-left py-2 px-2 font-medium'>{t('nodeRatelimit.demo.userDialog.colNode')}</th>
                    <th className='text-right py-2 px-2 font-medium'>{t('nodeRatelimit.demo.userDialog.colSpeed')}</th>
                    <th className='text-right py-2 px-2 font-medium'>{t('nodeRatelimit.demo.userDialog.colDevice')}</th>
                  </tr>
                </thead>
                <tbody className='divide-y'>
                  {visibleNodes.map((n) => (
                    <tr key={n.id}>
                      <td className='py-2 px-2'>
                        <div className='text-xs font-medium truncate max-w-[200px]'>{n.name}</div>
                      </td>
                      <td className='py-2 px-2 text-right'>
                        <Input
                          type='number'
                          min={0}
                          value={nodeSpeedDraft[n.id] ?? ''}
                          placeholder={String(effectivePkgSpeed(n.id))}
                          onChange={(e) => setNodeSpeedDraft({ ...nodeSpeedDraft, [n.id]: e.target.value })}
                          className='no-spin h-7 w-20 text-xs text-right tabular-nums inline-block'
                        />
                      </td>
                      <td className='py-2 px-2 text-right'>
                        <Input
                          type='number'
                          min={0}
                          value={nodeDeviceDraft[n.id] ?? ''}
                          placeholder={String(effectivePkgDevice(n.id))}
                          onChange={(e) => setNodeDeviceDraft({ ...nodeDeviceDraft, [n.id]: e.target.value })}
                          className='no-spin h-7 w-16 text-xs text-right tabular-nums inline-block'
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className='text-[10px] text-muted-foreground mt-2'>{t('nodeRatelimit.demo.userDialog.fallbackHint')}</p>
          </div>
        </div>

        <DialogFooter className='p-4 border-t bg-muted/20 sm:justify-end gap-2'>
          <Button variant='outline' onClick={props.onClose}>{t('nodeRatelimit.demo.cancelBtn')}</Button>
          <Button onClick={save}>
            <Save className='size-4 mr-1' />
            {t('nodeRatelimit.demo.userDialog.confirmSave')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
