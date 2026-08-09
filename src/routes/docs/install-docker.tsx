import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { XDocLayout } from "@/components/docs/x-doc-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

export const Route = createFileRoute("/docs/install-docker")({
  component: InstallDockerPage,
});

function InstallDockerPage() {
  const { t } = useTranslation("xdocs");

  return (
    <XDocLayout
      title={t("installDocker.title")}
      description={t("installDocker.description")}
    >
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">
          {t("installDocker.quickDeploy.heading")}
        </h2>
        <Card>
          <CardContent className="pt-6">
            <div className="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <pre>{`# 推荐：运行统一安装脚本，然后选择“Docker Compose 安装”
curl -sL https://raw.githubusercontent.com/iluobei/miaomiaowuX/main/install.sh | sudo bash

# 脚本随后让你选择 SQLite 或 PostgreSQL 18，自动创建 Compose、.env 和持久化目录。
# 镜像内置 Nginx，主控可直接申请证书并启用 HTTPS。`}</pre>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">
          {t("installDocker.httpsProxy.heading")}
        </h2>
        <Alert className="mb-4">
          <Info className="h-4 w-4" />
          <AlertTitle>{t("installDocker.httpsProxy.alertTitle")}</AlertTitle>
          <AlertDescription>
            {t("installDocker.httpsProxy.alertText")}
          </AlertDescription>
        </Alert>
        <p className="text-muted-foreground mb-2">
          {t("installDocker.httpsProxy.text1")}
        </p>
        <ol className="space-y-1 text-sm text-muted-foreground ml-4 mb-4 list-decimal">
          <li>{t("installDocker.httpsProxy.step1")}</li>
          <li>{t("installDocker.httpsProxy.step2")}</li>
          <li>{t("installDocker.httpsProxy.step3")}</li>
        </ol>
        <p className="text-muted-foreground text-sm">
          {t("installDocker.httpsProxy.fallback")}
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">Docker Compose</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <pre>{`services:
  miaomiaowux:
    image: ghcr.io/iluobei/miaomiaowux:latest
    container_name: miaomiaowux
    restart: unless-stopped
    network_mode: host
    volumes:
      - ./data:/app/data
      - ./subscribes:/app/subscribes
      - ./rule_templates:/app/rule_templates
    environment:
      - PORT=12889
      - LOG_LEVEL=info
  postgres:
    image: postgres:18-alpine
    container_name: miaomiaowux-postgres
    restart: unless-stopped
    profiles: ["postgres"]
    environment:
      POSTGRES_DB: mmwx
      POSTGRES_USER: mmwx
      POSTGRES_PASSWORD: 请替换为强密码
    volumes:
      - ./postgres-data:/var/lib/postgresql
    ports:
      - "127.0.0.1:5432:5432"`}</pre>
            </div>
          </CardContent>
        </Card>
        <p className="text-muted-foreground mt-3 text-sm">
          {t("installDocker.composeNote")}
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">使用 PostgreSQL</h2>
        <Card>
          <CardContent className="pt-6 space-y-3 text-sm text-muted-foreground">
            <p>
              一键脚本选择 PostgreSQL 后会自动启动 PostgreSQL 18
              并配置主控；已有 SQLite 主控可在 “系统设置 →
              数据库”测试连接并迁移。迁移前请备份
              <code className="mx-1">data</code>目录，目标数据库必须为空。
            </p>
            <p>
              主控使用 host 网络，因此数据库主机填写
              <code className="mx-1">127.0.0.1</code>、端口
              <code className="mx-1">5432</code>，不要填写服务名
              <code className="mx-1">postgres</code>。
            </p>
            <p>
              数据库连接保存在
              <code className="mx-1">/app/data/database.json</code>（权限
              0600）， PostgreSQL 数据保存在宿主机
              <code className="mx-1">./postgres-data</code>
              。不要提交这两个目录或密码。
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">
          {t("installDocker.dataPersistence.heading")}
        </h2>
        <p className="text-muted-foreground mb-4">
          {t("installDocker.dataPersistence.text")}
        </p>
      </section>

      <section>
        <Link to="/docs/install-agent" className="text-primary hover:underline">
          {t("installDocker.nextAgent")}
        </Link>
      </section>
    </XDocLayout>
  );
}
