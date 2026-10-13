import { lazy, Suspense, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Search, Waypoints } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { formatBytes } from "../overview-demo/data";
import { useTick } from "../use-tick";
import { ChainRow, CompactTable } from "./chain-list";
import {
  buildChains,
  clockAgo,
  e2eOf,
  fmtLoss,
  fmtMs,
  onlineOf,
  portCount,
  PROBE_EVERY,
  stopsOf,
  THRESHOLD_MS,
  type Chain,
  type ChainStatus,
} from "./data";
import { Sparkline, Tag } from "./parts";
import { BTN, BTN_OUTLINE, BTN_SOLID, STATUS_DOT, STATUS_TAG } from "./styles";
import { ForwardTopology } from "./topology";
import type { CanvasState } from "./canvas";
import { docFromChain, type CDoc } from "./canvas/model";

// 画布带着 React Flow,拆成单独的块,点开才加载
const ForwardCanvas = lazy(() => import("./canvas"));

// 首页的「转发链」演示:照着面板的转发页做的 —— 指标条、网络拓扑、待处理、链列表(路线 / 紧凑两种视图)。
// 数据全是本地编出来的;「立即下发」会真的把那条待下发的链变成健康。「打开画布」进编排画布的演示。

type Filter = "all" | "problem" | ChainStatus;
type Alert = {
  kind: "broken" | "degraded" | "pending";
  chain: Chain;
  message: string;
};

const STATUSES: ChainStatus[] = ["healthy", "degraded", "broken", "pending"];
const SEVERITY: Record<Alert["kind"], number> = {
  broken: 0,
  degraded: 1,
  pending: 2,
};
/** 那条「待下发」的链:在画布里保存并下发,总览里它也跟着变健康 */
const PENDING_CHAIN_ID = 5;
const rowId = (id: number) => `fwd-demo-chain-${id}`;
const stopName = (c: Chain, i: number) => {
  const s = stopsOf(c)[i];
  return s.kind === "group" ? s.group.name : s.name;
};

export function ForwardDemo() {
  const { t } = useTranslation("landing");
  return (
    <section className="px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <div className="bg-primary/10 text-primary mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1 text-sm font-medium">
            <Waypoints className="size-4 animate-pulse" />
            {t("xHome.forwardDemo.live")}
          </div>
          <h2 className="pixel-text text-primary mb-3 text-3xl font-bold sm:text-4xl">
            {t("xHome.forwardDemo.heading")}
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-base">
            {t("xHome.forwardDemo.description")}
          </p>
        </div>
        <ForwardPanel />
      </div>
    </section>
  );
}

