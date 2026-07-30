import { Link, createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Info } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Screenshot } from "@/components/docs/screenshot";
import { XDocLayout } from "@/components/docs/x-doc-layout";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/docs/tool-mmwx-tgbot")({
  component: ToolMmwxTgbotPage,
});

function ToolMmwxTgbotPage() {
  const { t } = useTranslation("xdocs");

  return (
    <XDocLayout
      title={t("toolMmwxTgbot.title")}
      description={t("toolMmwxTgbot.description")}
    >
      <section className="mb-10">
        <div className="flex items-start gap-2 rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
          <Info className="mt-0.5 size-5 shrink-0 text-blue-500" />
          <div>
            <h2 className="font-semibold text-blue-700 dark:text-blue-400">
              {t("toolMmwxTgbot.integrated.heading")}
            </h2>
            <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
              {t("toolMmwxTgbot.integrated.text")}
            </p>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">
          {t("toolMmwxTgbot.setup.heading")}
        </h2>
        <div className="space-y-4">
          {(
            [
              "createBot",
              "openSettings",
              "token",
              "adminIds",
              "enable",
              "verify",
            ] as const
          ).map((step, index) => (
            <Card key={step}>
              <CardContent className="pt-6">
                <h3 className="mb-2 font-semibold">
                  {index + 1}. {t(`toolMmwxTgbot.setup.${step}Heading`)}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t(`toolMmwxTgbot.setup.${step}Text`)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          <Link
            to="/docs/system-settings"
            className="text-primary hover:underline"
          >
            {t("toolMmwxTgbot.setup.systemSettingsLink")}
          </Link>
        </p>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">
          {t("toolMmwxTgbot.features.heading")}
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <h3 className="mb-3 font-semibold">
                {t("toolMmwxTgbot.features.userHeading")}
              </h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>
                  <code>/start &lt;code&gt;</code> —{" "}
                  {t("toolMmwxTgbot.features.userStart")}
                </li>
                <li>
                  <code>/me</code> — {t("toolMmwxTgbot.features.userMe")}
                </li>
                <li>
                  <code>/sub</code> — {t("toolMmwxTgbot.features.userSub")}
                </li>
                <li>
                  <code>/traffic</code> —{" "}
                  {t("toolMmwxTgbot.features.userTraffic")}
                </li>
                <li>
                  <code>/nodes</code> — {t("toolMmwxTgbot.features.userNodes")}
                </li>
                <li>
                  <code>/notify</code> —{" "}
                  {t("toolMmwxTgbot.features.userNotify")}
                </li>
                <li>
                  <code>/unbind</code> —{" "}
                  {t("toolMmwxTgbot.features.userUnbind")}
                </li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <h3 className="mb-3 font-semibold">
                {t("toolMmwxTgbot.features.adminHeading")}
              </h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>
                  <code>/admin_invite list</code> —{" "}
                  {t("toolMmwxTgbot.features.adminList")}
                </li>
                <li>
                  <code>/admin_invite create</code> —{" "}
                  {t("toolMmwxTgbot.features.adminCreate")}
                </li>
                <li>
                  <code>/admin_invite revoke</code> —{" "}
                  {t("toolMmwxTgbot.features.adminRevoke")}
                </li>
                <li>
                  <code>/admin_user &lt;username&gt;</code> —{" "}
                  {t("toolMmwxTgbot.features.adminUser")}
                </li>
              </ul>
              <p className="mt-3 text-xs text-muted-foreground">
                {t("toolMmwxTgbot.features.adminNote")}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <h3 className="mb-3 font-semibold">
                {t("toolMmwxTgbot.features.notifyHeading")}
              </h3>
              <p className="mb-2 text-sm text-muted-foreground">
                {t("toolMmwxTgbot.features.notifyText")}
              </p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>📊 {t("toolMmwxTgbot.features.notifyTraffic")}</li>
                <li>⏰ {t("toolMmwxTgbot.features.notifyExpire")}</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">
          {t("toolMmwxTgbot.miniapp.heading")}
        </h2>
        <p className="mb-4 text-muted-foreground">
          {t("toolMmwxTgbot.integrated.miniappText")}
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <h3 className="mb-2 text-sm font-medium">
              {t("toolMmwxTgbot.screenshots.miniappAdminHeading")}
            </h3>
            <Screenshot
              src="/images/screenshots/tutorial-step12-miniapp-admin.webp"
              alt={t("toolMmwxTgbot.screenshots.miniappAdminAlt")}
              caption={t("toolMmwxTgbot.screenshots.miniappAdmin")}
            />
          </div>
          <div>
            <h3 className="mb-2 text-sm font-medium">
              {t("toolMmwxTgbot.screenshots.miniappUserHeading")}
            </h3>
            <Screenshot
              src="/images/screenshots/tutorial-step12-miniapp-user.webp"
              alt={t("toolMmwxTgbot.screenshots.miniappUserAlt")}
              caption={t("toolMmwxTgbot.screenshots.miniappUser")}
            />
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">
          {t("toolMmwxTgbot.security.heading")}
        </h2>
        <div className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-500" />
          <p className="text-sm text-amber-700 dark:text-amber-400">
            {t("toolMmwxTgbot.security.text")}
          </p>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-bold">
          {t("toolMmwxTgbot.faq.heading")}
        </h2>
        <div className="space-y-3">
          {(["q1", "q2", "q3"] as const).map((item) => (
            <Card key={item}>
              <CardContent className="pt-5">
                <h3 className="mb-2 font-semibold">
                  {t(`toolMmwxTgbot.integratedFaq.${item}`)}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t(`toolMmwxTgbot.integratedFaq.${item.replace("q", "a")}`)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </XDocLayout>
  );
}
