import { createContext, useContext } from "react";
import type { Analysis, CDoc, ProbeResult } from "./model";

// 画布上的组与连线都是 React Flow 的自定义组件,它们要的数据从这里拿。

export type PoolItem = { kind: "server" | "landing"; id: number };
export const DRAG_MIME = "application/x-fwd-demo";

export type CanvasCtxValue = {
  doc: CDoc;
  analysis: Analysis;
  selected: string | null;
  probe: ProbeResult | null;
  probing: boolean;
  /** 选路段里每条路的总延迟,键是这条路的第一条线 */
  pathMs: Record<string, number | undefined>;
  /** 选路段里当前在用的那条路上的线 */
  activeEdges: Set<string>;
  select: (id: string | null) => void;
  removeMember: (group: string, server: number) => void;
  removeLanding: (group: string, landing: number) => void;
  dropInto: (group: string, item: PoolItem) => void;
};

export const CanvasCtx = createContext<CanvasCtxValue | null>(null);
export function useCanvas(): CanvasCtxValue {
  const v = useContext(CanvasCtx);
  if (!v) throw new Error("CanvasCtx missing");
  return v;
}

export const ROLE_COLOR = {
  entry: "#b0543a",
  relay: "#8a6d3b",
  exit: "#2f4b7c",
  pathRelay: "#2f6f66",
  branchRelay: "#7a5cc0",
  loose: "#8b8b8b",
} as const;
export const PATH_COLOR = "#3a8f82";
export const BRANCH_COLOR = "#7a5cc0";

/** 延迟的颜色:快的绿、一般的黄、慢的红。 */
export const msTone = (ms?: number) =>
  ms == null
    ? "text-red-700 dark:text-red-400"
    : ms < 80
      ? "text-emerald-700 dark:text-emerald-400"
      : ms < 200
        ? "text-amber-700 dark:text-amber-400"
        : "text-red-700 dark:text-red-400";
export const fmtMs1 = (ms?: number) =>
  ms == null ? "—" : `${ms.toFixed(1)}ms`;
