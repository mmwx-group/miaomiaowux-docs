import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Apple,
  Check,
  Copy,
  Download,
  ExternalLink,
  Laptop,
  Monitor,
  Router,
  Smartphone,
  AlertTriangle,
  LoaderCircle,
} from "lucide-react";

// ClientDownload — 「客户端下载」页的下载卡片。版本与链接不写死在文档里，而是读 R2 桶根目录的
// latest.json（由 MeowX 仓库 scripts/publish-r2.sh 在发版时上传），发版不用改文档、不用重新部署。
// OpenWrt 版的条目由 meowx-openwrt 仓库的发布工作流写（没有安装包列表，给的是软件源与一键安装命令）。

const MANIFEST_URL = "https://dl.miaomiaowux.com/meowx/latest.json";

type Platform = "macos" | "android" | "windows";
type FileKind = "dmg" | "zip" | "apk" | "setup" | "portable";

interface ManifestFile {
  kind: FileKind;
  arch: string;
  name: string;
  url: string;
  size: number;
  sha256: string;
}
interface ManifestPlatform {
  version: string;
  build?: string;
  releasedAt: string;
  files: ManifestFile[];
}
interface ManifestOpenWrt {
  version: string;
  build?: string;
  core?: string;
  releasedAt: string;
  feed: string;
  install: string;
}
interface Manifest {
  updatedAt: string;
  platforms: Partial<Record<Platform, ManifestPlatform>> & {
    openwrt?: ManifestOpenWrt;
  };
}

const STRINGS = {
  zh: {
    loading: "正在获取最新版本…",
    error: "暂时获取不到版本信息，请稍后刷新重试。",
    notPublished: "尚未发布",
    version: "版本",
    released: "发布于",
    checksum: "SHA-256",
    platform: { macos: "macOS", android: "Android", windows: "Windows" },
    requirement: {
      macos: "macOS 14 及以上 · Apple Silicon",
      android: "Android 8.0 及以上 · arm64",
      windows: "Windows 10 及以上 · x64",
    },
    kind: {
      dmg: "DMG 安装镜像",
      zip: "ZIP 压缩包",
      apk: "APK 安装包",
      setup: "安装包",
      portable: "便携版",
    },
    arch: { "arm64-v8a": "arm64", universal: "通用" } as Record<string, string>,
    ios: {
      badge: "TestFlight 内测",
      requirement: "iOS 17 及以上 · iPhone / iPad",
      text: "iOS 版通过 TestFlight 内测分发：登录许可证服务器，在「内测报名」登记 Apple ID 邮箱，收到邀请后在 TestFlight 里安装。",
      button: "去内测报名",
    },
    openwrt: {
      requirement: "OpenWrt 24.10 及以上 · firewall4",
      text: "路由器版，用浏览器（LuCI）管理，给整个局域网做透明代理。SSH 登录路由器后执行：",
      pending: "即将发布，安装方式见下方「安装说明 → OpenWrt」。",
      core: "内核",
      copy: "复制",
      copied: "已复制",
      source: "源码（GitHub）",
    },
  },
  en: {
    loading: "Fetching the latest release…",
    error:
      "Release information is unavailable right now. Please refresh later.",
    notPublished: "Not published yet",
    version: "Version",
    released: "Released",
    checksum: "SHA-256",
    platform: { macos: "macOS", android: "Android", windows: "Windows" },
    requirement: {
      macos: "macOS 14 or later · Apple Silicon",
      android: "Android 8.0 or later · arm64",
      windows: "Windows 10 or later · x64",
    },
    kind: {
      dmg: "DMG disk image",
      zip: "ZIP archive",
      apk: "APK package",
      setup: "Installer",
      portable: "Portable",
    },
    arch: { "arm64-v8a": "arm64", universal: "universal" } as Record<
      string,
      string
    >,
    ios: {
      badge: "TestFlight beta",
      requirement: "iOS 17 or later · iPhone / iPad",
      text: "The iOS build is distributed through TestFlight. Sign in to the license server, register your Apple ID email under “Beta signup”, then install from TestFlight once the invitation arrives.",
      button: "Beta signup",
    },
    openwrt: {
      requirement: "OpenWrt 24.10 or later · firewall4",
      text: "The router edition, managed in the browser (LuCI), transparently proxies your whole LAN. SSH into the router and run:",
      pending: "Coming soon. See “Installation → OpenWrt” below.",
      core: "core",
      copy: "Copy",
      copied: "Copied",
      source: "Source (GitHub)",
    },
  },
} as const;

const BETA_SIGNUP_URL = "https://license.miaomiaowux.com/beta";
const OPENWRT_REPO_URL = "https://github.com/mmwx-group/meowx-openwrt";

const PLATFORMS: { id: Platform; Icon: typeof Laptop }[] = [
  { id: "macos", Icon: Laptop },
  { id: "android", Icon: Smartphone },
  { id: "windows", Icon: Monitor },
];

