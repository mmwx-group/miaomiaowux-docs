import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { XDocLayout } from "@/components/docs/x-doc-layout";

export const Route = createFileRoute("/docs/probe-api")({
  component: ProbeAPIPage,
});

type Row = [string, string, string];

const content = {
  zh: {
    title: "探针 API 字段说明",
    description:
      "内置与独立探针的数据接口、字段单位、返回条件和历史序列查询说明。",
    access: "访问与鉴权",
    accessText:
      "内置探针使用同源浏览器请求。独立探针开启接口保护后必须发送 X-MMwx-Probe-Token 请求头。通道或探针未开启时通常返回 404。",
    endpoints: "接口",
    snapshot: "服务器快照字段",
    server: "servers[] 字段",
    nested: "嵌套结构",
    series: "历史序列",
    notes: "字段缺省规则",
    notesText:
      "大多数采集指标使用可选字段：开关关闭、Agent 版本不支持或尚无数据时字段会直接缺省，而不是返回 0。接口不会返回服务器 ID、IP、Token、Agent 地址、主机名或 Xray 配置。",
  },
  en: {
    title: "Probe API field reference",
    description:
      "Endpoints, units, conditional fields, and history queries for built-in and standalone probes.",
    access: "Access and authentication",
    accessText:
      "The built-in probe uses same-origin browser requests. A protected standalone probe must send X-MMwx-Probe-Token. Disabled probe channels normally return 404.",
    endpoints: "Endpoints",
    snapshot: "Snapshot fields",
    server: "servers[] fields",
    nested: "Nested structures",
    series: "History series",
    notes: "Optional fields",
    notesText:
      "Most collected metrics are optional. A disabled switch, an older Agent, or missing samples causes the field to be omitted instead of returning zero. Server IDs, IPs, tokens, Agent addresses, hostnames, and Xray configuration are never exposed.",
  },
};

const topRows: Record<"zh" | "en", Row[]> = {
  zh: [
    ["enabled", "boolean", "探针数据是否启用；关闭时仅保证返回此字段"],
    ["title", "string", "自定义探针标题"],
    ["logo", "string", "Logo URL 或 data: URI"],
    ["appearance", "object", "主题信息：theme、color_mode、revision"],
    ["block_login", "boolean", "是否禁止访问原登录页"],
    ["show_name", "boolean", "是否返回服务器名称"],
    ["show_globe", "boolean", "是否显示 3D 地球"],
    ["license_badge", "object", "可选许可证铭牌：name、display_name"],
    ["servers", "array", "管理员选择展示的服务器列表"],
  ],
  en: [
    [
      "enabled",
      "boolean",
      "Whether probe data is enabled; the only guaranteed field when disabled",
    ],
    ["title", "string", "Custom probe title"],
    ["logo", "string", "Logo URL or data URI"],
    ["appearance", "object", "Theme metadata: theme, color_mode, and revision"],
    ["block_login", "boolean", "Whether the original login page is blocked"],
    ["show_name", "boolean", "Whether server names are included"],
    ["show_globe", "boolean", "Whether the 3D globe is displayed"],
    ["license_badge", "object", "Optional badge with name and display_name"],
    ["servers", "array", "Servers selected by the administrator"],
  ],
};

