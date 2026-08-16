---
title: "Agent 部署"
description: "通过一键命令在远程服务器上部署 MMWX Agent"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

## 概述

远程服务器的 Agent 部署无需手动下载或配置。在主控端添加服务器后，系统会自动生成一键安装命令，在远程服务器上执行即可完成全部部署。

重要约束：每台服务器必须使用独立的 agent_token

不要把同一份 agent 配置（同 token）复制到多台服务器同时使用。每个 token 在主控侧绑定唯一服务器记录，多台机器复用会触发抢占式重连风暴：两台 agent 反复互相踢掉对方，主控每秒被迫处理数次数据库写入。

后果不只影响这台冲突服务器：写入风暴会打满主控的 SQLite 写队列，让无关服务器的心跳上报失败，最终被误判离线并整体降级到 HTTP/Pull 模式。主控会自动锁定先连上的 IP 60 秒，期间拒绝其它 IP 的同 token 连接 — 看到日志中的 "agent_token reuse detected" 警告说明命中此问题，请为每台服务器单独添加并使用独立 token。

## Xray 模式选择

妙妙屋X Agent 现在支持两种 Xray 运行模式,通过 install.sh 的 xray_mode 参数选择。一旦确定建议不要轻易切换(切换前请先停掉所有节点)。

| 模式      | 值       | 说明                                                                                                                                                           |
| --------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 内联 Xray | embedded | Agent 自身内嵌 xray-core,与 Agent 共进退,不需要 /usr/local/bin/xray 独立二进制;升级 Agent 即升级 Xray。资源占用更小,适合配置稳定且不需要手工干预 xray 的场景。 |
| 外置 Xray | external | 走标准 XTLS/Xray-install 脚本安装独立 xray,Agent 通过 gRPC 控制;Xray 可独立升级、配置文件按官方布局,排障熟悉。一键脚本默认就是这种。                           |

提示:Hysteria2 / AnyTLS 等较新协议两种模式都支持;内联模式启动失败时,Agent 日志会输出 \[EmbeddedXray\] 前缀,可据此排障。

## 一键安装（推荐）

### 步骤 1：在主控端添加服务器

1\. 登录主控端管理面板

2\. 进入「Xray 服务器」页面

3\. 点击「添加服务器」，填写服务器名称和 IP

4\. 保存后，系统自动生成该服务器的安装命令

### 在线演示:添加服务器

体验主控管理后台的「添加远程服务器」对话框,所有字段、单选、开关跟生产一致;点「生成 Token」立即给一个 mock 配对令牌和对应的一键安装命令(完全本地,不发任何请求)。

**打开演示**

### 步骤 2：复制一键安装命令

在服务器详情中找到「一键安装命令」，点击复制按钮。命令格式如下：

```
# 外置 Xray 模式(默认,会自动安装独立 xray)
curl -fsSL https://your-domain.com/api/remote/install.sh?token=SERVER_TOKEN | bash

# 内联 Xray 模式(无需独立 xray,Agent 自身嵌入 xray-core)
curl -fsSL "https://your-domain.com/api/remote/install.sh?token=SERVER_TOKEN&xray_mode=embedded" | bash
```

每台服务器的 Token 唯一，命令中已自动包含该服务器的认证信息和主控端地址。

#### 安装脚本参数

| 参数        | 默认值   | 说明                                                  |
| ----------- | -------- | ----------------------------------------------------- |
| token       | —        | 主控生成的服务器配对令牌(必填)                        |
| xray_mode   | external | embedded(内联)或 external(外置,默认)                  |
| steal_self  | 0        | 设为 1 自动安装 Nginx 并启用偷自己模式                |
| listen_port | 23889    | Agent 监听端口起始值;被占用会顺延 +1 直到第 20 次失败 |

### 步骤 3：在远程服务器上执行

SSH 登录到远程服务器，以 root 权限执行复制的命令。脚本会自动完成以下 6 个步骤：

| 步骤 | 操作              | 说明                                        |
| ---- | ----------------- | ------------------------------------------- |
| 1/6  | 停止旧服务        | 如有已运行的 mmwx 服务，先停止              |
| 2/6  | 创建配置          | 生成 /etc/mmw-agent/config.yaml             |
| 3/6  | 创建 systemd 服务 | 注册为系统服务，开机自启                    |
| 4/6  | 下载二进制        | 自动检测架构（amd64/arm64），从 GitHub 下载 |
| 5/6  | 启动服务          | 启用并启动 mmwx 服务                        |
| 6/6  | 验证安装          | 检查服务状态，输出结果                      |

## Docker 部署

除了一键脚本(裸机 + systemd),也可以直接拉镜像。镜像内置 embedded xray-core + nginx + 全套依赖,拉起即用,不需要在容器内现装任何东西。

必须用 host 网络模式启动

xray 入站端口是主控前端动态加的,bridge 模式得跟着改 -p 映射,新增端口都要改 compose;agent 监听端口给主控反向连接也走宿主网络。

容器内 entrypoint 启动时会检测默认网关 IP — 命中 docker bridge 默认段(172.17.x.x / 172.18.x.x)直接退出并报错。务必 --network host 或 network_mode: host。

### docker run

适合手动起 / 一次性测试。token 从主控前端「添加服务器」表单保存后生成,跟一键脚本里的 token 是同一个。

