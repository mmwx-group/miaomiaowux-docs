// 系统设置 mock — 复刻 mmwx 主控 /system-settings 页面的全部 Card。
// 每个 Card 含真实字段 + 详细说明 + 保存按钮(本地 mock,不发请求)。
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  RefreshCw,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Clock,
  KeyRound,
  Crown,
  Save,
  RotateCcw,
  Eye,
  EyeOff,
  Copy,
  HelpCircle,
  Globe,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

function fakeToken() {
  let s = ''
  for (let i = 0; i < 48; i++) s += 'abcdef0123456789'[Math.floor(Math.random() * 16)]
  return s
}

function MockToken() {
  return useState(fakeToken())
}

export function SystemSettingsDemo() {
  const { t } = useTranslation('xdocs')
  return (
    <div className='rounded-xl border-2 border-dashed bg-card p-4 sm:p-6 space-y-4'>
      <div className='flex items-center gap-2 mb-2'>
        <Badge variant='outline' className='text-xs'>{t('systemSettings.demo.badge')}</Badge>
        <span className='text-xs text-muted-foreground'>{t('systemSettings.demo.intro')}</span>
      </div>

      <SyncCard />
      <SystemCard />
      <SecurityThresholdsCard />
      <TurnstileCard />
      <ScheduleCard />
      <MasterUrlCard />
      <ApiTokenCard />
      <LicenseCard />
    </div>
  )
}

// ───── 1. 订阅同步 ─────
function SyncCard() {
  const { t } = useTranslation('xdocs')
  const [syncTraffic, setSyncTraffic] = useState(true)
  const [nodeFilter, setNodeFilter] = useState('')
  const [appendSubInfo, setAppendSubInfo] = useState(true)
  const [forceSyncExternal, setForceSyncExternal] = useState(false)
  const [matchRule, setMatchRule] = useState<'name' | 'serverPort' | 'typeServerPort'>('typeServerPort')
  const [syncScope, setSyncScope] = useState<'savedOnly' | 'all'>('savedOnly')
  const [keepNodeName, setKeepNodeName] = useState(true)
  const [cacheMin, setCacheMin] = useState('30')

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <RefreshCw className='size-5 text-primary' />
          {t('systemSettings.demo.sync.title')}
        </CardTitle>
        <CardDescription>{t('systemSettings.demo.sync.desc')}</CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <Row label={t('systemSettings.demo.sync.syncTraffic')} hint={t('systemSettings.demo.sync.syncTrafficHint')}>
          <Switch checked={syncTraffic} onCheckedChange={setSyncTraffic} />
        </Row>

        <FieldRow label={t('systemSettings.demo.sync.nodeNameFilter')} hint={t('systemSettings.demo.sync.nodeNameFilterDesc')}>
          <Input value={nodeFilter} onChange={(e) => setNodeFilter(e.target.value)} placeholder='剩余流量|官网|套餐到期' />
        </FieldRow>

        <Row label={t('systemSettings.demo.sync.appendSubInfo')} hint={t('systemSettings.demo.sync.appendSubInfoHint')}>
          <Switch checked={appendSubInfo} onCheckedChange={setAppendSubInfo} />
        </Row>

        <Row label={t('systemSettings.demo.sync.forceSyncExternal')} hint={t('systemSettings.demo.sync.forceSyncExternalHint')}>
          <Switch checked={forceSyncExternal} onCheckedChange={setForceSyncExternal} />
        </Row>

        <div className='space-y-2'>
          <Label className='text-sm font-semibold'>{t('systemSettings.demo.sync.matchRule')}</Label>
          <RadioGroup value={matchRule} onValueChange={(v) => setMatchRule(v as 'name' | 'serverPort' | 'typeServerPort')} className='flex flex-wrap gap-4'>
            <RadioInline value='name'           id='mr-1' label={t('systemSettings.demo.sync.matchByName')} />
            <RadioInline value='serverPort'     id='mr-2' label={t('systemSettings.demo.sync.matchByServerPort')} />
            <RadioInline value='typeServerPort' id='mr-3' label={t('systemSettings.demo.sync.matchByTypeServerPort')} />
          </RadioGroup>
          <p className='text-xs text-muted-foreground'>{t('systemSettings.demo.sync.matchRuleHint')}</p>
        </div>

        <div className='space-y-2'>
          <Label className='text-sm font-semibold'>{t('systemSettings.demo.sync.syncScope')}</Label>
          <RadioGroup value={syncScope} onValueChange={(v) => setSyncScope(v as 'savedOnly' | 'all')} className='flex gap-4'>
            <RadioInline value='savedOnly' id='ss-1' label={t('systemSettings.demo.sync.scopeSavedOnly')} />
            <RadioInline value='all'       id='ss-2' label={t('systemSettings.demo.sync.scopeAll')} />
          </RadioGroup>
        </div>

        <Row label={t('systemSettings.demo.sync.keepNodeName')} hint={t('systemSettings.demo.sync.keepNodeNameHint')}>
          <Switch checked={keepNodeName} onCheckedChange={setKeepNodeName} />
        </Row>

        <FieldRow label={t('systemSettings.demo.sync.cacheExpire')} hint={t('systemSettings.demo.sync.cacheExpireHint')}>
          <Input type='number' value={cacheMin} onChange={(e) => setCacheMin(e.target.value)} className='w-32' />
        </FieldRow>

        <SaveButton />
      </CardContent>
    </Card>
  )
}

