import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
} from "react";
import { useTranslation } from "react-i18next";
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useNodesInitialized,
  useNodesState,
  useReactFlow,
  type Connection,
  type Edge,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Check,
  Gauge,
  LayoutGrid,
  Loader2,
  PanelRight,
  Server,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CanvasCtx,
  DRAG_MIME,
  type CanvasCtxValue,
  type PoolItem,
} from "./context";
import { ChainSettings, GroupSettings } from "./inspector";
import { IperfPanel } from "./iperf-panel";
import {
  analyze,
  autoLayout,
  emptyDoc,
  estimateEdge,
  newGroup,
  runProbe,
  sampleDoc,
  wouldCycle,
  type CDoc,
  type CGroup,
  type Problem,
  type ProbeResult,
} from "./model";
import { FwdEdge, GroupNode } from "./nodes";
import { Pool } from "./pool";
import { ProbePanel } from "./probe-panel";

// 转发编排画布的演示:左边服务器池 / 节点池,中间画布,右边设置 / 延迟探测 / iperf3 测速。
// 搭链、连线、自动排版、校验、保存下发都能点,探测与测速的数字是按两地距离和带宽算出来的。

export type CanvasState = "draft" | "dirty" | "saved";
type Panel = "settings" | "probe" | "iperf";

const nodeTypes = { fwdGroup: GroupNode };
const edgeTypes = { fwdEdge: FwdEdge };
const toNodes = (pos: Record<string, { x: number; y: number }>): Node[] =>
  Object.entries(pos).map(([id, position]) => ({
    id,
    type: "fwdGroup",
    position,
    data: {},
  }));

function useIsDark() {
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains("dark"),
  );
  useEffect(() => {
    const obs = new MutationObserver(() =>
      setDark(document.documentElement.classList.contains("dark")),
    );
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => obs.disconnect();
  }, []);
  return dark;
}

type Props = {
  initial: CDoc | null;
  initialState: CanvasState;
  onClose: () => void;
  onSaved?: () => void;
};

export default function ForwardCanvas(props: Props) {
  return (
    <ReactFlowProvider>
      <Canvas {...props} />
    </ReactFlowProvider>
  );
}

