import { useEffect, useState } from "react";

// 图表配色:图表要的是具体颜色值,从页面的 CSS 变量里读。

export type ChartColors = {
  series: string[];
  primary: string;
  muted: string;
  border: string;
  foreground: string;
  card: string;
  up: string;
  down: string;
  ok: string;
  warn: string;
  crit: string;
};

function readColors(): ChartColors {
  const css = getComputedStyle(document.documentElement);
  const v = (name: string, fallback: string) =>
    css.getPropertyValue(name).trim() || fallback;
  const dark = document.documentElement.classList.contains("dark");
  return {
    series: [
      v("--chart-1", "#d97757"),
      v("--chart-4", "#60a5fa"),
      v("--chart-5", "#22d3ee"),
      v("--chart-3", "#fcd34d"),
      v("--chart-2", "#f18c6e"),
      "#8b5cf6",
      "#94a3b8",
      "#34d399",
    ],
    primary: v("--primary", "#d97757"),
    muted: v("--muted-foreground", "#816055"),
    border: v("--border", "rgba(137,110,96,.38)"),
    foreground: v("--foreground", "#271610"),
    card: v("--card", "#ffffff"),
    up: dark ? "#4ade80" : "#16a34a",
    down: dark ? "#60a5fa" : "#2563eb",
    ok: dark ? "#14b8a6" : "#0d9488",
    warn: "#d97706",
    crit: dark ? "#ef4444" : "#dc2626",
  };
}

/** 图表要的是具体颜色值:从页面的 CSS 变量里读,切换明暗主题时重读。 */
export function useChartColors(): ChartColors {
  const [colors, setColors] = useState<ChartColors>(readColors);
  useEffect(() => {
    const obs = new MutationObserver(() => setColors(readColors()));
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style"],
    });
    return () => obs.disconnect();
  }, []);
  return colors;
}

export const tooltipStyle = {
  contentStyle: {
    background: "var(--popover)",
    border: "1px solid var(--border)",
    borderRadius: 6,
    fontSize: 12,
    color: "var(--popover-foreground)",
  },
  itemStyle: { color: "var(--popover-foreground)" },
  labelStyle: { color: "var(--muted-foreground)" },
};