// ───── 2. 系统设置(各种开关) ─────
function SystemCard() {
  const { t } = useTranslation('xdocs')
  const [shortLink, setShortLink] = useState(true)
  const [overrideScripts, setOverrideScripts] = useState(true)
  const [mmwFeatures, setMmwFeatures] = useState(false)
  const [mmwShortLinkCompat, setMmwShortLinkCompat] = useState(false)
  const [nodeMultPrefix, setNodeMultPrefix] = useState(false)
  const [leftSep, setLeftSep] = useState('[')
  const [rightSep, setRightSep] = useState(']')

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Settings className='size-5 text-primary' />
          {t('systemSettings.demo.system.title')}
        </CardTitle>
        <CardDescription>{t('systemSettings.demo.system.desc')}</CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <Row label={t('systemSettings.demo.system.shortLink')} hint={t('systemSettings.demo.system.shortLinkHint')}>
          <Switch checked={shortLink} onCheckedChange={setShortLink} />
        </Row>
        <Row label={t('systemSettings.demo.system.overrideScripts')} hint={t('systemSettings.demo.system.overrideScriptsHint')}>
          <Switch checked={overrideScripts} onCheckedChange={setOverrideScripts} />
        </Row>
        <Row label={t('systemSettings.demo.system.mmwFeatures')} hint={t('systemSettings.demo.system.mmwFeaturesHint')}>
          <Switch checked={mmwFeatures} onCheckedChange={setMmwFeatures} />
        </Row>
        <Row label={t('systemSettings.demo.system.mmwShortLinkCompat')} hint={t('systemSettings.demo.system.mmwShortLinkCompatHint')}>
          <Switch checked={mmwShortLinkCompat} onCheckedChange={setMmwShortLinkCompat} />
        </Row>

        <div className='space-y-2'>
          <Row label={t('systemSettings.demo.system.nodeMultPrefix')} hint={t('systemSettings.demo.system.nodeMultPrefixHint')}>
            <Switch checked={nodeMultPrefix} onCheckedChange={setNodeMultPrefix} />
          </Row>
          {nodeMultPrefix && (
            <div className='ml-6 grid grid-cols-2 gap-2'>
              <div className='space-y-1'>
                <Label className='text-xs text-muted-foreground'>{t('systemSettings.demo.system.leftSep')}</Label>
                <Input value={leftSep} onChange={(e) => setLeftSep(e.target.value)} className='w-20' />
              </div>
              <div className='space-y-1'>
                <Label className='text-xs text-muted-foreground'>{t('systemSettings.demo.system.rightSep')}</Label>
                <Input value={rightSep} onChange={(e) => setRightSep(e.target.value)} className='w-20' />
              </div>
            </div>
          )}
        </div>

        <SaveButton />
      </CardContent>
    </Card>
  )
}

