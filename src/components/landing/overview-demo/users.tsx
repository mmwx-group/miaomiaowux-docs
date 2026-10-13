import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Input } from "@/components/ui/input";
import {
  ACTIVE_USERS,
  formatBytes,
  formatSpeed,
  type Model,
  type TimeRange,
  type UserRow,
} from "./data";
import { tooltipStyle, useChartColors } from "./chart-colors";
import {
  Chip,
  FilterChips,
  KpiTile,
  OnlineDot,
  QuotaBar,
  Section,
  SortHead,
} from "./parts";

// 「用户」视图:五个指标、配额使用分布、套餐分布、每日活跃用户、全部用户列表(可搜索 / 筛选 / 排序)。

type FilterKey = "all" | "online" | "over" | "near" | "expiring" | "expired";
type SortKey = "name" | "period" | "quota" | "speed" | "conns" | "expires";

const near = (u: UserRow) =>
  u.limit > 0 && !u.overLimit && u.cycleUsed / u.limit >= 0.8;
const FILTERS: Record<FilterKey, (u: UserRow) => boolean> = {
  all: () => true,
  online: (u) => u.conns > 0,
  over: (u) => u.overLimit,
  near,
  expiring: (u) => u.endDays != null && u.endDays >= 0 && u.endDays <= 7,
  expired: (u) => u.endDays != null && u.endDays < 0,
};
const SORT_KEYS: Record<SortKey, (u: UserRow) => number | string> = {
  name: (u) => u.username.toLowerCase(),
  period: (u) => u.periodUp + u.periodDown,
  quota: (u) => (u.limit > 0 ? u.cycleUsed / u.limit : -1),
  speed: (u) => u.speed,
  conns: (u) => u.conns,
  expires: (u) => u.endDays ?? Number.MAX_SAFE_INTEGER,
};

