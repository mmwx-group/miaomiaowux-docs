import { pseudoRandom } from "../../overview-demo/data";
import type { Chain, Group, Strategy } from "../data";

// 画布演示的数据模型:服务器池 / 节点池、链的文档结构、结构分析(角色、选路段、分支、校验)、
// 以及延迟与带宽的模拟(按两地距离估延迟,按两端带宽与延迟估吞吐)。

export type CServer = {
  id: number;
  name: string;
  ip: string;
  lat: number;
  lon: number;
  mbps: number;
  online: boolean;
};
export type CLanding = {
  id: number;
  name: string;
  protocol: string;
  addr: string;
  lat: number;
  lon: number;
  mbps: number;
};

// IP 用的是文档保留地址段
export const SERVERS: CServer[] = [
  {
    id: 1,
    name: "sh-ct-01",
    ip: "198.51.100.11",
    lat: 31.2,
    lon: 121.5,
    mbps: 500,
    online: true,
  },
  {
    id: 2,
    name: "sh-cu-02",
    ip: "198.51.100.12",
    lat: 31.2,
    lon: 121.5,
    mbps: 300,
    online: true,
  },
  {
    id: 3,
    name: "gz-cm-01",
    ip: "198.51.100.23",
    lat: 23.1,
    lon: 113.3,
    mbps: 500,
    online: true,
  },
  {
    id: 4,
    name: "hk-hkt-01",
    ip: "203.0.113.41",
    lat: 22.3,
    lon: 114.2,
    mbps: 1000,
    online: true,
  },
  {
    id: 5,
    name: "hk-cmi-02",
    ip: "203.0.113.42",
    lat: 22.3,
    lon: 114.2,
    mbps: 1000,
    online: true,
  },
  {
    id: 6,
    name: "fra-01",
    ip: "192.0.2.61",
    lat: 50.1,
    lon: 8.7,
    mbps: 1000,
    online: false,
  },
  {
    id: 7,
    name: "jp-tyo-01",
    ip: "203.0.113.71",
    lat: 35.7,
    lon: 139.7,
    mbps: 1000,
    online: true,
  },
  {
    id: 8,
    name: "lax-01",
    ip: "192.0.2.81",
    lat: 34.0,
    lon: -118.2,
    mbps: 1000,
    online: true,
  },
  {
    id: 9,
    name: "lax-02",
    ip: "192.0.2.82",
    lat: 34.0,
    lon: -118.2,
    mbps: 800,
    online: true,
  },
  {
    id: 10,
    name: "sg-01",
    ip: "203.0.113.101",
    lat: 1.35,
    lon: 103.8,
    mbps: 1000,
    online: true,
  },
  {
    id: 11,
    name: "sg-02",
    ip: "203.0.113.102",
    lat: 1.35,
    lon: 103.8,
    mbps: 500,
    online: false,
  },
  {
    id: 12,
    name: "kr-sel-01",
    ip: "203.0.113.121",
    lat: 37.6,
    lon: 127.0,
    mbps: 500,
    online: true,
  },
  {
    id: 13,
    name: "tw-tpe-01",
    ip: "203.0.113.131",
    lat: 25.0,
    lon: 121.5,
    mbps: 300,
    online: true,
  },
];
export const LANDINGS: CLanding[] = [
  {
    id: 1,
    name: "DE-Residential",
    protocol: "VLESS · REALITY",
    addr: "203.0.113.24:443",
    lat: 50.1,
    lon: 8.7,
    mbps: 200,
  },
  {
    id: 2,
    name: "US-Residential",
    protocol: "Trojan · TLS",
    addr: "192.0.2.150:443",
    lat: 40.7,
    lon: -74.0,
    mbps: 300,
  },
  {
    id: 3,
    name: "JP-Home",
    protocol: "Shadowsocks 2022",
    addr: "203.0.113.77:8388",
    lat: 34.7,
    lon: 135.5,
    mbps: 100,
  },
];
export const serverById = (id: number) => SERVERS.find((s) => s.id === id)!;
export const landingById = (id: number) => LANDINGS.find((n) => n.id === id)!;

