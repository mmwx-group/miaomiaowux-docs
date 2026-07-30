import { createFileRoute, Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { XDocLayout } from '@/components/docs/x-doc-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Info } from 'lucide-react'

export const Route = createFileRoute('/docs/install-docker')({
  component: InstallDockerPage,
})

function InstallDockerPage() {
  const { t } = useTranslation('xdocs')

  return (
    <XDocLayout title={t('installDocker.title')} description={t('installDocker.description')}>
      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('installDocker.quickDeploy.heading')}</h2>
        <Card>
          <CardContent className='pt-6'>
            <div className='bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto'>
              <pre>{`# 拉取镜像
docker pull ghcr.io/iluobei/miaomiaowux:latest

# 运行容器(只暴露面板 http 端口即可)
docker run -d \\
  --name miaomiaowux \\
  -p 12889:12889 \\
  -v $(pwd)/data:/app/data \\
  -v $(pwd)/subscribes:/app/subscribes \\
  -v $(pwd)/rule_templates:/app/rule_templates \\
  ghcr.io/iluobei/miaomiaowux:latest

# 开启 HTTPS:推荐在【主控宿主机】上装一个 agent,用它的 nginx 反代主控(见下方章节),
# 无需给容器映射 80/443。`}</pre>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('installDocker.httpsProxy.heading')}</h2>
        <Alert className='mb-4'>
          <Info className='h-4 w-4' />
          <AlertTitle>{t('installDocker.httpsProxy.alertTitle')}</AlertTitle>
          <AlertDescription>{t('installDocker.httpsProxy.alertText')}</AlertDescription>
        </Alert>
        <p className='text-muted-foreground mb-2'>{t('installDocker.httpsProxy.text1')}</p>
        <ol className='space-y-1 text-sm text-muted-foreground ml-4 mb-4 list-decimal'>
          <li>{t('installDocker.httpsProxy.step1')}</li>
          <li>{t('installDocker.httpsProxy.step2')}</li>
          <li>{t('installDocker.httpsProxy.step3')}</li>
        </ol>
        <p className='text-muted-foreground text-sm'>{t('installDocker.httpsProxy.fallback')}</p>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>Docker Compose</h2>
        <Card>
          <CardContent className='pt-6'>
            <div className='bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto'>
              <pre>{`version: '3'
services:
  miaomiaowux:
    image: ghcr.io/iluobei/miaomiaowux:latest
    container_name: miaomiaowux
    restart: always
    ports:
      - "12889:12889"   # 主控面板(http)。HTTPS 由宿主机 agent 反代,无需映射 80/443
    volumes:
      - ./data:/app/data
      - ./subscribes:/app/subscribes
      - ./rule_templates:/app/rule_templates
    environment:
      - PORT=12889
      - JWT_SECRET=your-secret-key`}</pre>
            </div>
          </CardContent>
        </Card>
        <p className='text-muted-foreground mt-3 text-sm'>{t('installDocker.composeNote')}</p>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('installDocker.dataPersistence.heading')}</h2>
        <p className='text-muted-foreground mb-4'>
          {t('installDocker.dataPersistence.text')}
        </p>
      </section>

      <section>
        <Link to='/docs/install-agent' className='text-primary hover:underline'>{t('installDocker.nextAgent')}</Link>
      </section>
    </XDocLayout>
  )
}
