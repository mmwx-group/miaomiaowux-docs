import { createFileRoute } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
import { useTranslation } from "react-i18next";
import { XDocLayout } from "@/components/docs/x-doc-layout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/docs/website-management")({
  component: WebsiteManagementPage,
});

function WebsiteManagementPage() {
  const { t } = useTranslation("xdocs");

  return (
    <XDocLayout
      title={t("websiteManagement.title")}
      description={t("websiteManagement.description")}
    >
      <img
        src="/images/screenshots/doc-xray-servers-page.webp"
        alt={t("websiteManagement.screenshotAlt")}
        className="mb-8 rounded-xl border shadow-sm"
      />
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">
          {t("websiteManagement.open.heading")}
        </h2>
        <p className="text-muted-foreground">
          {t("websiteManagement.open.text")}
        </p>
      </section>
      <section className="mb-10 grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2">
              {t("websiteManagement.types.staticTitle")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("websiteManagement.types.staticText")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2">
              {t("websiteManagement.types.proxyTitle")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("websiteManagement.types.proxyText")}
            </p>
          </CardContent>
        </Card>
      </section>
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">
          {t("websiteManagement.environment.heading")}
        </h2>
        <p className="text-muted-foreground mb-4">
          {t("websiteManagement.environment.text")}
        </p>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• {t("websiteManagement.environment.item1")}</li>
          <li>• {t("websiteManagement.environment.item2")}</li>
          <li>• {t("websiteManagement.environment.item3")}</li>
        </ul>
      </section>
      <Alert>
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle>{t("websiteManagement.safety.heading")}</AlertTitle>
        <AlertDescription>
          {t("websiteManagement.safety.text")}
        </AlertDescription>
      </Alert>
    </XDocLayout>
  );
}
