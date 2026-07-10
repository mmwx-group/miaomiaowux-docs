import { Link, useLocation } from '@tanstack/react-router'
import { ChevronRight, Home } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useXDocNavItems } from './x-doc-sidebar'

interface DocBreadcrumbProps {
  className?: string
}

export function DocBreadcrumb({ className }: DocBreadcrumbProps) {
  const location = useLocation()
  const { t } = useTranslation('layout')
  const navItems = useXDocNavItems()
  const currentPath = location.pathname

  let parentItem: { id: string; label: string } | null = null
  let currentItem: { id: string; label: string; href: string } | null = null

  for (const item of navItems) {
    const child = item.children?.find((c) => c.href === currentPath)
    if (child && child.href) {
      parentItem = { id: item.id, label: item.label }
      currentItem = { id: child.id, label: child.label, href: child.href }
      break
    }
  }

  return (
    <nav className={className} aria-label='Breadcrumb'>
      <ol className='flex items-center gap-2 text-sm text-muted-foreground'>
        <li>
          <Link
            to='/docs'
            className='flex items-center gap-1 hover:text-foreground transition-colors'
          >
            <Home className='size-4' />
            <span>{t('breadcrumb.docs')}</span>
          </Link>
        </li>
        {parentItem && (
          <>
            <li>
              <ChevronRight className='size-4' />
            </li>
            <li>
              <span>{parentItem.label}</span>
            </li>
          </>
        )}
        {currentItem && (
          <>
            <li>
              <ChevronRight className='size-4' />
            </li>
            <li>
              <span className='text-foreground font-medium'>{currentItem.label}</span>
            </li>
          </>
        )}
      </ol>
    </nav>
  )
}
