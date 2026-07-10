import { createFileRoute, Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { XDocLayout } from '@/components/docs/x-doc-layout'
import { Card, CardContent } from '@/components/ui/card'
import {
  Check,
  Activity,
  Network,
  Users,
  Server,
  Shield,
  Package,
  Radar,
  Zap,
  Globe,
  Lock,
  FileCode,
  LayoutTemplate,
  Sparkles,
} from 'lucide-react'

export const Route = createFileRoute('/docs/comparison')({
  component: ComparisonPage,
})

function ComparisonPage() {
  const { t } = useTranslation('xdocs')

  const comparisonSections = [
    {
      key: 'trafficManagement',
      icon: Activity,
    },
    {
      key: 'nodeManagement',
      icon: Network,
    },
    {
      key: 'userManagement',
      icon: Users,
    },
    {
      key: 'serverManagement',
      icon: Server,
    },
    {
      key: 'certificateManagement',
      icon: Lock,
    },
    {
      key: 'packageManagement',
      icon: Package,
    },
    {
      key: 'monitoring',
      icon: Radar,
    },
    {
      key: 'subscriptionGeneration',
      icon: Zap,
    },
    {
      key: 'templates',
      icon: LayoutTemplate,
    },
    {
      key: 'customRules',
      icon: FileCode,
    },
    {
      key: 'security',
      icon: Shield,
    },
    {
      key: 'deployment',
      icon: Globe,
    },
  ]

  return (
    <XDocLayout
      title={t('comparison.title')}
      description={t('comparison.description')}
    >
      {/* 概述 */}
      <section className='mb-10'>
        <Card className='bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20'>
          <CardContent className='pt-6'>
            <p className='text-muted-foreground'>
              {t('comparison.overview.text1')}
            </p>
            <p className='text-muted-foreground mt-2'>
              {t('comparison.overview.text2')}
            </p>
          </CardContent>
        </Card>
      </section>

      {/* 对比总览表格 */}
      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('comparison.table.heading')}</h2>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b bg-muted/30'>
                <th className='text-left py-3 px-4 font-semibold w-1/4'>{t('comparison.table.feature')}</th>
                <th className='text-center py-3 px-4 font-semibold w-[37.5%]'>{t('comparison.table.mmw')}</th>
                <th className='text-center py-3 px-4 font-semibold w-[37.5%]'>{t('comparison.table.mmwx')}</th>
              </tr>
            </thead>
            <tbody>
              {comparisonSections.map((section, i) => (
                <tr key={section.key} className={i < comparisonSections.length - 1 ? 'border-b' : ''}>
                  <td className='py-3 px-4 font-medium'>
                    <div className='flex items-center gap-2'>
                      <section.icon className='size-4 text-primary shrink-0' />
                      {t(`comparison.table.rows.${section.key}.feature`)}
                    </div>
                  </td>
                  <td className='text-center py-3 px-4 text-muted-foreground'>
                    {t(`comparison.table.rows.${section.key}.mmw`)}
                  </td>
                  <td className='text-center py-3 px-4'>
                    {t(`comparison.table.rows.${section.key}.mmwx`)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 详细对比 — 流量管理 */}
      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4 flex items-center gap-2'>
          <Activity className='size-6 text-primary' />
          {t('comparison.detail.traffic.heading')}
        </h2>
        <div className='grid gap-4 md:grid-cols-2'>
          <Card className='border-muted'>
            <CardContent className='pt-6'>
              <h3 className='font-semibold mb-3 text-muted-foreground'>{t('comparison.detail.mmwLabel')}</h3>
              <ul className='space-y-2 text-sm text-muted-foreground'>
                <li className='flex items-start gap-2'>
                  <span className='text-primary mt-0.5'>•</span>
                  <span>{t('comparison.detail.traffic.mmw.item1')}</span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='text-primary mt-0.5'>•</span>
                  <span>{t('comparison.detail.traffic.mmw.item2')}</span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='text-destructive mt-0.5'>✗</span>
                  <span>{t('comparison.detail.traffic.mmw.item3')}</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          <Card className='border-primary/30'>
            <CardContent className='pt-6'>
              <h3 className='font-semibold mb-3 text-primary'>{t('comparison.detail.mmwxLabel')}</h3>
              <ul className='space-y-2 text-sm'>
                <li className='flex items-start gap-2'>
                  <Check className='size-4 text-green-500 mt-0.5 shrink-0' />
                  <span>{t('comparison.detail.traffic.mmwx.item1')}</span>
                </li>
                <li className='flex items-start gap-2'>
                  <Check className='size-4 text-green-500 mt-0.5 shrink-0' />
                  <span>{t('comparison.detail.traffic.mmwx.item2')}</span>
                </li>
                <li className='flex items-start gap-2'>
                  <Check className='size-4 text-green-500 mt-0.5 shrink-0' />
                  <span>{t('comparison.detail.traffic.mmwx.item3')}</span>
                </li>
                <li className='flex items-start gap-2'>
                  <Check className='size-4 text-green-500 mt-0.5 shrink-0' />
                  <span>{t('comparison.detail.traffic.mmwx.item4')}</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 详细对比 — 节点管理 */}
      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4 flex items-center gap-2'>
          <Network className='size-6 text-primary' />
          {t('comparison.detail.nodes.heading')}
        </h2>
        <div className='grid gap-4 md:grid-cols-2'>
          <Card className='border-muted'>
            <CardContent className='pt-6'>
              <h3 className='font-semibold mb-3 text-muted-foreground'>{t('comparison.detail.mmwLabel')}</h3>
              <ul className='space-y-2 text-sm text-muted-foreground'>
                <li className='flex items-start gap-2'>
                  <span className='text-primary mt-0.5'>•</span>
                  <span>{t('comparison.detail.nodes.mmw.item1')}</span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='text-primary mt-0.5'>•</span>
                  <span>{t('comparison.detail.nodes.mmw.item2')}</span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='text-primary mt-0.5'>•</span>
                  <span>{t('comparison.detail.nodes.mmw.item3')}</span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='text-destructive mt-0.5'>✗</span>
                  <span>{t('comparison.detail.nodes.mmw.item4')}</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          <Card className='border-primary/30'>
            <CardContent className='pt-6'>
              <h3 className='font-semibold mb-3 text-primary'>{t('comparison.detail.mmwxLabel')}</h3>
              <ul className='space-y-2 text-sm'>
                <li className='flex items-start gap-2'>
                  <Check className='size-4 text-green-500 mt-0.5 shrink-0' />
                  <span>{t('comparison.detail.nodes.mmwx.item1')}</span>
                </li>
                <li className='flex items-start gap-2'>
                  <Check className='size-4 text-green-500 mt-0.5 shrink-0' />
                  <span>{t('comparison.detail.nodes.mmwx.item2')}</span>
                </li>
                <li className='flex items-start gap-2'>
                  <Check className='size-4 text-green-500 mt-0.5 shrink-0' />
                  <span>{t('comparison.detail.nodes.mmwx.item3')}</span>
                </li>
                <li className='flex items-start gap-2'>
                  <Check className='size-4 text-green-500 mt-0.5 shrink-0' />
                  <span>{t('comparison.detail.nodes.mmwx.item4')}</span>
                </li>
                <li className='flex items-start gap-2'>
                  <Check className='size-4 text-green-500 mt-0.5 shrink-0' />
                  <span>{t('comparison.detail.nodes.mmwx.item5')}</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 详细对比 — 用户管理 */}
      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4 flex items-center gap-2'>
          <Users className='size-6 text-primary' />
          {t('comparison.detail.users.heading')}
        </h2>
        <div className='grid gap-4 md:grid-cols-2'>
          <Card className='border-muted'>
            <CardContent className='pt-6'>
              <h3 className='font-semibold mb-3 text-muted-foreground'>{t('comparison.detail.mmwLabel')}</h3>
              <ul className='space-y-2 text-sm text-muted-foreground'>
                <li className='flex items-start gap-2'>
                  <span className='text-primary mt-0.5'>•</span>
                  <span>{t('comparison.detail.users.mmw.item1')}</span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='text-primary mt-0.5'>•</span>
                  <span>{t('comparison.detail.users.mmw.item2')}</span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='text-destructive mt-0.5'>✗</span>
                  <span>{t('comparison.detail.users.mmw.item3')}</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          <Card className='border-primary/30'>
            <CardContent className='pt-6'>
              <h3 className='font-semibold mb-3 text-primary'>{t('comparison.detail.mmwxLabel')}</h3>
              <ul className='space-y-2 text-sm'>
                <li className='flex items-start gap-2'>
                  <Check className='size-4 text-green-500 mt-0.5 shrink-0' />
                  <span>{t('comparison.detail.users.mmwx.item1')}</span>
                </li>
                <li className='flex items-start gap-2'>
                  <Check className='size-4 text-green-500 mt-0.5 shrink-0' />
                  <span>{t('comparison.detail.users.mmwx.item2')}</span>
                </li>
                <li className='flex items-start gap-2'>
                  <Check className='size-4 text-green-500 mt-0.5 shrink-0' />
                  <span>{t('comparison.detail.users.mmwx.item3')}</span>
                </li>
                <li className='flex items-start gap-2'>
                  <Check className='size-4 text-green-500 mt-0.5 shrink-0' />
                  <span>{t('comparison.detail.users.mmwx.item4')}</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 详细对比 — 服务器管理 */}
      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4 flex items-center gap-2'>
          <Server className='size-6 text-primary' />
          {t('comparison.detail.server.heading')}
        </h2>
        <div className='grid gap-4 md:grid-cols-2'>
          <Card className='border-muted'>
            <CardContent className='pt-6'>
              <h3 className='font-semibold mb-3 text-muted-foreground'>{t('comparison.detail.mmwLabel')}</h3>
              <p className='text-sm text-muted-foreground'>
                {t('comparison.detail.server.mmw.text')}
              </p>
            </CardContent>
          </Card>
          <Card className='border-primary/30'>
            <CardContent className='pt-6'>
              <h3 className='font-semibold mb-3 text-primary'>{t('comparison.detail.mmwxLabel')}</h3>
              <ul className='space-y-2 text-sm'>
                <li className='flex items-start gap-2'>
                  <Check className='size-4 text-green-500 mt-0.5 shrink-0' />
                  <span>{t('comparison.detail.server.mmwx.item1')}</span>
                </li>
                <li className='flex items-start gap-2'>
                  <Check className='size-4 text-green-500 mt-0.5 shrink-0' />
                  <span>{t('comparison.detail.server.mmwx.item2')}</span>
                </li>
                <li className='flex items-start gap-2'>
                  <Check className='size-4 text-green-500 mt-0.5 shrink-0' />
                  <span>{t('comparison.detail.server.mmwx.item3')}</span>
                </li>
                <li className='flex items-start gap-2'>
                  <Check className='size-4 text-green-500 mt-0.5 shrink-0' />
                  <span>{t('comparison.detail.server.mmwx.item4')}</span>
                </li>
                <li className='flex items-start gap-2'>
                  <Check className='size-4 text-green-500 mt-0.5 shrink-0' />
                  <span>{t('comparison.detail.server.mmwx.item5')}</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 妙妙屋X 独有功能 */}
      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4 flex items-center gap-2'>
          <Sparkles className='size-6 text-primary' />
          {t('comparison.exclusive.heading')}
        </h2>
        <div className='grid gap-4 md:grid-cols-2'>
          {['embeddedXray', 'routedOutbound', 'shareServer', 'certManagement', 'packageManagement', 'nginxManagement'].map((key) => (
            <Card key={key}>
              <CardContent className='pt-6'>
                <h3 className='font-semibold mb-2'>{t(`comparison.exclusive.${key}.title`)}</h3>
                <p className='text-sm text-muted-foreground'>
                  {t(`comparison.exclusive.${key}.desc`)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 共同功能 */}
      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('comparison.shared.heading')}</h2>
        <Card>
          <CardContent className='pt-6'>
            <p className='text-muted-foreground mb-4'>
              {t('comparison.shared.intro')}
            </p>
            <div className='grid gap-2 sm:grid-cols-2'>
              {Array.from({ length: 10 }, (_, i) => (
                <div key={i} className='flex items-center gap-2 text-sm'>
                  <Check className='size-4 text-green-500 shrink-0' />
                  <span>{t(`comparison.shared.item${i + 1}`)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 总结 */}
      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('comparison.summary.heading')}</h2>
        <Card className='bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20'>
          <CardContent className='pt-6'>
            <p className='text-muted-foreground mb-3'>
              {t('comparison.summary.text1')}
            </p>
            <p className='text-muted-foreground'>
              {t('comparison.summary.text2')}
            </p>
          </CardContent>
        </Card>
      </section>

      {/* 导航链接 */}
      <section>
        <div className='flex flex-wrap gap-4'>
          <Link to='/docs/features' className='text-primary hover:underline'>{t('comparison.nav.features')}</Link>
          <Link to='/docs/quick-start' className='text-primary hover:underline'>{t('comparison.nav.quickStart')}</Link>
          <Link to='/docs/upgrade-from-mmw' className='text-primary hover:underline'>{t('comparison.nav.upgrade')}</Link>
        </div>
      </section>
    </XDocLayout>
  )
}
