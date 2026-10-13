import { GB, MB, pseudoRandom } from "../overview-demo/data";

// 首页「转发链」演示用的模拟数据。延迟每 15 秒(10 次刷新)换一组,网速与连接数每次刷新都跳。

export type ChainStatus = "healthy" | "degraded" | "broken" | "pending";
export type LinkState = "ok" | "degraded" | "down" | "unknown";
export type Strategy =
  | "direct"
  | "round_robin"
  | "lowest_latency"
  | "least_conn";

export type Member = {
  id: number;
  name: string;
  online: boolean;
  lan?: boolean;
};
export type Group = {
  id: number;
  name: string;
  role: "entry" | "relay" | "exit";
  strategy: Strategy;
  failover: boolean;
  members: Member[];
};
export type Link = { state: LinkState; rtt?: number; loss?: number };
/** 选路段里的一条路:via 是路上的中转组(直连就是空的),rtts 是这条路上每一段的延迟 */
export type PathOption = { via: Group[]; rtts: number[]; total: number };
export type PathSet = { hop: number; active: number; paths: PathOption[] };
export type Chain = {
  id: number;
  name: string;
  engine: string;
  portStart: number;
  portEnd: number;
  domain?: string;
  sticky?: boolean;
  clientIp?: boolean;
  status: ChainStatus;
  /** 进入当前状态多少分钟了(健康的链不显示) */
  sinceMin?: number;
  groups: Group[];
  /** 落地节点:链的最后一跳不是出口组,而是中继到一个已有节点 */
  terminus?: { name: string; addr: string };
  /** 选路段:第 hop 站连出几条路,在下一站汇合;按到出口的总延迟挑一条在用 */
  pathSet?: PathSet;
  /** 相邻两站之间的线路,按顺序;有落地节点时最后一条是到落地节点的 */
  links: Link[];
  nodes: number;
  conns: number;
  speedDown: number;
  speedUp: number;
  todayBytes: number;
  trend: number[];
  availability?: number;
  /** 近 24 小时状态条,30 分钟一格:h 健康 / d 降级 / b 中断 */
  cells?: string;
};

export const THRESHOLD_MS = 100;

const server = (
  id: number,
  name: string,
  online = true,
  lan = false,
): Member => ({ id, name, online, lan });
const SH_ENTRY: Group = {
  id: 1,
  name: "SH-Entry",
  role: "entry",
  strategy: "lowest_latency",
  failover: true,
  members: [server(1, "sh-ct-01"), server(2, "sh-cu-02")],
};
const GZ_ENTRY: Group = {
  id: 2,
  name: "GZ-Entry",
  role: "entry",
  strategy: "direct",
  failover: false,
  members: [server(3, "gz-cm-01")],
};
const HK_RELAY: Group = {
  id: 3,
  name: "HK-Relay",
  role: "relay",
  strategy: "least_conn",
  failover: true,
  members: [
    server(4, "hk-hkt-01", true, true),
    server(5, "hk-cmi-02", true, true),
  ],
};
const FRA_RELAY: Group = {
  id: 4,
  name: "FRA-Relay",
  role: "relay",
  strategy: "direct",
  failover: false,
  members: [server(6, "fra-01", false)],
};
const JP_EXIT: Group = {
  id: 5,
  name: "JP-Exit",
  role: "exit",
  strategy: "direct",
  failover: false,
  members: [server(7, "jp-tyo-01")],
};
const LAX_EXIT: Group = {
  id: 6,
  name: "LAX-Exit",
  role: "exit",
  strategy: "round_robin",
  failover: false,
  members: [server(8, "lax-01"), server(9, "lax-02")],
};
const KR_RELAY: Group = {
  id: 8,
  name: "KR-Relay",
  role: "relay",
  strategy: "direct",
  failover: false,
  members: [server(12, "kr-sel-01")],
};
const SG_EXIT: Group = {
  id: 7,
  name: "SG-Exit",
  role: "exit",
  strategy: "round_robin",
  failover: true,
  members: [server(10, "sg-01"), server(11, "sg-02", false)],
};

const trendOf = (seed: number, scale: number) =>
  Array.from(
    { length: 24 },
    (_, i) => scale * (0.5 + pseudoRandom(seed * 17 + i) * 0.9),
  );
const cellsOf = (pattern: Array<[string, number]>) =>
  pattern.map(([c, n]) => c.repeat(n)).join("");

