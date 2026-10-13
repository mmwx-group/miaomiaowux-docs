import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { pseudoRandom } from "../../overview-demo/data";
import {
  baseRtt,
  iperfSecond,
  landingById,
  LANDINGS,
  serverById,
  SERVERS,
  type Analysis,
  type CDoc,
  type IperfOptions,
} from "./model";

// iperf3 测速面板:选两端与参数,模拟「准备 → 接收端起服务 → 打流 → 完成」,逐秒画吞吐曲线。
// 演示里一秒钟的数据约 0.3 秒就出一格,不用真等十秒。

type Mode = "servers" | "proxy";
type Phase = "prepare" | "server" | "running" | "done";
type Sample = { mbps: number; rx: number };
type Job = {
  mode: Mode;
  label: string;
  options: IperfOptions;
  phase: Phase;
  samples: Sample[];
  shown: number;
  rtt: number;
  seed: number;
};
type Past = {
  key: number;
  at: string;
  label: string;
  mode: Mode;
  proto: string;
  direction: string;
  mbps: number;
};

const TICK_MS = 300;
const DOWN_COLOR = "#2f4b7c";
const SELECT =
  "bg-background h-8 w-full rounded border px-2 text-xs disabled:opacity-60";
const avgOf = (list: number[]) =>
  list.length ? list.reduce((a, v) => a + v, 0) / list.length : 0;

function Chart({
  samples,
  duration,
  bidir,
}: {
  samples: Sample[];
  duration: number;
  bidir: boolean;
}) {
  const w = 300;
  const h = 96;
  const max =
    Math.max(1, ...samples.flatMap((s) => [s.mbps, bidir ? s.rx : 0])) * 1.15;
  const line = (pick: (s: Sample) => number) =>
    samples
      .map(
        (s, i) =>
          `${i ? "L" : "M"}${((i / Math.max(duration - 1, 1)) * w).toFixed(1)} ${(h - (pick(s) / max) * (h - 6)).toFixed(1)}`,
      )
      .join(" ");
  const up = line((s) => s.mbps);
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className="bg-muted/40 h-24 w-full rounded"
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
      {samples.length > 1 && (
        <>
          <path
            d={`${up} L${(((samples.length - 1) / Math.max(duration - 1, 1)) * w).toFixed(1)} ${h} L0 ${h} Z`}
            fill="var(--primary)"
            fillOpacity={0.14}
          />
          <path
            d={up}
            fill="none"
            stroke="var(--primary)"
            strokeWidth={2}
            vectorEffect="non-scaling-stroke"
          />
          {bidir && (
            <path
              d={line((s) => s.rx)}
              fill="none"
              stroke={DOWN_COLOR}
              strokeWidth={2}
              strokeDasharray="5 3"
              vectorEffect="non-scaling-stroke"
            />
          )}
        </>
      )}
    </svg>
  );
}

