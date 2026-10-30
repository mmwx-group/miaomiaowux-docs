// 路由出站 mock — 复刻主控「节点管理」新版(v2)列表 + 节点名右侧 ⇄「落地节点」按钮打开的「新增落地节点」对话框。
// 对话框顶部「作用范围」两种:整个节点(源节点所有用户走这个落地,行上显示青色「⇢ 落地名」)/
// 子节点(路由出站)(新建一个 routed 子节点,单独一行,协议下方显示靛色「↳ 落地名」,标签「路由出站」)。
// 与主控对齐的出处:miaomiaowux-frontend src/features/nodes-v2/nodes-page-v2.tsx(行渲染 / 落地对话框)。
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  ArrowUpDown,
  Ban,
  Copy,
  Eye,
  Flag,
  Link2,
  MoreHorizontal,
  Pencil,
  Power,
  Route as RouteIcon,
  Scale,
  Spline,
  SquarePen,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type MockNode = {
  id: number;
  name: string;
  protocol: "vless" | "trojan" | "hysteria2";
  server: string;
  addr: string;
  tag: string;
  enabled: boolean;
  /** 路由出站子节点:父节点 id + label + 落地(节点名或 ⚖ 均衡器) */
  routed?: { parentId: number; label: string; target: string };
  /** 整个节点出站:落地节点名 / 负载均衡 */
  whole?: string;
};

const PROTOCOL_LABEL: Record<MockNode["protocol"], string> = {
  vless: "VLESS",
  trojan: "Trojan",
  hysteria2: "Hysteria2",
};
// 与主控 PROTOCOL_COLORS 同色
const PROTOCOL_COLOR: Record<MockNode["protocol"], string> = {
  vless: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  trojan: "bg-red-500/10 text-red-700 dark:text-red-400",
  hysteria2: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400",
};

const MOCK_BALANCER = { tag: "lb-hk", strategy: "leastPing" };
const MOCK_SERVERS = [
  { name: "HKT 落地", ip: "203.0.113.20" },
  { name: "HINET 落地", ip: "203.0.113.30" },
  { name: "Seednet 落地", ip: "203.0.113.40" },
];

const INITIAL_NODES: MockNode[] = [
  {
    id: 1,
    name: "🇭🇰 HK直连",
    protocol: "vless",
    server: "HK 中转",
    addr: "hkdirect.example.com:443",
    tag: "中转",
    enabled: true,
  },
  {
    id: 2,
    name: "🇭🇰 HKT",
    protocol: "vless",
    server: "HKT 落地",
    addr: "hkt.example.com:443",
    tag: "落地",
    enabled: true,
  },
  {
    id: 3,
    name: "🇹🇼 HINET",
    protocol: "trojan",
    server: "HINET 落地",
    addr: "hinet.example.com:443",
    tag: "落地",
    enabled: true,
  },
  {
    id: 4,
    name: "🇹🇼 Seednet",
    protocol: "hysteria2",
    server: "Seednet 落地",
    addr: "seednet.example.com:8443",
    tag: "落地",
    enabled: true,
  },
  {
    id: 5,
    name: "🇭🇰 HK直连-rout-hinet-a1b2",
    protocol: "vless",
    server: "HK 中转",
    addr: "hkdirect.example.com:443",
    tag: "路由出站",
    enabled: true,
    routed: { parentId: 1, label: "rout-hinet-a1b2", target: "🇹🇼 HINET" },
  },
  {
    id: 6,
    name: "🇯🇵 JP-Reality",
    protocol: "vless",
    server: "JP 中转",
    addr: "jp1.example.com:443",
    tag: "中转",
    enabled: true,
    whole: "🇭🇰 HKT",
  },
];

// 与主控 generateRoutedLabel 同规则:rout-<名字只留字母数字->-<4 位随机>
const generateRoutedLabel = (name: string) => {
  const slug = name
    .replace(/[^a-zA-Z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/^(rout-)+/i, "");
  const rand = Math.random().toString(36).slice(2, 6) || "r1zz";
  const base = (slug ? `rout-${slug}` : "rout-node").slice(
    0,
    32 - rand.length - 1,
  );
  return `${base}-${rand}`;
};

// 主控的 exchange.svg(⇄):节点名右侧「落地节点」按钮的图标
function ExchangeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 1024 1024" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M162.9 449.2h681.9c34.9 0 65.2-21 76.8-51.2s7-67.5-16.3-93.1l-146.6-153.6c-27.9-27.9-69.8-27.9-97.7-2.3-27.9 25.6-27.9 69.8-2.3 97.7l58.2 60.5H162.9c-39.6 0-69.8 30.3-69.8 69.8s32.6 72.2 69.8 72.2zM861.1 574.8H179.2c-34.9 0-65.2 21-76.8 51.2s-7 67.5 16.3 93.1l146.6 153.6c14 14 32.6 20.9 51.2 20.9 16.3 0 34.9-7 48.9-18.6 27.9-25.6 27.9-69.8 2.3-97.7l-58.2-60.5h551.6c39.6 0 69.8-30.3 69.8-69.8s-32.6-72.2-69.8-72.2z"
      />
    </svg>
  );
}

