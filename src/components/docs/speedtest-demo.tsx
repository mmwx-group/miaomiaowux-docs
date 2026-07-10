// 节点测速 mock — PRO 功能,多选节点 → 启动测速 → 真延迟+下载速度结果表。
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  Gauge,
  Play,
  Loader2,
  CheckCircle2,
  X,
  Wifi,
  Download,
  Square,
  Crown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

type SpeedNode = {
  id: number
  name: string
  server: string
  selected: boolean
  testing: boolean
  latencyMs: number | null
  downloadMbps: number | null
  egressIp: string | null
  status: 'idle' | 'testing' | 'ok' | 'failed'
  error?: string
}

const INITIAL: SpeedNode[] = [
  { id: 1, name: '🇭🇰 香港 GoMami - HKT',     server: 'hk1.example.com', selected: false, testing: false, latencyMs: null, downloadMbps: null, egressIp: null, status: 'idle' },
  { id: 2, name: '🇭🇰 香港 GoMami - Trojan',   server: 'hk1.example.com', selected: false, testing: false, latencyMs: null, downloadMbps: null, egressIp: null, status: 'idle' },
  { id: 3, name: '🇺🇸 美国 Megabox - Reality', server: 'us1.example.com', selected: false, testing: false, latencyMs: null, downloadMbps: null, egressIp: null, status: 'idle' },
  { id: 4, name: '🇯🇵 日本 Pulse - Hy2',       server: 'jp1.example.com', selected: false, testing: false, latencyMs: null, downloadMbps: null, egressIp: null, status: 'idle' },
  { id: 5, name: '🇸🇬 新加坡 LightNode',       server: 'sg1.example.com', selected: false, testing: false, latencyMs: null, downloadMbps: null, egressIp: null, status: 'idle' },
  { id: 6, name: '🇩🇪 德国 Hetzner - Reality', server: 'de1.example.com', selected: false, testing: false, latencyMs: null, downloadMbps: null, egressIp: null, status: 'idle' },
  { id: 7, name: '🇰🇷 韩国 KT - VLESS',         server: 'kr1.example.com', selected: false, testing: false, latencyMs: null, downloadMbps: null, egressIp: null, status: 'idle' },
]

// 给每个节点预算一个"基础真实延迟"(随机但偏地区合理)
const BASE_LATENCY: Record<number, number> = { 1: 35, 2: 38, 3: 145, 4: 70, 5: 50, 6: 220, 7: 80 }
const BASE_MBPS:    Record<number, number> = { 1: 280, 2: 240, 3: 95, 4: 180, 5: 200, 6: 60, 7: 160 }

// 假装一些 egress IP
const FAKE_IPS = ['203.0.113.10', '203.0.113.42', '203.0.113.77', '203.0.113.103', '198.51.100.5', '198.51.100.46', '198.51.100.88']

