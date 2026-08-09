import { createFileRoute } from "@tanstack/react-router";
import { Info } from "lucide-react";
import { useTranslation } from "react-i18next";
import { XDocLayout } from "@/components/docs/x-doc-layout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/docs/backup-restore")({
  component: BackupRestorePage,
});

function BackupRestorePage() {
  const { t } = useTranslation("xdocs");
  return (
    <XDocLayout
      title={t("backupRestore.title")}
      description={t("backupRestore.description")}
    >
      <Alert className="mb-8">
        <Info className="h-4 w-4" />
        <AlertTitle>{t("backupRestore.password.heading")}</AlertTitle>
        <AlertDescription>{t("backupRestore.password.text")}</AlertDescription>
      </Alert>
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">
          {t("backupRestore.contents.heading")}
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {(["database", "subscriptions", "certificates"] as const).map(
            (key) => (
              <Card key={key}>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">
                    {t(`backupRestore.contents.${key}Title`)}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t(`backupRestore.contents.${key}Text`)}
                  </p>
                </CardContent>
              </Card>
            ),
          )}
        </div>
      </section>
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">
          {t("backupRestore.steps.heading")}
        </h2>
        <ol className="space-y-3 text-muted-foreground list-decimal ml-5">
          <li>{t("backupRestore.steps.item1")}</li>
          <li>{t("backupRestore.steps.item2")}</li>
          <li>{t("backupRestore.steps.item3")}</li>
        </ol>
      </section>
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">PostgreSQL 备份</h2>
        <Alert className="mb-4">
          <Info className="h-4 w-4" />
          <AlertTitle>ZIP 备份仅适用于 SQLite</AlertTitle>
          <AlertDescription>
            主控切换到 PostgreSQL 后会拒绝生成不包含数据库的 ZIP。数据库使用
            pg_dump/pg_restore，data 与 subscribes 目录仍需单独备份。
          </AlertDescription>
        </Alert>
        <div className="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto">
          <pre>{`# Docker Compose 数据库备份
docker exec miaomiaowux-postgres pg_dump -U mmwx -Fc mmwx > mmwx.dump

# 恢复到空数据库
docker exec -i miaomiaowux-postgres pg_restore -U mmwx -d mmwx --clean --if-exists < mmwx.dump

# 同时备份运行目录
tar czf mmwx-files.tar.gz data subscribes rule_templates`}</pre>
        </div>
      </section>
      <section>
        <h2 className="text-2xl font-bold mb-4">
          {t("backupRestore.recovery.heading")}
        </h2>
        <p className="text-muted-foreground">
          {t("backupRestore.recovery.text")}
        </p>
      </section>
    </XDocLayout>
  );
}
