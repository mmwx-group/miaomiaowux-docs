// 路由出站功能 mock — 节点管理表 + 创建落地节点 Dialog。
// 复刻 mmwx 节点管理页关键操作:启停 / 编辑 / 删除 / 路由出站(本文档重点)。
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  Plus,
  Trash2,
  Copy,
  Route as RouteIcon,
  Edit3,
  Power,
  Server,
  Network,
  ArrowRight,
  Globe,
  Loader2,
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

type MockNode = {
  id: number
  name: string
  server: string
  protocol: string
  online: boolean
  enabled: boolean
  upload: number
  download: number
  /** 该节点已有的路由出站子节点 */
  routedChildren: { id: number; name: string; via: string }[]
}

const INITIAL_NODES: MockNode[] = [
  { id: 1, name: '🇭🇰 HK直连',       server: 'hk1.example.com', protocol: 'VLESS',       online: true,  enabled: true,  upload: 12.3 * 1024 ** 3, download: 184.7 * 1024 ** 3, routedChildren: [] },
  { id: 2, name: '🇺🇸 US-Reality',   server: 'us1.example.com', protocol: 'VLESS',       online: true,  enabled: true,  upload:  3.1 * 1024 ** 3, download:  46.5 * 1024 ** 3, routedChildren: [] },
  { id: 3, name: '🇯🇵 JP-Hy2',       server: 'jp1.example.com', protocol: 'Hysteria2',   online: true,  enabled: true,  upload:  8.7 * 1024 ** 3, download: 112.3 * 1024 ** 3, routedChildren: [{ id: 101, name: '🇯🇵 JP → HK直连', via: 'HK直连' }] },
  { id: 4, name: '🇸🇬 SG-Trojan',    server: 'sg1.example.com', protocol: 'Trojan',      online: false, enabled: true,  upload:  0,               download:   0,               routedChildren: [] },
  { id: 5, name: '🇩🇪 DE-Reality',   server: 'de1.example.com', protocol: 'VLESS',       online: true,  enabled: false, upload:  1.4 * 1024 ** 3, download:  17.8 * 1024 ** 3, routedChildren: [] },
]