export function SpeedtestDemo() {
  const { t } = useTranslation('xdocs')
  const [nodes, setNodes] = useState<SpeedNode[]>(INITIAL)
  const [mode, setMode] = useState<'full' | 'latencyOnly'>('latencyOnly')
  const [running, setRunning] = useState(false)

  const selectedCount = nodes.filter((n) => n.selected).length
  const testedCount = nodes.filter((n) => n.status === 'ok' || n.status === 'failed').length

  const toggleAll = () => {
    const allSelected = nodes.every((n) => n.selected)
    setNodes((prev) => prev.map((n) => ({ ...n, selected: !allSelected })))
  }

  const toggleOne = (id: number) => {
    setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, selected: !n.selected } : n)))
  }

  const reset = () => {
    setNodes((prev) =>
      prev.map((n) => ({ ...n, testing: false, latencyMs: null, downloadMbps: null, egressIp: null, status: 'idle', error: undefined }))
    )
  }

  const start = async () => {
    if (selectedCount === 0) {
      toast.error(t('nodeSpeedtest.demo.errorNoSelection'))
      return
    }
    setRunning(true)
    // mark all selected as testing
    setNodes((prev) =>
      prev.map((n) =>
        n.selected ? { ...n, testing: true, status: 'testing', latencyMs: null, downloadMbps: null, egressIp: null, error: undefined } : n
      )
    )

    const selectedIds = nodes.filter((n) => n.selected).map((n) => n.id)

    // 依次完成每个节点测试(并发感:每个间隔 ~300ms 出结果)
    for (const id of selectedIds) {
      await new Promise((r) => setTimeout(r, 400 + Math.random() * 600))

      // 5% 概率 fail
      const ok = Math.random() > 0.05
      setNodes((prev) =>
        prev.map((n) => {
          if (n.id !== id) return n
          if (!ok) {
            return { ...n, testing: false, status: 'failed', error: 'timeout' }
          }
          const base = BASE_LATENCY[id] ?? 100
          const latency = Math.round(base * (0.9 + Math.random() * 0.3))
          const baseMbps = BASE_MBPS[id] ?? 100
          const mbps = mode === 'latencyOnly' ? null : Math.round(baseMbps * (0.7 + Math.random() * 0.5))
          return {
            ...n,
            testing: false,
            status: 'ok',
            latencyMs: latency,
            downloadMbps: mbps,
            egressIp: FAKE_IPS[id % FAKE_IPS.length],
          }
        })
      )
    }

    setRunning(false)
    toast.success(t('nodeSpeedtest.demo.doneToast', { count: selectedIds.length }))
  }

  const cancel = () => {
    setRunning(false)
    setNodes((prev) =>
      prev.map((n) => (n.status === 'testing' ? { ...n, testing: false, status: 'idle' } : n))
    )
    toast.info(t('nodeSpeedtest.demo.cancelledToast'))
  }

  // 状态颜色
  const latencyColor = (ms: number | null): string => {
    if (ms === null) return ''
    if (ms < 80) return 'text-green-600 dark:text-green-400'
    if (ms < 200) return 'text-amber-600 dark:text-amber-400'
    return 'text-destructive'
  }
  const mbpsColor = (mbps: number | null): string => {
    if (mbps === null) return ''
    if (mbps >= 150) return 'text-green-600 dark:text-green-400'
    if (mbps >= 50) return 'text-amber-600 dark:text-amber-400'
    return 'text-destructive'
  }

  return (
    <Card className='border-dashed'>
      <CardContent className='pt-6 space-y-4'>
        <div className='flex items-center gap-2 flex-wrap'>
          <Badge variant='outline' className='text-xs'>{t('nodeSpeedtest.demo.badge')}</Badge>
          <Badge className='gap-1 bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300 text-xs'>
            <Crown className='size-3' />
            PRO
          </Badge>
          <span className='text-xs text-muted-foreground'>{t('nodeSpeedtest.demo.intro')}</span>
        </div>

        {/* 控制条 */}
        <div className='flex items-center gap-2 flex-wrap p-3 rounded-md border bg-muted/30'>
          <Button variant='outline' size='sm' onClick={toggleAll}>
            {nodes.every((n) => n.selected) ? t('nodeSpeedtest.demo.deselectAll') : t('nodeSpeedtest.demo.selectAll')}
          </Button>

          <RadioGroup value={mode} onValueChange={(v) => setMode(v as 'full' | 'latencyOnly')} className='flex items-center gap-3'>
            <div className='flex items-center gap-1.5'>
              <RadioGroupItem value='latencyOnly' id='m-l' />
              <Label htmlFor='m-l' className='text-xs cursor-pointer font-normal'>{t('nodeSpeedtest.demo.modeLatencyOnly')}</Label>
            </div>
            <div className='flex items-center gap-1.5'>
              <RadioGroupItem value='full' id='m-f' />
              <Label htmlFor='m-f' className='text-xs cursor-pointer font-normal'>{t('nodeSpeedtest.demo.modeFull')}</Label>
            </div>
          </RadioGroup>

          <div className='flex-1' />

          {running ? (
            <Button variant='destructive' size='sm' onClick={cancel}>
              <Square className='size-3.5 mr-1' />
              {t('nodeSpeedtest.demo.cancelBtn')}
            </Button>
          ) : (
            <>
              <Button variant='outline' size='sm' onClick={reset} disabled={testedCount === 0}>
                {t('nodeSpeedtest.demo.resetBtn')}
              </Button>
              <Button size='sm' onClick={start} disabled={selectedCount === 0}>
                <Play className='size-3.5 mr-1' />
                {t('nodeSpeedtest.demo.startBtn', { count: selectedCount })}
              </Button>
            </>
          )}
        </div>

        {/* 节点表 */}
        <div className='rounded-md border overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead className='bg-muted/30 text-xs text-muted-foreground'>
              <tr>
                <th className='text-left py-2 px-3 w-10'></th>
                <th className='text-left py-2 px-3'>{t('nodeSpeedtest.demo.col.node')}</th>
                <th className='text-right py-2 px-3 whitespace-nowrap'>
                  <Wifi className='size-3 inline mr-1' />
                  {t('nodeSpeedtest.demo.col.latency')}
                </th>
                <th className='text-right py-2 px-3 whitespace-nowrap'>
                  <Download className='size-3 inline mr-1' />
                  {t('nodeSpeedtest.demo.col.speed')}
                </th>
                <th className='text-left py-2 px-3'>{t('nodeSpeedtest.demo.col.egress')}</th>
                <th className='text-center py-2 px-3'>{t('nodeSpeedtest.demo.col.status')}</th>
              </tr>
            </thead>
            <tbody>
              {nodes.map((n) => (
                <tr key={n.id} className='border-t'>
                  <td className='py-2 px-3'>
                    <input
                      type='checkbox'
                      checked={n.selected}
                      onChange={() => toggleOne(n.id)}
                      className='size-4 cursor-pointer'
                      disabled={running}
                    />
                  </td>
                  <td className='py-2 px-3'>
                    <div className='font-medium truncate max-w-[240px]'>{n.name}</div>
                    <div className='text-xs text-muted-foreground font-mono'>{n.server}</div>
                  </td>
                  <td className={`py-2 px-3 text-right tabular-nums whitespace-nowrap ${latencyColor(n.latencyMs)}`}>
                    {n.latencyMs !== null ? `${n.latencyMs} ms` : '—'}
                  </td>
                  <td className={`py-2 px-3 text-right tabular-nums whitespace-nowrap ${mbpsColor(n.downloadMbps)}`}>
                    {n.downloadMbps !== null ? `${n.downloadMbps} Mbps` : '—'}
                  </td>
                  <td className='py-2 px-3 font-mono text-xs text-muted-foreground'>{n.egressIp ?? '—'}</td>
                  <td className='py-2 px-3 text-center'>
                    {n.status === 'testing' && <Loader2 className='size-4 mx-auto animate-spin text-primary' />}
                    {n.status === 'ok' && <CheckCircle2 className='size-4 mx-auto text-green-600 dark:text-green-400' />}
                    {n.status === 'failed' && (
                      <span title={n.error}>
                        <X className='size-4 mx-auto text-destructive' />
                      </span>
                    )}
                    {n.status === 'idle' && <span className='text-xs text-muted-foreground'>—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 进度提示 */}
        {running && (
          <div className='flex items-center gap-2 text-xs text-muted-foreground'>
            <Loader2 className='size-3.5 animate-spin' />
            {t('nodeSpeedtest.demo.runningHint', { done: testedCount, total: selectedCount })}
          </div>
        )}

        {/* 总结 */}
        {!running && testedCount > 0 && (
          <div className='rounded-md border bg-primary/5 p-3 text-xs space-y-1'>
            <div className='flex items-center gap-1.5 font-medium'>
              <Gauge className='size-3.5 text-primary' />
              {t('nodeSpeedtest.demo.summary.heading')}
            </div>
            <div className='text-muted-foreground'>
              {t('nodeSpeedtest.demo.summary.text', {
                ok: nodes.filter((n) => n.status === 'ok').length,
                failed: nodes.filter((n) => n.status === 'failed').length,
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
