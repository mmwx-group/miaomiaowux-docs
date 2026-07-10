// 分享服务器 mock — 1:1 复刻 mmwx 服务管理的服务器卡片 UI。
// 左:主端,卡片标准外观,可通过 Share 按钮分享;
// 右:借用端,**相同卡片外观但带紫色「借用」badge**,部分操作锁定(启停/安装/编辑/再分享)。
//
// 关键产品语义(对应文档原文):
//   能做:查看状态/流量/网速、添加入站(带前缀)、管理自己入站、添加节点、查看 Xray/Nginx 状态
//   不能做:启停 Xray/Nginx、安装/卸载、编辑服务器、二次分享
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  Share2,
  Search,
  Pencil,
  Lock,
  Activity,
  Wifi,
  Settings,
  Box,
  ArrowUp,
  GripVertical,
  Ban,
  Plus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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

type ServerInfo = {
  id: number
  flag: string
  name: string
  online: boolean
  ip: string
  xrayMode: 'embedded' | 'external'
  xrayRunning: boolean
  xrayVersion: string
  nginxRunning: boolean
  resetDay: number
  /** 是否被分享(主端用) */
  shared: boolean
  /** 借用端从哪个主端借的(借用端用,主端为 undefined) */
  borrowedFrom?: string
  /** 借用端的入站前缀(借用端用) */
  inboundPrefix?: string
}

const HOST_INITIAL: ServerInfo[] = [
  { id: 1, flag: '🇭🇰', name: '香港 GOMAMI',  online: true,  ip: '198.51.100.10', xrayMode: 'embedded', xrayRunning: true,  xrayVersion: 'v25.5.16', nginxRunning: true,  resetDay: 1, shared: true },
  { id: 2, flag: '🇺🇸', name: '美国 BUG NET', online: true,  ip: '203.0.113.42',  xrayMode: 'external', xrayRunning: true,  xrayVersion: 'v25.5.16', nginxRunning: false, resetDay: 1, shared: false },
  { id: 3, flag: '🇯🇵', name: '日本 PULSE',   online: false, ip: '198.51.100.99', xrayMode: 'embedded', xrayRunning: false, xrayVersion: 'v25.5.16', nginxRunning: false, resetDay: 1, shared: false },
]

// Mock 实时网速 + 流量(主端 / 借用端不同)
type LiveStats = {
  upBps: number
  downBps: number
  usedGb: number
  totalGb: number
}
const initialStats: Record<number, LiveStats> = {
  1: { upBps: 925, downBps: 642, usedGb: 13.47, totalGb: 400 },
  2: { upBps: 320, downBps: 1180, usedGb: 56.21, totalGb: 200 },
  3: { upBps: 0, downBps: 0, usedGb: 0, totalGb: 100 },
}

function fmtSpeed(bps: number): string {
  if (bps < 1024) return `${bps} B/s`
  if (bps < 1024 * 1024) return `${(bps / 1024).toFixed(0)} KB/s`
  return `${(bps / 1024 / 1024).toFixed(1)} MB/s`
}