const BASE: Chain[] = [
  {
    id: 1,
    name: "hk-jp-premium",
    engine: "nftables",
    portStart: 20000,
    portEnd: 20099,
    domain: "in.example.com",
    sticky: true,
    clientIp: true,
    status: "healthy",
    groups: [SH_ENTRY, HK_RELAY, JP_EXIT],
    links: [
      { state: "ok", rtt: 28, loss: 0 },
      { state: "ok", rtt: 46, loss: 0 },
    ],
    nodes: 8,
    conns: 214,
    speedDown: 18 * MB,
    speedUp: 2.2 * MB,
    todayBytes: 86.4 * GB,
    trend: trendOf(1, 10),
    availability: 100,
    cells: cellsOf([["h", 48]]),
  },
  {
    id: 6,
    name: "jp-fastest",
    engine: "nftables",
    portStart: 25000,
    portEnd: 25049,
    domain: "jp.example.com",
    status: "healthy",
    groups: [SH_ENTRY, JP_EXIT],
    pathSet: {
      hop: 0,
      active: 0,
      paths: [
        { via: [], rtts: [30], total: 30 },
        { via: [HK_RELAY], rtts: [22, 44], total: 66 },
        { via: [KR_RELAY], rtts: [18, 21], total: 39 },
      ],
    },
    links: [{ state: "ok", rtt: 30, loss: 0 }],
    nodes: 3,
    conns: 58,
    speedDown: 4.2 * MB,
    speedUp: 0.5 * MB,
    todayBytes: 18.6 * GB,
    trend: trendOf(6, 2.2),
    availability: 99.9,
    cells: cellsOf([["h", 48]]),
  },
  {
    id: 2,
    name: "us-west-direct",
    engine: "iptables",
    portStart: 21000,
    portEnd: 21049,
    status: "healthy",
    groups: [GZ_ENTRY, LAX_EXIT],
    links: [{ state: "ok", rtt: 152, loss: 0.1 }],
    nodes: 5,
    conns: 96,
    speedDown: 6 * MB,
    speedUp: 0.8 * MB,
    todayBytes: 31.2 * GB,
    trend: trendOf(2, 4),
    availability: 99.8,
    cells: cellsOf([
      ["h", 19],
      ["d", 1],
      ["h", 28],
    ]),
  },
  {
    id: 3,
    name: "sg-backup",
    engine: "nftables",
    portStart: 22000,
    portEnd: 22049,
    domain: "sg.example.com",
    status: "degraded",
    sinceMin: 26,
    groups: [SH_ENTRY, HK_RELAY, SG_EXIT],
    links: [
      { state: "ok", rtt: 29, loss: 0 },
      { state: "degraded", rtt: 118, loss: 2.4 },
    ],
    nodes: 4,
    conns: 41,
    speedDown: 2.1 * MB,
    speedUp: 0.3 * MB,
    todayBytes: 12.7 * GB,
    trend: trendOf(3, 1.6),
    availability: 96.4,
    cells: cellsOf([
      ["h", 30],
      ["d", 2],
      ["h", 15],
      ["d", 1],
    ]),
  },
  {
    id: 4,
    name: "eu-landing",
    engine: "relay",
    portStart: 23000,
    portEnd: 23019,
    status: "broken",
    sinceMin: 37,
    groups: [GZ_ENTRY, FRA_RELAY],
    terminus: { name: "DE-Residential", addr: "203.0.113.24:443" },
    links: [{ state: "down" }, { state: "unknown" }],
    nodes: 3,
    conns: 0,
    speedDown: 0,
    speedUp: 0,
    todayBytes: 4.1 * GB,
    trend: trendOf(4, 0.6).map((v, i) => (i > 21 ? 0 : v)),
    availability: 91.7,
    cells: cellsOf([
      ["h", 44],
      ["d", 2],
      ["b", 2],
    ]),
  },
  {
    id: 5,
    name: "test-chain",
    engine: "nftables",
    portStart: 24000,
    portEnd: 24009,
    status: "pending",
    sinceMin: 4,
    groups: [GZ_ENTRY, JP_EXIT],
    links: [{ state: "unknown" }],
    nodes: 1,
    conns: 0,
    speedDown: 0,
    speedUp: 0,
    todayBytes: 0,
    trend: [],
  },
];

