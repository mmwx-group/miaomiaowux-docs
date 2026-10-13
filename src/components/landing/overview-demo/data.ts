// 落地页「流量信息」演示用的模拟数据。全部是编出来的,只为把面板首页的四个视图摆出样子。
// 这里不调用 Math.random / Date.now:组件在渲染里会用到这些值,必须是确定的。

export const GB = 1024 ** 3;
export const MB = 1024 ** 2;

export type TimeRange = "today" | "week" | "month";

/** 「今天 / 本周 / 本月」的用量占本周期用量的比例。 */
export const RANGE_FACTOR: Record<TimeRange, number> = {
  today: 0.065,
  week: 0.31,
  month: 1,
};

export const CYCLE_DAYS = 30;

export type QuotaState = "ok" | "warn" | "crit" | "unlimited";

/** 配额状态:用得比周期快就标红,与面板同一口径。 */
export function quotaStateOf(
  used: number,
  limit: number,
  progress: number,
): QuotaState {
  if (limit <= 0) return "unlimited";
  const ratio = used / limit;
  if (ratio >= 1) return "crit";
  if (progress >= 0.05 && ratio / progress >= 1) return "crit";
  if (ratio - progress > 0.08) return "warn";
  return "ok";
}

/** 同一个 seed 永远得到同一个 [0, 1) 的数。 */
export function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

export type DemoServer = {
  id: number;
  name: string;
  limit: number;
  cycleUsed: number;
  resetDay: number;
  /** 计费周期已经过了多少(0–1)。演示里写死,不跟着真实日期走 */
  progress: number;
  baseUp: number;
  baseDown: number;
  /** 多少天后到期;null = 没有到期日 */
  expires: number | null;
  price?: string;
  provider?: string;
  autoRenew?: boolean;
};

export const SERVERS: DemoServer[] = [
  {
    id: 1,
    name: "🇭🇰 HK GoMami Pro",
    limit: 1024 * GB,
    cycleUsed: 398 * GB,
    resetDay: 1,
    progress: 0.42,
    baseUp: 8 * MB,
    baseDown: 32 * MB,
    expires: 23,
    price: "$12.9",
    provider: "GoMami",
  },
  {
    id: 2,
    name: "🇺🇸 US Megabox Pro",
    limit: 500 * GB,
    cycleUsed: 268 * GB,
    resetDay: 5,
    progress: 0.3,
    baseUp: 3 * MB,
    baseDown: 15 * MB,
    expires: 5,
    price: "$6.5",
    provider: "Megabox",
    autoRenew: true,
  },
  {
    id: 3,
    name: "🇯🇵 JP Pulse Nano",
    limit: 500 * GB,
    cycleUsed: 96 * GB,
    resetDay: 22,
    progress: 0.71,
    baseUp: 1 * MB,
    baseDown: 5 * MB,
    expires: 41,
    price: "¥980",
    provider: "Pulse",
  },
  {
    id: 4,
    name: "🇸🇬 SG Edge Lite",
    limit: 0,
    cycleUsed: 57 * GB,
    resetDay: 1,
    progress: 0.42,
    baseUp: 0.6 * MB,
    baseDown: 3 * MB,
    expires: null,
  },
];

export type DemoNode = {
  id: number;
  name: string;
  serverId: number;
  protocol: string;
  /** 在所属服务器里占的流量份额 */
  weight: number;
  conns: number;
  onlineUsers: number;
  enabled: boolean;
};

