// 证书管理 mock — 域名列表 + 申请新证书 dialog。
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Plus,
  RefreshCw,
  Trash2,
  Calendar,
  Globe,
  Cloud,
  Loader2,
  Download,
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

type Cert = {
  id: number
  domain: string
  provider: string
  status: 'active' | 'expiring' | 'expired'
  expiresAt: string
  daysLeft: number
  servers: string[]
}

const INITIAL: Cert[] = [
  { id: 1, domain: 'hk.example.com',     provider: 'Cloudflare', status: 'active',   expiresAt: '2026-09-12', daysLeft: 97,  servers: ['hk1.example.com'] },
  { id: 2, domain: 'us.example.com',     provider: 'Cloudflare', status: 'expiring', expiresAt: '2026-07-03', daysLeft: 26,  servers: ['us1.example.com'] },
  { id: 3, domain: 'jp.example.com',     provider: 'Aliyun',     status: 'active',   expiresAt: '2026-11-28', daysLeft: 174, servers: ['jp1.example.com', 'jp2.example.com'] },
  { id: 4, domain: 'old.example.com',    provider: 'Tencent',    status: 'expired',  expiresAt: '2026-05-15', daysLeft: -23, servers: [] },
]

const PROVIDERS = ['Cloudflare', 'Aliyun', 'Tencent', 'Namesilo', 'DNSPod', 'GoDaddy', 'Namecheap'] as const

