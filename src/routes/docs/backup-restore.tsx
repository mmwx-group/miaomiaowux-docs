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
