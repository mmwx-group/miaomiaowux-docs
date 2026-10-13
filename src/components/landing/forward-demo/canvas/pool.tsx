import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { DRAG_MIME, type PoolItem } from "./context";
import { LANDINGS, SERVERS, type CDoc } from "./model";

// 左侧:服务器池与节点池。拖到画布上新建一组,拖到组上加入该组;点一下也行(触屏上没有拖拽)。

export function Pool({
  doc,
  onPick,
}: {
  doc: CDoc;
  onPick: (item: PoolItem) => void;
}) {
  const { t } = useTranslation("forward");
  const [tab, setTab] = useState<"server" | "landing">("server");
  const [q, setQ] = useState("");
  const [unusedOnly, setUnusedOnly] = useState(false);
  const usedServers = new Set(doc.groups.flatMap((g) => g.members));
  const usedLandings = new Set(doc.groups.flatMap((g) => g.landings));
  const kw = q.trim().toLowerCase();
  const seg = (on: boolean) =>
    cn(
      "flex-1 px-2 py-1.5 text-xs font-semibold",
      on ? "bg-foreground text-background" : "hover:bg-muted",
    );
  const row = (used: boolean, disabled: boolean) =>
    cn(
      "bg-card flex w-full items-center gap-2 rounded border px-2.5 py-2 text-left",
      disabled ? "opacity-55" : "hover:border-primary cursor-grab",
      used && "opacity-55",
    );
  const drag = (item: PoolItem) => ({
    draggable: true,
    onDragStart: (e: React.DragEvent) => {
      e.dataTransfer.setData(DRAG_MIME, JSON.stringify(item));
      e.dataTransfer.effectAllowed = "copy";
    },
  });

  return (
    <div className="flex h-full min-h-0 flex-col gap-2.5 p-3">
      <div className="flex overflow-hidden rounded border">
        <button
          type="button"
          className={seg(tab === "server")}
          onClick={() => setTab("server")}
        >
          {t("canvas.pool.servers", {
            used: usedServers.size,
            total: SERVERS.length,
          })}
        </button>
        <button
          type="button"
          className={seg(tab === "landing")}
          onClick={() => setTab("landing")}
        >
          {t("canvas.pool.nodes", { count: LANDINGS.length })}
        </button>
      </div>
      <div className="relative">
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 z-10 size-3.5 -translate-y-1/2" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("canvas.pool.search")}
          aria-label={t("canvas.pool.search")}
          className="h-8 pl-8 text-xs"
        />
      </div>
      <div className="flex overflow-hidden rounded border">
        <button
          type="button"
          className={seg(!unusedOnly)}
          onClick={() => setUnusedOnly(false)}
        >
          {t("canvas.pool.all")}
        </button>
        <button
          type="button"
          className={seg(unusedOnly)}
          onClick={() => setUnusedOnly(true)}
        >
          {t("canvas.pool.unused")}
        </button>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto pr-0.5">
        {tab === "server"
          ? SERVERS.filter(
              (s) =>
                (!kw || s.name.includes(kw) || s.ip.includes(kw)) &&
                !(unusedOnly && usedServers.has(s.id)),
            ).map((s) => {
              const used = usedServers.has(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  disabled={used}
                  className={row(used, used)}
                  onClick={() => onPick({ kind: "server", id: s.id })}
                  {...(used ? {} : drag({ kind: "server", id: s.id }))}
                >
                  <i
                    className={cn(
                      "size-2 shrink-0 rounded-full",
                      s.online ? "bg-emerald-600" : "bg-stone-400",
                    )}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm">{s.name}</span>
                    <span className="text-muted-foreground block truncate font-mono text-[11px]">
                      {s.ip}
                    </span>
                  </span>
                  <span className="text-muted-foreground shrink-0 text-[11px]">
                    {used
                      ? t("canvas.pool.onCanvas")
                      : s.online
                        ? ""
                        : t("topo.offline")}
                  </span>
                </button>
              );
            })
          : LANDINGS.filter(
              (n) =>
                (!kw || n.name.toLowerCase().includes(kw)) &&
                !(unusedOnly && usedLandings.has(n.id)),
            ).map((n) => {
              const used = usedLandings.has(n.id);
              return (
                <button
                  key={n.id}
                  type="button"
                  disabled={used}
                  className={row(used, used)}
                  onClick={() => onPick({ kind: "landing", id: n.id })}
                  {...(used ? {} : drag({ kind: "landing", id: n.id }))}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm">{n.name}</span>
                    <span className="text-muted-foreground block truncate text-[11px]">
                      {n.protocol} · <span className="font-mono">{n.addr}</span>
                    </span>
                  </span>
                  {used && (
                    <span className="text-muted-foreground shrink-0 text-[11px]">
                      {t("canvas.pool.onCanvas")}
                    </span>
                  )}
                </button>
              );
            })}
      </div>
      <div className="text-muted-foreground border-t pt-2 text-[11px] leading-4">
        {t(tab === "server" ? "canvas.pool.hint" : "canvas.pool.hintNodes")}
      </div>
    </div>
  );
}
