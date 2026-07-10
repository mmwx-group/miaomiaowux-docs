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

# 运行容器(基础:仅暴露面板端口)
docker run -d \\
  --name miaomiaowux \\
  -p 12889:12889 \\
  -v ./data:/app/data \\
  ghcr.io/iluobei/miaomiaowux:latest

# 或者:开启 HTTPS / 内置 nginx 反代,需额外映射 443 + 80(ACME 校验)
docker run -d \\
  --name miaomiaowux \\
  -p 12889:12889 \\
  -p 80:80 \\
  -p 443:443 \\
  -v ./data:/app/data \\
  ghcr.io/iluobei/miaomiaowux:latest`}</pre>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('installDocker.builtinNginx.heading')}</h2>
        <Alert className='mb-4'>
          <Info className='h-4 w-4' />
          <AlertTitle>{t('installDocker.builtinNginx.alertTitle')}</AlertTitle>
          <AlertDescription>{t('installDocker.builtinNginx.alertText')}</AlertDescription>
        </Alert>
        <p className='text-muted-foreground mb-2'>{t('installDocker.builtinNginx.text1')}</p>
        <p className='text-muted-foreground mb-2'>{t('installDocker.builtinNginx.text2')}</p>
        <ul className='space-y-1 text-sm text-muted-foreground ml-4 mb-4'>
          <li>- <code className='bg-muted px-1 rounded'>80</code> {t('installDocker.builtinNginx.port80')}</li>
          <li>- <code className='bg-muted px-1 rounded'>443</code> {t('installDocker.builtinNginx.port443')}</li>
          <li>- <code className='bg-muted px-1 rounded'>12889</code> {t('installDocker.builtinNginx.port12889')}</li>
        </ul>
        <p className='text-muted-foreground'>{t('installDocker.builtinNginx.text3')}</p>
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
      - "12889:12889"   # 主控面板
      - "80:80"         # ACME HTTP-01 校验(开启 HTTPS 必须)
      - "443:443"       # 内置 nginx HTTPS 入口(开启 HTTPS 必须)
    volumes:
      - ./data:/app/data
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
