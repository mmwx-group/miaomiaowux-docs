// 用户管理 mock — 用户列表 + 创建/管理套餐 dialog + 复制订阅 + 删除。
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  Users,
  Plus,
  Edit3,
  Trash2,
  Link as LinkIcon,
  Calendar,
  Package as PackageIcon,
  Power,
  Search,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type DemoUser = {
  id: number
  username: string
  email: string
  packageId: number | null
  enabled: boolean
  usedGb: number
  totalGb: number
  expiresAt: string
  createdAt: string
  subToken: string
}

const PACKAGES = [
  { id: 1, name: '基础版',     totalGb: 100 },
  { id: 2, name: '进阶版',     totalGb: 300 },
  { id: 3, name: '尊享版',     totalGb: 1024 },
  { id: 4, name: '体验版(7天)', totalGb: 20  },
]

const INITIAL: DemoUser[] = [
  { id: 1, username: 'alice',   email: 'alice@example.com',   packageId: 2, enabled: true,  usedGb:  87.4, totalGb: 300,  expiresAt: '2026-09-20', createdAt: '2026-04-12', subToken: 'aliceXX1234' },
  { id: 2, username: 'bob',     email: 'bob@example.com',     packageId: 1, enabled: true,  usedGb:  62.1, totalGb: 100,  expiresAt: '2026-08-05', createdAt: '2026-05-01', subToken: 'bobXY5678' },
  { id: 3, username: 'charlie', email: 'charlie@example.com', packageId: 3, enabled: true,  usedGb: 412.6, totalGb: 1024, expiresAt: '2027-01-15', createdAt: '2026-02-28', subToken: 'charlieAB' },
  { id: 4, username: 'diana',   email: 'diana@example.com',   packageId: 4, enabled: false, usedGb:  18.9, totalGb: 20,   expiresAt: '2026-06-10', createdAt: '2026-06-03', subToken: 'dianaCD' },
  { id: 5, username: 'jimlee',  email: 'jim@example.com',     packageId: 2, enabled: true,  usedGb: 156.0, totalGb: 300,  expiresAt: '2026-12-31', createdAt: '2026-01-10', subToken: 'jimEFGH' },
  { id: 6, username: 'kate',    email: 'kate@example.com',    packageId: null, enabled: true, usedGb: 0, totalGb: 0,    expiresAt: '-',          createdAt: '2026-06-06', subToken: 'kateIJ' },
]

