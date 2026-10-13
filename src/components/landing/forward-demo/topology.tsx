import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { formatBytes } from "../overview-demo/data";
import {
  chainColor,
  e2eOf,
  fmtMs,
  onlineOf,
  stopsOf,
  type Chain,
  type Group,
  type LinkState,
} from "./data";
import { STATUS_DOT } from "./styles";

// 网络拓扑:每列一跳(入口 / 中转 / 出口),点是服务器或转发组,线是链 —— 线色 = 链,线宽 = 今日流量。

const NODE_W = 148;
const NODE_H = 44;
const ROW_H = 56;
const PAD_X = 18;
const PAD_TOP = 32;
const MIN_W = 620;

type Mode = "server" | "group";
type GNode = {
  key: string;
  col: number;
  label: string;
  sub: string;
  chains: Set<number>;
  bad?: boolean;
  warn?: boolean;
  terminus?: boolean;
};
type GEdge = {
  from: string;
  to: string;
  chain: number;
  state: LinkState;
  ms?: number;
  /** 选路段里没在用的路 */
  dim?: boolean;
};

function build(
  chains: Chain[],
  mode: Mode,
  onlineText: (online: number, total: number) => string,
  offlineText: string,
  landingText: string,
) {
  // 选路段里路上的中转组,排在选路那一站和下一站之间
  const viaCols = (c: Chain) =>
    c.pathSet ? Math.max(0, ...c.pathSet.paths.map((p) => p.via.length)) : 0;
  const cols = Math.max(
    2,
    ...chains.map((c) => stopsOf(c).length + viaCols(c)),
  );
  const nodes = new Map<string, GNode>();
  const edges: GEdge[] = [];
  const touch = (n: GNode, chain: number) => {
    const had = nodes.get(n.key);
    if (had) had.chains.add(chain);
    else nodes.set(n.key, { ...n, chains: new Set([chain]) });
  };
  type Point = { key: string; online: boolean };
  // 一个组在图上的点:按服务器看是每台一个,按组看是整组一个
  const place = (g: Group, col: number, chain: number): Point[] => {
    if (mode === "group") {
      const online = onlineOf(g);
      const key = `g${g.id}@${col}`;
      touch(
        {
          key,
          col,
          label: g.name,
          sub: onlineText(online, g.members.length),
          chains: new Set(),
          bad: online === 0,
          warn: online > 0 && online < g.members.length,
        },
        chain,
      );
      return [{ key, online: online > 0 }];
    }
    return g.members.map((m) => {
      const key = `s${m.id}@${col}`;
      touch(
        {
          key,
          col,
          label: m.name,
          sub: m.online ? g.name : offlineText,
          chains: new Set(),
          bad: !m.online,
        },
        chain,
      );
      return { key, online: m.online };
    });
  };
  const connect = (
    from: Point[],
    to: Point[],
    chain: number,
    l: { state: LinkState; rtt?: number },
    dim = false,
  ) => {
    for (const a of from)
      for (const b of to)
        edges.push({
          from: a.key,
          to: b.key,
          chain,
          state: a.online && b.online ? l.state : "down",
          ms: a.online && b.online ? l.rtt : undefined,
          dim,
        });
  };
  for (const c of chains) {
    const stops = stopsOf(c);
    const colOf = (i: number) =>
      i === 0
        ? 0
        : i === stops.length - 1
          ? cols - 1
          : i + (c.pathSet && i > c.pathSet.hop ? viaCols(c) : 0);
    const points = stops.map((s, i) => {
      if (s.kind === "group") return place(s.group, colOf(i), c.id);
      const key = `t${c.id}`;
      touch(
        {
          key,
          col: colOf(i),
          label: s.name,
          sub: landingText,
          chains: new Set(),
          terminus: true,
        },
        c.id,
      );
      return [{ key, online: true }];
    });
    for (let i = 0; i < points.length - 1; i++) {
      const ps = c.pathSet?.hop === i ? c.pathSet : undefined;
      if (!ps) {
        connect(points[i], points[i + 1], c.id, c.links[i]);
        continue;
      }
      ps.paths.forEach((p, k) => {
        const seq = [
          points[i],
          ...p.via.map((g, j) => place(g, colOf(i) + 1 + j, c.id)),
          points[i + 1],
        ];
        for (let j = 0; j < seq.length - 1; j++)
          connect(
            seq[j],
            seq[j + 1],
            c.id,
            { state: "ok", rtt: p.rtts[j] },
            k !== ps.active,
          );
      });
    }
  }
  return { nodes: [...nodes.values()], edges, cols };
}

