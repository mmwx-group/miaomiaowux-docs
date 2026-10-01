import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ExternalLink, LoaderCircle } from "lucide-react";

// Changelog — 「更新日志」页。不写死在文档里:打开页面时直接读 GitHub 公开发布仓的 Release,
// 主控与 Agent 各一个标签。发版不用改文档、不用重新部署(从前是手抄的静态页,停在 v0.4.8-beta.14)。
//
// 用 GitHub 渲染好的 body_html(Accept: application/vnd.github.html+json),它已经过 GitHub 的
// 清洗,不用再引入 markdown 解析器;只去掉每条 Release 开头重复的标题与群链接、末尾的升级说明。
// 未登录的 GitHub API 每个 IP 每小时 60 次,结果在浏览器里缓存 10 分钟。

const SOURCES = {
  master: { repo: "iluobei/miaomiaowuX" },
  agent: { repo: "mmwx-group/mmwx-agent" },
} as const;
type SourceId = keyof typeof SOURCES;

const PER_PAGE = 20;
const CACHE_TTL_MS = 10 * 60 * 1000;

interface Release {
  id: number;
  tag_name: string;
  name: string | null;
  html_url: string;
  published_at: string | null;
  prerelease: boolean;
  draft: boolean;
  body_html?: string;
}

const STRINGS = {
  zh: {
    tabs: { master: "主控", agent: "Agent" },
    loading: "正在读取发布记录…",
    error:
      "暂时读不到 GitHub 的发布记录(可能触发了访问频率限制),请稍后刷新,或直接去 GitHub 查看。",
    latest: "最新版本",
    prerelease: "预发布",
    stableOnly: "只看正式版",
    loadMore: "加载更多",
    viewOnGitHub: "在 GitHub 上查看全部发布",
    viewRelease: "查看完整发布说明",
    empty: "没有符合条件的版本。",
    expand: "展开全部({n} 条)",
    collapse: "收起",
  },
  en: {
    tabs: { master: "Master", agent: "Agent" },
    loading: "Loading releases…",
    error:
      "Could not load releases from GitHub (possibly rate-limited). Please refresh later or view them on GitHub.",
    latest: "Latest",
    prerelease: "Pre-release",
    stableOnly: "Stable releases only",
    loadMore: "Load more",
    viewOnGitHub: "View all releases on GitHub",
    viewRelease: "Full release notes",
    empty: "No releases match.",
    expand: "Show all ({n} items)",
    collapse: "Show less",
  },
};

function readCache(key: string): Release[] | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { at, data } = JSON.parse(raw) as { at: number; data: Release[] };
    return Date.now() - at < CACHE_TTL_MS ? data : null;
  } catch {
    return null;
  }
}

function writeCache(key: string, data: Release[]) {
  try {
    localStorage.setItem(key, JSON.stringify({ at: Date.now(), data }));
  } catch {
    // 隐私模式 / 存储满:不缓存而已
  }
}

async function fetchReleases(
  source: SourceId,
  page: number,
): Promise<Release[]> {
  const { repo } = SOURCES[source];
  const key = `mmwx-changelog:${repo}:${page}`;
  const cached = readCache(key);
  if (cached) return cached;
  const r = await fetch(
    `https://api.github.com/repos/${repo}/releases?per_page=${PER_PAGE}&page=${page}`,
    { headers: { Accept: "application/vnd.github.html+json" } },
  );
  if (!r.ok) throw new Error(String(r.status));
  const data = ((await r.json()) as Release[]).filter((x) => !x.draft);
  writeCache(key, data);
  return data;
}

// cleanBody 去掉 Release 正文里与卡片标题重复、或每版都一样的部分。
function cleanBody(html: string, tag: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const version = tag.replace(/^v/, "");
  doc.querySelectorAll("h1, h2, h3").forEach((h) => {
    const text = (h.textContent || "").trim();
    if (
      text === "更新日志" ||
      text.includes("交流群") ||
      new RegExp(`^v?${version.replace(/\./g, "\\.")}(\\s|\\(|$)`).test(text)
    ) {
      h.remove();
    }
  });
  // Agent 每版末尾的「升级方式」说明一模一样,从它开始到结尾都不要。
  const upgrade = Array.from(doc.querySelectorAll("h2")).find(
    (h) => (h.textContent || "").trim() === "升级方式",
  );
  if (upgrade) {
    let el: Element | null = upgrade;
    while (el) {
      const next: Element | null = el.nextElementSibling;
      el.remove();
      el = next;
    }
  }
  doc.querySelectorAll("a").forEach((a) => {
    a.setAttribute("target", "_blank");
    a.setAttribute("rel", "noreferrer");
  });
  return doc.body.innerHTML.trim();
}

