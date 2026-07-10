// 从妙妙屋迁移到妙妙屋X — 完整 5 步向导的 mock 复刻。
// 所有数据都是写死的 mock,所有"调用主控 API"的地方都用 setTimeout 模拟异步。
// 跟 mmwx 主控的 /migrate-from-mmw 页面 UI 与交互一致,但不发任何网络请求。
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  Copy,
  Database,
  ExternalLink,
  FileWarning,
  Loader2,
  ShieldCheck,
  Terminal,
  Upload,
} from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

// ───────── 类型定义 ─────────
type AutoBackup = {
  backup_path: string
  db_path: string
  subscribes_dir: string
  subscribe_count: number
  size_bytes: number
  db_size_bytes: number
} | null

type ImportReport = {
  users: number
  user_tokens: number
  nodes: number
  subscribe_files: number
  user_subscriptions: number
  user_settings: number
  templates: number
  custom_rules: number
  override_scripts: number
  external_subscriptions: number
  warnings?: string[]
}
type ImportResp = {
  success: boolean
  report: ImportReport
  owned_by_admin: string
  subscribes_copied: number
  subscribes_skipped: string[]
}

type DistinctServer = {
  address: string
  node_count: number
  ports: number[]
  protocols: string[]
  existing_server: boolean
  existing_server_id?: number
  sample_node_name: string
}

type TakeoverResp = {
  success: boolean
  servers_scanned: number
  results: Array<{
    server_name: string
    detected: boolean
    config_path?: string
    conf_dir?: string
    merged_files: number
    restarted: boolean
    error?: string
  }>
}

type PatchClientEmailsResp = {
  success: boolean
  owned_by_admin: string
  servers_scanned: number
  inbounds_total: number
  clients_patched: { server_name: string; inbound_tag: string; new_email: string }[]
  admin_subaccounts_linked: { server_name: string; inbound_tag: string; email: string; was_new: boolean }[]
  ss2022_inbounds: { server_name: string; inbound_tag: string; method: string }[]
}

// ───────── Mock 数据 ─────────
const MOCK_BACKUP: NonNullable<AutoBackup> = {
  backup_path: '/tmp/mmwx-migrate/mmw-backup-2026-06-07.tar.gz',
  db_path: '/tmp/mmwx-migrate/data/mmw.db',
  subscribes_dir: '/tmp/mmwx-migrate/subscribes',
  subscribe_count: 18,
  size_bytes: 2_450_000,   // 2.34 MB
  db_size_bytes: 520_000,  // 0.50 MB
}

const MOCK_IMPORT: ImportResp = {
  success: true,
  report: {
    users: 24,
    user_tokens: 24,
    nodes: 17,
    subscribe_files: 18,
    user_subscriptions: 41,
    user_settings: 22,
    templates: 4,
    custom_rules: 2,
    override_scripts: 1,
    external_subscriptions: 3,
    warnings: [],
  },
  owned_by_admin: 'admin',
  subscribes_copied: 16,
  subscribes_skipped: ['shared-default.yaml', 'team-internal.yaml'],
}

const MOCK_SERVERS: DistinctServer[] = [
  { address: 'hk1.example.com', node_count: 4, ports: [443, 8388, 51820], protocols: ['vless', 'shadowsocks'], existing_server: true, existing_server_id: 1, sample_node_name: '🇭🇰 香港 GoMami - HKT' },
  { address: 'us1.example.com', node_count: 3, ports: [443, 8388],         protocols: ['vless', 'trojan'],      existing_server: false, sample_node_name: '🇺🇸 美国 Megabox - Reality' },
  { address: 'jp1.example.com', node_count: 4, ports: [443, 8388, 8443],   protocols: ['vless', 'hysteria2'],   existing_server: false, sample_node_name: '🇯🇵 日本 Pulse - Hy2' },
  { address: 'sg1.example.com', node_count: 3, ports: [443, 51820],        protocols: ['vless'],                existing_server: false, sample_node_name: '🇸🇬 新加坡 LightNode' },
  { address: 'de1.example.com', node_count: 3, ports: [443, 8388],         protocols: ['vless', 'trojan'],      existing_server: true, existing_server_id: 5, sample_node_name: '🇩🇪 德国 Hetzner - Reality' },
]

const MOCK_TAKEOVER: TakeoverResp = {
  success: true,
  servers_scanned: 5,
  results: [
    { server_name: 'hk1.example.com', detected: true,  config_path: '/usr/local/etc/xray/config.json', conf_dir: '/usr/local/etc/xray/confs',   merged_files: 7, restarted: true },
    { server_name: 'us1.example.com', detected: true,  config_path: '/usr/local/etc/xray/config.json', conf_dir: '/usr/local/etc/xray/confs',   merged_files: 5, restarted: true },
    { server_name: 'jp1.example.com', detected: false, merged_files: 0, restarted: false },
    { server_name: 'sg1.example.com', detected: true,  config_path: '/etc/xray/config.json',            conf_dir: '/etc/xray/conf.d',            merged_files: 3, restarted: true },
    { server_name: 'de1.example.com', detected: true,  config_path: '/usr/local/etc/xray/config.json', conf_dir: '/usr/local/etc/xray/confs',   merged_files: 6, restarted: true },
  ],
}

