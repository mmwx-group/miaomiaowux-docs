---
title: "接入 AI Agent(MCP)"
description: "妙妙屋X 内置 MCP 服务,让 Claude Code / Codex / OpenClaw / Hermes 等 AI Agent 用自然语言运维你的主控"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

## 概述

妙妙屋X 主控内置了一个 MCP(Model Context Protocol)服务,挂在 `/mcp` 路由上(Streamable HTTP,无状态)。任何兼容 MCP 的 AI Agent(Claude Code、Codex、OpenClaw、Hermes Agent、Cursor 等)都可以直连,用自然语言完成用户、套餐、订阅、节点、服务器、转发链、证书、流量、安全等运维。

工具调用复用主控现有的接口与鉴权,权限完全等同你的登录账号:管理员令牌可执行管理操作,普通用户令牌调管理员工具会被拒绝。

## 第一步:生成 API 令牌

1. 登录主控,点右上角头像 →「个人设置」,滚到底部的「API 令牌」。
2. 填写名称(如 `claude-code`)点「生成令牌」。

![个人设置页面截图](../../assets/screenshots/personal-settings.webp)

个人设置：个人资料、界面风格、两步验证、修改密码、订阅凭据，以及底部的「API 令牌」

**明文仅显示一次**,立即复制保存。令牌权限与当前账号一致,可随时在该页删除(吊销)。

## 第二步:一键接入(推荐)

生成令牌后,点「**复制给 AI Agent 一键接入**」,把复制的整段话直接发给你的 AI Agent。它会自己完成:

