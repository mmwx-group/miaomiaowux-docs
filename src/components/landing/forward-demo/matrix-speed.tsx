import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Gauge, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { pseudoRandom } from "../overview-demo/data";
import { baseRtt, serverById } from "./canvas/model";
import type { Chain, Group, Member } from "./data";
import { BTN, BTN_OUTLINE, BTN_SOLID } from "./styles";

// 全链路测速的演示:入口组的每一台 → 出口组的每一台,一对一对地测,走这条链真实的转发路径。
// 结果是热力矩阵、按入口分组的柱状图和逐秒曲线,可以和之前某一次对比。
// 吞吐按路径上最窄的带宽与整条路的延迟估算;演示里一秒钟的数据约 0.2 秒出一格。

type Proto = "tcp" | "udp";
type Direction = "up" | "down" | "bidir";
type Request = {
  proto: Proto;
  direction: Direction;
  duration: number;
  rate: number;
  port: number;
};
type Sample = { mbps: number; rx: number };
type Cell = {
  from: number;
  to: number;
  state: "pending" | "running" | "done" | "error";
  /** 整段测试每一秒的数,开测时就算好,跑的时候一格一格露出来 */
  plan: Sample[];
  shown: number;
  retransmits: number;
  loss: number;
};
type Run = {
  id: number;
  chainId: number;
  at: string;
  request: Request;
  entries: Member[];
  exits: Member[];
  cells: Cell[];
  state: "running" | "done" | "aborted";
};

const TICK_MS = 200;
const KEEP = 20;
const SERIES = [
  "var(--chart-1)",
  "#3b6fb6",
  "#2f7a4f",
  "#8a5cb8",
  "#c98a1b",
  "#1f8a8a",
];
const DASHES = ["", "6 4", "2 3", "9 3 2 3"];
const SELECT =
  "bg-background h-8 rounded border px-2 text-xs disabled:opacity-60";
const fmtMbps = (v: number) =>
  v >= 100 ? String(Math.round(v)) : v.toFixed(1);
const cellKey = (c: { from: number; to: number }) => `${c.from}>${c.to}`;
const avgOf = (list: number[]) =>
  list.length ? list.reduce((a, v) => a + v, 0) / list.length : 0;
const seen = (c: Cell) => c.plan.slice(0, c.shown);
/** 这一对的成绩:双向时取入口 → 出口那个方向 */
const score = (c: Cell) => avgOf(seen(c).map((s) => s.mbps));
const scoreRx = (c: Cell) => avgOf(seen(c).map((s) => s.rx));

/** 链上夹在入口组和出口组之间的那些组(选路段走当前在用的那条路)。 */
function middleOf(c: Chain): Group[] {
  const mid = c.groups.slice(1, -1);
  const via = c.pathSet ? c.pathSet.paths[c.pathSet.active].via : [];
  return c.pathSet
    ? [...mid.slice(0, c.pathSet.hop), ...via, ...mid.slice(c.pathSet.hop)]
    : mid;
}

function planRun(c: Chain, request: Request, id: number): Run {
  const entries = c.groups[0].members;
  const exits = c.groups[c.groups.length - 1].members;
  const middle = middleOf(c);
  const cells: Cell[] = [];
  for (const en of entries)
    for (const ex of exits) {
      // 真实的路:入口 → 每个中转组里在线的一台 → 出口
      const hops = [
        en,
        ...middle.map((g) => g.members.find((m) => m.online)),
        ex,
      ];
      const ok = hops.every((m): m is Member => !!m && m.online);
      const path = ok ? (hops as Member[]).map((m) => serverById(m.id)) : [];
      const cap = Math.min(
        ...path.map((s) => s.mbps),
        request.rate || Infinity,
      );
      let rtt = 0;
      for (let i = 0; i < path.length - 1; i++)
        rtt += baseRtt(path[i], path[i + 1]);
      const seed = id * 97 + en.id * 13 + ex.id * 7;
      const plan = Array.from({ length: request.duration }, (_, sec) => {
        const noise = (k: number) =>
          0.94 + pseudoRandom(seed + sec * 11 + k) * 0.1;
        if (request.proto === "udp") {
          const v =
            Math.min(request.rate || 100, cap) *
            (0.985 + pseudoRandom(seed + sec) * 0.02);
          return { mbps: v, rx: v * 0.99 };
        }
        const steady = cap / (1 + rtt / 260);
        const ramp = sec === 0 ? 0.45 : sec === 1 ? 0.82 : 1;
        const back = request.direction === "down" ? 0.94 : 1;
        return {
          mbps: Math.min(steady * ramp * back * noise(1), cap),
          rx: Math.min(steady * 0.9 * ramp * noise(2), cap),
        };
      });
      cells.push({
        from: en.id,
        to: ex.id,
        state: ok ? "pending" : "error",
        plan: ok ? plan : [],
        shown: 0,
        retransmits: Math.round(pseudoRandom(seed * 3) * rtt * 0.5),
        loss: pseudoRandom(seed * 5) * 0.9,
      });
    }
  return {
    id,
    chainId: c.id,
    at: new Date().toTimeString().slice(0, 8),
    request: { ...request, port: request.port || c.portStart + 17 + (id % 40) },
    entries,
    exits,
    cells,
    state: "running",
  };
}

