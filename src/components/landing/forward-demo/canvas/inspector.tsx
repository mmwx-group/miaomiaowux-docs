import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { ArrowDown, ArrowUp, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { BRANCH_COLOR, PATH_COLOR } from "./context";
import {
  serverById,
  type Analysis,
  type CDoc,
  type CGroup,
  type Engine,
  type GroupStrategy,
} from "./model";

// 右侧设置面板:没选中组时是整条链的设置,选中一个组时是这个组的设置。

const ENGINES: Engine[] = ["relay", "iptables", "nftables"];
const STRATEGIES: GroupStrategy[] = [
  "round_robin",
  "least_conn",
  "lowest_latency",
];

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold">{label}</span>
      {children}
      {hint && (
        <span className="text-muted-foreground text-[11px] leading-4">
          {hint}
        </span>
      )}
    </label>
  );
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="bg-muted/40 rounded border p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold">{label}</span>
        <Switch
          checked={checked}
          onCheckedChange={onChange}
          aria-label={label}
        />
      </div>
      <p className="text-muted-foreground mt-1.5 text-[11px] leading-4">
        {hint}
      </p>
    </div>
  );
}

const SELECT = "bg-background h-9 w-full rounded border px-2 text-sm";
const ICON_BTN =
  "hover:bg-muted text-muted-foreground hover:text-foreground rounded p-1 disabled:opacity-30";

export function ChainSettings({
  doc,
  onChange,
}: {
  doc: CDoc;
  onChange: (patch: Partial<CDoc>) => void;
}) {
  const { t } = useTranslation("forward");
  const port = (v: string, fallback: number) =>
    Math.min(65535, Math.max(1, Number(v) || fallback));
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-baseline justify-between gap-2">
        <b className="text-base">{t("canvas.chain.title")}</b>
        <span className="text-muted-foreground text-[11px]">
          {t("canvas.chain.hint")}
        </span>
      </div>
      <Field label={t("canvas.chain.name")}>
        <Input
          value={doc.name}
          onChange={(e) => onChange({ name: e.target.value })}
          className="h-9"
        />
      </Field>
      <Field label={t("canvas.chain.ports")}>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={doc.portStart}
            onChange={(e) =>
              onChange({ portStart: port(e.target.value, doc.portStart) })
            }
            className="h-9 font-mono"
          />
          <span className="text-muted-foreground">–</span>
          <Input
            type="number"
            value={doc.portEnd}
            onChange={(e) =>
              onChange({ portEnd: port(e.target.value, doc.portEnd) })
            }
            className="h-9 font-mono"
          />
        </div>
      </Field>
      <Field
        label={t("canvas.chain.engine")}
        hint={t("canvas.chain.engineHint")}
      >
        <select
          className={SELECT}
          value={doc.engine}
          onChange={(e) => onChange({ engine: e.target.value as Engine })}
        >
          {ENGINES.map((e) => (
            <option key={e} value={e}>
              {t(`canvas.engine.${e}`)}
            </option>
          ))}
        </select>
      </Field>
      <Toggle
        label={t("canvas.chain.clientIp")}
        hint={t("canvas.chain.clientIpHint")}
        checked={doc.clientIp}
        onChange={(clientIp) => onChange({ clientIp })}
      />
      <Toggle
        label={t("canvas.chain.sticky")}
        hint={t("canvas.chain.stickyHint")}
        checked={doc.sticky}
        onChange={(sticky) => onChange({ sticky })}
      />
      <Field
        label={t("canvas.chain.domain")}
        hint={t("canvas.chain.domainHint")}
      >
        <Input
          value={doc.domain}
          onChange={(e) => onChange({ domain: e.target.value })}
          placeholder="in.example.com"
          className="h-9 font-mono"
        />
      </Field>
    </div>
  );
}