const serverRows: Record<"zh" | "en", Row[]> = {
  zh: [
    ["name", "string", "服务器名称；受显示名称开关控制"],
    ["online", "boolean", "Agent WebSocket 或数据库状态是否在线"],
    ["region", "string", "地区 Emoji"],
    [
      "region_country / region_name / region_city",
      "string",
      "国家、完整地域和城市",
    ],
    [
      "provider_name / provider_url",
      "string",
      "服务商名称与安全的 HTTP(S) 网址",
    ],
    ["telecom_paid_peer", "boolean", "服务商是否标记为电信 163 Paid Peer"],
    ["upload_speed / download_speed", "integer, B/s", "当前上行、下行网速"],
    [
      "traffic_used / traffic_limit",
      "integer, byte",
      "当前重置周期已用流量和限额；限额 0 表示不限",
    ],
    [
      "cumulative_up / cumulative_down",
      "integer, byte",
      "系统网卡当前周期累计上行、下行",
    ],
    ["daily_traffic", "array", "当前重置周期每日流量"],
    ["cpu_pct", "number, %", "CPU 使用率"],
    ["loadavg", "string", "系统负载文本"],
    ["mem_used / mem_total", "integer, byte", "内存使用量和总量"],
    ["disk_used / disk_total", "integer, byte", "磁盘使用量和总量"],
    ["uptime", "integer, second", "系统在线时长"],
    [
      "cpu_model / cpu_cores / cpu_threads",
      "string / integer",
      "CPU 型号、核心数和线程数",
    ],
    ["os / kernel / arch", "string", "操作系统、内核版本和架构"],
    ["ping", "array", "近一小时延迟与丢包摘要"],
    ["expires_at", "YYYY-MM-DD", "服务器到期日期；可回退到下个流量重置日"],
    [
      "renewal_price / renewal_currency",
      "number / string",
      "原币续费价格与 ISO 货币代码",
    ],
    ["renewal_cycle", "string", "month、quarter、half_year 或 year"],
    ["renewal_price_cny", "number", "按许可证服务器汇率折算的人民币价格"],
    ["return_routes", "array", "三网回程测试结果"],
  ],
  en: [
    ["name", "string", "Server name, controlled by the show-name switch"],
    [
      "online",
      "boolean",
      "Online according to Agent WebSocket or stored status",
    ],
    ["region", "string", "Region emoji"],
    [
      "region_country / region_name / region_city",
      "string",
      "Country, full region, and city",
    ],
    [
      "provider_name / provider_url",
      "string",
      "Provider name and validated HTTP(S) URL",
    ],
    [
      "telecom_paid_peer",
      "boolean",
      "Provider is marked as Telecom 163 Paid Peer",
    ],
    [
      "upload_speed / download_speed",
      "integer, B/s",
      "Current upload and download rates",
    ],
    [
      "traffic_used / traffic_limit",
      "integer, byte",
      "Used traffic and limit in the reset cycle; zero limit is unlimited",
    ],
    [
      "cumulative_up / cumulative_down",
      "integer, byte",
      "System network totals in the current cycle",
    ],
    ["daily_traffic", "array", "Daily traffic in the current reset cycle"],
    ["cpu_pct", "number, %", "CPU utilization"],
    ["loadavg", "string", "System load text"],
    ["mem_used / mem_total", "integer, byte", "Used and total memory"],
    ["disk_used / disk_total", "integer, byte", "Used and total disk space"],
    ["uptime", "integer, second", "System uptime"],
    [
      "cpu_model / cpu_cores / cpu_threads",
      "string / integer",
      "CPU model, cores, and threads",
    ],
    [
      "os / kernel / arch",
      "string",
      "Operating system, kernel, and architecture",
    ],
    ["ping", "array", "One-hour latency and packet-loss summary"],
    [
      "expires_at",
      "YYYY-MM-DD",
      "Expiry date; may fall back to the next traffic reset",
    ],
    [
      "renewal_price / renewal_currency",
      "number / string",
      "Original renewal price and ISO currency",
    ],
    ["renewal_cycle", "string", "month, quarter, half_year, or year"],
    [
      "renewal_price_cny",
      "number",
      "CNY conversion using license-server rates",
    ],
    ["return_routes", "array", "Three-carrier return-route results"],
  ],
};