const MOCK_PATCH: PatchClientEmailsResp = {
  success: true,
  owned_by_admin: 'admin',
  servers_scanned: 5,
  inbounds_total: 12,
  clients_patched: [
    { server_name: 'hk1.example.com', inbound_tag: 'vless-443',  new_email: 'admin@hk1-443' },
    { server_name: 'hk1.example.com', inbound_tag: 'ss-8388',    new_email: 'admin@hk1-ss' },
    { server_name: 'us1.example.com', inbound_tag: 'vless-443',  new_email: 'admin@us1-443' },
    { server_name: 'jp1.example.com', inbound_tag: 'hy2-8443',   new_email: 'admin@jp1-hy2' },
    { server_name: 'de1.example.com', inbound_tag: 'trojan-443', new_email: 'admin@de1-trojan' },
  ],
  admin_subaccounts_linked: [
    { server_name: 'hk1.example.com', inbound_tag: 'vless-443',  email: 'admin@hk1-443',     was_new: true },
    { server_name: 'hk1.example.com', inbound_tag: 'ss-8388',    email: 'admin@hk1-ss',      was_new: true },
    { server_name: 'us1.example.com', inbound_tag: 'vless-443',  email: 'admin@us1-443',     was_new: true },
    { server_name: 'jp1.example.com', inbound_tag: 'hy2-8443',   email: 'admin@jp1-hy2',     was_new: true },
    { server_name: 'de1.example.com', inbound_tag: 'trojan-443', email: 'admin@de1-trojan',  was_new: true },
    { server_name: 'sg1.example.com', inbound_tag: 'vless-443',  email: 'jimlee@sg1-443',    was_new: false },
  ],
  ss2022_inbounds: [
    { server_name: 'hk1.example.com', inbound_tag: 'ss2022-51820', method: '2022-blake3-aes-256-gcm' },
  ],
}

const mockDelay = (ms = 800) => new Promise<void>((r) => setTimeout(r, ms))

const STEPS = [
  { id: 1, title: '概述',     icon: ShieldCheck },
  { id: 2, title: '备份停服', icon: FileWarning },
  { id: 3, title: '导入数据', icon: Database },
  { id: 4, title: '认领节点', icon: Upload },
  { id: 5, title: '验证完成', icon: CheckCircle2 },
] as const

// ───────── 主组件 ─────────
export function MigrationDemo() {
  const [step, setStep] = useState(1)
  const [autoBackup, setAutoBackup] = useState<AutoBackup>(null)
  const goNext = () => setStep((s) => Math.min(s + 1, STEPS.length))
  const goBack = () => setStep((s) => Math.max(s - 1, 1))

  return (
    <div className='rounded-xl border-2 border-dashed bg-card p-4 sm:p-6 lg:-mx-12 xl:-mx-20 2xl:-mx-32'>
      <div className='mb-4 flex items-center gap-2'>
        <Badge variant='outline' className='text-xs'>演示</Badge>
        <Badge variant='secondary' className='text-xs'>Mock 数据</Badge>
        <span className='text-xs text-muted-foreground'>跟主控 /migrate-from-mmw 一致,但不发任何网络请求</span>
      </div>
      <Stepper current={step} onJump={setStep} />
      <div className='mt-6 space-y-6'>
        {step === 1 && <Step1Overview onNext={goNext} />}
        {step === 2 && <Step2BackupAndStopMmw onBack={goBack} onNext={goNext} autoBackup={autoBackup} setAutoBackup={setAutoBackup} />}
        {step === 3 && <Step3ImportDB onBack={goBack} onNext={goNext} autoBackup={autoBackup} />}
        {step === 4 && <Step4Claim onBack={goBack} onNext={goNext} />}
        {step === 5 && <Step5Verify onBack={goBack} onRestart={() => setStep(1)} />}
      </div>
    </div>
  )
}

