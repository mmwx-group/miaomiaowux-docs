import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { XDocLayout } from '@/components/docs/x-doc-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Screenshot } from '@/components/docs/screenshot'

export const Route = createFileRoute('/docs/tool-mmwx-tgbot')({
  component: ToolMmwxTgbotPage,
})

function ToolMmwxTgbotPage() {
  const { t } = useTranslation('xdocs')

  return (
    <XDocLayout title={t('toolMmwxTgbot.title')} description={t('toolMmwxTgbot.description')}>
      {/* 简介 */}
      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('toolMmwxTgbot.overview.heading')}</h2>
        <p className='text-muted-foreground mb-4'>{t('toolMmwxTgbot.overview.text1')}</p>
        <Card>
          <CardContent className='pt-6'>
            <pre className='bg-muted rounded-lg p-4 font-mono text-xs overflow-x-auto'>{`                       ┌──────────────────────────────┐
   Telegram 用户 ──────▶│         mmwX-tgbot           │
   (命令 / Mini App)    │  long-poll  +  HTTP(:23088)  │
                       └───────────────┬──────────────┘
                                       │ Bearer <MMWX_API_TOKEN>
                                       ▼
                       ┌──────────────────────────────┐
                       │   妙妙屋X 主控  mmw.domain.com│
                       │   /api/admin/tgbot/*         │
                       └──────────────────────────────┘`}</pre>
          </CardContent>
        </Card>
        <p className='text-muted-foreground mt-4'>{t('toolMmwxTgbot.overview.text2')}</p>
      </section>

      {/* 功能一览 */}
      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('toolMmwxTgbot.features.heading')}</h2>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <Card>
            <CardContent className='pt-6'>
              <h3 className='font-semibold mb-3'>{t('toolMmwxTgbot.features.userHeading')}</h3>
              <ul className='text-sm text-muted-foreground space-y-1'>
                <li><code>/start &lt;code&gt;</code> — {t('toolMmwxTgbot.features.userStart')}</li>
                <li><code>/me</code> — {t('toolMmwxTgbot.features.userMe')}</li>
                <li><code>/sub</code> — {t('toolMmwxTgbot.features.userSub')}</li>
                <li><code>/traffic</code> — {t('toolMmwxTgbot.features.userTraffic')}</li>
                <li><code>/nodes</code> — {t('toolMmwxTgbot.features.userNodes')}</li>
                <li><code>/notify</code> — {t('toolMmwxTgbot.features.userNotify')}</li>
                <li><code>/unbind</code> — {t('toolMmwxTgbot.features.userUnbind')}</li>
                <li><code>/help</code> — {t('toolMmwxTgbot.features.userHelp')}</li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='pt-6'>
              <h3 className='font-semibold mb-3'>{t('toolMmwxTgbot.features.adminHeading')}</h3>
              <ul className='text-sm text-muted-foreground space-y-1'>
                <li><code>/admin_invite list</code> — {t('toolMmwxTgbot.features.adminList')}</li>
                <li><code>/admin_invite create</code> — {t('toolMmwxTgbot.features.adminCreate')}</li>
                <li><code>/admin_invite revoke</code> — {t('toolMmwxTgbot.features.adminRevoke')}</li>
                <li><code>/admin_user &lt;username&gt;</code> — {t('toolMmwxTgbot.features.adminUser')}</li>
              </ul>
              <p className='text-xs text-muted-foreground mt-3'>{t('toolMmwxTgbot.features.adminNote')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='pt-6'>
              <h3 className='font-semibold mb-3'>{t('toolMmwxTgbot.features.notifyHeading')}</h3>
              <p className='text-sm text-muted-foreground mb-2'>{t('toolMmwxTgbot.features.notifyText')}</p>
              <ul className='text-sm text-muted-foreground space-y-1'>
                <li>📊 {t('toolMmwxTgbot.features.notifyTraffic')}</li>
                <li>⏰ {t('toolMmwxTgbot.features.notifyExpire')}</li>
              </ul>
              <p className='text-xs text-muted-foreground mt-3'>{t('toolMmwxTgbot.features.notifyOptin')}</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Mini App */}
      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('toolMmwxTgbot.miniapp.heading')}</h2>
        <p className='text-muted-foreground mb-4'>{t('toolMmwxTgbot.miniapp.text')}</p>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
          <Card><CardContent className='pt-5 text-center'><div className='text-2xl mb-1'>🏠</div><div className='font-semibold text-sm'>{t('toolMmwxTgbot.miniapp.page1')}</div><div className='text-xs text-muted-foreground mt-1'>{t('toolMmwxTgbot.miniapp.page1Desc')}</div></CardContent></Card>
          <Card><CardContent className='pt-5 text-center'><div className='text-2xl mb-1'>📈</div><div className='font-semibold text-sm'>{t('toolMmwxTgbot.miniapp.page2')}</div><div className='text-xs text-muted-foreground mt-1'>{t('toolMmwxTgbot.miniapp.page2Desc')}</div></CardContent></Card>
          <Card><CardContent className='pt-5 text-center'><div className='text-2xl mb-1'>📡</div><div className='font-semibold text-sm'>{t('toolMmwxTgbot.miniapp.page3')}</div><div className='text-xs text-muted-foreground mt-1'>{t('toolMmwxTgbot.miniapp.page3Desc')}</div></CardContent></Card>
          <Card><CardContent className='pt-5 text-center'><div className='text-2xl mb-1'>🎟️</div><div className='font-semibold text-sm'>{t('toolMmwxTgbot.miniapp.page4')}</div><div className='text-xs text-muted-foreground mt-1'>{t('toolMmwxTgbot.miniapp.page4Desc')}</div></CardContent></Card>
        </div>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6'>
          <div>
            <h3 className='font-medium mb-2 text-sm'>{t('toolMmwxTgbot.screenshots.miniappAdminHeading')}</h3>
            <Screenshot
              src='/images/screenshots/tutorial-step12-miniapp-admin.webp'
              alt={t('toolMmwxTgbot.screenshots.miniappAdminAlt')}
              caption={t('toolMmwxTgbot.screenshots.miniappAdmin')}
            />
          </div>
          <div>
            <h3 className='font-medium mb-2 text-sm'>{t('toolMmwxTgbot.screenshots.miniappUserHeading')}</h3>
            <Screenshot
              src='/images/screenshots/tutorial-step12-miniapp-user.webp'
              alt={t('toolMmwxTgbot.screenshots.miniappUserAlt')}
              caption={t('toolMmwxTgbot.screenshots.miniappUser')}
            />
          </div>
        </div>
        <p className='text-sm text-amber-700 dark:text-amber-400 mt-4'>⚠️ {t('toolMmwxTgbot.miniapp.warn')}</p>
      </section>

      {/* 前置准备 */}
      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('toolMmwxTgbot.prereq.heading')}</h2>
        <div className='space-y-3'>
          <Card><CardContent className='pt-5'><h3 className='font-semibold mb-2'>1. {t('toolMmwxTgbot.prereq.s1Heading')}</h3><p className='text-sm text-muted-foreground'>{t('toolMmwxTgbot.prereq.s1Text')}</p></CardContent></Card>
          <Screenshot
            src='/images/screenshots/system-settings-api-token.webp'
            alt={t('toolMmwxTgbot.screenshots.apiTokenAlt')}
            caption={t('toolMmwxTgbot.screenshots.apiToken')}
          />
          <Card><CardContent className='pt-5'><h3 className='font-semibold mb-2'>2. {t('toolMmwxTgbot.prereq.s2Heading')}</h3><p className='text-sm text-muted-foreground'>{t('toolMmwxTgbot.prereq.s2Text')}</p></CardContent></Card>
          <Card><CardContent className='pt-5'><h3 className='font-semibold mb-2'>3. {t('toolMmwxTgbot.prereq.s3Heading')}</h3><p className='text-sm text-muted-foreground'>{t('toolMmwxTgbot.prereq.s3Text')}</p></CardContent></Card>
          <Card><CardContent className='pt-5'><h3 className='font-semibold mb-2'>4. {t('toolMmwxTgbot.prereq.s4Heading')}</h3><p className='text-sm text-muted-foreground'>{t('toolMmwxTgbot.prereq.s4Text')}</p></CardContent></Card>
        </div>
      </section>

      {/* 一键安装 */}
      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('toolMmwxTgbot.oneClick.heading')}</h2>
        <p className='text-muted-foreground mb-4'>{t('toolMmwxTgbot.oneClick.text')}</p>
        <Card>
          <CardContent className='pt-6'>
            <div className='bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto'>
              <pre>{`curl -fsSL https://raw.githubusercontent.com/mmwx-group/mmwX-tgbot/main/install.sh | sudo bash`}</pre>
            </div>
            <p className='text-xs text-muted-foreground mt-3'>{t('toolMmwxTgbot.oneClick.note')}</p>
          </CardContent>
        </Card>
      </section>

      {/* 配置文件详解 */}
      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('toolMmwxTgbot.configFile.heading')}</h2>
        <p className='text-muted-foreground mb-4'>{t('toolMmwxTgbot.configFile.text')}</p>
        <Card>
          <CardContent className='pt-6'>
            <h3 className='font-semibold mb-2'>/etc/mmwx-tgbot/config.yaml</h3>
            <div className='bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto'>
              <pre>{`mmwx_url: https://mmw.domain.com
mmwx_api_token: REPLACE_WITH_ADMIN_TOKEN
tg_bot_token: REPLACE_WITH_BOT_TOKEN
admin_tg_ids:
  - 123456789
http_timeout_seconds: 8
webapp_listen: "127.0.0.1:23088"
webapp_url: ""
webapp_dev_preview: false`}</pre>
            </div>
          </CardContent>
        </Card>
        <div className='overflow-x-auto mt-4'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b'>
                <th className='text-left py-2 px-3'>{t('toolMmwxTgbot.configFile.colField')}</th>
                <th className='text-left py-2 px-3'>{t('toolMmwxTgbot.configFile.colRequired')}</th>
                <th className='text-left py-2 px-3'>{t('toolMmwxTgbot.configFile.colDefault')}</th>
                <th className='text-left py-2 px-3'>{t('toolMmwxTgbot.configFile.colDesc')}</th>
              </tr>
            </thead>
            <tbody>
              <tr className='border-b'><td className='py-2 px-3 font-mono text-xs'>mmwx_url</td><td className='py-2 px-3'>✓</td><td className='py-2 px-3'>—</td><td className='py-2 px-3'>{t('toolMmwxTgbot.configFile.descMmwxUrl')}</td></tr>
              <tr className='border-b'><td className='py-2 px-3 font-mono text-xs'>mmwx_api_token</td><td className='py-2 px-3'>✓</td><td className='py-2 px-3'>—</td><td className='py-2 px-3'>{t('toolMmwxTgbot.configFile.descMmwxToken')}</td></tr>
              <tr className='border-b'><td className='py-2 px-3 font-mono text-xs'>tg_bot_token</td><td className='py-2 px-3'>✓</td><td className='py-2 px-3'>—</td><td className='py-2 px-3'>{t('toolMmwxTgbot.configFile.descTgBotToken')}</td></tr>
              <tr className='border-b'><td className='py-2 px-3 font-mono text-xs'>admin_tg_ids</td><td className='py-2 px-3'>—</td><td className='py-2 px-3'>[]</td><td className='py-2 px-3'>{t('toolMmwxTgbot.configFile.descAdminIds')}</td></tr>
              <tr className='border-b'><td className='py-2 px-3 font-mono text-xs'>http_timeout_seconds</td><td className='py-2 px-3'>—</td><td className='py-2 px-3'>8</td><td className='py-2 px-3'>{t('toolMmwxTgbot.configFile.descTimeout')}</td></tr>
              <tr className='border-b'><td className='py-2 px-3 font-mono text-xs'>webapp_listen</td><td className='py-2 px-3'>—</td><td className='py-2 px-3'>127.0.0.1:23088</td><td className='py-2 px-3'>{t('toolMmwxTgbot.configFile.descWebappListen')}</td></tr>
              <tr className='border-b'><td className='py-2 px-3 font-mono text-xs'>webapp_url</td><td className='py-2 px-3'>—</td><td className='py-2 px-3'>""</td><td className='py-2 px-3'>{t('toolMmwxTgbot.configFile.descWebappUrl')}</td></tr>
              <tr><td className='py-2 px-3 font-mono text-xs'>webapp_dev_preview</td><td className='py-2 px-3'>—</td><td className='py-2 px-3'>false</td><td className='py-2 px-3'>{t('toolMmwxTgbot.configFile.descWebappDev')}</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 环境变量 */}
      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('toolMmwxTgbot.envVars.heading')}</h2>
        <p className='text-muted-foreground mb-4'>{t('toolMmwxTgbot.envVars.text')}</p>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b'>
                <th className='text-left py-2 px-3'>{t('toolMmwxTgbot.envVars.colEnv')}</th>
                <th className='text-left py-2 px-3'>{t('toolMmwxTgbot.envVars.colField')}</th>
              </tr>
            </thead>
            <tbody>
              <tr className='border-b'><td className='py-2 px-3 font-mono text-xs'>MMWX_TGBOT_MMWX_URL</td><td className='py-2 px-3 font-mono text-xs'>mmwx_url</td></tr>
              <tr className='border-b'><td className='py-2 px-3 font-mono text-xs'>MMWX_TGBOT_MMWX_API_TOKEN</td><td className='py-2 px-3 font-mono text-xs'>mmwx_api_token</td></tr>
              <tr className='border-b'><td className='py-2 px-3 font-mono text-xs'>MMWX_TGBOT_TG_BOT_TOKEN</td><td className='py-2 px-3 font-mono text-xs'>tg_bot_token</td></tr>
              <tr className='border-b'><td className='py-2 px-3 font-mono text-xs'>MMWX_TGBOT_ADMIN_TG_IDS</td><td className='py-2 px-3 font-mono text-xs'>admin_tg_ids ({t('toolMmwxTgbot.envVars.commaSep')})</td></tr>
              <tr className='border-b'><td className='py-2 px-3 font-mono text-xs'>MMWX_TGBOT_WEBAPP_LISTEN</td><td className='py-2 px-3 font-mono text-xs'>webapp_listen</td></tr>
              <tr className='border-b'><td className='py-2 px-3 font-mono text-xs'>MMWX_TGBOT_WEBAPP_URL</td><td className='py-2 px-3 font-mono text-xs'>webapp_url</td></tr>
              <tr><td className='py-2 px-3 font-mono text-xs'>MMWX_TGBOT_HTTP_TIMEOUT_SECONDS</td><td className='py-2 px-3 font-mono text-xs'>http_timeout_seconds</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* systemd unit */}
      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('toolMmwxTgbot.systemd.heading')}</h2>
        <p className='text-muted-foreground mb-4'>{t('toolMmwxTgbot.systemd.text')}</p>
        <Card>
          <CardContent className='pt-6'>
            <h3 className='font-semibold mb-2'>/etc/systemd/system/mmwx-tgbot.service</h3>
            <div className='bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto'>
              <pre>{`[Unit]
Description=mmwX Telegram bot
After=network.target

[Service]
Type=simple
ExecStart=/usr/local/bin/mmwx-tgbot -c /etc/mmwx-tgbot/config.yaml
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target`}</pre>
            </div>
            <p className='text-xs text-muted-foreground mt-3'>{t('toolMmwxTgbot.systemd.cmdNote')}</p>
            <div className='bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto mt-2'>
              <pre>{`systemctl daemon-reload
systemctl enable --now mmwx-tgbot
journalctl -u mmwx-tgbot -f`}</pre>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Docker */}
      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('toolMmwxTgbot.docker.heading')}</h2>
        <p className='text-muted-foreground mb-4'>{t('toolMmwxTgbot.docker.text')}</p>
        <Card>
          <CardContent className='pt-6'>
            <div className='bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto'>
              <pre>{`docker run -d --name mmwx-tgbot --restart unless-stopped \\
  -p 127.0.0.1:23088:23088 \\
  -e MMWX_TGBOT_MMWX_URL=https://mmw.domain.com \\
  -e MMWX_TGBOT_MMWX_API_TOKEN=... \\
  -e MMWX_TGBOT_TG_BOT_TOKEN=... \\
  -e MMWX_TGBOT_ADMIN_TG_IDS=123 \\
  -e MMWX_TGBOT_WEBAPP_LISTEN=:23088 \\
  -e MMWX_TGBOT_WEBAPP_URL=https://mmw-tgbot.domain.com/app \\
  ghcr.io/mmwx-group/mmwx-tgbot:latest`}</pre>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Mini App nginx */}
      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('toolMmwxTgbot.nginx.heading')}</h2>
        <p className='text-muted-foreground mb-4'>{t('toolMmwxTgbot.nginx.text1')}</p>
        <Card>
          <CardContent className='pt-6'>
            <h3 className='font-semibold mb-2'>{t('toolMmwxTgbot.nginx.snippetTitle')}</h3>
            <div className='bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto'>
              <pre>{`location = /app {
    proxy_pass http://127.0.0.1:23088;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
location /api/tg-webapp/ {
    proxy_pass http://127.0.0.1:23088;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}`}</pre>
            </div>
            <p className='text-xs text-muted-foreground mt-3'>{t('toolMmwxTgbot.nginx.reloadNote')}</p>
            <div className='bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto mt-2'>
              <pre>{`nginx -t && nginx -s reload`}</pre>
            </div>
            <p className='text-xs text-muted-foreground mt-3'>{t('toolMmwxTgbot.nginx.webappUrlNote')}</p>
          </CardContent>
        </Card>
      </section>

      {/* FAQ */}
      <section className='mb-10'>
        <h2 className='text-2xl font-bold mb-4'>{t('toolMmwxTgbot.faq.heading')}</h2>
        <div className='space-y-3'>
          <Card><CardContent className='pt-5'><h3 className='font-semibold mb-2'>{t('toolMmwxTgbot.faq.q1')}</h3><p className='text-sm text-muted-foreground'>{t('toolMmwxTgbot.faq.a1')}</p></CardContent></Card>
          <Card><CardContent className='pt-5'><h3 className='font-semibold mb-2'>{t('toolMmwxTgbot.faq.q2')}</h3><p className='text-sm text-muted-foreground'>{t('toolMmwxTgbot.faq.a2')}</p></CardContent></Card>
          <Card><CardContent className='pt-5'><h3 className='font-semibold mb-2'>{t('toolMmwxTgbot.faq.q3')}</h3><p className='text-sm text-muted-foreground'>{t('toolMmwxTgbot.faq.a3')}</p></CardContent></Card>
          <Card><CardContent className='pt-5'><h3 className='font-semibold mb-2'>{t('toolMmwxTgbot.faq.q4')}</h3><p className='text-sm text-muted-foreground'>{t('toolMmwxTgbot.faq.a4')}</p></CardContent></Card>
        </div>
      </section>

      {/* 延伸阅读 */}
      <section>
        <h2 className='text-2xl font-bold mb-4'>{t('toolMmwxTgbot.links.heading')}</h2>
        <ul className='space-y-2 text-sm'>
          <li>
            <a href='https://github.com/mmwx-group/mmwX-tgbot' target='_blank' rel='noopener noreferrer' className='text-primary hover:underline'>
              GitHub · mmwx-group/mmwX-tgbot
            </a>
          </li>
          <li>
            <a href='https://github.com/mmwx-group/mmwX-tgbot/releases' target='_blank' rel='noopener noreferrer' className='text-primary hover:underline'>
              {t('toolMmwxTgbot.links.releases')}
            </a>
          </li>
          <li>
            <a href='https://core.telegram.org/bots/webapps' target='_blank' rel='noopener noreferrer' className='text-primary hover:underline'>
              {t('toolMmwxTgbot.links.tgWebapps')}
            </a>
          </li>
        </ul>
      </section>
    </XDocLayout>
  )
}
