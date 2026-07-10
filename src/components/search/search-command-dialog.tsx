import { useState, useEffect, useMemo, useCallback } from 'react'
import Fuse from 'fuse.js'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { getSearchItems, type SearchItem } from '@/lib/search-data'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from '@/components/ui/command'

function getSnippet(content: string, query: string, maxLen = 60): string {
  if (!content || !query) return ''
  const lower = content.toLowerCase()
  const qLower = query.toLowerCase()
  const idx = lower.indexOf(qLower)
  if (idx === -1) return ''
  const start = Math.max(0, idx - 20)
  const end = Math.min(content.length, idx + query.length + maxLen - 20)
  let snippet = content.slice(start, end)
  if (start > 0) snippet = '...' + snippet
  if (end < content.length) snippet = snippet + '...'
  return snippet
}

// 把 query 按 2-gram 切词,匹配索引侧的 ngramContent。
// 中文相邻字符 → 2-gram(链式 / 式代 / 代理);单字 → 单字。
// latin / 数字 → 原样保留。Fuse 见空白即分 token。
function tokenizeQuery(q: string): string {
  const tokens: string[] = []
  let i = 0
  while (i < q.length) {
    const ch = q[i]
    if (/[一-鿿]/.test(ch)) {
      if (i + 1 < q.length && /[一-鿿]/.test(q[i + 1])) {
        tokens.push(q.slice(i, i + 2))
      } else {
        tokens.push(ch)
      }
      i++
    } else if (/[A-Za-z0-9_]/.test(ch)) {
      let j = i
      while (j < q.length && /[A-Za-z0-9_]/.test(q[j])) j++
      tokens.push(q.slice(i, j))
      i = j
    } else {
      i++
    }
  }
  return tokens.join(' ')
}

export function SearchCommandDialog() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const { t, i18n } = useTranslation('search')

  const items = useMemo(() => getSearchItems(), [i18n.language])

  const sections = useMemo(() => [t('sections.docs')], [t])

  const fuse = useMemo(
    () =>
      new Fuse(items, {
        keys: [
          { name: 'title', weight: 3 },
          { name: 'description', weight: 1.5 },
          { name: 'ngramContent', weight: 1.2 },
          { name: 'content', weight: 1 },
        ],
        threshold: 0.3,
        includeScore: true,
        ignoreLocation: true,
        minMatchCharLength: 1,
      }),
    [items]
  )

  const results = useMemo(() => {
    if (!query.trim()) return items
    const tokenized = tokenizeQuery(query)
    return fuse.search(tokenized).map((r) => r.item)
  }, [query, fuse, items])

  const groupedResults = useMemo(() => {
    const groups: Record<string, SearchItem[]> = {}
    for (const section of sections) {
      const sectionItems = results.filter((r) => r.section === section)
      if (sectionItems.length > 0) groups[section] = sectionItems
    }
    return groups
  }, [results, sections])

  const handleSelect = useCallback(
    (href: string) => {
      setOpen(false)
      setQuery('')
      navigate({ to: href })
    },
    [navigate]
  )

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    const onOpenSearch = () => setOpen(true)
    document.addEventListener('open-search', onOpenSearch)
    return () => document.removeEventListener('open-search', onOpenSearch)
  }, [])

  const handleOpenChange = useCallback((value: boolean) => {
    setOpen(value)
    if (!value) setQuery('')
  }, [])

  const trimmedQuery = query.trim()

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogHeader className='sr-only'>
        <DialogTitle>{t('title')}</DialogTitle>
        <DialogDescription>{t('description')}</DialogDescription>
      </DialogHeader>
      <DialogContent className='overflow-hidden p-0 sm:max-w-lg' showCloseButton={false}>
        <Command shouldFilter={false} className='[&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group]]:px-2 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0'>
          <CommandInput
            placeholder={t('placeholder')}
            value={query}
            onValueChange={setQuery}
          />
          <CommandList className='max-h-[360px]'>
            <CommandEmpty>{t('empty')}</CommandEmpty>
            {Object.entries(groupedResults).map(([section, sectionItems], idx) => (
              <div key={section}>
                {idx > 0 && <CommandSeparator />}
                <CommandGroup heading={section}>
                  {sectionItems.map((item) => {
                    const snippet = trimmedQuery ? getSnippet(item.content, trimmedQuery) : ''
                    return (
                      <CommandItem
                        key={item.href}
                        value={item.href}
                        onSelect={() => handleSelect(item.href)}
                        className='cursor-pointer'
                      >
                        <item.icon className='size-4 shrink-0' />
                        <div className='flex flex-col min-w-0'>
                          <span>{item.title}</span>
                          {snippet && (
                            <span className='text-xs text-muted-foreground truncate'>
                              {snippet}
                            </span>
                          )}
                        </div>
                        {!snippet && item.description && (
                          <span className='ml-auto text-xs text-muted-foreground truncate'>
                            {item.description}
                          </span>
                        )}
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              </div>
            ))}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  )
}
