import { createFileRoute, Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { XDocLayout } from '@/components/docs/x-doc-layout'
import { Server, Network, Shield, Users, Package, Layers, LayoutTemplate, Zap, Globe, FileCode, MonitorCog, ArrowUpFromLine, Activity, Wifi, Settings } from 'lucide-react'

export const Route = createFileRoute('/docs/features')({
  component: FeaturesPage,
})

function FeaturesPage() {
  const { t } = useTranslation('xdocs')

  const features = [
    { icon: Globe, title: t('features.items.remoteServer.title'), desc: t('features.items.remoteServer.desc') },
    { icon: Server, title: t('features.items.xrayService.title'), desc: t('features.items.xrayService.desc') },
    { icon: Network, title: t('features.items.xrayInbound.title'), desc: t('features.items.xrayInbound.desc') },
    { icon: Layers, title: t('features.items.protocolMatrix.title'), desc: t('features.items.protocolMatrix.desc') },
    { icon: Shield, title: t('features.items.certManagement.title'), desc: t('features.items.certManagement.desc') },
    { icon: Package, title: t('features.items.packageManagement.title'), desc: t('features.items.packageManagement.desc') },
    { icon: Users, title: t('features.items.userManagement.title'), desc: t('features.items.userManagement.desc') },
    { icon: Zap, title: t('features.items.subGeneration.title'), desc: t('features.items.subGeneration.desc') },
    { icon: LayoutTemplate, title: t('features.items.templateSystem.title'), desc: t('features.items.templateSystem.desc') },
    { icon: FileCode, title: t('features.items.customRules.title'), desc: t('features.items.customRules.desc') },
    { icon: MonitorCog, title: t('features.items.nginxManagement.title'), desc: t('features.items.nginxManagement.desc') },
    { icon: ArrowUpFromLine, title: t('features.items.agentUpgrade.title'), desc: t('features.items.agentUpgrade.desc') },
    { icon: Activity, title: t('features.items.systemMonitor.title'), desc: t('features.items.systemMonitor.desc') },
    { icon: Wifi, title: t('features.items.domainLatency.title'), desc: t('features.items.domainLatency.desc') },
    { icon: Settings, title: t('features.items.systemSettings.title'), desc: t('features.items.systemSettings.desc') },
  ]

  return (
    <XDocLayout title={t('features.title')} description={t('features.description')}>
      <div className='grid gap-6 md:grid-cols-2'>
        {features.map((f) => (
          <div key={f.title} className='flex items-start gap-4 p-4 rounded-lg border bg-card'>
            <f.icon className='size-8 text-primary shrink-0 mt-1' />
            <div>
              <h3 className='font-semibold mb-1'>{f.title}</h3>
              <p className='text-sm text-muted-foreground'>{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className='mt-8'>
        <Link to='/docs/quick-start' className='text-primary hover:underline'>{t('features.startUsing')}</Link>
      </div>
    </XDocLayout>
  )
}
