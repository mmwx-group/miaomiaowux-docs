import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { XDocLayout } from "@/components/docs/x-doc-layout";
import { Card, CardContent } from "@/components/ui/card";
import { StepIndicator } from "@/components/docs/step-indicator";
import { Screenshot } from "@/components/docs/screenshot";
import { AlertTriangle, Info } from "lucide-react";

export const Route = createFileRoute("/docs/tutorial")({
  component: TutorialPage,
});

const masterProxyConfig = `server {
    listen 443;
    #listen 443 quic;
    listen [::]:443;
    #listen [::]:443 quic;
    http2 on;
    server_name {domain};

    ssl_certificate /usr/local/nginx/cert/{domain}/fullchain.pem;
    ssl_certificate_key /usr/local/nginx/cert/{domain}/privkey.pem;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE:ECDH:AES:HIGH:!NULL:!aNULL:!MD5:!ADH:!RC4;
    ssl_prefer_server_ciphers on;
    error_page 497 https://$host:443$1;
    #add_header Alt-Svc 'h3=":443"; ma=2592000,h3-29=":443"; ma=2592000';
    ssl_protocols TLSv1 TLSv1.1 TLSv1.2;

    location / {
        proxy_ssl_server_name on;
        proxy_set_header Host $host;
        client_max_body_size 512M;
        proxy_set_header Connection $http_connection;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_pass http://127.0.0.1:12889;
    }

    proxy_read_timeout 600s;
    proxy_connect_timeout 600s;
}`;

const subscriptionProxyConfig = `server {
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;

    server_name {domain};

    ssl_certificate /usr/local/nginx/cert/{domain}/fullchain.pem;
    ssl_certificate_key /usr/local/nginx/cert/{domain}/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    # Allowed endpoints:
    #   /x/{code}                    short links and package subscription links
    #   /api/clash/subscribe         direct Clash/Mihomo subscriptions
    #   /api/user/package-subscribe  direct package subscriptions
    #   /api/subscribe               compatibility endpoint
    location ~ ^(?:/x/|/api/(?:clash/subscribe|user/package-subscribe|subscribe)$) {
        proxy_pass http://127.0.0.1:12889;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
        proxy_buffering off;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    location / {
        return 404;
    }
}`;

const caddyInstallCommand = `sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo chmod o+r /usr/share/keyrings/caddy-stable-archive-keyring.gpg
sudo chmod o+r /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy`;

const nginxCertificateCommand = `# 先在本地执行，将解压后的证书上传到主控服务器
scp fullchain.pem privkey.pem root@{server_ip}:/tmp/

# 再登录主控服务器执行；将 {domain} 替换为对应域名
sudo mkdir -p /usr/local/nginx/cert/{domain}
sudo cp /tmp/fullchain.pem /usr/local/nginx/cert/{domain}/fullchain.pem
sudo cp /tmp/privkey.pem /usr/local/nginx/cert/{domain}/privkey.pem
sudo chmod 644 /usr/local/nginx/cert/{domain}/fullchain.pem
sudo chmod 600 /usr/local/nginx/cert/{domain}/privkey.pem`;

const caddyProxyConfig = `{master_domain} {
    reverse_proxy 127.0.0.1:12889
}

{subscription_domain} {
    @subscriptions {
        path /x/* /api/clash/subscribe /api/user/package-subscribe /api/subscribe
    }

    handle @subscriptions {
        reverse_proxy 127.0.0.1:12889
    }

    handle {
        respond 404
    }
}`;

