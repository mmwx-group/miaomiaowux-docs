import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import {
  fmtLoss,
  fmtMs,
  onlineOf,
  stopsOf,
  type Chain,
  type Group,
  type Link,
} from "./data";
import { DASH, LINK_BAR, LINK_TEXT } from "./styles";

// 一条链的路线:站点(转发组)用方框,站与站之间的线上写这一跳的延迟和丢包。

function useStrategyText() {
  const { t } = useTranslation("forward");
  return (g: Group) => {
    const s =
      g.members.length <= 1
        ? t("strategy.direct")
        : t(`strategy.${g.strategy}`);
    return g.failover ? `${s} · ${t("strategy.failover")}` : s;
  };
}

function MemberDots({ g }: { g: Group }) {
  const { t } = useTranslation("forward");
  const online = onlineOf(g);
  const total = g.members.length;
  const color =
    online === 0
      ? "text-red-700 dark:text-red-400"
      : online === total
        ? "text-emerald-700 dark:text-emerald-400"
        : "text-amber-700 dark:text-amber-400";
  return (
    <span className={cn("text-xs", color)}>
      {g.members.map((m) => (m.online ? "●" : "○")).join("")}{" "}
      {t("members.online", { online, total })}
    </span>
  );
}

function Station({ g, lanHint }: { g: Group; lanHint: boolean }) {
  const { t } = useTranslation("forward");
  const strategyText = useStrategyText();
  const online = onlineOf(g);
  const bad = online === 0;
  const warn = !bad && online < g.members.length;
  return (
    <div
      className={cn(
        "bg-muted/60 flex w-36 shrink-0 flex-col gap-0.5 rounded-lg border px-3 py-2",
        bad &&
          "border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-950/40",
        warn &&
          "border-amber-300 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40",
      )}
    >
      <span className="text-muted-foreground truncate text-[11px]">
        {t(`role.${g.role}`)} · {strategyText(g)}
      </span>
      <b className="truncate text-lg leading-6">{g.name}</b>
      <MemberDots g={g} />
      {lanHint && (
        <span className="text-[11px] text-emerald-700 dark:text-emerald-400">
          {t("row.viaLan")}
        </span>
      )}
    </div>
  );
}

function Terminus({ name, addr }: { name: string; addr: string }) {
  const { t } = useTranslation("forward");
  return (
    <div className="bg-foreground text-background flex w-40 shrink-0 flex-col gap-0.5 rounded-lg px-3 py-2">
      <span className="text-[11px] opacity-70">{t("topo.landing")}</span>
      <b className="truncate text-sm">{name}</b>
      <span className="truncate text-[11px] tabular-nums opacity-70">
        {addr}
      </span>
    </div>
  );
}

function LinkLine({ l }: { l: Link }) {
  const { t } = useTranslation("forward");
  return (
    <div className="flex w-24 shrink-0 flex-col items-center gap-1 px-2">
      <span className={cn("text-xs tabular-nums", LINK_TEXT[l.state])}>
        {l.state === "down" ? t("row.down") : fmtMs(l.rtt)}
      </span>
      {l.state === "down" || l.state === "unknown" ? (
        <span
          className={cn("w-full border-t-2 border-dashed", DASH[l.state])}
        />
      ) : (
        <span className={cn("h-1 w-full rounded", LINK_BAR[l.state])} />
      )}
      <span
        className={cn(
          "text-[11px]",
          l.state === "degraded" ? LINK_TEXT.degraded : "text-muted-foreground",
        )}
      >
        {l.state === "unknown"
          ? t("row.waiting")
          : l.state === "down"
            ? t("row.keepDown")
            : t("row.loss", { value: fmtLoss(l.loss) })}
      </span>
    </div>
  );
}

/** 选路段那一跳:线上写在用那条路的总延迟,下面写一共几条路、哪条在用。 */
function PathLine({ c }: { c: Chain }) {
  const { t } = useTranslation("forward");
  const ps = c.pathSet!;
  return (
    <div className="flex w-36 shrink-0 flex-col items-center gap-1 px-2">
      <span className="text-xs text-teal-700 tabular-nums dark:text-teal-400">
        {t("path.pick")} · {fmtMs(ps.paths[ps.active].total)}
      </span>
      <span className="h-1 w-full rounded bg-teal-600 dark:bg-teal-400" />
      <span className="text-muted-foreground text-[11px]">
        {t("path.summary", { count: ps.paths.length, n: ps.active + 1 })}
      </span>
    </div>
  );
}

export function ChainRoute({ c }: { c: Chain }) {
  const stops = stopsOf(c);
  return (
    <div className="flex min-w-0 items-center overflow-x-auto py-1">
      {stops.map((s, i) => (
        <Fragment key={i}>
          {s.kind === "group" ? (
            <Station
              g={s.group}
              lanHint={i > 0 && s.group.members.some((m) => m.lan)}
            />
          ) : (
            <Terminus name={s.name} addr={s.addr} />
          )}
          {i < stops.length - 1 &&
            (c.pathSet?.hop === i ? (
              <PathLine c={c} />
            ) : (
              <LinkLine l={c.links[i]} />
            ))}
        </Fragment>
      ))}
    </div>
  );
}

/** 一行文字的路线(紧凑视图 / 窄屏)。 */
export function RouteText({ c, className }: { c: Chain; className?: string }) {
  const { t } = useTranslation("forward");
  const stops = stopsOf(c);
  return (
    <span className={cn("text-xs tabular-nums", className)}>
      {stops.map((s, i) => {
        const bad = s.kind === "group" && onlineOf(s.group) === 0;
        const l = c.links[i];
        return (
          <Fragment key={i}>
            <span className={cn(bad && "text-red-700 dark:text-red-400")}>
              {s.kind === "group" ? s.group.name : s.name}
            </span>
            {l && c.pathSet?.hop === i && (
              <span className="mx-1 text-teal-700 dark:text-teal-400">
                ─{t("path.pick")} {Math.round(l.rtt ?? 0)}─
              </span>
            )}
            {l && c.pathSet?.hop !== i && (
              <span className={cn("mx-1", LINK_TEXT[l.state])}>
                {l.state === "down"
                  ? "┄✕┄"
                  : l.state === "unknown"
                    ? "┄┄"
                    : `─${Math.round(l.rtt ?? 0)}─`}
              </span>
            )}
          </Fragment>
        );
      })}
    </span>
  );
}

/** 端到端延迟按跳拆开的条:每段的长度 = 这一跳的延迟。 */
export function E2EBar({ c }: { c: Chain }) {
  if (c.links.every((l) => l.state === "unknown"))
    return <div className="bg-muted h-1.5 rounded" />;
  return (
    <div className="flex h-1.5 gap-0.5">
      {c.links.map((l, i) =>
        l.state === "down" || l.state === "unknown" ? (
          <span
            key={i}
            className={cn(
              "mt-0.5 flex-1 border-t-2 border-dashed",
              DASH[l.state],
            )}
          />
        ) : (
          <span
            key={i}
            className={cn("rounded", LINK_BAR[l.state])}
            style={{ flex: Math.max(l.rtt ?? 1, 1) }}
          />
        ),
      )}
    </div>
  );
}