function formatSize(bytes: number) {
  if (bytes >= 1024 * 1024 * 1024)
    return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function formatDate(iso: string, lang: "zh" | "en") {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(lang === "zh" ? "zh-CN" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// OpenWrt：没有安装包可点，给一键安装命令（带复制按钮）与源码地址
function OpenWrtCard({
  lang,
  entry,
  loaded,
}: {
  lang: "zh" | "en";
  entry?: ManifestOpenWrt;
  loaded: boolean;
}) {
  const t = STRINGS[lang];
  const [copied, setCopied] = useState(false);
  const copy = () => {
    if (!entry) return;
    navigator.clipboard?.writeText(entry.install).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <Card className="gap-3 py-4">
      <CardContent className="flex flex-col gap-3 px-4">
        <div className="flex items-center gap-2">
          <Router className="size-5" />
          <span className="text-base font-semibold">OpenWrt</span>
          {entry ? (
            <Badge variant="secondary" className="ml-auto font-mono">
              v{entry.version}
            </Badge>
          ) : (
            <Badge variant="outline" className="ml-auto">
              {loaded ? t.notPublished : "—"}
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {t.openwrt.requirement}
          {entry?.core ? ` · ${t.openwrt.core} ${entry.core}` : ""}
        </p>
        {entry ? (
          <>
            <p className="text-xs text-muted-foreground">
              {t.released} {formatDate(entry.releasedAt, lang)}
            </p>
            <p className="text-sm">{t.openwrt.text}</p>
            <div className="flex items-start gap-2 rounded-md border bg-muted/50 p-2">
              <code className="flex-1 break-all font-mono text-xs">
                {entry.install}
              </code>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 shrink-0 px-2"
                onClick={copy}
                title={t.openwrt.copy}
              >
                {copied ? (
                  <Check className="size-4" />
                ) : (
                  <Copy className="size-4" />
                )}
                <span className="text-xs">
                  {copied ? t.openwrt.copied : t.openwrt.copy}
                </span>
              </Button>
            </div>
          </>
        ) : (
          loaded && <p className="text-sm">{t.openwrt.pending}</p>
        )}
        <Button asChild variant="outline">
          <a href={OPENWRT_REPO_URL} target="_blank" rel="noreferrer">
            <ExternalLink className="size-4" />
            <span>{t.openwrt.source}</span>
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}

export function ClientDownload({ lang = "zh" }: { lang?: "zh" | "en" }) {
  const t = STRINGS[lang];
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(MANIFEST_URL, { cache: "no-store" })
      .then((r) =>
        r.ok ? r.json() : Promise.reject(new Error(String(r.status))),
      )
      .then((m: Manifest) => {
        if (!cancelled) setManifest(m);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="not-content mmwx-doc-demo">
      {failed && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm">
          <AlertTriangle className="size-4 shrink-0 text-amber-500" />
          <span>{t.error}</span>
        </div>
      )}
      {!failed && !manifest && (
        <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
          <LoaderCircle className="size-4 animate-spin" />
          <span>{t.loading}</span>
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        {PLATFORMS.map(({ id, Icon }) => {
          const p = manifest?.platforms?.[id];
          return (
            <Card key={id} className="gap-3 py-4">
              <CardContent className="flex flex-col gap-3 px-4">
                <div className="flex items-center gap-2">
                  <Icon className="size-5" />
                  <span className="text-base font-semibold">
                    {t.platform[id]}
                  </span>
                  {p ? (
                    <Badge variant="secondary" className="ml-auto font-mono">
                      v{p.version}
                      {p.build ? ` (${p.build})` : ""}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="ml-auto">
                      {manifest ? t.notPublished : "—"}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t.requirement[id]}
                </p>
                {p && (
                  <>
                    <p className="text-xs text-muted-foreground">
                      {t.released} {formatDate(p.releasedAt, lang)}
                    </p>
                    <div className="flex flex-col gap-2">
                      {p.files.map((f) => (
                        <Button
                          key={f.name}
                          asChild
                          variant={
                            f.kind === "zip" ||
                            f.kind === "portable" ||
                            f.arch === "universal"
                              ? "outline"
                              : "default"
                          }
                        >
                          <a href={f.url} download title={f.name}>
                            <Download className="size-4" />
                            <span className="truncate">
                              {t.kind[f.kind] ?? f.kind}
                              {/* 同一平台有多个同类包（Android 的 arm64 / 通用）时标出架构，否则几个按钮一模一样 */}
                              {p.files.filter((o) => o.kind === f.kind).length >
                                1 && ` · ${t.arch[f.arch] ?? f.arch}`}
                            </span>
                            <span className="ml-auto text-xs opacity-75">
                              {formatSize(f.size)}
                            </span>
                          </a>
                        </Button>
                      ))}
                    </div>
                    <details className="text-xs text-muted-foreground">
                      <summary className="cursor-pointer select-none">
                        {t.checksum}
                      </summary>
                      <ul className="mt-1 space-y-1">
                        {p.files.map((f) => (
                          <li key={f.name} className="break-all font-mono">
                            <span className="text-foreground">{f.name}</span>
                            <br />
                            {f.sha256}
                          </li>
                        ))}
                      </ul>
                    </details>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
        <OpenWrtCard
          lang={lang}
          entry={manifest?.platforms?.openwrt}
          loaded={manifest !== null}
        />
        {/* iOS：TestFlight 内测，不走 latest.json；报名入口在许可证服务器 */}
        <Card className="gap-3 py-4">
          <CardContent className="flex flex-col gap-3 px-4">
            <div className="flex items-center gap-2">
              <Apple className="size-5" />
              <span className="text-base font-semibold">iOS</span>
              <Badge variant="outline" className="ml-auto">
                {t.ios.badge}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{t.ios.requirement}</p>
            <p className="text-sm">{t.ios.text}</p>
            <Button asChild variant="outline">
              <a href={BETA_SIGNUP_URL} target="_blank" rel="noreferrer">
                <ExternalLink className="size-4" />
                <span>{t.ios.button}</span>
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
