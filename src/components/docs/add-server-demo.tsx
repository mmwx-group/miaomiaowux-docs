import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Server, KeyRound, Copy, Check, Star, FileText, ExternalLink } from 'lucide-react'

// AddServerDemo — 模拟主控「添加远程服务器」对话框。点「生成 Token」后,Token + 一键安装命令
// 立即在「服务器名称」输入框正下方展示;「我要偷自己」开启后展开 5 个嵌套字段。

function genToken() {
  let s = ''
  for (let i = 0; i < 32; i++) s += Math.floor(Math.random() * 16).toString(16)
  return s
}

export function AddServerDemo() {
  const { t } = useTranslation('xdocs')
  const [open, setOpen] = useState(false)

  // 基本字段
  const [name, setName] = useState('美国节点1')
  const [serverAddr, setServerAddr] = useState('example.com')
  const [agentPort, setAgentPort] = useState('23889')
  const [agentAuthToken, setAgentAuthToken] = useState('')
  const [trafficLimit, setTrafficLimit] = useState('')
  const [usedTraffic, setUsedTraffic] = useState('')
  const [resetDay, setResetDay] = useState('1')
  const [xrayMode, setXrayMode] = useState<'external' | 'embedded'>('external')
  const [statsMode, setStatsMode] = useState<'both' | 'upload' | 'download'>('both')

  // 偷自己
  const [stealSelf, setStealSelf] = useState(false)
  const [frontService, setFrontService] = useState<'xray' | 'nginx'>('xray')
  const [stealDeploy, setStealDeploy] = useState<'tunnel' | 'fallback'>('tunnel')
  const [use443, setUse443] = useState(true)
  const [stealDomain, setStealDomain] = useState('')
  const [siteType, setSiteType] = useState<'static' | 'reverse'>('static')
  const [siteValue, setSiteValue] = useState('')

  // 结果
  const [serverToken, setServerToken] = useState('')
  const [copied, setCopied] = useState(false)

  const handleGenerate = () => setServerToken(genToken())
  const reset = () => {
    setServerToken('')
    setCopied(false)
  }
  const handleClose = (o: boolean) => {
    setOpen(o)
    if (!o) reset()
  }

  const masterURL = 'https://mmwx.example.com'
  const installCmd = (() => {
    if (!serverToken) return ''
    const params = new URLSearchParams()
    params.set('token', serverToken)
    if (xrayMode === 'embedded') params.set('xray_mode', 'embedded')
    if (stealSelf) params.set('steal_self', '1')
    return `curl -fsSL "${masterURL}/api/remote/install.sh?${params.toString()}" | sudo bash`
  })()

  const copy = () => {
    navigator.clipboard.writeText(installCmd).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <Card className='border-dashed'>
      <CardContent className='pt-6'>
        <div className='flex items-start gap-3 mb-3'>
          <div className='size-10 rounded-md flex items-center justify-center bg-primary/10 text-primary shrink-0'>
            <Server className='size-5' />
          </div>
          <div className='flex-1 min-w-0'>
            <h3 className='font-semibold mb-1'>{t('installAgent.demo.heading')}</h3>
            <p className='text-sm text-muted-foreground'>{t('installAgent.demo.intro')}</p>
          </div>
        </div>

        <Dialog open={open} onOpenChange={handleClose}>
          <DialogTrigger asChild>
            <Button variant='outline' className='gap-2'>
              <Server className='size-4' />
              {t('installAgent.demo.openBtn')}
            </Button>
          </DialogTrigger>

          <DialogContent className='sm:max-w-xl max-h-[90vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle>{t('installAgent.demo.dialogTitle')}</DialogTitle>
              <DialogDescription>{t('installAgent.demo.dialogDesc')}</DialogDescription>
            </DialogHeader>

            <div className='space-y-4'>
              {/* 服务器名称 + 生成 Token 按钮 + 紧贴下方的结果区 */}
              <div className='space-y-2'>
                <Label htmlFor='demo-name'>{t('installAgent.demo.fieldName')}</Label>
                <div className='flex gap-2'>
                  <Input
                    id='demo-name'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('installAgent.demo.namePlaceholder')}
                    className='flex-1'
                  />
                  <Button
                    type='button'
                    onClick={handleGenerate}
                    disabled={!name}
                    className='gap-2 shrink-0'
                  >
                    <KeyRound className='size-4' />
                    {serverToken
                      ? t('installAgent.demo.regenBtn')
                      : t('installAgent.demo.generateBtn')}
                  </Button>
                </div>

                {/* 结果区:生成 Token 后紧贴出现 */}
                {serverToken && (
                  <div className='rounded-lg border-2 border-primary/30 bg-primary/5 p-3 mt-2 space-y-2'>
                    <div className='flex items-center gap-2 text-xs font-semibold'>
                      <Check className='size-3.5 text-green-600' />
                      {t('installAgent.demo.tokenGenerated')}
                    </div>
                    <div className='text-xs'>
                      <div className='text-muted-foreground mb-0.5'>{t('installAgent.demo.tokenLabel')}</div>
                      <div className='font-mono break-all'>{serverToken}</div>
                    </div>
                    <div>
                      <div className='text-xs font-semibold mb-1'>{t('installAgent.demo.installCmdLabel')}</div>
                      <div className='relative'>
                        <pre className='bg-background border rounded-md p-2.5 pr-10 font-mono text-xs overflow-x-auto whitespace-pre-wrap break-all'>{installCmd}</pre>
                        <Button type='button' variant='ghost' size='icon' className='absolute top-1 right-1 size-7' onClick={copy} title={t('installAgent.demo.copyBtn')}>
                          {copied ? <Check className='size-3.5 text-green-600' /> : <Copy className='size-3.5' />}
                        </Button>
                      </div>
                      <p className='text-xs text-muted-foreground mt-1.5'>{t('installAgent.demo.runOnServerHint')}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* 服务器信息(灰色背景子区域) */}
              <div className='rounded-lg border bg-muted/30 p-4 space-y-3'>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                  <div className='space-y-1.5'>
                    <Label htmlFor='demo-addr'>{t('installAgent.demo.fieldServerAddr')}</Label>
                    <Input id='demo-addr' value={serverAddr} onChange={(e) => setServerAddr(e.target.value)} placeholder='example.com' />
                  </div>
                  <div className='space-y-1.5'>
                    <Label htmlFor='demo-port'>{t('installAgent.demo.fieldAgentPort')}</Label>
                    <Input id='demo-port' value={agentPort} onChange={(e) => setAgentPort(e.target.value)} />
                  </div>
                  <div className='space-y-1.5'>
                    <Label htmlFor='demo-auth'>{t('installAgent.demo.fieldAgentAuth')}</Label>
                    <Input id='demo-auth' value={agentAuthToken} onChange={(e) => setAgentAuthToken(e.target.value)} placeholder={t('installAgent.demo.autoGen')} />
                  </div>
                  <div className='space-y-1.5'>
                    <Label htmlFor='demo-limit'>{t('installAgent.demo.fieldTrafficLimit')}</Label>
                    <Input id='demo-limit' value={trafficLimit} onChange={(e) => setTrafficLimit(e.target.value)} placeholder={t('installAgent.demo.unlimitedHint')} />
                  </div>
                  <div className='space-y-1.5'>
                    <Label htmlFor='demo-used'>{t('installAgent.demo.fieldUsedTraffic')}</Label>
                    <Input id='demo-used' value={usedTraffic} onChange={(e) => setUsedTraffic(e.target.value)} placeholder={t('installAgent.demo.calibrationHint')} />
                  </div>
                  <div className='space-y-1.5'>
                    <Label htmlFor='demo-reset'>{t('installAgent.demo.fieldResetDay')}</Label>
                    <Input id='demo-reset' value={resetDay} onChange={(e) => setResetDay(e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Xray 模式 */}
              <Card>
                <CardContent className='pt-4 space-y-3'>
                  <Label className='text-sm font-semibold'>{t('installAgent.demo.xrayModeLabel')}</Label>
                  <RadioGroup
                    value={xrayMode}
                    onValueChange={(v) => setXrayMode(v as 'external' | 'embedded')}
                    className='flex flex-wrap items-center gap-x-6 gap-y-2'
                  >
                    <div className='flex items-center gap-2'>
                      <RadioGroupItem value='external' id='xm-ext' />
                      <Label htmlFor='xm-ext' className='font-normal cursor-pointer'>{t('installAgent.demo.xrayExternal')}</Label>
                    </div>
                    <div className='flex items-center gap-2'>
                      <RadioGroupItem value='embedded' id='xm-emb' />
                      <Label htmlFor='xm-emb' className='font-normal cursor-pointer'>{t('installAgent.demo.xrayEmbedded')}</Label>
                      <Badge className='gap-1 bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300'>
                        <Star className='size-3' />
                        Pro
                      </Badge>
                    </div>
                  </RadioGroup>
                  <p className='text-xs text-muted-foreground'>
                    {xrayMode === 'external'
                      ? t('installAgent.demo.xrayExternalHint')
                      : t('installAgent.demo.xrayEmbeddedHint')}
                  </p>
                </CardContent>
              </Card>

              {/* 流量统计规则 */}
              <Card>
                <CardContent className='pt-4 space-y-3'>
                  <Label className='text-sm font-semibold'>{t('installAgent.demo.statsModeLabel')}</Label>
                  <RadioGroup
                    value={statsMode}
                    onValueChange={(v) => setStatsMode(v as 'both' | 'upload' | 'download')}
                    className='flex flex-wrap items-center gap-x-6 gap-y-2'
                  >
                    <div className='flex items-center gap-2'>
                      <RadioGroupItem value='both' id='sm-both' />
                      <Label htmlFor='sm-both' className='font-normal cursor-pointer'>{t('installAgent.demo.statsBoth')}</Label>
                    </div>
                    <div className='flex items-center gap-2'>
                      <RadioGroupItem value='upload' id='sm-up' />
                      <Label htmlFor='sm-up' className='font-normal cursor-pointer'>{t('installAgent.demo.statsUpload')}</Label>
                    </div>
                    <div className='flex items-center gap-2'>
                      <RadioGroupItem value='download' id='sm-dn' />
                      <Label htmlFor='sm-dn' className='font-normal cursor-pointer'>{t('installAgent.demo.statsDownload')}</Label>
                    </div>
                  </RadioGroup>
                  <p className='text-xs text-muted-foreground'>{t('installAgent.demo.statsHint')}</p>
                </CardContent>
              </Card>

              {/* 我要偷自己 + 展开的嵌套字段 */}
              <Card>
                <CardContent className='pt-4'>
                  <div className='flex items-center justify-between'>
                    <Label htmlFor='demo-steal' className='cursor-pointer font-semibold'>
                      {t('installAgent.demo.stealLabel')}
                    </Label>
                    <Switch id='demo-steal' checked={stealSelf} onCheckedChange={setStealSelf} />
                  </div>

                  {stealSelf && (
                    <div className='mt-4 space-y-4'>
                      {/* 前置选择 */}
                      <div className='space-y-2'>
                        <Label className='text-sm font-semibold'>{t('installAgent.demo.frontServiceLabel')}</Label>
                        <RadioGroup
                          value={frontService}
                          onValueChange={(v) => setFrontService(v as 'xray' | 'nginx')}
                          className='flex flex-wrap items-center gap-x-6 gap-y-2'
                        >
                          <div className='flex items-center gap-2'>
                            <RadioGroupItem value='xray' id='fs-xray' />
                            <Label htmlFor='fs-xray' className='font-normal cursor-pointer'>xray</Label>
                          </div>
                          <div className='flex items-center gap-2'>
                            <RadioGroupItem value='nginx' id='fs-nginx' disabled />
                            <Label htmlFor='fs-nginx' className='font-normal cursor-not-allowed text-muted-foreground'>
                              {t('installAgent.demo.frontServiceNginxDisabled')}
                            </Label>
                          </div>
                        </RadioGroup>
                        <p className='text-xs text-muted-foreground'>
                          {xrayMode === 'external'
                            ? t('installAgent.demo.frontServiceHintExternal')
                            : t('installAgent.demo.frontServiceHintEmbedded')}
                        </p>
                      </div>

                      {/* 部署模式 */}
                      <div className='space-y-2'>
                        <Label className='text-sm font-semibold'>{t('installAgent.demo.deployModeLabel')}</Label>
                        <RadioGroup
                          value={stealDeploy}
                          onValueChange={(v) => setStealDeploy(v as 'tunnel' | 'fallback')}
                          className='flex flex-wrap items-center gap-x-6 gap-y-2'
                        >
                          <div className='flex items-center gap-2'>
                            <RadioGroupItem value='tunnel' id='dm-tunnel' />
                            <Label htmlFor='dm-tunnel' className='font-normal cursor-pointer'>{t('installAgent.demo.deployTunnel')}</Label>
                          </div>
                          <div className='flex items-center gap-2'>
                            <RadioGroupItem value='fallback' id='dm-fb' />
                            <Label htmlFor='dm-fb' className='font-normal cursor-pointer'>{t('installAgent.demo.deployFallback')}</Label>
                          </div>
                        </RadioGroup>
                        <p className='text-xs text-muted-foreground'>
                          {stealDeploy === 'tunnel'
                            ? t('installAgent.demo.deployTunnelHint')
                            : t('installAgent.demo.deployFallbackHint')}
                        </p>
                      </div>

                      {/* 使用 443 端口部署 */}
                      <div className='flex items-center justify-between'>
                        <Label htmlFor='demo-443' className='cursor-pointer font-semibold'>
                          {t('installAgent.demo.use443Label')}
                        </Label>
                        <Switch id='demo-443' checked={use443} onCheckedChange={setUse443} />
                      </div>

                      {/* 域名 */}
                      <div className='space-y-1.5'>
                        <Label htmlFor='demo-domain' className='font-semibold'>
                          {t('installAgent.demo.domainLabel')} <span className='text-destructive'>*</span>
                        </Label>
                        <Input
                          id='demo-domain'
                          value={stealDomain}
                          onChange={(e) => setStealDomain(e.target.value)}
                          placeholder='e.g. us1.example.com'
                        />
                        <p className='text-xs text-muted-foreground'>{t('installAgent.demo.domainHint')}</p>
                      </div>

                      {/* 网站类型 */}
                      <div className='space-y-2'>
                        <Label className='font-semibold'>{t('installAgent.demo.siteTypeLabel')}</Label>
                        <div className='grid grid-cols-2 gap-2'>
                          <Button
                            type='button'
                            variant={siteType === 'static' ? 'default' : 'outline'}
                            className='gap-2 h-12'
                            onClick={() => setSiteType('static')}
                          >
                            <FileText className='size-4' />
                            {t('installAgent.demo.siteStatic')}
                          </Button>
                          <Button
                            type='button'
                            variant={siteType === 'reverse' ? 'default' : 'outline'}
                            className='gap-2 h-12'
                            onClick={() => setSiteType('reverse')}
                          >
                            <ExternalLink className='size-4' />
                            {t('installAgent.demo.siteReverse')}
                          </Button>
                        </div>
                      </div>

                      {/* 静态页面路径 / 反向代理地址 */}
                      <div className='space-y-1.5'>
                        <Label htmlFor='demo-site-value' className='font-semibold'>
                          {siteType === 'static'
                            ? t('installAgent.demo.siteStaticPath')
                            : t('installAgent.demo.siteReverseTarget')}
                        </Label>
                        <Input
                          id='demo-site-value'
                          value={siteValue}
                          onChange={(e) => setSiteValue(e.target.value)}
                          placeholder={
                            siteType === 'static'
                              ? t('installAgent.demo.siteStaticPlaceholder')
                              : t('installAgent.demo.siteReversePlaceholder')
                          }
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <DialogFooter>
              <Button variant='outline' onClick={() => handleClose(false)}>
                {t('installAgent.demo.cancelBtn')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