function TutorialPage() {
  const { t } = useTranslation("xdocs");

  const steps = [
    t("tutorial.steps.prepare"),
    t("tutorial.steps.dns"),
    t("tutorial.steps.installMaster"),
    t("tutorial.steps.init"),
    "HTTPS",
    t("tutorial.steps.addServer"),
    t("tutorial.steps.installAgent"),
    t("tutorial.steps.addNode"),
    t("tutorial.steps.createPackage"),
    t("tutorial.steps.bindPackage"),
    t("tutorial.steps.trafficInfo"),
    t("tutorial.steps.tools"),
  ];

  return (
    <XDocLayout
      title={t("tutorial.title")}
      description={t("tutorial.description")}
    >
      <div className="mb-8 overflow-x-auto pb-4">
        <StepIndicator currentStep={0} totalSteps={12} labels={steps} />
      </div>

      <div className="flex items-start gap-2 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 mb-8">
        <AlertTriangle className="size-5 text-amber-500 mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold text-amber-700 dark:text-amber-400">
            {t("tutorial.deploymentWarning.heading")}
          </p>
          <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
            {t("tutorial.deploymentWarning.text")}
          </p>
        </div>
      </div>

      {/* Step 1 */}
      <section id="step-1" className="mb-10">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
          <div className="size-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
            1
          </div>
          {t("tutorial.step1.heading")}
        </h2>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground mb-4">
              {t("tutorial.step1.text")}
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 pr-8 font-medium">
                      {t("tutorial.step1.itemCol")}
                    </th>
                    <th className="text-left py-2 font-medium">
                      {t("tutorial.step1.quantityCol")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 pr-8">{t("tutorial.step1.domain")}</td>
                    <td className="py-2">{t("tutorial.step1.domainQty")}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-8">{t("tutorial.step1.server")}</td>
                    <td className="py-2">{t("tutorial.step1.serverQty")}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 mt-4">
              <AlertTriangle className="size-4 text-amber-500 mt-0.5 shrink-0" />
              <p className="text-sm text-amber-700 dark:text-amber-400">
                {t("tutorial.step1.realityWarning")}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Step 2 */}
      <section id="step-2" className="mb-10">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
          <div className="size-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
            2
          </div>
          {t("tutorial.step2.heading")}
        </h2>
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div>
              <h3 className="font-medium mb-2">
                {t("tutorial.step2.masterDomain")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("tutorial.step2.masterDomainText")}
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">
                {t("tutorial.step2.serverDomain")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("tutorial.step2.serverDomainText")}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Step 3 */}
      <section id="step-3" className="mb-10">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
          <div className="size-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
            3
          </div>
          {t("tutorial.step3.heading")}
        </h2>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground mb-4">
              {t("tutorial.step3.text")}
            </p>
            <div className="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <pre>
                {
                  "curl -sL https://raw.githubusercontent.com/iluobei/miaomiaowuX/main/install.sh | sudo bash"
                }
              </pre>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              {t("tutorial.step3.moreInstall")}{" "}
              <Link
                to="/docs/install-docker"
                className="text-primary hover:underline"
              >
                {t("tutorial.step3.dockerInstall")}
              </Link>{" "}
              {t("tutorial.step3.or")}{" "}
              <Link
                to="/docs/install-direct"
                className="text-primary hover:underline"
              >
                {t("tutorial.step3.directInstall")}
              </Link>
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Step 4 */}
      <section id="step-4" className="mb-10">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
          <div className="size-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
            4
          </div>
          {t("tutorial.step4.heading")}
        </h2>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground mb-4">
              {t("tutorial.step4.text")}
            </p>
            <div className="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto mb-4">
              <pre>http://mmwx.example.com:12889</pre>
            </div>
            <p className="text-sm text-muted-foreground">
              {t("tutorial.step4.registerText")}
            </p>
            <Screenshot
              src="/images/screenshots/tutorial-step4-setup-wizard.webp"
              alt={t("tutorial.step4.screenshotAlt")}
              caption={t("tutorial.step4.screenshotCaption")}
            />
          </CardContent>
        </Card>
      </section>

      {/* Step 5 */}
      <section id="step-5" className="mb-10">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
          <div className="size-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
            5
          </div>
          {t("tutorial.step5.heading")}
        </h2>

        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-medium mb-3">
                {t("tutorial.step5.configureDns.heading")}
              </h3>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li>{t("tutorial.step5.configureDns.step1")}</li>
                <li>{t("tutorial.step5.configureDns.step2")}</li>
                <li>{t("tutorial.step5.configureDns.step3")}</li>
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-medium mb-3">
                {t("tutorial.step5.applyCert.heading")}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t("tutorial.step5.applyCert.text")}
              </p>
              <Screenshot
                src="/images/screenshots/tutorial-step5-certificates-list.webp"
                alt={t("tutorial.step5.applyCert.listAlt")}
                caption={t("tutorial.step5.applyCert.listCaption")}
              />
              <Screenshot
                src="/images/screenshots/tutorial-step5-apply-cert-dialog.webp"
                alt={t("tutorial.step5.applyCert.dialogAlt")}
                caption={t("tutorial.step5.applyCert.dialogCaption")}
              />
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 pr-4 font-medium">
                        {t("tutorial.step5.applyCert.inputCol")}
                      </th>
                      <th className="text-left py-2 pr-4 font-medium">
                        {t("tutorial.step5.applyCert.contentCol")}
                      </th>
                      <th className="text-left py-2 font-medium">
                        {t("tutorial.step5.applyCert.noteCol")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-b">
                      <td className="py-2 pr-4">
                        {t("tutorial.step5.applyCert.domain")}
                      </td>
                      <td className="py-2 pr-4">
                        <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                          *.example.com
                        </code>
                      </td>
                      <td className="py-2">
                        {t("tutorial.step5.applyCert.domainNote")}
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 pr-4">
                        {t("tutorial.step5.applyCert.email")}
                      </td>
                      <td className="py-2 pr-4">
                        {t("tutorial.step5.applyCert.emailValue")}
                      </td>
                      <td className="py-2">
                        {t("tutorial.step5.applyCert.emailNote")}
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 pr-4">
                        {t("tutorial.step5.applyCert.caProvider")}
                      </td>
                      <td className="py-2 pr-4">Let's Encrypt</td>
                      <td className="py-2">
                        {t("tutorial.step5.applyCert.caProviderNote")}
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 pr-4">
                        {t("tutorial.step5.applyCert.targetServer")}
                      </td>
                      <td className="py-2 pr-4">Master</td>
                      <td className="py-2">
                        {t("tutorial.step5.applyCert.targetServerNote")}
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 pr-4">
                        {t("tutorial.step5.applyCert.verifyMethod")}
                      </td>
                      <td className="py-2 pr-4">DNS-01</td>
                      <td className="py-2">
                        {t("tutorial.step5.applyCert.verifyMethodNote")}
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 pr-4">
                        {t("tutorial.step5.applyCert.dnsProvider")}
                      </td>
                      <td className="py-2 pr-4">
                        {t("tutorial.step5.applyCert.dnsProviderValue")}
                      </td>
                      <td className="py-2"></td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 pr-4">
                        {t("tutorial.step5.applyCert.autoRenew")}
                      </td>
                      <td className="py-2 pr-4">
                        {t("tutorial.step5.applyCert.enabled")}
                      </td>
                      <td className="py-2">
                        {t("tutorial.step5.applyCert.autoRenewNote")}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4">
                        {t("tutorial.step5.applyCert.autoDeploy")}
                      </td>
                      <td className="py-2 pr-4">
                        {t("tutorial.step5.applyCert.disabled")}
                      </td>
                      <td className="py-2">
                        {t("tutorial.step5.applyCert.autoDeployNote")}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                {t("tutorial.step5.applyCert.submitText")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-medium mb-3">
                {t("tutorial.step5.deployCert.heading")}
              </h3>
              <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 mb-3">
                <Info className="size-4 text-blue-500 mt-0.5 shrink-0" />
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  {t("tutorial.step5.deployCert.installNote")}
                </p>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {t("tutorial.step5.deployCert.text")}
              </p>
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <AlertTriangle className="size-4 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  {t("tutorial.step5.deployCert.warning")}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-medium mb-3">
                {t("tutorial.step5.reverseProxy.heading")}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t("tutorial.step5.reverseProxy.intro")}
              </p>
              <h4 className="font-medium mb-2">
                {t("tutorial.step5.reverseProxy.installHeading")}
              </h4>
              <div className="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto mb-4">
                <pre>
                  {
                    "curl -fsSL https://raw.githubusercontent.com/iluobei/miaomiaowuX/main/install-nginx.sh | bash"
                  }
                </pre>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {t("tutorial.step5.reverseProxy.installText")}
              </p>

              <h4 className="font-medium mb-2">
                {t("tutorial.step5.reverseProxy.certificateHeading")}
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                {t("tutorial.step5.reverseProxy.certificateText")}
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5 mb-3">
                <li>
                  <code>fullchain.pem</code>:{" "}
                  {t("tutorial.step5.reverseProxy.fullchainDescription")}
                </li>
                <li>
                  <code>privkey.pem</code>:{" "}
                  {t("tutorial.step5.reverseProxy.privateKeyDescription")}
                </li>
              </ul>
              <p className="text-sm text-muted-foreground mb-3">
                {t("tutorial.step5.reverseProxy.certificateUploadText")}
              </p>
              <div className="bg-muted rounded-lg p-4 font-mono text-xs overflow-x-auto mb-6">
                <pre>{nginxCertificateCommand}</pre>
              </div>

              <h4 className="font-medium mb-2">
                {t("tutorial.step5.reverseProxy.masterHeading")}
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                {t("tutorial.step5.reverseProxy.masterText")}
              </p>
              <div className="bg-muted rounded-lg p-4 font-mono text-xs overflow-x-auto mb-6">
                <pre>{masterProxyConfig}</pre>
              </div>

              <h4 className="font-medium mb-2">
                {t("tutorial.step5.reverseProxy.subscriptionHeading")}
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                {t("tutorial.step5.reverseProxy.subscriptionText")}
              </p>
              <div className="bg-muted rounded-lg p-4 font-mono text-xs overflow-x-auto mb-4">
                <pre>{subscriptionProxyConfig}</pre>
              </div>
              <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 mb-4">
                <Info className="size-4 text-blue-500 mt-0.5 shrink-0" />
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  {t("tutorial.step5.reverseProxy.subscriptionSettingPre")}{" "}
                  <Link
                    to="/docs/system-settings"
                    className="font-medium underline underline-offset-4"
                  >
                    {t("tutorial.step5.reverseProxy.systemSettings")}
                  </Link>
                  {t("tutorial.step5.reverseProxy.subscriptionSettingPost")}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                {t("tutorial.step5.reverseProxy.finishText")}
              </p>

              <div className="mt-8 border-t pt-6">
                <h3 className="font-medium mb-3">
                  {t("tutorial.step5.reverseProxy.caddyHeading")}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t("tutorial.step5.reverseProxy.caddyIntro")}
                </p>

                <h4 className="font-medium mb-2">
                  {t("tutorial.step5.reverseProxy.caddyInstallHeading")}
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  {t("tutorial.step5.reverseProxy.caddyInstallText")}
                </p>
                <div className="bg-muted rounded-lg p-4 font-mono text-xs overflow-x-auto mb-6">
                  <pre>{caddyInstallCommand}</pre>
                </div>

                <h4 className="font-medium mb-2">
                  {t("tutorial.step5.reverseProxy.caddyConfigHeading")}
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  {t("tutorial.step5.reverseProxy.caddyConfigText")}
                </p>
                <div className="bg-muted rounded-lg p-4 font-mono text-xs overflow-x-auto mb-4">
                  <pre>{caddyProxyConfig}</pre>
                </div>

                <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 mb-4">
                  <Info className="size-4 text-blue-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    {t("tutorial.step5.reverseProxy.caddyHttpsNote")}
                  </p>
                </div>
                <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 mb-4">
                  <AlertTriangle className="size-4 text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    {t("tutorial.step5.reverseProxy.caddySubscriptionPre")}{" "}
                    <Link
                      to="/docs/system-settings"
                      className="font-medium underline underline-offset-4"
                    >
                      {t("tutorial.step5.reverseProxy.systemSettings")}
                    </Link>
                    {t("tutorial.step5.reverseProxy.caddySubscriptionPost")}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {t("tutorial.step5.reverseProxy.caddyFinishText")}
                </p>
                <div className="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto">
                  <pre>{`sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy`}</pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Step 6 */}
      <section id="step-6" className="mb-10">
        <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 mb-4">
          <AlertTriangle className="size-4 text-amber-500 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-700 dark:text-amber-400">
            {t("tutorial.step6.publicAccessWarning")}
          </p>
        </div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
          <div className="size-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
            6
          </div>
          {t("tutorial.step6.heading")}
        </h2>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 mb-4">
              <Info className="size-4 text-blue-500 mt-0.5 shrink-0" />
              <p className="text-sm text-blue-700 dark:text-blue-400">
                {t("tutorial.step6.infoNote")}
              </p>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {t("tutorial.step6.text")}
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 pr-4 font-medium">
                      {t("tutorial.step6.inputCol")}
                    </th>
                    <th className="text-left py-2 pr-4 font-medium">
                      {t("tutorial.step6.contentCol")}
                    </th>
                    <th className="text-left py-2 font-medium">
                      {t("tutorial.step6.noteCol")}
                    </th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b">
                    <td className="py-2 pr-4">
                      {t("tutorial.step6.serverName")}
                    </td>
                    <td className="py-2 pr-4">
                      {t("tutorial.step6.serverNameValue")}
                    </td>
                    <td className="py-2"></td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4">
                      {t("tutorial.step6.serverAddr")}
                    </td>
                    <td className="py-2 pr-4">
                      {t("tutorial.step6.serverAddrValue")}
                    </td>
                    <td className="py-2"></td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4">
                      {t("tutorial.step6.trafficLimit")}
                    </td>
                    <td className="py-2 pr-4">
                      {t("tutorial.step6.trafficLimitValue")}
                    </td>
                    <td className="py-2"></td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4">
                      {t("tutorial.step6.usedTraffic")}
                    </td>
                    <td className="py-2 pr-4">
                      {t("tutorial.step6.usedTrafficValue")}
                    </td>
                    <td className="py-2"></td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4">
                      {t("tutorial.step6.resetDate")}
                    </td>
                    <td className="py-2 pr-4">
                      {t("tutorial.step6.resetDateValue")}
                    </td>
                    <td className="py-2"></td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4">
                      {t("tutorial.step6.stealSelf")}
                    </td>
                    <td className="py-2 pr-4">
                      {t("tutorial.step6.stealSelfValue")}
                    </td>
                    <td className="py-2">
                      {t("tutorial.step6.stealSelfNote")}
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4">
                      {t("tutorial.step6.frontendSelect")}
                    </td>
                    <td className="py-2 pr-4">Xray</td>
                    <td className="py-2">
                      {t("tutorial.step6.frontendSelectNote")}
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4">
                      {t("tutorial.step6.deployMode")}
                    </td>
                    <td className="py-2 pr-4">Tunnel / Fallback</td>
                    <td className="py-2">
                      {t("tutorial.step6.deployModeNote")}
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4">{t("tutorial.step6.use443")}</td>
                    <td className="py-2 pr-4">443</td>
                    <td className="py-2">{t("tutorial.step6.use443Note")}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4">
                      {t("tutorial.step6.domainField")}
                    </td>
                    <td className="py-2 pr-4">
                      {t("tutorial.step6.domainFieldValue")}
                    </td>
                    <td className="py-2">
                      {t("tutorial.step6.domainFieldNote")}
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4">
                      {t("tutorial.step6.websiteType")}
                    </td>
                    <td className="py-2 pr-4">
                      {t("tutorial.step6.websiteTypeValue")}
                    </td>
                    <td className="py-2"></td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4">
                      {t("tutorial.step6.staticPage")}
                    </td>
                    <td className="py-2 pr-4">
                      {t("tutorial.step6.staticPageValue")}
                    </td>
                    <td className="py-2"></td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">
                      {t("tutorial.step6.reverseProxy")}
                    </td>
                    <td className="py-2 pr-4">
                      {t("tutorial.step6.reverseProxyValue")}
                    </td>
                    <td className="py-2"></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <AlertTriangle className="size-4 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  {t("tutorial.step6.port443Warning")}
                </p>
              </div>
              <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <Info className="size-4 text-blue-500 mt-0.5 shrink-0" />
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  {t("tutorial.step6.addWebsiteInfo")}
                </p>
              </div>
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <AlertTriangle className="size-4 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  {t("tutorial.step6.stealSelfWarning")}
                </p>
              </div>
            </div>
            <Screenshot
              src="/images/screenshots/tutorial-step6-servers-list.webp"
              alt={t("tutorial.step6.screenshotAlt")}
              caption={t("tutorial.step6.screenshotCaption")}
            />
            <div className="mt-6 border-t pt-6">
              <h3 className="font-medium mb-3">
                {t("tutorial.step6.masterSelf.heading")}
              </h3>
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 mb-4">
                <AlertTriangle className="size-4 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                  {t("tutorial.step6.masterSelf.warning")}
                </p>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {t("tutorial.step6.masterSelf.prerequisite")}
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
                <li>{t("tutorial.step6.masterSelf.domain")}</li>
                <li>{t("tutorial.step6.masterSelf.websiteType")}</li>
                <li>{t("tutorial.step6.masterSelf.proxyAddress")}</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-4">
                {t("tutorial.step6.masterSelf.next")}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Step 7 */}
      <section id="step-7" className="mb-10">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
          <div className="size-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
            7
          </div>
          {t("tutorial.step7.heading")}
        </h2>
        <Card>
          <CardContent className="pt-6">
            <ol className="space-y-3 text-sm text-muted-foreground">
              <li>{t("tutorial.step7.item1")}</li>
              <li>{t("tutorial.step7.item2")}</li>
              <li>{t("tutorial.step7.item3")}</li>
              <li>{t("tutorial.step7.item4")}</li>
            </ol>
            <p className="text-sm text-muted-foreground mt-4">
              {t("tutorial.step7.detailRef")}{" "}
              <Link
                to="/docs/install-agent"
                className="text-primary hover:underline"
              >
                {t("tutorial.step7.agentDeploy")}
              </Link>
            </p>
            <div className="mt-6 border-t pt-6">
              <p className="text-sm text-muted-foreground">
                {t("tutorial.step7.localAgent.text")}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Step 8 */}
      <section id="step-8" className="mb-10">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
          <div className="size-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
            8
          </div>
          {t("tutorial.step8.heading")}
        </h2>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 mb-2">
              <Info className="size-4 text-blue-500 mt-0.5 shrink-0" />
              <p className="text-sm font-medium text-blue-700 dark:text-blue-400">
                {t("tutorial.step8.stealSelfIntro")}
              </p>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {t("tutorial.step8.text")}
            </p>
            <div className="mb-6 border-b pb-6">
              <h3 className="font-medium mb-3">
                {t("tutorial.step8.firstReality.heading")}
              </h3>
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 mb-3">
                <AlertTriangle className="size-4 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                  {t("tutorial.step8.firstReality.note")}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                {t("tutorial.step8.firstReality.portExplanation")}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 pr-4 font-medium">
                      {t("tutorial.step8.inputCol")}
                    </th>
                    <th className="text-left py-2 pr-4 font-medium">
                      {t("tutorial.step8.contentCol")}
                    </th>
                    <th className="text-left py-2 font-medium">
                      {t("tutorial.step8.noteCol")}
                    </th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b">
                    <td className="py-2 pr-4">
                      {t("tutorial.step8.protocolType")}
                    </td>
                    <td className="py-2 pr-4">
                      {t("tutorial.step8.protocolTypeValue")}
                    </td>
                    <td className="py-2"></td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4">
                      {t("tutorial.step8.nodeName")}
                    </td>
                    <td className="py-2 pr-4">
                      {t("tutorial.step8.nodeNameValue")}
                    </td>
                    <td className="py-2"></td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4">
                      {t("tutorial.step8.realityDomain")}
                    </td>
                    <td className="py-2 pr-4">
                      {t("tutorial.step8.realityDomainValue")}
                    </td>
                    <td className="py-2">
                      {t("tutorial.step8.realityDomainNote")}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">
                      {t("tutorial.step8.selectUser")}
                    </td>
                    <td className="py-2 pr-4">
                      {t("tutorial.step8.selectUserValue")}
                    </td>
                    <td className="py-2"></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              {t("tutorial.step8.saveNote")}
            </p>
            <Screenshot
              src="/images/screenshots/tutorial-step8-nodes-list.webp"
              alt={t("tutorial.step8.screenshotAlt")}
              caption={t("tutorial.step8.screenshotCaption")}
            />
            <div className="mt-6 border-t pt-6">
              <h3 className="font-medium mb-3">
                {t("tutorial.step8.nodeCheck.heading")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("tutorial.step8.nodeCheck.text")}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Step 9: 创建套餐 */}
      <section id="step-9" className="mb-10">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
          <div className="size-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
            9
          </div>
          {t("tutorial.step9.heading")}
        </h2>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-4">
              {t("tutorial.step9.text")}
            </p>
            <Screenshot
              src="/images/screenshots/tutorial-step9-packages-list.webp"
              alt={t("tutorial.step9.listAlt")}
              caption={t("tutorial.step9.listCaption")}
            />
            <Screenshot
              src="/images/screenshots/tutorial-step9-package-create-dialog.webp"
              alt={t("tutorial.step9.dialogAlt")}
              caption={t("tutorial.step9.dialogCaption")}
            />
          </CardContent>
        </Card>
      </section>

      {/* Step 10: 绑定套餐 */}
      <section id="step-10" className="mb-10">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
          <div className="size-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
            10
          </div>
          {t("tutorial.step10.heading")}
        </h2>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-4">
              {t("tutorial.step10.text")}
            </p>
            <Screenshot
              src="/images/screenshots/tutorial-step10-users-list.webp"
              alt={t("tutorial.step10.listAlt")}
              caption={t("tutorial.step10.listCaption")}
            />
            <Screenshot
              src="/images/screenshots/tutorial-step10-bind-package-dialog.webp"
              alt={t("tutorial.step10.dialogAlt")}
              caption={t("tutorial.step10.dialogCaption")}
            />
          </CardContent>
        </Card>
      </section>

      {/* Step 11: 流量信息 */}
      <section id="step-11" className="mb-10">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
          <div className="size-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
            11
          </div>
          {t("tutorial.step11.heading")}
        </h2>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-4">
              {t("tutorial.step11.text")}
            </p>
            <h3 className="font-medium mb-2">
              {t("tutorial.step11.userView.heading")}
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              {t("tutorial.step11.userView.text")}
            </p>
            <Screenshot
              src="/images/screenshots/tutorial-step11-user-view.webp"
              alt={t("tutorial.step11.userView.alt")}
              caption={t("tutorial.step11.userView.caption")}
            />
            <h3 className="font-medium mb-2 mt-6">
              {t("tutorial.step11.nodeView.heading")}
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              {t("tutorial.step11.nodeView.text")}
            </p>
            <Screenshot
              src="/images/screenshots/tutorial-step11-node-view.webp"
              alt={t("tutorial.step11.nodeView.alt")}
              caption={t("tutorial.step11.nodeView.caption")}
            />
            <h3 className="font-medium mb-2 mt-6">
              {t("tutorial.step11.serverView.heading")}
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              {t("tutorial.step11.serverView.text")}
            </p>
            <Screenshot
              src="/images/screenshots/tutorial-step11-server-view.webp"
              alt={t("tutorial.step11.serverView.alt")}
              caption={t("tutorial.step11.serverView.caption")}
            />
          </CardContent>
        </Card>
      </section>

      {/* Step 12: 小工具 (TG Bot & MiniApp) */}
      <section id="step-12" className="mb-10">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
          <div className="size-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
            12
          </div>
          {t("tutorial.step12.heading")}
        </h2>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-4">
              {t("tutorial.step12.text")}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              {t("tutorial.step12.settingsRef")}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <h3 className="font-medium mb-2 text-sm">
                  {t("tutorial.step12.adminView.heading")}
                </h3>
                <Screenshot
                  src="/images/screenshots/tutorial-step12-miniapp-admin.webp"
                  alt={t("tutorial.step12.adminView.alt")}
                  caption={t("tutorial.step12.adminView.caption")}
                />
              </div>
              <div>
                <h3 className="font-medium mb-2 text-sm">
                  {t("tutorial.step12.userView.heading")}
                </h3>
                <Screenshot
                  src="/images/screenshots/tutorial-step12-miniapp-user.webp"
                  alt={t("tutorial.step12.userView.alt")}
                  caption={t("tutorial.step12.userView.caption")}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </XDocLayout>
  );
}
