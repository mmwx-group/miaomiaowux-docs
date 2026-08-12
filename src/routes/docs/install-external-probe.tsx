import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Screenshot } from "@/components/docs/screenshot";
import { XDocLayout } from "@/components/docs/x-doc-layout";

export const Route = createFileRoute("/docs/install-external-probe")({
  component: InstallExternalProbePage,
});

const deployUrl =
  "https://deploy.workers.cloudflare.com/?url=https://github.com/mmwx-group/mmwx-probe";

const copy = {
  zh: {
    title: "外置探针部署",
    description: "使用 Cloudflare Workers 部署独立的妙妙屋X服务器探针。",
    introTitle: "部署方式",
    intro:
      "外置探针将静态页面、只读 API 代理和 WebSocket 代理部署到同一个 Cloudflare Worker。访客只访问探针域名，主控访问密钥由 Worker Secret 保管，不会暴露在浏览器中。",
    prepareTitle: "部署前准备",
    prepare: [
      "主控必须具有可由 Cloudflare 访问的公网 HTTPS 地址。",
      "在主控的“系统设置 → 探针”中启用外置探针，并选择需要展示的服务器与指标。",
      "开启“保护探针数据接口”，生成并立即保存独立探针访问密钥。密钥明文只显示一次。",
      "准备一个 Cloudflare 账户，并授权其访问你的 GitHub 账户。",
    ],
    step1Title: "1. 打开一键部署页面",
    step1:
      "打开 MMWX Probe 仓库，点击 Deploy to Cloudflare。Cloudflare 会引导你连接 GitHub，并创建一个用于持续部署的专用仓库。",
    deploy: "Deploy to Cloudflare",
    shot1: "在 MMWX Probe 项目说明顶部点击 Deploy to Cloudflare。",
    step2Title: "2. 配置 Cloudflare 项目",
    step2:
      "选择 Git 账户并保持“创建专用 Git 存储库”开启。项目名称可使用 mmwx-probe-xxxx；确认构建命令为 npm run build、部署命令为 npm run deploy，并保持生产分支自动构建。",
    varsTitle: "必须填写的变量",
    origin:
      "妙妙屋X主控的公网 HTTPS 地址，例如 https://panel.example.com。不要填写路径，也不要保留末尾斜杠。",
    token:
      "主控“系统设置 → 探针”生成的独立探针访问密钥。请作为 Secret 保存，禁止写入源码或公开仓库。",
    shot2: "填写项目名称、MMWX_ORIGIN 与 PROBE_TOKEN 后点击“部署”。",
    step3Title: "3. 验证并绑定域名",
    step3: [
      "等待首次构建完成，打开 Cloudflare 提供的 workers.dev 地址。",
      "确认服务器列表、趋势图和实时更新均能正常加载。",
      "如需自定义域名，在 Worker 的 Settings → Domains & Routes 中添加域名。",
      "更新主控地址或轮换密钥后，请同步修改 Worker Variables and Secrets 并重新部署。",
    ],
    updateTitle: "4. 启用 fork 自动更新",
    updateIntro:
      "部署仓库是 MMWX Probe 的 fork。首次启用自动更新前，先确认 fork 已包含最新的 Sync upstream 工作流；之后它会每天北京时间 11:23 合并上游更新，推送成功后 Cloudflare 会自动重新构建。",
    updateSteps: [
      "打开自己 GitHub 账户下的 mmwx-probe 仓库。如果页面提示分支落后，点击 Sync fork → Update branch。不要点击 Discard commits，否则会丢弃 fork 中已有的自定义提交。",
      "进入 Actions 页面。如果 GitHub 提示 fork 工作流尚未启用，点击 I understand my workflows, go ahead and enable them。",
      "在左侧选择 Sync upstream，然后点击 Run workflow，可立即执行一次同步。页面出现绿色成功标记即表示更新已推送。",
      "进入 Settings → Actions → General，在 Workflow permissions 中选择 Read and write permissions 并保存，确保工作流可以把更新推回 main 分支。",
    ],
    shot3:
      "fork 落后时点击 Sync fork → Update branch；不要选择 Discard commits。",
    shot4:
      "Actions 页面左侧会显示 Sync upstream；运行成功后会出现绿色状态标记。",
    updateWarning:
      "GitHub 默认关闭公共 fork 的定时工作流，并可能在仓库连续 60 天无活动后再次停用。如果探针长期没有自动更新，请回到 Actions 页面重新启用，或手动运行 Sync upstream。发生合并冲突时工作流会停止，不会强制覆盖用户修改。",
    troubleshootTitle: "常见问题",
    troubleshoot:
      "返回 404 通常表示外置探针未启用、未选择服务器或 PROBE_TOKEN 不一致；出现 MMWX_ORIGIN must use HTTPS 时，请检查主控地址是否为公网 HTTPS 地址。",
  },
  en: {
    title: "Standalone probe deployment",
    description:
      "Deploy the standalone MiaoMiaoWuX server probe on Cloudflare Workers.",
    introTitle: "Deployment model",
    intro:
      "The standalone probe hosts its static UI, read-only API proxy, and WebSocket proxy in one Cloudflare Worker. Visitors only access the probe hostname, while the master access token stays in a Worker Secret.",
    prepareTitle: "Before you begin",
    prepare: [
      "The master must have a public HTTPS address reachable by Cloudflare.",
      "Enable the standalone probe under System Settings → Probe and select the servers and metrics to expose.",
      "Enable probe API protection, generate the standalone token, and save it immediately. It is displayed only once.",
      "Prepare a Cloudflare account and authorize access to your GitHub account.",
    ],
    step1Title: "1. Open one-click deployment",
    step1:
      "Open the MMWX Probe repository and click Deploy to Cloudflare. Cloudflare guides you through GitHub authorization and creates a dedicated repository for continuous deployment.",
    deploy: "Deploy to Cloudflare",
    shot1: "Click Deploy to Cloudflare at the top of the MMWX Probe README.",
    step2Title: "2. Configure the Cloudflare project",
    step2:
      "Select your Git account and keep dedicated repository creation enabled. Use a name such as mmwx-probe-xxxx, set the build command to npm run build and deploy command to npm run deploy, and keep production-branch builds enabled.",
    varsTitle: "Required variables",
    origin:
      "Public HTTPS URL of the MiaoMiaoWuX master, such as https://panel.example.com. Do not include a path or trailing slash.",
    token:
      "Standalone probe token generated under System Settings → Probe. Store it as a Secret and never commit it to source control.",
    shot2:
      "Enter the project name, MMWX_ORIGIN, and PROBE_TOKEN, then click Deploy.",
    step3Title: "3. Verify and bind a domain",
    step3: [
      "Wait for the initial build and open the workers.dev URL provided by Cloudflare.",
      "Confirm that server cards, charts, and real-time updates load correctly.",
      "To use a custom hostname, add it under Worker Settings → Domains & Routes.",
      "After changing the master URL or rotating the token, update Worker Variables and Secrets and redeploy.",
    ],
    updateTitle: "4. Enable automatic fork updates",
    updateIntro:
      "The deployment repository is a fork of MMWX Probe. First make sure the fork contains the latest Sync upstream workflow. It then merges upstream changes every day at 11:23 China Standard Time; a successful push triggers a new Cloudflare build.",
    updateSteps: [
      "Open the mmwx-probe repository under your GitHub account. If the branch is behind, select Sync fork → Update branch. Do not select Discard commits, because it removes custom commits from your fork.",
      "Open Actions. If GitHub says workflows are disabled for this fork, select I understand my workflows, go ahead and enable them.",
      "Select Sync upstream in the sidebar and choose Run workflow to synchronize immediately. A green status icon means the update was pushed successfully.",
      "Open Settings → Actions → General, select Read and write permissions under Workflow permissions, and save so the workflow can update main.",
    ],
    shot3:
      "When the fork is behind, choose Sync fork → Update branch. Do not discard commits.",
    shot4:
      "Sync upstream appears in the Actions sidebar; a green status icon confirms a successful run.",
    updateWarning:
      "GitHub disables scheduled workflows in public forks by default and may disable them again after 60 days without repository activity. Re-enable the workflow or run Sync upstream manually if automatic updates stop. Merge conflicts stop the workflow without overwriting user changes.",
    troubleshootTitle: "Troubleshooting",
    troubleshoot:
      "A 404 normally means the standalone probe is disabled, no servers are selected, or PROBE_TOKEN does not match. MMWX_ORIGIN must use HTTPS means the master URL is not public HTTPS.",
  },
} as const;

