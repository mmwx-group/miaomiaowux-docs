import { createFileRoute, Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { XDocLayout } from '@/components/docs/x-doc-layout'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowRight, Users, Download, Wrench, Server, Network, Globe } from 'lucide-react'

export const Route = createFileRoute('/docs/faq')({
  component: FaqOverviewPage,
})

const SECTIONS = [
  { href: '/docs/faq-carpool',            ns: 'carpool',          icon: Users },
  { href: '/docs/faq-install-deploy',     ns: 'installDeploy',    icon: Download },
  { href: '/docs/faq-common-ops',         ns: 'commonOps',        icon: Wrench },
  { href: '/docs/faq-server-management',  ns: 'serverManagement', icon: Server },
  { href: '/docs/faq-protocol-inbound',   ns: 'protocolInbound',  icon: Network },
  { href: '/docs/faq-sub-client',         ns: 'subClient',        icon: Globe },
] as const

function FaqOverviewPage() {
  const { t } = useTranslation('xdocs')

  return (
    <XDocLayout title={t('faq.title')} description={t('faq.description')}>
      <section className='mb-10'>
        <div className='grid gap-4 sm:grid-cols-2'>
          {SECTIONS.map((s) => (
            <Link key={s.href} to={s.href}>
              <Card className='h-full transition hover:border-primary/40 hover:shadow-md group cursor-pointer'>
                <CardContent className='pt-6'>
                  <div className='flex items-start justify-between mb-2'>
                    <div className='size-10 rounded-md flex items-center justify-center bg-primary/10 text-primary shrink-0'>
                      <s.icon className='size-5' />
                    </div>
                    <ArrowRight className='size-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all' />
                  </div>
                  <h3 className='font-semibold text-base mb-1'>{t(`faq.${s.ns}.heading`)}</h3>
                  <p className='text-sm text-muted-foreground'>{t(`faq.${s.ns}.description`)}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </XDocLayout>
  )
}
