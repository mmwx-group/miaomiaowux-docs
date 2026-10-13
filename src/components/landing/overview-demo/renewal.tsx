import { Fragment, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CNY_RATE,
  currencySymbol,
  dateAfter,
  priceText,
  RENEW_SPAN,
  shortDate,
  type RenewalItem,
  type RenewalLine,
} from "./data";

// 续费日历:未来 60 天画成一条折返的时间轴 —— 一行走到头,竖直往下接下一行,拐角是圆角。
// 每次续费按到期日标在轴上(剩余天数 / 日期 / 价格),已过期的单独列在轴前面;底下是本月与下月的合计。

/** 一行最矮多高 */
const ROW_MIN = 124;
/** 左右留白(占宽度的百分比),竖线画在留白的内沿 */
const EDGE = 5;
/** 拐角的圆角半径(像素) */
const RADIUS = 10;
/** 标签贴着轴线的距离 */
const STEM = 20;

/** 标签大概多高:每次续费两行字,带「按周期预估 / 自动续期」的会再折一行 */
const bubbleHeight = (items: RenewalItem[]) =>
  10 +
  items.reduce((a, it) => a + 34 + (it.projected || it.autoRenew ? 14 : 0), 0);

type Bubble = {
  row: number;
  x: number;
  items: RenewalItem[];
  side: "up" | "down";
  far: boolean;
  height: number;
};

