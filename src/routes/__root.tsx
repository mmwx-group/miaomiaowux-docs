import { type QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { useTranslation } from 'react-i18next'
import { Toaster } from '@/components/ui/sonner'
import { NavigationProgress } from '@/components/navigation-progress'
import { SearchCommandDialog } from '@/components/search/search-command-dialog'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  component: () => {
    return (
      <>
        <NavigationProgress />
        <SearchCommandDialog />
        <Outlet />
        <Toaster duration={5000} visibleToasts={5} />
        {import.meta.env.MODE === 'development' && (
          <>
            <ReactQueryDevtools buttonPosition='bottom-left' />
            <TanStackRouterDevtools position='bottom-right' />
          </>
        )}
      </>
    )
  },
  notFoundComponent: function NotFound() {
    const { t } = useTranslation('common')
    return (
      <div className='flex min-h-svh flex-col items-center justify-center gap-4 px-4 text-center'>
        <h1 className='text-3xl font-semibold tracking-tight'>{t('notFound.title')}</h1>
        <p className='text-muted-foreground'>{t('notFound.description')}</p>
      </div>
    )
  },
  errorComponent: function ErrorPage({ error }) {
    const { t } = useTranslation('common')
    return (
      <div className='flex min-h-svh flex-col items-center justify-center gap-4 px-4 text-center'>
        <h1 className='text-3xl font-semibold tracking-tight'>{t('error.title')}</h1>
        <p className='text-muted-foreground'>{error?.message ?? t('error.fallback')}</p>
      </div>
    )
  },
})