export function GroupSettings({
  group: g,
  analysis,
  pathMs,
  activeEdges,
  onChange,
  onDelete,
  onClose,
}: {
  group: CGroup;
  analysis: Analysis;
  pathMs: Record<string, number | undefined>;
  activeEdges: Set<string>;
  onChange: (patch: Partial<CGroup>) => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const { t } = useTranslation("forward");
  const role = analysis.roles[g.id] ?? "loose";
  const pathSet = analysis.pathSets.find((p) => p.from === g.id);
  const move = (i: number, d: -1 | 1) => {
    const members = [...g.members];
    [members[i], members[i + d]] = [members[i + d], members[i]];
    onChange({ members });
  };
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between gap-2">
        <b className="text-base">{t("canvas.group.title")}</b>
        <button
          type="button"
          className={ICON_BTN}
          onClick={onClose}
          aria-label={t("canvas.group.back")}
          title={t("canvas.group.back")}
        >
          <X className="size-4" />
        </button>
      </div>
      <Field label={t("canvas.group.name")}>
        <Input
          value={g.name}
          onChange={(e) => onChange({ name: e.target.value })}
          className="h-9"
        />
      </Field>
      <Field
        label={t("canvas.group.strategy")}
        hint={t(
          role === "entry"
            ? "canvas.group.strategyEntry"
            : "canvas.group.strategyHint",
        )}
      >
        <div className="flex overflow-hidden rounded border">
          {STRATEGIES.map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={g.strategy === s}
              disabled={role === "entry"}
              onClick={() => onChange({ strategy: s })}
              className={cn(
                "flex-1 px-1.5 py-1.5 text-xs disabled:opacity-50",
                g.strategy === s
                  ? "bg-foreground text-background font-semibold"
                  : "hover:bg-muted",
              )}
            >
              {t(`strategy.${s}`)}
            </button>
          ))}
        </div>
      </Field>
      <Field
        label={t("canvas.group.engine")}
        hint={t("canvas.group.engineHint")}
      >
        <select
          className={SELECT}
          value={g.engine}
          onChange={(e) =>
            onChange({ engine: e.target.value as CGroup["engine"] })
          }
        >
          <option value="">{t("canvas.engine.inherit")}</option>
          {ENGINES.map((e) => (
            <option key={e} value={e}>
              {t(`canvas.engine.${e}`)}
            </option>
          ))}
        </select>
      </Field>
      <div className="bg-muted/40 flex flex-col gap-2 rounded border p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold">
            {t("canvas.group.failover")}
          </span>
          <Switch
            checked={g.failover}
            onCheckedChange={(failover) => onChange({ failover })}
            aria-label={t("canvas.group.failover")}
          />
        </div>
        {g.failover && (
          <label className="flex items-center justify-between gap-2 text-xs">
            {t("canvas.group.threshold")}
            <Input
              type="number"
              value={g.threshold}
              onChange={(e) =>
                onChange({
                  threshold: Math.max(1, Number(e.target.value) || 200),
                })
              }
              className="h-8 w-24 font-mono"
            />
          </label>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold">
          {t("canvas.group.members")}
        </span>
        {g.members.length === 0 && (
          <span className="text-muted-foreground text-xs">
            {t("canvas.group.noMembers")}
          </span>
        )}
        {g.members.map((sid, i) => {
          const s = serverById(sid);
          return (
            <div
              key={sid}
              className="flex items-center gap-1.5 rounded border px-2 py-1.5 text-sm"
            >
              <i
                className={cn(
                  "size-2 shrink-0 rounded-full",
                  s.online ? "bg-emerald-600" : "border border-red-600",
                )}
              />
              <span className="min-w-0 flex-1 truncate">{s.name}</span>
              <button
                type="button"
                className={ICON_BTN}
                disabled={i === 0}
                onClick={() => move(i, -1)}
                aria-label={t("canvas.group.up")}
              >
                <ArrowUp className="size-3.5" />
              </button>
              <button
                type="button"
                className={ICON_BTN}
                disabled={i === g.members.length - 1}
                onClick={() => move(i, 1)}
                aria-label={t("canvas.group.down")}
              >
                <ArrowDown className="size-3.5" />
              </button>
              <button
                type="button"
                className={ICON_BTN}
                onClick={() =>
                  onChange({ members: g.members.filter((x) => x !== sid) })
                }
                aria-label={t("canvas.group.removeMember")}
              >
                <X className="size-3.5" />
              </button>
            </div>
          );
        })}
        {(role === "entry" || role === "relay") && (
          <p className="text-[11px] leading-4" style={{ color: BRANCH_COLOR }}>
            {t("canvas.group.branchHint")}
          </p>
        )}
      </div>

      {pathSet && (
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold">
            {t("canvas.group.pathTitle")}
          </span>
          <span className="text-muted-foreground text-[11px] leading-4">
            {t("canvas.group.pathPolicy")}
          </span>
          {pathSet.paths.map((p, k) => (
            <div
              key={k}
              className="flex items-center gap-2 rounded border px-2 py-1.5 text-sm"
            >
              {activeEdges.has(p.edges[0]) && (
                <span
                  className="rounded-sm px-1.5 py-px text-[11px] font-bold text-white"
                  style={{ background: PATH_COLOR }}
                >
                  {t("canvas.edge.active")}
                </span>
              )}
              <span className="flex-1">
                {t("canvas.edge.path", { n: k + 1 })}
              </span>
              <b className="font-mono text-xs">
                {pathMs[p.edges[0]] != null
                  ? `${Math.round(pathMs[p.edges[0]]!)}ms`
                  : t("canvas.edge.down")}
              </b>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={onDelete}
        className="inline-flex h-9 items-center justify-center gap-1.5 rounded border border-red-300 text-sm text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"
      >
        <Trash2 className="size-4" />
        {t("canvas.group.delete")}
      </button>
    </div>
  );
}
