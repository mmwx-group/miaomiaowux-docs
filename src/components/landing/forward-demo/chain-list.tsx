import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { formatBytes, formatSpeed } from "../overview-demo/data";
import { ChainRoute, E2EBar, RouteText } from "./chain-route";
import {
  e2eOf,
  fmtAvail,
  fmtLoss,
  fmtMs,
  lossOf,
  stopsOf,
  type Chain,
} from "./data";
import { MiniStatusBar, Sparkline, Tag } from "./parts";
import {
  BTN,
  BTN_OUTLINE,
  BTN_SOLID,
  STATUS_BORDER,
  STATUS_DOT,
  STATUS_TAG,
} from "./styles";

// 链列表:「路线」视图每条链一张卡片(名称与标签 / 路线 / 指标),「紧凑」视图是一张表。

function useChainText() {
  const { t } = useTranslation("forward");
  return {
    since: (min?: number) =>
      min == null ? "" : ` · ${t("duration.min", { count: min })}`,
    e2e: (c: Chain) =>
      c.status === "broken"
        ? t("status.broken")
        : c.status === "pending"
          ? t("status.pending")
          : fmtMs(e2eOf(c)),
    e2eColor: (c: Chain) =>
      c.status === "broken"
        ? "text-red-700 dark:text-red-400"
        : c.status === "degraded"
          ? "text-amber-700 dark:text-amber-400"
          : "",
  };
}

const availTone = (v?: number) =>
  v == null
    ? ""
    : v >= 99.5
      ? "text-emerald-700 dark:text-emerald-400"
      : v >= 95
        ? "text-amber-700 dark:text-amber-400"
        : "text-red-700 dark:text-red-400";
const trendTone = (c: Chain) =>
  c.status === "degraded"
    ? "text-amber-600"
    : c.status === "broken"
      ? "text-red-600"
      : "text-emerald-600";

