// 文档站的 Worker:只接 /api/*(见 wrangler.jsonc 的 run_worker_first),其余请求直接走静态资源。
//
// /api/changelog/{master|agent}?page=N —— 更新日志页用的 GitHub Release 列表。
// 从前是浏览器直接问 GitHub:未登录每个 IP 每小时只有 60 次,几个人共用一个出口 IP 就会被限流,
// 页面读不出来。现在由 Worker 去问,结果放进边缘缓存:
//   - 10 分钟内的直接给(不碰 GitHub);
//   - 过了 10 分钟的先把旧的给出去,后台再去 GitHub 刷新(访客不用等);
//   - GitHub 限流 / 不通时一直给旧的,最长留 7 天。
// 配了 GITHUB_TOKEN(只读、不需要任何权限的 token)时带上它,额度是每小时 5000 次;
// 没配也能用,但 Worker 出口 IP 是和别人共用的,未登录的额度不保证够。

interface Env {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
  GITHUB_TOKEN?: string;
}
interface Ctx {
  waitUntil: (promise: Promise<unknown>) => void;
}

const REPOS: Record<string, string> = {
  master: "iluobei/miaomiaowuX",
  agent: "mmwx-group/mmwx-agent",
};
const PER_PAGE = 20;
const MAX_PAGE = 10;
const FRESH_SECONDS = 600;
const KEEP_SECONDS = 7 * 86400;
const FETCHED_AT = "x-fetched-at";

// 只留页面用得到的字段,原始响应里每条 Release 还带着作者、资源列表等一大堆
type Release = {
  id: number;
  tag_name: string;
  name: string | null;
  html_url: string;
  published_at: string | null;
  prerelease: boolean;
  draft: boolean;
  body_html?: string;
};

async function fromGitHub(repo: string, page: number, token?: string) {
  const r = await fetch(
    `https://api.github.com/repos/${repo}/releases?per_page=${PER_PAGE}&page=${page}`,
    {
      headers: {
        Accept: "application/vnd.github.html+json",
        "User-Agent": "mmwx-docs",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    },
  );
  if (!r.ok) throw new Error(`github ${r.status}`);
  const list = (await r.json()) as Release[];
  return list
    .filter((x) => !x.draft)
    .map(
      ({
        id,
        tag_name,
        name,
        html_url,
        published_at,
        prerelease,
        draft,
        body_html,
      }) => ({
        id,
        tag_name,
        name,
        html_url,
        published_at,
        prerelease,
        draft,
        body_html,
      }),
    );
}

/** 给浏览器的响应:浏览器自己也缓存 5 分钟;x-changelog-cache 标明这次是哪种命中,排查用。 */
function reply(body: BodyInit | null, state: string, status = 200) {
  return new Response(body, {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": status === 200 ? "public, max-age=300" : "no-store",
      "x-changelog-cache": state,
    },
  });
}

async function changelog(request: Request, env: Env, ctx: Ctx, source: string) {
  if (request.method !== "GET")
    return reply('{"error":"method"}', "BYPASS", 405);
  const url = new URL(request.url);
  const page = Math.min(
    MAX_PAGE,
    Math.max(1, Number(url.searchParams.get("page")) || 1),
  );
  const cache = (caches as unknown as { default: Cache }).default;
  // 缓存键是自己拼的,不带访客的查询串,免得被随便加参数绕过缓存
  const key = new Request(`${url.origin}/__cache/changelog/${source}/${page}`);

  const refresh = async () => {
    const body = JSON.stringify(
      await fromGitHub(REPOS[source], page, env.GITHUB_TOKEN),
    );
    await cache.put(
      key,
      new Response(body, {
        headers: {
          "content-type": "application/json; charset=utf-8",
          "cache-control": `public, max-age=${KEEP_SECONDS}`,
          [FETCHED_AT]: String(Date.now()),
        },
      }),
    );
    return body;
  };

  const hit = await cache.match(key);
  if (hit) {
    const age = (Date.now() - Number(hit.headers.get(FETCHED_AT) ?? 0)) / 1000;
    if (age < FRESH_SECONDS) return reply(hit.body, "HIT");
    // 旧的先给出去,后台刷新;刷新失败(限流 / 不通)就接着用旧的
    ctx.waitUntil(
      refresh().catch((e) => {
        // eslint-disable-next-line no-console -- 同上
        console.error(`changelog ${source} p${page} refresh: ${e}`);
      }),
    );
    return reply(hit.body, "STALE");
  }
  try {
    return reply(await refresh(), "MISS");
  } catch (e) {
    // 把 GitHub 回的状态带出去(如 "github 403"),不然线上只看得到 502,分不清是限流还是别的
    const reason = e instanceof Error ? e.message : "unknown";
    // eslint-disable-next-line no-console -- Worker 里这就是日志,在 Cloudflare 后台能看到
    console.error(`changelog ${source} p${page}: ${reason}`);
    return reply(JSON.stringify({ error: "upstream", reason }), "ERROR", 502);
  }
}

export default {
  async fetch(request: Request, env: Env, ctx: Ctx): Promise<Response> {
    const m = new URL(request.url).pathname.match(
      /^\/api\/changelog\/(master|agent)$/,
    );
    if (m) return changelog(request, env, ctx, m[1]);
    return env.ASSETS.fetch(request);
  },
};