export const NODES: DemoNode[] = [
  {
    id: 1,
    name: "🇭🇰 香港 GoMami - Reality",
    serverId: 1,
    protocol: "vless",
    weight: 30,
    conns: 58,
    onlineUsers: 4,
    enabled: true,
  },
  {
    id: 2,
    name: "🇭🇰 香港 GoMami - Trojan",
    serverId: 1,
    protocol: "trojan",
    weight: 12,
    conns: 31,
    onlineUsers: 2,
    enabled: true,
  },
  {
    id: 3,
    name: "🇭🇰 香港 GoMami - SS2022",
    serverId: 1,
    protocol: "shadowsocks",
    weight: 9,
    conns: 29,
    onlineUsers: 2,
    enabled: true,
  },
  {
    id: 4,
    name: "🇭🇰 香港 GoMami - Miu",
    serverId: 1,
    protocol: "miu",
    weight: 8,
    conns: 24,
    onlineUsers: 2,
    enabled: true,
  },
  {
    id: 5,
    name: "🇺🇸 美国 Megabox - Reality",
    serverId: 2,
    protocol: "vless",
    weight: 16,
    conns: 38,
    onlineUsers: 3,
    enabled: true,
  },
  {
    id: 6,
    name: "🇺🇸 美国 Megabox - Hy2",
    serverId: 2,
    protocol: "hysteria2",
    weight: 9,
    conns: 23,
    onlineUsers: 2,
    enabled: true,
  },
  {
    id: 7,
    name: "🇯🇵 日本 Pulse - AnyTLS",
    serverId: 3,
    protocol: "anytls",
    weight: 6,
    conns: 22,
    onlineUsers: 2,
    enabled: true,
  },
  {
    id: 8,
    name: "🇯🇵 日本 Pulse - Snell",
    serverId: 3,
    protocol: "snell",
    weight: 3,
    conns: 15,
    onlineUsers: 1,
    enabled: true,
  },
  {
    id: 9,
    name: "🇸🇬 新加坡 Edge - Reality",
    serverId: 4,
    protocol: "vless",
    weight: 5,
    conns: 12,
    onlineUsers: 1,
    enabled: true,
  },
  {
    id: 10,
    name: "🇸🇬 新加坡 Edge - Mieru",
    serverId: 4,
    protocol: "mieru",
    weight: 0,
    conns: 0,
    onlineUsers: 0,
    enabled: false,
  },
];

export type DemoUser = {
  username: string;
  packages: string[];
  limit: number;
  cycleUsed: number;
  /** 多少天后到期;负数 = 已过期;null = 长期 */
  endDays: number | null;
  conns: number;
  ips: number;
  /** 在线时的大致网速 */
  baseSpeed: number;
};

export const USERS: DemoUser[] = [
  {
    username: "jimlee",
    packages: ["旗舰 500G"],
    limit: 500 * GB,
    cycleUsed: 213 * GB,
    endDays: 86,
    conns: 46,
    ips: 3,
    baseSpeed: 14 * MB,
  },
  {
    username: "alice",
    packages: ["标准 200G"],
    limit: 200 * GB,
    cycleUsed: 171 * GB,
    endDays: 18,
    conns: 31,
    ips: 2,
    baseSpeed: 11 * MB,
  },
  {
    username: "bob",
    packages: ["标准 200G"],
    limit: 200 * GB,
    cycleUsed: 206 * GB,
    endDays: 40,
    conns: 0,
    ips: 0,
    baseSpeed: 0,
  },
  {
    username: "charlie",
    packages: ["入门 50G", "加油包 30G"],
    limit: 80 * GB,
    cycleUsed: 37 * GB,
    endDays: 5,
    conns: 22,
    ips: 1,
    baseSpeed: 6 * MB,
  },
  {
    username: "diana",
    packages: ["旗舰 500G"],
    limit: 500 * GB,
    cycleUsed: 96 * GB,
    endDays: 122,
    conns: 28,
    ips: 2,
    baseSpeed: 9 * MB,
  },
  {
    username: "erin",
    packages: ["标准 200G"],
    limit: 200 * GB,
    cycleUsed: 58 * GB,
    endDays: 64,
    conns: 19,
    ips: 1,
    baseSpeed: 5 * MB,
  },
  {
    username: "frank",
    packages: ["不限流量"],
    limit: 0,
    cycleUsed: 31 * GB,
    endDays: null,
    conns: 14,
    ips: 1,
    baseSpeed: 4 * MB,
  },
  {
    username: "grace",
    packages: ["入门 50G"],
    limit: 50 * GB,
    cycleUsed: 7 * GB,
    endDays: -3,
    conns: 0,
    ips: 0,
    baseSpeed: 0,
  },
];

export const serverOf = (id: number) => SERVERS.find((s) => s.id === id)!;

