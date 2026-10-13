import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardView } from "./dashboard";
import {
  buildModel,
  formatBytes,
  liveSpeedAt,
  nodeUserUsage,
  NODES,
  RANGE_FACTOR,
  userNodeUsage,
  type TimeRange,
} from "./data";
import { NodesView } from "./nodes";
import { ServersView } from "./servers";
import { UsersView } from "./users";

// 首页的「流量信息」演示:照着面板首页做的 —— 仪表盘 / 用户 / 节点 / 服务器四个视图,
// 右上角切「今天 / 本周 / 本月」。数据全是本地编出来的,网速每 1.5 秒跳一次。

type View = "dashboard" | "users" | "nodes" | "servers";
type Drill =
  | { type: "user"; key: string }
  | { type: "node"; key: number }
  | null;

const RANGES: TimeRange[] = ["today", "week", "month"];
const LIVE_POINTS = 40;

function useTick(intervalMs: number) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTick((n) => n + 1), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return tick;
}

export default function OverviewDemo() {
  const { t } = useTranslation("overview");
  const { t: tl } = useTranslation("landing");
  const [view, setView] = useState<View>("dashboard");
  const [range, setRange] = useState<TimeRange>("month");
  const [drill, setDrill] = useState<Drill>(null);
  const tick = useTick(1500);

  const model = useMemo(() => buildModel(range, tick), [range, tick]);
  const live = useMemo(
    () =>
      Array.from({ length: LIVE_POINTS }, (_, i) =>
        liveSpeedAt(tick - LIVE_POINTS + 1 + i),
      ),
    [tick],
  );
  const counts: Record<View, number | null> = {
    dashboard: null,
    users: model.users.length,
    nodes: model.nodes.length,
    servers: model.servers.length,
  };

  const drillRows = useMemo(() => {
    if (!drill) return [];
    const f = RANGE_FACTOR[range];
    return drill.type === "user"
      ? userNodeUsage(drill.key, f).map((x) => ({
          key: String(x.node.id),
          name: x.node.name,
          up: x.up,
          down: x.down,
        }))
      : nodeUserUsage(drill.key, f).map((x) => ({
          key: x.user.username,
          name: x.user.username,
          up: x.up,
          down: x.down,
        }));
  }, [drill, range]);
  const drillMax = Math.max(1, ...drillRows.map((r) => r.up + r.down));
  const drillName = drill
    ? drill.type === "user"
      ? drill.key
      : (NODES.find((n) => n.id === drill.key)?.name ?? "")
    : "";

  return (
    <div className="bg-background rounded-xl border p-3 text-left shadow-sm sm:p-5">
      <Tabs
        value={view}
        onValueChange={(v) => setView(v as View)}
        className="gap-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList className="h-auto max-w-full flex-wrap justify-start">
            {(["dashboard", "users", "nodes", "servers"] as View[]).map((v) => (
              <TabsTrigger key={v} value={v} className="flex-none px-3 py-1.5">
                {t(`overview.tabs.${v}`)}
                {counts[v] != null && (
                  <span className="text-muted-foreground text-xs tabular-nums">
                    {counts[v]}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="bg-muted inline-flex rounded-lg p-[3px]">
            {RANGES.map((r) => (
              <button
                key={r}
                type="button"
                aria-pressed={range === r}
                onClick={() => setRange(r)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap transition",
                  range === r
                    ? "bg-background shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t(`timeRange.${r}`)}
              </button>
            ))}
          </div>
        </div>

        <TabsContent value="dashboard">
          <DashboardView
            range={range}
            model={model}
            live={live}
            onOpenView={setView}
            onDrilldown={(type, key) =>
              setDrill(
                type === "user" ? { type, key } : { type, key: Number(key) },
              )
            }
          />
        </TabsContent>
        <TabsContent value="users">
          <UsersView
            range={range}
            model={model}
            onDrilldown={(key) => setDrill({ type: "user", key })}
          />
        </TabsContent>
        <TabsContent value="nodes">
          <NodesView
            range={range}
            model={model}
            onDrilldown={(key) => setDrill({ type: "node", key })}
          />
        </TabsContent>
        <TabsContent value="servers">
          <ServersView range={range} model={model} tick={tick} />
        </TabsContent>
      </Tabs>

      <Dialog
        open={drill !== null}
        onOpenChange={(open) => !open && setDrill(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {drill?.type === "user"
                ? tl("xHome.trafficDemo.drillUser", { name: drillName })
                : tl("xHome.trafficDemo.drillNode", { name: drillName })}
            </DialogTitle>
            <DialogDescription>
              {drill?.type === "user"
                ? tl("xHome.trafficDemo.drillUserDesc")
                : tl("xHome.trafficDemo.drillNodeDesc")}
              {" · "}
              {t(`timeRange.${range}`)}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] space-y-2.5 overflow-y-auto pr-1">
            {drillRows.map((r) => (
              <div key={r.key} className="text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="min-w-0 truncate font-medium">{r.name}</span>
                  <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
                    ↑{formatBytes(r.up)} ↓{formatBytes(r.down)}
                  </span>
                </div>
                <div className="bg-muted mt-1 h-1">
                  <div
                    className="bg-primary h-full"
                    style={{ width: `${((r.up + r.down) / drillMax) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {drillRows.length === 0 && (
              <div className="text-muted-foreground py-6 text-center text-sm">
                {t("noData")}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