export function ForwardTopology({
  chains,
  focus,
  onFocus,
}: {
  chains: Chain[];
  focus: number | null;
  onFocus: (id: number | null) => void;
}) {
  const { t } = useTranslation("forward");
  const [mode, setMode] = useState<Mode>("server");
  const [showMs, setShowMs] = useState(false);
  const [hover, setHover] = useState<number | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [boxW, setBoxW] = useState(0);

  const { nodes, edges, cols } = useMemo(
    () =>
      build(
        chains,
        mode,
        (online, total) => t("members.online", { online, total }),
        t("topo.offline"),
        t("topo.landing"),
      ),
    [chains, mode, t],
  );

  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setBoxW(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const width = Math.max(boxW, MIN_W);
  const colX = (col: number) =>
    PAD_X + (col * (width - PAD_X * 2 - NODE_W)) / Math.max(cols - 1, 1);
  const byCol = new Map<number, GNode[]>();
  nodes.forEach((n) => byCol.set(n.col, [...(byCol.get(n.col) ?? []), n]));
  const maxRows = Math.max(1, ...[...byCol.values()].map((l) => l.length));
  const height = PAD_TOP + maxRows * ROW_H + 6;
  const pos = new Map<string, { x: number; y: number }>();
  byCol.forEach((list, col) => {
    // 按所在的第一条链排,同一条链的点挨在一起,交叉少
    const order = (n: GNode) =>
      Math.min(
        ...[...n.chains].map((id) => chains.findIndex((c) => c.id === id)),
      );
    list.sort((a, b) => order(a) - order(b) || a.label.localeCompare(b.label));
    const top = PAD_TOP + ((maxRows - list.length) * ROW_H) / 2;
    list.forEach((n, i) =>
      pos.set(n.key, { x: colX(col), y: top + i * ROW_H }),
    );
  });

  const active = hover ?? focus;
  const maxBytes = Math.max(1, ...chains.map((c) => c.todayBytes));
  const edgesPerChain = new Map<number, number>();
  edges.forEach((e) =>
    edgesPerChain.set(e.chain, (edgesPerChain.get(e.chain) ?? 0) + 1),
  );
  const bytesOf = (id: number) =>
    chains.find((c) => c.id === id)?.todayBytes ?? 0;
  const pairIdx = new Map<string, number>();
  const colTitle = (i: number) =>
    i === 0
      ? t("topo.entry")
      : i === cols - 1
        ? t("topo.exit")
        : t("topo.relay", { n: i });
  const pick = (id: number) => onFocus(focus === id ? null : id);
  const toggle = "rounded-md border px-3 py-1.5 text-xs";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex overflow-hidden rounded-md border text-xs">
          {(["server", "group"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              onClick={() => setMode(m)}
              className={cn(
                "px-3 py-1.5",
                mode === m ? "bg-foreground text-background" : "hover:bg-muted",
              )}
            >
              {t(m === "server" ? "topo.byServer" : "topo.byGroup")}
            </button>
          ))}
        </div>
        <button
          type="button"
          aria-pressed={showMs}
          onClick={() => setShowMs(!showMs)}
          className={cn(
            toggle,
            showMs ? "bg-foreground text-background" : "hover:bg-muted",
          )}
        >
          {t(showMs ? "topo.msAll" : "topo.msPick")}
        </button>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div ref={boxRef} className="min-w-0 overflow-x-auto">
          <div
            className="bg-muted/40 relative rounded-lg"
            style={{ width, height }}
          >
            <svg
              width={width}
              height={height}
              className="absolute inset-0"
              fill="none"
            >
              {edges.map((e, i) => {
                const a = pos.get(e.from)!;
                const b = pos.get(e.to)!;
                const pk = `${e.from}>${e.to}`;
                const k = pairIdx.get(pk) ?? 0;
                pairIdx.set(pk, k + 1);
                const x1 = a.x + NODE_W;
                const y1 = a.y + NODE_H / 2 + k * 4;
                const x2 = b.x;
                const y2 = b.y + NODE_H / 2 + k * 4;
                const mx = (x1 + x2) / 2;
                const w =
                  1.2 +
                  (5 * (bytesOf(e.chain) / maxBytes)) /
                    Math.sqrt(edgesPerChain.get(e.chain) ?? 1);
                const down = e.state === "down";
                return (
                  <g
                    key={i}
                    style={{
                      opacity:
                        active !== null && active !== e.chain
                          ? 0.1
                          : e.dim
                            ? 0.5
                            : 0.9,
                      transition: "opacity .2s",
                    }}
                  >
                    <path
                      d={`M ${x1} ${y1} C ${mx} ${y1} ${mx} ${y2} ${x2} ${y2}`}
                      stroke={down ? "#c2452d" : chainColor(e.chain)}
                      strokeWidth={e.dim ? Math.min(w, 1.6) : w}
                      strokeDasharray={
                        down || e.state === "unknown"
                          ? "6 5"
                          : e.dim
                            ? "2 5"
                            : undefined
                      }
                      strokeLinecap="round"
                      onMouseEnter={() => setHover(e.chain)}
                      onMouseLeave={() => setHover(null)}
                      onClick={() => pick(e.chain)}
                      className="cursor-pointer"
                      style={{ pointerEvents: "stroke" }}
                    />
                    {(down || showMs || active === e.chain) &&
                      (down || e.ms != null) && (
                        <text
                          x={mx}
                          y={(y1 + y2) / 2 - 4}
                          textAnchor="middle"
                          className={cn(
                            "text-[10px] tabular-nums",
                            down
                              ? "fill-red-700 dark:fill-red-400"
                              : "fill-muted-foreground",
                          )}
                          style={{
                            paintOrder: "stroke",
                            stroke: "var(--background)",
                            strokeWidth: 3,
                          }}
                        >
                          {down ? t("topo.down") : fmtMs(e.ms)}
                        </text>
                      )}
                  </g>
                );
              })}
            </svg>
            {Array.from({ length: cols }, (_, i) => (
              <span
                key={i}
                className="text-muted-foreground absolute top-2 text-center text-[11px] tracking-wider"
                style={{ left: colX(i), width: NODE_W }}
              >
                {colTitle(i)}
              </span>
            ))}
            {nodes.map((n) => {
              const p = pos.get(n.key)!;
              return (
                <div
                  key={n.key}
                  className={cn(
                    "bg-card absolute flex flex-col justify-center rounded-lg border px-2.5 leading-tight transition-opacity",
                    n.bad &&
                      "border-red-400 bg-red-50 dark:border-red-800 dark:bg-red-950/50",
                    n.warn &&
                      "border-amber-400 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/50",
                    n.terminus &&
                      "bg-foreground text-background border-transparent",
                  )}
                  style={{
                    left: p.x,
                    top: p.y,
                    width: NODE_W,
                    height: NODE_H,
                    opacity:
                      active !== null && !n.chains.has(active) ? 0.25 : 1,
                  }}
                >
                  <b className="truncate text-[12.5px]">{n.label}</b>
                  <span
                    className={cn(
                      "truncate text-[10.5px]",
                      n.terminus
                        ? "opacity-70"
                        : n.bad
                          ? "text-red-700 dark:text-red-400"
                          : "text-muted-foreground",
                    )}
                  >
                    {n.sub}
                  </span>
                  <span className="absolute bottom-1 left-2.5 flex gap-0.5">
                    {[...n.chains].map((id) => (
                      <i
                        key={id}
                        className="h-[3px] w-1.5 rounded-full"
                        style={{ background: chainColor(id) }}
                      />
                    ))}
                  </span>
                  {n.chains.size > 1 && (
                    <span className="bg-foreground text-background absolute -top-2 -right-1 rounded-full px-1.5 text-[10px] leading-4">
                      {t("topo.chainsThrough", { count: n.chains.size })}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 右侧:链的清单,点一条在图上单独看 */}
        <div className="flex flex-col gap-1.5">
          {chains.map((c) => (
            <button
              key={c.id}
              type="button"
              aria-pressed={focus === c.id}
              onClick={() => pick(c.id)}
              onMouseEnter={() => setHover(c.id)}
              onMouseLeave={() => setHover(null)}
              className={cn(
                "bg-card flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs transition",
                focus === c.id ? "ring-foreground ring-2" : "hover:bg-muted",
                active !== null && active !== c.id && "opacity-50",
              )}
            >
              <i
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: chainColor(c.id) }}
              />
              <span className="min-w-0 flex-1 truncate font-semibold">
                {c.name}
              </span>
              <span className="text-muted-foreground tabular-nums">
                {formatBytes(c.todayBytes)}
              </span>
              <span className="w-14 text-right tabular-nums">
                {c.status === "broken" ? t("status.broken") : fmtMs(e2eOf(c))}
              </span>
              <i
                className={cn(
                  "h-2 w-2 shrink-0 rounded-full",
                  STATUS_DOT[c.status],
                )}
              />
            </button>
          ))}
          {chains.length === 0 && (
            <div className="text-muted-foreground py-6 text-center text-xs">
              {t("topo.none")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