function ForwardPanel() {
  const { t } = useTranslation("forward");
  const tick = useTick(1500);
  const [pushed, setPushed] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");
  const [view, setView] = useState<"route" | "compact">("route");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [highlight, setHighlight] = useState<number | null>(null);
  const [topoOpen, setTopoOpen] = useState(true);
  const [topoProblemsOnly, setTopoProblemsOnly] = useState(false);
  const [canvas, setCanvas] = useState<{
    key: number;
    doc: CDoc | null;
    state: CanvasState;
    chainId?: number;
  } | null>(null);

  const chains = useMemo(() => buildChains(tick, pushed), [tick, pushed]);
  const counts = useMemo(() => {
    const by: Record<string, number> = { all: chains.length };
    for (const c of chains) by[c.status] = (by[c.status] ?? 0) + 1;
    by.problem = chains.length - (by.healthy ?? 0);
    return by;
  }, [chains]);
  const problems = useMemo(
    () => chains.filter((c) => c.status !== "healthy"),
    [chains],
  );

  const alerts = useMemo(() => {
    const list: Alert[] = [];
    for (const c of problems) {
      if (c.status === "broken") {
        const gi = c.groups.findIndex((g) => onlineOf(g) === 0);
        list.push({
          kind: "broken",
          chain: c,
          message: t("alerts.msg.broken", {
            group: c.groups[Math.max(gi, 0)].name,
            hop: Math.max(gi, 1),
          }),
        });
      } else if (c.status === "degraded") {
        const li = c.links.findIndex((l) => l.state === "degraded");
        const l = c.links[li];
        list.push({
          kind: "degraded",
          chain: c,
          message: t("alerts.msg.degraded", {
            from: stopName(c, li),
            to: stopName(c, li + 1),
            loss: fmtLoss(l.loss),
            ms: fmtMs(l.rtt),
            threshold: fmtMs(THRESHOLD_MS),
          }),
        });
      } else {
        list.push({
          kind: "pending",
          chain: c,
          message: t("alerts.msg.pending", {
            count: c.groups.reduce((a, g) => a + g.members.length, 0),
          }),
        });
      }
    }
    return list.sort((a, b) => SEVERITY[a.kind] - SEVERITY[b.kind]);
  }, [problems, t]);

  const shown = useMemo(() => {
    const kw = q.trim().toLowerCase();
    return chains
      .filter(
        (c) =>
          filter === "all" ||
          (filter === "problem" ? c.status !== "healthy" : c.status === filter),
      )
      .filter(
        (c) =>
          !kw ||
          [
            c.name,
            c.domain ?? "",
            ...c.groups.flatMap((g) => [
              g.name,
              ...g.members.map((m) => m.name),
            ]),
          ].some((s) => s.toLowerCase().includes(kw)),
      );
  }, [chains, filter, q]);

  // 选路段里路上的中转组也算在内
  const servers = new Set(
    chains.flatMap((c) =>
      [...c.groups, ...(c.pathSet?.paths.flatMap((p) => p.via) ?? [])].flatMap(
        (g) => g.members.map((m) => m.id),
      ),
    ),
  ).size;
  const nodes = chains.reduce((a, c) => a + c.nodes, 0);
  const portsTotal = chains.reduce((a, c) => a + portCount(c), 0);
  const todayBytes = chains.reduce((a, c) => a + c.todayBytes, 0);
  const trend = Array.from({ length: 24 }, (_, i) =>
    chains.reduce((a, c) => a + (c.trend[i] ?? 0), 0),
  );
  const e2es = chains.map(e2eOf).filter((v): v is number => v != null);
  const avgE2E = e2es.length
    ? e2es.reduce((a, v) => a + v, 0) / e2es.length
    : undefined;
  const probedSec = Math.floor((tick % PROBE_EVERY) * 1.5);

  const push = () => {
    setPushed(true);
    // 待下发的链没了,筛选还停在「待下发」的话列表会空
    if (filter === "pending") setFilter("all");
  };
  const reveal = (id: number) => {
    setFilter("all");
    setQ("");
    setView("route");
    setHighlight(id);
    setExpanded(id);
    requestAnimationFrame(() =>
      document
        .getElementById(rowId(id))
        ?.scrollIntoView({ block: "center", behavior: "smooth" }),
    );
  };

  // 打开画布:传一条链就是编辑它,不传就是新建
  const openCanvas = (c: Chain | null) =>
    setCanvas((prev) => ({
      key: (prev?.key ?? 0) + 1,
      doc: c ? docFromChain(c) : null,
      state: !c || c.status === "pending" ? "draft" : "saved",
      chainId: c?.id,
    }));

  const kpi = "bg-card flex items-center gap-4 rounded-xl border px-4 py-3";
  return (
    <div className="bg-background flex flex-col gap-5 rounded-xl border p-3 text-left shadow-sm sm:p-5">
      {/* 标题 */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-sm">
            <span>{t("crumb")}</span>
            <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-600 ring-4 ring-emerald-100 dark:ring-emerald-900/50" />
              {t("live", { sec: probedSec })}
            </span>
          </div>
          <div className="text-3xl font-bold tracking-wide">{t("title")}</div>
          <div className="text-muted-foreground text-sm">
            {t("summary", { chains: chains.length, servers, nodes })}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* 经典模式在面板里是一个分步对话框,演示里只是摆着 */}
          <span
            className={cn(
              BTN,
              BTN_OUTLINE,
              "pointer-events-none h-9 text-sm select-none",
            )}
            aria-hidden="true"
          >
            {t("actions.classic")}
          </span>
          <button
            type="button"
            className={cn(BTN, BTN_SOLID, "h-9 text-sm")}
            onClick={() => openCanvas(null)}
          >
            <Plus className="size-4" />
            {t("actions.canvas")}
          </button>
        </div>
      </div>

      {/* 指标条 */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className={kpi}>
          <b className="text-3xl tabular-nums">
            {counts.healthy ?? 0}
            <span className="text-muted-foreground text-base">
              /{chains.length}
            </span>
          </b>
          <div className="flex flex-1 flex-col gap-1.5">
            <span className="text-muted-foreground text-xs">
              {t("kpi.health", {
                degraded: counts.degraded ?? 0,
                broken: counts.broken ?? 0,
                pending: counts.pending ?? 0,
              })}
            </span>
            <div className="flex h-1.5 gap-0.5">
              {STATUSES.map((st) =>
                (counts[st] ?? 0) > 0 ? (
                  <span
                    key={st}
                    className={cn("rounded", STATUS_DOT[st])}
                    style={{ flex: counts[st] }}
                  />
                ) : null,
              )}
            </div>
          </div>
        </div>
        <div className={kpi}>
          <b className="text-3xl tabular-nums">{formatBytes(todayBytes)}</b>
          <div className="flex flex-1 flex-col gap-1">
            <span className="text-muted-foreground text-xs">
              {t("kpi.today")}
            </span>
            <Sparkline values={trend} className="text-primary" />
          </div>
        </div>
        <div className={kpi}>
          <b className="text-3xl tabular-nums">{fmtMs(avgE2E)}</b>
          <span className="text-muted-foreground text-xs leading-5">
            {t("kpi.avgE2E")}
            {e2es.length > 0 && (
              <>
                <br />
                {t("kpi.fastSlow", {
                  min: fmtMs(Math.min(...e2es)),
                  max: fmtMs(Math.max(...e2es)),
                })}
              </>
            )}
          </span>
        </div>
        <div className={kpi}>
          <b className="text-3xl tabular-nums">
            {nodes}
            <span className="text-muted-foreground text-base">
              {" "}
              / {portsTotal}
            </span>
          </b>
          <div className="flex flex-1 flex-col gap-1.5">
            <span className="text-muted-foreground text-xs">
              {t("kpi.ports")}
            </span>
            <div className="bg-muted h-1.5 rounded">
              <div
                className="bg-primary h-1.5 rounded"
                style={{ width: `${(nodes / portsTotal) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 拓扑 */}
      <div className="bg-card flex flex-col gap-3 rounded-2xl border px-4 py-4 sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-baseline gap-2">
            <b className="shrink-0">{t("topo.title")}</b>
            <span className="text-muted-foreground text-xs">
              {t("topo.hint")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {topoOpen && (
              <>
                <button
                  type="button"
                  aria-pressed={!topoProblemsOnly}
                  className={cn(
                    BTN,
                    topoProblemsOnly ? BTN_OUTLINE : BTN_SOLID,
                  )}
                  onClick={() => setTopoProblemsOnly(false)}
                >
                  {t("topo.all")}
                </button>
                <button
                  type="button"
                  aria-pressed={topoProblemsOnly}
                  className={cn(
                    BTN,
                    topoProblemsOnly ? BTN_SOLID : BTN_OUTLINE,
                  )}
                  onClick={() => setTopoProblemsOnly(true)}
                >
                  {t("topo.problems")}
                </button>
              </>
            )}
            <button
              type="button"
              aria-expanded={topoOpen}
              className={cn(BTN, BTN_OUTLINE)}
              onClick={() => setTopoOpen(!topoOpen)}
            >
              {t(topoOpen ? "topo.collapse" : "topo.expand")}
            </button>
          </div>
        </div>
        {topoOpen && (
          <ForwardTopology
            chains={topoProblemsOnly ? problems : chains}
            focus={highlight}
            onFocus={setHighlight}
          />
        )}
      </div>

      {/* 待处理 */}
      {alerts.length > 0 && (
        <div className="bg-card overflow-hidden rounded-2xl border">
          <div className="flex items-baseline gap-2 border-b px-5 py-3">
            <b>{t("alerts.title")}</b>
            <span className="text-muted-foreground text-xs">
              {t("alerts.sub", { count: alerts.length })}
            </span>
          </div>
          {alerts.map((a) => (
            <div
              key={a.chain.id}
              className="flex flex-wrap items-center gap-3 border-b px-5 py-2.5 last:border-b-0"
            >
              <Tag className={cn("w-16 justify-center", STATUS_TAG[a.kind])}>
                {t(`status.${a.kind}`)}
              </Tag>
              <span className="w-32 truncate font-semibold">
                {a.chain.name}
              </span>
              <span className="min-w-0 flex-[1_1_320px] text-sm">
                {a.message}
              </span>
              {a.chain.sinceMin != null && (
                <span className="text-muted-foreground text-xs tabular-nums">
                  {t("alerts.since", {
                    clock: clockAgo(a.chain.sinceMin),
                    dur: t("duration.min", { count: a.chain.sinceMin }),
                  })}
                </span>
              )}
              {a.kind === "pending" ? (
                <button
                  type="button"
                  className={cn(BTN, BTN_SOLID)}
                  onClick={push}
                >
                  {t("alerts.push")}
                </button>
              ) : (
                <button
                  type="button"
                  className={cn(BTN, BTN_OUTLINE)}
                  onClick={() => reveal(a.chain.id)}
                >
                  {t("alerts.view")}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 筛选 */}
      <div className="flex flex-wrap items-center gap-2">
        {(["all", "problem", ...STATUSES] as Filter[])
          .filter((k) => k === "all" || (counts[k] ?? 0) > 0)
          .map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={filter === k}
              className={cn(
                BTN,
                "rounded-full",
                filter === k ? BTN_SOLID : BTN_OUTLINE,
              )}
              onClick={() => setFilter(k)}
            >
              {t(`filter.${k}`)} {counts[k] ?? 0}
            </button>
          ))}
        <div className="flex-1" />
        <div className="relative w-full sm:w-60">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("search")}
            aria-label={t("search")}
            className="h-9 pl-9"
          />
        </div>
        <div className="flex w-full overflow-hidden rounded-md border sm:w-auto">
          {(["route", "compact"] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={view === v}
              onClick={() => setView(v)}
              className={cn(
                "h-8 flex-1 px-3 text-xs font-medium sm:flex-none",
                view === v
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted",
              )}
            >
              {t(`view.${v}`)}
            </button>
          ))}
        </div>
      </div>

      {shown.length === 0 ? (
        <div className="text-muted-foreground py-10 text-center text-sm">
          {t("empty")}
        </div>
      ) : view === "compact" ? (
        <CompactTable chains={shown} onPush={push} />
      ) : (
        <div className="flex flex-col gap-3">
          {shown.map((c) => (
            <div key={c.id} id={rowId(c.id)}>
              <ChainRow
                c={c}
                highlighted={highlight === c.id}
                expanded={expanded === c.id}
                onToggle={() => setExpanded(expanded === c.id ? null : c.id)}
                onPush={push}
                onCanvas={() => openCanvas(c)}
              />
            </div>
          ))}
        </div>
      )}

      <div className="text-muted-foreground flex flex-wrap gap-x-5 gap-y-1 text-xs">
        <span className="inline-flex flex-wrap items-center gap-x-2">
          {t("legend.title")}
          <span className="inline-flex items-center gap-1">
            <i className="inline-block h-1 w-4 rounded bg-emerald-700 dark:bg-emerald-400" />
            {t("legend.ok")}
          </span>
          <span className="inline-flex items-center gap-1">
            <i className="inline-block h-1 w-4 rounded bg-amber-600 dark:bg-amber-400" />
            {t("legend.warn")}
          </span>
          <span className="inline-flex items-center gap-1">
            <i className="inline-block w-4 border-t-2 border-dashed border-red-600 dark:border-red-400" />
            {t("legend.bad")}
          </span>
        </span>
        <span>{t("legend.dots")}</span>
        <span>{t("legend.lan")}</span>
      </div>

      <Dialog
        open={canvas !== null}
        onOpenChange={(o) => !o && setCanvas(null)}
      >
        <DialogContent
          showCloseButton={false}
          aria-describedby={undefined}
          onEscapeKeyDown={(e) => e.preventDefault()}
          className="block h-dvh w-screen max-w-none gap-0 rounded-none border-0 p-0 data-[state=closed]:zoom-out-100 data-[state=open]:zoom-in-100 sm:max-w-none"
        >
          <DialogTitle className="sr-only">{t("canvas.a11yTitle")}</DialogTitle>
          {canvas && (
            <Suspense
              fallback={<div className="bg-muted/40 h-full animate-pulse" />}
            >
              <ForwardCanvas
                key={canvas.key}
                initial={canvas.doc}
                initialState={canvas.state}
                onClose={() => setCanvas(null)}
                onSaved={canvas.chainId === PENDING_CHAIN_ID ? push : undefined}
              />
            </Suspense>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