/** 节点本周期的用量:所属服务器的用量按份额分。 */
export function nodeCycleUsed(n: DemoNode): number {
  const total = NODES.filter((x) => x.serverId === n.serverId).reduce(
    (a, x) => a + x.weight,
    0,
  );
  return total > 0 ? (serverOf(n.serverId).cycleUsed * n.weight) / total : 0;
}

/** 节点名去掉服务器那一截,只留「- 」后面的线路名。 */
export const shortNodeName = (name: string) => name.split(" - ").pop() ?? name;

const UP_SHARE = 0.09;

export function split(total: number) {
  return { up: total * UP_SHARE, down: total * (1 - UP_SHARE) };
}

/** 某个用户在各节点上的用量(下钻用):按节点份额摊,再加一点各人不同的偏好。 */
export function userNodeUsage(username: string, factor: number) {
  const ui = USERS.findIndex((u) => u.username === username);
  const user = USERS[ui];
  const raw = NODES.map(
    (n, ni) => n.weight * (0.4 + pseudoRandom(ui * 13 + ni * 7 + 1) * 1.2),
  );
  const sum = raw.reduce((a, v) => a + v, 0) || 1;
  return NODES.map((n, ni) => ({
    node: n,
    ...split((user.cycleUsed * factor * raw[ni]) / sum),
  }))
    .filter((x) => x.up + x.down > 0)
    .sort((a, b) => b.up + b.down - a.up - a.down);
}

/** 某个节点上各用户的用量(下钻用)。 */
export function nodeUserUsage(nodeId: number, factor: number) {
  const ni = NODES.findIndex((n) => n.id === nodeId);
  const node = NODES[ni];
  const raw = USERS.map(
    (u, ui) => u.cycleUsed * (0.4 + pseudoRandom(ui * 13 + ni * 7 + 1) * 1.2),
  );
  const sum = raw.reduce((a, v) => a + v, 0) || 1;
  return USERS.map((u, ui) => ({
    user: u,
    ...split((nodeCycleUsed(node) * factor * raw[ui]) / sum),
  }))
    .filter((x) => x.up + x.down > 0)
    .sort((a, b) => b.up + b.down - a.up - a.down);
}

// ───────── 日期(只在模块加载时取一次) ─────────

const TODAY = new Date();