export type Engine = "relay" | "iptables" | "nftables";
export type GroupStrategy = Exclude<Strategy, "direct">;
export type CGroup = {
  id: string;
  name: string;
  strategy: GroupStrategy;
  /** 空 = 跟随链的默认引擎 */
  engine: "" | Engine;
  failover: boolean;
  threshold: number;
  members: number[];
  /** 出口组接的落地节点 */
  landings: number[];
};
/** member 有值 = 分支线:组里这一台单独绕行 */
export type CEdge = { id: string; from: string; to: string; member?: number };
export type CDoc = {
  name: string;
  portStart: number;
  portEnd: number;
  engine: Engine;
  clientIp: boolean;
  sticky: boolean;
  domain: string;
  groups: CGroup[];
  edges: CEdge[];
};

export const newGroup = (
  id: string,
  name: string,
  members: number[] = [],
  landings: number[] = [],
): CGroup => ({
  id,
  name,
  strategy: "round_robin",
  engine: "",
  failover: false,
  threshold: 200,
  members,
  landings,
});
export const emptyDoc = (name: string): CDoc => ({
  name,
  portStart: 50520,
  portEnd: 51314,
  engine: "relay",
  clientIp: false,
  sticky: false,
  domain: "",
  groups: [],
  edges: [],
});

/** 总览里的一条链 → 画布文档。 */
export function docFromChain(c: Chain): CDoc {
  let n = 0;
  const make = (g: Group): CGroup => ({
    ...newGroup(
      `g${++n}`,
      g.name,
      g.members.map((m) => m.id),
    ),
    strategy: g.strategy === "direct" ? "round_robin" : g.strategy,
    failover: g.failover,
  });
  const trunk = c.groups.map(make);
  const groups = [...trunk];
  const edges: CEdge[] = [];
  const link = (from: CGroup, to: CGroup) =>
    edges.push({ id: `e${edges.length + 1}`, from: from.id, to: to.id });
  trunk.slice(1).forEach((g, i) => {
    if (c.pathSet?.hop !== i) return link(trunk[i], g);
    // 选路段:每条路各自经过自己的中转组,在下一站汇合
    for (const p of c.pathSet.paths) {
      const via = p.via.map(make);
      groups.push(...via);
      const seq = [trunk[i], ...via, g];
      for (let k = 0; k < seq.length - 1; k++) link(seq[k], seq[k + 1]);
    }
  });
  if (c.terminus) {
    const landing = LANDINGS.find((x) => x.name === c.terminus!.name);
    if (landing) trunk[trunk.length - 1].landings = [landing.id];
  }
  return {
    ...emptyDoc(c.name),
    portStart: c.portStart,
    portEnd: c.portEnd,
    engine: c.engine as Engine,
    clientIp: !!c.clientIp,
    sticky: !!c.sticky,
    domain: c.domain ?? "",
    groups,
    edges,
  };
}

/** 示例:入口组两台 → 出口组,中间两条路(直连 / 经中转组),外加一台单独绕行的分支。 */
export function sampleDoc(
  name: string,
  names: { entry: string; relay: string; exit: string; branch: string },
): CDoc {
  return {
    ...emptyDoc(name),
    groups: [
      newGroup("g1", names.entry, [1, 2]),
      newGroup("g2", names.relay, [4]),
      newGroup("g3", names.exit, [7]),
      newGroup("g4", names.branch, [12]),
    ],
    edges: [
      { id: "e1", from: "g1", to: "g3" },
      { id: "e2", from: "g1", to: "g2" },
      { id: "e3", from: "g2", to: "g3" },
      { id: "e4", from: "g1", to: "g4", member: 2 },
      { id: "e5", from: "g4", to: "g3" },
    ],
  };
}

// ───────── 结构分析 ─────────

export type Role =
  | "entry"
  | "relay"
  | "exit"
  | "pathRelay"
  | "branchRelay"
  | "loose";
