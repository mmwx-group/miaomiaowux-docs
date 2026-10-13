import type { ChainStatus, LinkState } from "./data";

// 状态配色:两两之间明度也不同(不只靠色相区分),深色模式下提亮。

export const STATUS_DOT: Record<ChainStatus, string> = {
  healthy: "bg-emerald-700 dark:bg-emerald-400",
  degraded: "bg-amber-600 dark:bg-amber-400",
  broken: "bg-red-700 dark:bg-red-400",
  pending: "bg-stone-400 dark:bg-stone-500",
};

export const STATUS_TAG: Record<ChainStatus, string> = {
  healthy:
    "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900",
  degraded:
    "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900",
  broken:
    "bg-red-50 text-red-800 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-900",
  pending: "bg-muted text-muted-foreground border-border",
};

export const STATUS_BORDER: Record<ChainStatus, string> = {
  healthy: "border-border",
  degraded: "border-amber-300 dark:border-amber-900",
  broken: "border-red-300 dark:border-red-900",
  pending: "border-dashed border-stone-300 dark:border-stone-700",
};

export const LINK_TEXT: Record<LinkState, string> = {
  ok: "text-emerald-700 dark:text-emerald-400",
  degraded: "text-amber-700 dark:text-amber-400",
  down: "text-red-700 dark:text-red-400",
  unknown: "text-muted-foreground",
};

export const LINK_BAR: Record<LinkState, string> = {
  ok: "bg-emerald-700 dark:bg-emerald-400",
  degraded: "bg-amber-600 dark:bg-amber-400",
  down: "",
  unknown: "",
};

export const CELL_COLOR: Record<string, string> = {
  h: "bg-emerald-600 dark:bg-emerald-500",
  d: "bg-amber-500",
  b: "bg-red-600 dark:bg-red-500",
};

export const DASH: Record<"down" | "unknown", string> = {
  down: "border-red-600 dark:border-red-400",
  unknown: "border-stone-300 dark:border-stone-600",
};

/** 演示里的小按钮:实心 / 描边两种。 */
export const BTN =
  "inline-flex h-8 items-center justify-center gap-1.5 rounded-md border px-3 text-xs font-medium whitespace-nowrap transition";
export const BTN_SOLID =
  "border-primary bg-primary text-primary-foreground hover:opacity-90";
export const BTN_OUTLINE = "bg-background hover:bg-muted";
