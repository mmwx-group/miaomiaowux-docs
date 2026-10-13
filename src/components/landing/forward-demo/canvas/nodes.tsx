import { useEffect, type DragEvent } from "react";
import { useTranslation } from "react-i18next";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  Handle,
  Position,
  useUpdateNodeInternals,
  type EdgeProps,
  type NodeProps,
} from "@xyflow/react";
import { GripVertical, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  BRANCH_COLOR,
  DRAG_MIME,
  msTone,
  PATH_COLOR,
  ROLE_COLOR,
  useCanvas,
  type PoolItem,
} from "./context";
import { landingById, NODE_W, serverById } from "./model";

// 画布上的两种自定义元素:组(一个虚线框,里面是成员)和连线(带延迟标签)。

const HANDLE = "!size-3.5 !border-2 !bg-background";

export function GroupNode({ id }: NodeProps) {
  const { t } = useTranslation("forward");
  const {
    doc,
    analysis,
    selected,
    pathMs,
    select,
    removeMember,
    removeLanding,
    dropInto,
  } = useCanvas();
  const g = doc.groups.find((x) => x.id === id);
  const update = useUpdateNodeInternals();
  const memberKey = g ? g.members.join(",") + "|" + g.landings.join(",") : "";
  // 成员行上各有一个连线圆点,成员变了要让画布重新量一遍位置
  useEffect(() => update(id), [id, memberKey, update]);
  if (!g) return null;

  const role = analysis.roles[id] ?? "loose";
  const color = ROLE_COLOR[role];
  const pathSet = analysis.pathSets.find((p) => p.from === id);
  const canBranch = role === "entry" || role === "relay";
  const onDrop = (e: DragEvent) => {
    const raw = e.dataTransfer.getData(DRAG_MIME);
    if (!raw) return;
    e.preventDefault();
    e.stopPropagation();
    dropInto(id, JSON.parse(raw) as PoolItem);
  };
  const chip = "rounded-sm border px-1.5 py-px text-[11px] whitespace-nowrap";
  return (
    <div
      className={cn(
        "bg-card/95 rounded-md border-2 border-dashed px-3 pt-2.5 pb-3 shadow-sm",
        selected === id && "ring-primary ring-2 ring-offset-2",
      )}
      style={{ width: NODE_W, borderColor: color }}
      onClick={() => select(id)}
      onDragOver={(e) =>
        e.dataTransfer.types.includes(DRAG_MIME) && e.preventDefault()
      }
      onDrop={onDrop}
    >
      <Handle
        type="target"
        id="in"
        position={Position.Left}
        className={HANDLE}
        style={{ top: 24, borderColor: color }}
      />
      <Handle
        type="source"
        id="out"
        position={Position.Right}
        className={HANDLE}
        style={{ top: 24, borderColor: color }}
      />
      <div className="flex items-center gap-2">
        <span
          className="shrink-0 rounded-sm px-1.5 py-0.5 text-[11px] font-bold text-white"
          style={{ background: color }}
        >
          {t(`canvas.role.${role}`)}
        </span>
        <b className="truncate text-[15px]">{g.name}</b>
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        <span className={chip}>
          {t(
            g.members.length <= 1
              ? "strategy.direct"
              : `strategy.${g.strategy}`,
          )}
        </span>
        {g.failover && <span className={chip}>{t("strategy.failover")}</span>}
        {g.engine && <span className={cn(chip, "font-mono")}>{g.engine}</span>}
        {pathSet && (
          <span
            className={cn(chip, "border-transparent font-bold text-white")}
            style={{ background: PATH_COLOR }}
          >
            {t("canvas.node.pathPick")}
          </span>
        )}
      </div>
      <div className="mt-2 flex flex-col gap-1.5">
        {g.members.map((sid) => {
          const s = serverById(sid);
          return (
            <div
              key={sid}
              className="bg-background relative rounded border px-2 py-1.5"
            >
              <div className="flex items-center gap-1.5">
                <GripVertical className="text-muted-foreground size-3.5 shrink-0" />
                <i
                  className={cn(
                    "size-2 shrink-0 rounded-full",
                    s.online ? "bg-emerald-600" : "border border-red-600",
                  )}
                />
                <span className="min-w-0 flex-1 truncate text-sm">
                  {s.name}
                </span>
                <button
                  type="button"
                  className="nodrag text-muted-foreground hover:text-foreground"
                  aria-label={t("canvas.node.remove")}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeMember(id, sid);
                  }}
                >
                  <X className="size-3.5" />
                </button>
              </div>
              <div className="text-muted-foreground mt-0.5 truncate pl-5 font-mono text-[11px]">
                {s.ip}
                {!s.online && (
                  <span className="text-red-700 dark:text-red-400">
                    {" "}
                    · {t("topo.offline")}
                  </span>
                )}
              </div>
              {canBranch && (
                <Handle
                  type="source"
                  id={`m-${sid}`}
                  position={Position.Right}
                  className="!bg-background !size-3 !border-2"
                  style={{ right: -22, borderColor: BRANCH_COLOR }}
                />
              )}
            </div>
          );
        })}
        {g.landings.map((nid) => {
          const n = landingById(nid);
          return (
            <div
              key={`n${nid}`}
              className="bg-foreground text-background rounded px-2 py-1.5"
            >
              <div className="flex items-center gap-1.5">
                <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                  {n.name}
                </span>
                <button
                  type="button"
                  className="nodrag opacity-70 hover:opacity-100"
                  aria-label={t("canvas.node.remove")}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeLanding(id, nid);
                  }}
                >
                  <X className="size-3.5" />
                </button>
              </div>
              <div className="truncate font-mono text-[11px] opacity-70">
                {t("topo.landing")} · {n.addr}
              </div>
            </div>
          );
        })}
        {g.members.length + g.landings.length === 0 && (
          <div className="text-muted-foreground rounded border border-dashed py-2.5 text-center text-xs">
            {t("canvas.node.empty")}
          </div>
        )}
      </div>
      {pathSet && (
        <div
          className="mt-2 flex flex-wrap gap-x-3 font-mono text-[11px]"
          style={{ color: PATH_COLOR }}
        >
          {pathSet.paths.map((p, k) => (
            <span key={k}>
              {t("canvas.edge.path", { n: k + 1 })}{" "}
              {pathMs[p.edges[0]] != null
                ? `${Math.round(pathMs[p.edges[0]]!)}ms`
                : t("canvas.edge.down")}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function FwdEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
}: EdgeProps) {
  const { t } = useTranslation("forward");
  const { analysis, probe, probing, pathMs, activeEdges } = useCanvas();
  const [path, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });
  const kind = analysis.edgeKind[id] ?? "trunk";
  const active = activeEdges.has(id);
  const stroke =
    kind === "branch"
      ? BRANCH_COLOR
      : kind === "path"
        ? PATH_COLOR
        : "var(--primary)";
  const style =
    kind === "trunk"
      ? { stroke, strokeWidth: 2.5 }
      : kind === "path"
        ? {
            stroke,
            strokeWidth: active ? 3.5 : 2,
            strokeDasharray: active ? undefined : "5 5",
          }
        : { stroke, strokeWidth: 2, strokeDasharray: "3 5" };

  const pathNo = analysis.pathIndex[id];
  let label: string | null = null;
  let tone = "";
  if (probing) label = "…";
  else if (probe) {
    const ms = probe.edgeMs[id];
    label = ms == null ? t("canvas.edge.down") : `${Math.round(ms)}ms`;
    tone = msTone(ms);
  }
  if (pathNo != null) {
    // 一条路的第一条线上写的是整条路的总延迟,选路比的就是它
    const total = pathMs[id];
    const parts = [t("canvas.edge.path", { n: pathNo + 1 })];
    if (probing) parts.push("…");
    else
      parts.push(
        total != null ? `${Math.round(total)}ms` : t("canvas.edge.down"),
      );
    if (active) parts.push(t("canvas.edge.active"));
    label = parts.join(" · ");
    tone = "";
  }
  return (
    <>
      <BaseEdge id={id} path={path} style={style} interactionWidth={24} />
      {label && (
        <EdgeLabelRenderer>
          <div
            className={cn(
              "bg-background nodrag nopan pointer-events-none absolute rounded border px-1.5 py-0.5 font-mono text-[11px] font-bold",
              tone,
            )}
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              borderColor: tone ? "currentColor" : stroke,
              color: tone ? undefined : stroke,
            }}
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
