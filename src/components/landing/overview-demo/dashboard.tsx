import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Area,
  AreaChart,
  Bar,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";
import {
  DAILY_HISTORY,
  formatBytes,
  formatSpeed,
  runOutDate,
  shortNodeName,
  type Model,
  type TimeRange,
} from "./data";
import { tooltipStyle, useChartColors } from "./chart-colors";
import { Chip, KpiTile, QuotaBar, QuotaLegend, Section } from "./parts";

// 「仪表盘」视图:六个指标、每日流量、实时网速、用量排行、流量去向、需要处理的事项、服务器状态。

type Alert = {
  level: "crit" | "warn" | "info";
  title: string;
  detail: string;
  action: string;
  view: "users" | "servers";
};

export function DashboardView({
  range,
  model,
  live,
  onOpenView,
  onDrilldown,
}: {
  range: TimeRange;
  model: Model;
  live: Array<{ up: number; down: number }>;
  onOpenView: (view: "users" | "nodes" | "servers") => void;
  onDrilldown: (type: "user" | "node", key: string) => void;
}) {
  const { t } = useTranslation("overview");
  const colors = useChartColors();
  const { servers, users, nodes } = model;
  const rangeLabel = t(`timeRange.${range}`);

  const periodTotal = servers.reduce((a, s) => a + s.periodUsed, 0);
  const lastLive = live[live.length - 1] ?? { up: 0, down: 0 };
  const peakDown = Math.max(0, ...live.map((x) => x.down));
  const online = servers.filter((s) => s.online).length;
  const limited = servers.filter((s) => s.limit > 0);
  const limitedUsed = limited.reduce((a, s) => a + s.cycleUsed, 0);
  const limitedTotal = limited.reduce((a, s) => a + s.limit, 0);
  const runningOut = limited.filter((s) => s.state === "crit");
  const overUsers = users.filter((u) => u.overLimit);
  const expiringUsers = users.filter(
    (u) => u.endDays != null && u.endDays >= 0 && u.endDays <= 7,
  );
  const onlineUsers = users.filter((u) => u.conns > 0);

  const dailyData = useMemo(
    () =>
      DAILY_HISTORY.map((h, i) => {
        const win = DAILY_HISTORY.slice(Math.max(0, i - 6), i + 1);
        return {
          ...h,
          avg: Number(
            (win.reduce((a, x) => a + x.used, 0) / win.length).toFixed(2),
          ),
        };
      }),
    [],
  );

  const usersTotal = users.reduce((a, u) => a + u.periodUp + u.periodDown, 0);
  const topUsers = [...users]
    .map((u) => ({
      key: u.username,
      name: u.username,
      value: u.periodUp + u.periodDown,
      sub: `↑${formatBytes(u.periodUp)} ↓${formatBytes(u.periodDown)}`,
    }))
    .filter((u) => u.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);
  const nodesTotal = nodes.reduce((a, n) => a + n.periodUp + n.periodDown, 0);
  const topNodes = [...nodes]
    .map((n) => ({
      key: String(n.id),
      name: shortNodeName(n.name),
      sub: n.serverName,
      value: n.periodUp + n.periodDown,
    }))
    .filter((n) => n.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);
  const share = servers
    .map((s) => ({ name: s.name, value: s.periodUsed }))
    .filter((s) => s.value > 0)
    .sort((a, b) => b.value - a.value);

  const alerts: Alert[] = [];
  for (const s of runningOut) {
    alerts.push({
      level: s.cycleUsed >= s.limit ? "crit" : "warn",
      title:
        s.cycleUsed >= s.limit
          ? t("overview.alerts.quotaExhausted", { name: s.name })
          : t("overview.alerts.quotaRunOut", {
              name: s.name,
              date: runOutDate(s) ?? "—",
            }),
      detail: t("overview.alerts.quotaDetail", {
        used: formatBytes(s.cycleUsed),
        limit: formatBytes(s.limit),
        progress: Math.round(s.progress * 100),
        day: s.resetDay,
      }),
      action: t("overview.alerts.viewServers"),
      view: "servers",
    });
  }
  if (overUsers.length)
    alerts.push({
      level: "crit",
      title: t("overview.alerts.usersOver", { count: overUsers.length }),
      detail: overUsers.map((u) => u.username).join("、"),
      action: t("overview.alerts.viewUsers"),
      view: "users",
    });
  if (expiringUsers.length)
    alerts.push({
      level: "warn",
      title: t("overview.alerts.usersExpiring", {
        count: expiringUsers.length,
      }),
      detail: expiringUsers
        .map(
          (u) =>
            `${u.username}(${t("overview.days", { count: u.endDays ?? 0 })})`,
        )
        .join("、"),
      action: t("overview.alerts.viewUsers"),
      view: "users",
    });
  const expServers = servers.filter((s) => s.expires != null && s.expires <= 7);
  if (expServers.length)
    alerts.push({
      level: "info",
      title: t("overview.alerts.serversExpiring", { count: expServers.length }),
      detail: expServers
        .map(
          (s) => `${s.name} ${t("overview.days", { count: s.expires ?? 0 })}`,
        )
        .join("、"),
      action: t("overview.alerts.viewServers"),
      view: "servers",
    });
  const order = { crit: 0, warn: 1, info: 2 };
  alerts.sort((a, b) => order[a.level] - order[b.level]);

  const axis = {
    tickLine: false,
    axisLine: false,
    stroke: colors.muted,
    fontSize: 11,
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-6">
        <KpiTile
          label={t("overview.kpi.periodUsed", { range: rangeLabel })}
          value={formatBytes(periodTotal)}
          spark={DAILY_HISTORY.map((h) => h.used)}
          sparkColor={colors.primary}
          foot={t("overview.kpi.periodUsedFoot", { count: servers.length })}
        />
        <KpiTile
          label={t("overview.kpi.speed")}
          value={
            <span className="text-blue-600 dark:text-blue-400">
              ↓ {formatSpeed(lastLive.down)}
            </span>
          }
          foot={
            <>
              <span className="text-green-600 dark:text-green-400">
                ↑ {formatSpeed(lastLive.up)}
              </span>
              {peakDown > 0 && (
                <span>
                  · {t("overview.kpi.peak", { value: formatSpeed(peakDown) })}
                </span>
              )}
            </>
          }
          spark={live.slice(-40).map((x) => x.down)}
          sparkColor={colors.down}
        />
        <KpiTile
          label={t("overview.kpi.online")}
          value={onlineUsers.length}
          unit={t("overview.unit.people")}
          foot={t("overview.kpi.onlineFoot", {
            conns: onlineUsers
              .reduce((a, u) => a + u.conns, 0)
              .toLocaleString(),
            ips: onlineUsers.reduce((a, u) => a + u.ips, 0),
          })}
        />
        <KpiTile
          label={t("overview.kpi.servers")}
          value={online}
          unit={t("overview.kpi.serversUnit", { total: servers.length })}
          foot={
            servers.length - online > 0 ? (
              <Chip tone="crit">
                {t("overview.kpi.serversOffline", {
                  count: servers.length - online,
                })}
              </Chip>
            ) : (
              <Chip tone="ok">{t("overview.kpi.serversAllOnline")}</Chip>
            )
          }
        />
        <KpiTile
          label={t("overview.kpi.quota")}
          value={
            limitedTotal > 0
              ? Math.round((limitedUsed / limitedTotal) * 100)
              : "—"
          }
          unit={limitedTotal > 0 ? t("overview.kpi.quotaUnit") : undefined}
          foot={
            runningOut.length > 0 ? (
              <Chip tone="crit">
                {t("overview.kpi.quotaRunningOut", {
                  count: runningOut.length,
                })}
              </Chip>
            ) : (
              <Chip tone="ok">{t("overview.kpi.quotaFine")}</Chip>
            )
          }
        />
        <KpiTile
          label={t("overview.kpi.users")}
          value={overUsers.length}
          unit={t("overview.kpi.usersOverUnit")}
          foot={
            <>
              {expiringUsers.length > 0 && (
                <Chip tone="warn">
                  {t("overview.kpi.usersExpiring", {
                    count: expiringUsers.length,
                  })}
                </Chip>
              )}
              <span>
                {t("overview.kpi.usersTotal", { count: users.length })}
              </span>
            </>
          }
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Section
          className="xl:col-span-2"
          title={t("overview.dashboard.daily")}
          description={t("overview.dashboard.dailyDesc")}
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={dailyData}
                margin={{ left: 4, right: 8, top: 8, bottom: 0 }}
              >
                <XAxis
                  dataKey="label"
                  interval="equidistantPreserveStart"
                  {...axis}
                />
                <YAxis
                  {...axis}
                  width={44}
                  tickFormatter={(v: number) => `${v}G`}
                />
                <RechartsTooltip
                  {...tooltipStyle}
                  cursor={{ fill: colors.border, opacity: 0.25 }}
                  formatter={(v, name) => [`${Number(v).toFixed(2)} GB`, name]}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} iconSize={9} />
                <Bar
                  dataKey="used"
                  name={t("dailyUsage")}
                  fill={colors.primary}
                  radius={[2, 2, 0, 0]}
                  maxBarSize={18}
                  isAnimationActive={false}
                />
                <Line
                  dataKey="avg"
                  name={t("overview.dashboard.avg7")}
                  stroke={colors.foreground}
                  strokeDasharray="4 3"
                  dot={false}
                  strokeWidth={1.5}
                  isAnimationActive={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Section>
        <Section
          title={t("overview.dashboard.live")}
          description={t("overview.dashboard.liveDesc")}
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={live.map((x, i) => ({ ...x, i }))}
                margin={{ left: 4, right: 8, top: 8, bottom: 0 }}
              >
                <XAxis dataKey="i" hide />
                <YAxis
                  {...axis}
                  width={58}
                  tickFormatter={(v: number) => formatSpeed(v)}
                />
                <RechartsTooltip
                  {...tooltipStyle}
                  labelFormatter={() => ""}
                  formatter={(v, name) => [formatSpeed(Number(v)), name]}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} iconSize={9} />
                <Area
                  type="monotone"
                  dataKey="down"
                  name={t("overview.download")}
                  stroke={colors.down}
                  fill={colors.down}
                  fillOpacity={0.15}
                  isAnimationActive={false}
                />
                <Area
                  type="monotone"
                  dataKey="up"
                  name={t("overview.upload")}
                  stroke={colors.up}
                  fill={colors.up}
                  fillOpacity={0.12}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Section>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Section
          title={t("overview.dashboard.topUsers")}
          description={rangeLabel}
          contentClassName="flex flex-1 flex-col"
        >
          <TopBars
            data={topUsers}
            total={usersTotal}
            color={colors.series[0]}
            onClick={(d) => onDrilldown("user", d.key)}
          />
        </Section>
        <Section
          title={t("overview.dashboard.topNodes")}
          description={rangeLabel}
          contentClassName="flex flex-1 flex-col"
        >
          <TopBars
            data={topNodes}
            total={nodesTotal}
            color={colors.series[3]}
            onClick={(d) => onDrilldown("node", d.key)}
          />
        </Section>
        <Section
          title={t("overview.dashboard.share")}
          description={t("overview.dashboard.shareDesc", { range: rangeLabel })}
          contentClassName="flex flex-1 flex-col"
        >
          <ShareDonut data={share} colors={colors.series} card={colors.card} />
        </Section>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Section
          title={t("overview.dashboard.attention")}
          description={t("overview.dashboard.attentionDesc")}
        >
          {alerts.length === 0 ? (
            <div className="text-muted-foreground py-6 text-center text-sm">
              {t("overview.alerts.none")}
            </div>
          ) : (
            <ul className="space-y-2">
              {alerts.map((a, i) => (
                <li
                  key={i}
                  className="bg-background grid grid-cols-[4px_1fr_auto] items-center gap-3 border py-2 pr-3"
                >
                  <span
                    className={cn(
                      "self-stretch",
                      a.level === "crit"
                        ? "bg-red-600"
                        : a.level === "warn"
                          ? "bg-amber-500"
                          : "bg-sky-500",
                    )}
                  />
                  <div className="min-w-0">
                    <div className="text-sm font-medium">{a.title}</div>
                    <div
                      className="text-muted-foreground text-xs max-md:line-clamp-2 max-md:break-all md:truncate"
                      title={a.detail}
                    >
                      {a.detail}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="text-primary text-xs whitespace-nowrap hover:underline"
                    onClick={() => onOpenView(a.view)}
                  >
                    {a.action} →
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Section>
        <Section
          title={t("overview.dashboard.serverStatus")}
          description={t("overview.dashboard.serverStatusDesc")}
        >
          <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-2">
            {servers.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => onOpenView("servers")}
                className="bg-background hover:border-primary border p-2 text-left transition"
              >
                <div className="flex items-center gap-1.5 truncate text-sm font-medium">
                  <span
                    className={cn(
                      "size-2 shrink-0 rounded-full",
                      s.online ? "bg-emerald-500" : "bg-red-500",
                    )}
                  />
                  <span className="truncate">{s.name}</span>
                </div>
                <div className="text-muted-foreground mt-0.5 text-[11px] tabular-nums">
                  ↓ {formatSpeed(s.download)} ·{" "}
                  {s.limit > 0
                    ? `${Math.round((s.cycleUsed / s.limit) * 100)}%`
                    : t("unlimited")}
                </div>
                <QuotaBar
                  className="mt-1.5"
                  ratio={s.limit > 0 ? s.cycleUsed / s.limit : 1}
                  progress={s.progress}
                  state={s.state}
                />
              </button>
            ))}
          </div>
          <QuotaLegend />
        </Section>
      </div>
    </div>
  );
}

function TopBars<
  T extends { key: string; name: string; value: number; sub?: string },
>({
  data,
  total,
  color,
  onClick,
}: {
  data: T[];
  total: number;
  color: string;
  onClick: (d: T) => void;
}) {
  const { t } = useTranslation("overview");
  const max = Math.max(...data.map((d) => d.value), 1);
  const topSum = data.reduce((a, d) => a + d.value, 0);
  const pct = (v: number) => (total > 0 ? (v / total) * 100 : 0);
  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="space-y-2.5">
        {data.map((d) => (
          <button
            key={d.key}
            type="button"
            onClick={() => onClick(d)}
            className="hover:bg-muted grid w-full grid-cols-[minmax(0,9rem)_1fr_auto] items-center gap-3 px-1 py-0.5 text-left text-xs"
          >
            <span className="min-w-0">
              <span className="block truncate font-medium">{d.name}</span>
              {d.sub && (
                <span className="text-muted-foreground block truncate text-[11px]">
                  {d.sub}
                </span>
              )}
            </span>
            <span className="bg-muted h-2">
              <span
                className="block h-full"
                style={{
                  width: `${(d.value / max) * 100}%`,
                  background: color,
                }}
              />
            </span>
            <span className="text-muted-foreground tabular-nums">
              {formatBytes(d.value)}
            </span>
          </button>
        ))}
      </div>
      <div className="mt-auto space-y-2 border-t pt-3">
        <div className="bg-muted flex h-2 overflow-hidden">
          {data.map((d, i) => (
            <span
              key={d.key}
              className="h-full border-r border-[var(--card)] last:border-r-0"
              style={{
                width: `${pct(d.value)}%`,
                background: color,
                opacity: 1 - (i / Math.max(data.length, 1)) * 0.7,
              }}
              title={`${d.name} ${pct(d.value).toFixed(1)}%`}
            />
          ))}
        </div>
        <div className="text-muted-foreground flex flex-wrap justify-between gap-x-3 gap-y-1 text-xs tabular-nums">
          <span>
            {t("overview.dashboard.topShare", {
              count: data.length,
              pct: pct(topSum).toFixed(pct(topSum) >= 99.95 ? 0 : 1),
            })}
          </span>
          <span>
            {t("overview.dashboard.topTotal", { total: formatBytes(total) })}
          </span>
        </div>
      </div>
    </div>
  );
}

/** 流量去向:圆环在上、明细在下。 */
function ShareDonut({
  data,
  colors,
  card,
}: {
  data: Array<{ name: string; value: number }>;
  colors: string[];
  card: string;
}) {
  const total = data.reduce((a, d) => a + d.value, 0);
  return (
    <div className="flex flex-1 flex-col gap-3">
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <RechartsTooltip
              {...tooltipStyle}
              formatter={(v, name) => [formatBytes(Number(v)), name]}
            />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="62%"
              outerRadius="92%"
              stroke={card}
              strokeWidth={2}
              isAnimationActive={false}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={colors[i % colors.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-1.5">
        {data.map((d, i) => (
          <div
            key={d.name}
            className="grid grid-cols-[10px_minmax(0,1fr)_auto_3.2rem] items-center gap-2 text-xs"
          >
            <i
              className="inline-block size-2.5"
              style={{ background: colors[i % colors.length] }}
            />
            <span className="truncate" title={d.name}>
              {d.name}
            </span>
            <span className="text-muted-foreground tabular-nums">
              {formatBytes(d.value)}
            </span>
            <span className="text-right font-medium tabular-nums">
              {total > 0 ? ((d.value / total) * 100).toFixed(1) : "0"}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