```
# host 网络必须 --network host(强制约束,容器内 entrypoint 会检测;bridge 模式直接退出报错)
docker run -d \
  --name mmw-agent \
  --network host \
  --restart unless-stopped \
  -e MMWX_LISTEN_PORT=12888 \
  -e MMWX_MASTER_URL=https://master.example.com \
  -e MMWX_MASTER_TOKEN=<主控添加服务器时生成的 token> \
  -v $(pwd)/config:/etc/mmw-agent \
  -v $(pwd)/xray-config:/usr/local/etc/xray \
  -v $(pwd)/nginx-cert:/etc/nginx/cert \
  -v $(pwd)/nginx-servers:/etc/nginx/servers \
  ghcr.io/iluobei/mmw-agent:latest
```

config / xray-config / nginx-cert / nginx-servers 4 个 volume 都是可选(容器内本地也行),映射出来主要方便排查或宿主升级 agent 时不丢历史数据。

### Docker Compose

推荐生产环境用 compose,后续 docker compose pull / up -d 升级更顺。

```
version: '3.8'
services:
  mmw-agent:
    image: ghcr.io/iluobei/mmw-agent:latest
    container_name: mmw-agent
    restart: unless-stopped
    network_mode: host                  # 必须 host,bridge 模式 entrypoint 会拒启
    environment:
      - MMWX_LISTEN_PORT=12888
      - MMWX_MASTER_URL=https://master.example.com
      - MMWX_MASTER_TOKEN=<主控添加服务器时生成的 token>
    volumes:
      - ./config:/etc/mmw-agent
      - ./xray-config:/usr/local/etc/xray
      - ./nginx-cert:/etc/nginx/cert
      - ./nginx-servers:/etc/nginx/servers
```

启动: `docker compose up -d`

### 强制约束 / 常见问题

- \- **host 网络:** 强制。bridge 模式 entrypoint 直接拒启,不建议绕过。
- \- **Xray 模式:** 镜像里没有外部 xray binary,只支持 embedded 模式。主控前端「添加服务器」时勾选 embedded(需 PRO 许可证;agent 端本身不验签)。
- \- **Nginx:** 镜像已 apt 预装 nginx + symlink 兼容业务代码硬编码路径,主控发起的「安装 nginx」请求会被 agent 直接返回「已预装」,不触发任何安装动作。
- \- **调试绕过 host 检查:** 不推荐。有概率端口冲突。仅 debug 用: `-e MMWX_REQUIRE_HOST_NETWORK=0`

## 自动安装 Xray

安装脚本会根据 xray_mode 参数决定是否自动安装 Xray:外置模式(xray_mode=external,默认)— 用 XTLS/Xray-install 安装独立 Xray 进程,Agent 通过 gRPC 控制;若服务器已装则跳过。内置模式(xray_mode=embedded)— 不安装独立 Xray,xray-core 已编进 Agent 二进制,由 Agent 进程直接启动。

```
# 仅 xray_mode=external(默认)时脚本会自动执行下面这条
bash -c "$(curl -L https://github.com/XTLS/Xray-install/raw/main/install-release.sh)" @ install
# xray_mode=embedded 时跳过这一步:Agent 自身嵌入 xray-core,不需要 /usr/local/bin/xray
```

## 生成的配置文件

### /etc/mmw-agent/config.yaml

```
# MMWX Remote Server Configuration
# Generated by install script

mode: remote
master_url: https://your-domain.com
token: SERVER_TOKEN
connection_mode: websocket    # websocket | http | pull | auto
xray_mode: external           # external | embedded
steal_mode:                   # 留空 / tunnel(自动偷自己时填 tunnel)
master_public_key: <BASE64_PUBLIC_KEY>
listen_port: "23889"
```

所有字段由 install.sh 根据 URL 参数自动生成;手工修改后 systemctl restart mmw-agent 即可生效。

## 生成的 systemd 服务

### /etc/systemd/system/mmw-agent.service

```
[Unit]
Description=MMW Agent Remote Server
After=network.target

[Service]
Type=simple
ExecStart=/usr/local/bin/mmw-agent -c /etc/mmw-agent/config.yaml
Restart=always
RestartSec=5
WorkingDirectory=/var/lib/mmw-agent

[Install]
WantedBy=multi-user.target
```

安装脚本会自动按 init 系统选择:systemd / OpenRC(Alpine) / nohup+rc.local(LXC 兜底)。

## 连接模式

一键安装默认使用 WebSocket 连接模式。如需更改，可编辑 /etc/mmw-agent/config.yaml 中的 connection_mode 字段。

| 模式      | 值        | 说明                                        |
| --------- | --------- | ------------------------------------------- |
| WebSocket | websocket | 推荐，Agent 主动连接主控端，保持长连接      |
| HTTP      | http      | 主控端直接调用 Agent API，需 Agent 端口可达 |
| Pull      | pull      | Agent 定期拉取指令，适合 NAT 后的环境       |
| Auto      | auto      | 自动尝试 WebSocket → HTTP → Pull 回退链     |

## 常用运维命令

```
# 查看服务状态
systemctl status mmw-agent

# 查看实时日志
journalctl -u mmw-agent -f

# 重启服务
systemctl restart mmw-agent

# 停止服务
systemctl stop mmw-agent

# Alpine (OpenRC):
#   rc-service mmw-agent {status|start|stop|restart}
#   tail -f /var/log/mmw-agent.log
# LXC / 无 init 系统兜底:
#   pgrep -af mmw-agent
#   tail -f /var/log/mmw-agent.log
```

## 重新安装

如果 Agent 出现问题，可以在服务器详情中找到「重新安装命令」，再次执行即可。脚本会自动停止旧服务、覆盖安装并重新启动。

## 支持的架构

| 架构   | uname -m        | 下载文件              |
| ------ | --------------- | --------------------- |
| x86_64 | x86_64          | mmw-agent-linux-amd64 |
| ARM64  | aarch64 / arm64 | mmw-agent-linux-arm64 |

[→ 在主控端管理远程服务器](/docs/remote-servers)