/** 往前走一格:当前这一对多露出一秒的数,露完了换下一对,全测完就收工。 */
function advance(run: Run): Run {
  const at = run.cells.findIndex(
    (c) => c.state === "running" || c.state === "pending",
  );
  if (at < 0) return { ...run, state: "done" };
  const cells = run.cells.map((c, i) => {
    if (i !== at) return c;
    const shown = c.shown + 1;
    return {
      ...c,
      shown,
      state: shown >= c.plan.length ? ("done" as const) : ("running" as const),
    };
  });
  return {
    ...run,
    cells,
    state: cells.some((c) => c.state === "running" || c.state === "pending")
      ? "running"
      : "done",
  };
}

function Kpi({
  label,
  value,
  sub,
  danger,
}: {
  label: string;
  value: string | number;
  sub?: string;
  danger?: boolean;
}) {
  return (
    <div className="bg-card flex min-w-0 flex-col gap-0.5 rounded-lg border px-3 py-2">
      <span className="text-muted-foreground text-xs">{label}</span>
      <b
        className={cn(
          "text-lg leading-tight tabular-nums",
          danger && "text-red-700 dark:text-red-400",
        )}
      >
        {value}
      </b>
      <span
        className="text-muted-foreground min-h-4 truncate text-[11px]"
        title={sub}
      >
        {sub}
      </span>
    </div>
  );
}