export function CertificatesDemo() {
  const { t } = useTranslation('xdocs')
  const [certs, setCerts] = useState<Cert[]>(INITIAL)
  const [dialogOpen, setDialogOpen] = useState(false)

  const renew = async (id: number) => {
    toast.loading(t('certificates.demo.renewing'), { id: `renew-${id}` })
    await new Promise((r) => setTimeout(r, 1500))
    setCerts((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: 'active' as const, expiresAt: '2027-06-07', daysLeft: 365 }
          : c
      )
    )
    toast.success(t('certificates.demo.renewedToast'), { id: `renew-${id}` })
  }

  const del = (id: number) => {
    setCerts((prev) => prev.filter((c) => c.id !== id))
    toast.success(t('certificates.demo.deletedToast'))
  }

  const download = (cert: Cert) => {
    toast.success(t('certificates.demo.downloadedToast', { domain: cert.domain }))
  }

  const addCert = (domain: string, provider: string) => {
    const newCert: Cert = {
      id: Date.now(),
      domain,
      provider,
      status: 'active',
      expiresAt: '2027-06-07',
      daysLeft: 365,
      servers: [],
    }
    setCerts((prev) => [...prev, newCert])
    toast.success(t('certificates.demo.issuedToast', { domain }))
    setDialogOpen(false)
  }

  return (
    <Card className='border-dashed'>
      <CardContent className='pt-6 space-y-4'>
        <div className='flex items-center gap-2 flex-wrap'>
          <Badge variant='outline' className='text-xs'>{t('certificates.demo.badge')}</Badge>
          <span className='text-xs text-muted-foreground'>{t('certificates.demo.intro')}</span>
        </div>

        {/* 顶部:统计 + 新建 */}
        <div className='flex items-center justify-between gap-2 flex-wrap'>
          <div className='flex items-center gap-3 text-sm'>
            <span className='flex items-center gap-1.5'>
              <ShieldCheck className='size-4 text-green-600' />
              <span className='font-medium'>{certs.filter((c) => c.status === 'active').length}</span>
              <span className='text-muted-foreground'>{t('certificates.demo.statActive')}</span>
            </span>
            <span className='flex items-center gap-1.5'>
              <ShieldAlert className='size-4 text-amber-500' />
              <span className='font-medium'>{certs.filter((c) => c.status === 'expiring').length}</span>
              <span className='text-muted-foreground'>{t('certificates.demo.statExpiring')}</span>
            </span>
            <span className='flex items-center gap-1.5'>
              <Shield className='size-4 text-destructive' />
              <span className='font-medium'>{certs.filter((c) => c.status === 'expired').length}</span>
              <span className='text-muted-foreground'>{t('certificates.demo.statExpired')}</span>
            </span>
          </div>
          <Button size='sm' onClick={() => setDialogOpen(true)}>
            <Plus className='size-3.5 mr-1' />
            {t('certificates.demo.requestBtn')}
          </Button>
        </div>

        {/* 证书表 */}
        <div className='rounded-md border overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead className='bg-muted/30 text-xs text-muted-foreground'>
              <tr>
                <th className='text-left py-2 px-3 font-medium'>{t('certificates.demo.col.domain')}</th>
                <th className='text-left py-2 px-3 font-medium'>{t('certificates.demo.col.provider')}</th>
                <th className='text-left py-2 px-3 font-medium'>{t('certificates.demo.col.servers')}</th>
                <th className='text-left py-2 px-3 font-medium whitespace-nowrap'>{t('certificates.demo.col.expires')}</th>
                <th className='text-center py-2 px-3 font-medium'>{t('certificates.demo.col.status')}</th>
                <th className='text-right py-2 px-3 font-medium'>{t('certificates.demo.col.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {certs.map((c) => (
                <tr key={c.id} className='border-t'>
                  <td className='py-2 px-3'>
                    <div className='flex items-center gap-2'>
                      <Globe className='size-3.5 text-muted-foreground' />
                      <span className='font-mono text-sm font-medium'>{c.domain}</span>
                    </div>
                  </td>
                  <td className='py-2 px-3'>
                    <Badge variant='outline' className='text-[10px] gap-1'>
                      <Cloud className='size-2.5' />
                      {c.provider}
                    </Badge>
                  </td>
                  <td className='py-2 px-3'>
                    {c.servers.length > 0 ? (
                      <div className='flex flex-wrap gap-1'>
                        {c.servers.map((s) => (
                          <Badge key={s} variant='outline' className='text-[10px] font-mono'>
                            {s}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className='text-xs text-muted-foreground italic'>{t('certificates.demo.noServers')}</span>
                    )}
                  </td>
                  <td className='py-2 px-3 whitespace-nowrap'>
                    <div className='flex items-center gap-1.5 text-xs'>
                      <Calendar className='size-3 text-muted-foreground' />
                      <span>{c.expiresAt}</span>
                      <span className={
                        c.daysLeft < 0 ? 'text-destructive' :
                        c.daysLeft < 30 ? 'text-amber-600' :
                        'text-muted-foreground'
                      }>
                        ({c.daysLeft < 0 ? `${-c.daysLeft} ${t('certificates.demo.daysAgo')}` : `${c.daysLeft} ${t('certificates.demo.daysLeft')}`})
                      </span>
                    </div>
                  </td>
                  <td className='py-2 px-3 text-center'>
                    {c.status === 'active' && (
                      <Badge className='text-[10px] bg-green-100 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-300'>
                        {t('certificates.demo.statusActive')}
                      </Badge>
                    )}
                    {c.status === 'expiring' && (
                      <Badge className='text-[10px] bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300'>
                        {t('certificates.demo.statusExpiring')}
                      </Badge>
                    )}
                    {c.status === 'expired' && (
                      <Badge className='text-[10px] bg-red-100 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300'>
                        {t('certificates.demo.statusExpired')}
                      </Badge>
                    )}
                  </td>
                  <td className='py-2 px-3'>
                    <div className='flex items-center justify-end gap-0.5'>
                      <Button size='icon' variant='ghost' className='size-7' onClick={() => download(c)} title={t('certificates.demo.opDownload')}>
                        <Download className='size-3.5' />
                      </Button>
                      <Button size='icon' variant='ghost' className='size-7' onClick={() => renew(c.id)} title={t('certificates.demo.opRenew')}>
                        <RefreshCw className='size-3.5' />
                      </Button>
                      <Button
                        size='icon'
                        variant='ghost'
                        className='size-7 hover:text-destructive'
                        onClick={() => del(c.id)}
                        title={t('certificates.demo.opDelete')}
                      >
                        <Trash2 className='size-3.5' />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 申请 Dialog */}
        {dialogOpen && <RequestCertDialog onClose={() => setDialogOpen(false)} onCreated={addCert} />}
      </CardContent>
    </Card>
  )
}

function RequestCertDialog({
  onClose,
  onCreated,
}: {
  onClose: () => void
  onCreated: (domain: string, provider: string) => void
}) {
  const { t } = useTranslation('xdocs')
  const [domain, setDomain] = useState('')
  const [provider, setProvider] = useState<string>('Cloudflare')
  const [apiKey, setApiKey] = useState('')
  const [wildcard, setWildcard] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const submit = async () => {
    if (!domain.trim() || !apiKey.trim()) {
      toast.error(t('certificates.demo.dialog.errorRequired'))
      return
    }
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 1500))
    onCreated(domain.trim(), provider)
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <ShieldCheck className='size-5 text-primary' />
            {t('certificates.demo.dialog.title')}
          </DialogTitle>
          <DialogDescription>{t('certificates.demo.dialog.desc')}</DialogDescription>
        </DialogHeader>

        <div className='space-y-3'>
          <div className='space-y-1'>
            <Label className='text-sm'>{t('certificates.demo.dialog.domainLabel')}</Label>
            <Input
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder='example.com'
              className='font-mono'
            />
            <div className='flex items-center gap-1.5 mt-1'>
              <input
                type='checkbox'
                id='wildcard'
                checked={wildcard}
                onChange={(e) => setWildcard(e.target.checked)}
                className='size-4'
              />
              <Label htmlFor='wildcard' className='text-xs cursor-pointer font-normal'>
                {t('certificates.demo.dialog.wildcardLabel')}
              </Label>
            </div>
          </div>

          <div className='space-y-1'>
            <Label className='text-sm'>{t('certificates.demo.dialog.providerLabel')}</Label>
            <div className='grid grid-cols-2 sm:grid-cols-3 gap-2'>
              {PROVIDERS.map((p) => (
                <button
                  key={p}
                  onClick={() => setProvider(p)}
                  className={`rounded-md border px-3 py-2 text-xs font-medium transition ${
                    provider === p ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:bg-muted/30'
                  }`}
                >
                  <Cloud className='size-3 inline mr-1' />
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className='space-y-1'>
            <Label className='text-sm'>{t('certificates.demo.dialog.apiKeyLabel', { provider })}</Label>
            <Input
              type='password'
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={t('certificates.demo.dialog.apiKeyPlaceholder')}
              className='font-mono text-xs'
            />
            <p className='text-xs text-muted-foreground'>{t('certificates.demo.dialog.apiKeyHint', { provider })}</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={onClose}>
            {t('certificates.demo.dialog.cancelBtn')}
          </Button>
          <Button onClick={submit} disabled={submitting}>
            {submitting ? (
              <><Loader2 className='size-4 mr-1 animate-spin' />{t('certificates.demo.dialog.submitting')}</>
            ) : (
              <><Plus className='size-4 mr-1' />{t('certificates.demo.dialog.submitBtn')}</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