export type EdgeKind = "trunk" | "path" | "branch";
export type PathSet = {
  from: string;
  to: string;
  paths: Array<{ edges: string[]; via: string[] }>;
};
export type Problem =
  | { kind: "tooShort" }
  | { kind: "multiEntry"; count: number }
  | { kind: "loose"; group: string }
  | { kind: "empty"; group: string }
  | { kind: "branchOpen"; group: string }
  | { kind: "pathOpen"; group: string };
export type Analysis = {
  roles: Record<string, Role>;
  edgeKind: Record<string, EdgeKind>;
  /** 选路段里每条路的第一条线 → 第几条路 */
  pathIndex: Record<string, number>;
  pathSets: PathSet[];
  /** 主干上的组,按顺序 */
  trunk: string[];
  branches: number;
  problems: Problem[];
};

export function analyze(doc: CDoc): Analysis {
  const ids = doc.groups.map((g) => g.id);
  const outs = (id: string) =>
    doc.edges.filter((e) => e.from === id && e.member == null);
  const ins = (id: string) => doc.edges.filter((e) => e.to === id);
  const branchEdges = doc.edges.filter((e) => e.member != null);
  const roles: Record<string, Role> = {};
  const edgeKind: Record<string, EdgeKind> = {};
  const pathIndex: Record<string, number> = {};
  const pathSets: PathSet[] = [];
  const problems: Problem[] = [];

  // 分支:从成员拉出去的线,连同分支中转组后面那段,一直到汇合回主干
  const branchGroups = new Set<string>();
  for (const be of branchEdges) {
    edgeKind[be.id] = "branch";
    let cur = be.to;
    for (let guard = 0; guard < ids.length; guard++) {
      // 这个组只被分支线喂 → 它是分支中转,继续往后走
      if (ins(cur).some((e) => edgeKind[e.id] !== "branch")) break;
      branchGroups.add(cur);
      const next = outs(cur);
      if (next.length === 0) {
        problems.push({ kind: "branchOpen", group: cur });
        break;
      }
      next.forEach((e) => (edgeKind[e.id] = "branch"));
      cur = next[0].to;
    }
  }

  const connected = new Set(doc.edges.flatMap((e) => [e.from, e.to]));
  const entries = ids.filter((id) => connected.has(id) && ins(id).length === 0);

  // 从 from 沿单线往下走,记下经过的线与组,直到遇到 stop 里的组或走不动
  const walk = (first: CEdge, stop: (id: string) => boolean) => {
    const edges = [first.id];
    const via: string[] = [];
    let cur = first.to;
    for (let guard = 0; guard < ids.length && !stop(cur); guard++) {
      const next = outs(cur);
      if (next.length !== 1) break;
      via.push(cur);
      edges.push(next[0].id);
      cur = next[0].to;
    }
    return { edges, via, end: cur };
  };

  const trunk: string[] = [];
  if (entries.length >= 1) {
    let cur: string | undefined = entries[0];
    const seen = new Set<string>();
    while (cur && !seen.has(cur)) {
      seen.add(cur);
      trunk.push(cur);
      const next: CEdge[] = outs(cur).filter(
        (e) => edgeKind[e.id] !== "branch",
      );
      if (next.length === 0) break;
      if (next.length === 1) {
        edgeKind[next[0].id] = "trunk";
        cur = next[0].to;
        continue;
      }
      // 选路段:几条路各自往下走,在几条路都经过的第一个组汇合
      const reach = next.map((e) => {
        const set = new Set<string>([e.to]);
        let c = e.to;
        for (let guard = 0; guard < ids.length; guard++) {
          const n = outs(c);
          if (n.length !== 1) break;
          c = n[0].to;
          set.add(c);
        }
        return set;
      });
      const order = [...reach[0]];
      const merge = order.find((id) => reach.every((s) => s.has(id)));
      if (!merge) {
        problems.push({ kind: "pathOpen", group: cur });
        next.forEach((e) => (edgeKind[e.id] = "path"));
        break;
      }
      const paths = next.map((e, k) => {
        const w = walk(e, (id) => id === merge);
        w.edges.forEach((id) => (edgeKind[id] = "path"));
        w.via.forEach((id) => (roles[id] = "pathRelay"));
        pathIndex[e.id] = k;
        return { edges: w.edges, via: w.via };
      });
      pathSets.push({ from: cur, to: merge, paths });
      cur = merge;
    }
  }

  for (const id of ids) {
    if (roles[id]) continue;
    if (!connected.has(id)) roles[id] = "loose";
    else if (branchGroups.has(id)) roles[id] = "branchRelay";
    else if (id === trunk[0]) roles[id] = "entry";
    else if (id === trunk[trunk.length - 1] && trunk.length > 1)
      roles[id] = "exit";
    else roles[id] = "relay";
  }

  if (trunk.length < 2) problems.push({ kind: "tooShort" });
  if (entries.length > 1)
    problems.push({ kind: "multiEntry", count: entries.length });
  for (const g of doc.groups) {
    if (roles[g.id] === "loose" && doc.groups.length > 1)
      problems.push({ kind: "loose", group: g.id });
    if (g.members.length === 0) problems.push({ kind: "empty", group: g.id });
  }
  return {
    roles,
    edgeKind,
    pathIndex,
    pathSets,
    trunk,
    branches: branchEdges.length,
    problems,
  };
}

