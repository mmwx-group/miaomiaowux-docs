import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { XDocLayout } from "@/components/docs/x-doc-layout";
import { Screenshot } from "@/components/docs/screenshot";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Info } from "lucide-react";
import { SystemSettingsDemo } from "@/components/docs/system-settings-demo";

export const Route = createFileRoute("/docs/system-settings")({
  component: SystemSettingsPage,
});

function SystemSettingsPage() {
  const { t } = useTranslation("xdocs");

  return (
    <XDocLayout
      title={t("systemSettings.title")}
      description={t("systemSettings.description")}
    >
      <Screenshot
        src="/images/screenshots/doc-system-settings-overview.webp"
        alt={t("systemSettings.screenshot.alt")}
        caption={t("systemSettings.screenshot.caption")}
      />

      {/* 系统设置 mock 演示 */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">
          {t("systemSettings.demo.heading")}
        </h2>
        <p className="text-muted-foreground mb-4">
          {t("systemSettings.demo.description")}
        </p>
        <SystemSettingsDemo />
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">
          {t("systemSettings.overview")}
        </h2>
        <p className="text-muted-foreground mb-4">
          {t("systemSettings.overviewText")}
        </p>
        <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <Info className="size-4 text-blue-500 mt-0.5 shrink-0" />
          <p className="text-sm text-blue-700 dark:text-blue-400">
            {t("systemSettings.adminOnly")}
          </p>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">
          {t("systemSettings.currentTabs.heading")}
        </h2>
        <p className="text-muted-foreground mb-4">
          {t("systemSettings.currentTabs.description")}
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">
                  {t("systemSettings.currentTabs.tabCol")}
                </th>
                <th className="text-left py-3 px-4">
                  {t("systemSettings.currentTabs.featuresCol")}
                </th>
                <th className="text-left py-3 px-4">
                  {t("systemSettings.currentTabs.effectCol")}
                </th>
              </tr>
            </thead>
            <tbody>
              {(
                [
                  "sub",
                  "features",
                  "push",
                  "security",
                  "probe",
                  "appearance",
                  "announce",
                  "tgbot",
                  "captcha",
                  "system",
                  "license",
                ] as const
              ).map((tab) => (
                <tr key={tab} className="border-b last:border-0">
                  <td className="py-3 px-4 font-medium whitespace-nowrap">
                    {t(`systemSettings.currentTabs.${tab}`)}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">
                    {t(`systemSettings.currentTabs.${tab}Desc`)}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                    {t(
                      tab === "system"
                        ? "systemSettings.currentTabs.mixedEffect"
                        : "systemSettings.currentTabs.hotEffect",
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 mt-4">
          <AlertTriangle className="size-4 text-amber-500 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-700 dark:text-amber-400">
            {t("systemSettings.currentTabs.restartWarning")}
          </p>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">
          {t("systemSettings.externalSubHeading")}
        </h2>
        <p className="text-muted-foreground mb-4">
          {t("systemSettings.externalSubText")}
        </p>

        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">
                {t("systemSettings.syncTrafficHeading")}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2 pr-4 font-medium w-28">
                        {t("systemSettings.typeLabel")}
                      </td>
                      <td className="py-2">{t("systemSettings.typeSwitch")}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 pr-4 font-medium">
                        {t("systemSettings.defaultLabel")}
                      </td>
                      <td className="py-2">{t("systemSettings.defaultOff")}</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 font-medium">
                        {t("systemSettings.descLabel")}
                      </td>
                      <td className="py-2">
                        {t("systemSettings.syncTrafficDesc")}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">
                {t("systemSettings.appendSubInfoHeading")}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2 pr-4 font-medium w-28">
                        {t("systemSettings.typeLabel")}
                      </td>
                      <td className="py-2">{t("systemSettings.typeSwitch")}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 pr-4 font-medium">
                        {t("systemSettings.defaultLabel")}
                      </td>
                      <td className="py-2">{t("systemSettings.defaultOff")}</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 font-medium">
                        {t("systemSettings.descLabel")}
                      </td>
                      <td className="py-2">
                        {t("systemSettings.appendSubInfoDesc")}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">
                {t("systemSettings.nodeFilterHeading")}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2 pr-4 font-medium w-28">
                        {t("systemSettings.typeLabel")}
                      </td>
                      <td className="py-2">{t("systemSettings.typeRegex")}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 pr-4 font-medium">
                        {t("systemSettings.defaultLabel")}
                      </td>
                      <td className="py-2">
                        <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                          {"剩余|流量|到期|订阅|时间|重置"}
                        </code>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 font-medium">
                        {t("systemSettings.descLabel")}
                      </td>
                      <td className="py-2">
                        {t("systemSettings.nodeFilterDesc")}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">
                {t("systemSettings.externalSyncHeading")}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2 pr-4 font-medium w-28">
                        {t("systemSettings.typeLabel")}
                      </td>
                      <td className="py-2">{t("systemSettings.typeSwitch")}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 pr-4 font-medium">
                        {t("systemSettings.defaultLabel")}
                      </td>
                      <td className="py-2">{t("systemSettings.defaultOff")}</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 font-medium">
                        {t("systemSettings.descLabel")}
                      </td>
                      <td className="py-2">
                        {t("systemSettings.externalSyncDesc")}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 mt-4">
                <AlertTriangle className="size-4 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  {t("systemSettings.externalSyncWarning")}
                </p>
              </div>

              <p className="text-sm text-muted-foreground mt-4 mb-3">
                {t("systemSettings.externalSyncSubConfig")}
              </p>
              <div className="space-y-4 bg-muted/30 rounded-lg p-4 border">
                <div>
                  <h4 className="text-sm font-medium mb-1">
                    {t("systemSettings.matchRuleHeading")}
                  </h4>
                  <p className="text-xs text-muted-foreground mb-2">
                    {t("systemSettings.matchRuleDesc")}
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 pr-4 font-medium">
                            {t("systemSettings.optionCol")}
                          </th>
                          <th className="text-left py-2 font-medium">
                            {t("systemSettings.descCol")}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="py-2 pr-4">
                            {t("systemSettings.matchByName")}
                          </td>
                          <td className="py-2">
                            {t("systemSettings.matchByNameDesc")}
                          </td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2 pr-4">
                            {t("systemSettings.matchByServerPort")}
                          </td>
                          <td className="py-2">
                            {t("systemSettings.matchByServerPortDesc")}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2 pr-4">
                            {t("systemSettings.matchByTypeServerPort")}
                          </td>
                          <td className="py-2">
                            {t("systemSettings.matchByTypeServerPortDesc")}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium mb-1">
                    {t("systemSettings.syncScopeHeading")}
                  </h4>
                  <p className="text-xs text-muted-foreground mb-2">
                    {t("systemSettings.syncScopeDesc")}
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 pr-4 font-medium">
                            {t("systemSettings.optionCol")}
                          </th>
                          <th className="text-left py-2 font-medium">
                            {t("systemSettings.descCol")}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="py-2 pr-4">
                            {t("systemSettings.syncSaved")}
                          </td>
                          <td className="py-2">
                            {t("systemSettings.syncSavedDesc")}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2 pr-4">
                            {t("systemSettings.syncAll")}
                          </td>
                          <td className="py-2">
                            {t("systemSettings.syncAllDesc")}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium mb-1">
                    {t("systemSettings.keepNameHeading")}
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <tbody>
                        <tr className="border-b">
                          <td className="py-2 pr-4 font-medium w-28">
                            {t("systemSettings.defaultLabel")}
                          </td>
                          <td className="py-2">
                            {t("systemSettings.defaultOn")}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2 pr-4 font-medium">
                            {t("systemSettings.descLabel")}
                          </td>
                          <td className="py-2">
                            {t("systemSettings.keepNameDesc")}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium mb-1">
                    {t("systemSettings.cacheTTLHeading")}
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <tbody>
                        <tr className="border-b">
                          <td className="py-2 pr-4 font-medium w-28">
                            {t("systemSettings.defaultLabel")}
                          </td>
                          <td className="py-2">
                            {t("systemSettings.cacheTTLDefault")}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2 pr-4 font-medium">
                            {t("systemSettings.descLabel")}
                          </td>
                          <td className="py-2">
                            {t("systemSettings.cacheTTLDesc")}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">
          {t("systemSettings.featureTogglesHeading")}
        </h2>
        <p className="text-muted-foreground mb-4">
          {t("systemSettings.featureTogglesText")}
        </p>

        <div className="space-y-6">
          <Card className="border-orange-200 dark:border-orange-900">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">
                {t("systemSettings.silentModeHeading")}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2 pr-4 font-medium w-28">
                        {t("systemSettings.typeLabel")}
                      </td>
                      <td className="py-2">{t("systemSettings.typeSwitch")}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 pr-4 font-medium">
                        {t("systemSettings.defaultLabel")}
                      </td>
                      <td className="py-2">{t("systemSettings.defaultOff")}</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 font-medium">
                        {t("systemSettings.descLabel")}
                      </td>
                      <td className="py-2">
                        {t("systemSettings.silentModeDesc")}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 mt-4">
                <AlertTriangle className="size-4 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  {t("systemSettings.silentModeWarning")}
                </p>
              </div>

              <div className="bg-muted/30 rounded-lg p-4 border mt-4">
                <h4 className="text-sm font-medium mb-1">
                  {t("systemSettings.recoveryDurationHeading")}
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2 pr-4 font-medium w-28">
                          {t("systemSettings.defaultLabel")}
                        </td>
                        <td className="py-2">
                          {t("systemSettings.recoveryDurationDefault")}
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 pr-4 font-medium">
                          {t("systemSettings.rangeLabel")}
                        </td>
                        <td className="py-2">
                          {t("systemSettings.recoveryDurationRange")}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4 font-medium">
                          {t("systemSettings.descLabel")}
                        </td>
                        <td className="py-2">
                          {t("systemSettings.recoveryDurationDesc")}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">
                {t("systemSettings.shortLinkHeading")}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2 pr-4 font-medium w-28">
                        {t("systemSettings.typeLabel")}
                      </td>
                      <td className="py-2">{t("systemSettings.typeSwitch")}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 pr-4 font-medium">
                        {t("systemSettings.defaultLabel")}
                      </td>
                      <td className="py-2">{t("systemSettings.defaultOff")}</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 font-medium">
                        {t("systemSettings.descLabel")}
                      </td>
                      <td className="py-2">
                        {t("systemSettings.shortLinkDesc")}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">
                {t("systemSettings.clientCompatHeading")}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2 pr-4 font-medium w-28">
                        {t("systemSettings.typeLabel")}
                      </td>
                      <td className="py-2">{t("systemSettings.typeSwitch")}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 pr-4 font-medium">
                        {t("systemSettings.defaultLabel")}
                      </td>
                      <td className="py-2">{t("systemSettings.defaultOff")}</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 font-medium">
                        {t("systemSettings.descLabel")}
                      </td>
                      <td className="py-2">
                        {t("systemSettings.clientCompatDesc")}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">
                {t("systemSettings.overrideScriptHeading")}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2 pr-4 font-medium w-28">
                        {t("systemSettings.typeLabel")}
                      </td>
                      <td className="py-2">{t("systemSettings.typeSwitch")}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 pr-4 font-medium">
                        {t("systemSettings.defaultLabel")}
                      </td>
                      <td className="py-2">{t("systemSettings.defaultOff")}</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 font-medium">
                        {t("systemSettings.descLabel")}
                      </td>
                      <td className="py-2">
                        {t("systemSettings.overrideScriptDesc")}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">
                {t("systemSettings.probeBindHeading")}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2 pr-4 font-medium w-28">
                        {t("systemSettings.typeLabel")}
                      </td>
                      <td className="py-2">{t("systemSettings.typeSwitch")}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 pr-4 font-medium">
                        {t("systemSettings.defaultLabel")}
                      </td>
                      <td className="py-2">{t("systemSettings.defaultOff")}</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 font-medium">
                        {t("systemSettings.descLabel")}
                      </td>
                      <td className="py-2">
                        {t("systemSettings.probeBindDesc")}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">
                {t("systemSettings.proxyProviderHeading")}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2 pr-4 font-medium w-28">
                        {t("systemSettings.typeLabel")}
                      </td>
                      <td className="py-2">{t("systemSettings.typeSwitch")}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 pr-4 font-medium">
                        {t("systemSettings.defaultLabel")}
                      </td>
                      <td className="py-2">{t("systemSettings.defaultOff")}</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 font-medium">
                        {t("systemSettings.descLabel")}
                      </td>
                      <td className="py-2">
                        {t("systemSettings.proxyProviderDesc")}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">
                {t("systemSettings.templateVersionHeading")}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2 pr-4 font-medium w-28">
                        {t("systemSettings.typeLabel")}
                      </td>
                      <td className="py-2">{t("systemSettings.typeRadio")}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 pr-4 font-medium">
                        {t("systemSettings.defaultLabel")}
                      </td>
                      <td className="py-2">
                        {t("systemSettings.templateVersionDefault")}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 font-medium">
                        {t("systemSettings.descLabel")}
                      </td>
                      <td className="py-2">
                        {t("systemSettings.templateVersionDesc")}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 pr-4 font-medium">
                        {t("systemSettings.versionCol")}
                      </th>
                      <th className="text-left py-2 pr-4 font-medium">
                        {t("systemSettings.nameCol")}
                      </th>
                      <th className="text-left py-2 font-medium">
                        {t("systemSettings.descCol")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2 pr-4">
                        <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                          v1
                        </code>
                      </td>
                      <td className="py-2 pr-4">
                        {t("systemSettings.v1Name")}
                      </td>
                      <td className="py-2">{t("systemSettings.v1Desc")}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 pr-4">
                        <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                          v2
                        </code>
                      </td>
                      <td className="py-2 pr-4">
                        {t("systemSettings.v2Name")}
                      </td>
                      <td className="py-2">{t("systemSettings.v2Desc")}</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4">
                        <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                          v3
                        </code>
                      </td>
                      <td className="py-2 pr-4">
                        {t("systemSettings.v3Name")}
                      </td>
                      <td className="py-2">{t("systemSettings.v3Desc")}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">
                {t("systemSettings.subResponseHeaderHeading")}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2 pr-4 font-medium w-28">
                        {t("systemSettings.typeLabel")}
                      </td>
                      <td className="py-2">{t("systemSettings.typeSwitch")}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 pr-4 font-medium">
                        {t("systemSettings.defaultLabel")}
                      </td>
                      <td className="py-2">{t("systemSettings.defaultOn")}</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 font-medium">
                        {t("systemSettings.descLabel")}
                      </td>
                      <td className="py-2">
                        {t("systemSettings.subResponseHeaderDesc")}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">
                {t("systemSettings.subSerializationHeading")}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2 pr-4 font-medium w-28">
                        {t("systemSettings.typeLabel")}
                      </td>
                      <td className="py-2">{t("systemSettings.typeRadio")}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 pr-4 font-medium">
                        {t("systemSettings.defaultLabel")}
                      </td>
                      <td className="py-2">YAML</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 pr-4 font-medium">
                        {t("systemSettings.optionsLabel")}
                      </td>
                      <td className="py-2">
                        <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                          YAML
                        </code>{" "}
                        /{" "}
                        <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                          JSON
                        </code>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 font-medium">
                        {t("systemSettings.descLabel")}
                      </td>
                      <td className="py-2">
                        {t("systemSettings.subSerializationDesc")}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">
                {t("systemSettings.subInfoNodeHeading")}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2 pr-4 font-medium w-28">
                        {t("systemSettings.typeLabel")}
                      </td>
                      <td className="py-2">{t("systemSettings.typeSwitch")}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 pr-4 font-medium">
                        {t("systemSettings.defaultLabel")}
                      </td>
                      <td className="py-2">{t("systemSettings.defaultOff")}</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 font-medium">
                        {t("systemSettings.descLabel")}
                      </td>
                      <td className="py-2">
                        {t("systemSettings.subInfoNodeDesc")}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="text-sm text-muted-foreground mt-4 mb-3">
                {t("systemSettings.subInfoNodeCustomize")}
              </p>
              <div className="bg-muted/30 rounded-lg p-4 border space-y-3">
                <div>
                  <h4 className="text-sm font-medium mb-1">
                    {t("systemSettings.expiryPrefixHeading")}
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <tbody>
                        <tr className="border-b">
                          <td className="py-2 pr-4 font-medium w-28">
                            {t("systemSettings.defaultLabel")}
                          </td>
                          <td className="py-2">
                            {t("systemSettings.expiryPrefixDefault")}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2 pr-4 font-medium">
                            {t("systemSettings.exampleLabel")}
                          </td>
                          <td className="py-2">
                            <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                              {t("systemSettings.expiryPrefixExample")}
                            </code>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="border-t pt-3">
                  <h4 className="text-sm font-medium mb-1">
                    {t("systemSettings.trafficPrefixHeading")}
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <tbody>
                        <tr className="border-b">
                          <td className="py-2 pr-4 font-medium w-28">
                            {t("systemSettings.defaultLabel")}
                          </td>
                          <td className="py-2">
                            {t("systemSettings.trafficPrefixDefault")}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2 pr-4 font-medium">
                            {t("systemSettings.exampleLabel")}
                          </td>
                          <td className="py-2">
                            <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                              {t("systemSettings.trafficPrefixExample")}
                            </code>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">
          {t("systemSettings.notificationHeading")}
        </h2>
        <p className="text-muted-foreground mb-4">
          {t("systemSettings.notificationText")}
        </p>

        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">
                {t("systemSettings.enableNotificationHeading")}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2 pr-4 font-medium w-28">
                        {t("systemSettings.typeLabel")}
                      </td>
                      <td className="py-2">{t("systemSettings.typeSwitch")}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 pr-4 font-medium">
                        {t("systemSettings.defaultLabel")}
                      </td>
                      <td className="py-2">{t("systemSettings.defaultOff")}</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 font-medium">
                        {t("systemSettings.descLabel")}
                      </td>
                      <td className="py-2">
                        {t("systemSettings.enableNotificationDesc")}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">
                {t("systemSettings.tgBotConfigHeading")}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t("systemSettings.tgBotConfigText")}
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 pr-4 font-medium">
                        {t("systemSettings.configItemCol")}
                      </th>
                      <th className="text-left py-2 pr-4 font-medium">
                        {t("systemSettings.formatCol")}
                      </th>
                      <th className="text-left py-2 font-medium">
                        {t("systemSettings.descCol")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2 pr-4">Bot Token</td>
                      <td className="py-2 pr-4">
                        <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                          123456:ABC-DEF...
                        </code>
                      </td>
                      <td className="py-2">
                        {t("systemSettings.botTokenDesc")}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4">Chat ID</td>
                      <td className="py-2 pr-4">
                        <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                          -1001234567890
                        </code>
                      </td>
                      <td className="py-2">{t("systemSettings.chatIdDesc")}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 mt-4">
                <Info className="size-4 text-blue-500 mt-0.5 shrink-0" />
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  {t("systemSettings.testNotificationNote")}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">
                {t("systemSettings.notifyEventsHeading")}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t("systemSettings.notifyEventsText")}
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 pr-4 font-medium">
                        {t("systemSettings.eventCol")}
                      </th>
                      <th className="text-left py-2 pr-4 font-medium">
                        {t("systemSettings.defaultLabel")}
                      </th>
                      <th className="text-left py-2 font-medium">
                        {t("systemSettings.descCol")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2 pr-4">
                        {t("systemSettings.eventSubFetch")}
                      </td>
                      <td className="py-2 pr-4">
                        {t("systemSettings.defaultOn")}
                      </td>
                      <td className="py-2">
                        {t("systemSettings.eventSubFetchDesc")}
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 pr-4">
                        {t("systemSettings.eventLogin")}
                      </td>
                      <td className="py-2 pr-4">
                        {t("systemSettings.defaultOn")}
                      </td>
                      <td className="py-2">
                        {t("systemSettings.eventLoginDesc")}
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 pr-4">
                        {t("systemSettings.eventIpBan")}
                      </td>
                      <td className="py-2 pr-4">
                        {t("systemSettings.defaultOn")}
                      </td>
                      <td className="py-2">
                        {t("systemSettings.eventIpBanDesc")}
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 pr-4">
                        {t("systemSettings.eventSilentMode")}
                      </td>
                      <td className="py-2 pr-4">
                        {t("systemSettings.defaultOn")}
                      </td>
                      <td className="py-2">
                        {t("systemSettings.eventSilentModeDesc")}
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 pr-4">
                        {t("systemSettings.eventSubExpiry")}
                      </td>
                      <td className="py-2 pr-4">
                        {t("systemSettings.defaultOn")}
                      </td>
                      <td className="py-2">
                        {t("systemSettings.eventSubExpiryDesc")}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4">
                        {t("systemSettings.eventDailyTraffic")}
                      </td>
                      <td className="py-2 pr-4">
                        {t("systemSettings.defaultOff")}
                      </td>
                      <td className="py-2">
                        {t("systemSettings.eventDailyTrafficDesc")}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">
          {t("systemSettings.proxyGroupSyncHeading")}
        </h2>
        <Card>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 pr-4 font-medium w-28">
                      {t("systemSettings.descLabel")}
                    </td>
                    <td className="py-2">
                      {t("systemSettings.proxyGroupSyncDesc")}
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4 font-medium">
                      {t("systemSettings.remoteConfigAddrLabel")}
                    </td>
                    <td className="py-2">
                      {t("systemSettings.remoteConfigAddrDesc")}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-medium">
                      {t("systemSettings.operationLabel")}
                    </td>
                    <td className="py-2">
                      {t("systemSettings.proxyGroupSyncOp")}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">
          {t("systemSettings.masterConfigHeading")}
        </h2>
        <p className="text-muted-foreground mb-4">
          {t("systemSettings.masterConfigText")}
        </p>
        <Card>
          <CardContent className="pt-6">
            <div className="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <pre>{`# config.yaml
port: 12889
database_path: data/traffic.db
jwt_secret: your-secret-key
log_level: info
allowed_origins: "*"`}</pre>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              {t("systemSettings.masterConfigNote")}
            </p>
          </CardContent>
        </Card>

        <div className="overflow-x-auto mt-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">
                  {t("systemSettings.configCol")}
                </th>
                <th className="text-left py-3 px-4">
                  {t("systemSettings.descCol")}
                </th>
                <th className="text-left py-3 px-4">
                  {t("systemSettings.defaultCol")}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-3 px-4 font-mono text-xs">port</td>
                <td className="py-3 px-4">{t("systemSettings.masterPort")}</td>
                <td className="py-3 px-4">12889</td>
              </tr>
              <tr className="border-b">
                <td className="py-3 px-4 font-mono text-xs">database_path</td>
                <td className="py-3 px-4">
                  {t("systemSettings.masterDbPath")}
                </td>
                <td className="py-3 px-4">data/traffic.db</td>
              </tr>
              <tr className="border-b">
                <td className="py-3 px-4 font-mono text-xs">jwt_secret</td>
                <td className="py-3 px-4">
                  {t("systemSettings.masterJwtSecret")}
                </td>
                <td className="py-3 px-4">-</td>
              </tr>
              <tr className="border-b">
                <td className="py-3 px-4 font-mono text-xs">log_level</td>
                <td className="py-3 px-4">
                  {t("systemSettings.masterLogLevel")}
                </td>
                <td className="py-3 px-4">info</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-mono text-xs">allowed_origins</td>
                <td className="py-3 px-4">
                  {t("systemSettings.masterAllowedOrigins")}
                </td>
                <td className="py-3 px-4">*</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">
          {t("systemSettings.masterEnvHeading")}
        </h2>
        <p className="text-muted-foreground mb-4">
          {t("systemSettings.masterEnvText")}
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">
                  {t("systemSettings.variableCol")}
                </th>
                <th className="text-left py-3 px-4">
                  {t("systemSettings.descCol")}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-3 px-4 font-mono text-xs">PORT</td>
                <td className="py-3 px-4">{t("systemSettings.envPort")}</td>
              </tr>
              <tr className="border-b">
                <td className="py-3 px-4 font-mono text-xs">JWT_SECRET</td>
                <td className="py-3 px-4">
                  {t("systemSettings.envJwtSecret")}
                </td>
              </tr>
              <tr className="border-b">
                <td className="py-3 px-4 font-mono text-xs">LOG_LEVEL</td>
                <td className="py-3 px-4">{t("systemSettings.envLogLevel")}</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-mono text-xs">ALLOWED_ORIGINS</td>
                <td className="py-3 px-4">
                  {t("systemSettings.envAllowedOrigins")}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">
          {t("systemSettings.agentConfigHeading")}
        </h2>
        <p className="text-muted-foreground mb-4">
          {t("systemSettings.agentConfigText")}
        </p>
        <Card>
          <CardContent className="pt-6">
            <div className="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <pre>{`# config.yaml (Agent 端)
master_url: "https://your-master-domain.com"
token: "your-server-token"
listen_port: "23889"
connection_mode: "auto"
traffic_report_interval: "1m"
speed_report_interval: "3s"
restart_method: "auto"
restart_command: ""`}</pre>
            </div>
          </CardContent>
        </Card>

        <div className="overflow-x-auto mt-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">
                  {t("systemSettings.configCol")}
                </th>
                <th className="text-left py-3 px-4">
                  {t("systemSettings.descCol")}
                </th>
                <th className="text-left py-3 px-4">
                  {t("systemSettings.defaultCol")}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-3 px-4 font-mono text-xs">master_url</td>
                <td className="py-3 px-4">
                  {t("systemSettings.agentMasterUrl")}
                </td>
                <td className="py-3 px-4">-</td>
              </tr>
              <tr className="border-b">
                <td className="py-3 px-4 font-mono text-xs">token</td>
                <td className="py-3 px-4">{t("systemSettings.agentToken")}</td>
                <td className="py-3 px-4">-</td>
              </tr>
              <tr className="border-b">
                <td className="py-3 px-4 font-mono text-xs">listen_port</td>
                <td className="py-3 px-4">
                  {t("systemSettings.agentListenPort")}
                </td>
                <td className="py-3 px-4">23889</td>
              </tr>
              <tr className="border-b">
                <td className="py-3 px-4 font-mono text-xs">connection_mode</td>
                <td className="py-3 px-4">
                  {t("systemSettings.agentConnectionMode")}
                </td>
                <td className="py-3 px-4">auto</td>
              </tr>
              <tr className="border-b">
                <td className="py-3 px-4 font-mono text-xs">
                  traffic_report_interval
                </td>
                <td className="py-3 px-4">
                  {t("systemSettings.agentTrafficInterval")}
                </td>
                <td className="py-3 px-4">1m</td>
              </tr>
              <tr className="border-b">
                <td className="py-3 px-4 font-mono text-xs">
                  speed_report_interval
                </td>
                <td className="py-3 px-4">
                  {t("systemSettings.agentSpeedInterval")}
                </td>
                <td className="py-3 px-4">3s</td>
              </tr>
              <tr className="border-b">
                <td className="py-3 px-4 font-mono text-xs">restart_method</td>
                <td className="py-3 px-4">
                  {t("systemSettings.agentRestartMethod")}
                </td>
                <td className="py-3 px-4">auto</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-mono text-xs">restart_command</td>
                <td className="py-3 px-4">
                  {t("systemSettings.agentRestartCommand")}
                </td>
                <td className="py-3 px-4">-</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">
          {t("systemSettings.connectionModeHeading")}
        </h2>
        <p className="text-muted-foreground mb-4">
          {t("systemSettings.connectionModeText")}
        </p>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="bg-muted/30 rounded-lg p-4 border-l-4 border-blue-500">
                <h4 className="font-semibold text-sm mb-2">
                  {t("systemSettings.modeAutoHeading")}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {t("systemSettings.modeAutoDesc")}
                </p>
              </div>
              <div className="bg-muted/30 rounded-lg p-4 border-l-4 border-green-500">
                <h4 className="font-semibold text-sm mb-2">websocket</h4>
                <p className="text-xs text-muted-foreground">
                  {t("systemSettings.modeWsDesc")}
                </p>
              </div>
              <div className="bg-muted/30 rounded-lg p-4 border-l-4 border-orange-500">
                <h4 className="font-semibold text-sm mb-2">http</h4>
                <p className="text-xs text-muted-foreground">
                  {t("systemSettings.modeHttpDesc")}
                </p>
              </div>
              <div className="bg-muted/30 rounded-lg p-4 border-l-4 border-purple-500">
                <h4 className="font-semibold text-sm mb-2">pull</h4>
                <p className="text-xs text-muted-foreground">
                  {t("systemSettings.modePullDesc")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">
          {t("systemSettings.agentEnvHeading")}
        </h2>
        <p className="text-muted-foreground mb-4">
          {t("systemSettings.agentEnvText")}
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">
                  {t("systemSettings.variableCol")}
                </th>
                <th className="text-left py-3 px-4">
                  {t("systemSettings.descCol")}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-3 px-4 font-mono text-xs">MMWX_MASTER_URL</td>
                <td className="py-3 px-4">
                  {t("systemSettings.agentEnvMasterUrl")}
                </td>
              </tr>
              <tr className="border-b">
                <td className="py-3 px-4 font-mono text-xs">MMWX_TOKEN</td>
                <td className="py-3 px-4">
                  {t("systemSettings.agentEnvToken")}
                </td>
              </tr>
              <tr className="border-b">
                <td className="py-3 px-4 font-mono text-xs">
                  MMWX_CONNECTION_MODE
                </td>
                <td className="py-3 px-4">
                  {t("systemSettings.agentEnvConnectionMode")}
                </td>
              </tr>
              <tr className="border-b">
                <td className="py-3 px-4 font-mono text-xs">
                  MMWX_LISTEN_PORT
                </td>
                <td className="py-3 px-4">
                  {t("systemSettings.agentEnvListenPort")}
                </td>
              </tr>
              <tr className="border-b">
                <td className="py-3 px-4 font-mono text-xs">
                  MMWX_XRAY_CONFIG
                </td>
                <td className="py-3 px-4">
                  {t("systemSettings.agentEnvXrayConfig")}
                </td>
              </tr>
              <tr className="border-b">
                <td className="py-3 px-4 font-mono text-xs">
                  MMWX_XRAY_CONFDIR
                </td>
                <td className="py-3 px-4">
                  {t("systemSettings.agentEnvXrayConfdir")}
                </td>
              </tr>
              <tr className="border-b">
                <td className="py-3 px-4 font-mono text-xs">
                  MMWX_TRAFFIC_INTERVAL
                </td>
                <td className="py-3 px-4">
                  {t("systemSettings.agentEnvTrafficInterval")}
                </td>
              </tr>
              <tr className="border-b">
                <td className="py-3 px-4 font-mono text-xs">
                  MMWX_SPEED_INTERVAL
                </td>
                <td className="py-3 px-4">
                  {t("systemSettings.agentEnvSpeedInterval")}
                </td>
              </tr>
              <tr className="border-b">
                <td className="py-3 px-4 font-mono text-xs">
                  MMWX_RESTART_METHOD
                </td>
                <td className="py-3 px-4">
                  {t("systemSettings.agentEnvRestartMethod")}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-mono text-xs">
                  MMWX_RESTART_COMMAND
                </td>
                <td className="py-3 px-4">
                  {t("systemSettings.agentEnvRestartCommand")}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </XDocLayout>
  );
}