/** 每个入口一组柱子,一根柱子是一个出口;对比时旁边多一根浅色细柱。 */
function GroupedBars({ run, prev }: { run: Run; prev?: Map<string, number> }) {
  const max = Math.max(
    1,
    ...run.cells.map(score),
    ...(prev ? [...prev.values()] : []),
  );
  return (
    <div className="flex flex-wrap gap-x-6 gap-y-3">
      {run.entries.map((en) => (
        <div key={en.id} className="flex min-w-0 flex-col items-center gap-1">
          <div className="flex h-36 items-end gap-1.5">
            {run.exits.map((ex, i) => {
              const c = run.cells.find(
                (x) => x.from === en.id && x.to === ex.id,
              );
              const v = c && c.shown > 0 ? score(c) : 0;
              const old = prev?.get(`${en.id}>${ex.id}`);
              return (
                <div key={ex.id} className="flex h-full items-end gap-px">
                  <div className="flex h-full w-7 flex-col items-center justify-end">
                    <span className="text-[10px] tabular-nums">
                      {c?.state === "error" ? "✕" : v ? fmtMbps(v) : ""}
                    </span>
                    <span
                      className="w-full rounded-t-sm"
                      style={{
                        height: `${(v / max) * 84}%`,
                        background: SERIES[i % SERIES.length],
                      }}
                    />
                  </div>
                  {old != null && (
                    <span
                      className="w-1.5 rounded-t-sm opacity-40"
                      style={{
                        height: `${(old / max) * 84}%`,
                        background: SERIES[i % SERIES.length],
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <span className="text-muted-foreground max-w-32 truncate border-t pt-1 text-[11px]">
            {en.name}
          </span>
        </div>
      ))}
      <div className="text-muted-foreground flex flex-col justify-center gap-1 text-[11px]">
        {run.exits.map((ex, i) => (
          <span key={ex.id} className="inline-flex items-center gap-1.5">
            <i
              className="inline-block size-2 rounded-sm"
              style={{ background: SERIES[i % SERIES.length] }}
            />
            {ex.name}
          </span>
        ))}
      </div>
    </div>
  );
}

/** 所有入口 × 出口的逐秒曲线画在一张图里:颜色分出口,线型分入口;选中的那一对加粗。 */
function PairCurves({
  run,
  picked,
  onPick,
}: {
  run: Run;
  picked: string;
  onPick: (k: string) => void;
}) {
  const w = 600;
  const h = 180;
  const cells = run.cells.filter((c) => c.shown > 0);
  const max =
    Math.max(1, ...cells.flatMap((c) => seen(c).map((s) => s.mbps))) * 1.1;
  const x = (i: number) => (i / Math.max(run.request.duration - 1, 1)) * w;
  const name = (id: number) =>
    [...run.entries, ...run.exits].find((m) => m.id === id)?.name ?? "";
  const styleOf = (c: Cell) => ({
    color: SERIES[run.exits.findIndex((m) => m.id === c.to) % SERIES.length],
    dash: DASHES[run.entries.findIndex((m) => m.id === c.from) % DASHES.length],
  });
  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <svg
          viewBox={`0 0 ${w} ${h}`}
          preserveAspectRatio="none"
          className="bg-muted/40 h-44 w-full rounded"
          aria-hidden="true"
        >
          {[0.25, 0.5, 0.75].map((f) => (
            <line
              key={f}
              x1={0}
              x2={w}
              y1={h * f}
              y2={h * f}
              stroke="var(--border)"
              strokeDasharray="3 4"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {cells.map((c) => {
            const k = cellKey(c);
            const st = styleOf(c);
            const d = seen(c)
              .map(
                (s, i) =>
                  `${i ? "L" : "M"}${x(i).toFixed(1)} ${(h - (s.mbps / max) * (h - 8)).toFixed(1)}`,
              )
              .join(" ");
            return (
              <path
                key={k}
                d={d}
                fill="none"
                stroke={st.color}
                strokeDasharray={st.dash || undefined}
                strokeWidth={picked === k ? 3.5 : 1.8}
                opacity={picked && picked !== k ? 0.25 : 1}
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
        </svg>
        <span className="text-muted-foreground absolute top-1 left-1.5 text-[10px] tabular-nums">
          {fmtMbps(max)} Mbps
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {cells.map((c) => {
          const k = cellKey(c);
          const st = styleOf(c);
          return (
            <button
              key={k}
              type="button"
              aria-pressed={picked === k}
              onClick={() => onPick(picked === k ? "" : k)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px]",
                picked === k
                  ? "border-foreground font-semibold"
                  : "hover:bg-muted",
                picked && picked !== k && "opacity-50",
              )}
            >
              <svg width="18" height="6" aria-hidden="true">
                <line
                  x1="0"
                  x2="18"
                  y1="3"
                  y2="3"
                  stroke={st.color}
                  strokeWidth="2"
                  strokeDasharray={st.dash || undefined}
                />
              </svg>
              {name(c.from)} → {name(c.to)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Results({ run, prev }: { run: Run; prev?: Run }) {
  const { t } = useTranslation("forward");
  const [picked, setPicked] = useState("");
  const { proto, direction } = run.request;
  const prevMap = useMemo(
    () =>
      prev
        ? new Map(
            prev.cells
              .filter((c) => c.state === "done")
              .map((c) => [cellKey(c), score(c)]),
          )
        : undefined,
    [prev],
  );
  const done = run.cells.filter((c) => c.state === "done");
  const failed = run.cells.filter((c) => c.state === "error");
  const name = (id: number) =>
    [...run.entries, ...run.exits].find((m) => m.id === id)?.name ?? `#${id}`;
  const pair = (c: Cell) => `${name(c.from)} → ${name(c.to)}`;
  const sorted = [...done].sort((a, b) => score(b) - score(a));
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];
  const peak = best ? score(best) : 1;
  const cell =
    "rounded-md px-2 py-2 text-center tabular-nums whitespace-nowrap";

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <Kpi
          label={t("matrix.kpi.best")}
          value={best ? `${fmtMbps(score(best))} Mbps` : "—"}
          sub={best && pair(best)}
        />
        <Kpi
          label={t("matrix.kpi.worst")}
          value={worst ? `${fmtMbps(score(worst))} Mbps` : "—"}
          sub={worst && pair(worst)}
        />
        <Kpi
          label={t("matrix.kpi.avg")}
          value={done.length ? `${fmtMbps(avgOf(done.map(score)))} Mbps` : "—"}
          sub={t("matrix.kpi.valid", { count: done.length })}
        />
        <Kpi
          label={t("matrix.kpi.failed")}
          value={failed.length}
          danger={failed.length > 0}
          sub={failed.map(pair).join("、")}
        />
      </div>

      <div>
        <div className="mb-2 flex flex-wrap items-baseline gap-2 text-sm">
          <b>{t("matrix.heat")}</b>
          <span className="text-muted-foreground text-xs">
            {t(`matrix.heatHint.${proto}`)}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-1 text-sm">
            <thead>
              <tr>
                <th className="text-muted-foreground text-left text-xs font-normal">
                  {t("matrix.corner")}
                </th>
                {run.exits.map((ex, i) => (
                  <th
                    key={ex.id}
                    className="text-muted-foreground text-xs font-normal"
                  >
                    <span
                      className="mr-1 inline-block size-2 rounded-sm"
                      style={{ background: SERIES[i % SERIES.length] }}
                    />
                    {ex.name}
                  </th>
                ))}
                <th className="text-muted-foreground text-xs font-normal">
                  {t("matrix.rowAvg")}
                </th>
              </tr>
            </thead>
            <tbody>
              {run.entries.map((en) => {
                const row = run.cells.filter(
                  (c) => c.from === en.id && c.state === "done",
                );
                return (
                  <tr key={en.id}>
                    <td className="text-muted-foreground max-w-40 truncate pr-2 text-xs">
                      {en.name}
                    </td>
                    {run.exits.map((ex) => {
                      const c = run.cells.find(
                        (x) => x.from === en.id && x.to === ex.id,
                      )!;
                      const k = cellKey(c);
                      if (c.state === "done")
                        return (
                          <td
                            key={ex.id}
                            onClick={() => setPicked(picked === k ? "" : k)}
                            className={cn(
                              cell,
                              "cursor-pointer",
                              picked === k && "ring-primary ring-2",
                            )}
                            style={{
                              background: `color-mix(in srgb, var(--chart-1) ${Math.round(10 + 55 * (score(c) / peak))}%, transparent)`,
                            }}
                          >
                            {fmtMbps(score(c))}
                            {direction === "bidir" && (
                              <span className="text-xs">
                                {" "}
                                / {fmtMbps(scoreRx(c))}
                              </span>
                            )}
                            <span className="text-muted-foreground text-xs">
                              {" "}
                              (
                              {proto === "tcp"
                                ? c.retransmits
                                : `${c.loss.toFixed(1)}%`}
                              )
                            </span>
                          </td>
                        );
                      if (c.state === "error")
                        return (
                          <td
                            key={ex.id}
                            className={cn(
                              cell,
                              "bg-red-500/15 text-red-600 dark:text-red-400",
                            )}
                          >
                            {t("row.down")}
                          </td>
                        );
                      return (
                        <td
                          key={ex.id}
                          className={cn(
                            cell,
                            c.state === "running"
                              ? "bg-muted"
                              : "bg-muted/40 text-muted-foreground",
                          )}
                        >
                          {c.state === "running" ? (
                            <Loader2 className="text-primary mx-auto size-4 animate-spin" />
                          ) : (
                            "—"
                          )}
                        </td>
                      );
                    })}
                    <td className="text-muted-foreground text-center tabular-nums">
                      {row.length ? fmtMbps(avgOf(row.map(score))) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <div className="mb-2 flex flex-wrap items-baseline gap-2 text-sm">
          <b>{t("matrix.bars")}</b>
          <span className="text-muted-foreground text-xs">
            Mbps
            {prevMap ? t("matrix.barsHint") : ""}
          </span>
        </div>
        <GroupedBars run={run} prev={prevMap} />
      </div>

      <div>
        <div className="mb-2 flex flex-wrap items-baseline gap-2 text-sm">
          <b>{t("matrix.curves")}</b>
          <span className="text-muted-foreground text-xs">
            Mbps
            {direction === "bidir" ? t("matrix.curvesHint") : ""}
          </span>
        </div>
        <PairCurves run={run} picked={picked} onPick={setPicked} />
      </div>
    </div>
  );
}

/** 全链路测速的弹窗。一直挂着:关掉弹窗不会中断正在跑的测速,每条链留最近 20 次。 */
export function MatrixSpeedDialog({
  chain,
  onClose,
}: {
  chain: Chain | null;
  onClose: () => void;
}) {
  const { t } = useTranslation("forward");
  const [runs, setRuns] = useState<Run[]>([]);
  const [request, setRequest] = useState<Request>({
    proto: "tcp",
    direction: "up",
    duration: 5,
    rate: 0,
    port: 0,
  });
  const [shownId, setShownId] = useState<"latest" | number>("latest");
  const [compareId, setCompareId] = useState<"none" | number>("none");
  const [counter, setCounter] = useState(0);

  const anyRunning = runs.some((r) => r.state === "running");
  useEffect(() => {
    if (!anyRunning) return;
    const id = window.setInterval(
      () =>
        setRuns((list) =>
          list.map((r) => (r.state === "running" ? advance(r) : r)),
        ),
      TICK_MS,
    );
    return () => window.clearInterval(id);
  }, [anyRunning]);

  const mine = chain ? runs.filter((r) => r.chainId === chain.id) : [];
  const live = mine.find((r) => r.state === "running");
  const shown =
    shownId === "latest"
      ? mine[0]
      : (mine.find((r) => r.id === shownId) ?? mine[0]);
  const prev =
    compareId === "none"
      ? undefined
      : mine.find((r) => r.id === compareId && r.id !== shown?.id);
  const entries = chain?.groups[0].members.length ?? 0;
  const exits =
    chain && chain.groups.length > 1
      ? chain.groups[chain.groups.length - 1].members.length
      : 0;
  const pairs = entries * exits;
  const set = (patch: Partial<Request>) =>
    setRequest((r) => ({ ...r, ...patch }));

  const start = () => {
    if (!chain || pairs === 0) return;
    const id = counter + 1;
    setCounter(id);
    setShownId("latest");
    setRuns((list) => {
      const others = list.filter((r) => r.chainId !== chain.id);
      const own = list.filter((r) => r.chainId === chain.id);
      return [
        planRun(chain, request, id),
        ...own.slice(0, KEEP - 1),
        ...others,
      ];
    });
  };
  // 中止:按编号找那一次(列表里的对象每走一格都会换新的),测到一半的那一对按已有的数算完成
  const stop = () => {
    const id = live?.id;
    setRuns((list) =>
      list.map((r) =>
        r.id !== id
          ? r
          : {
              ...r,
              state: "aborted" as const,
              cells: r.cells.map((c) =>
                c.state === "running" && c.shown > 0
                  ? { ...c, state: "done" as const }
                  : c,
              ),
            },
      ),
    );
  };
  const doneCount = live
    ? live.cells.filter((c) => c.state === "done" || c.state === "error").length
    : 0;
  const field = "flex items-center gap-1.5 text-xs";

  return (
    <Dialog open={chain !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="block max-h-[90vh] overflow-y-auto text-left sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>
            {t("matrix.title")}
            {chain ? ` · ${chain.name}` : ""}
          </DialogTitle>
          <DialogDescription>{t("matrix.desc")}</DialogDescription>
        </DialogHeader>

        <div className="mt-4 flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <label className={field}>
              <span className="text-muted-foreground">{t("matrix.port")}</span>
              <input
                className={cn(SELECT, "w-20 font-mono")}
                inputMode="numeric"
                placeholder={t("matrix.portAuto")}
                value={request.port || ""}
                disabled={!!live}
                onChange={(e) =>
                  set({
                    port: Math.min(
                      65535,
                      Math.max(
                        0,
                        Number(e.target.value.replace(/\D/g, "")) || 0,
                      ),
                    ),
                  })
                }
              />
            </label>
            <label className={field}>
              <span className="text-muted-foreground">{t("matrix.proto")}</span>
              <select
                className={SELECT}
                value={request.proto}
                disabled={!!live}
                onChange={(e) => set({ proto: e.target.value as Proto })}
              >
                <option value="tcp">TCP</option>
                <option value="udp">UDP</option>
              </select>
            </label>
            <label className={field}>
              <span className="text-muted-foreground">
                {t("matrix.direction")}
              </span>
              <select
                className={SELECT}
                value={request.direction}
                disabled={!!live}
                onChange={(e) =>
                  set({ direction: e.target.value as Direction })
                }
              >
                {(["up", "down", "bidir"] as Direction[]).map((d) => (
                  <option key={d} value={d}>
                    {t(`matrix.dir.${d}`)}
                  </option>
                ))}
              </select>
            </label>
            <label className={field}>
              <span className="text-muted-foreground">
                {t("matrix.duration")}
              </span>
              <select
                className={SELECT}
                value={request.duration}
                disabled={!!live}
                onChange={(e) => set({ duration: Number(e.target.value) })}
              >
                {[5, 10, 20].map((n) => (
                  <option key={n} value={n}>
                    {t("matrix.seconds", { n })}
                  </option>
                ))}
              </select>
            </label>
            <label className={field}>
              <span className="text-muted-foreground">
                {t(
                  request.proto === "udp" ? "matrix.rateUdp" : "matrix.rateTcp",
                )}
              </span>
              <select
                className={SELECT}
                value={request.rate}
                disabled={!!live}
                onChange={(e) => set({ rate: Number(e.target.value) })}
              >
                <option value={0}>
                  {request.proto === "udp" ? "100 Mbps" : t("matrix.unlimited")}
                </option>
                {[50, 200, 500, 1000].map((n) => (
                  <option key={n} value={n}>
                    {n} Mbps
                  </option>
                ))}
              </select>
            </label>
            {live ? (
              <>
                <button
                  type="button"
                  className={cn(BTN, BTN_OUTLINE)}
                  onClick={stop}
                >
                  {t("matrix.stop")}
                </button>
                <span className="text-muted-foreground flex items-center gap-2 text-xs">
                  <Loader2 className="size-3.5 animate-spin" />
                  {t("matrix.progress", {
                    k: Math.min(doneCount + 1, live.cells.length),
                    n: live.cells.length,
                  })}
                </span>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className={cn(BTN, BTN_SOLID)}
                  disabled={pairs === 0}
                  onClick={start}
                >
                  <Gauge className="size-3.5" />
                  {t(mine.length ? "matrix.again" : "matrix.start")}
                </button>
                <span className="text-muted-foreground text-xs">
                  {pairs === 0
                    ? t("matrix.noPairs")
                    : t("matrix.plan", {
                        entries,
                        exits,
                        pairs,
                        sec: pairs * request.duration,
                      })}
                </span>
              </>
            )}
          </div>
          <p className="text-muted-foreground -mt-2 text-xs leading-5">
            {t("matrix.note")}
            {chain?.terminus ? ` ${t("matrix.landingNote")}` : ""}
          </p>

          {shown ? (
            <>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t pt-3 text-xs">
                <span className="text-muted-foreground">
                  {shown.at} · {shown.request.proto.toUpperCase()} ·{" "}
                  {t(`matrix.dir.${shown.request.direction}`)} ·{" "}
                  {t("matrix.perPair", { n: shown.request.duration })} ·{" "}
                  {t("matrix.port")} {shown.request.port}
                  {shown.state === "aborted" ? ` · ${t("matrix.aborted")}` : ""}
                </span>
                <div className="flex-1" />
                <select
                  className={SELECT}
                  value={shownId}
                  onChange={(e) =>
                    setShownId(
                      e.target.value === "latest"
                        ? "latest"
                        : Number(e.target.value),
                    )
                  }
                >
                  <option value="latest">{t("matrix.latest")}</option>
                  {mine.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.state === "running" ? t("matrix.live") : r.at}
                    </option>
                  ))}
                </select>
                <select
                  className={SELECT}
                  value={compareId}
                  onChange={(e) =>
                    setCompareId(
                      e.target.value === "none"
                        ? "none"
                        : Number(e.target.value),
                    )
                  }
                >
                  <option value="none">{t("matrix.noCompare")}</option>
                  {mine
                    .filter((r) => r.id !== shown.id && r.state !== "running")
                    .map((r) => (
                      <option key={r.id} value={r.id}>
                        {t("matrix.compare", { at: r.at })}
                      </option>
                    ))}
                </select>
              </div>
              <Results key={shown.id} run={shown} prev={prev} />
            </>
          ) : (
            <div className="text-muted-foreground rounded-lg border border-dashed py-10 text-center text-sm">
              {t("matrix.empty")}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