/** 连这条线会不会绕成环。 */
export function wouldCycle(doc: CDoc, from: string, to: string): boolean {
  const stack = [to];
  const seen = new Set<string>();
  while (stack.length) {
    const cur = stack.pop()!;
    if (cur === from) return true;
    if (seen.has(cur)) continue;
    seen.add(cur);
    doc.edges.filter((e) => e.from === cur).forEach((e) => stack.push(e.to));
  }
  return false;
}

// ───────── 自动排版 ─────────

export const NODE_W = 280;
export const groupHeight = (g: CGroup) =>
  86 +
  g.members.length * 56 +
  g.landings.length * 50 +
  (g.members.length + g.landings.length === 0 ? 44 : 0);

export function autoLayout(
  doc: CDoc,
  a: Analysis,
): Record<string, { x: number; y: number }> {
  // 层 = 从入口出发的最长路径,选路段里的中转自然落在两端之间
  const level: Record<string, number> = {};
  const depth = (id: string, seen: Set<string>): number => {
    if (level[id] != null) return level[id];
    if (seen.has(id)) return 0;
    seen.add(id);
    const prev = doc.edges.filter((e) => e.to === id);
    return (level[id] = prev.length
      ? Math.max(...prev.map((e) => depth(e.from, seen) + 1))
      : 0);
  };
  doc.groups.forEach((g) => depth(g.id, new Set()));
  const pos: Record<string, { x: number; y: number }> = {};
  const BASE_Y = 300;
  const above: Record<number, number> = {};
  const below: Record<number, number> = {};
  let looseY = 0;
  for (const g of doc.groups) {
    const h = groupHeight(g);
    const lv = level[g.id] ?? 0;
    const x = 40 + lv * 380;
    const role = a.roles[g.id];
    if (role === "loose") {
      pos[g.id] = { x: 40 + looseY, y: BASE_Y + 320 };
      looseY += NODE_W + 40;
    } else if (role === "pathRelay") {
      above[lv] = (above[lv] ?? 0) + h + 50;
      pos[g.id] = { x, y: BASE_Y - 110 - above[lv] };
    } else if (role === "branchRelay") {
      pos[g.id] = { x, y: BASE_Y + 170 + (below[lv] ?? 0) };
      below[lv] = (below[lv] ?? 0) + h + 50;
    } else {
      pos[g.id] = { x, y: BASE_Y - 40 };
    }
  }
  return pos;
}

// ───────── 延迟与带宽的模拟 ─────────

type Point = { lat: number; lon: number };
function distanceKm(a: Point, b: Point): number {
  const rad = (d: number) => (d * Math.PI) / 180;
  const h =
    Math.sin(rad(b.lat - a.lat) / 2) ** 2 +
    Math.cos(rad(a.lat)) *
      Math.cos(rad(b.lat)) *
      Math.sin(rad(b.lon - a.lon) / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(h));
}
/** 两地之间大致的往返延迟(毫秒)。 */
export const baseRtt = (a: Point, b: Point) =>
  6 + (distanceKm(a, b) / 100) * 1.3;