// ───── 3. 安全阈值 ─────
function SecurityThresholdsCard() {
  const { t } = useTranslation('xdocs')
  const [maxAttempts, setMaxAttempts] = useState('5')
  const [lockMinutes, setLockMinutes] = useState('15')
  const [tokenTtl, setTokenTtl] = useState('168')
  const [require2fa, setRequire2fa] = useState(false)

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <ShieldAlert className='size-5 text-amber-500' />
          {t('systemSettings.demo.security.title')}
        </CardTitle>
        <CardDescription>{t('systemSettings.demo.security.desc')}</CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <FieldRow label={t('systemSettings.demo.security.maxAttempts')} hint={t('systemSettings.demo.security.maxAttemptsHint')}>
          <Input type='number' value={maxAttempts} onChange={(e) => setMaxAttempts(e.target.value)} className='w-32' />
        </FieldRow>
        <FieldRow label={t('systemSettings.demo.security.lockMinutes')} hint={t('systemSettings.demo.security.lockMinutesHint')}>
          <Input type='number' value={lockMinutes} onChange={(e) => setLockMinutes(e.target.value)} className='w-32' />
        </FieldRow>
        <FieldRow label={t('systemSettings.demo.security.tokenTtl')} hint={t('systemSettings.demo.security.tokenTtlHint')}>
          <Input type='number' value={tokenTtl} onChange={(e) => setTokenTtl(e.target.value)} className='w-32' />
        </FieldRow>
        <Row label={t('systemSettings.demo.security.require2fa')} hint={t('systemSettings.demo.security.require2faHint')}>
          <Switch checked={require2fa} onCheckedChange={setRequire2fa} />
        </Row>
        <SaveButton />
      </CardContent>
    </Card>
  )
}

// ───── 4. Cloudflare Turnstile ─────
function TurnstileCard() {
  const { t } = useTranslation('xdocs')
  const [siteKey, setSiteKey] = useState('1x00000000000000000000AA')
  const [secret, setSecret] = useState('1x0000000000000000000000000000000AA')
  const [enabled, setEnabled] = useState(true)
  const [reveal, setReveal] = useState(false)

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <ShieldCheck className='size-5 text-primary' />
          {t('systemSettings.demo.turnstile.title')}
        </CardTitle>
        <CardDescription>{t('systemSettings.demo.turnstile.desc')}</CardDescription>
      </CardHeader>
      <CardContent className='space-y-3'>
        <Row label={t('systemSettings.demo.turnstile.enable')} hint={t('systemSettings.demo.turnstile.enableHint')}>
          <Switch checked={enabled} onCheckedChange={setEnabled} />
        </Row>
        <FieldRow label={t('systemSettings.demo.turnstile.siteKey')} hint={t('systemSettings.demo.turnstile.siteKeyHint')}>
          <Input value={siteKey} onChange={(e) => setSiteKey(e.target.value)} className='font-mono text-xs' />
        </FieldRow>
        <FieldRow label={t('systemSettings.demo.turnstile.secret')} hint={t('systemSettings.demo.turnstile.secretHint')}>
          <div className='flex gap-1'>
            <Input
              type={reveal ? 'text' : 'password'}
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              className='font-mono text-xs'
            />
            <Button size='icon' variant='ghost' onClick={() => setReveal(!reveal)} className='size-9 shrink-0'>
              {reveal ? <EyeOff className='size-4' /> : <Eye className='size-4' />}
            </Button>
          </div>
        </FieldRow>
        <SaveButton />
      </CardContent>
    </Card>
  )
}