function InstallExternalProbePage() {
  const { i18n } = useTranslation();
  const lang = i18n.language.startsWith("zh") ? "zh" : "en";
  const t = copy[lang];

  return (
    <XDocLayout title={t.title} description={t.description}>
      <section className="mb-10">
        <h2 className="mb-3 text-2xl font-bold">{t.introTitle}</h2>
        <p className="text-muted-foreground">{t.intro}</p>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">{t.prepareTitle}</h2>
        <ol className="list-decimal space-y-2 pl-6 text-muted-foreground">
          {t.prepare.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      </section>

      <section className="mb-10">
        <h2 className="mb-3 text-2xl font-bold">{t.step1Title}</h2>
        <p className="mb-4 text-muted-foreground">{t.step1}</p>
        <a
          href={deployUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-4 inline-flex items-center gap-2 rounded-md bg-[#f48120] px-5 py-3 font-semibold text-black transition-opacity hover:opacity-90"
        >
          {t.deploy}
          <ExternalLink className="size-4" />
        </a>
        <Screenshot
          src="/images/screenshots/external-probe-deploy-button.svg"
          alt={t.shot1}
          caption={t.shot1}
        />
      </section>

      <section className="mb-10">
        <h2 className="mb-3 text-2xl font-bold">{t.step2Title}</h2>
        <p className="mb-5 text-muted-foreground">{t.step2}</p>
        <div className="mb-5 overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[620px] text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left">{t.varsTitle}</th>
                <th className="px-4 py-3 text-left">
                  {lang === "zh" ? "说明" : "Description"}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="px-4 py-3 font-mono">MMWX_ORIGIN</td>
                <td className="px-4 py-3 text-muted-foreground">{t.origin}</td>
              </tr>
              <tr className="border-t">
                <td className="px-4 py-3 font-mono">PROBE_TOKEN</td>
                <td className="px-4 py-3 text-muted-foreground">{t.token}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <Screenshot
          src="/images/screenshots/external-probe-cloudflare-settings.svg"
          alt={t.shot2}
          caption={t.shot2}
        />
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">{t.step3Title}</h2>
        <ol className="list-decimal space-y-2 pl-6 text-muted-foreground">
          {t.step3.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      </section>

      <section className="mb-10">
        <h2 className="mb-3 text-2xl font-bold">{t.updateTitle}</h2>
        <p className="mb-5 text-muted-foreground">{t.updateIntro}</p>
        <ol className="mb-6 list-decimal space-y-3 pl-6 text-muted-foreground">
          {t.updateSteps.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
        <div className="space-y-6">
          <Screenshot
            src="/images/screenshots/external-probe-sync-fork.svg"
            alt={t.shot3}
            caption={t.shot3}
          />
          <Screenshot
            src="/images/screenshots/external-probe-actions.png"
            alt={t.shot4}
            caption={t.shot4}
          />
        </div>
        <p className="mt-5 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-muted-foreground">
          {t.updateWarning}
        </p>
      </section>

      <section className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
        <h2 className="mb-2 flex items-center gap-2 font-semibold">
          <ShieldCheck className="size-5" />
          {t.troubleshootTitle}
        </h2>
        <p className="text-sm text-muted-foreground">{t.troubleshoot}</p>
      </section>
    </XDocLayout>
  );
}
