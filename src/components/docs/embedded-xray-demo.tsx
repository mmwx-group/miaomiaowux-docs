// 内嵌 Xray mock — PRO 功能。让用户直观看到外置 / 内嵌两种模式下 Agent + Xray 进程关系。
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  Box,
  Crown,
  Cpu,
  Network,
  ArrowDownToLine,
  CheckCircle2,
  Loader2,
  Power,
  Activity,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

type XrayMode = 'external' | 'embedded'

const SERVERS = [
  { id: 1, name: 'hk1.example.com', status: 'connected' as const },
  { id: 2, name: 'us1.example.com', status: 'connected' as const },
  { id: 3, name: 'jp1.example.com', status: 'connected' as const },
]

export function EmbeddedXrayDemo() {
  const { t } = useTranslation('xdocs')
  const [mode, setMode] = useState<XrayMode>('external')
  const [switching, setSwitching] = useState(false)

  const switchMode = async (newMode: XrayMode) => {
    if (newMode === mode) return
    setSwitching(true)
    await new Promise((r) => setTimeout(r, 1200))
    setMode(newMode)
    toast.success(t('embeddedXray.demo.switchedToast', { mode: newMode }))
    setSwitching(false)
  }

  return (
    <Card className='border-dashed'>
      <CardContent className='pt-6 space-y-4'>
        <div className='flex items-center gap-2 flex-wrap'>
          <Badge variant='outline' className='text-xs'>{t('embeddedXray.demo.badge')}</Badge>
          <Badge className='gap-1 bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300 text-xs'>
            <Crown className='size-3' />
            PRO
          </Badge>
          <span className='text-xs text-muted-foreground'>{t('embeddedXray.demo.intro')}</span>
        </div>

        {/* 模式切换 */}
        <div className='rounded-md border p-3 space-y-2'>
          <Label className='text-sm font-semibold'>{t('embeddedXray.demo.modeSwitchLabel')}</Label>
          <RadioGroup
            value={mode}
            onValueChange={(v) => switchMode(v as XrayMode)}
            className='grid grid-cols-1 sm:grid-cols-2 gap-2'
          >
            <label
              htmlFor='m-ext'
              className={`flex items-start gap-2 rounded-md border p-3 cursor-pointer ${
                mode === 'external' ? 'border-primary bg-primary/5' : 'border-border'
              }`}
            >
              <RadioGroupItem value='external' id='m-ext' className='mt-0.5' disabled={switching} />
              <div>
                <div className='font-medium text-sm flex items-center gap-1.5'>
                  <Cpu className='size-4 text-muted-foreground' />
                  {t('embeddedXray.demo.externalLabel')}
                </div>
                <p className='text-xs text-muted-foreground mt-0.5'>{t('embeddedXray.demo.externalDesc')}</p>
              </div>
            </label>
            <label
              htmlFor='m-emb'
              className={`flex items-start gap-2 rounded-md border p-3 cursor-pointer ${
                mode === 'embedded' ? 'border-primary bg-primary/5' : 'border-border'
              }`}
            >
              <RadioGroupItem value='embedded' id='m-emb' className='mt-0.5' disabled={switching} />
              <div>
                <div className='font-medium text-sm flex items-center gap-1.5'>
                  <Box className='size-4 text-primary' />
                  {t('embeddedXray.demo.embeddedLabel')}
                  <Badge className='ml-1 text-[10px] gap-0.5 bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300'>
                    <Crown className='size-2.5' />
                    PRO
                  </Badge>
                </div>
                <p className='text-xs text-muted-foreground mt-0.5'>{t('embeddedXray.demo.embeddedDesc')}</p>
              </div>
            </label>
          </RadioGroup>
        </div>

        {/* 进程关系图 */}
        <div className='rounded-md border bg-muted/20 p-4 space-y-3'>
          <div className='flex items-center gap-1.5 text-sm font-medium'>
            <Activity className='size-4 text-primary' />
            {t('embeddedXray.demo.processView')}
            {switching && <Loader2 className='size-3.5 ml-2 animate-spin text-muted-foreground' />}
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
            {SERVERS.map((s) => (
              <div key={s.id} className='rounded-md border bg-card p-3 space-y-2'>
                {/* 服务器头 */}
                <div className='flex items-center justify-between gap-2 pb-1.5 border-b'>
                  <div className='flex items-center gap-1.5 min-w-0'>
                    <Network className='size-3.5 shrink-0 text-muted-foreground' />
                    <span className='truncate text-sm font-mono'>{s.name}</span>
                  </div>
                  <span className='inline-block size-2 rounded-full bg-green-500' />
                </div>

                {/* 进程视图 */}
                {mode === 'external' ? (
                  <div className='space-y-1.5'>
                    <ProcessBox name='mmw-agent' pid='1234' role={t('embeddedXray.demo.proc.agentRole')} accent />
                    <div className='flex items-center justify-center text-muted-foreground'>
                      <ArrowDownToLine className='size-3' />
                      <span className='text-[10px] ml-1'>gRPC</span>
                    </div>
                    <ProcessBox name='xray' pid='5678' role={t('embeddedXray.demo.proc.xrayRole')} />
                  </div>
                ) : (
                  <div className='space-y-1.5'>
                    <ProcessBox
                      name='mmw-agent'
                      pid='1234'
                      role={t('embeddedXray.demo.proc.agentEmbeddedRole')}
                      accent
                      nested
                    >
                      <div className='mt-1.5 rounded border border-dashed border-primary/40 bg-primary/5 px-2 py-1'>
                        <div className='flex items-center gap-1 text-[10px] font-medium text-primary'>
                          <Box className='size-2.5' />
                          {t('embeddedXray.demo.proc.embeddedXrayLabel')}
                        </div>
                      </div>
                    </ProcessBox>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 对比表 */}
        <div className='overflow-x-auto'>
          <table className='w-full text-xs'>
            <thead className='text-muted-foreground border-b'>
              <tr>
                <th className='text-left py-2 px-2 font-medium'>{t('embeddedXray.demo.compare.aspect')}</th>
                <th className='text-left py-2 px-2 font-medium'>
                  <Cpu className='size-3 inline mr-1' />
                  {t('embeddedXray.demo.externalLabel')}
                </th>
                <th className='text-left py-2 px-2 font-medium'>
                  <Box className='size-3 inline mr-1 text-primary' />
                  {t('embeddedXray.demo.embeddedLabel')}
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                ['进程数', '2 (mmw-agent + xray)', '1 (mmw-agent 含 xray)'],
                ['磁盘占用', '~30 MB(agent) + ~30 MB(xray 二进制)', '~50 MB(只装 agent)'],
                ['内存占用', 'agent + xray 各自常驻', '单进程,共享内存'],
                ['Xray 升级', '需重装 xray-core', '随 agent 升级'],
                ['配置文件', '/usr/local/etc/xray/config.json', '由 agent 持有'],
                ['gRPC 通讯', '需要', '不需要(进程内调用)'],
                ['故障隔离', '独立进程,互不影响', '同进程,一同生死'],
                ['排障熟悉度', '官方 Xray 标准布局', '需通过 agent 日志'],
                ['PRO 许可证', '✓ 免费', '✗ 仅 PRO 可用'],
              ].map(([k, a, b]) => (
                <tr key={k} className='border-b last:border-b-0'>
                  <td className='py-1.5 px-2 font-medium text-muted-foreground'>{k}</td>
                  <td className='py-1.5 px-2'>{a}</td>
                  <td className='py-1.5 px-2 text-primary'>{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 状态总结 */}
        <div className='flex items-center justify-between rounded-md border bg-primary/5 p-3 text-xs'>
          <span className='flex items-center gap-1.5'>
            <CheckCircle2 className='size-3.5 text-primary' />
            <span className='font-medium'>{t('embeddedXray.demo.currentLabel')}</span>
            <Badge variant='outline' className='text-[10px] border-primary text-primary'>
              {mode === 'external'
                ? t('embeddedXray.demo.externalLabel')
                : t('embeddedXray.demo.embeddedLabel')}
            </Badge>
          </span>
          <span className='text-muted-foreground'>
            {mode === 'external'
              ? t('embeddedXray.demo.statusExternal')
              : t('embeddedXray.demo.statusEmbedded')}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

function ProcessBox({
  name,
  pid,
  role,
  accent,
  nested,
  children,
}: {
  name: string
  pid: string
  role: string
  accent?: boolean
  nested?: boolean
  children?: React.ReactNode
}) {
  return (
    <div
      className={`rounded border p-2 ${
        accent ? 'border-primary/40 bg-primary/5' : 'border-border bg-card'
      }`}
    >
      <div className='flex items-center justify-between gap-2'>
        <div className='flex items-center gap-1.5 min-w-0'>
          <Power className={`size-3 shrink-0 ${accent ? 'text-primary' : 'text-muted-foreground'}`} />
          <span className='font-mono text-xs font-medium truncate'>{name}</span>
        </div>
        <span className='text-[10px] text-muted-foreground'>PID {pid}</span>
      </div>
      <div className='text-[10px] text-muted-foreground mt-0.5'>{role}</div>
      {nested && children}
    </div>
  )
}