export function UsersDemo() {
  const { t } = useTranslation('xdocs')
  const [users, setUsers] = useState<DemoUser[]>(INITIAL)
  const [q, setQ] = useState('')
  const [dialog, setDialog] = useState<{ mode: 'new' } | { mode: 'bind'; user: DemoUser } | null>(null)

  const filtered = users.filter((u) =>
    !q ||
    u.username.toLowerCase().includes(q.toLowerCase()) ||
    u.email.toLowerCase().includes(q.toLowerCase())
  )

  const toggle = (id: number) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, enabled: !u.enabled } : u)))
    const u = users.find((x) => x.id === id)
    if (u) toast.success(u.enabled ? t('users.demo.disabledToast', { user: u.username }) : t('users.demo.enabledToast', { user: u.username }))
  }

  const del = (id: number) => {
    setUsers((prev) => prev.filter((u) => u.id !== id))
    toast.success(t('users.demo.deletedToast'))
  }

  const copySub = (u: DemoUser) => {
    const url = `https://mmwx.example.com/x/${u.subToken}`
    navigator.clipboard.writeText(url).catch(() => {})
    toast.success(t('users.demo.subCopiedToast'))
  }

  const addUser = (data: { username: string; email: string; packageId: number | null }) => {
    const pkg = PACKAGES.find((p) => p.id === data.packageId)
    const newUser: DemoUser = {
      id: Date.now(),
      username: data.username,
      email: data.email,
      packageId: data.packageId,
      enabled: true,
      usedGb: 0,
      totalGb: pkg?.totalGb ?? 0,
      expiresAt: data.packageId ? '2027-06-07' : '-',
      createdAt: '2026-06-07',
      subToken: data.username.slice(0, 6) + Math.random().toString(36).slice(2, 6),
    }
    setUsers((prev) => [...prev, newUser])
    toast.success(t('users.demo.createdToast'))
    setDialog(null)
  }

  const bindPackage = (userId: number, packageId: number | null, expiresAt: string) => {
    const pkg = PACKAGES.find((p) => p.id === packageId)
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, packageId, totalGb: pkg?.totalGb ?? 0, usedGb: 0, expiresAt }
          : u
      )
    )
    toast.success(t('users.demo.boundToast'))
    setDialog(null)
  }

  // 流量用量进度颜色
  const usageColor = (used: number, total: number) => {
    if (total === 0) return 'bg-muted-foreground/30'
    const pct = used / total
    if (pct < 0.6) return 'bg-green-500'
    if (pct < 0.85) return 'bg-amber-500'
    return 'bg-destructive'
  }

  return (
    <Card className='border-dashed'>
      <CardContent className='pt-6 space-y-4'>
        <div className='flex items-center gap-2 flex-wrap'>
          <Badge variant='outline' className='text-xs'>{t('users.demo.badge')}</Badge>
          <span className='text-xs text-muted-foreground'>{t('users.demo.intro')}</span>
        </div>

        {/* 顶部:搜索 + 创建 */}
        <div className='flex items-center justify-between gap-2 flex-wrap'>
          <div className='flex items-center gap-2 text-sm'>
            <Users className='size-4 text-primary' />
            <span className='font-medium'>{t('users.demo.heading')}</span>
            <Badge variant='secondary' className='text-[10px]'>{users.length}</Badge>
          </div>
          <div className='flex items-center gap-2'>
            <div className='relative'>
              <Search className='size-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground' />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t('users.demo.searchPlaceholder')}
                className='pl-7 h-8 w-44'
              />
            </div>
            <Button size='sm' onClick={() => setDialog({ mode: 'new' })}>
              <Plus className='size-3.5 mr-1' />
              {t('users.demo.createBtn')}
            </Button>
          </div>
        </div>

        {/* 用户表 */}
        <div className='rounded-md border overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead className='bg-muted/30 text-xs text-muted-foreground'>
              <tr>
                <th className='text-left py-2 px-3 font-medium'>{t('users.demo.col.user')}</th>
                <th className='text-left py-2 px-3 font-medium'>{t('users.demo.col.package')}</th>
                <th className='text-left py-2 px-3 font-medium whitespace-nowrap'>{t('users.demo.col.usage')}</th>
                <th className='text-left py-2 px-3 font-medium whitespace-nowrap'>{t('users.demo.col.expires')}</th>
                <th className='text-center py-2 px-3 font-medium'>{t('users.demo.col.status')}</th>
                <th className='text-right py-2 px-3 font-medium'>{t('users.demo.col.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const pkg = PACKAGES.find((p) => p.id === u.packageId)
                return (
                  <tr key={u.id} className='border-t'>
                    <td className='py-2 px-3'>
                      <div className='font-medium'>{u.username}</div>
                      <div className='text-xs text-muted-foreground'>{u.email}</div>
                    </td>
                    <td className='py-2 px-3'>
                      {pkg ? (
                        <Badge variant='outline' className='gap-1 text-[10px]'>
                          <PackageIcon className='size-2.5' />
                          {pkg.name}
                        </Badge>
                      ) : (
                        <span className='text-xs text-muted-foreground italic'>{t('users.demo.noPackage')}</span>
                      )}
                    </td>
                    <td className='py-2 px-3 whitespace-nowrap'>
                      <div className='text-xs tabular-nums'>
                        {u.usedGb.toFixed(1)} / {u.totalGb} GB
                      </div>
                      <div className='mt-1 h-1.5 w-32 rounded-full bg-muted overflow-hidden'>
                        <div
                          className={`h-full ${usageColor(u.usedGb, u.totalGb)}`}
                          style={{ width: u.totalGb ? `${Math.min(100, (u.usedGb / u.totalGb) * 100)}%` : '0%' }}
                        />
                      </div>
                    </td>
                    <td className='py-2 px-3 whitespace-nowrap'>
                      <div className='flex items-center gap-1 text-xs'>
                        <Calendar className='size-3 text-muted-foreground' />
                        {u.expiresAt}
                      </div>
                    </td>
                    <td className='py-2 px-3 text-center'>
                      <Switch checked={u.enabled} onCheckedChange={() => toggle(u.id)} />
                    </td>
                    <td className='py-2 px-3'>
                      <div className='flex items-center justify-end gap-0.5'>
                        <Button size='icon' variant='ghost' className='size-7' onClick={() => copySub(u)} title={t('users.demo.opCopySub')}>
                          <LinkIcon className='size-3.5' />
                        </Button>
                        <Button
                          size='icon'
                          variant='ghost'
                          className='size-7'
                          onClick={() => setDialog({ mode: 'bind', user: u })}
                          title={t('users.demo.opBindPackage')}
                        >
                          <Edit3 className='size-3.5' />
                        </Button>
                        <Button
                          size='icon'
                          variant='ghost'
                          className='size-7 hover:text-destructive'
                          onClick={() => del(u.id)}
                          title={t('users.demo.opDelete')}
                        >
                          <Trash2 className='size-3.5' />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className='rounded border border-dashed p-6 text-center text-xs text-muted-foreground'>
            {t('users.demo.emptyHint')}
          </div>
        )}

        {/* 对话框 */}
        {dialog?.mode === 'new' && (
          <CreateUserDialog onClose={() => setDialog(null)} onCreate={addUser} />
        )}
        {dialog?.mode === 'bind' && (
          <BindPackageDialog user={dialog.user} onClose={() => setDialog(null)} onBind={bindPackage} />
        )}
      </CardContent>
    </Card>
  )
}