export function ShareServerDemo() {
  const { t } = useTranslation('xdocs')
  const [hostServers, setHostServers] = useState<ServerInfo[]>(HOST_INITIAL)
  const [shareDialog, setShareDialog] = useState<ServerInfo | null>(null)
  const [stats, setStats] = useState<Record<number, LiveStats>>(initialStats)

  // 实时网速跳动(每 1.5s 在 baseSpeed * 0.6~1.4 内随机)
  useEffect(() => {
    const t = setInterval(() => {
      setStats((prev) => {
        const next: Record<number, LiveStats> = {}
        for (const [k, v] of Object.entries(prev)) {
          const id = Number(k)
          // 离线服务器速度归零
          const online = (HOST_INITIAL.find((s) => s.id === id) ?? hostServers.find((s) => s.id === id))?.online
          if (!online) {
            next[id] = { ...v, upBps: 0, downBps: 0 }
            continue
          }
          const base = initialStats[id]
          next[id] = {
            ...v,
            upBps: Math.floor(base.upBps * (0.6 + Math.random() * 0.8)),
            downBps: Math.floor(base.downBps * (0.6 + Math.random() * 0.8)),
            usedGb: Math.min(v.totalGb, v.usedGb + Math.random() * 0.001),
          }
        }
        return next
      })
    }, 1500)
    return () => clearInterval(t)
  }, [hostServers])

  const toggleShare = (id: number) => {
    setHostServers((prev) => prev.map((s) => (s.id === id ? { ...s, shared: !s.shared } : s)))
  }

  // 借用端服务器 = 主端被分享的 + 一个本地"原有"的
  const guestServers: ServerInfo[] = [
    ...hostServers
      .filter((s) => s.shared)
      .map((s) => ({
        ...s,
        id: s.id + 10000,
        borrowedFrom: 'mmwx-main.example.com',
        inboundPrefix: 'myx-',
      })),
  ]
  // 给借用端拷贝一份 stats(用借用端 id key)
  const guestStats: Record<number, LiveStats> = {}
  for (const s of guestServers) {
    const baseStat = stats[s.id - 10000]
    if (baseStat) guestStats[s.id] = baseStat
  }

  return (
    <Card className='border-dashed'>
      <CardContent className='pt-6 space-y-4'>
        <div className='flex items-center gap-2 flex-wrap'>
          <Badge variant='outline' className='text-xs'>{t('shareServer.demo.badge')}</Badge>
          <span className='text-xs text-muted-foreground'>{t('shareServer.demo.intro')}</span>
        </div>

        <div className='grid gap-4 lg:grid-cols-2'>
          {/* 主端 */}
          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <Badge variant='outline' className='border-primary text-primary text-xs'>
                  {t('shareServer.demo.host.title')}
                </Badge>
                <span className='text-xs text-muted-foreground'>mmwx-main.example.com</span>
              </div>
            </div>
            {hostServers.map((s) => (
              <ServerCard
                key={s.id}
                server={s}
                stats={stats[s.id]}
                mode='host'
                onToggleShare={() => toggleShare(s.id)}
                onOpenShareDialog={() => setShareDialog(s)}
              />
            ))}
          </div>

          {/* 借用端 */}
          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <Badge variant='outline' className='border-amber-500 text-amber-600 dark:text-amber-400 text-xs'>
                  {t('shareServer.demo.guest.title')}
                </Badge>
                <span className='text-xs text-muted-foreground'>mmwx-friend.example.com</span>
              </div>
            </div>
            {guestServers.length === 0 ? (
              <div className='rounded-md border border-dashed p-4 text-center text-xs text-muted-foreground'>
                {t('shareServer.demo.guest.empty')}
              </div>
            ) : (
              guestServers.map((s) => (
                <ServerCard key={s.id} server={s} stats={guestStats[s.id]} mode='guest' />
              ))
            )}
          </div>
        </div>

        {/* 能做 / 不能做 — 直接列在 demo 里方便对照 */}
        <div className='rounded-md border bg-muted/20 p-3'>
          <div className='text-sm font-semibold mb-2 flex items-center gap-1.5'>
            <Lock className='size-4 text-primary' />
            {t('shareServer.demo.permissions.heading')}
          </div>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs'>
            <div>
              <div className='font-medium text-green-700 dark:text-green-400 mb-1.5 flex items-center gap-1'>
                ✓ {t('shareServer.demo.permissions.canHeading')}
              </div>
              <ul className='space-y-1 text-muted-foreground'>
                <li>• {t('shareServer.demo.permissions.canViewStatus')}</li>
                <li>• {t('shareServer.demo.permissions.canAddInbound')}</li>
                <li>• {t('shareServer.demo.permissions.canManageInbound')}</li>
                <li>• {t('shareServer.demo.permissions.canAddNode')}</li>
              </ul>
            </div>
            <div>
              <div className='font-medium text-destructive mb-1.5 flex items-center gap-1'>
                <Ban className='size-3.5' />
                {t('shareServer.demo.permissions.cantHeading')}
              </div>
              <ul className='space-y-1 text-muted-foreground'>
                <li>• {t('shareServer.demo.permissions.cantXrayControl')}</li>
                <li>• {t('shareServer.demo.permissions.cantInstall')}</li>
                <li>• {t('shareServer.demo.permissions.cantEditServer')}</li>
                <li>• {t('shareServer.demo.permissions.cantReshare')}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 分享配置对话框 */}
        {shareDialog && (
          <ShareDialog server={shareDialog} onClose={() => setShareDialog(null)} />
        )}
      </CardContent>
    </Card>
  )
}

