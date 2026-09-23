import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Apple,
  Download,
  ExternalLink,
  Laptop,
  Monitor,
  Smartphone,
  AlertTriangle,
  LoaderCircle,
} from "lucide-react";

// ClientDownload — 「客户端下载」页的下载卡片。版本与链接不写死在文档里，而是读 R2 桶根目录的
// latest.json（由 MeowX 仓库 scripts/publish-r2.sh 在发版时上传），发版不用改文档、不用重新部署。

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
interface Manifest {
  updatedAt: string;
  platforms: Partial<Record<Platform, ManifestPlatform>>;
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
    ios: {
      badge: "TestFlight 内测",
      requirement: "iOS 17 及以上 · iPhone / iPad",
      text: "iOS 版通过 TestFlight 内测分发：登录许可证服务器，在「内测报名」登记 Apple ID 邮箱，收到邀请后在 TestFlight 里安装。",
      button: "去内测报名",
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
    ios: {
      badge: "TestFlight beta",
      requirement: "iOS 17 or later · iPhone / iPad",
      text: "The iOS build is distributed through TestFlight. Sign in to the license server, register your Apple ID email under “Beta signup”, then install from TestFlight once the invitation arrives.",
      button: "Beta signup",
    },
  },
} as const;

const BETA_SIGNUP_URL = "https://license.miaomiaowux.com/beta";

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
                            f.kind === "zip" || f.kind === "portable"
                              ? "outline"
                              : "default"
                          }
                        >
                          <a href={f.url} download title={f.name}>
                            <Download className="size-4" />
                            <span className="truncate">
                              {t.kind[f.kind] ?? f.kind}
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