export function ChainRow({
  c,
  highlighted,
  expanded,
  onToggle,
  onPush,
  onCanvas,
}: {
  c: Chain;
  highlighted: boolean;
  expanded: boolean;
  onToggle: () => void;
  onPush: () => void;
  onCanvas: () => void;
}) {
  const { t } = useTranslation("forward");
  const text = useChainText();
  const stops = stopsOf(c);
  const rtts = c.links
    .filter((l) => l.rtt != null)
    .map((l) => Math.round(l.rtt!));
  return (
    <div
      className={cn(
        "bg-card overflow-hidden rounded-2xl border",
        STATUS_BORDER[c.status],
        highlighted && "ring-primary ring-2",
      )}
    >
      <div className="flex flex-wrap">
        {/* 左:名称与标签 */}
        <div className="flex flex-[1_1_220px] flex-col gap-2 border-b px-5 py-4 md:border-r md:border-b-0">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "h-2.5 w-2.5 shrink-0 rounded-full",
                STATUS_DOT[c.status],
              )}
            />
            <span className="truncate font-semibold">{c.name}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Tag className={STATUS_TAG[c.status]}>
              {t(`status.${c.status}`)}
              {c.status !== "healthy" ? text.since(c.sinceMin) : ""}
            </Tag>
            <Tag className="tabular-nums">{c.engine}</Tag>
            {c.sticky && <Tag>{t("tag.sticky")}</Tag>}
            {c.clientIp && <Tag>{t("tag.clientIp")}</Tag>}
            {c.pathSet && <Tag>{t("path.title")}</Tag>}
            {c.terminus && <Tag>{t("tag.landing")}</Tag>}
          </div>
          <div className="text-muted-foreground text-xs leading-5 tabular-nums">
            {t("row.port", { range: `${c.portStart}–${c.portEnd}` })}
            {c.domain && (
              <>
                <br />
                {c.domain}
              </>
            )}
          </div>
          <div className="text-muted-foreground text-xs tabular-nums">
            {t("row.nodes", { count: c.nodes })} ·{" "}
            {t("row.conns", { count: c.conns })}
            {c.speedDown + c.speedUp > 0
              ? ` · ↓${formatSpeed(c.speedDown)} ↑${formatSpeed(c.speedUp)}`
              : ""}
          </div>
        </div>

        {/* 中:路线 */}
        <div className="flex min-w-0 flex-[999_1_520px] items-center px-5 py-4">
          <div className="hidden min-w-0 md:block">
            <ChainRoute c={c} />
          </div>
          <RouteText c={c} className="md:hidden" />
        </div>

        {/* 右:指标与操作 */}
        <div className="bg-muted/30 flex flex-[1_1_240px] flex-col gap-2.5 border-t px-5 py-4 md:border-t-0 md:border-l">
          <div className="flex items-baseline justify-between">
            <span className="text-muted-foreground text-xs">
              {t("row.e2e")}
            </span>
            <b className={cn("text-2xl tabular-nums", text.e2eColor(c))}>
              {text.e2e(c)}
            </b>
          </div>
          <E2EBar c={c} />
          <div className="text-muted-foreground flex justify-between text-[11px] tabular-nums">
            <span>{rtts.length ? `${rtts.join(" + ")} ms` : "—"}</span>
            <span>{t("row.loss", { value: fmtLoss(lossOf(c)) })}</span>
          </div>
          {c.cells && (
            <div className="flex flex-col gap-1">
              <div className="text-muted-foreground flex items-baseline justify-between text-xs">
                <span>{t("row.avail")}</span>
                <b className={cn("tabular-nums", availTone(c.availability))}>
                  {fmtAvail(c.availability)}
                </b>
              </div>
              <MiniStatusBar cells={c.cells} />
            </div>
          )}
          <div className="text-muted-foreground flex items-center justify-between text-xs">
            <span>
              {t("row.today")}{" "}
              <b className="text-foreground tabular-nums">
                {formatBytes(c.todayBytes)}
              </b>
            </span>
            <Sparkline values={c.trend} className={trendTone(c)} />
          </div>
          <div className="flex gap-2">
            {c.status === "pending" && (
              <button
                type="button"
                className={cn(BTN, BTN_SOLID, "flex-1")}
                onClick={onPush}
              >
                {t("alerts.push")}
              </button>
            )}
            <button
              type="button"
              className={cn(BTN, BTN_OUTLINE, "flex-1")}
              aria-expanded={expanded}
              onClick={onToggle}
            >
              {t("row.detail")}
              <ChevronDown
                className={cn(
                  "size-4 transition-transform duration-300",
                  expanded && "rotate-180",
                )}
              />
            </button>
            <button
              type="button"
              className={cn(BTN, BTN_OUTLINE, "flex-1")}
              onClick={onCanvas}
            >
              {t("canvas.open")}
            </button>
          </div>
        </div>
      </div>

      {/* 展开:各台成员到下一组的延迟 */}
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-out",
          expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
        inert={!expanded}
      >
        <div className="overflow-hidden">
          <div className="bg-muted/40 flex flex-col gap-2 border-t px-5 py-4">
            <span className="text-muted-foreground text-xs">
              {t("row.memberLatency")}
            </span>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {stops.map((s, gi) => {
                const l = c.links[gi];
                if (s.kind !== "group" || !l) return null;
                return (
                  <div
                    key={gi}
                    className="bg-card flex flex-col gap-1.5 rounded-lg border p-3"
                  >
                    <b>{s.group.name}</b>
                    {s.group.members.map((m, mi) => (
                      <div
                        key={m.id}
                        className="flex items-center gap-2 text-xs"
                      >
                        <span
                          className={cn(
                            "h-2 w-2 rounded-full",
                            m.online
                              ? "bg-emerald-600"
                              : "border border-red-600",
                          )}
                        />
                        <span className="truncate tabular-nums">{m.name}</span>
                        {m.lan && gi > 0 && (
                          <span className="text-emerald-700 dark:text-emerald-400">
                            {t("row.lan")}
                          </span>
                        )}
                        <span
                          className={cn(
                            "ml-auto tabular-nums",
                            !m.online || l.state === "down"
                              ? "text-red-700 dark:text-red-400"
                              : "text-muted-foreground",
                          )}
                        >
                          {!m.online || l.state === "down"
                            ? t("row.down")
                            : l.rtt == null
                              ? "—"
                              : `→ ${fmtMs(l.rtt + mi * 3)}`}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
            {c.pathSet && (
              <>
                <span className="text-muted-foreground mt-2 text-xs">
                  {t("path.title")} · {t("path.hint")}
                </span>
                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                  {c.pathSet.paths.map((p, k) => (
                    <div
                      key={k}
                      className={cn(
                        "bg-card flex items-center gap-2 rounded-lg border px-3 py-2 text-sm",
                        k === c.pathSet!.active &&
                          "border-teal-600 dark:border-teal-500",
                      )}
                    >
                      {k === c.pathSet!.active && (
                        <Tag className={STATUS_TAG.healthy}>
                          {t("path.active")}
                        </Tag>
                      )}
                      <span className="min-w-0 flex-1 truncate">
                        {t("path.item", { n: k + 1 })} ·{" "}
                        {p.via.length
                          ? t("path.via", {
                              names: p.via.map((g) => g.name).join(" → "),
                            })
                          : t("path.direct")}
                      </span>
                      <b className="tabular-nums">{fmtMs(p.total)}</b>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CompactTable({
  chains,
  onPush,
}: {
  chains: Chain[];
  onPush: (id: number) => void;
}) {
  const { t } = useTranslation("forward");
  const text = useChainText();
  const th = "px-3 py-2 font-medium whitespace-nowrap";
  const td = "px-3 py-2.5 whitespace-nowrap";
  return (
    <div className="bg-card overflow-x-auto rounded-2xl border">
      <table className="w-full min-w-[820px] text-sm">
        <thead>
          <tr className="text-muted-foreground border-b text-left text-xs">
            <th className={th}>{t("compact.status")}</th>
            <th className={th}>{t("compact.chain")}</th>
            <th className={th}>{t("compact.route")}</th>
            <th className={cn(th, "text-right")}>{t("row.e2e")}</th>
            <th className={cn(th, "text-right")}>{t("compact.loss")}</th>
            <th className={cn(th, "text-right")}>{t("compact.avail")}</th>
            <th className={cn(th, "text-right")}>{t("row.today")}</th>
            <th className={cn(th, "text-right")}>{t("compact.conns")}</th>
          </tr>
        </thead>
        <tbody>
          {chains.map((c) => (
            <tr key={c.id} className="border-b last:border-b-0">
              <td className={td}>
                <Tag className={STATUS_TAG[c.status]}>
                  {t(`status.${c.status}`)}
                </Tag>
              </td>
              <td className={cn(td, "font-semibold")}>{c.name}</td>
              <td className={td}>
                <RouteText c={c} />
              </td>
              <td
                className={cn(
                  td,
                  "text-right font-semibold tabular-nums",
                  text.e2eColor(c),
                )}
              >
                {c.status === "pending" ? (
                  <button
                    type="button"
                    className={cn(BTN, BTN_SOLID, "h-7")}
                    onClick={() => onPush(c.id)}
                  >
                    {t("alerts.push")}
                  </button>
                ) : (
                  text.e2e(c)
                )}
              </td>
              <td className={cn(td, "text-right tabular-nums")}>
                {fmtLoss(lossOf(c))}
              </td>
              <td
                className={cn(
                  td,
                  "text-right tabular-nums",
                  availTone(c.availability),
                )}
              >
                {fmtAvail(c.availability)}
              </td>
              <td className={cn(td, "text-right tabular-nums")}>
                {formatBytes(c.todayBytes)}
              </td>
              <td className={cn(td, "text-right tabular-nums")}>{c.conns}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
