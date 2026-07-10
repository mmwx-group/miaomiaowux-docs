import { createFileRoute, Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { XDocLayout } from '@/components/docs/x-doc-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'
import { AddServerDemo } from '@/components/docs/add-server-demo'

export const Route = createFileRoute('/docs/install-agent')({
  component: InstallAgentPage,
})

function InstallAgentPage() {
  const { t } = useTranslation('xdocs')

  return (
    <XDocLayout title={t('installAgent.title')} description={t('installAgent.description')}>
      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('installAgent.overview.heading')}</h2>
        <p className='text-muted-foreground mb-4'>
          {t('installAgent.overview.text')}
        </p>
      </section>

      {/* 硬性约束 — 每台 server 必须独立 agent_token,复用会触发主控连接抢占 + SQLite 写脉冲拖累其它 server */}
      <Alert variant='destructive' className='mb-10'>
        <AlertTriangle className='h-5 w-5' />
        <AlertTitle className='text-base font-bold'>{t('installAgent.tokenWarning.title')}</AlertTitle>
        <AlertDescription className='mt-2 space-y-2'>
          <p>{t('installAgent.tokenWarning.body1')}</p>
          <p>{t('installAgent.tokenWarning.body2')}</p>
        </AlertDescription>
      </Alert>

      {/* Xray 模式选择 — embedded(内联,主控直接控制 xray 不需要额外二进制)/ external(外置,走 systemd 装的 xray) */}
      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('installAgent.xrayMode.heading')}</h2>
        <p className='text-muted-foreground mb-4'>{t('installAgent.xrayMode.text')}</p>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b'>
                <th className='text-left py-2 px-3'>{t('installAgent.xrayMode.modeCol')}</th>
                <th className='text-left py-2 px-3'>{t('installAgent.xrayMode.valueCol')}</th>
                <th className='text-left py-2 px-3'>{t('installAgent.xrayMode.descCol')}</th>
              </tr>
            </thead>
            <tbody>
              <tr className='border-b'>
                <td className='py-2 px-3'>{t('installAgent.xrayMode.embeddedName')}</td>
                <td className='py-2 px-3 font-mono text-xs'>embedded</td>
                <td className='py-2 px-3'>{t('installAgent.xrayMode.embeddedDesc')}</td>
              </tr>
              <tr>
                <td className='py-2 px-3'>{t('installAgent.xrayMode.externalName')}</td>
                <td className='py-2 px-3 font-mono text-xs'>external</td>
                <td className='py-2 px-3'>{t('installAgent.xrayMode.externalDesc')}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className='text-xs text-muted-foreground mt-3'>{t('installAgent.xrayMode.note')}</p>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('installAgent.oneClick.heading')}</h2>
        <div className='space-y-4'>
          <Card>
            <CardContent className='pt-6'>
              <h3 className='font-semibold mb-3'>{t('installAgent.oneClick.step1.heading')}</h3>
              <div className='text-sm text-muted-foreground space-y-2'>
                <p>{t('installAgent.oneClick.step1.item1')}</p>
                <p>{t('installAgent.oneClick.step1.item2')}</p>
                <p>{t('installAgent.oneClick.step1.item3')}</p>
                <p>{t('installAgent.oneClick.step1.item4')}</p>
              </div>
            </CardContent>
          </Card>

          {/* Mock 添加服务器演示:填表单 → 生成 token → 出一键命令 */}
          <AddServerDemo />

          <Card>
            <CardContent className='pt-6'>
              <h3 className='font-semibold mb-3'>{t('installAgent.oneClick.step2.heading')}</h3>
              <p className='text-sm text-muted-foreground mb-4'>
                {t('installAgent.oneClick.step2.text')}
              </p>
              <div className='bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto'>
                <pre>{`# 外置 Xray 模式(默认,会自动安装独立 xray)
curl -fsSL https://your-domain.com/api/remote/install.sh?token=SERVER_TOKEN | bash

# 内联 Xray 模式(无需独立 xray,Agent 自身嵌入 xray-core)
curl -fsSL "https://your-domain.com/api/remote/install.sh?token=SERVER_TOKEN&xray_mode=embedded" | bash`}</pre>
              </div>
              <p className='text-xs text-muted-foreground mt-3'>
                {t('installAgent.oneClick.step2.note')}
              </p>
              <div className='mt-4'>
                <h4 className='text-sm font-semibold mb-2'>{t('installAgent.oneClick.step2.paramsHeading')}</h4>
                <div className='overflow-x-auto'>
                  <table className='w-full text-xs'>
                    <thead>
                      <tr className='border-b'>
                        <th className='text-left py-1.5 px-2 font-medium'>{t('installAgent.oneClick.step2.paramCol')}</th>
                        <th className='text-left py-1.5 px-2 font-medium'>{t('installAgent.oneClick.step2.defaultCol')}</th>
                        <th className='text-left py-1.5 px-2 font-medium'>{t('installAgent.oneClick.step2.paramDescCol')}</th>
                      </tr>
                    </thead>
                    <tbody className='text-muted-foreground'>
                      <tr className='border-b'><td className='py-1.5 px-2 font-mono'>token</td><td className='py-1.5 px-2'>—</td><td className='py-1.5 px-2'>{t('installAgent.oneClick.step2.paramToken')}</td></tr>
                      <tr className='border-b'><td className='py-1.5 px-2 font-mono'>xray_mode</td><td className='py-1.5 px-2 font-mono'>external</td><td className='py-1.5 px-2'>{t('installAgent.oneClick.step2.paramXrayMode')}</td></tr>
                      <tr className='border-b'><td className='py-1.5 px-2 font-mono'>steal_self</td><td className='py-1.5 px-2 font-mono'>0</td><td className='py-1.5 px-2'>{t('installAgent.oneClick.step2.paramStealSelf')}</td></tr>
                      <tr><td className='py-1.5 px-2 font-mono'>listen_port</td><td className='py-1.5 px-2 font-mono'>23889</td><td className='py-1.5 px-2'>{t('installAgent.oneClick.step2.paramListenPort')}</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-6'>
              <h3 className='font-semibold mb-3'>{t('installAgent.oneClick.step3.heading')}</h3>
              <p className='text-sm text-muted-foreground mb-4'>
                {t('installAgent.oneClick.step3.text')}
              </p>
              <div className='overflow-x-auto'>
                <table className='w-full text-sm'>
                  <thead><tr className='border-b'><th className='text-left py-2 px-3'>{t('installAgent.oneClick.step3.stepCol')}</th><th className='text-left py-2 px-3'>{t('installAgent.oneClick.step3.operationCol')}</th><th className='text-left py-2 px-3'>{t('installAgent.oneClick.step3.descCol')}</th></tr></thead>
                  <tbody>
                    <tr className='border-b'><td className='py-2 px-3'>1/6</td><td className='py-2 px-3'>{t('installAgent.oneClick.step3.op1')}</td><td className='py-2 px-3'>{t('installAgent.oneClick.step3.desc1')}</td></tr>
                    <tr className='border-b'><td className='py-2 px-3'>2/6</td><td className='py-2 px-3'>{t('installAgent.oneClick.step3.op2')}</td><td className='py-2 px-3'>{t('installAgent.oneClick.step3.desc2')}</td></tr>
                    <tr className='border-b'><td className='py-2 px-3'>3/6</td><td className='py-2 px-3'>{t('installAgent.oneClick.step3.op3')}</td><td className='py-2 px-3'>{t('installAgent.oneClick.step3.desc3')}</td></tr>
                    <tr className='border-b'><td className='py-2 px-3'>4/6</td><td className='py-2 px-3'>{t('installAgent.oneClick.step3.op4')}</td><td className='py-2 px-3'>{t('installAgent.oneClick.step3.desc4')}</td></tr>
                    <tr className='border-b'><td className='py-2 px-3'>5/6</td><td className='py-2 px-3'>{t('installAgent.oneClick.step3.op5')}</td><td className='py-2 px-3'>{t('installAgent.oneClick.step3.desc5')}</td></tr>
                    <tr><td className='py-2 px-3'>6/6</td><td className='py-2 px-3'>{t('installAgent.oneClick.step3.op6')}</td><td className='py-2 px-3'>{t('installAgent.oneClick.step3.desc6')}</td></tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Docker 部署 — 与一键脚本并行的部署方式;镜像内置 embedded xray + nginx,host 网络模式必须 */}
      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('installAgent.docker.heading')}</h2>
        <p className='text-muted-foreground mb-4'>{t('installAgent.docker.intro')}</p>

        <Alert variant='destructive' className='mb-6 border-amber-400 bg-amber-50 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100 [&>svg]:text-amber-600 dark:[&>svg]:text-amber-400'>
          <AlertTriangle className='h-5 w-5' />
          <AlertTitle className='text-base font-bold'>{t('installAgent.docker.hostAlertTitle')}</AlertTitle>
          <AlertDescription className='mt-2 space-y-2'>
            <p>{t('installAgent.docker.hostAlertText1')}</p>
            <p>{t('installAgent.docker.hostAlertText2')}</p>
          </AlertDescription>
        </Alert>

        <div className='space-y-4'>
          <Card>
            <CardContent className='pt-6'>
              <h3 className='font-semibold mb-3'>{t('installAgent.docker.runHeading')}</h3>
              <p className='text-sm text-muted-foreground mb-3'>{t('installAgent.docker.runText')}</p>
              <div className='bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto'>
                <pre>{`# host 网络必须 --network host(强制约束,容器内 entrypoint 会检测;bridge 模式直接退出报错)
docker run -d \\
  --name mmw-agent \\
  --network host \\
  --restart unless-stopped \\
  -e MMWX_LISTEN_PORT=12888 \\
  -e MMWX_MASTER_URL=https://master.example.com \\
  -e MMWX_MASTER_TOKEN=<主控添加服务器时生成的 token> \\
  -v $(pwd)/config:/etc/mmw-agent \\
  -v $(pwd)/xray-config:/usr/local/etc/xray \\
  -v $(pwd)/nginx-cert:/etc/nginx/cert \\
  -v $(pwd)/nginx-servers:/etc/nginx/servers \\
  ghcr.io/iluobei/mmw-agent:latest`}</pre>
              </div>
              <p className='text-xs text-muted-foreground mt-3'>{t('installAgent.docker.runNote')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-6'>
              <h3 className='font-semibold mb-3'>{t('installAgent.docker.composeHeading')}</h3>
              <p className='text-sm text-muted-foreground mb-3'>{t('installAgent.docker.composeText')}</p>
              <div className='bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto'>
                <pre>{`version: '3.8'
services:
  mmw-agent:
    image: ghcr.io/iluobei/mmw-agent:latest
    container_name: mmw-agent
    restart: unless-stopped
    network_mode: host                  # 必须 host,bridge 模式 entrypoint 会拒启
    environment:
      - MMWX_LISTEN_PORT=12888
      - MMWX_MASTER_URL=https://master.example.com
      - MMWX_MASTER_TOKEN=<主控添加服务器时生成的 token>
    volumes:
      - ./config:/etc/mmw-agent
      - ./xray-config:/usr/local/etc/xray
      - ./nginx-cert:/etc/nginx/cert
      - ./nginx-servers:/etc/nginx/servers`}</pre>
              </div>
              <p className='text-xs text-muted-foreground mt-3'>
                {t('installAgent.docker.composeStartTip')} <code className='bg-muted px-1.5 py-0.5 rounded text-xs'>docker compose up -d</code>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-6'>
              <h3 className='font-semibold mb-3'>{t('installAgent.docker.constraintsHeading')}</h3>
              <ul className='space-y-2 text-sm text-muted-foreground'>
                <li>- <strong>{t('installAgent.docker.constraint1Label')}:</strong> {t('installAgent.docker.constraint1Text')}</li>
                <li>- <strong>{t('installAgent.docker.constraint2Label')}:</strong> {t('installAgent.docker.constraint2Text')}</li>
                <li>- <strong>{t('installAgent.docker.constraint3Label')}:</strong> {t('installAgent.docker.constraint3Text')}</li>
                <li>- <strong>{t('installAgent.docker.constraint4Label')}:</strong> {t('installAgent.docker.constraint4Text')} <code className='bg-muted px-1.5 py-0.5 rounded text-xs'>-e MMWX_REQUIRE_HOST_NETWORK=0</code></li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('installAgent.autoXray.heading')}</h2>
        <p className='text-muted-foreground mb-4'>
          {t('installAgent.autoXray.text')}
        </p>
        <Card>
          <CardContent className='pt-6'>
            <div className='bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto'>
              <pre>{`# 仅 xray_mode=external(默认)时脚本会自动执行下面这条
bash -c "$(curl -L https://github.com/XTLS/Xray-install/raw/main/install-release.sh)" @ install
# xray_mode=embedded 时跳过这一步:Agent 自身嵌入 xray-core,不需要 /usr/local/bin/xray`}</pre>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('installAgent.configFile.heading')}</h2>
        <Card>
          <CardContent className='pt-6'>
            <h3 className='font-semibold mb-2'>/etc/mmw-agent/config.yaml</h3>
            <div className='bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto'>
              <pre>{`# MMWX Remote Server Configuration
# Generated by install script

mode: remote
master_url: https://your-domain.com
token: SERVER_TOKEN
connection_mode: websocket    # websocket | http | pull | auto
xray_mode: external           # external | embedded
steal_mode:                   # 留空 / tunnel(自动偷自己时填 tunnel)
master_public_key: <BASE64_PUBLIC_KEY>
listen_port: "23889"`}</pre>
            </div>
            <p className='text-xs text-muted-foreground mt-3'>{t('installAgent.configFile.note')}</p>
          </CardContent>
        </Card>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('installAgent.systemdService.heading')}</h2>
        <Card>
          <CardContent className='pt-6'>
            <h3 className='font-semibold mb-2'>/etc/systemd/system/mmw-agent.service</h3>
            <div className='bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto'>
              <pre>{`[Unit]
Description=MMW Agent Remote Server
After=network.target

[Service]
Type=simple
ExecStart=/usr/local/bin/mmw-agent -c /etc/mmw-agent/config.yaml
Restart=always
RestartSec=5
WorkingDirectory=/var/lib/mmw-agent

[Install]
WantedBy=multi-user.target`}</pre>
            </div>
            <p className='text-xs text-muted-foreground mt-3'>{t('installAgent.systemdService.note')}</p>
          </CardContent>
        </Card>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('installAgent.connectionMode.heading')}</h2>
        <p className='text-muted-foreground mb-4'>
          {t('installAgent.connectionMode.text')}
        </p>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead><tr className='border-b'><th className='text-left py-3 px-4'>{t('installAgent.connectionMode.modeCol')}</th><th className='text-left py-3 px-4'>{t('installAgent.connectionMode.valueCol')}</th><th className='text-left py-3 px-4'>{t('installAgent.connectionMode.descCol')}</th></tr></thead>
            <tbody>
              <tr className='border-b'><td className='py-3 px-4'>WebSocket</td><td className='py-3 px-4 font-mono text-xs'>websocket</td><td className='py-3 px-4'>{t('installAgent.connectionMode.wsDesc')}</td></tr>
              <tr className='border-b'><td className='py-3 px-4'>HTTP</td><td className='py-3 px-4 font-mono text-xs'>http</td><td className='py-3 px-4'>{t('installAgent.connectionMode.httpDesc')}</td></tr>
              <tr className='border-b'><td className='py-3 px-4'>Pull</td><td className='py-3 px-4 font-mono text-xs'>pull</td><td className='py-3 px-4'>{t('installAgent.connectionMode.pullDesc')}</td></tr>
              <tr><td className='py-3 px-4'>Auto</td><td className='py-3 px-4 font-mono text-xs'>auto</td><td className='py-3 px-4'>{t('installAgent.connectionMode.autoDesc')}</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('installAgent.opsCommands.heading')}</h2>
        <Card>
          <CardContent className='pt-6'>
            <div className='bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto'>
              <pre>{`# 查看服务状态
systemctl status mmw-agent

# 查看实时日志
journalctl -u mmw-agent -f

# 重启服务
systemctl restart mmw-agent

# 停止服务
systemctl stop mmw-agent

# Alpine (OpenRC):
#   rc-service mmw-agent {status|start|stop|restart}
#   tail -f /var/log/mmw-agent.log
# LXC / 无 init 系统兜底:
#   pgrep -af mmw-agent
#   tail -f /var/log/mmw-agent.log`}</pre>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('installAgent.reinstall.heading')}</h2>
        <p className='text-muted-foreground mb-4'>
          {t('installAgent.reinstall.text')}
        </p>
      </section>

      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('installAgent.supportedArch.heading')}</h2>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead><tr className='border-b'><th className='text-left py-3 px-4'>{t('installAgent.supportedArch.archCol')}</th><th className='text-left py-3 px-4'>uname -m</th><th className='text-left py-3 px-4'>{t('installAgent.supportedArch.downloadCol')}</th></tr></thead>
            <tbody>
              <tr className='border-b'><td className='py-3 px-4'>x86_64</td><td className='py-3 px-4 font-mono text-xs'>x86_64</td><td className='py-3 px-4 font-mono text-xs'>mmw-agent-linux-amd64</td></tr>
              <tr><td className='py-3 px-4'>ARM64</td><td className='py-3 px-4 font-mono text-xs'>aarch64 / arm64</td><td className='py-3 px-4 font-mono text-xs'>mmw-agent-linux-arm64</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <Link to='/docs/remote-servers' className='text-primary hover:underline'>{t('installAgent.manageRemote')}</Link>
      </section>
    </XDocLayout>
  )
}