const fmtBytes = (n: number): string => {
  if (n === 0) return '0 B'
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(1)} KB`
  if (n < 1024 ** 3) return `${(n / 1024 ** 2).toFixed(1)} MB`
  if (n < 1024 ** 4) return `${(n / 1024 ** 3).toFixed(2)} GB`
  return `${(n / 1024 ** 4).toFixed(2)} TB`
}

export function RoutedOutboundDemo() {
  const { t } = useTranslation('xdocs')
  const [nodes, setNodes] = useState<MockNode[]>(INITIAL_NODES)
  const [routedDialog, setRoutedDialog] = useState<{ node: MockNode } | null>(null)
  const [editDialog, setEditDialog] = useState<{ node: MockNode } | null>(null)

  const toggleEnabled = (id: number) => {
    setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, enabled: !n.enabled } : n)))
    const n = nodes.find((x) => x.id === id)
    if (n) toast.success(`${n.name}:${n.enabled ? '已禁用' : '已启用'}`)
  }

  const deleteNode = (id: number) => {
    const n = nodes.find((x) => x.id === id)
    if (!n) return
    setNodes((prev) => prev.filter((x) => x.id !== id))
    toast.success(`节点 ${n.name} 已删除`)
  }

  const copyNode = (n: MockNode) => {
    toast.success(`已复制节点 ${n.name} 的订阅链接(mock)`)
  }

  const addRoutedChild = (parentId: number, child: { name: string; via: string }) => {
    setNodes((prev) =>
      prev.map((n) =>
        n.id === parentId
          ? { ...n, routedChildren: [...n.routedChildren, { id: Date.now(), ...child }] }
          : n
      )
    )
  }

  const removeRoutedChild = (parentId: number, childId: number) => {
    setNodes((prev) =>
      prev.map((n) =>
        n.id === parentId
          ? { ...n, routedChildren: n.routedChildren.filter((c) => c.id !== childId) }
          : n
      )
    )
  }

  return (
    <Card className='border-dashed'>
      <CardContent className='pt-6'>
        <div className='mb-4 flex items-center gap-2'>
          <Badge variant='outline' className='text-xs'>{t('routedOutbound.demo.badge')}</Badge>
          <span className='text-xs text-muted-foreground'>{t('routedOutbound.demo.intro')}</span>
        </div>

        {/* mock 节点管理表 */}
        <div className='rounded-lg border bg-card overflow-hidden'>
          <div className='flex items-center justify-between gap-2 px-3 py-2 border-b bg-muted/30'>
            <div className='flex items-center gap-2 text-sm font-medium'>
              <Network className='size-4 text-primary' />
              {t('routedOutbound.demo.nodeList')}
              <Badge variant='secondary' className='ml-1 text-[10px]'>{nodes.length}</Badge>
            </div>
            <Button size='sm' variant='outline'>
              <Plus className='size-3.5 mr-1' />
              {t('routedOutbound.demo.addBtn')}
            </Button>
          </div>

          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead className='bg-muted/20 text-xs text-muted-foreground'>
                <tr>
                  <th className='text-left py-2 px-3 font-medium'>{t('routedOutbound.demo.col.name')}</th>
                  <th className='text-left py-2 px-3 font-medium'>{t('routedOutbound.demo.col.server')}</th>
                  <th className='text-left py-2 px-3 font-medium'>{t('routedOutbound.demo.col.protocol')}</th>
                  <th className='text-right py-2 px-3 font-medium whitespace-nowrap'>{t('routedOutbound.demo.col.traffic')}</th>
                  <th className='text-center py-2 px-3 font-medium'>{t('routedOutbound.demo.col.status')}</th>
                  <th className='text-right py-2 px-3 font-medium'>{t('routedOutbound.demo.col.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {nodes.map((n) => (
                  <tr key={n.id} className='border-t hover:bg-muted/20 transition-colors'>
                    <td className='py-2 px-3'>
                      <div className='font-medium truncate max-w-[200px]'>{n.name}</div>
                      {n.routedChildren.length > 0 && (
                        <div className='mt-1 flex flex-wrap gap-1'>
                          {n.routedChildren.map((c) => (
                            <Badge
                              key={c.id}
                              variant='secondary'
                              className='gap-1 text-[10px] pr-1'
                            >
                              <RouteIcon className='size-2.5' />
                              {c.name}
                              <button
                                onClick={() => removeRoutedChild(n.id, c.id)}
                                className='ml-0.5 hover:text-destructive'
                                title={t('routedOutbound.demo.removeChildTitle')}
                              >
                                <Trash2 className='size-2.5' />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className='py-2 px-3 text-xs text-muted-foreground font-mono'>{n.server}</td>
                    <td className='py-2 px-3'>
                      <Badge variant='outline' className='text-[10px]'>{n.protocol}</Badge>
                    </td>
                    <td className='py-2 px-3 text-right whitespace-nowrap text-xs tabular-nums'>
                      <div className='text-green-600 dark:text-green-400'>↑ {fmtBytes(n.upload)}</div>
                      <div className='text-blue-600 dark:text-blue-400'>↓ {fmtBytes(n.download)}</div>
                    </td>
                    <td className='py-2 px-3 text-center'>
                      <div className='flex items-center justify-center gap-1.5'>
                        <span
                          className={`inline-block size-2 rounded-full ${
                            n.online ? 'bg-green-500' : 'bg-muted-foreground/40'
                          }`}
                          title={n.online ? t('routedOutbound.demo.online') : t('routedOutbound.demo.offline')}
                        />
                        {!n.enabled && (
                          <Badge variant='outline' className='text-[10px] border-destructive/30 text-destructive'>
                            {t('routedOutbound.demo.disabled')}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className='py-2 px-3'>
                      <div className='flex items-center justify-end gap-0.5'>
                        <Button
                          size='icon'
                          variant='ghost'
                          className='size-7'
                          onClick={() => toggleEnabled(n.id)}
                          title={n.enabled ? t('routedOutbound.demo.opDisable') : t('routedOutbound.demo.opEnable')}
                        >
                          <Power className={`size-3.5 ${n.enabled ? 'text-primary' : 'text-muted-foreground'}`} />
                        </Button>
                        <Button
                          size='icon'
                          variant='ghost'
                          className='size-7'
                          onClick={() => copyNode(n)}
                          title={t('routedOutbound.demo.opCopy')}
                        >
                          <Copy className='size-3.5' />
                        </Button>
                        <Button
                          size='icon'
                          variant='ghost'
                          className='size-7 text-primary hover:text-primary hover:bg-primary/10'
                          onClick={() => setRoutedDialog({ node: n })}
                          title={t('routedOutbound.demo.opRouted')}
                        >
                          <RouteIcon className='size-3.5' />
                        </Button>
                        <Button
                          size='icon'
                          variant='ghost'
                          className='size-7'
                          onClick={() => setEditDialog({ node: n })}
                          title={t('routedOutbound.demo.opEdit')}
                        >
                          <Edit3 className='size-3.5' />
                        </Button>
                        <Button
                          size='icon'
                          variant='ghost'
                          className='size-7 hover:text-destructive'
                          onClick={() => deleteNode(n.id)}
                          title={t('routedOutbound.demo.opDelete')}
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

          {/* 表底说明 */}
          <div className='border-t bg-muted/10 px-3 py-2 text-[11px] text-muted-foreground flex items-start gap-2'>
            <RouteIcon className='size-3.5 mt-0.5 shrink-0 text-primary' />
            <span>{t('routedOutbound.demo.hint')}</span>
          </div>
        </div>

        {/* 创建落地节点 Dialog */}
        {routedDialog && (
          <CreateRoutedNodeDialog
            sourceNode={routedDialog.node}
            allNodes={nodes}
            onClose={() => setRoutedDialog(null)}
            onCreated={(child) => {
              addRoutedChild(routedDialog.node.id, child)
              setRoutedDialog(null)
            }}
          />
        )}

        {/* 编辑节点 Dialog(简版) */}
        {editDialog && (
          <Dialog open onOpenChange={(o) => !o && setEditDialog(null)}>
            <DialogContent className='sm:max-w-md'>
              <DialogHeader>
                <DialogTitle>{t('routedOutbound.demo.edit.title')}</DialogTitle>
                <DialogDescription>{t('routedOutbound.demo.edit.desc')}</DialogDescription>
              </DialogHeader>
              <div className='space-y-3'>
                <div className='space-y-1'>
                  <Label className='text-xs'>{t('routedOutbound.demo.col.name')}</Label>
                  <Input defaultValue={editDialog.node.name} />
                </div>
                <div className='space-y-1'>
                  <Label className='text-xs'>{t('routedOutbound.demo.col.server')}</Label>
                  <Input defaultValue={editDialog.node.server} className='font-mono text-xs' />
                </div>
                <div className='space-y-1'>
                  <Label className='text-xs'>{t('routedOutbound.demo.col.protocol')}</Label>
                  <Input defaultValue={editDialog.node.protocol} />
                </div>
              </div>
              <DialogFooter>
                <Button variant='outline' onClick={() => setEditDialog(null)}>
                  {t('routedOutbound.demo.cancelBtn')}
                </Button>
                <Button onClick={() => { toast.success('已保存(mock)'); setEditDialog(null) }}>
                  {t('routedOutbound.demo.saveBtn')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  )
}

function CreateRoutedNodeDialog({
  sourceNode,
  allNodes,
  onClose,
  onCreated,
}: {
  sourceNode: MockNode
  allNodes: MockNode[]
  onClose: () => void
  onCreated: (child: { name: string; via: string }) => void
}) {
  const { t } = useTranslation('xdocs')
  const [scope, setScope] = useState<'public' | 'private'>('public')
  const [targetTag, setTargetTag] = useState<string>(allNodes[0]?.name || '')
  const [name, setName] = useState(`${sourceNode.name} → ${allNodes[0]?.name || ''}`)
  const [submitting, setSubmitting] = useState(false)

  // 候选目标:其他节点(排除自己)
  const candidates = useMemo(
    () => allNodes.filter((n) => n.id !== sourceNode.id),
    [allNodes, sourceNode.id]
  )

  // 选择目标时自动生成名称
  const handlePickTarget = (tag: string) => {
    setTargetTag(tag)
    setName(`${sourceNode.name} → ${tag}`)
  }

  const submit = async () => {
    if (!name.trim() || !targetTag) {
      toast.error(t('routedOutbound.demo.createDialog.errorRequired'))
      return
    }
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 600))
    onCreated({ name: name.trim(), via: targetTag })
    toast.success(t('routedOutbound.demo.createDialog.success', { name: name.trim() }))
    setSubmitting(false)
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <RouteIcon className='size-5 text-primary' />
            {t('routedOutbound.demo.createDialog.title')}
          </DialogTitle>
          <DialogDescription>
            {t('routedOutbound.demo.createDialog.desc', { source: sourceNode.name })}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          {/* 作用范围 */}
          <div className='space-y-2'>
            <Label className='text-sm font-semibold'>{t('routedOutbound.demo.createDialog.scopeLabel')}</Label>
            <RadioGroup
              value={scope}
              onValueChange={(v) => setScope(v as 'public' | 'private')}
              className='space-y-2'
            >
              <label
                htmlFor='scope-public'
                className={`flex items-start gap-3 rounded-md border p-3 cursor-pointer transition ${
                  scope === 'public' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/30'
                }`}
              >
                <RadioGroupItem value='public' id='scope-public' className='mt-0.5' />
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center gap-2 font-medium text-sm'>
                    <Globe className='size-4' />
                    {t('routedOutbound.demo.createDialog.scopePublic')}
                  </div>
                  <p className='text-xs text-muted-foreground mt-1'>{t('routedOutbound.demo.createDialog.scopePublicDesc')}</p>
                </div>
              </label>
              <label
                htmlFor='scope-private'
                className={`flex items-start gap-3 rounded-md border p-3 cursor-pointer transition ${
                  scope === 'private' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/30'
                }`}
              >
                <RadioGroupItem value='private' id='scope-private' className='mt-0.5' />
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center gap-2 font-medium text-sm'>
                    <Server className='size-4' />
                    {t('routedOutbound.demo.createDialog.scopePrivate')}
                  </div>
                  <p className='text-xs text-muted-foreground mt-1'>{t('routedOutbound.demo.createDialog.scopePrivateDesc')}</p>
                </div>
              </label>
            </RadioGroup>
          </div>

          {/* 中转节点(源) */}
          <div className='rounded-md border bg-muted/20 p-3'>
            <Label className='text-xs text-muted-foreground'>{t('routedOutbound.demo.createDialog.sourceLabel')}</Label>
            <div className='mt-1 flex items-center gap-2 text-sm font-medium'>
              <Network className='size-4 text-muted-foreground' />
              {sourceNode.name}
              <Badge variant='outline' className='text-[10px]'>{sourceNode.protocol}</Badge>
              <span className='text-xs text-muted-foreground font-mono'>{sourceNode.server}</span>
            </div>
          </div>

          {/* 目标节点 */}
          <div className='space-y-1.5'>
            <Label className='text-sm font-semibold'>{t('routedOutbound.demo.createDialog.targetLabel')}</Label>
            <p className='text-xs text-muted-foreground'>{t('routedOutbound.demo.createDialog.targetHint')}</p>
            <div className='rounded-md border max-h-48 overflow-y-auto'>
              {candidates.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handlePickTarget(n.name)}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-sm text-left transition border-b last:border-b-0 ${
                    targetTag === n.name ? 'bg-primary/10 text-primary' : 'hover:bg-muted/30'
                  }`}
                >
                  <span className='flex items-center gap-2 min-w-0'>
                    <ArrowRight className='size-3.5 shrink-0' />
                    <span className='truncate'>{n.name}</span>
                    <Badge variant='outline' className='text-[10px] shrink-0'>{n.protocol}</Badge>
                  </span>
                  <span className='text-xs text-muted-foreground font-mono shrink-0 truncate max-w-[140px]'>{n.server}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 落地节点名称 */}
          <div className='space-y-1.5'>
            <Label htmlFor='routed-name' className='text-sm font-semibold'>
              {t('routedOutbound.demo.createDialog.nameLabel')}
            </Label>
            <Input
              id='routed-name'
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`${sourceNode.name} → ...`}
            />
            <p className='text-xs text-muted-foreground'>{t('routedOutbound.demo.createDialog.nameHint')}</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={onClose}>
            {t('routedOutbound.demo.cancelBtn')}
          </Button>
          <Button onClick={submit} disabled={submitting}>
            {submitting ? <Loader2 className='size-4 mr-2 animate-spin' /> : <Plus className='size-4 mr-2' />}
            {t('routedOutbound.demo.createDialog.submitBtn')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
