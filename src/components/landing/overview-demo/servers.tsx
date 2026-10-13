import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import {
  buildRenewals,
  CNY_RATE,
  currencySymbol,
  formatBytes,
  formatSpeed,
  priceText,
  renewalMonths,
  runOutDate,
  serverOf,
  serverSpeedAt,
  type Model,
  type ServerRow,
  type TimeRange,
} from "./data";
import { tooltipStyle, useChartColors } from "./chart-colors";
import { RenewalSummary, RenewalTimeline } from "./renewal";
import {
  Chip,
  FilterChips,
  KpiTile,
  OnlineDot,
  QuotaBar,
  QuotaLegend,
  Section,
  Sparkline,
} from "./parts";

// 「服务器」视图:五个指标、配额消耗图、续费日历、服务器卡片(可筛选 / 排序)。

type FilterKey = "all" | "offline" | "tight" | "unlimited" | "expiring";
type SortKey = "default" | "speed" | "quota" | "conns" | "name";

const tight = (s: ServerRow) => s.state === "crit" || s.state === "warn";
const FILTERS: Record<FilterKey, (s: ServerRow) => boolean> = {
  all: () => true,
  offline: (s) => !s.online,
  tight,
  unlimited: (s) => s.limit <= 0,
  expiring: (s) => s.expires != null && s.expires <= 30,
};
const SORTS: Record<
  Exclude<SortKey, "default">,
  (a: ServerRow, b: ServerRow) => number
> = {
  speed: (a, b) => b.download + b.upload - a.download - a.upload,
  quota: (a, b) =>
    (b.limit > 0 ? b.cycleUsed / b.limit : -1) -
    (a.limit > 0 ? a.cycleUsed / a.limit : -1),
  conns: (a, b) => b.conns - a.conns,
  name: (a, b) => a.name.localeCompare(b.name),
};
const HISTORY = 24;

