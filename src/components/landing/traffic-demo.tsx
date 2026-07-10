import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Activity, Network, Server, Users } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

// 伪随机 — 用 seed 算 [0, 1) 的确定值,替代 Math.random()
// (react-hooks/purity 要求 render 阶段纯函数,Math.random 不行;此函数同 seed 同输出 → 纯)
function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000
  return x - Math.floor(x)
}

// ───────── mock 数据 ─────────
const MOCK_USERS = ['jimlee', 'alice', 'bob', 'charlie', 'diana']
const MOCK_NODES = [
  { id: 1, name: '🇭🇰 香港 GoMami - HKT',    server: 'HK GoMami Pro' },
  { id: 2, name: '🇭🇰 香港 GoMami - Trojan',  server: 'HK GoMami Pro' },
  { id: 3, name: '🇭🇰 香港 GoMami - SS2022',  server: 'HK GoMami Pro' },
  { id: 4, name: '🇺🇸 美国 Megabox - Reality',    server: 'US Megabox Pro' },
  { id: 5, name: '🇺🇸 美国 Megabox - Hy2',        server: 'US Megabox Pro' },
  { id: 6, name: '🇯🇵 日本 Pulse - HKT',     server: 'JP Pulse Nano' },
  { id: 7, name: '🇯🇵 日本 Pulse - Trojan',   server: 'JP Pulse Nano' },
  { id: 8, name: '🇯🇵 日本 Pulse - SS2022',   server: 'JP Pulse Nano' },
]
const MOCK_SERVERS = [
  { name: 'HK GoMami Pro', limitGB: 1024,    baseUp: 8 * 1024 * 1024, baseDown: 32 * 1024 * 1024 },
  { name: 'US Megabox Pro',      limitGB: 512,     baseUp: 3 * 1024 * 1024, baseDown: 15 * 1024 * 1024 },
  { name: 'JP Pulse Nano',   limitGB: 512,     baseUp: 1 * 1024 * 1024, baseDown:  5 * 1024 * 1024 },
]

// 起始 baseline:用户 × 节点 → bytes
const baseTraffic: Record<string, Record<number, { up: number; down: number }>> = {}
MOCK_USERS.forEach((u, ui) => {
  baseTraffic[u] = {}
  MOCK_NODES.forEach((n, ni) => {
    // 让数据多样化:用户索引 / 节点索引混入
    const up   = (50 + ui * 30 + ni * 17) * 1024 * 1024 + Math.floor(Math.random() * 50_000_000)
    const down = (1100 + ui * 800 + ni * 230) * 1024 * 1024 + Math.floor(Math.random() * 1_000_000_000)
    baseTraffic[u][n.id] = { up, down }
  })
})

// 用户 → 服务器(每个用户在哪些服务器)— 用于"按服务器分布"展示
const SERVER_USED_BASE: Record<string, number> = {
  'HK GoMami Pro': 39.86 * 1024 ** 3,
  'US Megabox Pro':       6.91 * 1024 ** 3,
  'JP Pulse Nano':    9.95 * 1024 ** 3,
}