/** 「立即下发」之后 test-chain 的样子。 */
const PUSHED: Partial<Chain> = {
  status: "healthy",
  sinceMin: undefined,
  links: [{ state: "ok", rtt: 64, loss: 0 }],
  conns: 3,
  speedDown: 0.4 * MB,
  speedUp: 0.05 * MB,
};

/** 每 10 次刷新(15 秒)算一轮探测。 */
export const PROBE_EVERY = 10;

export function buildChains(tick: number, pushed: boolean): Chain[] {
  const round = Math.floor(tick / PROBE_EVERY);
  return BASE.map((base) => {
    const c = base.id === 5 && pushed ? { ...base, ...PUSHED } : base;
    const wobble = (seed: number, spread: number) =>
      1 - spread / 2 + pseudoRandom(seed) * spread;
    const links = c.links.map((l, i) =>
      l.rtt == null
        ? l
        : { ...l, rtt: l.rtt * wobble(round * 13 + c.id * 7 + i, 0.1) },
    );
    let pathSet = c.pathSet;
    if (pathSet) {
      const paths = pathSet.paths.map((p, k) => {
        // 直连那条路隔一阵会变慢两轮,这时选路会切到别的路上
        const slow = p.via.length === 0 && [3, 4].includes(round % 7) ? 1.5 : 1;
        const rtts = p.rtts.map(
          (v, i) => v * slow * wobble(round * 11 + c.id * 5 + k * 3 + i, 0.06),
        );
        return { ...p, rtts, total: rtts.reduce((a, v) => a + v, 0) };
      });
      const active = paths.reduce(
        (best, p, k) => (p.total < paths[best].total ? k : best),
        0,
      );
      pathSet = { ...pathSet, paths, active };
      links[pathSet.hop] = { state: "ok", rtt: paths[active].total, loss: 0 };
    }
    return {
      ...c,
      links,
      pathSet,
      conns:
        c.conns > 0
          ? Math.max(1, Math.round(c.conns * wobble(tick * 5 + c.id, 0.08)))
          : 0,
      speedDown: c.speedDown * wobble(tick * 31 + c.id * 3, 0.7),
      speedUp: c.speedUp * wobble(tick * 31 + c.id * 3 + 1, 0.7),
      todayBytes:
        c.todayBytes + (c.speedDown > 0 ? tick * c.speedDown * 0.4 : 0),
    };
  });
}

/** 站点序列:各转发组,加上可能有的落地节点。 */
export type Stop =
  | { kind: "group"; group: Group }
  | { kind: "terminus"; name: string; addr: string };
export function stopsOf(c: Chain): Stop[] {
  const stops: Stop[] = c.groups.map((group) => ({ kind: "group", group }));
  if (c.terminus) stops.push({ kind: "terminus", ...c.terminus });
  return stops;
}

/** 端到端延迟:各跳相加;有一跳不通或还没探测就没有。 */
export function e2eOf(c: Chain): number | undefined {
  if (c.links.some((l) => l.rtt == null)) return undefined;
  return c.links.reduce((a, l) => a + (l.rtt ?? 0), 0);
}
export const lossOf = (c: Chain) =>
  c.links.some((l) => l.loss == null)
    ? undefined
    : Math.max(...c.links.map((l) => l.loss ?? 0));
export const onlineOf = (g: Group) => g.members.filter((m) => m.online).length;
export const portCount = (c: Chain) => c.portEnd - c.portStart + 1;

export const fmtMs = (v?: number) => (v == null ? "—" : `${Math.round(v)} ms`);
export const fmtLoss = (v?: number) =>
  v == null ? "—" : `${Number(v.toFixed(1))}%`;
export const fmtAvail = (v?: number) =>
  v == null ? "—" : `${v.toFixed(v >= 100 ? 0 : 1)}%`;

const LOADED = new Date();
/** 「14:02」这样的时刻:页面打开时往前推 min 分钟。 */
export function clockAgo(min: number): string {
  const d = new Date(LOADED.getTime() - min * 60_000);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/** 链在拓扑图里的颜色,按 id 取,筛选之后颜色不跳。 */
const PALETTE = [
  "#2f7a4f",
  "#3b6fb6",
  "#c4532f",
  "#8a5cb8",
  "#c98a1b",
  "#1f8a8a",
];
export const chainColor = (id: number) => PALETTE[(id - 1) % PALETTE.length];