1. 用只读工具 `license_status` 验证令牌能用;
2. 按它自己是哪个客户端(Claude Code、Codex、OpenClaw、Hermes、Cursor……)写好 MCP 配置,已有同名配置就覆盖;
3. 从 [mmwX-plugins](https://github.com/MMWOrg/mmwX-plugins) 下载配套技能包,装进它的技能目录;
4. 重新加载后再调一次 `license_status`,告诉你结果和注册了多少个工具。不能自己重启的客户端会告诉你该怎么做。

这段话里还写明了使用规矩:带 `confirm` 参数的高危操作要先征得你同意,新密码、订阅链接这类结果只发给你本人。

:::caution
复制的内容里含**令牌明文**,只发给你自己的 Agent,不要贴到群聊或公开的地方。
:::

已有令牌但没保存明文时,也可以直接点这个按钮:复制出来的说明不带令牌,Agent 会先向你要。

## 手动配置

不想让 Agent 自己改配置时,按客户端手动填。共同的信息:

- 地址:`https://你的主控/mcp`(Streamable HTTP)
- 请求头:`Authorization: Bearer <你的 API 令牌>`
- 装 xray / nginx、升级 agent 这类工具会跑好几分钟,工具超时设到 **600 秒以上**

### Claude Code

```bash
claude mcp add --transport http --scope user miaomiaowux https://你的主控/mcp --header "Authorization: Bearer <你的 API 令牌>"
```

### Codex(~/.codex/config.toml)

```toml
[mcp_servers.miaomiaowux]
url = "https://你的主控/mcp"
http_headers = { "Authorization" = "Bearer <你的 API 令牌>" }
tool_timeout_sec = 600
```

### OpenClaw(openclaw.json)

```json
{
  "mcp": {
    "servers": {
      "miaomiaowux": {
        "url": "https://你的主控/mcp",
        "transport": "streamable-http",
        "headers": { "Authorization": "Bearer <你的 API 令牌>" }
      }
    }
  }
}
```

### Hermes Agent(~/.hermes/config.yaml,顶层加 mcp_servers)

```yaml
mcp_servers:
  miaomiaowux:
    url: "https://你的主控/mcp"
    headers:
      Authorization: "Bearer <你的 API 令牌>"
    connect_timeout: 15
    timeout: 600        # 安装 xray/nginx 等工具会阻塞数分钟,超时给大点
    # 可选:只放开想用的工具
    # tools:
    #   include: [server_list, user_list, package_list, traffic_summary, node_list]
```

加完重启 Hermes(MCP 在启动时连接),日志里会出现 `registered N tool(s)`。

### Cursor(~/.cursor/mcp.json)

```json
{
  "mcpServers": {
    "miaomiaowux": {
      "url": "https://你的主控/mcp",
      "headers": { "Authorization": "Bearer <你的 API 令牌>" }
    }
  }
}
```

其它客户端同理:加一个远程 Streamable HTTP MCP 服务,填上面的地址和请求头即可。

### 验证

让 Agent 调用 `license_status`(只读)。返回许可证信息就是通了;内容里是 `HTTP 401` = 令牌不对或已删除,`HTTP 403` = 令牌所属账号不是管理员。

## 工具一览

共 150 多个工具,完整清单以客户端里看到的为准。按能力域分组的代表工具:

| 能力域 | 代表工具 |
| --- | --- |
| 用户与套餐 | user_list / user_detail / user_create / user_set_status / user_set_limits / user_extend、package_create / package_assignment_upsert、user_subscription_links(给出可直接导入客户端的订阅链接) |
| 账号与凭据 | user_reset_password\*、user_reset_credentials\*(可连订阅链接一起换)、admin_reset_own_credentials\*、user_set_short_code\*、user_reset_traffic\* |
| 安全 | security_login_locks / security_login_unlock、security_ban_list / security_ban_ip\* / security_unban_ip、security_events |
| 服务器 | server_list / server_create / server_system_info / server_service_control\*、server_inbound_*、server_routing_*、server_xray_install\*、server_agent_upgrade\* |
| 节点 | node_list / node_get / node_create / node_update / node_delete\*、node_tcping、node_speedtest、routed_outbound_*(路由出站子节点) |
| 转发链 | forward_group_*、forward_chain_*、forward_status、forward_chain_speed_test_* |
| 订阅与模板 | subscribe_file_list / subscribe_file_import / subscribe_file_update、template_v3_*、custom_rule_*、temp_subscription_create |
| 流量 | traffic_summary、traffic_ledger_user / traffic_ledger_node / traffic_ledger_unattributed / traffic_ledger_user_ips |
| 证书与运维 | cert_*、reverse_tunnel_*、logs_system / logs_agent、task_runs、backup_auto_*、node_unlock_list、node_return_routes |

\* = 高危写操作,Agent 需在参数中带 `confirm: true` 才执行,否则只返回确认提示。卸载 xray / nginx、清空节点、重置 agent 令牌等接口不对外暴露。

账号与凭据、安全两组工具,以及 `user_subscription_links`、`subscribe_file_import` 需要主控 v0.5.9 及以后。

## 配套技能包(Skills)

[mmwX-plugins](https://github.com/MMWOrg/mmwX-plugins) 的 `skills/` 目录里有一组技能(`SKILL.md`),教 Agent 怎么组合调用上面的工具完成常见运维。一键接入会自动装好;手动安装时把 `skills/mmwx-*` 整个复制进 Agent 的技能目录(Claude Code 是 `~/.claude/skills/`,OpenClaw / Hermes 放进 Agent 工作区的 skills 目录)。

| 技能 | 用途 |
| --- | --- |
| mmwx-onboard-user | 开通新用户全流程(建用户 → 套餐 → 绑定 → 发订阅链接) |
| mmwx-account-recovery | 重置密码 / 凭据 / 订阅链接 / 流量,登录解锁,IP 封禁与解封 |
| mmwx-add-server | 接入新服务器(登记 → 装 xray / nginx → 出节点) |
| mmwx-forward | 转发组 / 转发链的搭建、限速与排障 |
| mmwx-routed-outbound | 给节点挂落地(路由出站子节点)、AI 分流 |
| mmwx-reverse-tunnel | 用反向隧道接入 NAT 后面的服务器 |
| mmwx-cert | 证书申请 / 续期 / 部署,TLS 节点的 SNI 怎么填 |
| mmwx-traffic-report | 流量巡检与超额名单 |
| mmwx-traffic-audit | 流量对账、共享账号排查 |
| mmwx-unlock-routes | 节点的流媒体 / AI 解锁与三网回程 |
| mmwx-node-speedtest | 批量测速并出报告 |
| mmwx-troubleshoot | 节点离线、订阅异常、用户连不上等排障 |

## 安全建议

- 令牌权限随账号:把全权交给 Agent 前,确认该 Agent 与其入口(如 Telegram bot)可信。
- 收紧爆炸半径:用客户端的工具过滤(如 Hermes 的 `tools.include`)只放开只读工具,或改用普通用户令牌。
- 令牌明文仅显示一次,泄露后到「个人设置 → API 令牌」删除即可吊销。
- 高危操作的 `confirm` 二次确认是兜底,不能替代访问控制。
