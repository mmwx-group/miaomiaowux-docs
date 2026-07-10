import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { XDocLayout } from '@/components/docs/x-doc-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Loader2,
  AlertCircle,
  Sparkles,
  Wrench,
  ChevronDown,
  ExternalLink,
} from 'lucide-react'

export const Route = createFileRoute('/docs/changelog')({
  component: ChangelogPage,
})

interface Release {
  tag_name: string
  name: string
  body: string
  published_at: string
  html_url: string
}

interface ChangelogItem {
  type: 'feature' | 'fix' | 'other'
  text: string
}

function parseChangelog(body: string): ChangelogItem[] {
  const items: ChangelogItem[] = []
  const lines = body.split('\n')

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith('- 🌈') || trimmed.startsWith('🌈')) {
      items.push({
        type: 'feature',
        text: trimmed.replace(/^-?\s*🌈\s*/, '').trim(),
      })
    } else if (
      trimmed.startsWith('- 🛠️') ||
      trimmed.startsWith('🛠️') ||
      trimmed.startsWith('- 🛠')
    ) {
      items.push({
        type: 'fix',
        text: trimmed
          .replace(/^-?\s*🛠️?\s*/, '')
          .replace(/^fix:?\s*/i, '')
          .trim(),
      })
    }
  }

  return items
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

function getRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '昨天'
  if (diffDays < 7) return `${diffDays} 天前`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} 周前`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} 个月前`
  return `${Math.floor(diffDays / 365)} 年前`
}

function ChangelogPage() {
  const { t } = useTranslation('xdocs')
  const [releases, setReleases] = useState<Release[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    const fetchReleases = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(
          'https://api.github.com/repos/iluobei/miaomiaowux/releases'
        )
        if (!response.ok) {
          throw new Error('Failed to fetch releases')
        }
        const data = await response.json()
        setReleases(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchReleases()
  }, [])

  const displayedReleases = showAll ? releases : releases.slice(0, 10)

  return (
    <XDocLayout title={t('changelog.title')} description={t('changelog.description')}>
      <div className='mb-4'>
        <a
          href='https://github.com/iluobei/miaomiaowux/releases'
          target='_blank'
          rel='noopener noreferrer'
          className='inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors'
        >
          {t('changelog.viewOnGithub')}
          <ExternalLink className='size-3' />
        </a>
      </div>

      {loading && (
        <div className='flex items-center justify-center py-20'>
          <Loader2 className='size-8 animate-spin text-primary' />
        </div>
      )}

      {error && (
        <div className='flex flex-col items-center justify-center py-20 text-muted-foreground'>
          <AlertCircle className='size-8 mb-4' />
          <p className='mb-2'>{t('changelog.loadFailed')}</p>
          <p className='text-sm mb-4'>{error}</p>
          <Button variant='outline' size='sm' onClick={() => window.location.reload()}>
            {t('changelog.retry')}
          </Button>
        </div>
      )}

      {!loading && !error && (
        <div className='space-y-6'>
          {displayedReleases.map((release, index) => {
            const changes = parseChangelog(release.body)
            const features = changes.filter((c) => c.type === 'feature')
            const fixes = changes.filter((c) => c.type === 'fix')
            const isLatest = index === 0

            return (
              <Card key={release.tag_name} className={isLatest ? 'border-primary/50' : ''}>
                <CardContent className='pt-6'>
                  <div className='flex items-center gap-3 flex-wrap mb-4'>
                    <Badge
                      variant={isLatest ? 'default' : 'secondary'}
                      className={`font-mono ${isLatest ? 'bg-primary' : ''}`}
                    >
                      {release.tag_name}
                    </Badge>
                    {isLatest && (
                      <Badge
                        variant='outline'
                        className='text-green-600 border-green-600/50 bg-green-500/10'
                      >
                        {t('changelog.latestVersion')}
                      </Badge>
                    )}
                    <div className='flex-1' />
                    <span className='text-xs text-muted-foreground'>
                      {formatDate(release.published_at)} · {getRelativeTime(release.published_at)}
                    </span>
                  </div>

                  <div className='text-sm space-y-4'>
                    {features.length > 0 && (
                      <div>
                        <h4 className='font-semibold text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-2'>
                          <Sparkles className='size-4' />
                          {t('changelog.newFeatures')}
                        </h4>
                        <ul className='space-y-1 ml-6'>
                          {features.map((item, i) => (
                            <li key={i} className='text-foreground/90'>
                              <span className='text-amber-500 mr-2'>•</span>
                              {item.text}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {fixes.length > 0 && (
                      <div>
                        <h4 className='font-semibold text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-2'>
                          <Wrench className='size-4' />
                          {t('changelog.bugFixes')}
                        </h4>
                        <ul className='space-y-1 ml-6'>
                          {fixes.map((item, i) => (
                            <li key={i} className='text-muted-foreground'>
                              <span className='text-blue-500 mr-2'>•</span>
                              {item.text}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {features.length === 0 && fixes.length === 0 && (
                      <p className='text-muted-foreground italic'>
                        {t('changelog.viewDetails')}{' '}
                        <a
                          href={release.html_url}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-primary hover:underline'
                        >
                          GitHub Release
                        </a>
                      </p>
                    )}
                  </div>

                  <div className='mt-4 pt-3 border-t border-border/50'>
                    <a
                      href={release.html_url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors'
                    >
                      {t('changelog.viewFullNotes')}
                      <ExternalLink className='size-3' />
                    </a>
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {!showAll && releases.length > 10 && (
            <div className='text-center'>
              <Button variant='outline' onClick={() => setShowAll(true)} className='gap-2'>
                <ChevronDown className='size-4' />
                {t('changelog.loadMore', { count: releases.length - 10 })}
              </Button>
            </div>
          )}
        </div>
      )}
    </XDocLayout>
  )
}
