---
title: "Agent Deployment"
description: "Deploy MMWX Agent on remote servers with a one-click command"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

## Overview

Agent deployment on remote servers requires no manual download or configuration. After adding a server on the master, the system automatically generates a one-click install command that can be run on the remote server to complete the entire deployment.

Important: each server must use a unique agent_token

Do NOT copy one agent config (same token) to multiple servers and run them in parallel. Each token maps to a single server record on the master; reusing it across machines triggers a reconnect storm — the two agents keep evicting each other and the master is forced to handle several database writes per second.

The damage is not contained to the conflicting server: the write storm saturates the master's SQLite write queue, causing heartbeat updates from unrelated servers to time out. Those servers get incorrectly marked offline and degraded to HTTP/Pull mode. The master now auto-locks the token to the first-connecting IP for 60s and rejects same-token auth from other IPs — see "agent_token reuse detected" warnings in the logs. Fix: add and use a unique token per server.

## Xray mode

MiaomiaowuX Agent now supports two Xray runtime modes; pick one via the xray_mode parameter of install.sh. Try not to switch back and forth — stop all nodes before switching.

| Mode          | Value    | Description                                                                                                                                                                                                                  |
| ------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Embedded Xray | embedded | Xray-core is embedded inside the Agent — they share the same process; no standalone /usr/local/bin/xray needed; upgrading the Agent upgrades Xray. Lower footprint, fits stable setups that do not need manual xray surgery. |
| External Xray | external | Installs standalone xray via the official XTLS/Xray-install script; Agent controls it over gRPC. Xray can be upgraded independently, follows the official file layout. The one-click installer defaults to this mode.        |

Note: Hysteria2 / AnyTLS and other newer protocols are supported in both modes. In embedded mode, startup errors are logged with the \[EmbeddedXray\] prefix in the Agent log.

## One-Click Installation (Recommended)

### Step 1: Add Server on Master

1\. Log in to the master management panel

2\. Go to the "Xray Servers" page

3\. Click "Add Server" and enter server name and IP

4\. After saving, the system automatically generates the install command for that server

### Try it: add a server

Walk through the master's Add Remote Server dialog — every field, radio and toggle matches production. Click Generate Token to get a mock pairing token and the matching one-click install command (fully local, no network calls).

**Open demo**

### Step 2: Copy the One-Click Install Command

Find the "One-Click Install Command" in the server details and click the copy button. The command format is as follows:

```
# 外置 Xray 模式(默认,会自动安装独立 xray)
curl -fsSL https://your-domain.com/api/remote/install.sh?token=SERVER_TOKEN | bash

# 内联 Xray 模式(无需独立 xray,Agent 自身嵌入 xray-core)
curl -fsSL "https://your-domain.com/api/remote/install.sh?token=SERVER_TOKEN&xray_mode=embedded" | bash
```

Each server has a unique Token. The command already includes the server's authentication info and master address.

#### Installer URL params

| Param       | Default  | Description                                                        |
| ----------- | -------- | ------------------------------------------------------------------ |
| token       | —        | Server pairing token from the master (required)                    |
| xray_mode   | external | embedded or external (default)                                     |
| steal_self  | 0        | Set to 1 to auto-install nginx and enable steal-self mode          |
| listen_port | 23889    | Starting listen port; auto-increments on conflict up to 20 retries |

### Step 3: Run on the Remote Server

SSH into the remote server and run the copied command with root privileges. The script automatically completes the following 6 steps:

| Step | Operation              | Description                                                  |
| ---- | ---------------------- | ------------------------------------------------------------ |
| 1/6  | Stop old service       | Stop existing mmwx service if running                        |
| 2/6  | Create config          | Generate /etc/mmw-agent/config.yaml                          |
| 3/6  | Create systemd service | Register as system service with auto-start on boot           |
| 4/6  | Download binary        | Auto-detect architecture (amd64/arm64), download from GitHub |
| 5/6  | Start service          | Enable and start the mmwx service                            |
| 6/6  | Verify installation    | Check service status and output result                       |