export function ServersView({
  range,
  model,
  tick,
}: {
  range: TimeRange;
  model: Model;
  tick: number;
}) {
  const { t } = useTranslation("overview");
  const colors = useChartColors();
  const { servers } = model;
  const [filter, setFilter] = useState<FilterKey>("all");
  const [sort, setSort] = useState<SortKey>("default");
  const rangeLabel = t(`timeRange.${range}`);
  const counts = (k: FilterKey) => servers.filter(FILTERS[k]).length;

  const shown = useMemo(() => {
    const list = servers.filter(FILTERS[filter]);
    return sort === "default" ? list : [...list].sort(SORTS[sort]);
  }, [servers, filter, sort]);

  const limited = servers.filter((s) => s.limit > 0);
  const burn = limited.map((s) => ({
    name: s.name,
    x: Math.round(s.progress * 100),
    y: Math.round((s.cycleUsed / s.limit) * 100),
    state: s.state,
    runOut: runOutDate(s),
  }));
  const stateColor = {
    ok: colors.ok,
    warn: colors.warn,
    crit: colors.crit,
    unlimited: colors.muted,
  };
  // 60 天内的每一次续费,以及本月 / 下月要付的
  const renewals = useMemo(() => buildRenewals(servers), [servers]);
  const months = useMemo(() => renewalMonths(servers), [servers]);
  // 30 天内要续的合计:按币种分别加,有外币时再补一个折合人民币的总数
  const due30 = useMemo(() => {
    const due = renewals.filter((r) => r.days >= 0 && r.days <= 30 && r.price);
    const by = new Map<string, number>();
    for (const r of due)
      by.set(
        currencySymbol(r.currency),
        (by.get(currencySymbol(r.currency)) ?? 0) + r.price,
      );
    const text = [...by.entries()]
      .map(([sym, v]) => `${sym}${Math.round(v * 100) / 100}`)
      .join(" + ");
    const foreign = due.some((r) => r.currency === "USD");
    const total = due.reduce(
      (a, r) => a + r.price * CNY_RATE[r.currency ?? "CNY"],
      0,
    );
    return foreign ? `${text} ≈ ¥${Math.round(total * 100) / 100}` : text;
  }, [renewals]);
  const totalDown = servers.reduce((a, s) => a + s.download, 0);
  const totalUp = servers.reduce((a, s) => a + s.upload, 0);
  const axis = {
    tickLine: false,
    axisLine: false,
    stroke: colors.muted,
    fontSize: 11,
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-5 max-xl:[&>:last-child:nth-child(odd)]:col-span-2">
        <KpiTile
          label={t("overview.servers.kpiOnline")}
          value={servers.filter((s) => s.online).length}
          unit={`/ ${servers.length}`}
          foot={t("overview.servers.kpiUnlimited", {
            count: counts("unlimited"),
          })}
        />
        <KpiTile
          label={t("overview.servers.kpiSpeed")}
          value={`↓ ${formatSpeed(totalDown)}`}
          foot={`↑ ${formatSpeed(totalUp)}`}
          spark={Array.from({ length: HISTORY }, (_, i) =>
            servers.reduce(
              (a, s) =>
                a + serverSpeedAt(serverOf(s.id), tick - HISTORY + 1 + i).down,
              0,
            ),
          )}
          sparkColor={colors.down}
        />
        <KpiTile
          label={t("overview.kpi.periodUsed", { range: rangeLabel })}
          value={formatBytes(servers.reduce((a, s) => a + s.periodUsed, 0))}
          foot={t("overview.kpi.periodUsedFoot", { count: servers.length })}
        />
        <KpiTile
          label={t("overview.servers.kpiTight")}
          value={servers.filter((s) => s.state === "crit").length}
          unit={t("overview.servers.kpiTightUnit")}
          foot={t("overview.servers.kpiTightFoot", {
            count: servers.filter((s) => s.state === "warn").length,
          })}
        />
        <KpiTile
          label={t("overview.servers.kpiConns")}
          value={servers.reduce((a, s) => a + s.conns, 0).toLocaleString()}
          foot={
            due30
              ? t("overview.servers.kpiRenewal", { amount: due30 })
              : t("overview.servers.kpiNoRenewal")
          }
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Section
          title={t("overview.servers.burn")}
          description={t("overview.servers.burnDesc")}
        >
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ left: 0, right: 16, top: 8, bottom: 4 }}>
                <CartesianGrid stroke={colors.border} strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  dataKey="x"
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  unit="%"
                  {...axis}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  unit="%"
                  width={40}
                  {...axis}
                />
                <ReferenceLine
                  segment={[
                    { x: 0, y: 0 },
                    { x: 100, y: 100 },
                  ]}
                  stroke={colors.muted}
                  strokeDasharray="5 4"
                />
                <RechartsTooltip
                  {...tooltipStyle}
                  cursor={false}
                  content={({ payload }) => {
                    const p = payload?.[0]?.payload as
                      | (typeof burn)[number]
                      | undefined;
                    if (!p) return null;
                    return (
                      <div
                        style={tooltipStyle.contentStyle}
                        className="px-2.5 py-1.5"
                      >
                        <div className="font-medium">{p.name}</div>
                        <div className="text-muted-foreground">
                          {t("overview.servers.burnTip", { x: p.x, y: p.y })}
                        </div>
                      </div>
                    );
                  }}
                />
                <Scatter
                  data={burn}
                  isAnimationActive={false}
                  shape={(props: {
                    cx?: number;
                    cy?: number;
                    payload?: (typeof burn)[number];
                  }) => (
                    <circle
                      cx={props.cx}
                      cy={props.cy}
                      r={7}
                      fill={stateColor[props.payload?.state ?? "ok"]}
                      fillOpacity={0.85}
                      stroke={colors.card}
                      strokeWidth={2}
                    />
                  )}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 space-y-1.5">
            {burn.map((b) => (
              <div key={b.name} className="flex items-center gap-2 text-xs">
                <i
                  className="inline-block size-2.5 shrink-0 rounded-full"
                  style={{ background: stateColor[b.state] }}
                />
                <span className="min-w-0 flex-1 truncate font-medium">
                  {b.name}
                </span>
                <span className="text-muted-foreground tabular-nums">
                  {t("overview.servers.burnRow", { x: b.x, y: b.y })}
                </span>
                {b.runOut && (
                  <Chip tone="crit">
                    {t("overview.servers.runOutShort", { date: b.runOut })}
                  </Chip>
                )}
              </div>
            ))}
          </div>
        </Section>

        <Section
          title={t("overview.servers.renewals")}
          description={
            due30
              ? t("overview.servers.renewalsDescSum", { amount: due30 })
              : t("overview.servers.renewalsDesc")
          }
          contentClassName="flex flex-col gap-3"
        >
          {renewals.length === 0 ? (
            <div className="text-muted-foreground py-10 text-center text-sm">
              {t("overview.servers.noRenewals")}
            </div>
          ) : (
            <RenewalTimeline items={renewals} />
          )}
          <RenewalSummary {...months} />
        </Section>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <FilterChips
          value={filter}
          onChange={setFilter}
          options={(
            [
              ["all", t("overview.servers.fAll")],
              ["offline", t("overview.servers.fOffline")],
              ["tight", t("overview.servers.fTight")],
              ["unlimited", t("overview.servers.fUnlimited")],
              ["expiring", t("overview.servers.fExpiring")],
            ] as Array<[FilterKey, string]>
          ).map(([key, label]) => ({ key, label, count: counts(key) }))}
        />
        <div className="bg-muted inline-flex rounded-md p-0.5">
          {(["default", "speed", "quota", "conns", "name"] as SortKey[]).map(
            (k) => (
              <button
                key={k}
                type="button"
                aria-pressed={sort === k}
                onClick={() => setSort(k)}
                className={cn(
                  "rounded px-2 py-1 text-xs whitespace-nowrap transition",
                  sort === k
                    ? "bg-background font-semibold shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t(`overview.servers.sort.${k}`)}
              </button>
            ),
          )}
        </div>
      </div>

      {shown.length === 0 ? (
        <div className="text-muted-foreground rounded-lg border border-dashed py-10 text-center text-sm">
          {t("noData")}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
          {shown.map((s) => (
            <ServerCard
              key={s.id}
              server={s}
              tick={tick}
              rangeLabel={rangeLabel}
              downColor={colors.down}
            />
          ))}
        </div>
      )}
      <QuotaLegend />
    </div>
  );
}

