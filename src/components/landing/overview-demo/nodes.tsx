import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Treemap,
} from "recharts";
import { Input } from "@/components/ui/input";
import {
  formatBytes,
  formatSpeed,
  shortNodeName,
  type Model,
  type NodeRow,
  type TimeRange,
} from "./data";
import { tooltipStyle, useChartColors } from "./chart-colors";
import { Chip, FilterChips, KpiTile, Section, SortHead } from "./parts";

// 「节点」视图:四个指标、流量地图(按服务器分区)、协议构成、全部节点列表。

type FilterKey = "all" | "active" | "idle" | "disabled";
type SortKey = "name" | "server" | "period" | "speed" | "conns" | "users";

const used = (n: NodeRow) => n.periodUp + n.periodDown;
const FILTERS: Record<FilterKey, (n: NodeRow) => boolean> = {
  all: () => true,
  active: (n) => used(n) > 0 || n.conns > 0,
  idle: (n) => used(n) <= 0 && n.conns <= 0,
  disabled: (n) => !n.enabled,
};
const SORT_KEYS: Record<SortKey, (n: NodeRow) => number | string> = {
  name: (n) => n.name.toLowerCase(),
  server: (n) => n.serverName.toLowerCase(),
  period: used,
  speed: (n) => n.speed,
  conns: (n) => n.conns,
  users: (n) => n.onlineUsers,
};

