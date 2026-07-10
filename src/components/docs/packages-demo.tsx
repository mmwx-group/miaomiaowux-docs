// 套餐管理 mock — 套餐列表 + 创建/编辑套餐 dialog(关联节点)。
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  Package,
  Plus,
  Edit3,
  Trash2,
  Users,
  HardDrive,
  Calendar,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type Pkg = {
  id: number
  name: string
  trafficGb: number
  cycleDays: number
  trafficMode: 'oneway-up' | 'oneway-down' | 'twoway'
  userCount: number
  nodes: number[]
}

const MOCK_NODES = [
  { id: 1, name: '🇭🇰 香港 GoMami - HKT' },
  { id: 2, name: '🇭🇰 香港 GoMami - Trojan' },
  { id: 3, name: '🇺🇸 美国 Megabox - Reality' },
  { id: 4, name: '🇯🇵 日本 Pulse - Hy2' },
  { id: 5, name: '🇸🇬 新加坡 LightNode' },
  { id: 6, name: '🇩🇪 德国 Hetzner - Reality' },
]

const INITIAL: Pkg[] = [
  { id: 1, name: '基础版',     trafficGb: 100, cycleDays: 30, trafficMode: 'twoway',     userCount: 18, nodes: [1, 2, 5] },
  { id: 2, name: '进阶版',     trafficGb: 300, cycleDays: 30, trafficMode: 'twoway',     userCount: 24, nodes: [1, 2, 3, 4, 5] },
  { id: 3, name: '尊享版',     trafficGb: 1024, cycleDays: 30, trafficMode: 'twoway',    userCount: 7,  nodes: [1, 2, 3, 4, 5, 6] },
  { id: 4, name: '体验版(7天)', trafficGb: 20,  cycleDays: 7,  trafficMode: 'oneway-down', userCount: 5,  nodes: [1, 5] },
]

