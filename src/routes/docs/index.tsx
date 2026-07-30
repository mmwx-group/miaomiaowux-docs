import { createFileRoute, Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { XDocLayout } from '@/components/docs/x-doc-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Download,
  Zap,
  Network,
  Server,
  Shield,
  ArrowRight,
  Sparkles,
  Github,
  FileText,
  Layers,
  Users,
} from 'lucide-react'

export const Route = createFileRoute('/docs/')({
  component: XDocsIndexPage,
})

function XDocsIndexPage() {
  const { t } = useTranslation('xdocs')

  return (
    <XDocLayout>
      <div className='text-center mb-12'>
        <h1 className='text-4xl font-bold tracking-tight mb-4'>
          {t('index.welcome')}
        </h1>
        <p className='text-xl text-muted-foreground max-w-2xl mx-auto mb-8'>
          {t('index.subtitle')}
        </p>
        <div className='flex items-center justify-center gap-4'>
          <Link to='/docs/quick-start'>
            <Button size='lg'>
              <Zap className='size-4 mr-2' />
              {t('index.quickStart')}
            </Button>
          </Link>
          <a href='https://github.com/iluobei/miaomiaowu' target='_blank' rel='noopener noreferrer'>
            <Button variant='outline' size='lg'>
              <Github className='size-4 mr-2' />
              GitHub
            </Button>
          </a>
        </div>
      </div>

      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12'>
        <Card className='group hover:shadow-lg transition-shadow'>
          <CardHeader>
            <Server className='size-8 text-primary mb-2' />
            <CardTitle>{t('index.cards.remoteServer.title')}</CardTitle>
            <CardDescription>{t('index.cards.remoteServer.desc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to='/docs/remote-servers'>
              <Button variant='ghost' className='group-hover:text-primary'>{t('index.learnMore')} <ArrowRight className='size-4 ml-2' /></Button>
            </Link>
          </CardContent>
        </Card>

        <Card className='group hover:shadow-lg transition-shadow'>
          <CardHeader>
            <Network className='size-8 text-primary mb-2' />
            <CardTitle>{t('index.cards.xrayInbound.title')}</CardTitle>
            <CardDescription>{t('index.cards.xrayInbound.desc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to='/docs/xray-inbounds'>
              <Button variant='ghost' className='group-hover:text-primary'>{t('index.learnMore')} <ArrowRight className='size-4 ml-2' /></Button>
            </Link>
          </CardContent>
        </Card>

        <Card className='group hover:shadow-lg transition-shadow'>
          <CardHeader>
            <Layers className='size-8 text-primary mb-2' />
            <CardTitle>{t('index.cards.protocolRef.title')}</CardTitle>
            <CardDescription>{t('index.cards.protocolRef.desc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to='/docs/protocol-matrix'>
              <Button variant='ghost' className='group-hover:text-primary'>{t('index.learnMore')} <ArrowRight className='size-4 ml-2' /></Button>
            </Link>
          </CardContent>
        </Card>

        <Card className='group hover:shadow-lg transition-shadow'>
          <CardHeader>
            <Shield className='size-8 text-primary mb-2' />
            <CardTitle>{t('index.cards.certManagement.title')}</CardTitle>
            <CardDescription>{t('index.cards.certManagement.desc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to='/docs/certificates'>
              <Button variant='ghost' className='group-hover:text-primary'>{t('index.learnMore')} <ArrowRight className='size-4 ml-2' /></Button>
            </Link>
          </CardContent>
        </Card>

        <Card className='group hover:shadow-lg transition-shadow'>
          <CardHeader>
            <Users className='size-8 text-primary mb-2' />
            <CardTitle>{t('index.cards.userPackage.title')}</CardTitle>
            <CardDescription>{t('index.cards.userPackage.desc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to='/docs/users'>
              <Button variant='ghost' className='group-hover:text-primary'>{t('index.learnMore')} <ArrowRight className='size-4 ml-2' /></Button>
            </Link>
          </CardContent>
        </Card>

        <Card className='group hover:shadow-lg transition-shadow'>
          <CardHeader>
            <Download className='size-8 text-primary mb-2' />
            <CardTitle>{t('index.cards.installDeploy.title')}</CardTitle>
            <CardDescription>{t('index.cards.installDeploy.desc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to='/docs/install-direct'>
              <Button variant='ghost' className='group-hover:text-primary'>{t('index.cards.installDeploy.viewInstall')} <ArrowRight className='size-4 ml-2' /></Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className='bg-muted/30 rounded-lg p-8 mb-12'>
        <h2 className='text-2xl font-bold mb-6 flex items-center gap-2'>
          <Sparkles className='size-6 text-primary' />
          {t('index.differences.heading')}
        </h2>
        <div className='grid gap-4 md:grid-cols-2'>
          <div className='flex items-start gap-3'>
            <div className='size-2 rounded-full bg-primary mt-2' />
            <div>
              <h3 className='font-semibold'>{t('index.differences.remoteServer.title')}</h3>
              <p className='text-sm text-muted-foreground'>{t('index.differences.remoteServer.desc')}</p>
            </div>
          </div>
          <div className='flex items-start gap-3'>
            <div className='size-2 rounded-full bg-primary mt-2' />
            <div>
              <h3 className='font-semibold'>{t('index.differences.xrayFull.title')}</h3>
              <p className='text-sm text-muted-foreground'>{t('index.differences.xrayFull.desc')}</p>
            </div>
          </div>
          <div className='flex items-start gap-3'>
            <div className='size-2 rounded-full bg-primary mt-2' />
            <div>
              <h3 className='font-semibold'>{t('index.differences.certManagement.title')}</h3>
              <p className='text-sm text-muted-foreground'>{t('index.differences.certManagement.desc')}</p>
            </div>
          </div>
          <div className='flex items-start gap-3'>
            <div className='size-2 rounded-full bg-primary mt-2' />
            <div>
              <h3 className='font-semibold'>{t('index.differences.packageManagement.title')}</h3>
              <p className='text-sm text-muted-foreground'>{t('index.differences.packageManagement.desc')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className='border-t pt-8'>
        <h2 className='text-xl font-semibold mb-4 flex items-center gap-2'>
          <FileText className='size-5' />
          {t('index.quickNav.heading')}
        </h2>
        <div className='grid gap-2 md:grid-cols-3'>
          <Link to='/docs/quick-start' className='text-sm text-muted-foreground hover:text-primary transition-colors'>{t('index.quickNav.quickStart')}</Link>
          <Link to='/docs/install-docker' className='text-sm text-muted-foreground hover:text-primary transition-colors'>{t('index.quickNav.dockerInstall')}</Link>
          <Link to='/docs/remote-servers' className='text-sm text-muted-foreground hover:text-primary transition-colors'>{t('index.quickNav.remoteServers')}</Link>
          <Link to='/docs/xray-inbounds' className='text-sm text-muted-foreground hover:text-primary transition-colors'>{t('index.quickNav.inboundManagement')}</Link>
          <Link to='/docs/protocol-matrix' className='text-sm text-muted-foreground hover:text-primary transition-colors'>{t('index.quickNav.protocolMatrix')}</Link>
          <Link to='/docs/faq' className='text-sm text-muted-foreground hover:text-primary transition-colors'>{t('index.quickNav.faq')}</Link>
        </div>
      </div>
    </XDocLayout>
  )
}
