import { createFileRoute, Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { XDocLayout } from '@/components/docs/x-doc-layout'
import { Card, CardContent } from '@/components/ui/card'

export const Route = createFileRoute('/docs/install-direct')({
  component: InstallDirectPage,
})

function InstallDirectPage() {
  const { t } = useTranslation('xdocs')

  return (
    <XDocLayout title={t('installDirect.title')} description={t('installDirect.description')}>
      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('installDirect.oneClick.heading')}</h2>
        <Card>
          <CardContent className='pt-6'>
            <p className='text-muted-foreground mb-4'>{t('installDirect.oneClick.text')}</p>
            <div className='bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto'>
              <pre>{`# 安装
curl -sL https://raw.githubusercontent.com/iluobei/miaomiaowuX/main/install.sh | sudo bash

# 更新
curl -sL https://raw.githubusercontent.com/iluobei/miaomiaowuX/main/install.sh | sudo bash -s update

# 卸载
curl -sL https://raw.githubusercontent.com/iluobei/miaomiaowuX/main/install.sh | sudo bash -s uninstall`}</pre>
            </div>
            <p className='text-sm text-muted-foreground mt-3'>{t('installDirect.oneClick.manualNote')}</p>
          </CardContent>
        </Card>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('installDirect.download.heading')}</h2>
        <Card>
          <CardContent className='pt-6'>
            <p className='text-muted-foreground mb-4'>{t('installDirect.download.text')}</p>
            <div className='bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto'>
              <pre>{`# Linux amd64
wget https://github.com/iluobei/miaomiaowux/releases/latest/download/mmwx-linux-amd64
chmod +x mmwx-linux-amd64

# 运行
./mmwx-linux-amd64`}</pre>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('installDirect.config.heading')}</h2>
        <Card>
          <CardContent className='pt-6'>
            <p className='text-muted-foreground mb-4'>{t('installDirect.config.text')}</p>
            <div className='bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto'>
              <pre>{`# 环境变量
export PORT=12889
export JWT_SECRET=your-secret-key
export LOG_LEVEL=info

# 或使用配置文件
./mmwx-linux-amd64 -c config.yaml

# 数据目录(相对于工作目录,不可通过环境变量更改):
#   data/mmwx.db     数据库
#   data/logs/       日志
#   subscribes/      订阅文件
#   rule_templates/  规则模板`}</pre>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('installDirect.systemd.heading')}</h2>
        <Card>
          <CardContent className='pt-6'>
            <p className='text-muted-foreground mb-4'>{t('installDirect.systemd.text')}</p>
            <div className='bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto'>
              <pre>{`[Unit]
Description=MiaomiaoWuX
After=network.target

[Service]
Type=simple
ExecStart=/opt/mmwx/mmwx-linux-amd64
WorkingDirectory=/opt/mmwx
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target`}</pre>
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <Link to='/docs/install-docker' className='text-primary hover:underline'>{t('installDirect.alsoDocker')}</Link>
      </section>
    </XDocLayout>
  )
}