export function PackagesDemo() {
  const { t } = useTranslation('xdocs')
  const [pkgs, setPkgs] = useState<Pkg[]>(INITIAL)
  const [dialogPkg, setDialogPkg] = useState<Pkg | 'new' | null>(null)

  const del = (id: number) => {
    const p = pkgs.find((x) => x.id === id)
    if (!p) return
    if (p.userCount > 0) {
      toast.error(t('packages.demo.cannotDeleteWithUsers', { count: p.userCount }))
      return
    }
    setPkgs((prev) => prev.filter((x) => x.id !== id))
    toast.success(t('packages.demo.deletedToast'))
  }

  const upsert = (data: Omit<Pkg, 'userCount'> & { userCount?: number }) => {
    if (pkgs.find((x) => x.id === data.id)) {
      setPkgs((prev) => prev.map((x) => (x.id === data.id ? { ...x, ...data, userCount: x.userCount } : x)))
      toast.success(t('packages.demo.savedToast'))
    } else {
      setPkgs((prev) => [...prev, { ...data, userCount: 0 }])
      toast.success(t('packages.demo.createdToast'))
    }
    setDialogPkg(null)
  }

  return (
    <Card className='border-dashed'>
      <CardContent className='pt-6 space-y-4'>
        <div className='flex items-center gap-2 flex-wrap'>
          <Badge variant='outline' className='text-xs'>{t('packages.demo.badge')}</Badge>
          <span className='text-xs text-muted-foreground'>{t('packages.demo.intro')}</span>
        </div>

        <div className='flex items-center justify-between gap-2'>
          <div className='flex items-center gap-2 text-sm'>
            <Package className='size-4 text-primary' />
            <span className='font-medium'>{t('packages.demo.heading')}</span>
            <Badge variant='secondary' className='text-[10px]'>{pkgs.length}</Badge>
          </div>
          <Button size='sm' onClick={() => setDialogPkg('new')}>
            <Plus className='size-3.5 mr-1' />
            {t('packages.demo.createBtn')}
          </Button>
        </div>

        {/* 套餐卡片网格 */}
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
          {pkgs.map((p) => (
            <div key={p.id} className='rounded-lg border bg-card p-4 space-y-3'>
              <div className='flex items-start justify-between gap-2'>
                <div>
                  <div className='font-semibold'>{p.name}</div>
                  <div className='flex items-center gap-2 mt-1 text-xs text-muted-foreground'>
                    <Users className='size-3' />
                    {t('packages.demo.userCount', { count: p.userCount })}
                  </div>
                </div>
                <div className='flex items-center gap-0.5'>
                  <Button size='icon' variant='ghost' className='size-7' onClick={() => setDialogPkg(p)} title={t('packages.demo.opEdit')}>
                    <Edit3 className='size-3.5' />
                  </Button>
                  <Button
                    size='icon'
                    variant='ghost'
                    className='size-7 hover:text-destructive'
                    onClick={() => del(p.id)}
                    title={t('packages.demo.opDelete')}
                  >
                    <Trash2 className='size-3.5' />
                  </Button>
                </div>
              </div>

              <div className='grid grid-cols-3 gap-2 text-xs'>
                <div className='rounded border bg-muted/30 p-2'>
                  <div className='text-muted-foreground flex items-center gap-1'>
                    <HardDrive className='size-3' />
                    {t('packages.demo.quotaLabel')}
                  </div>
                  <div className='font-semibold mt-0.5'>{p.trafficGb} GB</div>
                </div>
                <div className='rounded border bg-muted/30 p-2'>
                  <div className='text-muted-foreground flex items-center gap-1'>
                    <Calendar className='size-3' />
                    {t('packages.demo.cycleLabel')}
                  </div>
                  <div className='font-semibold mt-0.5'>{p.cycleDays} {t('packages.demo.days')}</div>
                </div>
                <div className='rounded border bg-muted/30 p-2'>
                  <div className='text-muted-foreground flex items-center gap-1'>
                    {p.trafficMode === 'twoway' && <ArrowLeftRight className='size-3' />}
                    {p.trafficMode === 'oneway-down' && <ArrowDownToLine className='size-3' />}
                    {p.trafficMode === 'oneway-up' && <ArrowUpFromLine className='size-3' />}
                    {t('packages.demo.modeLabel')}
                  </div>
                  <div className='font-semibold mt-0.5'>
                    {p.trafficMode === 'twoway' && t('packages.demo.modeTwoway')}
                    {p.trafficMode === 'oneway-down' && t('packages.demo.modeDownOnly')}
                    {p.trafficMode === 'oneway-up' && t('packages.demo.modeUpOnly')}
                  </div>
                </div>
              </div>

              <div>
                <div className='text-xs text-muted-foreground mb-1'>
                  {t('packages.demo.nodesLabel', { count: p.nodes.length })}
                </div>
                <div className='flex flex-wrap gap-1'>
                  {p.nodes.map((nid) => {
                    const n = MOCK_NODES.find((x) => x.id === nid)
                    return n ? (
                      <Badge key={nid} variant='outline' className='text-[10px]'>
                        {n.name}
                      </Badge>
                    ) : null
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 编辑 dialog */}
        {dialogPkg !== null && (
          <PackageDialog
            pkg={dialogPkg === 'new' ? null : dialogPkg}
            onClose={() => setDialogPkg(null)}
            onSave={upsert}
          />
        )}
      </CardContent>
    </Card>
  )
}

function PackageDialog({
  pkg,
  onClose,
  onSave,
}: {
  pkg: Pkg | null
  onClose: () => void
  onSave: (p: Omit<Pkg, 'userCount'> & { userCount?: number }) => void
}) {
  const { t } = useTranslation('xdocs')
  const isNew = !pkg
  const [name, setName] = useState(pkg?.name ?? '')
  const [trafficGb, setTrafficGb] = useState(String(pkg?.trafficGb ?? 100))
  const [cycleDays, setCycleDays] = useState(String(pkg?.cycleDays ?? 30))
  const [trafficMode, setTrafficMode] = useState<Pkg['trafficMode']>(pkg?.trafficMode ?? 'twoway')
  const [nodes, setNodes] = useState<number[]>(pkg?.nodes ?? [])

  const toggleNode = (id: number) => {
    setNodes((prev) => (prev.includes(id) ? prev.filter((n) => n !== id) : [...prev, id]))
  }

  const save = () => {
    if (!name.trim() || !trafficGb || !cycleDays) {
      toast.error(t('packages.demo.dialog.errorRequired'))
      return
    }
    onSave({
      id: pkg?.id ?? Date.now(),
      name: name.trim(),
      trafficGb: Number(trafficGb),
      cycleDays: Number(cycleDays),
      trafficMode,
      nodes,
    })
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>
            {isNew ? t('packages.demo.dialog.titleCreate') : t('packages.demo.dialog.titleEdit')}
          </DialogTitle>
          <DialogDescription>{t('packages.demo.dialog.desc')}</DialogDescription>
        </DialogHeader>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {/* 左:基本字段 */}
          <div className='space-y-3'>
            <div className='space-y-1'>
              <Label className='text-sm'>{t('packages.demo.dialog.nameLabel')}</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder='基础版' />
            </div>
            <div className='space-y-1'>
              <Label className='text-sm'>{t('packages.demo.dialog.quotaLabel')}</Label>
              <Input type='number' value={trafficGb} onChange={(e) => setTrafficGb(e.target.value)} />
            </div>
            <div className='space-y-1'>
              <Label className='text-sm'>{t('packages.demo.dialog.cycleLabel')}</Label>
              <Input type='number' value={cycleDays} onChange={(e) => setCycleDays(e.target.value)} />
            </div>
            <div className='space-y-1'>
              <Label className='text-sm'>{t('packages.demo.dialog.modeLabel')}</Label>
              <RadioGroup value={trafficMode} onValueChange={(v) => setTrafficMode(v as Pkg['trafficMode'])} className='space-y-1'>
                <ModeRadio value='twoway'       id='tm-1' icon={<ArrowLeftRight className='size-3.5' />}    label={t('packages.demo.modeTwoway')}    />
                <ModeRadio value='oneway-down'  id='tm-2' icon={<ArrowDownToLine className='size-3.5' />}   label={t('packages.demo.modeDownOnly')}  />
                <ModeRadio value='oneway-up'    id='tm-3' icon={<ArrowUpFromLine className='size-3.5' />}   label={t('packages.demo.modeUpOnly')}    />
              </RadioGroup>
            </div>
          </div>

          {/* 右:关联节点 */}
          <div className='space-y-2'>
            <Label className='text-sm'>{t('packages.demo.dialog.nodesLabel')}</Label>
            <div className='rounded border max-h-72 overflow-y-auto divide-y'>
              {MOCK_NODES.map((n) => (
                <label
                  key={n.id}
                  htmlFor={`pkg-n-${n.id}`}
                  className='flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-muted/30'
                >
                  <input
                    id={`pkg-n-${n.id}`}
                    type='checkbox'
                    checked={nodes.includes(n.id)}
                    onChange={() => toggleNode(n.id)}
                    className='size-4'
                  />
                  <span>{n.name}</span>
                </label>
              ))}
            </div>
            <p className='text-xs text-muted-foreground'>
              {t('packages.demo.dialog.nodesHint', { count: nodes.length })}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={onClose}>{t('packages.demo.dialog.cancelBtn')}</Button>
          <Button onClick={save}>{isNew ? t('packages.demo.dialog.createBtn') : t('packages.demo.dialog.saveBtn')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ModeRadio({ value, id, icon, label }: { value: string; id: string; icon: React.ReactNode; label: string }) {
  return (
    <div className='flex items-center gap-2 rounded-md border bg-card px-3 py-2'>
      <RadioGroupItem value={value} id={id} />
      <Label htmlFor={id} className='text-sm font-normal cursor-pointer flex items-center gap-1.5 flex-1'>
        {icon}
        {label}
      </Label>
    </div>
  )
}