function formatDate(iso: string | null, lang: "zh" | "en") {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(lang === "zh" ? "zh-CN" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// 正式版的说明会把整轮 beta 的改动都并进来(v0.5.5 有四百多条),全部铺开一页就看不下去了:
// 超过这个条数就先折叠,底部渐隐,点「展开全部」再看。
const COLLAPSE_ITEMS = 15;

function ReleaseBody({ html, lang }: { html: string; lang: "zh" | "en" }) {
  const t = STRINGS[lang];
  const items = (html.match(/<li[\s>]/g) || []).length;
  const collapsible = items > COLLAPSE_ITEMS;
  const [expanded, setExpanded] = useState(false);
  const folded = collapsible && !expanded;
  return (
    <div className="flex flex-col gap-2">
      <div className={folded ? "relative max-h-80 overflow-hidden" : undefined}>
        <div
          className="text-sm leading-relaxed break-words [&_a]:underline [&_a]:underline-offset-2 [&_blockquote]:border-l-2 [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:font-mono [&_code]:text-xs [&_h2]:mt-3 [&_h2]:font-semibold [&_h3]:mt-3 [&_h3]:font-semibold [&_h4]:mt-2 [&_h4]:font-semibold [&_li]:my-0.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-1.5 [&_ul]:list-disc [&_ul]:pl-5 [&>*:first-child]:mt-0"
          dangerouslySetInnerHTML={{ __html: html }}
        />
        {folded && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-card to-transparent" />
        )}
      </div>
      {collapsible && (
        <Button
          variant="ghost"
          size="sm"
          className="self-start px-2"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? t.collapse : t.expand.replace("{n}", String(items))}
        </Button>
      )}
    </div>
  );
}

function ReleaseList({
  source,
  lang,
}: {
  source: SourceId;
  lang: "zh" | "en";
}) {
  const t = STRINGS[lang];
  const [releases, setReleases] = useState<Release[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [stableOnly, setStableOnly] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchReleases(source, page)
      .then((data) => {
        if (cancelled) return;
        setReleases((prev) => (page === 1 ? data : [...prev, ...data]));
        setHasMore(data.length === PER_PAGE);
        setFailed(false);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [source, page]);

  const repoUrl = `https://github.com/${SOURCES[source].repo}/releases`;
  const latestStable = releases.find((r) => !r.prerelease)?.id;
  const shown = stableOnly ? releases.filter((r) => !r.prerelease) : releases;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <label className="flex cursor-pointer items-center gap-2 select-none">
          <input
            type="checkbox"
            checked={stableOnly}
            onChange={(e) => setStableOnly(e.target.checked)}
          />
          {t.stableOnly}
        </label>
        <a
          href={repoUrl}
          target="_blank"
          rel="noreferrer"
          className="ml-auto inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
        >
          <ExternalLink className="size-3.5" />
          {t.viewOnGitHub}
        </a>
      </div>

      {failed && releases.length === 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm">
          <AlertTriangle className="size-4 shrink-0 text-amber-500" />
          <span>{t.error}</span>
        </div>
      )}
      {loading && releases.length === 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <LoaderCircle className="size-4 animate-spin" />
          <span>{t.loading}</span>
        </div>
      )}
      {!loading && !failed && shown.length === 0 && (
        <p className="text-sm text-muted-foreground">{t.empty}</p>
      )}

      {shown.map((r) => {
        const body = r.body_html ? cleanBody(r.body_html, r.tag_name) : "";
        return (
          <Card key={r.id} className="gap-3 py-4">
            <CardContent className="flex flex-col gap-3 px-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-base font-semibold">
                  {r.tag_name}
                </span>
                {r.id === latestStable && <Badge>{t.latest}</Badge>}
                {r.prerelease && (
                  <Badge variant="outline">{t.prerelease}</Badge>
                )}
                <span className="ml-auto text-xs text-muted-foreground">
                  {formatDate(r.published_at, lang)}
                </span>
              </div>
              {body && <ReleaseBody html={body} lang={lang} />}
              <a
                href={r.html_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 self-start text-xs text-muted-foreground hover:text-foreground"
              >
                <ExternalLink className="size-3" />
                {t.viewRelease}
              </a>
            </CardContent>
          </Card>
        );
      })}

      {hasMore && (
        <Button
          variant="outline"
          className="self-center"
          disabled={loading}
          onClick={() => {
            setLoading(true);
            setPage((p) => p + 1);
          }}
        >
          {loading && <LoaderCircle className="size-4 animate-spin" />}
          {t.loadMore}
        </Button>
      )}
    </div>
  );
}

export function Changelog({ lang = "zh" }: { lang?: "zh" | "en" }) {
  const t = STRINGS[lang];
  const [source, setSource] = useState<SourceId>("master");
  return (
    <div className="not-content mmwx-doc-demo flex flex-col gap-4">
      <div className="flex gap-2">
        {(Object.keys(SOURCES) as SourceId[]).map((id) => (
          <Button
            key={id}
            variant={source === id ? "default" : "outline"}
            size="sm"
            onClick={() => setSource(id)}
          >
            {t.tabs[id]}
          </Button>
        ))}
      </div>
      {/* key 让切换标签时各自从第 1 页重新读,互不串数据 */}
      <ReleaseList key={source} source={source} lang={lang} />
    </div>
  );
}