export function IperfPanel({
  doc,
  analysis,
  onClose,
}: {
  doc: CDoc;
  analysis: Analysis;
  onClose: () => void;
}) {
  const { t } = useTranslation("forward");
  const first = (gid?: string) =>
    doc.groups
      .find((g) => g.id === gid)
      ?.members.find((id) => serverById(id).online);
  const exitGroup =
    analysis.trunk.length > 1
      ? analysis.trunk[analysis.trunk.length - 1]
      : undefined;
  const [mode, setMode] = useState<Mode>("servers");
  const [from, setFrom] = useState<number>(first(analysis.trunk[0]) ?? 1);
  const [to, setTo] = useState<number>(first(exitGroup) ?? 7);
  const [target, setTarget] = useState<number>(
    doc.groups.flatMap((g) => g.landings)[0] ?? LANDINGS[0].id,
  );
  const [options, setOptions] = useState<IperfOptions>({
    proto: "tcp",
    direction: "up",
    parallel: 4,
    duration: 10,
    bitrate: 100,
  });
  const [job, setJob] = useState<Job | null>(null);
  const [history, setHistory] = useState<Past[]>([]);
  const timers = useRef<number[]>([]);
  const runs = useRef(0);
  useEffect(() => {
    const list = timers.current;
    return () => list.forEach((id) => window.clearTimeout(id));
  }, []);

  const running = job != null && job.phase !== "done";
  const set = (patch: Partial<IperfOptions>) =>
    setOptions((o) => ({ ...o, ...patch }));
  const seg = <T extends string>(
    value: T,
    items: Array<[T, string]>,
    onPick: (v: T) => void,
  ) => (
    <div className="flex overflow-hidden rounded border">
      {items.map(([k, label]) => (
        <button
          key={k}
          type="button"
          aria-pressed={value === k}
          disabled={running}
          onClick={() => onPick(k)}
          className={cn(
            "flex-1 px-1.5 py-1.5 text-xs whitespace-nowrap disabled:opacity-60",
            value === k
              ? "bg-foreground text-background font-semibold"
              : "hover:bg-muted",
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
  const later = (fn: () => void, ms: number) =>
    timers.current.push(window.setTimeout(fn, ms));

  const start = () => {
    const seed = ++runs.current;
    const a = serverById(from);
    const b = mode === "proxy" ? landingById(target) : serverById(to);
    const o: IperfOptions =
      mode === "proxy"
        ? { ...options, proto: "tcp", direction: "down" }
        : options;
    const samples = Array.from({ length: o.duration }, (_, sec) => {
      const s = iperfSecond(a, b, o, sec, seed);
      return mode === "proxy" ? { mbps: s.mbps * 0.85, rx: 0 } : s;
    });
    const label = `${a.name} → ${b.name}`;
    setJob({
      mode,
      label,
      options: o,
      phase: "prepare",
      samples,
      shown: 0,
      rtt: baseRtt(a, b),
      seed,
    });
    later(() => setJob((j) => j && { ...j, phase: "server" }), 500);
    later(() => setJob((j) => j && { ...j, phase: "running" }), 1100);
    for (let i = 1; i <= o.duration; i++)
      later(() => setJob((j) => j && { ...j, shown: i }), 1100 + i * TICK_MS);
    later(
      () => {
        setJob((j) => j && { ...j, phase: "done" });
        setHistory((h) =>
          [
            {
              key: seed,
              at: new Date().toTimeString().slice(0, 8),
              label,
              mode,
              proto: o.proto.toUpperCase(),
              direction: o.direction,
              mbps: avgOf(samples.map((s) => s.mbps)),
            },
            ...h,
          ].slice(0, 6),
        );
      },
      1100 + o.duration * TICK_MS + 250,
    );
  };

  const shown = job ? job.samples.slice(0, job.shown) : [];
  const last = shown[shown.length - 1];
  const avg = avgOf(shown.map((s) => s.mbps));
  const peak = Math.max(0, ...shown.map((s) => s.mbps));
  const done = job?.phase === "done";
  const stat = (label: string, value: string) => (
    <div className="flex flex-col">
      {label}
      <span className="text-foreground font-mono text-sm">{value}</span>
    </div>
  );
  const dirLabel: Record<IperfOptions["direction"], string> = {
    up: t("canvas.iperf.up"),
    down: t("canvas.iperf.down"),
    bidir: t("canvas.iperf.bidir"),
  };
  const serverOptions = SERVERS.map((s) => (
    <option key={s.id} value={s.id} disabled={!s.online}>
      {s.name}
      {s.online ? "" : ` (${t("topo.offline")})`}
    </option>
  ));

  return (
    <div className="flex flex-col gap-3.5 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <b className="text-base">{t("canvas.iperf.title")}</b>
          <div className="text-muted-foreground text-[11px] leading-4">
            {t(
              mode === "proxy"
                ? "canvas.iperf.subProxy"
                : "canvas.iperf.subServers",
            )}
          </div>
        </div>
        <button
          type="button"
          className="hover:bg-muted shrink-0 rounded border p-1.5"
          onClick={onClose}
          aria-label={t("canvas.probe.close")}
        >
          <X className="size-3.5" />
        </button>
      </div>

      {seg(
        mode,
        [
          ["servers", t("canvas.iperf.modeServers")],
          ["proxy", t("canvas.iperf.modeProxy")],
        ],
        setMode,
      )}

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-xs">
          {t(mode === "proxy" ? "canvas.iperf.proxyFrom" : "canvas.iperf.from")}
          <select
            className={SELECT}
            value={from}
            disabled={running}
            onChange={(e) => setFrom(Number(e.target.value))}
          >
            {serverOptions}
          </select>
        </label>
        {mode === "proxy" ? (
          <label className="flex flex-col gap-1 text-xs">
            {t("canvas.iperf.proxyTo")}
            <select
              className={SELECT}
              value={target}
              disabled={running}
              onChange={(e) => setTarget(Number(e.target.value))}
            >
              {LANDINGS.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <label className="flex flex-col gap-1 text-xs">
            {t("canvas.iperf.to")}
            <select
              className={SELECT}
              value={to}
              disabled={running}
              onChange={(e) => setTo(Number(e.target.value))}
            >
              {serverOptions}
            </select>
          </label>
        )}
      </div>

      {mode === "servers" && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1 text-xs">
              {t("canvas.iperf.direction")}
              {seg(
                options.direction,
                [
                  ["up", dirLabel.up],
                  ["down", dirLabel.down],
                  ["bidir", dirLabel.bidir],
                ],
                (direction) => set({ direction }),
              )}
            </div>
            <div className="flex flex-col gap-1 text-xs">
              {t("canvas.iperf.proto")}
              {seg(
                options.proto,
                [
                  ["tcp", "TCP"],
                  ["udp", "UDP"],
                ],
                (proto) => set({ proto }),
              )}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <label className="flex flex-col gap-1 text-xs">
              {t("canvas.iperf.parallel")}
              <Input
                type="number"
                min={1}
                max={16}
                className="h-8 font-mono"
                value={options.parallel}
                disabled={running}
                onChange={(e) =>
                  set({
                    parallel: Math.min(
                      16,
                      Math.max(1, Number(e.target.value) || 1),
                    ),
                  })
                }
              />
            </label>
            <label className="flex flex-col gap-1 text-xs">
              {t("canvas.iperf.duration")}
              <Input
                type="number"
                min={3}
                max={60}
                className="h-8 font-mono"
                value={options.duration}
                disabled={running}
                onChange={(e) =>
                  set({
                    duration: Math.min(
                      60,
                      Math.max(3, Number(e.target.value) || 10),
                    ),
                  })
                }
              />
            </label>
            <label className="flex flex-col gap-1 text-xs">
              {t("canvas.iperf.bitrate")}
              <Input
                type="number"
                min={1}
                className="h-8 font-mono"
                value={options.bitrate}
                disabled={running || options.proto !== "udp"}
                onChange={(e) =>
                  set({ bitrate: Math.max(1, Number(e.target.value) || 100) })
                }
              />
            </label>
          </div>
        </>
      )}

      <button
        type="button"
        onClick={start}
        disabled={running || (mode === "servers" && from === to)}
        className="bg-primary text-primary-foreground inline-flex h-9 items-center justify-center gap-1.5 rounded text-sm font-semibold hover:opacity-90 disabled:opacity-50"
      >
        {running && <Loader2 className="size-4 animate-spin" />}
        {t("canvas.iperf.start")}
      </button>

      {job && (
        <div className="flex flex-col gap-2 rounded border p-3">
          <div className="text-muted-foreground truncate text-[11px]">
            {job.label}
          </div>
          <div className="flex items-baseline gap-2">
            <b className="text-primary font-mono text-2xl">
              {Math.round(done ? avg : (last?.mbps ?? 0))}
            </b>
            <span className="text-muted-foreground text-xs">Mbps</span>
            {job.mode === "servers" && job.options.direction === "bidir" && (
              <span className="font-mono text-sm" style={{ color: DOWN_COLOR }}>
                ↓{" "}
                {Math.round(
                  done ? avgOf(shown.map((s) => s.rx)) : (last?.rx ?? 0),
                )}
              </span>
            )}
            <span className="text-muted-foreground ml-auto text-xs">
              {job.phase === "running"
                ? t("canvas.iperf.phase.running", {
                    t: job.shown,
                    total: job.options.duration,
                  })
                : t(`canvas.iperf.phase.${job.phase}`)}
            </span>
          </div>
          <Chart
            samples={shown}
            duration={job.options.duration}
            bidir={job.mode === "servers" && job.options.direction === "bidir"}
          />
          <div className="text-muted-foreground grid grid-cols-4 gap-2 text-[11px]">
            {stat(
              t("canvas.iperf.avg"),
              shown.length ? String(Math.round(avg)) : "—",
            )}
            {stat(
              t("canvas.iperf.peak"),
              shown.length ? String(Math.round(peak)) : "—",
            )}
            {job.mode === "proxy" ? (
              <>
                {stat(
                  t("canvas.iperf.bytes"),
                  done
                    ? `${Math.round((avg * job.options.duration) / 8)} MB`
                    : "—",
                )}
                {stat(
                  t("canvas.iperf.firstByte"),
                  done ? `${Math.round(job.rtt * 2 + 40)}ms` : "—",
                )}
              </>
            ) : job.options.proto === "tcp" ? (
              <>
                {stat(
                  t("canvas.iperf.retrans"),
                  done
                    ? String(
                        Math.round(pseudoRandom(job.seed * 3) * job.rtt * 0.4),
                      )
                    : "—",
                )}
                {stat(
                  t("canvas.iperf.sender"),
                  done ? String(Math.round(avg * 1.02)) : "—",
                )}
              </>
            ) : (
              <>
                {stat(
                  t("canvas.iperf.lossPct"),
                  done
                    ? `${(pseudoRandom(job.seed * 5) * 0.8).toFixed(2)}%`
                    : "—",
                )}
                {stat(
                  t("canvas.iperf.jitter"),
                  done
                    ? `${(0.2 + pseudoRandom(job.seed * 9) * 1.5).toFixed(2)}ms`
                    : "—",
                )}
              </>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-1">
        <span className="text-xs font-bold">{t("canvas.iperf.history")}</span>
        {history.length === 0 && (
          <span className="text-muted-foreground text-xs">
            {t("canvas.iperf.noHistory")}
          </span>
        )}
        {history.map((h) => (
          <div
            key={h.key}
            className="flex items-center gap-2 rounded border px-2 py-1.5 text-xs"
          >
            <span className="text-muted-foreground shrink-0 font-mono text-[11px]">
              {h.at}
            </span>
            <span className="min-w-0 flex-1 truncate">{h.label}</span>
            <span className="text-muted-foreground shrink-0 text-[11px]">
              {h.mode === "proxy"
                ? t("canvas.iperf.viaNode")
                : `${h.proto} · ${dirLabel[h.direction as IperfOptions["direction"]]}`}
            </span>
            <b className="shrink-0 font-mono">{Math.round(h.mbps)} Mbps</b>
          </div>
        ))}
      </div>

      <p className="text-muted-foreground text-[11px] leading-4">
        {t(
          mode === "proxy"
            ? "canvas.iperf.noteProxy"
            : "canvas.iperf.noteServers",
        )}
      </p>
    </div>
  );
}