function ServerCard({
  server: s,
  tick,
  rangeLabel,
  downColor,
}: {
  server: ServerRow;
  tick: number;
  rangeLabel: string;
  downColor: string;
}) {
  const { t } = useTranslation("overview");
  const base = serverOf(s.id);
  const history = Array.from(
    { length: HISTORY },
    (_, i) => serverSpeedAt(base, tick - HISTORY + 1 + i).down,
  );
  const runOut = runOutDate(s);
  return (
    <Card className="min-w-0 gap-0 py-4">
      <CardContent className="space-y-3 px-4">
        <div className="flex items-center gap-2">
          <OnlineDot online={s.online} />
          <span className="min-w-0 flex-1 truncate text-sm font-semibold">
            {s.name}
          </span>
          {s.expires != null &&
            (s.expires < 0 ? (
              <Chip tone="crit">
                {t("overview.expiredDays", { count: -s.expires })}
              </Chip>
            ) : (
              <Chip tone={s.expires <= 7 ? "warn" : "muted"}>
                {t("overview.servers.expiresIn", { count: s.expires })}
              </Chip>
            ))}
        </div>

        <div>
          <div className="flex items-baseline gap-3 tabular-nums">
            <span className="text-lg leading-tight font-semibold text-blue-600 dark:text-blue-400">
              ↓ {formatSpeed(s.download)}
            </span>
            <span className="text-xs text-green-600 dark:text-green-400">
              ↑ {formatSpeed(s.upload)}
            </span>
          </div>
          <Sparkline
            values={history}
            color={downColor}
            className="mt-1.5 h-8"
          />
        </div>

        <div>
          <div className="text-xs tabular-nums">
            {s.limit > 0
              ? t("overview.servers.cycleUsed", {
                  used: formatBytes(s.cycleUsed),
                  limit: formatBytes(s.limit),
                })
              : t("overview.servers.cycleUsedUnlimited", {
                  used: formatBytes(s.cycleUsed),
                })}
          </div>
          <QuotaBar
            className="mt-1.5"
            ratio={s.limit > 0 ? s.cycleUsed / s.limit : 1}
            progress={s.progress}
            state={s.state}
          />
          <div className="text-muted-foreground mt-1.5 flex flex-wrap items-center justify-between gap-x-2 text-[11px]">
            <span>{t("overview.servers.resetOn", { day: s.resetDay })}</span>
            {runOut ? (
              <span className="text-red-600 dark:text-red-400">
                {t("overview.servers.runOutOn", { date: runOut })}
              </span>
            ) : (
              <span className="tabular-nums">
                {t("overview.servers.periodUsed", {
                  range: rangeLabel,
                  used: formatBytes(s.periodUsed),
                })}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 border-t pt-3 text-center">
          <Stat label={t("overview.servers.conns")} value={s.conns} />
          <Stat
            label={t("overview.servers.onlineUsers")}
            value={s.onlineUsers}
          />
          <Stat label={t("overview.servers.renewal")} value={priceText(s)} />
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="min-w-0">
      <div className="truncate text-sm font-semibold tabular-nums">{value}</div>
      <div className="text-muted-foreground truncate text-[11px]">{label}</div>
    </div>
  );
}