// ───── 5. 定时任务 ─────
function ScheduleCard() {
  const { t } = useTranslation('xdocs')
  const [trafficResetCron, setTrafficResetCron] = useState('0 0 1 * *')
  const [cleanupCron, setCleanupCron] = useState('0 3 * * *')
  const [nodeSyncCron, setNodeSyncCron] = useState('*/30 * * * *')

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Clock className='size-5 text-primary' />
          {t('systemSettings.demo.schedule.title')}
        </CardTitle>
        <CardDescription>{t('systemSettings.demo.schedule.desc')}</CardDescription>
      </CardHeader>
      <CardContent className='space-y-3'>
        <FieldRow label={t('systemSettings.demo.schedule.trafficReset')} hint={t('systemSettings.demo.schedule.trafficResetHint')}>
          <Input value={trafficResetCron} onChange={(e) => setTrafficResetCron(e.target.value)} className='font-mono text-sm' />
        </FieldRow>
        <FieldRow label={t('systemSettings.demo.schedule.cleanup')} hint={t('systemSettings.demo.schedule.cleanupHint')}>
          <Input value={cleanupCron} onChange={(e) => setCleanupCron(e.target.value)} className='font-mono text-sm' />
        </FieldRow>
        <FieldRow label={t('systemSettings.demo.schedule.nodeSync')} hint={t('systemSettings.demo.schedule.nodeSyncHint')}>
          <Input value={nodeSyncCron} onChange={(e) => setNodeSyncCron(e.target.value)} className='font-mono text-sm' />
        </FieldRow>
        <SaveButton />
      </CardContent>
    </Card>
  )
}

// ───── 6. 主控地址 ─────
function MasterUrlCard() {
  const { t } = useTranslation('xdocs')
  const [url, setUrl] = useState('https://mmwx.example.com')

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Globe className='size-5 text-primary' />
          {t('systemSettings.demo.masterUrl.title')}
        </CardTitle>
        <CardDescription>{t('systemSettings.demo.masterUrl.desc')}</CardDescription>
      </CardHeader>
      <CardContent className='space-y-3'>
        <FieldRow label={t('systemSettings.demo.masterUrl.label')} hint={t('systemSettings.demo.masterUrl.hint')}>
          <Input value={url} onChange={(e) => setUrl(e.target.value)} className='font-mono text-sm' />
        </FieldRow>
        <SaveButton />
      </CardContent>
    </Card>
  )
}

// ───── 7. API Token ─────
function ApiTokenCard() {
  const { t } = useTranslation('xdocs')
  const [token, setToken] = MockToken()
  const [reveal, setReveal] = useState(false)

  const regen = () => {
    setToken(fakeToken())
    toast.success(t('systemSettings.demo.apiToken.regenerated'))
  }

  const copy = () => {
    navigator.clipboard.writeText(token).catch(() => {})
    toast.success(t('systemSettings.demo.apiToken.copied'))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <KeyRound className='size-5 text-primary' />
          {t('systemSettings.demo.apiToken.title')}
        </CardTitle>
        <CardDescription>{t('systemSettings.demo.apiToken.desc')}</CardDescription>
      </CardHeader>
      <CardContent className='space-y-3'>
        <div className='space-y-1.5'>
          <Label className='text-sm font-semibold'>{t('systemSettings.demo.apiToken.token')}</Label>
          <div className='flex gap-1'>
            <Input
              type={reveal ? 'text' : 'password'}
              value={token}
              readOnly
              className='font-mono text-xs'
            />
            <Button size='icon' variant='ghost' onClick={() => setReveal(!reveal)} className='size-9 shrink-0'>
              {reveal ? <EyeOff className='size-4' /> : <Eye className='size-4' />}
            </Button>
            <Button size='icon' variant='ghost' onClick={copy} className='size-9 shrink-0'>
              <Copy className='size-4' />
            </Button>
          </div>
          <p className='text-xs text-muted-foreground'>{t('systemSettings.demo.apiToken.hint')}</p>
        </div>
        <Button variant='outline' size='sm' onClick={regen}>
          <RotateCcw className='size-3.5 mr-1' />
          {t('systemSettings.demo.apiToken.regenBtn')}
        </Button>
      </CardContent>
    </Card>
  )
}

