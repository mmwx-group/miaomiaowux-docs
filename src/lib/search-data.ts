import { FileCode } from 'lucide-react'
import { xNavStructure } from '@/components/docs/x-doc-sidebar'
import { searchIndex } from '@/generated/search-index'
import i18n from '@/i18n'

export type SearchItem = {
  title: string
  description: string
  content: string
  ngramContent: string
  href: string
  section: string
  icon: React.ComponentType<{ className?: string }>
}

type NavIcon = React.ComponentType<{ className?: string }>

function buildIconMap(
  items: { icon: NavIcon; href?: string; children?: { icon: NavIcon; href?: string; children?: unknown[] }[] }[],
): Map<string, NavIcon> {
  const map = new Map<string, NavIcon>()
  for (const item of items) {
    if (item.href && item.icon) map.set(item.href, item.icon)
    if (item.children) {
      for (const [k, v] of buildIconMap(item.children as typeof items)) map.set(k, v)
    }
  }
  return map
}

const iconMap = buildIconMap(xNavStructure as Parameters<typeof buildIconMap>[0])

export function getSearchItems(): SearchItem[] {
  const t = i18n.t.bind(i18n)
  const docsLabel = t('search:sections.docs')

  return searchIndex.map((entry) => ({
    title: entry.pageTitle,
    description: entry.description,
    content: entry.content,
    ngramContent: entry.ngramContent ?? '',
    href: entry.href,
    section: docsLabel,
    icon: iconMap.get(entry.href) ?? FileCode,
  }))
}

export const searchItems: SearchItem[] = getSearchItems()
