import { Search } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

function useIsMac() {
  const [isMac] = useState(
    () => typeof navigator !== 'undefined' && (navigator.platform?.toUpperCase().includes('MAC') ?? false)
  )
  return isMac
}

interface SearchTriggerProps {
  className?: string
}

export function SearchTrigger({ className }: SearchTriggerProps) {
  const isMac = useIsMac()
  const { t } = useTranslation('search')

  return (
    <button
      onClick={() => document.dispatchEvent(new CustomEvent('open-search'))}
      className={cn(
        'inline-flex items-center gap-2 rounded-md border border-input bg-background/75 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground',
        className
      )}
    >
      <Search className='size-4' />
      <span className='hidden sm:inline'>{t('trigger')}</span>
      <kbd className='pointer-events-none hidden select-none items-center gap-0.5 rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium sm:inline-flex'>
        {isMac ? '⌘' : 'Ctrl '}K
      </kbd>
    </button>
  )
}