function Canvas({ initial, initialState, onClose, onSaved }: Props) {
  const { t } = useTranslation("forward");
  const rf = useReactFlow();
  const dark = useIsDark();
  const [doc, setDoc] = useState<CDoc>(
    () => initial ?? emptyDoc(t("canvas.newName")),
  );
  const analysis = useMemo(() => analyze(doc), [doc]);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(
    toNodes(autoLayout(doc, analysis)),
  );
  const [status, setStatus] = useState<CanvasState>(initialState);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [showProblems, setShowProblems] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [panel, setPanel] = useState<Panel>("settings");
  const [sheet, setSheet] = useState<null | "pool" | "side">(null);
  const [probe, setProbe] = useState<ProbeResult | null>(null);
  const [probing, setProbing] = useState(false);
  const seq = useRef(100);
  const probeSeed = useRef(0);
  const timers = useRef<number[]>([]);
  const wrapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const list = timers.current;
    return () => list.forEach((id) => window.clearTimeout(id));
  }, []);
  // 打开时把整条链放进视野:要等各个组量完尺寸,量之前算出来的范围是错的
  const measured = useNodesInitialized();
  const fitted = useRef(false);
  useEffect(() => {
    if (!measured || fitted.current) return;
    fitted.current = true;
    rf.fitView({ padding: 0.2, maxZoom: 1 });
  }, [measured, rf]);
  const later = (fn: () => void, ms: number) =>
    timers.current.push(window.setTimeout(fn, ms));

  /** 改链:标成「有未保存的修改」;结构变了的话,之前的探测结果也作废。 */
  const mutate = useCallback((fn: (d: CDoc) => CDoc, structural = true) => {
    setDoc(fn);
    setStatus((s) => (s === "saved" ? "dirty" : s));
    setNotice(null);
    if (structural) setProbe(null);
  }, []);
  const patchGroup = (id: string, patch: Partial<CGroup>) =>
    mutate(
      (d) => ({
        ...d,
        groups: d.groups.map((g) => (g.id === id ? { ...g, ...patch } : g)),
      }),
      "members" in patch,
    );

  const select = useCallback((id: string | null) => {
    setSelected(id);
    if (id) {
      setPanel("settings");
      setSheet("side");
    }
  }, []);

  const dropInto = useCallback(
    (gid: string, item: PoolItem) =>
      mutate((d) => {
        const used = d.groups.some((g) =>
          (item.kind === "server" ? g.members : g.landings).includes(item.id),
        );
        if (used) return d;
        return {
          ...d,
          groups: d.groups.map((g) =>
            g.id !== gid
              ? g
              : item.kind === "server"
                ? { ...g, members: [...g.members, item.id] }
                : { ...g, landings: [...g.landings, item.id] },
          ),
        };
      }),
    [mutate],
  );
  const addGroupAt = (position: { x: number; y: number }, item: PoolItem) => {
    const id = `g${++seq.current}`;
    const name = t("canvas.newGroup", { n: doc.groups.length + 1 });
    const g = newGroup(
      id,
      name,
      item.kind === "server" ? [item.id] : [],
      item.kind === "landing" ? [item.id] : [],
    );
    setNodes((ns) => [...ns, { id, type: "fwdGroup", position, data: {} }]);
    mutate((d) => ({ ...d, groups: [...d.groups, g] }));
    setSelected(id);
  };
  const removeMember = useCallback(
    (gid: string, sid: number) =>
      mutate((d) => ({
        ...d,
        groups: d.groups.map((g) =>
          g.id === gid
            ? { ...g, members: g.members.filter((x) => x !== sid) }
            : g,
        ),
        // 这台身上的分支线跟着没了
        edges: d.edges.filter((e) => !(e.from === gid && e.member === sid)),
      })),
    [mutate],
  );
  const removeLanding = useCallback(
    (gid: string, nid: number) =>
      mutate((d) => ({
        ...d,
        groups: d.groups.map((g) =>
          g.id === gid
            ? { ...g, landings: g.landings.filter((x) => x !== nid) }
            : g,
        ),
      })),
    [mutate],
  );
  const deleteGroup = (id: string) => {
    mutate((d) => ({
      ...d,
      groups: d.groups.filter((g) => g.id !== id),
      edges: d.edges.filter((e) => e.from !== id && e.to !== id),
    }));
    setNodes((ns) => ns.filter((n) => n.id !== id));
    setSelected(null);
  };

  // 池子里点一下:有选中的组就加进去,没有就新建一组
  const onPick = (item: PoolItem) => {
    if (selected) return dropInto(selected, item);
    const box = wrapRef.current?.getBoundingClientRect();
    const at = box
      ? rf.screenToFlowPosition({
          x: box.left + box.width / 2 - 140,
          y: box.top + box.height / 2 - 80,
        })
      : { x: 0, y: 0 };
    const k = doc.groups.length % 5;
    addGroupAt({ x: at.x + k * 36, y: at.y + k * 36 }, item);
  };
  const onDrop = (e: DragEvent) => {
    const raw = e.dataTransfer.getData(DRAG_MIME);
    if (!raw) return;
    e.preventDefault();
    addGroupAt(
      rf.screenToFlowPosition({ x: e.clientX - 140, y: e.clientY - 30 }),
      JSON.parse(raw) as PoolItem,
    );
  };

  const onConnect = (c: Connection) => {
    if (!c.source || !c.target || c.source === c.target) return;
    const member = c.sourceHandle?.startsWith("m-")
      ? Number(c.sourceHandle.slice(2))
      : undefined;
    mutate((d) => {
      if (wouldCycle(d, c.source, c.target)) return d;
      if (
        d.edges.some(
          (e) =>
            e.from === c.source && e.to === c.target && e.member === member,
        )
      )
        return d;
      // 一台服务器只能有一条分支线
      const edges =
        member == null
          ? d.edges
          : d.edges.filter(
              (e) => !(e.from === c.source && e.member === member),
            );
      return {
        ...d,
        edges: [
          ...edges,
          { id: `e${++seq.current}`, from: c.source, to: c.target, member },
        ],
      };
    });
  };

  const layout = (target: CDoc = doc) => {
    setNodes(toNodes(autoLayout(target, analyze(target))));
    later(() => rf.fitView({ padding: 0.2, duration: 250, maxZoom: 1 }), 30);
  };
  const loadSample = () => {
    const next = sampleDoc(t("canvas.sample.name"), {
      entry: t("canvas.sample.entry"),
      relay: t("canvas.sample.relay"),
      exit: t("canvas.sample.exit"),
      branch: t("canvas.sample.branch"),
    });
    mutate(() => next);
    setSelected(null);
    layout(next);
  };

  const ready = analysis.trunk.length >= 2;
  const startProbe = (proto: "tcp" | "udp") => {
    if (!ready || probing) return;
    setProbing(true);
    const seed = ++probeSeed.current;
    later(() => {
      setProbe(runProbe(doc, analysis, proto, seed));
      setProbing(false);
    }, 1100);
  };
  const openPanel = (p: Panel) => {
    setSelected(null);
    setPanel(p);
    setSheet("side");
    if (p === "probe" && !probe) startProbe("tcp");
  };
  const save = () => {
    if (analysis.problems.length > 0) return setShowProblems(true);
    setSaving(true);
    later(() => {
      setSaving(false);
      setStatus("saved");
      setShowProblems(false);
      setNotice(
        t("canvas.saved", {
          count: new Set(doc.groups.flatMap((g) => g.members)).size,
        }),
      );
      onSaved?.();
    }, 900);
  };

  const { pathMs, activeEdges } = useMemo(() => {
    const ms: Record<string, number | undefined> = {};
    const active = new Set<string>();
    for (const ps of analysis.pathSets) {
      const totals = ps.paths.map((p) => {
        let sum = 0;
        for (const eid of p.edges) {
          const e = doc.edges.find((x) => x.id === eid);
          const v = probe ? probe.edgeMs[eid] : e && estimateEdge(doc, e);
          if (v == null) return undefined;
          sum += v;
        }
        return sum;
      });
      ps.paths.forEach((p, k) => (ms[p.edges[0]] = totals[k]));
      const best = totals.reduce<number>(
        (bi, v, i) => (v != null && (bi < 0 || v < totals[bi]!) ? i : bi),
        -1,
      );
      if (best >= 0) ps.paths[best].edges.forEach((id) => active.add(id));
    }
    return { pathMs: ms, activeEdges: active };
  }, [analysis, doc, probe]);

  const edges = useMemo<Edge[]>(
    () =>
      doc.edges.map((e) => ({
        id: e.id,
        source: e.from,
        target: e.to,
        sourceHandle: e.member != null ? `m-${e.member}` : "out",
        targetHandle: "in",
        type: "fwdEdge",
      })),
    [doc.edges],
  );
  const ctx = useMemo<CanvasCtxValue>(
    () => ({
      doc,
      analysis,
      selected,
      probe,
      probing,
      pathMs,
      activeEdges,
      select,
      removeMember,
      removeLanding,
      dropInto,
    }),
    [
      doc,
      analysis,
      selected,
      probe,
      probing,
      pathMs,
      activeEdges,
      select,
      removeMember,
      removeLanding,
      dropInto,
    ],
  );

  const groupName = (id: string) =>
    doc.groups.find((g) => g.id === id)?.name ?? "";
  const problemText = (p: Problem) =>
    p.kind === "tooShort"
      ? t("canvas.problem.tooShort")
      : p.kind === "multiEntry"
        ? t("canvas.problem.multiEntry", { count: p.count })
        : t(`canvas.problem.${p.kind}`, { group: groupName(p.group) });
  const selectedGroup = doc.groups.find((g) => g.id === selected);
  const tool =
    "bg-background hover:bg-muted inline-flex h-9 shrink-0 items-center gap-1.5 rounded border px-2.5 text-sm font-semibold disabled:opacity-50";
  const toolOn =
    "bg-primary text-primary-foreground border-primary hover:bg-primary";
  const sheetCls = (name: "pool" | "side", width: string) =>
    cn(
      "bg-background shrink-0 lg:static lg:block lg:h-auto",
      width,
      sheet === name
        ? "absolute inset-x-0 bottom-0 z-20 h-[62%] border-t shadow-2xl lg:border-t-0 lg:shadow-none"
        : "hidden",
    );

  return (
    <CanvasCtx.Provider value={ctx}>
      <div className="bg-background flex h-full min-h-0 flex-col text-left">
        {/* 工具栏 */}
        <div className="flex flex-wrap items-center gap-2 border-b px-3 py-2">
          <button
            type="button"
            className={tool}
            onClick={onClose}
            aria-label={t("canvas.toolbar.back")}
          >
            <ArrowLeft className="size-4" />
          </button>
          <div className="min-w-0">
            <div className="text-muted-foreground text-[11px]">
              {t("canvas.crumb")}
            </div>
            <b className="block max-w-[40vw] truncate text-sm sm:max-w-xs">
              {doc.name}
            </b>
          </div>
          <span
            className={cn(
              "rounded border px-2 py-0.5 text-xs",
              status === "dirty" &&
                "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-300",
            )}
          >
            {saving ? t("canvas.state.saving") : t(`canvas.state.${status}`)}
          </span>
          {analysis.problems.length > 0 ? (
            <button
              type="button"
              onClick={() => setShowProblems(!showProblems)}
              className="inline-flex items-center gap-1 rounded border border-red-300 bg-red-50 px-2 py-0.5 text-xs text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300"
            >
              <AlertTriangle className="size-3.5" />
              {t("canvas.problems", { count: analysis.problems.length })}
            </button>
          ) : (
            <span className="inline-flex items-center gap-1 rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300">
              <Check className="size-3.5" />
              {t("canvas.summary", {
                hops: analysis.trunk.length,
                branches: analysis.branches,
                paths: analysis.pathSets.length,
              })}
            </span>
          )}
          <div className="flex-1" />
          <button type="button" className={tool} onClick={() => layout()}>
            <LayoutGrid className="size-4" />
            <span className="hidden sm:inline">
              {t("canvas.toolbar.layout")}
            </span>
          </button>
          <button
            type="button"
            className={cn(tool, panel === "probe" && toolOn)}
            onClick={() => openPanel("probe")}
          >
            <Activity className="size-4" />
            <span className="hidden sm:inline">
              {t("canvas.toolbar.probe")}
            </span>
          </button>
          <button
            type="button"
            className={cn(tool, panel === "iperf" && toolOn)}
            onClick={() => openPanel("iperf")}
          >
            <Gauge className="size-4" />
            <span className="hidden sm:inline">
              {t("canvas.toolbar.iperf")}
            </span>
          </button>
          <button
            type="button"
            className={cn(tool, toolOn, "hover:opacity-90")}
            disabled={saving}
            onClick={save}
          >
            {saving && <Loader2 className="size-4 animate-spin" />}
            {t("canvas.toolbar.save")}
          </button>
        </div>
        {showProblems && analysis.problems.length > 0 && (
          <ul className="border-b border-red-200 bg-red-50 px-4 py-2 text-xs text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            {analysis.problems.map((p, i) => (
              <li key={i} className="list-inside list-disc">
                {"group" in p ? (
                  <button
                    type="button"
                    className="underline decoration-dotted underline-offset-2"
                    onClick={() => select(p.group)}
                  >
                    {problemText(p)}
                  </button>
                ) : (
                  problemText(p)
                )}
              </li>
            ))}
          </ul>
        )}
        {notice && (
          <div className="flex items-center gap-1.5 border-b border-emerald-200 bg-emerald-50 px-4 py-2 text-xs text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
            <Check className="size-3.5" />
            {notice}
          </div>
        )}

        <div className="relative flex min-h-0 flex-1">
          <aside className={cn(sheetCls("pool", "lg:w-64"), "lg:border-r")}>
            <Pool doc={doc} onPick={onPick} />
          </aside>

          <div
            ref={wrapRef}
            className="relative min-w-0 flex-1"
            onDragOver={(e) =>
              e.dataTransfer.types.includes(DRAG_MIME) && e.preventDefault()
            }
            onDrop={onDrop}
          >
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              onNodesChange={onNodesChange}
              onConnect={onConnect}
              onEdgeDoubleClick={(_, edge) =>
                mutate((d) => ({
                  ...d,
                  edges: d.edges.filter((e) => e.id !== edge.id),
                }))
              }
              onPaneClick={() => {
                setSelected(null);
                setSheet(null);
              }}
              isValidConnection={(c) => c.source !== c.target}
              colorMode={dark ? "dark" : "light"}
              nodeClickDistance={5}
              deleteKeyCode={null}
              minZoom={0.3}
              maxZoom={1.8}
              connectionLineStyle={{ stroke: "var(--primary)", strokeWidth: 2 }}
              proOptions={{ hideAttribution: true }}
            >
              <Background
                variant={BackgroundVariant.Dots}
                gap={22}
                size={1.2}
              />
              <Controls showInteractive={false} />
              <MiniMap
                pannable
                zoomable
                className="!bg-background hidden sm:block"
              />
            </ReactFlow>
            {doc.groups.length === 0 && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
                <div className="bg-card pointer-events-auto flex max-w-sm flex-col items-center gap-2 rounded-lg border border-dashed p-5 text-center">
                  <b>{t("canvas.empty.title")}</b>
                  <p className="text-muted-foreground text-xs leading-5">
                    {t("canvas.empty.desc")}
                  </p>
                  <button
                    type="button"
                    className={cn(tool, toolOn, "hover:opacity-90")}
                    onClick={loadSample}
                  >
                    {t("canvas.empty.sample")}
                  </button>
                </div>
              </div>
            )}
            {/* 窄屏:池子和面板收在底部抽屉里 */}
            <div className="absolute top-2 left-2 flex gap-1.5 lg:hidden">
              <button
                type="button"
                className={cn(tool, "h-8 text-xs", sheet === "pool" && toolOn)}
                onClick={() => setSheet(sheet === "pool" ? null : "pool")}
              >
                <Server className="size-3.5" />
                {t("canvas.mobile.pool")}
              </button>
              <button
                type="button"
                className={cn(tool, "h-8 text-xs", sheet === "side" && toolOn)}
                onClick={() => setSheet(sheet === "side" ? null : "side")}
              >
                <PanelRight className="size-3.5" />
                {t("canvas.mobile.panel")}
              </button>
            </div>
          </div>

          <aside
            className={cn(
              sheetCls("side", "lg:w-[340px]"),
              "overflow-y-auto lg:border-l",
            )}
          >
            {selectedGroup ? (
              <GroupSettings
                group={selectedGroup}
                analysis={analysis}
                pathMs={pathMs}
                activeEdges={activeEdges}
                onChange={(patch) => patchGroup(selectedGroup.id, patch)}
                onDelete={() => deleteGroup(selectedGroup.id)}
                onClose={() => setSelected(null)}
              />
            ) : panel === "probe" ? (
              <ProbePanel
                doc={doc}
                result={probe}
                probing={probing}
                ready={ready}
                onRun={startProbe}
                onClose={() => setPanel("settings")}
              />
            ) : panel === "iperf" ? (
              <IperfPanel
                doc={doc}
                analysis={analysis}
                onClose={() => setPanel("settings")}
              />
            ) : (
              <ChainSettings
                doc={doc}
                onChange={(patch) => mutate((d) => ({ ...d, ...patch }), false)}
              />
            )}
          </aside>
        </div>
      </div>
    </CanvasCtx.Provider>
  );
}
