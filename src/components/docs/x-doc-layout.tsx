import { ReactNode, useState, useEffect, useRef } from 'react'
import { Link } from '@tanstack/react-router'
import { XDocSidebar } from './x-doc-sidebar'
import { DocBreadcrumb } from './doc-breadcrumb'
import { ThemeSwitch } from '@/components/theme-switch'
import { AnimatedX } from '@/components/animated-x'
import { ChevronUp, Menu, X, Github, List } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { SearchTrigger } from '@/components/search/search-trigger'
import { LanguageSwitch } from '@/components/language-switch'

interface TocItem {
  id: string
  label: string
  level: number
}

interface XDocLayoutProps {
  children: ReactNode
  title?: string
  description?: string
}

export function XDocLayout({ children, title, description }: XDocLayoutProps) {
  const { t } = useTranslation('layout')
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [tocOpen, setTocOpen] = useState(false)
  const [tableOfContents, setTableOfContents] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState<string>('')
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!contentRef.current) return
    const headings = contentRef.current.querySelectorAll('h2, h3')
    const items: TocItem[] = []
    headings.forEach((heading, index) => {
      let label = ''
      heading.childNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          label += node.textContent
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as Element
          if (el.tagName !== 'svg' && !el.classList.contains('lucide')) {
            label += el.textContent
          }
        }
      })
      label = label.trim()
      if (!label) label = heading.textContent?.trim() || ''
      const id = heading.id || `section-${label.replace(/\s+/g, '-').replace(/[^\w\u4e00-\u9fa5-]/g, '').toLowerCase() || index}`
      heading.id = id
      items.push({ id, label, level: heading.tagName === 'H2' ? 1 : 2 })
    })
    setTableOfContents(items)
  }, [children])

  useEffect(() => {
    if (tableOfContents.length === 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id)
        })
      },
      { rootMargin: '-80px 0px -80% 0px', threshold: 0 }
    )
    tableOfContents.forEach((item) => {
      const element = document.getElementById(item.id)
      if (element) observer.observe(element)
    })
    return () => observer.disconnect()
  }, [tableOfContents])

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 400)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // SPA 内路由切换时同步 document.title:`妙妙屋X - 当前页`
  useEffect(() => {
    if (title) document.title = `妙妙屋X - ${title}`
  }, [title])

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const headerOffset = 80
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' })
    }
    setTocOpen(false)
  }

  return (
    <div className='min-h-screen bg-background'>
      <header className='sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
        <div className='flex h-14 items-center px-4 lg:px-6'>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className='mr-4 lg:hidden'
            aria-label='Toggle sidebar'
          >
            {sidebarOpen ? <X className='size-5' /> : <Menu className='size-5' />}
          </button>
          <Link to='/' className='flex items-center gap-2 font-semibold'>
            <img src='/images/logo.webp' alt={t('common:brandX')} className='size-8' />
            <span>{t('common:brand')} <AnimatedX size='sm' /> </span>
          </Link>
          <div className='flex-1' />
          <div className='flex items-center gap-2'>
            <SearchTrigger />
            <Link
              to='/docs'
              className='inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors'
            >
              {t('xDocLayout.mmwDocs')}
            </Link>
            {tableOfContents.length > 0 && (
              <button
                onClick={() => setTocOpen(!tocOpen)}
                className='xl:hidden p-2 text-muted-foreground hover:text-foreground transition-colors'
                aria-label={t('docLayout.tocAria')}
              >
                <List className='size-5' />
              </button>
            )}
            <a
              href='https://github.com/iluobei/miaomiaowu'
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors'
            >
              <Github className='size-4' />
              <span className='hidden sm:inline'>GitHub</span>
            </a>
            <LanguageSwitch />
            <ThemeSwitch />
          </div>
        </div>
      </header>

      <div className='flex'>
        <aside className='hidden lg:block w-64 border-r bg-background/30 backdrop-blur h-[calc(100vh-3.5rem)] sticky top-14 overflow-y-auto'>
          <div className='p-4'>
            <XDocSidebar />
          </div>
        </aside>

        {sidebarOpen && (
          <div className='fixed inset-0 z-40 lg:hidden'>
            <div className='fixed inset-0 bg-background/80 backdrop-blur-sm' onClick={() => setSidebarOpen(false)} />
            <aside className='fixed left-0 top-14 h-[calc(100vh-3.5rem)] w-64 border-r bg-background overflow-y-auto'>
              <div className='p-4'>
                <XDocSidebar />
              </div>
            </aside>
          </div>
        )}

        <main className='flex-1 min-w-0'>
          <div className='max-w-4xl mx-auto px-4 py-6 lg:px-8 lg:py-8'>
            <DocBreadcrumb className='mb-6' />
            {title && (
              <div className='mb-8'>
                <h1 className='text-3xl font-bold tracking-tight mb-2'>{title}</h1>
                {description && <p className='text-lg text-muted-foreground'>{description}</p>}
              </div>
            )}
            <div ref={contentRef} className='prose prose-neutral dark:prose-invert max-w-none'>
              {children}
            </div>
          </div>
        </main>

        {tableOfContents.length > 0 && (
          <aside className='hidden xl:block w-56 border-l bg-background/30 backdrop-blur h-[calc(100vh-3.5rem)] sticky top-14 overflow-y-auto'>
            <div className='p-4'>
              <h3 className='text-sm font-semibold mb-3 text-muted-foreground'>{t('docLayout.toc')}</h3>
              <nav className='space-y-1 text-sm'>
                {tableOfContents.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={cn(
                      'block w-full text-left px-2 py-1.5 rounded transition-colors text-sm',
                      item.level === 2 && 'pl-4 text-xs',
                      activeId === item.id
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          </aside>
        )}

        {tocOpen && tableOfContents.length > 0 && (
          <div className='fixed inset-0 z-40 xl:hidden'>
            <div className='fixed inset-0 bg-background/80 backdrop-blur-sm' onClick={() => setTocOpen(false)} />
            <aside className='fixed right-0 top-14 h-[calc(100vh-3.5rem)] w-64 border-l bg-background overflow-y-auto'>
              <div className='p-4'>
                <h3 className='text-sm font-semibold mb-3 text-muted-foreground'>{t('docLayout.toc')}</h3>
                <nav className='space-y-1 text-sm'>
                  {tableOfContents.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className={cn(
                        'block w-full text-left px-2 py-1.5 rounded transition-colors text-sm',
                        item.level === 2 && 'pl-4 text-xs',
                        activeId === item.id
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                      )}
                    >
                      {item.label}
                    </button>
                  ))}
                </nav>
              </div>
            </aside>
          </div>
        )}
      </div>

      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className='fixed bottom-8 right-8 p-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all z-40'
          aria-label={t('docLayout.backToTop')}
        >
          <ChevronUp className='size-5' />
        </button>
      )}
    </div>
  )
}
