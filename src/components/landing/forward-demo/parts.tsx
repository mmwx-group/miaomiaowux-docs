import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { CELL_COLOR } from "./styles";

// 转发演示里几处共用的小部件。

export function Tag({
  className,
  children,
  title,
}: {
  className?: string;
  children: ReactNode;
  title?: string;
}) {
  return (
    <span
      title={title}
      className={cn(
        "inline-flex items-center rounded-md border px-1.5 py-px text-[11px] whitespace-nowrap",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** 一条小曲线,颜色跟文字色走。 */
export function Sparkline({
  values,
  className,
}: {
  values: number[];
  className?: string;
}) {
  if (values.length < 2)
    return <span className={cn("inline-block h-5 w-20", className)} />;
  const w = 80;
  const h = 20;
  const max = Math.max(...values, 1e-9);
  const d = values
    .map(
      (v, i) =>
        `${i ? "L" : "M"}${((i * w) / (values.length - 1)).toFixed(1)} ${(h - 2 - (v / max) * (h - 4)).toFixed(1)}`,
    )
    .join(" ");
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={cn("h-5 w-20 shrink-0", className)}
      aria-hidden="true"
    >
      <path
        d={d}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** 近 24 小时状态条,30 分钟一格。 */
export function MiniStatusBar({ cells }: { cells: string }) {
  return (
    <div className="flex h-2 gap-px" aria-hidden="true">
      {[...cells].map((c, i) => (
        <span
          key={i}
          className={cn("flex-1 rounded-[1px]", CELL_COLOR[c] ?? "bg-muted")}
        />
      ))}
    </div>
  );
}
