---
title: "接入 AI Agent(MCP)"
description: "妙妙屋X 内置 MCP 服务,让 OpenClaw / Hermes 等 AI Agent 用自然语言运维你的主控"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

## 概述

妙妙屋X 主控内置了一个 MCP(Model Context Protocol)服务,挂在 `/mcp` 路由上(streamable-HTTP)。任何兼容 MCP 的 AI Agent(OpenClaw、Hermes Agent、Claude Code、Cursor 等)都可以直连,从而用自然语言完成节点、订阅、流量、服务器、用户、套餐等运维。

工具调用复用主控现有的接口与鉴权,权限完全等同你的登录账号:管理员令牌可执行管理操作,普通用户令牌调管理员工具会被拒绝。

## 第一步:生成 API 令牌

1\. 登录主控,进入「设置 → API 令牌」。

2\. 填写名称(如 `openclaw`)点「生成令牌」。

**明文仅显示一次**,立即复制保存。页面同时给出可直接复制的客户端配置片段。

令牌权限与当前账号一致;可随时在该页删除(吊销)。

## 第二步:在 AI Agent 里配置

### OpenClaw(openclaw.json)

```
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

```
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

加完重启 Agent(MCP 在启动时连接)。成功后日志会出现`registered 26 tool(s)`。

其它客户端(Claude Code、Cursor 等)同理:填 `/mcp` 的 URL + `Authorization: Bearer` 头即可。

## 工具一览

共 26 个工具,按能力域分组。写操作会标注,高危操作需显式确认。

| 能力域       | 代表工具                                                                                                        |
| ------------ | --------------------------------------------------------------------------------------------------------------- |
| 节点         | node_list、node_speedtest、tunnel_list、node_delete\*                                                           |
| 订阅与流量   | subscribe_file_list、traffic_summary、traffic_user_detail、temp_subscription_create                             |
| 服务器与服务 | server_list、server_service_status/control、server_inbound_list/apply、server_xray_install\*、server_sync_nodes |
| 用户与套餐   | user_list/detail/create/set_status/set_limits/delete\*、package_list/create/assign/unassign                     |

\* = 高危写操作,Agent 需在参数中带 `confirm: true` 才执行,否则只返回确认提示。令牌重置、清空节点、卸载 xray/nginx、修改管理员凭据等极高危接口不对外暴露。

## 配套技能包(Skills)

我们提供一组 Claude Agent Skills(`SKILL.md`),教 Agent 如何组合调用上述工具完成常见运维。放入 Agent 的 skills 目录即可。

| 技能                | 用途                                      |
| ------------------- | ----------------------------------------- |
| mmwx-onboard-user   | 开通新用户全流程(建用户→套餐→绑定→订阅)   |
| mmwx-add-server     | 接入新服务器(登记→装 xray/nginx→同步节点) |
| mmwx-traffic-report | 流量巡检与超额名单                        |
| mmwx-node-speedtest | 批量测速并出报告                          |
| mmwx-troubleshoot   | 节点离线/订阅异常排查                     |

## 安全建议

• 令牌权限随账号:把全权交给 Agent 前,确认该 Agent 与其入口(如 Telegram bot)可信。

• 收紧爆炸半径:用客户端的工具过滤(如 Hermes 的 `tools.include`)只放开只读工具,或改用普通用户令牌。

• 令牌明文仅显示一次,泄露后到「设置 → API 令牌」删除即可吊销。

• 高危操作的 `confirm` 二次确认是兜底,不能替代访问控制。