// ───────── Stepper ─────────
function Stepper({ current, onJump }: { current: number; onJump: (n: number) => void }) {
  return (
    <div className='flex items-stretch gap-1 rounded-lg border bg-muted/30 p-1 overflow-hidden'>
      {STEPS.map((s, idx) => {
        const Icon = s.icon
        const done = current > s.id
        const active = current === s.id
        const isLast = idx === STEPS.length - 1
        return (
          <div key={s.id} className='flex flex-1 min-w-0 items-stretch'>
            <button
              onClick={() => onJump(s.id)}
              className={cn(
                'flex flex-1 min-w-0 items-center gap-2 rounded-md px-2 py-1.5 text-xs sm:text-sm transition-colors',
                active && 'bg-primary text-primary-foreground',
                !active && done && 'text-primary hover:bg-primary/10',
                !active && !done && 'text-muted-foreground hover:bg-accent'
              )}
            >
              <span
                className={cn(
                  'flex size-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-medium',
                  active && 'border-primary-foreground',
                  !active && done && 'border-primary bg-primary/10',
                  !active && !done && 'border-border'
                )}
              >
                {done ? <CheckCircle2 className='size-4' /> : s.id}
              </span>
              <span className='hidden sm:inline-flex flex-1 min-w-0 items-center gap-1.5'>
                <Icon className='size-3.5 shrink-0' />
                <span className='whitespace-nowrap'>{s.title}</span>
              </span>
            </button>
            {!isLast && (
              <span className='hidden md:flex shrink-0 items-center px-0.5 text-muted-foreground/40'>
                <ArrowRight className='size-3' />
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ───────── Step 1: 概述 ─────────
function Step1Overview({ onNext }: { onNext: () => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>欢迎使用迁移向导</CardTitle>
        <CardDescription>开始前请通读以下要点,确认无误后再进入下一步。</CardDescription>
      </CardHeader>
      <CardContent className='space-y-4 text-sm'>
        <Alert>
          <ShieldCheck className='h-4 w-4' />
          <AlertTitle>迁移保证</AlertTitle>
          <AlertDescription>
            <ul className='ml-4 mt-2 space-y-1 list-disc'>
              <li><strong>客户端订阅 URL 不变</strong> — 用户的 Clash / Shadowrocket 不用改</li>
              <li><strong>xray UUID / password 不变</strong> — 协议层无感切换</li>
              <li><strong>nginx 配置不动</strong> — 反代继续指向同一个端口</li>
              <li><strong>SSL 证书不动</strong> — certbot 不需要重新申请</li>
              <li><strong>mmw 不会被删除</strong> — systemctl 只是停掉服务,失败可回滚</li>
            </ul>
          </AlertDescription>
        </Alert>

        <Alert variant='destructive'>
          <FileWarning className='h-4 w-4' />
          <AlertTitle>前置要求</AlertTitle>
          <AlertDescription>
            <ul className='ml-4 mt-2 space-y-1 list-disc'>
              <li>你已经把妙妙屋X 二进制装好,并通过 systemd 跑在 mmw 同一端口上</li>
              <li>当前 mmwx 数据库<strong>是空的</strong>(无套餐 / 节点 / 用户) — 否则会被 mmw 数据覆盖</li>
              <li>具备 root SSH 访问到部署 mmw 的机器</li>
              <li>所有 mmw 时代的远程节点服务器都已安装 <code className='bg-muted px-1 py-0.5 rounded'>mmw-agent</code> 并接入 mmwx 主控</li>
            </ul>
          </AlertDescription>
        </Alert>

        <div className='rounded-lg border p-4'>
          <h3 className='mb-2 font-medium'>迁移流程概览</h3>
          <ol className='ml-4 space-y-1 text-muted-foreground list-decimal'>
            <li><strong>停止 mmw 并备份</strong> — 防止数据继续变化 + 失败回滚</li>
            <li><strong>导入 mmw.db</strong> — 上传 / 填路径,主控读取并迁移 schema</li>
            <li><strong>认领节点 / 用户</strong> — 把 xray 现有 client 绑定到 mmwx 用户</li>
            <li><strong>验证并完成</strong> — 测一个客户端订阅 URL 是否仍可用</li>
          </ol>
        </div>

        <div className='flex items-center justify-between rounded-md border bg-muted/30 p-3 text-xs'>
          <span className='text-muted-foreground'>读完详细文档 →</span>
          <a
            href='https://miaomiaowux.com/docs/upgrade-from-mmw'
            target='_blank'
            rel='noreferrer'
            className='inline-flex items-center gap-1 text-primary hover:underline'
          >
            升级指南完整版 <ExternalLink className='size-3' />
          </a>
        </div>
      </CardContent>
      <CardContent className='flex justify-end pt-0'>
        <Button onClick={onNext}>
          我已了解,开始 <ArrowRight className='ml-2 size-4' />
        </Button>
      </CardContent>
    </Card>
  )
}

// ───────── Step 2: 备份 + 停服 ─────────
function Step2BackupAndStopMmw({
  onBack,
  onNext,
  autoBackup,
  setAutoBackup,
}: {
  onBack: () => void
  onNext: () => void
  autoBackup: AutoBackup
  setAutoBackup: (b: AutoBackup) => void
}) {
  const [mode, setMode] = useState<'auto' | 'manual'>('auto')

  return (
    <Card>
      <CardHeader>
        <CardTitle>停止 mmw 并备份关键数据</CardTitle>
        <CardDescription>
          这一步要做两件事:① 把妙妙屋数据库备份出来 → ② 停止妙妙屋服务防止数据继续变化。
          可以选择"自动拉取"或"手动操作"。
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='flex items-center gap-2 text-sm'>
          <Button variant={mode === 'auto' ? 'default' : 'outline'} size='sm' onClick={() => setMode('auto')}>
            <Upload className='mr-2 size-4 rotate-180' />自动从妙妙屋拉取备份
          </Button>
          <Button variant={mode === 'manual' ? 'default' : 'outline'} size='sm' onClick={() => setMode('manual')}>
            <Terminal className='mr-2 size-4' />手动备份 + 停服
          </Button>
        </div>

        {mode === 'auto' ? (
          <AutoBackupForm onNext={onNext} autoBackup={autoBackup} setAutoBackup={setAutoBackup} />
        ) : (
          <ManualBackupSteps onNext={onNext} />
        )}
      </CardContent>
      <CardContent className='flex justify-between pt-0'>
        <Button variant='outline' onClick={onBack}>上一步</Button>
      </CardContent>
    </Card>
  )
}

function AutoBackupForm({
  onNext,
  autoBackup,
  setAutoBackup,
}: {
  onNext: () => void
  autoBackup: AutoBackup
  setAutoBackup: (b: AutoBackup) => void
}) {
  const [url, setUrl] = useState('https://mmw.example.com')
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('demo-password')
  const [totp, setTotp] = useState('')
  const [fetching, setFetching] = useState(false)
  const [stopping, setStopping] = useState(false)
  const [stopped, setStopped] = useState(false)
  const result = autoBackup

  const fetchBackup = async () => {
    if (!url.trim() || !username.trim() || !password.trim()) {
      toast.error('请填妙妙屋地址 / 账号 / 密码')
      return
    }
    setFetching(true)
    await mockDelay(1200)
    setAutoBackup(MOCK_BACKUP)
    toast.success(`备份已拉取 (${(MOCK_BACKUP.size_bytes / 1024 / 1024).toFixed(1)} MB, 订阅文件 ${MOCK_BACKUP.subscribe_count} 个)`)
    setFetching(false)
  }

  const stopMmw = async () => {
    setStopping(true)
    await mockDelay(800)
    setStopped(true)
    setStopping(false)
    toast.info('UI 占位 — 妙妙屋自身没有 stop-self API,实际可能引导用户手工执行')
  }

  return (
    <div className='space-y-3'>
      <Alert>
        <ShieldCheck className='h-4 w-4' />
        <AlertTitle>自动拉取做了什么</AlertTitle>
        <AlertDescription className='text-xs mt-1'>
          主控会用你提供的账号登录妙妙屋,调用其 <code className='bg-muted px-1 py-0.5 rounded'>/api/admin/backup/download</code> 接口拉取完整备份(数据库 + 订阅文件)到本地 <code className='bg-muted px-1 py-0.5 rounded'>/tmp/mmwx-migrate/</code>。
          账号密码<strong>不持久化</strong>,只在本次操作中转。
        </AlertDescription>
      </Alert>

      <div className='grid gap-3 sm:grid-cols-2'>
        <div className='space-y-1 sm:col-span-2'>
          <Label className='text-xs'>妙妙屋地址</Label>
          <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder='https://mmw.your-domain.com' disabled={Boolean(result)} />
        </div>
        <div className='space-y-1'>
          <Label className='text-xs'>管理员用户名</Label>
          <Input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete='off' disabled={Boolean(result)} />
        </div>
        <div className='space-y-1'>
          <Label className='text-xs'>密码</Label>
          <Input type='password' value={password} onChange={(e) => setPassword(e.target.value)} autoComplete='new-password' disabled={Boolean(result)} />
        </div>
        <div className='space-y-1 sm:col-span-2'>
          <Label className='text-xs'>两步验证码(若启用)</Label>
          <Input value={totp} onChange={(e) => setTotp(e.target.value)} placeholder='留空 = 未启用 2FA' inputMode='numeric' maxLength={6} disabled={Boolean(result)} />
        </div>
      </div>

      {!result ? (
        <div className='flex justify-end'>
          <Button onClick={fetchBackup} disabled={fetching}>
            {fetching ? (
              <><Loader2 className='mr-2 size-4 animate-spin' />拉取中…</>
            ) : (
              <><Database className='mr-2 size-4' />测试连接 + 拉取备份</>
            )}
          </Button>
        </div>
      ) : (
        <Alert>
          <CheckCircle2 className='h-4 w-4' />
          <AlertTitle>备份已拉取</AlertTitle>
          <AlertDescription className='mt-2 text-xs space-y-1'>
            <div>本地暂存:<code className='bg-muted px-1 py-0.5 rounded'>{result.backup_path}</code></div>
            <div>归档大小:{(result.size_bytes / 1024 / 1024).toFixed(2)} MB · 数据库:{(result.db_size_bytes / 1024 / 1024).toFixed(2)} MB · 订阅文件:{result.subscribe_count} 个</div>
            <div className='text-muted-foreground'>下一步会用这个备份做导入,无需再上传文件。</div>
          </AlertDescription>
        </Alert>
      )}

      {result && (
        <div className='rounded-md border bg-muted/20 p-3 space-y-2'>
          <div className='flex items-center justify-between'>
            <div className='text-sm font-medium'>{stopped ? '✅ 已停止 mmw' : '停止妙妙屋服务'}</div>
            {!stopped && (
              <Button size='sm' variant='secondary' onClick={stopMmw} disabled={stopping}>
                {stopping ? <Loader2 className='size-3.5 animate-spin' /> : null}
                {stopping ? '处理中…' : '尝试自动停服'}
              </Button>
            )}
          </div>
          <p className='text-xs text-muted-foreground'>妙妙屋自身没有"停止自己"的 API。两个选择:</p>
          <ul className='ml-4 list-disc text-xs text-muted-foreground'>
            <li>SSH 到 mmw 服务器手工 <code className='bg-muted px-1 py-0.5 rounded'>systemctl stop mmw</code></li>
            <li>或先继续向下走(导入时主控会再次告知如未停服可能数据不一致)</li>
          </ul>
        </div>
      )}

      <div className='flex justify-end pt-2'>
        <Button onClick={onNext} disabled={!result}>
          继续导入 <ArrowRight className='ml-2 size-4' />
        </Button>
      </div>
    </div>
  )
}

function ManualBackupSteps({ onNext }: { onNext: () => void }) {
  const ts = useMemo(() => '2026-06-07T00-00-00', [])
  const backupCmd = `cp /etc/mmw/mmw.db /etc/mmw/mmw.db.before-mmwx-${ts}`
  const stopCmd = `systemctl stop mmw && systemctl disable mmw`
  const xrayBackupCmd = `cp /usr/local/etc/xray/config.json /usr/local/etc/xray/config.json.before-mmwx-${ts}`

  return (
    <div className='space-y-3'>
      <CommandBlock label='1. 备份 mmw 数据库' hint='路径默认 /etc/mmw/mmw.db,如果你装在别处请改路径' cmd={backupCmd} />
      <CommandBlock label='2. 备份每个 xray 节点服务器的 xray config(在节点机器上执行)' hint='迁移期间不动 xray 配置,但备份是稳妥做法' cmd={xrayBackupCmd} />
      <CommandBlock label='3. 停止并禁用 mmw 服务' hint='mmw 二进制不删,如需回滚:systemctl enable mmw && systemctl start mmw' cmd={stopCmd} />
      <Alert>
        <Terminal className='h-4 w-4' />
        <AlertTitle>验证 mmw 已停止</AlertTitle>
        <AlertDescription className='font-mono text-xs mt-1'>
          systemctl status mmw <span className='text-muted-foreground'># 应显示 inactive (dead)</span>
        </AlertDescription>
      </Alert>
      <div className='flex justify-end pt-2'>
        <Button onClick={onNext}>
          已完成,下一步 <ArrowRight className='ml-2 size-4' />
        </Button>
      </div>
    </div>
  )
}

// ───────── Step 3: 导入 mmw.db ─────────
function Step3ImportDB({ onBack, onNext, autoBackup }: { onBack: () => void; onNext: () => void; autoBackup: AutoBackup }) {
  type ImportMode = 'auto' | 'upload' | 'path'
  const [mode, setMode] = useState<ImportMode>(autoBackup ? 'auto' : 'upload')
  const [file, setFile] = useState<File | null>(null)
  const [dbPath, setDbPath] = useState('/etc/mmw/mmw.db')
  const [importing, setImporting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [report, setReport] = useState<ImportResp | null>(null)
  const [uploaded, setUploaded] = useState<AutoBackup>(null)

  const doUpload = async () => {
    if (!file) {
      toast.error('请先选择妙妙屋备份 zip 文件')
      return
    }
    setUploading(true)
    await mockDelay(1000)
    setUploaded(MOCK_BACKUP)
    toast.success(`上传成功 (${(MOCK_BACKUP.size_bytes / 1024 / 1024).toFixed(1)} MB, 订阅文件 ${MOCK_BACKUP.subscribe_count} 个)`)
    setUploading(false)
  }

  const doImport = async () => {
    setImporting(true)
    await mockDelay(1500)
    setReport(MOCK_IMPORT)
    toast.success(`导入成功(用户 ${MOCK_IMPORT.report.users} · 节点 ${MOCK_IMPORT.report.nodes} · 订阅文件复制 ${MOCK_IMPORT.subscribes_copied})`)
    setImporting(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>导入妙妙屋数据库</CardTitle>
        <CardDescription>
          上传或指定 mmw.db 路径,主控将读取数据并跑迁移。这一步是<strong>幂等</strong>的,失败可重试。
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='flex items-center gap-2 text-sm flex-wrap'>
          {autoBackup && (
            <Button variant={mode === 'auto' ? 'default' : 'outline'} size='sm' onClick={() => setMode('auto')}>
              <CheckCircle2 className='mr-2 size-4' />使用上一步拉取的备份
            </Button>
          )}
          <Button variant={mode === 'upload' ? 'default' : 'outline'} size='sm' onClick={() => setMode('upload')}>
            <Upload className='mr-2 size-4' />上传文件
          </Button>
          <Button variant={mode === 'path' ? 'default' : 'outline'} size='sm' onClick={() => setMode('path')}>
            <Terminal className='mr-2 size-4' />指定服务器路径
          </Button>
        </div>

        {mode === 'auto' && autoBackup ? (
          <Alert>
            <Database className='h-4 w-4' />
            <AlertTitle>来源:上一步自动拉取</AlertTitle>
            <AlertDescription className='mt-2 text-xs space-y-1'>
              <div>db 路径:<code className='bg-muted px-1 py-0.5 rounded'>{autoBackup.db_path}</code></div>
              <div>数据库:{(autoBackup.db_size_bytes / 1024 / 1024).toFixed(2)} MB · 订阅文件:{autoBackup.subscribe_count} 个</div>
              <div className='text-muted-foreground'>点"开始导入"即可,无需再上传文件。</div>
            </AlertDescription>
          </Alert>
        ) : mode === 'upload' ? (
          <div className='space-y-2'>
            <Label>选择妙妙屋备份(.zip)</Label>
            <p className='text-[11px] text-muted-foreground'>
              在妙妙屋后台「设置 → 备份」点击「下载备份」拿到的 .zip 文件,内含 <code className='bg-muted px-1 py-0.5 rounded'>data/mmw.db</code> 和 <code className='bg-muted px-1 py-0.5 rounded'>subscribes/</code>
            </p>
            <div className='flex items-center gap-2'>
              <Input
                type='file'
                accept='.zip'
                onChange={(e) => { setFile(e.target.files?.[0] ?? null); setUploaded(null) }}
                disabled={uploading || Boolean(uploaded)}
                className='flex-1'
              />
              {!uploaded && (
                <Button onClick={doUpload} disabled={uploading || !file} size='sm'>
                  {uploading ? <><Loader2 className='mr-2 size-4 animate-spin' />上传中…</> : <><Upload className='mr-2 size-4' />上传 + 解压</>}
                </Button>
              )}
            </div>
            {file && !uploaded && (
              <p className='text-xs text-muted-foreground'>已选:{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</p>
            )}
            {uploaded && (
              <Alert>
                <CheckCircle2 className='h-4 w-4' />
                <AlertTitle>上传成功</AlertTitle>
                <AlertDescription className='text-xs mt-1 space-y-1'>
                  <div>db:<code className='bg-muted px-1 py-0.5 rounded'>{uploaded.db_path}</code> ({(uploaded.db_size_bytes / 1024 / 1024).toFixed(2)} MB)</div>
                  <div>subscribes 文件:{uploaded.subscribe_count} 个</div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        ) : (
          <div className='space-y-2'>
            <Label>mmw.db 路径(主控服务器本地路径)</Label>
            <Input value={dbPath} onChange={(e) => setDbPath(e.target.value)} placeholder='/etc/mmw/mmw.db' className='font-mono text-sm' />
            <p className='text-xs text-muted-foreground'>主控会以读模式打开该文件;若主控和 mmw 不在同一台机器,请用"上传文件"模式</p>
          </div>
        )}

        <Alert>
          <Database className='h-4 w-4' />
          <AlertTitle>迁移会做什么</AlertTitle>
          <AlertDescription>
            <ul className='ml-4 mt-2 space-y-1 list-disc text-xs'>
              <li>读 mmw <code className='bg-muted px-1 py-0.5 rounded'>users / nodes / subscribe_files / packages / user_subscriptions / templates / custom_rules / override_scripts</code> 数据</li>
              <li>按 mmwx schema 写入主控数据库(自动 ALTER TABLE 补齐缺失列)</li>
              <li>把 mmw 来源节点的 <code className='bg-muted px-1 py-0.5 rounded'>tag</code> 改为 <code className='bg-muted px-1 py-0.5 rounded'>'妙妙屋迁移'</code></li>
              <li>把 mmw 用户的多绑定订阅合并为单一套餐 <code className='bg-muted px-1 py-0.5 rounded'>{'<username>-merged'}</code></li>
              <li><strong>不动</strong> xray 配置 / 远程服务器 / inbound clients</li>
            </ul>
          </AlertDescription>
        </Alert>

        {report && (
          <Alert>
            <CheckCircle2 className='h-4 w-4' />
            <AlertTitle>导入完成</AlertTitle>
            <AlertDescription className='mt-2 space-y-2 text-xs'>
              <div className='grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5'>
                <ReportItem label='用户' value={report.report.users} />
                <ReportItem label='用户短码/Token' value={report.report.user_tokens} />
                <ReportItem label='节点' value={report.report.nodes} />
                <ReportItem label='订阅文件' value={report.report.subscribe_files} />
                <ReportItem label='用户-订阅' value={report.report.user_subscriptions} />
                <ReportItem label='用户设置' value={report.report.user_settings} />
                <ReportItem label='模板' value={report.report.templates} />
                <ReportItem label='覆写规则' value={report.report.custom_rules} />
                <ReportItem label='覆写脚本' value={report.report.override_scripts} />
                <ReportItem label='外部订阅' value={report.report.external_subscriptions} />
                <ReportItem label='订阅文件复制' value={report.subscribes_copied} />
              </div>
              <div className='rounded border bg-muted/30 p-2 space-y-0.5'>
                <div>订阅文件 / 模板的归属设为管理员:<code className='bg-muted px-1 py-0.5 rounded'>{report.owned_by_admin}</code></div>
                <div className='text-muted-foreground'>数字为<strong>新增</strong>行数;已存在的同名 / 同 id 行按 INSERT OR IGNORE 跳过。</div>
              </div>
              {report.subscribes_skipped.length > 0 && (
                <div className='rounded border bg-muted/30 p-2'>
                  <div className='font-medium'>跳过的订阅文件(同名已存在):</div>
                  <div className='text-muted-foreground font-mono'>{report.subscribes_skipped.join(', ')}</div>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardContent className='flex justify-between pt-0'>
        <Button variant='outline' onClick={onBack}>上一步</Button>
        <div className='flex gap-2'>
          <Button variant='secondary' onClick={doImport} disabled={importing}>
            {importing ? <><Loader2 className='mr-2 size-4 animate-spin' />导入中…</> : <><Database className='mr-2 size-4' />开始导入</>}
          </Button>
          <Button onClick={onNext} disabled={!report}>
            下一步 <ArrowRight className='ml-2 size-4' />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function ReportItem({ label, value }: { label: string; value: number }) {
  return (
    <div className='rounded border bg-background p-2'>
      <div className='text-muted-foreground text-[10px]'>{label}</div>
      <div className='font-semibold'>{value}</div>
    </div>
  )
}

// ───────── Step 4: 认领节点 ─────────
function Step4Claim({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  const [loading, setLoading] = useState(false)
  const [servers, setServers] = useState<DistinctServer[]>([])
  const [patching, setPatching] = useState(false)
  const [patchResult, setPatchResult] = useState<PatchClientEmailsResp | null>(null)
  const [takingOver, setTakingOver] = useState(false)
  const [takeoverResult, setTakeoverResult] = useState<TakeoverResp | null>(null)

  const load = async () => {
    setLoading(true)
    await mockDelay(600)
    setServers(MOCK_SERVERS)
    setLoading(false)
  }

  const takeoverXray = async () => {
    setTakingOver(true)
    await mockDelay(1500)
    setTakeoverResult(MOCK_TAKEOVER)
    const detected = MOCK_TAKEOVER.results.filter((r) => r.detected).length
    toast.success(`扫描 ${MOCK_TAKEOVER.servers_scanned} 个服务器,${detected} 个发现外置 xray 并已合并接管`)
    setTakingOver(false)
  }

  const patchEmails = async () => {
    setPatching(true)
    await mockDelay(1200)
    setPatchResult(MOCK_PATCH)
    const newAdminLinks = MOCK_PATCH.admin_subaccounts_linked.filter((a) => a.was_new).length
    toast.success(`已扫描 ${MOCK_PATCH.servers_scanned} 个服务器,补 email ${MOCK_PATCH.clients_patched.length} 个 · 绑定到管理员 ${newAdminLinks} 个`)
    setPatching(false)
  }

  useEffect(() => { void load() }, [])

  const totalNodes = servers.reduce((s, x) => s + x.node_count, 0)
  const linkedCount = servers.filter((s) => s.existing_server).length

  return (
    <Card>
      <CardHeader>
        <CardTitle>添加远程服务器并安装 Agent</CardTitle>
        <CardDescription>
          妙妙屋只是个 Clash 订阅工具,没有"远程服务器 / xray 入站"的概念。
          要让从妙妙屋导入的节点变成<strong>受管节点</strong>(能查流量 / 限速 / 路由出站),
          需要为每个节点指向的服务器地址装上 mmw-agent;agent 接入后,主控会自动扫描其 xray inbound 并与节点凭据匹配。
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4 text-sm'>
        <div className='flex items-center gap-3 rounded-md border bg-muted/30 p-3 text-xs'>
          <Database className='size-4 shrink-0' />
          <div className='flex-1 min-w-0'>
            <div>
              扫描到 <strong>{servers.length}</strong> 个去重 server 地址,共 <strong>{totalNodes}</strong> 个节点;
              其中 <strong>{linkedCount}</strong> 个已在 mmwx 服务管理里存在。
            </div>
            <div className='text-muted-foreground mt-1'>所有去重统计均按 mmw nodes 表的 server 字段(或解析 link)。</div>
          </div>
          <Button size='sm' variant='outline' onClick={load} disabled={loading}>
            {loading ? <Loader2 className='size-3.5 animate-spin' /> : '刷新'}
          </Button>
        </div>

        {servers.length === 0 && !loading ? (
          <Alert>
            <CheckCircle2 className='h-4 w-4' />
            <AlertTitle>没有待处理的服务器</AlertTitle>
            <AlertDescription>所有节点都已关联到 mmwx 的远程服务器。可以直接跳到下一步。</AlertDescription>
          </Alert>
        ) : (
          <div className='space-y-2 max-h-[420px] overflow-y-auto'>
            {servers.map((s) => (
              <ServerRow
                key={s.address}
                server={s}
                onAdded={() => setServers((prev) =>
                  prev.map((x) => (x.address === s.address ? { ...x, existing_server: true, existing_server_id: 999 } : x))
                )}
              />
            ))}
          </div>
        )}

        {/* 接管外置 xray */}
        <div className='rounded-md border p-3 space-y-2'>
          <div className='flex items-center justify-between gap-2 flex-wrap'>
            <div>
              <div className='text-sm font-medium'>① 接管外置 xray(合并多片配置)</div>
              <p className='text-xs text-muted-foreground'>
                妙妙屋时代的 xray 一般通过 <code className='bg-muted px-1 py-0.5 rounded'>-config FILE -confdir DIR</code> 多片启动。mmwx 主控只读写单一 config 文件,需要先合并。
              </p>
              <ul className='text-xs text-muted-foreground ml-4 list-disc mt-1'>
                <li>探测正在跑的 xray + 解析 ExecStart</li>
                <li>把 confdir 里所有 *.json 按字母序合并进主 config</li>
                <li>备份 confdir 到 <code className='bg-muted px-1 py-0.5 rounded'>.mmwx-bak-&lt;ts&gt;/</code></li>
                <li>重启 xray</li>
              </ul>
            </div>
            <Button size='sm' onClick={takeoverXray} disabled={takingOver}>
              {takingOver ? <><Loader2 className='mr-2 size-4 animate-spin' />扫描中…</> : <><Terminal className='mr-2 size-4' />扫描并接管</>}
            </Button>
          </div>

          {takeoverResult && (
            <div className='space-y-2 pt-2 text-xs border-t'>
              <div className='grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2'>
                <ReportItem label='扫描服务器' value={takeoverResult.servers_scanned} />
                <ReportItem label='发现外置 xray' value={takeoverResult.results.filter((r) => r.detected).length} />
                <ReportItem label='重启成功' value={takeoverResult.results.filter((r) => r.restarted).length} />
              </div>
              <details className='rounded border bg-muted/30 p-2' open>
                <summary className='cursor-pointer font-medium'>每台服务器详情</summary>
                <table className='mt-2 w-full text-[11px]'>
                  <thead className='text-muted-foreground'>
                    <tr>
                      <th className='text-left py-1 pr-2'>服务器</th>
                      <th className='text-left py-1 pr-2'>状态</th>
                      <th className='text-left py-1 pr-2'>config / confdir</th>
                      <th className='text-left py-1'>合并/重启</th>
                    </tr>
                  </thead>
                  <tbody>
                    {takeoverResult.results.map((r, i) => (
                      <tr key={i} className='border-t border-muted'>
                        <td className='py-1 pr-2'>{r.server_name}</td>
                        <td className='py-1 pr-2'>
                          {r.error ? <span className='text-destructive'>错误</span>
                            : r.detected ? <span className='text-primary'>已接管</span>
                            : <span className='text-muted-foreground'>未检测到外置</span>}
                        </td>
                        <td className='py-1 pr-2 font-mono'>
                          {r.config_path && <div>{r.config_path}</div>}
                          {r.conf_dir && <div className='text-muted-foreground'>{r.conf_dir}</div>}
                        </td>
                        <td className='py-1'>{r.merged_files} 个 / {r.restarted ? '✓' : '✗'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </details>
            </div>
          )}
        </div>

        {/* 补 email */}
        <div className='rounded-md border p-3 space-y-2'>
          <div className='flex items-center justify-between gap-2 flex-wrap'>
            <div>
              <div className='text-sm font-medium'>② 扫描并补 xray client email</div>
              <p className='text-xs text-muted-foreground'>
                Agent 接入后,对所有 inbound 的 client 检查 <code className='bg-muted px-1 py-0.5 rounded'>email</code> 字段;没填的补成管理员用户名,后续才能按 email 做流量统计 / routing 限定。
              </p>
            </div>
            <Button size='sm' onClick={patchEmails} disabled={patching}>
              {patching ? <><Loader2 className='mr-2 size-4 animate-spin' />扫描中…</> : <><ShieldCheck className='mr-2 size-4' />开始扫描 + 补 email</>}
            </Button>
          </div>

          {patchResult && (
            <div className='space-y-2 pt-2 text-xs border-t'>
              <div className='grid grid-cols-2 sm:grid-cols-5 gap-2 mt-2'>
                <ReportItem label='扫描服务器' value={patchResult.servers_scanned} />
                <ReportItem label='Inbound 总数' value={patchResult.inbounds_total} />
                <ReportItem label='补 email Client' value={patchResult.clients_patched.length} />
                <ReportItem label='绑管理员(新)' value={patchResult.admin_subaccounts_linked.filter((a) => a.was_new).length} />
                <ReportItem label='SS2022 Inbound' value={patchResult.ss2022_inbounds.length} />
              </div>

              {patchResult.clients_patched.length > 0 && (
                <details className='rounded border bg-muted/30 p-2'>
                  <summary className='cursor-pointer font-medium'>补了 email 的 client 列表 ({patchResult.clients_patched.length})</summary>
                  <table className='mt-2 w-full text-[11px]'>
                    <thead className='text-muted-foreground'>
                      <tr>
                        <th className='text-left py-1 pr-2'>服务器</th>
                        <th className='text-left py-1 pr-2'>Inbound Tag</th>
                        <th className='text-left py-1'>新 email</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patchResult.clients_patched.map((c, i) => (
                        <tr key={i} className='border-t border-muted'>
                          <td className='py-1 pr-2'>{c.server_name}</td>
                          <td className='py-1 pr-2 font-mono'>{c.inbound_tag}</td>
                          <td className='py-1 font-mono'>{c.new_email}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </details>
              )}

              {patchResult.ss2022_inbounds.length > 0 && (
                <div className='rounded border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950 p-2 space-y-1'>
                  <div className='font-medium text-amber-800 dark:text-amber-200'>
                    ⚠ {patchResult.ss2022_inbounds.length} 个 SS2022 inbound 已更新,客户端订阅需重新拉取
                  </div>
                  <p className='text-amber-700 dark:text-amber-300'>
                    SS2022 协议给 client 加 email 后,主控生成的订阅会按拼接形式输出,旧订阅密码会失效 → <strong>必须重新拉一次订阅</strong>。
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <Alert>
          <FileWarning className='h-4 w-4' />
          <AlertTitle>这一步可以稍后做</AlertTitle>
          <AlertDescription className='text-xs'>
            不做这一步:导入的节点仍能在订阅里正常使用(uuid / 密码全保留,客户端无感)。
            做这一步:让节点流量统计、限速、路由出站等高级能力生效。
          </AlertDescription>
        </Alert>
      </CardContent>
      <CardContent className='flex justify-between pt-0'>
        <Button variant='outline' onClick={onBack}>上一步</Button>
        <Button onClick={onNext}>
          下一步 <ArrowRight className='ml-2 size-4' />
        </Button>
      </CardContent>
    </Card>
  )
}

function ServerRow({ server, onAdded }: { server: DistinctServer; onAdded: () => void }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <div className='rounded-md border p-3 space-y-2'>
        <div className='flex items-center justify-between gap-2 flex-wrap'>
          <div className='flex items-center gap-2 min-w-0'>
            <Database className='size-4 shrink-0 text-muted-foreground' />
            <span className='font-mono text-sm truncate'>{server.address}</span>
            {server.existing_server ? (
              <Badge variant='outline' className='text-[10px] border-primary text-primary'>已添加</Badge>
            ) : (
              <Badge variant='outline' className='text-[10px]'>待添加</Badge>
            )}
          </div>
          <div className='flex items-center gap-2'>
            {server.existing_server ? (
              <Button size='sm' variant='outline' disabled>
                查看
              </Button>
            ) : (
              <Button size='sm' onClick={() => setOpen(true)}>
                去添加 <ArrowRight className='ml-1 size-3' />
              </Button>
            )}
          </div>
        </div>
        <div className='flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground'>
          <span>节点数:<strong className='text-foreground'>{server.node_count}</strong></span>
          {server.ports.length > 0 && <span>端口:{[...server.ports].sort((a, b) => a - b).join(' / ')}</span>}
          {server.protocols.length > 0 && <span>协议:{server.protocols.join(' / ')}</span>}
          {server.sample_node_name && <span className='truncate'>样例:{server.sample_node_name}</span>}
        </div>
      </div>
      <AddServerDialog
        open={open}
        onOpenChange={setOpen}
        defaultAddress={server.address}
        defaultName={server.sample_node_name || server.address}
        onAdded={() => { setOpen(false); onAdded() }}
      />
    </>
  )
}

function AddServerDialog({
  open,
  onOpenChange,
  defaultAddress,
  defaultName,
  onAdded,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  defaultAddress: string
  defaultName: string
  onAdded: () => void
}) {
  const [name, setName] = useState(defaultName)
  const [address, setAddress] = useState(defaultAddress)
  const [submitting, setSubmitting] = useState(false)

  // 重新打开时把字段重置成新 server 的默认值
  useEffect(() => {
    if (open) {
      setName(defaultName)
      setAddress(defaultAddress)
    }
  }, [open, defaultName, defaultAddress])

  const submit = async () => {
    if (!name.trim() || !address.trim()) {
      toast.error('请填名称与地址')
      return
    }
    setSubmitting(true)
    await mockDelay(800)
    toast.success(`服务器 "${name}" 已添加,等待 Agent 接入`)
    setSubmitting(false)
    onAdded()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>添加远程服务器</DialogTitle>
          <DialogDescription>添加后会自动生成一次性 Agent 配对 Token,在该服务器上执行一键命令即可接入。</DialogDescription>
        </DialogHeader>
        <div className='space-y-3'>
          <div className='space-y-1'>
            <Label>名称</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className='space-y-1'>
            <Label>地址</Label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} className='font-mono text-sm' />
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={submit} disabled={submitting}>
            {submitting ? <><Loader2 className='mr-2 size-4 animate-spin' />添加中…</> : <>添加 + 生成 Token <ArrowRight className='ml-2 size-4' /></>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ───────── Step 5: 验证 ─────────
function Step5Verify({ onBack, onRestart }: { onBack: () => void; onRestart: () => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>验证并完成</CardTitle>
        <CardDescription>确认核心能力可用,然后回到正常的妙妙屋X 工作流。</CardDescription>
      </CardHeader>
      <CardContent className='space-y-4 text-sm'>
        <ChecklistItem title='主控访问正常' desc='你能看到这一页,说明 https://your-domain 已经指向 mmwx,nginx + SSL 都没问题' done />
        <ChecklistItem title='节点列表恢复' desc='去「节点管理」页面,应看到原 mmw 节点(tag 显示「妙妙屋迁移」)' />
        <ChecklistItem title='用户与套餐恢复' desc='去「用户管理」/「套餐管理」,应看到原 mmw 用户及自动生成的套餐' />
        <ChecklistItem title='抽测一个客户端订阅' desc='复制订阅 URL 在 Clash/Shadowrocket 中刷新,应能正常拉到节点' />
        <ChecklistItem title='Agent 版本检查' desc='所有 mmw 节点服务器已安装 mmw-agent 0.1.x+(支持用户路由出站功能)' />

        <Separator />

        <Alert>
          <ShieldCheck className='h-4 w-4' />
          <AlertTitle>回滚预案(若发现问题)</AlertTitle>
          <AlertDescription>
            <ol className='ml-4 mt-2 space-y-1 list-decimal text-xs'>
              <li><code className='bg-muted px-1 py-0.5 rounded'>systemctl stop mmwx</code></li>
              <li><code className='bg-muted px-1 py-0.5 rounded'>systemctl start mmw</code></li>
              <li>mmw 数据库 / xray 配置全程未被修改,客户端立即恢复</li>
              <li>把问题截图 / 日志反馈给我们再重新尝试迁移</li>
            </ol>
          </AlertDescription>
        </Alert>
      </CardContent>
      <CardContent className='flex justify-between pt-0'>
        <Button variant='outline' onClick={onBack}>上一步</Button>
        <Button onClick={onRestart}>
          重新走一遍演示 <ArrowRight className='ml-2 size-4' />
        </Button>
      </CardContent>
    </Card>
  )
}

function ChecklistItem({ title, desc, done }: { title: string; desc: string; done?: boolean }) {
  return (
    <div className='flex items-start gap-3 rounded-md border p-3'>
      {done ? (
        <CheckCircle2 className='size-5 shrink-0 text-primary mt-0.5' />
      ) : (
        <Circle className='size-5 shrink-0 text-muted-foreground mt-0.5' />
      )}
      <div className='flex-1 min-w-0'>
        <div className='text-sm font-medium'>{title}</div>
        <div className='text-xs text-muted-foreground mt-0.5'>{desc}</div>
      </div>
    </div>
  )
}

// ───────── 可复用:CommandBlock ─────────
function CommandBlock({ label, hint, cmd }: { label: string; hint?: string; cmd: string }) {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(cmd)
      toast.success('已复制')
    } catch {
      toast.error('复制失败,请手动选择')
    }
  }
  return (
    <div className='space-y-1'>
      <div className='flex items-center justify-between'>
        <Label className='text-sm'>{label}</Label>
        <Button variant='ghost' size='sm' className='h-7' onClick={copy}>
          <Copy className='mr-1 size-3.5' />复制
        </Button>
      </div>
      {hint && <p className='text-[11px] text-muted-foreground'>{hint}</p>}
      <pre className='rounded border bg-muted/40 p-3 text-xs font-mono overflow-x-auto'>{cmd}</pre>
    </div>
  )
}