function dayLabel(offset: number): string {
  const d = new Date(TODAY);
  d.setDate(d.getDate() + offset);
  return `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** 近 30 天每日流量(GB),带一点周末高、平日低的起伏。 */
export const DAILY_HISTORY = Array.from({ length: 30 }, (_, i) => {
  const offset = i - 29;
  const d = new Date(TODAY);
  d.setDate(d.getDate() + offset);
  const weekend = d.getDay() === 0 || d.getDay() === 6 ? 1.25 : 1;
  const used = Number(
    ((19 + i * 0.32 + pseudoRandom(i + 3) * 11) * weekend).toFixed(2),
  );
  return { label: dayLabel(offset), used };
});

/** 近 30 天每天有流量的用户数。 */
export const ACTIVE_USERS = Array.from({ length: 30 }, (_, i) => ({
  label: dayLabel(i - 29),
  count: 4 + Math.round(pseudoRandom(i + 41) * 3),
}));

/** 按本周期的平均速度推算哪天用完,返回「M/D」;不会用完时返回 null。 */
export function runOutDate(s: DemoServer): string | null {
  if (s.limit <= 0 || s.cycleUsed <= 0) return null;
  const elapsed = s.progress * CYCLE_DAYS;
  const total = (elapsed * s.limit) / s.cycleUsed;
  if (total >= CYCLE_DAYS) return null;
  const d = new Date(TODAY);
  d.setDate(d.getDate() + Math.max(0, Math.round(total - elapsed)));
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

/** 实时网速:第 tick 次刷新时所有服务器的合计。 */
export function liveSpeedAt(tick: number) {
  let up = 0;
  let down = 0;
  SERVERS.forEach((s, idx) => {
    up += s.baseUp * (0.6 + pseudoRandom(tick * 31 + idx * 7) * 0.8);
    down += s.baseDown * (0.6 + pseudoRandom(tick * 31 + idx * 7 + 1) * 0.8);
  });
  return { up: Math.round(up), down: Math.round(down) };
}

export function serverSpeedAt(s: DemoServer, tick: number) {
  const idx = SERVERS.indexOf(s);
  return {
    up: Math.round(s.baseUp * (0.6 + pseudoRandom(tick * 31 + idx * 7) * 0.8)),
    down: Math.round(
      s.baseDown * (0.6 + pseudoRandom(tick * 31 + idx * 7 + 1) * 0.8),
    ),
  };
}

export function userSpeedAt(u: DemoUser, tick: number) {
  if (u.conns <= 0) return 0;
  return Math.round(
    u.baseSpeed *
      (0.5 + pseudoRandom(tick * 17 + u.username.length * 3 + u.conns) * 1.0),
  );
}

export function nodeSpeedAt(n: DemoNode, tick: number) {
  if (n.conns <= 0) return 0;
  const s = serverOf(n.serverId);
  const total =
    NODES.filter((x) => x.serverId === n.serverId).reduce(
      (a, x) => a + x.weight,
      0,
    ) || 1;
  return Math.round(
    ((s.baseDown * n.weight) / total) *
      (0.6 + pseudoRandom(tick * 23 + n.id * 5) * 0.8),
  );
}

// ───────── 格式化(与面板同样的短格式) ─────────

export function formatBytes(n: number): string {
  if (!n) return "0 B";
  if (n < 1024) return `${Math.round(n)} B`;
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 ** 3) return `${(n / 1024 ** 2).toFixed(2)} MB`;
  if (n < 1024 ** 4) return `${(n / 1024 ** 3).toFixed(2)} GB`;
  return `${(n / 1024 ** 4).toFixed(2)} TB`;
}

export function formatSpeed(bps: number): string {
  if (!bps) return "0 B/s";
  if (bps < 1024) return `${Math.round(bps)} B/s`;
  if (bps < 1024 ** 2) return `${Math.round(bps / 1024)} K/s`;
  if (bps < 1024 ** 3) return `${Math.round(bps / 1024 ** 2)} M/s`;
  return `${Math.round(bps / 1024 ** 3)} G/s`;
}

// ───────── 各视图用的数据(按时间范围与刷新次数算出来) ─────────

export type ServerRow = DemoServer & {
  online: boolean;
  upload: number;
  download: number;
  periodUsed: number;
  state: QuotaState;
  conns: number;
  onlineUsers: number;
};
export type NodeRow = DemoNode & {
  serverName: string;
  periodUp: number;
  periodDown: number;
  speed: number;
};
export type UserRow = DemoUser & {
  periodUp: number;
  periodDown: number;
  overLimit: boolean;
  speed: number;
};

export function buildModel(range: TimeRange, tick: number) {
  const f = RANGE_FACTOR[range];
  const servers: ServerRow[] = SERVERS.map((s) => {
    const sp = serverSpeedAt(s, tick);
    const own = NODES.filter((n) => n.serverId === s.id);
    return {
      ...s,
      online: true,
      upload: sp.up,
      download: sp.down,
      periodUsed: s.cycleUsed * f,
      state: quotaStateOf(s.cycleUsed, s.limit, s.progress),
      conns: own.reduce((a, n) => a + n.conns, 0),
      onlineUsers: Math.max(0, ...own.map((n) => n.onlineUsers)),
    };
  });
  const nodes: NodeRow[] = NODES.map((n) => {
    const { up, down } = split(nodeCycleUsed(n) * f);
    return {
      ...n,
      serverName: serverOf(n.serverId).name,
      periodUp: up,
      periodDown: down,
      speed: nodeSpeedAt(n, tick),
    };
  });
  const users: UserRow[] = USERS.map((u) => {
    const { up, down } = split(u.cycleUsed * f);
    return {
      ...u,
      periodUp: up,
      periodDown: down,
      overLimit: u.limit > 0 && u.cycleUsed >= u.limit,
      speed: userSpeedAt(u, tick),
    };
  });
  return { servers, nodes, users };
}

export type Model = ReturnType<typeof buildModel>;