export type ProbeRow = {
  from: string;
  to: string;
  ms?: number;
  loss: number;
  jitter: number;
};
export type ProbeSection = {
  index: number;
  groups: string[];
  rows: ProbeRow[];
};
export type ProbePath = { names: string[]; ms: number; branch: boolean };
export type ProbeResult = {
  proto: "tcp" | "udp";
  at: string;
  sections: ProbeSection[];
  paths: ProbePath[];
  /** 每条线上测到的最小延迟;undefined = 不通 */
  edgeMs: Record<string, number | undefined>;
};

const clock = () => new Date().toTimeString().slice(0, 8);

function measure(
  a: CServer | CLanding,
  b: CServer | CLanding,
  proto: "tcp" | "udp",
  seed: number,
): ProbeRow {
  const online = (x: CServer | CLanding) => !("online" in x) || x.online;
  if (!online(a) || !online(b))
    return { from: a.name, to: b.name, loss: 100, jitter: 0 };
  const r = pseudoRandom(seed + a.id * 31 + b.id * 17);
  const ms = baseRtt(a, b) * (0.96 + r * 0.08) + (proto === "udp" ? 1.5 : 0);
  // 偶尔有一条线抖得厉害
  const rough = pseudoRandom(seed * 3 + a.id * 7 + b.id) > 0.88;
  return {
    from: a.name,
    to: b.name,
    ms,
    loss: rough ? Number((r * 2).toFixed(1)) : 0,
    jitter: rough ? ms * 0.3 : 0.1 + r * 0.6,
  };
}

/** 一条线的预估延迟(没探测过时选路段用它排「在用」)。 */
export function estimateEdge(doc: CDoc, e: CEdge): number | undefined {
  const from = doc.groups.find((g) => g.id === e.from);
  const to = doc.groups.find((g) => g.id === e.to);
  if (!from || !to) return undefined;
  const src = (e.member != null ? [e.member] : from.members)
    .map(serverById)
    .filter((s) => s.online);
  const dst = to.members.map(serverById).filter((s) => s.online);
  if (!src.length || !dst.length) return undefined;
  return Math.min(...src.flatMap((s) => dst.map((d) => baseRtt(s, d))));
}

/** 从入口到出口的每一条组级路线(选路段的每条路各算一条)。 */
function routesOf(a: Analysis): string[][] {
  if (a.trunk.length === 0) return [];
  let routes: string[][] = [[]];
  for (let i = 0; i < a.trunk.length; i++) {
    const id = a.trunk[i];
    routes = routes.map((r) => [...r, id]);
    const ps = a.pathSets.find((p) => p.from === id);
    if (ps)
      routes = routes.flatMap((r) => ps.paths.map((p) => [...r, ...p.via]));
  }
  return routes;
}