export function UsersView({
  range,
  model,
  onDrilldown,
}: {
  range: TimeRange;
  model: Model;
  onDrilldown: (username: string) => void;
}) {
  const { t } = useTranslation("overview");
  const colors = useChartColors();
  const { users } = model;
  const [filter, setFilter] = useState<FilterKey>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ k: SortKey; d: 1 | -1 }>({
    k: "period",
    d: -1,
  });
  const rangeLabel = t(`timeRange.${range}`);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users
      .filter(FILTERS[filter])
      .filter(
        (u) =>
          !q ||
          u.username.toLowerCase().includes(q) ||
          u.packages.some((p) => p.toLowerCase().includes(q)),
      )
      .sort((a, b) => {
        const x = SORT_KEYS[sort.k](a);
        const y = SORT_KEYS[sort.k](b);
        return (
          (x > y ? 1 : x < y ? -1 : 0) * sort.d ||
          a.username.localeCompare(b.username)
        );
      });
  }, [users, filter, query, sort]);

  const histogram = useMemo(() => {
    const buckets = [
      { name: "0–20%", value: 0, color: colors.ok },
      { name: "20–50%", value: 0, color: colors.ok },
      { name: "50–80%", value: 0, color: colors.series[3] },
      { name: "80–100%", value: 0, color: colors.warn },
      { name: t("overview.users.overBucket"), value: 0, color: colors.crit },
    ];
    for (const u of users) {
      if (u.limit <= 0) continue;
      const r = u.cycleUsed / u.limit;
      buckets[
        u.overLimit || r >= 1
          ? 4
          : r >= 0.8
            ? 3
            : r >= 0.5
              ? 2
              : r >= 0.2
                ? 1
                : 0
      ].value++;
    }
    return buckets;
  }, [users, colors, t]);

  const packages = useMemo(() => {
    const m = new Map<string, { people: number; used: number }>();
    for (const u of users) {
      for (const p of u.packages) {
        const e = m.get(p) ?? { people: 0, used: 0 };
        e.people++;
        e.used += u.cycleUsed / u.packages.length;
        m.set(p, e);
      }
    }
    return [...m.entries()]
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.people - a.people);
  }, [users]);

  const onlineCount = users.filter((u) => u.conns > 0).length;
  const totalPeriod = users.reduce((a, u) => a + u.periodUp + u.periodDown, 0);
  const counts = (k: FilterKey) => users.filter(FILTERS[k]).length;
  const axis = {
    tickLine: false,
    axisLine: false,
    stroke: colors.muted,
    fontSize: 11,
  };
  const toggleSort = (k: SortKey) =>
    setSort((s) =>
      s.k === k
        ? { k, d: (s.d * -1) as 1 | -1 }
        : { k, d: k === "name" || k === "expires" ? 1 : -1 },
    );

  const rowState = (u: UserRow) => {
    const ratio = u.limit > 0 ? u.cycleUsed / u.limit : 0;
    const state =
      u.limit <= 0
        ? "unlimited"
        : u.overLimit || ratio >= 1
          ? "crit"
          : ratio >= 0.8
            ? "warn"
            : "ok";
    return { ratio, state } as const;
  };
  const renderQuota = (u: UserRow) => {
    const st = rowState(u);
    return (
      <div className="flex min-w-[180px] items-center gap-2">
        <QuotaBar
          className="flex-1"
          ratio={u.limit > 0 ? st.ratio : 1}
          state={st.state}
        />
        <span className="text-xs whitespace-nowrap tabular-nums">
          {formatBytes(u.cycleUsed)}
          {u.limit > 0 ? ` / ${formatBytes(u.limit)}` : ` · ${t("unlimited")}`}
        </span>
      </div>
    );
  };
  const renderExpires = (d: number | null) =>
    d == null ? (
      <span className="text-muted-foreground text-xs">
        {t("overview.forever")}
      </span>
    ) : d < 0 ? (
      <Chip tone="crit">{t("overview.expiredDays", { count: -d })}</Chip>
    ) : d <= 7 ? (
      <Chip tone="warn">{t("overview.days", { count: d })}</Chip>
    ) : (
      <span className="text-xs tabular-nums">
        {t("overview.days", { count: d })}
      </span>
    );
  const sortHead = (
    k: SortKey,
    label: string,
    align: "left" | "right" = "left",
  ) => (
    <SortHead
      align={align}
      label={label}
      active={sort.k === k}
      dir={sort.d}
      onClick={() => toggleSort(k)}
    />
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-5 max-xl:[&>:last-child:nth-child(odd)]:col-span-2">
        <KpiTile
          label={t("overview.users.kpiTotal")}
          value={users.length}
          unit={t("overview.unit.people")}
          foot={t("overview.users.kpiMulti", {
            count: users.filter((u) => u.packages.length > 1).length,
          })}
        />
        <KpiTile
          label={t("overview.users.kpiActiveToday")}
          value={ACTIVE_USERS[ACTIVE_USERS.length - 1].count}
          unit={t("overview.unit.people")}
          foot={t("overview.users.kpiOnline", { count: onlineCount })}
        />
        <KpiTile
          label={t("overview.users.kpiAvg")}
          value={formatBytes(totalPeriod / users.length)}
          foot={rangeLabel}
        />
        <KpiTile
          label={t("overview.users.kpiOver")}
          value={`${counts("over")} / ${counts("near")}`}
          foot={t("overview.users.kpiOverFoot")}
        />
        <KpiTile
          label={t("overview.users.kpiExpiring")}
          value={counts("expiring")}
          unit={t("overview.unit.people")}
          foot={t("overview.users.kpiExpired", { count: counts("expired") })}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Section
          title={t("overview.users.histogram")}
          description={t("overview.users.histogramDesc")}
        >
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={histogram}
                margin={{ left: 0, right: 8, top: 16, bottom: 0 }}
              >
                <XAxis dataKey="name" {...axis} />
                <YAxis {...axis} width={28} allowDecimals={false} />
                <RechartsTooltip
                  {...tooltipStyle}
                  cursor={{ fill: colors.border, opacity: 0.25 }}
                  formatter={(v) => [
                    t("overview.peopleCount", { count: Number(v) }),
                    "",
                  ]}
                />
                <Bar
                  dataKey="value"
                  maxBarSize={36}
                  isAnimationActive={false}
                  label={{
                    position: "top",
                    fontSize: 11,
                    fill: colors.foreground,
                  }}
                >
                  {histogram.map((b, i) => (
                    <Cell key={i} fill={b.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Section>
        <Section
          title={t("overview.users.packages")}
          description={t("overview.users.packagesDesc")}
        >
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <RechartsTooltip
                  {...tooltipStyle}
                  formatter={(v, name, item) => [
                    item.dataKey === "people"
                      ? t("overview.peopleCount", { count: Number(v) })
                      : formatBytes(Number(v)),
                    name,
                  ]}
                />
                <Legend iconSize={9} wrapperStyle={{ fontSize: 11 }} />
                <Pie
                  data={packages}
                  dataKey="people"
                  nameKey="name"
                  outerRadius="40%"
                  stroke={colors.card}
                  isAnimationActive={false}
                >
                  {packages.map((_, i) => (
                    <Cell
                      key={i}
                      fill={colors.series[i % colors.series.length]}
                    />
                  ))}
                </Pie>
                <Pie
                  data={packages}
                  dataKey="used"
                  nameKey="name"
                  innerRadius="50%"
                  outerRadius="70%"
                  stroke={colors.card}
                  legendType="none"
                  isAnimationActive={false}
                >
                  {packages.map((_, i) => (
                    <Cell
                      key={i}
                      fill={colors.series[i % colors.series.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Section>
        <Section
          title={t("overview.users.active")}
          description={t("overview.users.activeDesc")}
        >
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={ACTIVE_USERS}
                margin={{ left: 0, right: 8, top: 8, bottom: 0 }}
              >
                <XAxis
                  dataKey="label"
                  interval="equidistantPreserveStart"
                  {...axis}
                />
                <YAxis {...axis} width={28} allowDecimals={false} />
                <RechartsTooltip
                  {...tooltipStyle}
                  cursor={{ fill: colors.border, opacity: 0.25 }}
                  formatter={(v) => [
                    t("overview.peopleCount", { count: Number(v) }),
                    "",
                  ]}
                />
                <Bar
                  dataKey="count"
                  fill={colors.series[2]}
                  maxBarSize={14}
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Section>
      </div>

      <Section
        title={t("overview.users.table")}
        description={t("overview.users.tableDesc")}
        contentClassName="space-y-3"
      >
        <div className="flex flex-wrap items-center gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("overview.users.search")}
            className="h-8 w-full sm:w-56"
          />
          <FilterChips
            value={filter}
            onChange={setFilter}
            options={(
              [
                ["all", t("overview.users.fAll")],
                ["online", t("overview.users.fOnline")],
                ["over", t("overview.users.fOver")],
                ["near", t("overview.users.fNear")],
                ["expiring", t("overview.users.fExpiring")],
                ["expired", t("overview.users.fExpired")],
              ] as Array<[FilterKey, string]>
            ).map(([key, label]) => ({ key, label, count: counts(key) }))}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead>
              <tr className="text-muted-foreground border-b text-left text-xs">
                <th className="px-2 py-2">
                  {sortHead("name", t("overview.users.colUser"))}
                </th>
                <th className="px-2 py-2">{t("overview.users.colPackage")}</th>
                <th className="px-2 py-2 text-right">
                  {sortHead(
                    "period",
                    t("overview.users.colPeriod", { range: rangeLabel }),
                    "right",
                  )}
                </th>
                <th className="px-2 py-2">
                  {sortHead("quota", t("overview.users.colQuota"))}
                </th>
                <th className="px-2 py-2 text-right">
                  {sortHead("speed", t("overview.users.colSpeed"), "right")}
                </th>
                <th className="px-2 py-2 text-right">
                  {sortHead("conns", t("overview.users.colConns"), "right")}
                </th>
                <th className="px-2 py-2 text-right">
                  {sortHead("expires", t("overview.users.colExpires"), "right")}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr
                  key={u.username}
                  className="hover:bg-muted cursor-pointer border-b last:border-b-0"
                  onClick={() => onDrilldown(u.username)}
                >
                  <td className="px-2 py-2 font-medium">
                    <OnlineDot online={u.conns > 0} className="mr-2" />
                    {u.username}
                  </td>
                  <td className="max-w-[220px] px-2 py-2">
                    <PackageTags packages={u.packages} />
                  </td>
                  <td className="px-2 py-2 text-right text-xs whitespace-nowrap tabular-nums">
                    ↑{formatBytes(u.periodUp)} ↓{formatBytes(u.periodDown)}
                  </td>
                  <td className="px-2 py-2">{renderQuota(u)}</td>
                  <td className="px-2 py-2 text-right text-xs whitespace-nowrap text-emerald-600 tabular-nums dark:text-emerald-400">
                    {u.speed > 0 ? (
                      formatSpeed(u.speed)
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-2 py-2 text-right text-xs whitespace-nowrap tabular-nums">
                    {u.conns > 0 ? (
                      <span className="text-sky-600 dark:text-sky-400">
                        🔌 {u.conns}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-2 py-2 text-right text-xs whitespace-nowrap">
                    {renderExpires(u.endDays)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && (
            <div className="text-muted-foreground py-6 text-center text-sm">
              {t("noData")}
            </div>
          )}
        </div>
      </Section>
    </div>
  );
}

/** 套餐标签:只摆第一个,其余收成「+N」。 */
function PackageTags({ packages }: { packages: string[] }) {
  if (packages.length === 0) return null;
  return (
    <div
      className="flex min-w-0 items-center gap-1"
      title={packages.join("\n")}
    >
      <span className="max-w-[160px] truncate rounded-sm border px-1.5 text-[11px] whitespace-nowrap">
        {packages[0]}
      </span>
      {packages.length > 1 && (
        <span className="text-muted-foreground rounded-sm border border-dashed px-1 text-[11px] whitespace-nowrap">
          +{packages.length - 1}
        </span>
      )}
    </div>
  );
}