function CreateUserDialog({ onClose, onCreate }: {
  onClose: () => void
  onCreate: (data: { username: string; email: string; packageId: number | null }) => void
}) {
  const { t } = useTranslation('xdocs')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [packageId, setPackageId] = useState<number | null>(null)

  const submit = () => {
    if (!username.trim()) {
      toast.error(t('users.demo.dialog.errorUsername'))
      return
    }
    onCreate({ username: username.trim(), email: email.trim(), packageId })
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{t('users.demo.dialog.titleCreate')}</DialogTitle>
          <DialogDescription>{t('users.demo.dialog.descCreate')}</DialogDescription>
        </DialogHeader>
        <div className='space-y-3'>
          <div className='space-y-1'>
            <Label className='text-sm'>{t('users.demo.dialog.usernameLabel')}</Label>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder='alice' />
          </div>
          <div className='space-y-1'>
            <Label className='text-sm'>{t('users.demo.dialog.emailLabel')}</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder='alice@example.com' />
          </div>
          <div className='space-y-1'>
            <Label className='text-sm'>{t('users.demo.dialog.packageLabel')}</Label>
            <select
              value={packageId ?? ''}
              onChange={(e) => setPackageId(e.target.value ? Number(e.target.value) : null)}
              className='w-full h-9 rounded-md border bg-background px-3 text-sm'
            >
              <option value=''>{t('users.demo.dialog.packageNone')}</option>
              {PACKAGES.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.totalGb} GB)</option>
              ))}
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={onClose}>{t('users.demo.dialog.cancelBtn')}</Button>
          <Button onClick={submit}>
            <Plus className='size-4 mr-1' />
            {t('users.demo.dialog.createBtn')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function BindPackageDialog({
  user,
  onClose,
  onBind,
}: {
  user: DemoUser
  onClose: () => void
  onBind: (userId: number, packageId: number | null, expiresAt: string) => void
}) {
  const { t } = useTranslation('xdocs')
  const [packageId, setPackageId] = useState<number | null>(user.packageId)
  const [expiresAt, setExpiresAt] = useState(user.expiresAt === '-' ? '2027-06-07' : user.expiresAt)

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{t('users.demo.dialog.titleBind', { user: user.username })}</DialogTitle>
          <DialogDescription>{t('users.demo.dialog.descBind')}</DialogDescription>
        </DialogHeader>
        <div className='space-y-3'>
          <div className='space-y-1'>
            <Label className='text-sm'>{t('users.demo.dialog.packageLabel')}</Label>
            <select
              value={packageId ?? ''}
              onChange={(e) => setPackageId(e.target.value ? Number(e.target.value) : null)}
              className='w-full h-9 rounded-md border bg-background px-3 text-sm'
            >
              <option value=''>{t('users.demo.dialog.packageNone')}</option>
              {PACKAGES.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.totalGb} GB)</option>
              ))}
            </select>
          </div>
          <div className='space-y-1'>
            <Label className='text-sm'>{t('users.demo.dialog.expiresLabel')}</Label>
            <Input type='date' value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} disabled={packageId === null} />
            <p className='text-xs text-muted-foreground'>{t('users.demo.dialog.expiresHint')}</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={onClose}>{t('users.demo.dialog.cancelBtn')}</Button>
          <Button onClick={() => onBind(user.id, packageId, packageId ? expiresAt : '-')}>
            <Power className='size-4 mr-1' />
            {t('users.demo.dialog.bindBtn')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
