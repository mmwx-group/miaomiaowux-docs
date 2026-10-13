import { type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { QuotaState } from "./data";

// 演示各视图共用的小部件:指标卡、迷你曲线、配额条、分区卡片、标签、筛选按钮、可排序表头。

export function KpiTile({
  label,
  value,
  unit,
  foot,
  spark,
  sparkColor,
}: {
  label: string;
  value: ReactNode;
  unit?: string;
  foot?: ReactNode;
  spark?: number[];
  sparkColor?: string;
}) {
  return (
    <Card className="gap-0 py-4">
      <CardContent className="px-4">
        <div className="text-muted-foreground text-xs tracking-wide">
          {label}
        </div>
        <div className="mt-1 text-2xl leading-tight font-semibold tabular-nums">
          {value}
          {unit && (
            <span className="text-muted-foreground ml-1 text-sm font-medium">
              {unit}
            </span>
          )}
        </div>
        {foot && (
          <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-1.5 text-xs">
            {foot}
          </div>
        )}
        {spark && spark.length > 1 && (
          <Sparkline values={spark} color={sparkColor} className="mt-2 h-8" />
        )}
      </CardContent>
    </Card>
  );
}

export function Sparkline({
  values,
  color = "var(--primary)",
  className,
}: {
  values: number[];
  color?: string;
  className?: string;
}) {
  const w = 200;
  const h = 32;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const pts = values.map((v, i) => [
    (i * w) / Math.max(values.length - 1, 1),
    h - 2 - ((v - min) / (max - min || 1)) * (h - 6),
  ]);
  const d = pts
    .map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`)
    .join(" ");
  const last = pts[pts.length - 1];
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className={cn("block w-full", className)}
      aria-hidden="true"
    >
      <path d={`${d} L${w} ${h} L0 ${h} Z`} fill={color} fillOpacity={0.14} />
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={1.6}
        vectorEffect="non-scaling-stroke"
      />
      <circle cx={last[0]} cy={last[1]} r={2.4} fill={color} />
    </svg>
  );
}

const QUOTA_BAR_CLASS: Record<QuotaState, string> = {
  ok: "bg-teal-600 dark:bg-teal-500",
  warn: "bg-amber-500",
  crit: "bg-red-600 dark:bg-red-500",
  unlimited: "",
};

/** 配额条:填充 = 已用比例,竖线 = 周期已过比例。不限流量画虚线。 */
export function QuotaBar({
  ratio,
  progress,
  state,
  className,
}: {
  ratio: number;
  progress?: number;
  state: QuotaState;
  className?: string;
}) {
  return (
    <div className={cn("bg-muted relative h-1.5 w-full", className)}>
      {state === "unlimited" ? (
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, var(--muted-foreground) 0 3px, transparent 3px 6px)",
          }}
        />
      ) : (
        <div
          className={cn("absolute inset-y-0 left-0", QUOTA_BAR_CLASS[state])}
          style={{ width: `${Math.min(100, Math.max(0, ratio * 100))}%` }}
        />
      )}
      {state !== "unlimited" && progress != null && (
        <div
          className="bg-foreground absolute -top-0.5 -bottom-0.5 w-0.5 opacity-60"
          style={{ left: `calc(${progress * 100}% - 1px)` }}
        />
      )}
    </div>
  );
}

export function QuotaLegend() {
  const { t } = useTranslation("overview");
  return (
    <div className="text-muted-foreground mt-3 flex flex-wrap gap-3 text-xs">
      <span className="inline-flex items-center gap-1">
        <i className="inline-block size-2.5 bg-teal-600" />
        {t("overview.legend.ok")}
      </span>
      <span className="inline-flex items-center gap-1">
        <i className="inline-block size-2.5 bg-amber-500" />
        {t("overview.legend.warn")}
      </span>
      <span className="inline-flex items-center gap-1">
        <i className="inline-block size-2.5 bg-red-600" />
        {t("overview.legend.crit")}
      </span>
      <span className="inline-flex items-center gap-1">
        <i className="bg-foreground inline-block h-2.5 w-0.5 opacity-60" />
        {t("overview.legend.progress")}
      </span>
    </div>
  );
}

export function Section({
  title,
  description,
  className,
  contentClassName,
  children,
}: {
  title: ReactNode;
  description?: ReactNode;
  className?: string;
  contentClassName?: string;
  children: ReactNode;
}) {
  return (
    <Card className={cn("min-w-0 gap-3", className)}>
      <CardHeader className="space-y-0">
        <CardTitle className="text-base">{title}</CardTitle>
        {description && (
          <CardDescription className="mt-1">{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className={contentClassName}>{children}</CardContent>
    </Card>
  );
}

export function Chip({
  tone = "muted",
  children,
}: {
  tone?: "ok" | "warn" | "crit" | "muted";
  children: ReactNode;
}) {
  const cls = {
    ok: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400",
    warn: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
    crit: "bg-red-500/12 text-red-700 dark:text-red-400",
    muted: "bg-muted text-muted-foreground",
  }[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm px-1.5 py-px text-[11px] whitespace-nowrap",
        cls,
      )}
    >
      {children}
    </span>
  );
}

export function OnlineDot({
  online,
  className,
}: {
  online: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-block size-2 shrink-0 rounded-full",
        online ? "bg-emerald-500" : "bg-muted-foreground/30",
        className,
      )}
    />
  );
}

/** 表头:点击排序。 */
export function SortHead({
  label,
  active,
  dir,
  onClick,
  align = "left",
}: {
  label: string;
  active: boolean;
  dir: 1 | -1;
  onClick: () => void;
  align?: "left" | "right";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap",
        align === "right" && "ml-auto",
      )}
    >
      {label}
      <span className={cn("text-[10px]", active ? "opacity-80" : "opacity-0")}>
        {dir > 0 ? "▲" : "▼"}
      </span>
    </button>
  );
}

export function FilterChips<K extends string>({
  options,
  value,
  onChange,
}: {
  options: Array<{ key: K; label: string; count: number }>;
  value: K;
  onChange: (k: K) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o.key}
          type="button"
          aria-pressed={o.key === value}
          onClick={() => onChange(o.key)}
          className={cn(
            "rounded-md border px-2.5 py-1 text-xs transition",
            o.key === value
              ? "border-primary bg-primary/10 text-primary font-semibold"
              : "hover:bg-muted",
          )}
        >
          {o.label}
          <span className="ml-1 tabular-nums opacity-70">{o.count}</span>
        </button>
      ))}
    </div>
  );
}

export function Empty({ text }: { text: string }) {
  return (
    <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
      {text}
    </div>
  );
}
