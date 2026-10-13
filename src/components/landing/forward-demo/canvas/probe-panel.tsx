import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, RefreshCw, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { pseudoRandom } from "../../overview-demo/data";
import { fmtMs1, msTone } from "./context";
import { landingById, type CDoc, type ProbeResult } from "./model";

// 延迟探测面板:逐跳的延迟 / 丢包 / 抖动,入口到出口各种走法的端到端排名,以及穿链握手。

const SEG = "px-2.5 py-1 text-xs font-semibold";
const ICON_BTN = "hover:bg-muted rounded border p-1.5 disabled:opacity-40";

export function ProbePanel({
  doc,
  result,
  probing,
  ready,
  onRun,
  onClose,
}: {
  doc: CDoc;
  result: ProbeResult | null;
  probing: boolean;
  ready: boolean;
  onRun: (proto: "tcp" | "udp") => void;
  onClose: () => void;
}) {
  const { t } = useTranslation("forward");
  const [proto, setProto] = useState<"tcp" | "udp">(result?.proto ?? "tcp");
  const [shake, setShake] = useState<{ busy: boolean; round: number }>({
    busy: false,
    round: 0,
  });
  const landings = doc.groups.flatMap((g) => g.landings).map(landingById);
  const pick = (p: "tcp" | "udp") => {
    setProto(p);
    if (ready) onRun(p);
  };
  const best = result?.paths[0]?.ms ?? 0;
  // 穿链握手:TLS 握手本身的时间 + 链内往返
  const handshakeTargets = landings.length
    ? landings.map((n) => n.name)
    : [
        t("canvas.probe.handshakeNode", { n: 1 }),
        t("canvas.probe.handshakeNode", { n: 2 }),
      ];
  const runShake = () => {
    setShake((s) => ({ ...s, busy: true }));
    window.setTimeout(
      () => setShake((s) => ({ busy: false, round: s.round + 1 })),
      900,
    );
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <b className="text-base">{t("canvas.probe.title")}</b>
          <div className="text-muted-foreground text-[11px]">
            {probing
              ? t("canvas.probe.running")
              : result
                ? t("canvas.probe.done", {
                    at: result.at,
                    proto: result.proto.toUpperCase(),
                  })
                : t("canvas.probe.idle")}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <div className="flex overflow-hidden rounded border">
            {(["tcp", "udp"] as const).map((p) => (
              <button
                key={p}
                type="button"
                aria-pressed={proto === p}
                disabled={probing}
                onClick={() => pick(p)}
                className={cn(
                  SEG,
                  proto === p
                    ? "bg-foreground text-background"
                    : "hover:bg-muted",
                )}
              >
                {p.toUpperCase()}
              </button>
            ))}
          </div>
          <button
            type="button"
            className={ICON_BTN}
            disabled={probing || !ready}
            onClick={() => onRun(proto)}
            aria-label={t("canvas.probe.again")}
            title={t("canvas.probe.again")}
          >
            {probing ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <RefreshCw className="size-3.5" />
            )}
          </button>
          <button
            type="button"
            className={ICON_BTN}
            onClick={onClose}
            aria-label={t("canvas.probe.close")}
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>

      {!ready && (
        <div className="text-muted-foreground rounded border border-dashed p-3 text-xs">
          {t("canvas.probe.needChain")}
        </div>
      )}

      {result && !probing && (
        <>
          {result.sections.map((s) => (
            <div key={s.index} className="flex flex-col gap-1">
              <b className="text-xs">
                {result.sections.length > 1
                  ? t("canvas.probe.route", { n: s.index + 1 })
                  : t("canvas.probe.trunk")}{" "}
                {s.groups.join(" → ")}
              </b>
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-muted-foreground border-b text-left text-[11px]">
                    <th className="py-1 font-normal">
                      {t("canvas.probe.link")}
                    </th>
                    <th className="py-1 text-right font-normal">
                      {t("canvas.probe.latency")}
                    </th>
                    <th className="py-1 text-right font-normal">
                      {t("canvas.probe.loss")}
                    </th>
                    <th className="py-1 text-right font-normal">
                      {t("canvas.probe.jitter")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {s.rows.map((r, i) => (
                    <tr key={i} className="border-b last:border-b-0">
                      <td className="py-1.5 pr-2">
                        {r.from} → {r.to}
                      </td>
                      <td
                        className={cn(
                          "py-1.5 text-right font-mono font-bold whitespace-nowrap",
                          msTone(r.ms),
                        )}
                      >
                        {r.ms == null ? t("canvas.edge.down") : fmtMs1(r.ms)}
                      </td>
                      <td
                        className={cn(
                          "py-1.5 pl-2 text-right font-mono",
                          r.loss > 0
                            ? "text-amber-700 dark:text-amber-400"
                            : "text-muted-foreground",
                        )}
                      >
                        {r.loss.toFixed(1)}%
                      </td>
                      <td className="text-muted-foreground py-1.5 pl-2 text-right font-mono">
                        {r.ms == null ? "—" : `±${r.jitter.toFixed(1)}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

          <div className="flex flex-col gap-1.5">
            <b className="text-xs">
              {t("canvas.probe.e2e", { count: result.paths.length })}
            </b>
            {result.paths.length === 0 && (
              <span className="text-muted-foreground text-xs">
                {t("canvas.probe.noPath")}
              </span>
            )}
            {result.paths.map((p, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-center gap-2 rounded border px-2 py-1.5 text-xs",
                  i === 0 &&
                    "border-2 border-emerald-700 dark:border-emerald-500",
                )}
              >
                <span
                  className={cn(
                    "shrink-0 rounded-sm px-1.5 py-px text-[11px] font-bold text-white",
                    i === 0
                      ? "bg-emerald-700"
                      : p.branch
                        ? "bg-[#7a5cc0]"
                        : "bg-stone-500",
                  )}
                >
                  {i === 0
                    ? t("canvas.probe.best")
                    : p.branch
                      ? t("canvas.probe.branch")
                      : `#${i + 1}`}
                </span>
                <span className="min-w-0 flex-1">{p.names.join(" → ")}</span>
                <b className="shrink-0 font-mono">{fmtMs1(p.ms)}</b>
              </div>
            ))}
          </div>

          <div className="bg-muted/40 flex flex-col gap-2 rounded border p-3">
            <div className="flex items-center justify-between gap-2">
              <b className="text-xs">{t("canvas.probe.handshake")}</b>
              <button
                type="button"
                disabled={shake.busy || result.paths.length === 0}
                onClick={runShake}
                className="bg-background hover:bg-muted inline-flex h-8 items-center gap-1.5 rounded border px-3 text-xs font-semibold disabled:opacity-50"
              >
                {shake.busy && <Loader2 className="size-3.5 animate-spin" />}
                {t("canvas.probe.handshakeRun")}
              </button>
            </div>
            {shake.round > 0 &&
              !shake.busy &&
              handshakeTargets.map((name, i) => {
                const inner =
                  best * 2 * (1 + pseudoRandom(shake.round * 11 + i) * 0.06);
                const total =
                  inner + 18 + pseudoRandom(shake.round * 5 + i) * 14;
                return (
                  <div
                    key={name}
                    className="bg-background flex items-center gap-2 rounded border px-2 py-1.5 text-xs"
                  >
                    <i className="size-2 shrink-0 rounded-full bg-emerald-600" />
                    <span className="min-w-0 flex-1 truncate">{name}</span>
                    <span className="text-muted-foreground font-mono">
                      {t("canvas.probe.handshakeRow", {
                        ms: fmtMs1(total),
                        inner: fmtMs1(inner),
                      })}
                    </span>
                  </div>
                );
              })}
            <p className="text-muted-foreground text-[11px] leading-4">
              {t("canvas.probe.handshakeHint")}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