// ───────── 格式化 ─────────
const formatBytes = (n: number): string => {
  if (n < 1024) return `${n} B`
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(1)} KB`
  if (n < 1024 ** 3) return `${(n / 1024 ** 2).toFixed(1)} MB`
  if (n < 1024 ** 4) return `${(n / 1024 ** 3).toFixed(2)} GB`
  return `${(n / 1024 ** 4).toFixed(2)} TB`
}
const formatSpeed = (bps: number): string => {
  if (bps < 1024) return `${Math.round(bps)} B/s`
  if (bps < 1024 ** 2) return `${Math.round(bps / 1024)} K/s`
  if (bps < 1024 ** 3) return `${Math.round(bps / 1024 ** 2)} M/s`
  return `${(bps / 1024 ** 3).toFixed(2)} G/s`
}
const sumUserTraffic = (u: string) =>
  MOCK_NODES.reduce(
    (acc, n) => ({ up: acc.up + baseTraffic[u][n.id].up, down: acc.down + baseTraffic[u][n.id].down }),
    { up: 0, down: 0 }
  )
const sumNodeTraffic = (nid: number) =>
  MOCK_USERS.reduce(
    (acc, u) => ({ up: acc.up + baseTraffic[u][nid].up, down: acc.down + baseTraffic[u][nid].down }),
    { up: 0, down: 0 }
  )

// ───────── 实时刷动 hook ─────────
function useTick(intervalMs = 1500) {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return tick
}

// ───────── 主组件 ─────────
export function TrafficDemo() {
  const { t } = useTranslation('landing')
  const tick = useTick(1500)
  const [drill, setDrill] = useState<
    | { type: 'user'; key: string }
    | { type: 'node'; key: number }
    | null
  >(null)

  // 用户视图按总流量降序
  const usersSorted = useMemo(
    () => MOCK_USERS.map((u) => ({ u, ...sumUserTraffic(u) })).sort((a, b) => b.up + b.down - a.up - a.down),
    []
  )
  // 节点视图按总流量降序
  const nodesSorted = useMemo(
    () => MOCK_NODES.map((n) => ({ ...n, ...sumNodeTraffic(n.id) })).sort((a, b) => b.up + b.down - a.up - a.down),
    []
  )
  // 服务器实时网速:每 tick 在 baseSpeed ± 40% 内跳
  // 注:landing demo 数据,用 tick 当 seed 做伪随机(替代 Math.random),保持 render 纯函数
  // (React 19 react-hooks/purity 规则禁止 useMemo 内直接调 Math.random)
  const serverSpeed = useMemo(() => {
    return MOCK_SERVERS.map((s, idx) => {
      const seedUp = pseudoRandom(tick * 31 + idx * 7)
      const seedDown = pseudoRandom(tick * 31 + idx * 7 + 1)
      return {
        ...s,
        up: Math.round(s.baseUp * (0.6 + seedUp * 0.8)),
        down: Math.round(s.baseDown * (0.6 + seedDown * 0.8)),
        used: SERVER_USED_BASE[s.name] + tick * 1024 * 1024 * 5, // 累加每秒 ~5MB
      }
    })
  }, [tick])

  return (
    <section className='py-16 sm:py-20 px-4 sm:px-6'>
      <div className='max-w-7xl mx-auto'>
        <div className='text-center mb-10'>
          <div className='inline-flex items-center gap-2 px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4'>
            <Activity className='size-4 animate-pulse' />
            {t('xHome.trafficDemo.live')}
          </div>
          <h2 className='pixel-text text-3xl sm:text-4xl font-bold text-primary mb-3'>
            {t('xHome.trafficDemo.heading')}
          </h2>
          <p className='text-base text-muted-foreground max-w-2xl mx-auto'>
            {t('xHome.trafficDemo.description')}
          </p>
        </div>

        {/* 4 张顶部 stat 卡 */}
        <div className='grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8'>
          <StatCard label={t('xHome.trafficDemo.totalQuota')} value='2 TB' icon={<Server className='size-5' />} />
          <StatCard
            label={t('xHome.trafficDemo.totalUsed')}
            value={formatBytes(serverSpeed.reduce((s, x) => s + x.used, 0))}
            icon={<Activity className='size-5' />}
          />
          <StatCard
            label={t('xHome.trafficDemo.realtimeSpeed')}
            value={
              <div className='flex flex-col items-center text-sm leading-tight tabular-nums'>
                <span className='text-green-600 dark:text-green-400'>↑ {formatSpeed(serverSpeed.reduce((s, x) => s + x.up, 0))}</span>
                <span className='text-blue-600 dark:text-blue-400'>↓ {formatSpeed(serverSpeed.reduce((s, x) => s + x.down, 0))}</span>
              </div>
            }
            icon={<Activity className='size-5' />}
          />
          <StatCard label={t('xHome.trafficDemo.serverCount')} value={String(MOCK_SERVERS.length)} icon={<Server className='size-5' />} />
        </div>

        {/* 用户视图 + 节点视图 */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4'>
          <Card className='pixel-card'>
            <CardHeader className='pb-3'>
              <CardTitle className='text-base flex items-center gap-2'>
                <Users className='size-4' />
                {t('xHome.trafficDemo.userView')}
              </CardTitle>
              <CardDescription>{t('xHome.trafficDemo.userViewDesc')}</CardDescription>
            </CardHeader>
            <CardContent className='space-y-1'>
              {usersSorted.map((u) => (
                <button
                  key={u.u}
                  onClick={() => setDrill({ type: 'user', key: u.u })}
                  className='w-full flex items-center justify-between rounded-md px-3 py-2 text-sm transition hover:bg-muted'
                >
                  <span className='font-medium truncate'>{u.u}</span>
                  <span className='text-xs text-muted-foreground shrink-0'>
                    ↑{formatBytes(u.up)} ↓{formatBytes(u.down)}
                  </span>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card className='pixel-card'>
            <CardHeader className='pb-3'>
              <CardTitle className='text-base flex items-center gap-2'>
                <Network className='size-4' />
                {t('xHome.trafficDemo.nodeView')}
              </CardTitle>
              <CardDescription>{t('xHome.trafficDemo.nodeViewDesc')}</CardDescription>
            </CardHeader>
            <CardContent className='space-y-1'>
              {nodesSorted.map((n) => (
                <button
                  key={n.id}
                  onClick={() => setDrill({ type: 'node', key: n.id })}
                  className='w-full flex items-center justify-between rounded-md px-3 py-2 text-sm transition hover:bg-muted'
                >
                  <span className='font-medium truncate mr-3 min-w-0'>{n.name}</span>
                  <span className='text-xs text-muted-foreground shrink-0'>
                    ↑{formatBytes(n.up)} ↓{formatBytes(n.down)}
                  </span>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* 服务器视图 */}
        <Card className='pixel-card'>
          <CardHeader className='pb-3'>
            <CardTitle className='text-base flex items-center gap-2'>
              <Server className='size-4' />
              {t('xHome.trafficDemo.serverView')}
            </CardTitle>
            <CardDescription>{t('xHome.trafficDemo.serverViewDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('xHome.trafficDemo.cols.server')}</TableHead>
                    <TableHead>{t('xHome.trafficDemo.cols.speed')}</TableHead>
                    <TableHead className='text-right'>{t('xHome.trafficDemo.cols.used')}</TableHead>
                    <TableHead className='text-right'>{t('xHome.trafficDemo.cols.total')}</TableHead>
                    <TableHead className='text-right'>{t('xHome.trafficDemo.cols.remaining')}</TableHead>
                    <TableHead className='text-right'>{t('xHome.trafficDemo.cols.usage')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {serverSpeed.map((s) => {
                    const limit = s.limitGB * 1024 ** 3
                    const remaining = limit - s.used
                    const pct = (s.used / limit) * 100
                    return (
                      <TableRow key={s.name}>
                        <TableCell className='font-medium'>{s.name}</TableCell>
                        <TableCell className='text-xs whitespace-nowrap'>
                          <span className='inline-block w-[72px] text-right tabular-nums text-green-600 dark:text-green-400'>↑ {formatSpeed(s.up)}</span>
                          <span className='inline-block w-[72px] text-right tabular-nums text-blue-600 dark:text-blue-400 ml-2'>↓ {formatSpeed(s.down)}</span>
                        </TableCell>
                        <TableCell className='text-right text-sm'>{formatBytes(s.used)}</TableCell>
                        <TableCell className='text-right text-sm'>{formatBytes(limit)}</TableCell>
                        <TableCell className='text-right text-sm'>{formatBytes(remaining)}</TableCell>
                        <TableCell className='text-right text-sm'>{pct.toFixed(1)}%</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* 下钻 Dialog */}
        <Dialog open={drill !== null} onOpenChange={(open) => !open && setDrill(null)}>
          <DialogContent className='sm:max-w-2xl'>
            <DialogHeader>
              <DialogTitle>
                {drill?.type === 'user' && t('xHome.trafficDemo.drillUser', { name: drill.key })}
                {drill?.type === 'node' && t('xHome.trafficDemo.drillNode', { name: MOCK_NODES.find((n) => n.id === drill.key)?.name })}
              </DialogTitle>
              <DialogDescription>
                {drill?.type === 'user' ? t('xHome.trafficDemo.drillUserDesc') : t('xHome.trafficDemo.drillNodeDesc')}
              </DialogDescription>
            </DialogHeader>
            <div className='space-y-1 max-h-[60vh] overflow-y-auto'>
              {drill?.type === 'user' &&
                [...MOCK_NODES]
                  .map((n) => ({ ...n, ...baseTraffic[drill.key][n.id] }))
                  .sort((a, b) => b.up + b.down - a.up - a.down)
                  .map((n) => (
                    <div key={n.id} className='flex items-center justify-between rounded-md px-3 py-2 text-sm'>
                      <span className='font-medium truncate mr-3 min-w-0'>{n.name}</span>
                      <span className='text-xs text-muted-foreground shrink-0 tabular-nums'>
                        ↑{formatBytes(n.up)} ↓{formatBytes(n.down)}
                      </span>
                    </div>
                  ))}
              {drill?.type === 'node' &&
                MOCK_USERS
                  .map((u) => ({ u, ...baseTraffic[u][drill.key] }))
                  .sort((a, b) => b.up + b.down - a.up - a.down)
                  .map((u) => (
                    <div key={u.u} className='flex items-center justify-between rounded-md px-3 py-2 text-sm'>
                      <span className='font-medium'>{u.u}</span>
                      <span className='text-xs text-muted-foreground tabular-nums'>
                        ↑{formatBytes(u.up)} ↓{formatBytes(u.down)}
                      </span>
                    </div>
                  ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  )
}

function StatCard({ label, value, icon }: { label: string; value: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className='pixel-card p-4 text-center'>
      {icon && <div className='flex justify-center text-primary mb-1'>{icon}</div>}
      <div className='text-2xl sm:text-3xl font-bold text-primary'>{value}</div>
      <div className='text-xs sm:text-sm text-muted-foreground mt-1'>{label}</div>
    </div>
  )
}