// ───── 8. 许可证 ─────
function LicenseCard() {
  const { t } = useTranslation('xdocs')
  const [licenseKey, setLicenseKey] = useState('MMWX-PRO-2026-XXXX-XXXX-XXXX')
  const [activated] = useState(true)
  const machineId = 'a1b2c3d4e5f6'

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Crown className='size-5 text-amber-500' />
          {t('systemSettings.demo.license.title')}
          {activated && (
            <Badge className='ml-2 bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300'>
              {t('systemSettings.demo.license.proActive')}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>{t('systemSettings.demo.license.desc')}</CardDescription>
      </CardHeader>
      <CardContent className='space-y-3'>
        <div className='rounded-md border bg-muted/30 p-3 space-y-1 text-xs'>
          <div className='flex justify-between'>
            <span className='text-muted-foreground'>{t('systemSettings.demo.license.machineId')}</span>
            <span className='font-mono'>{machineId}</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-muted-foreground'>{t('systemSettings.demo.license.status')}</span>
            <span className='text-amber-600 dark:text-amber-400 font-medium'>{t('systemSettings.demo.license.statusActive')}</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-muted-foreground'>{t('systemSettings.demo.license.expires')}</span>
            <span>2027-06-07</span>
          </div>
        </div>
        <FieldRow label={t('systemSettings.demo.license.licenseKey')} hint={t('systemSettings.demo.license.licenseKeyHint')}>
          <Input value={licenseKey} onChange={(e) => setLicenseKey(e.target.value)} className='font-mono text-xs' />
        </FieldRow>
        <div className='rounded-md border bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 p-3'>
          <div className='text-xs text-amber-700 dark:text-amber-300 space-y-1'>
            <div className='font-semibold'>{t('systemSettings.demo.license.proFeaturesHeading')}</div>
            <ul className='ml-4 list-disc'>
              <li>{t('systemSettings.demo.license.feat1')}</li>
              <li>{t('systemSettings.demo.license.feat2')}</li>
              <li>{t('systemSettings.demo.license.feat3')}</li>
              <li>{t('systemSettings.demo.license.feat4')}</li>
            </ul>
          </div>
        </div>
        <SaveButton label={t('systemSettings.demo.license.activateBtn')} />
      </CardContent>
    </Card>
  )
}

// ───── 通用小组件 ─────
function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className='flex items-start justify-between gap-3'>
      <div className='flex-1 min-w-0'>
        <div className='text-sm font-medium'>{label}</div>
        {hint && (
          <p className='text-xs text-muted-foreground mt-0.5 flex items-start gap-1'>
            <HelpCircle className='size-3 shrink-0 mt-0.5' />
            {hint}
          </p>
        )}
      </div>
      <div className='shrink-0 pt-1'>{children}</div>
    </div>
  )
}

function FieldRow({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className='space-y-1.5'>
      <Label className='text-sm font-semibold'>{label}</Label>
      {children}
      {hint && (
        <p className='text-xs text-muted-foreground flex items-start gap-1'>
          <HelpCircle className='size-3 shrink-0 mt-0.5' />
          {hint}
        </p>
      )}
    </div>
  )
}

function RadioInline({ value, id, label }: { value: string; id: string; label: string }) {
  return (
    <div className='flex items-center gap-2'>
      <RadioGroupItem value={value} id={id} />
      <Label htmlFor={id} className='font-normal cursor-pointer text-sm'>{label}</Label>
    </div>
  )
}

function SaveButton({ label }: { label?: string }) {
  const { t } = useTranslation('xdocs')
  const [saving, setSaving] = useState(false)
  const save = async () => {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 500))
    toast.success(t('systemSettings.demo.saved'))
    setSaving(false)
  }
  return (
    <div className='flex justify-end pt-2'>
      <Button size='sm' onClick={save} disabled={saving}>
        <Save className='size-3.5 mr-1' />
        {label ?? t('systemSettings.demo.saveBtn')}
      </Button>
    </div>
  )
}