function FieldTable({ rows, lang }: { rows: Row[]; lang: "zh" | "en" }) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full min-w-[680px] text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-4 py-3 text-left">
              {lang === "zh" ? "字段" : "Field"}
            </th>
            <th className="px-4 py-3 text-left">
              {lang === "zh" ? "类型/单位" : "Type / unit"}
            </th>
            <th className="px-4 py-3 text-left">
              {lang === "zh" ? "说明" : "Description"}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([field, type, description]) => (
            <tr key={field} className="border-t">
              <td className="whitespace-nowrap px-4 py-3 font-mono text-xs">
                {field}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                {type}
              </td>
              <td className="px-4 py-3">{description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProbeAPIPage() {
  const { i18n } = useTranslation();
  const lang: "zh" | "en" = i18n.language.startsWith("zh") ? "zh" : "en";
  const t = content[lang];

  return (
    <XDocLayout title={t.title} description={t.description}>
      <section className="mb-10">
        <h2 className="mb-3 text-2xl font-bold">{t.access}</h2>
        <p className="mb-4 text-muted-foreground">{t.accessText}</p>
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[620px] text-sm">
            <tbody>
              <tr className="border-b">
                <td className="px-4 py-3 font-mono">
                  GET /api/public/probe-servers
                </td>
                <td className="px-4 py-3">
                  {lang === "zh"
                    ? "当前状态及近一小时延迟摘要"
                    : "Current state and one-hour latency summary"}
                </td>
              </tr>
              <tr className="border-b">
                <td className="px-4 py-3 font-mono">WS /api/public/probe-ws</td>
                <td className="px-4 py-3">
                  {lang === "zh"
                    ? "每 5 秒推送相同的快照结构"
                    : "Pushes the same snapshot every five seconds"}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono">
                  GET /api/public/probe-series
                </td>
                <td className="px-4 py-3">
                  {lang === "zh"
                    ? "延迟或系统指标历史"
                    : "Latency or system metric history"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">{t.snapshot}</h2>
        <FieldTable rows={topRows[lang]} lang={lang} />
      </section>
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">{t.server}</h2>
        <FieldTable rows={serverRows[lang]} lang={lang} />
      </section>

      <section className="mb-10 space-y-4">
        <h2 className="text-2xl font-bold">{t.nested}</h2>
        <p>
          <code>daily_traffic[]</code>: <code>date</code> (YYYY-MM-DD),{" "}
          <code>uplink</code>, <code>downlink</code>, <code>total</code> (byte).
        </p>
        <p>
          <code>ping[]</code>: <code>key</code>, <code>label</code>,{" "}
          <code>isp</code>, <code>current_ms</code>, <code>loss_pct</code>,{" "}
          <code>buckets</code>.{" "}
          {lang === "zh"
            ? "列表包含 12 个五分钟桶；桶内 ms 为平均延迟，loss 为 0–100 丢包率，-1 表示无数据。"
            : "The list contains twelve five-minute buckets. ms is average latency, loss is 0–100, and -1 means no data."}
        </p>
        <p>
          <code>return_routes[]</code>: <code>carrier</code>{" "}
          (telecom/unicom/mobile), <code>region</code>, <code>route_type</code>,{" "}
          <code>tested_at</code> (RFC 3339).
        </p>
      </section>

      <section className="mb-10 space-y-4">
        <h2 className="text-2xl font-bold">{t.series}</h2>
        <p>
          {lang === "zh"
            ? "参数：server 为 servers 数组下标（不是数据库 ID）；metric 为 ping（默认）或 system；range 为 1h、6h、24h；target 为 ping key；all=1 返回全部目标。"
            : "Parameters: server is the servers array index (not a database ID); metric is ping (default) or system; range is 1h, 6h, or 24h; target is a ping key; all=1 returns all targets."}
        </p>
        <p>
          {lang === "zh"
            ? "粒度：1h = 12×5 分钟，6h = 36×10 分钟，24h = 48×30 分钟。通用字段为 success、bucket_sec、generated_at 和 series；all=1 额外返回 all_series。"
            : "Granularity: 1h = 12×5 minutes, 6h = 36×10 minutes, and 24h = 48×30 minutes. Common fields are success, bucket_sec, generated_at, and series; all=1 adds all_series."}
        </p>
        <p>
          <code>metric=system</code>: <code>cpu_pct</code>,{" "}
          <code>mem_used</code>, <code>mem_total</code>,{" "}
          <code>upload_speed</code>, <code>download_speed</code>,{" "}
          <code>cumulative_up</code>, <code>cumulative_down</code>.{" "}
          {lang === "zh"
            ? "每项都是 { t: Unix 秒, value: 数值 } 数组。"
            : "Each value is an array of { t: Unix seconds, value: number }."}
        </p>
      </section>

      <section className="mb-10 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
        <h2 className="mb-2 font-semibold">{t.notes}</h2>
        <p className="text-sm">{t.notesText}</p>
      </section>
    </XDocLayout>
  );
}