export function RenewalTimeline({ items }: { items: RenewalItem[] }) {
  const { t } = useTranslation("overview");
  const boxRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  // 宽的时候一行 20 天、共三行;窄的时候一行 10 天、共六行
  const wide = width === 0 || width >= 520;
  const perRow = wide ? 20 : 10;
  const rows = RENEW_SPAN / perRow;

  const expired = items.filter((i) => i.days < 0);
  const upcoming = items.filter((i) => i.days >= 0 && i.days <= RENEW_SPAN);

  /** 第几天落在第几行的什么位置:偶数行从左往右,奇数行从右往左 */
  const locate = (day: number) => {
    const d = Math.min(day, RENEW_SPAN - 1e-4);
    const row = Math.floor(d / perRow);
    const along = (d - row * perRow) / perRow;
    return {
      row,
      x: EDGE + (row % 2 === 0 ? along : 1 - along) * (100 - EDGE * 2),
    };
  };

  // 同一行里挨得近的几次续费合进一个标签,标签在轴的上下两侧交替放;同侧还是挤就再往外推一层
  const mergeWithin = wide ? 11 : 22;
  const bubbleWidth = wide ? 24 : 48;
  const bubbles: Bubble[] = [];
  for (const it of upcoming) {
    const at = locate(it.days);
    const prev = bubbles[bubbles.length - 1];
    if (
      prev &&
      prev.row === at.row &&
      Math.abs(locate(prev.items[0].days).x - at.x) < mergeWithin
    ) {
      prev.items.push(it);
      prev.x =
        prev.items.reduce((a, x) => a + locate(x.days).x, 0) /
        prev.items.length;
      prev.height = bubbleHeight(prev.items);
      continue;
    }
    const sameRow = bubbles.filter((b) => b.row === at.row);
    const crowded = (side: Bubble["side"]) =>
      sameRow.some(
        (b) => b.side === side && !b.far && Math.abs(b.x - at.x) < bubbleWidth,
      );
    let side: Bubble["side"] = sameRow.length % 2 === 0 ? "up" : "down";
    let far = false;
    if (crowded(side)) {
      const other = side === "up" ? "down" : "up";
      if (crowded(other)) far = true;
      else side = other;
    }
    bubbles.push({
      row: at.row,
      x: at.x,
      items: [it],
      side,
      far,
      height: bubbleHeight([it]),
    });
  }
  const stemOf = (b: Bubble) =>
    b.far
      ? STEM +
        8 +
        Math.max(
          0,
          ...bubbles
            .filter(
              (o) => o !== b && o.row === b.row && o.side === b.side && !o.far,
            )
            .map((o) => o.height),
        )
      : STEM;

  // 每行的高度只管放得下自己的标签:扎堆的那行才变高
  const rowHeight = Array.from({ length: rows }, (_, r) => {
    const reach = Math.max(
      0,
      ...bubbles.filter((b) => b.row === r).map((b) => stemOf(b) + b.height),
    );
    return Math.max(ROW_MIN, reach * 2 + 12);
  });
  const rowY = (r: number) =>
    rowHeight.slice(0, r).reduce((a, h) => a + h, 0) + rowHeight[r] / 2;
  const total = rowHeight.reduce((a, h) => a + h, 0);

  // 轴线。横向是百分比、纵向是像素,圆角两个方向的半径分开换算才是正圆
  const rx = width > 0 ? (RADIUS / width) * 100 : 1;
  let axis = "";
  for (let r = 0; r < rows; r++) {
    const y = rowY(r);
    const ltr = r % 2 === 0;
    const [from, to] = ltr ? [EDGE, 100 - EDGE] : [100 - EDGE, EDGE];
    if (r === 0) axis += `M ${from} ${y}`;
    if (r === rows - 1) {
      axis += ` L ${to} ${y}`;
      break;
    }
    const inward = ltr ? -rx : rx;
    const sweep = ltr ? 1 : 0;
    const nextY = rowY(r + 1);
    axis += ` L ${to + inward} ${y} A ${rx} ${RADIUS} 0 0 ${sweep} ${to} ${y + RADIUS} L ${to} ${nextY - RADIUS} A ${rx} ${RADIUS} 0 0 ${sweep} ${to + inward} ${nextY}`;
  }

  const dotTone = (days: number) =>
    days <= 7
      ? "bg-amber-500 ring-amber-500/30"
      : days <= 30
        ? "bg-emerald-600 ring-emerald-600/25"
        : "bg-muted-foreground/60 ring-muted-foreground/20";
  // 面板里价格是个链接,点了去服务商网站续费;演示里没有可去的地方,只保留样子
  const price = (it: RenewalItem) =>
    it.price ? (
      <span className="text-primary font-medium tabular-nums">
        {priceText(it)} ↗
      </span>
    ) : null;

  return (
    <div className="flex flex-col gap-3">
      {expired.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-muted-foreground">
            {t("overview.servers.renewExpired")}
          </span>
          {expired.map((it) => (
            <span
              key={it.name}
              className="inline-flex items-center gap-1.5 rounded border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-red-700 dark:text-red-300"
            >
              {it.name}
              <span className="tabular-nums">
                {t("overview.expiredDays", { count: -it.days })}
              </span>
              {price(it)}
            </span>
          ))}
        </div>
      )}

      <div ref={boxRef} className="relative" style={{ height: total }}>
        <svg
          className="text-border absolute inset-0 h-full w-full"
          viewBox={`0 0 100 ${total}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d={axis}
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
          />
        </svg>

        {/* 刻度:每 5 天一个,折返之后从哪天接着算一眼能看出来 */}
        {Array.from({ length: RENEW_SPAN / 5 + 1 }, (_, k) => k * 5).map(
          (day) => {
            const at = locate(day);
            const y = rowY(at.row);
            return (
              <Fragment key={day}>
                <span
                  className="bg-border absolute h-2 w-px"
                  style={{ left: `${at.x}%`, top: y - 4 }}
                />
                <span
                  className="text-muted-foreground absolute -translate-x-1/2 text-[10px] whitespace-nowrap tabular-nums"
                  style={{ left: `${at.x}%`, top: y + 6 }}
                >
                  {day === 0
                    ? t("overview.servers.renewToday")
                    : t("overview.servers.renewDay", { count: day })}
                </span>
              </Fragment>
            );
          },
        )}

        {upcoming.map((it, i) => {
          const at = locate(it.days);
          return (
            <span
              key={i}
              className={cn(
                "absolute z-10 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full ring-4",
                dotTone(it.days),
                it.projected && "opacity-50",
              )}
              style={{ left: `${at.x}%`, top: rowY(at.row) }}
            />
          );
        })}

        {bubbles.map((b, i) => {
          const y = rowY(b.row);
          const stem = stemOf(b);
          return (
            <Fragment key={i}>
              <span
                className="bg-border absolute w-px"
                style={{
                  left: `${b.x}%`,
                  top: b.side === "up" ? y - stem : y,
                  height: stem,
                }}
              />
              <div
                className={cn(
                  "bg-card absolute z-20 max-w-[46%] -translate-x-1/2 space-y-1 rounded-md border px-2 py-1 text-[11px] leading-tight shadow-sm sm:max-w-[24%]",
                  b.side === "up" && "-translate-y-full",
                )}
                style={{
                  left: `clamp(12%, ${b.x}%, 88%)`,
                  top: b.side === "up" ? y - stem : y + stem,
                }}
              >
                {b.items.map((it, k) => (
                  <div key={k} className={cn(it.projected && "opacity-70")}>
                    <div className="truncate font-medium" title={it.name}>
                      {it.name}
                    </div>
                    <div className="text-muted-foreground flex flex-wrap items-center gap-x-1.5 tabular-nums">
                      <span
                        className={cn(
                          it.days <= 7 &&
                            "font-medium text-amber-600 dark:text-amber-400",
                        )}
                      >
                        {it.days === 0
                          ? t("overview.servers.renewDueToday")
                          : t("overview.servers.renewLeft", { count: it.days })}
                      </span>
                      <span>{shortDate(dateAfter(it.days))}</span>
                      {price(it)}
                      {it.projected && (
                        <span className="rounded border border-dashed px-1 text-[10px]">
                          {t("overview.servers.renewProjected")}
                        </span>
                      )}
                      {it.autoRenew && (
                        <span className="text-emerald-700 dark:text-emerald-400">
                          {t("overview.servers.renewAuto")}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}

const cny = (v: number) =>
  `¥${v.toLocaleString("zh-CN", { maximumFractionDigits: 2, minimumFractionDigits: v % 1 ? 2 : 0 })}`;

/** 本月剩余未续费 / 下月预估:悬停(或聚焦)看每一笔是怎么折算的。 */
export function RenewalSummary({
  thisMonth,
  nextMonth,
}: {
  thisMonth: RenewalLine[];
  nextMonth: RenewalLine[];
}) {
  const { t } = useTranslation("overview");
  const block = (title: string, hint: string, lines: RenewalLine[]) => (
    <div className="group relative min-w-0 flex-1">
      <button
        type="button"
        className="hover:bg-muted/60 flex w-full flex-col items-start gap-0.5 rounded-md border px-3 py-2 text-left"
      >
        <span className="text-muted-foreground flex items-center gap-1 text-xs">
          {title}
          <Info className="size-3" />
        </span>
        <span className="text-lg leading-tight font-semibold tabular-nums">
          {cny(lines.reduce((a, l) => a + l.cny, 0))}
        </span>
        <span className="text-muted-foreground text-[11px]">
          {t("overview.servers.renewCount", { count: lines.length })}
        </span>
      </button>
      <div className="bg-popover text-popover-foreground pointer-events-none absolute bottom-full left-0 z-30 mb-1 hidden w-72 max-w-[80vw] rounded-md border p-3 text-xs shadow-lg group-focus-within:block group-hover:block">
        <p className="leading-5">{hint}</p>
        {lines.length > 0 && (
          <table className="mt-2 w-full tabular-nums">
            <tbody>
              {lines.map((l, i) => (
                <tr key={i}>
                  <td className="max-w-28 truncate pr-2">{l.name}</td>
                  <td
                    className={cn(
                      "pr-2",
                      l.overdue ? "font-semibold underline" : "opacity-75",
                    )}
                  >
                    {l.overdue
                      ? t("overview.servers.renewOverdue")
                      : shortDate(l.date)}
                  </td>
                  <td className="pr-2 text-right whitespace-nowrap">
                    {currencySymbol(l.currency)}
                    {l.price}
                    {l.currency === "USD" ? ` × ${CNY_RATE.USD}` : ""}
                  </td>
                  <td className="text-right font-medium whitespace-nowrap">
                    {cny(l.cny)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {lines.some((l) => l.currency === "USD") && (
          <div className="mt-2 border-t pt-1.5 text-[11px] opacity-80">
            1 USD = {CNY_RATE.USD} CNY
            <div className="mt-0.5">
              {t("overview.servers.renewRateSource")}
            </div>
          </div>
        )}
      </div>
    </div>
  );
  return (
    <div className="flex flex-wrap gap-2 border-t pt-3">
      {block(
        t("overview.servers.renewThisMonth"),
        t("overview.servers.renewThisMonthHint"),
        thisMonth,
      )}
      {block(
        t("overview.servers.renewNextMonth"),
        t("overview.servers.renewNextMonthHint"),
        nextMonth,
      )}
    </div>
  );
}