export function runProbe(
  doc: CDoc,
  a: Analysis,
  proto: "tcp" | "udp",
  seed: number,
): ProbeResult {
  const group = (id: string) => doc.groups.find((g) => g.id === id)!;
  const cache = new Map<string, ProbeRow>();
  const pair = (x: CServer | CLanding, y: CServer | CLanding) => {
    const key = `${x.name}>${y.name}`;
    if (!cache.has(key)) cache.set(key, measure(x, y, proto, seed));
    return cache.get(key)!;
  };
  const edgeMs: Record<string, number | undefined> = {};
  for (const e of doc.edges) {
    const src = (e.member != null ? [e.member] : group(e.from).members).map(
      serverById,
    );
    const ms = src
      .flatMap((s) => group(e.to).members.map((d) => pair(s, serverById(d)).ms))
      .filter((v): v is number => v != null);
    edgeMs[e.id] = ms.length ? Math.min(...ms) : undefined;
  }

  const routes = routesOf(a);
  const landingsOf = (gid: string) => group(gid).landings.map(landingById);
  const sections = routes.map((route, index) => {
    const rows: ProbeRow[] = [];
    for (let i = 0; i < route.length - 1; i++)
      for (const s of group(route[i]).members)
        for (const d of group(route[i + 1]).members)
          rows.push(pair(serverById(s), serverById(d)));
    const last = route[route.length - 1];
    for (const s of group(last).members)
      for (const n of landingsOf(last)) rows.push(pair(serverById(s), n));
    return { index, groups: route.map((id) => group(id).name), rows };
  });

  // 端到端:每条路线上各组任取一台,逐跳相加
  const paths: ProbePath[] = [];
  const expand = (stops: Array<Array<CServer | CLanding>>, branch: boolean) => {
    let combos: Array<Array<CServer | CLanding>> = [[]];
    for (const stop of stops)
      combos = combos.flatMap((c) => stop.map((s) => [...c, s])).slice(0, 24);
    for (const combo of combos) {
      let ms = 0;
      let ok = true;
      for (let i = 0; i < combo.length - 1; i++) {
        const r = pair(combo[i], combo[i + 1]);
        if (r.ms == null) ok = false;
        else ms += r.ms;
      }
      if (ok && combo.length > 1)
        paths.push({ names: combo.map((s) => s.name), ms, branch });
    }
  };
  const stopsOf = (route: string[]) => {
    const stops: Array<Array<CServer | CLanding>> = route.map((id) =>
      group(id).members.map(serverById),
    );
    const tail = landingsOf(route[route.length - 1]);
    return tail.length ? [...stops, tail] : stops;
  };
  routes.forEach((route) => expand(stopsOf(route), false));
  // 分支:那一台改走分支中转,汇合后接着走主干
  for (const be of doc.edges.filter((e) => e.member != null)) {
    const via: string[] = [];
    let cur = be.to;
    for (
      let guard = 0;
      guard < doc.groups.length && a.roles[cur] === "branchRelay";
      guard++
    ) {
      via.push(cur);
      const next = doc.edges.find((e) => e.from === cur && e.member == null);
      if (!next) break;
      cur = next.to;
    }
    const at = a.trunk.indexOf(cur);
    if (at < 0) continue;
    const stops = stopsOf([...via, ...a.trunk.slice(at)]);
    expand([[serverById(be.member!)], ...stops], true);
  }
  const seenPath = new Set<string>();
  const unique = paths.filter((p) => {
    const key = p.names.join(">");
    // 走分支的那一台不再出现在主干路线里
    if (seenPath.has(key)) return false;
    seenPath.add(key);
    return true;
  });
  const branchHeads = new Set(
    doc.edges
      .filter((e) => e.member != null)
      .map((e) => serverById(e.member!).name),
  );
  const filtered = unique.filter(
    (p) => p.branch || !branchHeads.has(p.names[0]),
  );
  return {
    proto,
    at: clock(),
    sections,
    paths: filtered.sort((x, y) => x.ms - y.ms).slice(0, 8),
    edgeMs,
  };
}

export type IperfOptions = {
  proto: "tcp" | "udp";
  direction: "up" | "down" | "bidir";
  parallel: number;
  duration: number;
  bitrate: number;
};
/** 两点之间跑满时每秒的吞吐(Mbps):受两端带宽与延迟限制,前两秒是慢启动。 */
export function iperfSecond(
  a: CServer | CLanding,
  b: CServer | CLanding,
  o: IperfOptions,
  sec: number,
  seed: number,
) {
  const cap = Math.min(a.mbps, b.mbps);
  const rtt = baseRtt(a, b);
  const noise = (k: number) =>
    0.93 + pseudoRandom(seed * 7 + sec * 13 + k) * 0.12;
  if (o.proto === "udp") {
    const mbps =
      Math.min(o.bitrate, cap) * (0.985 + pseudoRandom(seed + sec) * 0.02);
    return { mbps, rx: mbps * 0.99 };
  }
  const steady = (cap / (1 + rtt / 260)) * Math.min(1, 0.6 + 0.12 * o.parallel);
  const ramp = sec === 0 ? 0.42 : sec === 1 ? 0.8 : 1;
  return { mbps: steady * ramp * noise(1), rx: steady * 0.9 * ramp * noise(2) };
}