// 节点行的小图标按钮:主控的 accent-action-btn —— 主色描边方块
const ACCENT_BTN =
  "size-7 shrink-0 rounded-sm border border-primary/70 bg-transparent text-primary hover:border-primary hover:bg-primary/10 hover:text-primary";
const ACCENT_BTN_LG =
  "size-8 rounded-sm border border-primary/70 bg-transparent text-primary hover:border-primary hover:bg-primary/10 hover:text-primary";
// 主控是 24/104/minmax(240,1fr)/110/200/140;文档正文比面板窄,等比收一点,让操作列不用横向滚动就看得见
const GRID =
  "grid-cols-[20px_96px_minmax(230px,1fr)_76px_minmax(100px,150px)_136px]";

export function RoutedOutboundDemo() {
  const { t } = useTranslation("xdocs");
  const d = (key: string, opts?: Record<string, unknown>) =>
    t(`routedOutbound.demo.${key}`, opts);
  const [nodes, setNodes] = useState<MockNode[]>(INITIAL_NODES);
  const [landingSource, setLandingSource] = useState<MockNode | null>(null);
  const [landingScope, setLandingScope] = useState<"all" | "routed">("all");

  const mock = (what: string) => toast.info(d("mockAction", { what }));

  const openLanding = (n: MockNode, scope: "all" | "routed" = "all") => {
    setLandingScope(scope);
    setLandingSource(n);
  };

  const toggleEnabled = (n: MockNode) => {
    setNodes((prev) =>
      prev.map((x) => (x.id === n.id ? { ...x, enabled: !x.enabled } : x)),
    );
    toast.success(
      n.enabled
        ? d("toastDisabled", { name: n.name })
        : d("toastEnabled", { name: n.name }),
    );
  };

  const deleteNode = (n: MockNode) => {
    setNodes((prev) =>
      prev.filter((x) => x.id !== n.id && x.routed?.parentId !== n.id),
    );
    toast.success(d("toastDeleted", { name: n.name }));
  };

  const setWhole = (parentId: number, target: string | undefined) =>
    setNodes((prev) =>
      prev.map((x) => (x.id === parentId ? { ...x, whole: target } : x)),
    );

  const addRoutedChildren = (
    parent: MockNode,
    items: { label: string; target: string }[],
  ) => {
    setNodes((prev) => {
      const children: MockNode[] = items.map((it, i) => ({
        id: Date.now() + i,
        name: `${parent.name}-${it.label}`,
        protocol: parent.protocol,
        server: parent.server,
        addr: parent.addr,
        tag: "路由出站",
        enabled: true,
        routed: { parentId: parent.id, label: it.label, target: it.target },
      }));
      // 演示里放在父节点后面,方便对照
      const at = prev.findIndex((x) => x.id === parent.id);
      return [...prev.slice(0, at + 1), ...children, ...prev.slice(at + 1)];
    });
  };

  return (
    <Card className="border-dashed">
      <CardContent className="pt-6">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {d("badge")}
          </Badge>
          <span className="text-muted-foreground text-xs">{d("intro")}</span>
        </div>

        <div className="bg-card overflow-hidden rounded-lg border">
          <div className="bg-muted/30 flex items-center justify-between gap-2 border-b px-3 py-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              {d("nodeList")}
              <Badge variant="secondary" className="text-[10px]">
                {nodes.length}
              </Badge>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => mock(d("routedPanel"))}
            >
              <RouteIcon className="mr-1 size-3.5" />
              {d("routedPanel")}
            </Button>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[700px]">
              <div
                className={`text-muted-foreground grid items-center gap-x-2 border-b px-3 py-2 text-xs ${GRID}`}
              >
                <div>
                  <Checkbox disabled aria-label={d("selectAll")} />
                </div>
                <div>{d("col.protocol")}</div>
                <div>{d("col.name")}</div>
                <div>{d("col.tag")}</div>
                <div className="flex items-center gap-1">
                  {d("col.address")}
                  <Eye className="size-4" />
                </div>
                <div className="text-right">{d("col.actions")}</div>
              </div>

              {nodes.map((n) => (
                <div
                  key={n.id}
                  className={`hover:bg-muted/40 grid items-center gap-x-2 border-b px-3 py-2 text-sm ${GRID}`}
                >
                  <div>
                    <Checkbox aria-label={n.name} />
                  </div>

                  {/* 协议列:协议徽章 + 路由出站子节点的 ↳ / 整个节点出站的 ⇢ */}
                  <div className="flex min-w-0 flex-col items-start gap-0.5">
                    <Badge
                      variant="outline"
                      className={PROTOCOL_COLOR[n.protocol]}
                    >
                      {PROTOCOL_LABEL[n.protocol]}
                    </Badge>
                    {n.routed && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="max-w-full truncate font-mono text-[10px] text-indigo-600 dark:text-indigo-400">
                            ↳ {n.routed.target}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="text-xs">
                            {n.routed.target.startsWith("⚖")
                              ? d("tipBalancer")
                              : d("tipRouted")}
                            <span className="font-mono">
                              {n.routed.target.startsWith("⚖")
                                ? MOCK_BALANCER.tag
                                : `routed:p${n.routed.parentId}:${n.routed.label}`}
                            </span>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    )}
                    {!n.routed && n.whole && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="max-w-full truncate border-0 bg-transparent p-0 text-left font-mono text-[10px] text-cyan-600 shadow-none hover:underline dark:text-cyan-400"
                            title={d("whole.clickToManage")}
                          >
                            ⇢ {n.whole}
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuLabel className="max-w-72 text-xs font-normal">
                            {d("whole.label", { label: n.whole })}
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => openLanding(n, "all")}
                          >
                            <ArrowUpDown className="size-4" />
                            {d("whole.switch")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => {
                              setWhole(n.id, undefined);
                              toast.success(
                                d("whole.cancelled", { name: n.name }),
                              );
                            }}
                          >
                            <X className="size-4" />
                            {d("whole.cancel")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>

                  {/* 节点名称列:名字 + 服务器名,右侧两行操作按钮 */}
                  <div className="flex min-w-0 items-center gap-2 font-medium">
                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="min-w-0 truncate" title={n.name}>
                          {n.name}
                        </span>
                        {!n.enabled && (
                          <Badge
                            variant="outline"
                            className="shrink-0 border-red-300 text-[10px] text-red-600"
                          >
                            <Ban className="mr-0.5 size-3" />
                            {d("disabled")}
                          </Badge>
                        )}
                      </div>
                      <div className="text-muted-foreground mt-0.5 truncate text-[11px] font-normal">
                        {n.server}
                      </div>
                    </div>
                    <div className="grid shrink-0 grid-flow-col grid-rows-[auto_auto] gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className={ACCENT_BTN}
                        title={d("op.rename")}
                        onClick={() => mock(d("op.rename"))}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      {!n.routed && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className={`${ACCENT_BTN} ring-primary/40 ring-2 ring-offset-1`}
                              aria-label={d("op.landing")}
                              onClick={() => openLanding(n)}
                            >
                              <ExchangeIcon className="size-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>{d("op.landing")}</TooltipContent>
                        </Tooltip>
                      )}
                      {!n.routed && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className={ACCENT_BTN}
                          title={d("op.edit")}
                          onClick={() => mock(d("op.edit"))}
                        >
                          <SquarePen className="size-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className={ACCENT_BTN}
                        title={n.enabled ? d("op.disable") : d("op.enable")}
                        onClick={() => toggleEnabled(n)}
                      >
                        {n.enabled ? (
                          <Ban className="size-4" />
                        ) : (
                          <Power className="size-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={ACCENT_BTN}
                        title={d("op.routing")}
                        onClick={() => mock(d("op.routing"))}
                      >
                        <RouteIcon className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={ACCENT_BTN}
                        title={d("op.relayGroup")}
                        onClick={() => mock(d("op.relayGroup"))}
                      >
                        <Spline className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={ACCENT_BTN}
                        title={d("op.flag")}
                        onClick={() => mock(d("op.flag"))}
                      >
                        <Flag className="size-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex min-w-0 flex-wrap gap-1">
                    <Badge variant="secondary" className="text-xs">
                      {n.tag}
                    </Badge>
                  </div>

                  <div className="text-muted-foreground min-w-0 truncate font-mono text-xs">
                    {n.addr}
                  </div>

                  <div className="flex items-center justify-end gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={ACCENT_BTN_LG}
                      title={d("op.config")}
                      onClick={() => mock(d("op.config"))}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={ACCENT_BTN_LG}
                      title={d("op.copyUri")}
                      onClick={() =>
                        toast.success(d("toastCopied", { name: n.name }))
                      }
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={ACCENT_BTN_LG}
                      title={d("op.tempSub")}
                      onClick={() => mock(d("op.tempSub"))}
                    >
                      <Link2 className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          title={d("op.more")}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {!n.routed && (
                          <DropdownMenuItem onClick={() => openLanding(n)}>
                            <ExchangeIcon className="size-4" />
                            {d("op.landing")}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => deleteNode(n)}
                        >
                          <Trash2 className="size-4" />
                          {n.routed ? d("op.deleteRouted") : d("op.delete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-muted/10 text-muted-foreground flex items-start gap-2 border-t px-3 py-2 text-[11px]">
            <ExchangeIcon className="text-primary mt-0.5 size-3.5 shrink-0" />
            <span>{d("hint")}</span>
          </div>
        </div>

        {landingSource && (
          <LandingDialog
            key={`${landingSource.id}-${landingScope}`}
            source={landingSource}
            nodes={nodes}
            initialScope={landingScope}
            onClose={() => setLandingSource(null)}
            onWhole={(target) => {
              setWhole(landingSource.id, target);
              toast.success(
                d("dialog.wholeDone", { name: landingSource.name, target }),
              );
              setLandingSource(null);
            }}
            onRouted={(items) => {
              addRoutedChildren(landingSource, items);
              toast.success(d("dialog.routedDone", { count: items.length }));
              setLandingSource(null);
            }}
          />
        )}
      </CardContent>
    </Card>
  );
}

function LandingDialog({
  source,
  nodes,
  initialScope,
  onClose,
  onWhole,
  onRouted,
}: {
  source: MockNode;
  nodes: MockNode[];
  initialScope: "all" | "routed";
  onClose: () => void;
  onWhole: (target: string) => void;
  onRouted: (items: { label: string; target: string }[]) => void;
}) {
  const { t } = useTranslation("xdocs");
  const d = (key: string, opts?: Record<string, unknown>) =>
    t(`routedOutbound.demo.dialog.${key}`, opts);
  const [scope, setScope] = useState<"all" | "routed">(initialScope);
  const [tab, setTab] = useState("nodes");
  const [filter, setFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("all");
  const [label, setLabel] = useState("");
  // 整个节点:单选;子节点:可多选,顺序 = 点选先后
  const [picked, setPicked] = useState<{ node: MockNode; label: string }[]>([]);
  const [balancerPicked, setBalancerPicked] = useState(false);

  const candidates = useMemo(
    () => nodes.filter((n) => n.id !== source.id && !n.routed),
    [nodes, source.id],
  );
  const tags = useMemo(
    () => [...new Set(candidates.map((n) => n.tag))],
    [candidates],
  );
  const filtered = candidates
    .filter((n) => tagFilter === "all" || n.tag === tagFilter)
    .filter((n) => {
      const s = filter.trim().toLowerCase();
      return (
        !s ||
        n.name.toLowerCase().includes(s) ||
        n.protocol.includes(s) ||
        n.tag.toLowerCase().includes(s)
      );
    });

  const switchScope = (v: "all" | "routed") => {
    setScope(v);
    setPicked([]);
    setLabel("");
    setBalancerPicked(false);
    if (v === "routed" && tab === "balancer") setTab("nodes");
  };

  const pick = (n: MockNode) => {
    if (scope === "all") {
      setPicked([{ node: n, label: "" }]);
      setBalancerPicked(false);
      return;
    }
    const exists = picked.some((x) => x.node.id === n.id);
    const next = exists
      ? picked.filter((x) => x.node.id !== n.id)
      : [...picked, { node: n, label: generateRoutedLabel(n.name) }];
    setPicked(next);
    setLabel(next.length ? next[next.length - 1].label : "");
  };

  const labelValid = /^[a-zA-Z0-9-]{2,32}$/.test(label);
  const single = picked.length === 1 ? picked[0] : null;

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{d("title")}</DialogTitle>
          <DialogDescription>
            {d("desc", { name: source.name })}
          </DialogDescription>
        </DialogHeader>

        <div className="bg-muted/30 mb-3 space-y-2 rounded-md border p-3">
          <Label className="text-xs font-medium">{d("scope")}</Label>
          <RadioGroup
            value={scope}
            onValueChange={(v) => switchScope(v as "all" | "routed")}
            className="gap-2"
          >
            <div className="flex items-start gap-2">
              <RadioGroupItem
                value="all"
                id="demo-scope-all"
                className="mt-0.5"
              />
              <label
                htmlFor="demo-scope-all"
                className="cursor-pointer text-sm"
              >
                <div className="font-medium">{d("scopeAll")}</div>
                <div className="text-muted-foreground text-xs">
                  {d("scopeAllDesc")}
                </div>
              </label>
            </div>
            <div className="flex items-start gap-2">
              <RadioGroupItem
                value="routed"
                id="demo-scope-routed"
                className="mt-0.5"
              />
              <label
                htmlFor="demo-scope-routed"
                className="cursor-pointer text-sm"
              >
                <div className="font-medium">{d("scopeRouted")}</div>
                <div className="text-muted-foreground text-xs">
                  {d("scopeRoutedDesc")}
                </div>
              </label>
            </div>
          </RadioGroup>

          {scope === "routed" && (
            <div className="space-y-2 pt-2">
              <div className="space-y-1">
                <Label className="text-xs">{d("labelField")}</Label>
                <Input
                  value={label}
                  onChange={(e) => {
                    setLabel(e.target.value);
                    if (picked.length === 1)
                      setPicked([{ ...picked[0], label: e.target.value }]);
                  }}
                  placeholder={d("labelPlaceholder")}
                  className="h-8 text-sm"
                  disabled={picked.length > 1}
                />
                <p className="text-muted-foreground text-[10px]">
                  {d("labelHint")}
                </p>
              </div>

              {picked.length > 1 && (
                <div className="bg-primary/5 border-primary/20 space-y-2 rounded-md border p-2 text-xs">
                  <div className="font-medium">
                    {d("multiTitle", { count: picked.length })}
                  </div>
                  <ol className="max-h-32 list-decimal space-y-0.5 overflow-y-auto pl-5">
                    {picked.map((x) => (
                      <li key={x.node.id} className="truncate">
                        {x.node.name}
                        <span className="text-muted-foreground ml-1 font-mono">
                          {x.label}
                        </span>
                      </li>
                    ))}
                  </ol>
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setPicked([]);
                        setLabel("");
                      }}
                    >
                      {d("clear")}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() =>
                        onRouted(
                          picked.map((x) => ({
                            label: x.label,
                            target: x.node.name,
                          })),
                        )
                      }
                    >
                      {d("createMany", { count: picked.length })}
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-1 rounded-md border p-2">
                <Label className="text-xs">{d("existingBalancers")}</Label>
                <div className="flex flex-wrap gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 font-mono text-xs"
                    onClick={() =>
                      onRouted([
                        {
                          label: generateRoutedLabel(MOCK_BALANCER.tag),
                          target: `⚖ ${MOCK_BALANCER.tag}`,
                        },
                      ])
                    }
                  >
                    <Scale className="mr-1 h-3 w-3" />
                    {MOCK_BALANCER.tag}
                    <span className="text-muted-foreground ml-1 font-sans">
                      {MOCK_BALANCER.strategy}
                    </span>
                  </Button>
                </div>
              </div>

              {single && (
                <div className="bg-primary/5 border-primary/20 flex items-center justify-between gap-2 rounded-md border p-2 text-xs">
                  <div className="min-w-0">
                    <div className="truncate font-medium">
                      {d("selected")}
                      {single.node.name}
                    </div>
                    <div className="text-muted-foreground truncate">
                      {PROTOCOL_LABEL[single.node.protocol]} ·{" "}
                      {single.node.server}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="shrink-0"
                    disabled={!labelValid}
                    onClick={() =>
                      onRouted([{ label, target: single.node.name }])
                    }
                  >
                    {d("createRouted")}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="w-full">
            <TabsTrigger value="nodes" className="flex-1">
              {d("tabNodes")}
            </TabsTrigger>
            <TabsTrigger value="servers" className="flex-1">
              {d("tabServers")}
            </TabsTrigger>
            {scope === "all" && (
              <TabsTrigger value="balancer" className="flex-1">
                {d("tabBalancer")}
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="nodes" className="space-y-3 pt-2">
            <Input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder={d("searchPlaceholder")}
              className="text-sm"
            />
            <div className="flex flex-wrap gap-1.5">
              {["all", ...tags].map((tg) => (
                <Button
                  key={tg}
                  size="sm"
                  variant={tagFilter === tg ? "default" : "outline"}
                  className="h-7 text-xs"
                  onClick={() => setTagFilter(tg)}
                >
                  {tg === "all" ? d("allTags") : tg}
                </Button>
              ))}
            </div>
            <p className="text-muted-foreground text-xs">{d("excludeHint")}</p>
            {filtered.length === 0 ? (
              <p className="text-muted-foreground py-4 text-center text-sm">
                {d("noMatch")}
              </p>
            ) : (
              <div className="space-y-2">
                {filtered.map((n) => {
                  const order = picked.findIndex((x) => x.node.id === n.id);
                  return (
                    <Button
                      key={n.id}
                      variant="outline"
                      className={`h-auto w-full justify-start py-3 text-left ${order >= 0 ? "border-primary bg-primary/10 ring-primary ring-1" : ""}`}
                      onClick={() => pick(n)}
                    >
                      <div className="flex w-full flex-col items-start gap-2">
                        <div className="flex w-full flex-wrap items-center gap-2">
                          {scope === "routed" &&
                            picked.length > 1 &&
                            order >= 0 && (
                              <Badge className="h-5 min-w-5 justify-center px-1 text-[10px]">
                                {order + 1}
                              </Badge>
                            )}
                          <span className="font-medium">{n.name}</span>
                          <span className="text-muted-foreground text-xs">
                            {PROTOCOL_LABEL[n.protocol]} - {n.server}
                          </span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {n.tag}
                        </Badge>
                      </div>
                    </Button>
                  );
                })}
              </div>
            )}
            {scope === "all" && single && (
              <div className="bg-background/95 sticky bottom-0 flex items-center justify-between gap-2 rounded-md border p-2 text-xs shadow-sm">
                <div className="min-w-0">
                  <div className="truncate font-medium">
                    {d("selected")}
                    {single.node.name}
                  </div>
                  <div className="text-muted-foreground truncate">
                    {PROTOCOL_LABEL[single.node.protocol]} ·{" "}
                    {single.node.server}
                  </div>
                </div>
                <Button
                  size="sm"
                  className="shrink-0"
                  onClick={() => onWhole(single.node.name)}
                >
                  {d("confirmLanding")}
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="servers" className="space-y-3 pt-2">
            <p className="text-muted-foreground text-xs">{d("serverHint")}</p>
            <div className="space-y-2">
              {MOCK_SERVERS.map((s) => (
                <Button
                  key={s.name}
                  variant="outline"
                  className="h-auto w-full justify-between py-3"
                  onClick={() => toast.info(d("serverMock", { name: s.name }))}
                >
                  <span className="font-medium">{s.name}</span>
                  <span className="text-muted-foreground font-mono text-xs">
                    {s.ip}
                  </span>
                </Button>
              ))}
            </div>
          </TabsContent>

          {scope === "all" && (
            <TabsContent value="balancer" className="space-y-3 pt-2">
              <p className="text-muted-foreground text-xs">
                {d("balancerHint")}
              </p>
              <Button
                variant="outline"
                className={`h-auto w-full justify-start gap-2 py-3 ${balancerPicked ? "border-primary bg-primary/10 ring-primary ring-1" : ""}`}
                onClick={() => {
                  setBalancerPicked(true);
                  setPicked([]);
                }}
              >
                <Scale className="size-4" />
                <span className="font-mono">{MOCK_BALANCER.tag}</span>
                <Badge variant="secondary" className="text-[10px]">
                  {MOCK_BALANCER.strategy}
                </Badge>
              </Button>
              {balancerPicked && (
                <div className="bg-background/95 sticky bottom-0 flex items-center justify-between gap-2 rounded-md border p-2 text-xs shadow-sm">
                  <div className="min-w-0 truncate font-medium">
                    {d("balancerSelected", { tag: MOCK_BALANCER.tag })}
                  </div>
                  <Button
                    size="sm"
                    className="shrink-0"
                    onClick={() =>
                      onWhole(d("balancerWhole", { tag: MOCK_BALANCER.tag }))
                    }
                  >
                    {d("confirmBalancer")}
                  </Button>
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