export function NodesView({
  range,
  model,
  onDrilldown,
}: {
  range: TimeRange;
  model: Model;
  onDrilldown: (nodeId: number) => void;
}) {
  const { t } = useTranslation("overview");
  const colors = useChartColors();
  const { nodes } = model;
  const [filter, setFilter] = useState<FilterKey>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ k: SortKey; d: 1 | -1 }>({
    k: "period",
    d: -1,
  });
  const rangeLabel = t(`timeRange.${range}`);
  const counts = (k: FilterKey) => nodes.filter(FILTERS[k]).length;

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return nodes
      .filter(FILTERS[filter])
      .filter(
        (n) =>
          !q ||
          n.name.toLowerCase().includes(q) ||
          n.serverName.toLowerCase().includes(q),
      )
      .sort((a, b) => {
        const x = SORT_KEYS[sort.k](a);
        const y = SORT_KEYS[sort.k](b);
        return (
          (x > y ? 1 : x < y ? -1 : 0) * sort.d || a.name.localeCompare(b.name)
        );
      });
  }, [nodes, filter, query, sort]);

  // 流量地图:服务器 → 节点。节点格按所属服务器取色,同一台里按用量深浅区分。
  const treemap = useMemo(() => {
    const byServer = new Map<string, Array<{ name: string; size: number }>>();
    for (const n of nodes) {
      if (used(n) <= 0) continue;
      const list = byServer.get(n.serverName) ?? [];
      list.push({ name: shortNodeName(n.name), size: used(n) });
      byServer.set(n.serverName, list);
    }
    return [...byServer.entries()]
      .map(([name, children]) => ({
        name,
        total: children.reduce((a, c) => a + c.size, 0),
        children: children.sort((a, b) => b.size - a.size),
      }))
      .sort((a, b) => b.total - a.total)
      .map((s, i) => {
        const color = colors.series[i % colors.series.length];
        return {
          ...s,
          color,
          children: s.children.map((c, k) => ({
            ...c,
            server: s.name,
            fill: color,
            shade: k % 5,
          })),
        };
      });
  }, [nodes, colors]);

  const protocols = useMemo(() => {
    const m = new Map<string, { count: number; used: number }>();
    for (const n of nodes) {
      const p = n.protocol.toUpperCase();
      const e = m.get(p) ?? { count: 0, used: 0 };
      e.count++;
      e.used += used(n);
      m.set(p, e);
    }
    return [...m.entries()]
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.used - a.used || b.count - a.count);
  }, [nodes]);

  const busiest = [...nodes].sort((a, b) => used(b) - used(a))[0];
  const toggleSort = (k: SortKey) =>
    setSort((s) =>
      s.k === k
        ? { k, d: (s.d * -1) as 1 | -1 }
        : { k, d: k === "name" || k === "server" ? 1 : -1 },
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
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <KpiTile
          label={t("overview.nodes.kpiTotal")}
          value={nodes.length}
          foot={t("overview.nodes.kpiServers", {
            count: new Set(nodes.map((n) => n.serverName)).size,
          })}
        />
        <KpiTile
          label={t("overview.nodes.kpiActive")}
          value={counts("active")}
          foot={t("overview.nodes.kpiIdle", { count: counts("idle") })}
        />
        <KpiTile
          label={t("overview.nodes.kpiBusiest")}
          value={formatBytes(used(busiest))}
          foot={<span className="truncate">{busiest.name}</span>}
        />
        <KpiTile
          label={t("overview.nodes.kpiConns")}
          value={nodes.reduce((a, n) => a + n.conns, 0).toLocaleString()}
          foot={t("overview.nodes.kpiProtocols", { count: protocols.length })}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Section
          className="xl:col-span-2"
          title={t("overview.nodes.treemap")}
          description={t("overview.nodes.treemapDesc", { range: rangeLabel })}
        >
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <Treemap
                data={treemap}
                dataKey="size"
                nameKey="name"
                stroke={colors.card}
                isAnimationActive={false}
                content={<TreemapCell />}
              >
                <RechartsTooltip
                  {...tooltipStyle}
                  formatter={(v, name, item) => {
                    const server = (
                      item.payload as { server?: string } | undefined
                    )?.server;
                    return [
                      formatBytes(Number(v)),
                      server ? `${server} · ${name}` : name,
                    ];
                  }}
                />
              </Treemap>
            </ResponsiveContainer>
          </div>
          <div className="text-muted-foreground mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs">
            {treemap.map((s) => (
              <span key={s.name} className="inline-flex items-center gap-1.5">
                <i
                  className="inline-block size-2.5"
                  style={{ background: s.color }}
                />
                {s.name}
                <span className="tabular-nums">{formatBytes(s.total)}</span>
              </span>
            ))}
          </div>
        </Section>
        <Section
          title={t("overview.nodes.protocols")}
          description={t("overview.nodes.protocolsDesc")}
        >
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <RechartsTooltip
                  {...tooltipStyle}
                  formatter={(v, name, item) => [
                    item.dataKey === "count"
                      ? t("overview.nodes.nodeCount", { count: Number(v) })
                      : formatBytes(Number(v)),
                    name,
                  ]}
                />
                <Legend iconSize={9} wrapperStyle={{ fontSize: 11 }} />
                <Pie
                  data={protocols}
                  dataKey="count"
                  nameKey="name"
                  outerRadius="36%"
                  stroke={colors.card}
                  isAnimationActive={false}
                >
                  {protocols.map((_, i) => (
                    <Cell
                      key={i}
                      fill={colors.series[i % colors.series.length]}
                    />
                  ))}
                </Pie>
                <Pie
                  data={protocols.filter((p) => p.used > 0)}
                  dataKey="used"
                  nameKey="name"
                  innerRadius="46%"
                  outerRadius="66%"
                  stroke={colors.card}
                  legendType="none"
                  isAnimationActive={false}
                >
                  {protocols
                    .filter((p) => p.used > 0)
                    .map((p) => (
                      <Cell
                        key={p.name}
                        fill={
                          colors.series[
                            protocols.indexOf(p) % colors.series.length
                          ]
                        }
                      />
                    ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Section>
      </div>

      <Section
        title={t("overview.nodes.table")}
        description={t("overview.nodes.tableDesc")}
        contentClassName="space-y-3"
      >
        <div className="flex flex-wrap items-center gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("overview.nodes.search")}
            className="h-8 w-full sm:w-56"
          />
          <FilterChips
            value={filter}
            onChange={setFilter}
            options={(
              [
                ["all", t("overview.nodes.fAll")],
                ["active", t("overview.nodes.fActive")],
                ["idle", t("overview.nodes.fIdle")],
                ["disabled", t("overview.nodes.fDisabled")],
              ] as Array<[FilterKey, string]>
            ).map(([key, label]) => ({ key, label, count: counts(key) }))}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="text-muted-foreground border-b text-left text-xs">
                <th className="px-2 py-2">
                  {sortHead("name", t("overview.nodes.colNode"))}
                </th>
                <th className="px-2 py-2">
                  {sortHead("server", t("overview.nodes.colServer"))}
                </th>
                <th className="px-2 py-2">{t("overview.nodes.colProtocol")}</th>
                <th className="px-2 py-2 text-right">
                  {sortHead(
                    "period",
                    t("overview.nodes.colPeriod", { range: rangeLabel }),
                    "right",
                  )}
                </th>
                <th className="px-2 py-2 text-right">
                  {sortHead("speed", t("overview.nodes.colSpeed"), "right")}
                </th>
                <th className="px-2 py-2 text-right">
                  {sortHead("conns", t("overview.nodes.colConns"), "right")}
                </th>
                <th className="px-2 py-2 text-right">
                  {sortHead("users", t("overview.nodes.colUsers"), "right")}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((n) => (
                <tr
                  key={n.id}
                  className="hover:bg-muted cursor-pointer border-b last:border-b-0"
                  onClick={() => onDrilldown(n.id)}
                >
                  <td className="px-2 py-2 font-medium">
                    {!n.enabled && (
                      <span className="mr-1.5">
                        <Chip>{t("overview.nodes.disabled")}</Chip>
                      </span>
                    )}
                    {n.name}
                  </td>
                  <td className="text-muted-foreground px-2 py-2 text-xs">
                    {n.serverName}
                  </td>
                  <td className="px-2 py-2">
                    <span className="rounded-sm border px-1.5 text-[11px] uppercase">
                      {n.protocol}
                    </span>
                  </td>
                  <td className="px-2 py-2 text-right text-xs whitespace-nowrap tabular-nums">
                    ↑{formatBytes(n.periodUp)} ↓{formatBytes(n.periodDown)}
                  </td>
                  <td className="px-2 py-2 text-right text-xs whitespace-nowrap text-emerald-600 tabular-nums dark:text-emerald-400">
                    {n.speed > 0 ? (
                      formatSpeed(n.speed)
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-2 py-2 text-right text-xs whitespace-nowrap tabular-nums">
                    {n.conns > 0 ? (
                      <span className="text-sky-600 dark:text-sky-400">
                        🔌 {n.conns}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-2 py-2 text-right text-xs tabular-nums">
                    {n.onlineUsers > 0 ? (
                      n.onlineUsers
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
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

/** 流量地图的一格:第一层(服务器)只画分隔线,第二层(节点)上色并写名字。 */
function TreemapCell(props: {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  depth?: number;
  name?: string;
  fill?: string;
  shade?: number;
  size?: number;
}) {
  const {
    x = 0,
    y = 0,
    width = 0,
    height = 0,
    depth = 0,
    name = "",
    shade = 0,
  } = props;
  if (depth === 0) return null;
  if (depth === 1)
    return (
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill="transparent"
        stroke="var(--card)"
        strokeWidth={4}
      />
    );
  const maxChars = Math.max(0, Math.floor((width - 12) / 8));
  const label =
    name.length > maxChars
      ? maxChars > 2
        ? `${name.slice(0, maxChars - 1)}…`
        : ""
      : name;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={props.fill}
        fillOpacity={1 - shade * 0.14}
        stroke="var(--card)"
        strokeWidth={1}
      />
      {width > 48 && height > 22 && label && (
        <text
          x={x + 6}
          y={y + 17}
          fill="#fff"
          stroke="rgba(0,0,0,0.28)"
          strokeWidth={1.5}
          strokeLinejoin="round"
          paintOrder="stroke"
          fontSize={12}
          fontWeight={600}
        >
          {label}
        </text>
      )}
      {width > 64 && height > 40 && props.size != null && (
        <text
          x={x + 6}
          y={y + 33}
          fill="#fff"
          fillOpacity={0.9}
          stroke="rgba(0,0,0,0.28)"
          strokeWidth={1.5}
          strokeLinejoin="round"
          paintOrder="stroke"
          fontSize={11}
        >
          {formatBytes(props.size)}
        </text>
      )}
    </g>
  );
}