// ───────── 服务器卡片 — 复刻 mmwx 真实 UI ─────────
function ServerCard({
  server,
  stats,
  mode,
  onToggleShare,
  onOpenShareDialog,
}: {
  server: ServerInfo
  stats: LiveStats | undefined
  mode: 'host' | 'guest'
  onToggleShare?: () => void
  onOpenShareDialog?: () => void
}) {
  const { t } = useTranslation('xdocs')
  const isGuest = mode === 'guest'
  const usedPct = stats ? Math.min(100, (stats.usedGb / stats.totalGb) * 100) : 0
  // 借用端禁用的操作:启停 / 安装 / 编辑 / 再分享(Share 按钮)
  const lockTooltip = t('shareServer.demo.lockedTip', { defaultValue: '该操作仅限拥有方,借用端不可执行' })

  return (
    <Card className={`overflow-hidden ${isGuest ? 'border-l-4 border-l-purple-500/70' : ''}`}>
      <CardContent className='p-3 space-y-2.5'>
        {/* 第 1 行:拖拽 + 在线点 + 国旗 + 名称 + 右侧 X */}
        <div className='flex items-center gap-2'>
          <GripVertical className={`size-3.5 shrink-0 ${isGuest ? 'text-muted-foreground/30' : 'text-muted-foreground/60'}`} />
          <span className={`inline-block size-2 rounded-full shrink-0 ${server.online ? 'bg-green-500' : 'bg-muted-foreground/40'}`} />
          <span className='text-lg shrink-0'>{server.flag}</span>
          <span className='font-bold flex-1 truncate'>{server.name}</span>
          {isGuest && (
            <Badge variant='outline' className='gap-0.5 text-[10px] border-purple-300 text-purple-700 dark:border-purple-700 dark:text-purple-400 shrink-0'>
              {t('shareServer.demo.guest.borrowedBadge')}
            </Badge>
          )}
        </div>

        {/* 第 2 行:状态 badges + 右侧三个图标 */}
        <div className='flex items-center justify-between gap-2'>
          <div className='flex items-center gap-1.5 flex-wrap'>
            <Badge className={`text-[10px] px-1.5 py-0 ${server.online ? 'bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/40' : 'bg-muted text-muted-foreground'}`}>
              {server.online ? t('shareServer.demo.card.online') : t('shareServer.demo.card.offline')}
            </Badge>
            <div className={`p-0.5 rounded ${isGuest ? 'bg-muted/40' : 'bg-orange-500/10'}`}>
              <Lock className={`size-3 ${isGuest ? 'text-muted-foreground' : 'text-orange-600'}`} />
            </div>
            <Badge variant='outline' className='text-[10px] px-1.5 py-0'>{t('shareServer.demo.card.defaultGroup')}</Badge>
            <Badge variant='outline' className={`text-[10px] px-1.5 py-0 ${server.xrayMode === 'embedded' ? 'border-primary text-primary' : 'border-blue-500 text-blue-600'}`}>
              {server.xrayMode === 'embedded' ? t('shareServer.demo.card.embeddedXray') : t('shareServer.demo.card.externalXray')}
            </Badge>
          </div>
          <div className='flex items-center gap-0.5 shrink-0'>
            {/* Share 按钮 — 主端可点;借用端禁用(再分享被禁) */}
            {mode === 'host' ? (
              <Button
                size='icon'
                variant='ghost'
                className={`size-7 ${server.shared ? 'text-primary' : ''}`}
                onClick={() => {
                  onToggleShare?.()
                  onOpenShareDialog?.()
                }}
                title={t('shareServer.demo.card.shareTip')}
              >
                <Share2 className='size-3.5' />
              </Button>
            ) : (
              <Button size='icon' variant='ghost' className='size-7 text-muted-foreground/40 cursor-not-allowed' disabled title={lockTooltip}>
                <Share2 className='size-3.5' />
              </Button>
            )}
            <Button size='icon' variant='ghost' className='size-7' title={t('shareServer.demo.card.searchTip')}>
              <Search className='size-3.5' />
            </Button>
            <Button
              size='icon'
              variant='ghost'
              className={`size-7 ${isGuest ? 'text-muted-foreground/40 cursor-not-allowed' : ''}`}
              disabled={isGuest}
              title={isGuest ? lockTooltip : t('shareServer.demo.card.editTip')}
            >
              <Pencil className='size-3.5' />
            </Button>
          </div>
        </div>

        {/* 第 3 行:IP + 自动 + WS + Xray + 版本 */}
        <div className='flex items-center gap-1.5 flex-wrap text-xs'>
          <span className='text-muted-foreground font-mono truncate max-w-[120px]'>{isGuest ? '••••••••' : server.ip}</span>
          <div className='flex items-center gap-1 text-muted-foreground'>
            <Settings className='size-3' />
            <span>{t('shareServer.demo.card.auto')}</span>
          </div>
          <Badge variant='outline' className='gap-1 text-[10px] px-1.5 py-0 border-green-500/40 text-green-700 dark:text-green-400'>
            <Wifi className='size-2.5' />
            WS
          </Badge>
          <Badge variant='outline' className={`gap-1 text-[10px] px-1.5 py-0 ${server.xrayRunning ? 'border-green-500/40 text-green-700 dark:text-green-400' : 'border-muted-foreground/40 text-muted-foreground'}`}>
            <span className={`inline-block size-1.5 rounded-full ${server.xrayRunning ? 'bg-green-500' : 'bg-muted-foreground'}`} />
            Xray
          </Badge>
          <Badge variant='outline' className='gap-1 text-[10px] px-1.5 py-0'>
            <ArrowUp className='size-2.5' />
            {server.xrayVersion}
          </Badge>
        </div>

        {/* 主信息块(浅橙背景) */}
        <div className='rounded-md bg-orange-500/5 border border-orange-500/15 p-2.5 space-y-2'>
          {/* 实时网速 */}
          <div className='flex items-center justify-between text-xs'>
            <span className='flex items-center gap-1.5 text-muted-foreground'>
              <Activity className='size-3.5' />
              {t('shareServer.demo.card.realtimeSpeed')}
            </span>
            <div className='flex items-center gap-3 tabular-nums'>
              <span className='text-green-600 dark:text-green-400'>↑ {fmtSpeed(stats?.upBps ?? 0)}</span>
              <span className='text-blue-600 dark:text-blue-400'>↓ {fmtSpeed(stats?.downBps ?? 0)}</span>
            </div>
          </div>
          {/* 流量统计 + 进度条 */}
          <div className='space-y-1'>
            <div className='flex items-center justify-between text-xs'>
              <span className='flex items-center gap-1.5 text-muted-foreground'>
                <Box className='size-3.5' />
                {t('shareServer.demo.card.trafficStats')}
              </span>
              <span className='tabular-nums'>
                {stats?.usedGb.toFixed(2) ?? '0.00'} GB / {stats?.totalGb.toFixed(2) ?? '0.00'} GB
              </span>
            </div>
            <div className='h-1.5 rounded-full bg-muted overflow-hidden'>
              <div className='h-full bg-orange-500 transition-all' style={{ width: `${usedPct}%` }} />
            </div>
          </div>
          {/* 重置 + 心跳 */}
          <div className='flex items-center justify-between text-[11px] text-muted-foreground'>
            <span>{t('shareServer.demo.card.reset')}</span>
            <span>{t('shareServer.demo.card.everyMonthDay', { day: server.resetDay })}</span>
          </div>
          <div className='text-[10px] text-muted-foreground'>{t('shareServer.demo.card.lastHeartbeat')}: 2026/06/07 21:52:06</div>
        </div>

        {/* 底部按钮:Xray 配置 / Agent */}
        <div className='grid grid-cols-2 gap-2'>
          <Button variant='outline' size='sm' className='h-8 text-xs'>
            <Settings className='size-3.5 mr-1' />
            {t('shareServer.demo.card.xrayConfig')}
          </Button>
          <Button
            variant='outline'
            size='sm'
            className={`h-8 text-xs ${isGuest ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isGuest}
            title={isGuest ? lockTooltip : ''}
          >
            <Box className='size-3.5 mr-1' />
            Agent
            {isGuest && <Lock className='size-3 ml-1' />}
          </Button>
        </div>

        {/* 消费方额外信息条 */}
        {isGuest && (
          <div className='rounded-md border border-purple-300/40 bg-purple-500/5 p-2 text-[10px] text-muted-foreground space-y-0.5'>
            <div>
              <span className='font-medium'>{t('shareServer.demo.guest.borrowedFrom')}:</span> {server.borrowedFrom}
            </div>
            <div>
              <span className='font-medium'>{t('shareServer.demo.guest.inboundPrefix')}:</span> <code className='bg-muted px-1 rounded'>{server.inboundPrefix}</code>
              <span className='text-muted-foreground'> — {t('shareServer.demo.guest.inboundPrefixHint')}</span>
            </div>
            {/* 借用端可以「添加入站」按钮 */}
            <div className='flex items-center justify-end pt-1'>
              <Button size='sm' variant='ghost' className='h-6 text-[10px] gap-1'>
                <Plus className='size-3' />
                {t('shareServer.demo.guest.addInbound')}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ShareDialog({ server, onClose }: { server: ServerInfo; onClose: () => void }) {
  const { t } = useTranslation('xdocs')
  const fakeToken = '9f3a2c5d7e8b14f6a0c2d4e5f6789012'
  const masterUrl = 'mmwx-main.example.com'

  const copy = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {})
    toast.success(t('shareServer.demo.shareDialog.copiedToast'))
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Share2 className='size-5 text-primary' />
            {t('shareServer.demo.shareDialog.title')}
          </DialogTitle>
          <DialogDescription>
            {t('shareServer.demo.shareDialog.desc', { name: server.name })}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-3'>
          <div className='space-y-1.5'>
            <Label className='text-xs'>{t('shareServer.demo.shareDialog.ownerAddress')}</Label>
            <div className='flex gap-1'>
              <Input value={masterUrl} readOnly className='font-mono text-xs' />
              <Button size='sm' variant='outline' onClick={() => copy(masterUrl)}>{t('shareServer.demo.shareDialog.copy')}</Button>
            </div>
          </div>

          <div className='space-y-1.5'>
            <Label className='text-xs'>{t('shareServer.demo.shareDialog.shareToken')}</Label>
            <div className='flex gap-1'>
              <Input value={fakeToken} readOnly className='font-mono text-xs' />
              <Button size='sm' variant='outline' onClick={() => copy(fakeToken)}>{t('shareServer.demo.shareDialog.copy')}</Button>
            </div>
            <p className='text-[10px] text-amber-700 dark:text-amber-400'>
              ⚠ {t('shareServer.demo.shareDialog.tokenOnceWarning')}
            </p>
          </div>

          <div className='rounded-md border bg-muted/30 p-2.5 text-[11px] text-muted-foreground space-y-1'>
            <div className='font-medium text-foreground'>{t('shareServer.demo.shareDialog.hashStorageHeading')}</div>
            <p>{t('shareServer.demo.shareDialog.hashStorageText')}</p>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>{t('shareServer.demo.shareDialog.close')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