## Docker Deployment

Besides the one-click bare-metal + systemd script, you can also pull the Docker image directly. The image ships with embedded xray-core + nginx + all dependencies — pull and run, no in-container installation needed.

Must run with host network mode

Xray inbound ports are added dynamically by the master UI — bridge mode would force you to update -p mappings every time a new port appears; the agent's own listening port for the master's reverse connection also needs the host network stack.

The container entrypoint checks the default gateway IP on startup — if it matches the Docker bridge default range (172.17.x.x / 172.18.x.x) the container exits with an error. Always use --network host or network_mode: host.

### docker run

Good for manual / one-off testing. The token comes from the master "Add Server" form — same token as the one-click script generates.

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

All 4 volumes (config / xray-config / nginx-cert / nginx-servers) are optional (the container has its own dirs). Mapping them out mainly helps with debugging or preserving state across image upgrades.

### Docker Compose

Recommended for production — docker compose pull / up -d makes future upgrades smoother.

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

Start with: `docker compose up -d`

### Hard constraints / FAQ

- \- **Host network:** Required. Bridge mode is rejected by the entrypoint — bypassing is not recommended.
- \- **Xray mode:** The image has no external xray binary, only embedded mode is supported. Select "embedded" when adding the server in the master UI (requires PRO license; the agent itself does not verify signatures).
- \- **Nginx:** Pre-installed via apt + symlinks compatible with hardcoded paths. The master's "install nginx" request returns "already installed" immediately, no install action triggered.
- \- **Bypass host check (debug):** Not recommended. May hit port conflicts. Debug only: `-e MMWX_REQUIRE_HOST_NETWORK=0`

## Automatic Xray Installation

The installer decides whether to install Xray based on the xray_mode flag. External mode (xray_mode=external, default) installs standalone Xray via XTLS/Xray-install (skipped if already present); the Agent controls it over gRPC. Embedded mode (xray_mode=embedded) does NOT install standalone Xray — xray-core is baked into the Agent binary and started by the Agent process.

```
# 仅 xray_mode=external(默认)时脚本会自动执行下面这条
bash -c "$(curl -L https://github.com/XTLS/Xray-install/raw/main/install-release.sh)" @ install
# xray_mode=embedded 时跳过这一步:Agent 自身嵌入 xray-core,不需要 /usr/local/bin/xray
```

## Generated Configuration File

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

All fields are generated by install.sh based on URL parameters; after manual edits run systemctl restart mmw-agent.

## Generated systemd Service

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

The installer picks the right init system automatically: systemd / OpenRC (Alpine) / nohup+rc.local (LXC fallback).

## Connection Mode

The one-click installation uses WebSocket connection mode by default. To change it, edit the connection_mode field in /etc/mmw-agent/config.yaml.

| Mode      | Value     | Description                                                                         |
| --------- | --------- | ----------------------------------------------------------------------------------- |
| WebSocket | websocket | Recommended. Agent actively connects to master, maintaining a persistent connection |
| HTTP      | http      | Master directly calls Agent API, requires Agent port to be reachable                |
| Pull      | pull      | Agent periodically pulls instructions, suitable for NAT environments                |
| Auto      | auto      | Automatically tries WebSocket -> HTTP -> Pull fallback chain                        |

## Common Operations Commands

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

## Reinstallation

If the Agent has issues, find the "Reinstall Command" in the server details and run it again. The script automatically stops the old service, reinstalls, and restarts.

## Supported Architectures

| Architecture | uname -m        | Download File         |
| ------------ | --------------- | --------------------- |
| x86_64       | x86_64          | mmw-agent-linux-amd64 |
| ARM64        | aarch64 / arm64 | mmw-agent-linux-arm64 |

[\-> Manage remote servers from the master](/docs/en/remote-servers)
