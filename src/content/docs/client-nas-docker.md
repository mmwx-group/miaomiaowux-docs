---
title: "NAS Docker 版"
description: "在群晖、威联通、绿联等 NAS（以及任何装了 Docker 的 Linux）上用 Docker 运行 MeowX：拿镜像、各家 NAS 的安装步骤、环境变量、升级与卸载、防火墙后端与常见问题"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

MeowX 的 Docker 版把[飞牛 NAS 版](/docs/client-download#飞牛-nas)搬到了别的 NAS 上：**群晖**（DSM 7，Container Manager）、**威联通**（QTS / QuTS hero，Container Station）、**绿联**（UGOS Pro），以及任何装了 Docker 的 Linux 机器。

它和飞牛 NAS 版是同一套程序，管理页面与功能完全一样：订阅与节点、给局域网用的代理端口、透明代理（NAS 本机 / NAS 上的其它容器 / 旁路由）、[喵窝](/docs/meownest#飞牛-nas-入网)、辅助功能。不一样的只有安装、升级，以及在群晖这类内核较老的 NAS 上透明代理接入防火墙的方式。

> Docker 版刚推出，在 Linux 的 Docker 上实测过。在你的 NAS 上用不了时，请带上 NAS 型号与下文「反馈问题」里的信息到 [GitHub](https://github.com/mmwx-group/meowx-fnos/issues) 反馈。

## 要求

- x86_64 或 arm64 的 NAS（或 Linux 机器），装了 Docker 与 Docker Compose（群晖、威联通、绿联的 Docker 应用都自带）。
- 容器要用**宿主网络**、`NET_ADMIN` / `NET_RAW` 权限和 TUN 设备 `/dev/net/tun`（同官方 Tailscale 容器），下面的 compose 文件都写好了。群晖默认没有 TUN 设备，安装步骤里有加载方法。
- 透明代理与喵窝改的是 NAS 自己的防火墙与路由；关掉功能或容器停止时，MeowX 会把自己加的规则全部撤掉。

## 拿到镜像

镜像名是 `ghcr.io/mmwx-group/meowx-docker`，有 x86_64（amd64）与 arm64 两种。两种拿法得到的镜像同名，同一份 compose 文件不用改：

- **离线镜像**（国内的 NAS 拉 ghcr.io 经常不通，推荐这个）：按 NAS 的处理器下载，再在 NAS 的 Docker 界面里「导入」（各家步骤见下）：
  - [GitHub Release](https://github.com/mmwx-group/meowx-fnos/releases) 里的 `meowx-docker-<版本>-amd64.tar`（Intel / AMD）或 `meowx-docker-<版本>-arm64.tar`（ARM）；
  - 或 `https://dl.miaomiaowux.com/meowx/docker/meowx-docker-<版本>-amd64.tar`（ARM 换成 `-arm64.tar`）。
- **直接拉**（NAS 能连 ghcr.io 时）：建容器时 Docker 会自己拉 `ghcr.io/mmwx-group/meowx-docker:latest`。

## compose 文件

用仓库里的 [`docker/docker-compose.yml`](https://github.com/mmwx-group/meowx-fnos/blob/main/docker/docker-compose.yml)，去掉注释后是：

```yaml
services:
  meowx:
    image: ghcr.io/mmwx-group/meowx-docker:latest
    container_name: meowx
    network_mode: host
    cap_add:
      - NET_ADMIN
      - NET_RAW
    devices:
      - /dev/net/tun:/dev/net/tun
    environment:
      - MEOWX_PLATFORM=docker
      - MEOWX_UI_PORT=7899
      - TZ=Asia/Shanghai
    volumes:
      - ./data:/data
    restart: unless-stopped
    stop_grace_period: 30s
```

`network_mode: host`、两项权限和 TUN 设备都要保留，少了透明代理与喵窝用不了。`MEOWX_PLATFORM` 改成你的 NAS（`synology` / `qnap` / `ugreen`），它只影响管理页面上的版本名和报给主控的系统名。`./data` 是数据目录，设置、订阅、主控账户与喵窝的设备身份都在这里。

## 群晖（DSM 7）

1. **加载 TUN 模块**：群晖默认没有 `/dev/net/tun`，没有的话容器起不来。SSH 登录 NAS 后执行：
   ```sh
   sudo insmod /lib/modules/tun.ko
   ls -l /dev/net/tun
   ```
   第二条能列出这个文件就行。
2. **开机自动加载**：控制面板 → 任务计划 → 新增 → 触发的任务 → 用户定义的脚本；用户选 `root`、事件选「开机」，「任务设置」里的脚本填：
   ```sh
   [ -e /dev/net/tun ] || insmod /lib/modules/tun.ko
   ```
3. **导入镜像**（能连 ghcr.io 的可以跳过）：Container Manager → 映像 → 新增 → 从文件添加 → 选下载好的 `.tar`。
4. **准备目录**：在 File Station 里建一个目录，如 `/volume1/docker/meowx`，把 `docker-compose.yml` 放进去，把 `MEOWX_PLATFORM=docker` 改成 `MEOWX_PLATFORM=synology`。
5. **建项目**：Container Manager → 项目 → 新增，路径选上面那个目录、来源选「使用现有的 docker-compose.yml」，建好就会启动。
6. 浏览器打开 `http://<NAS 的地址>:7899`。

群晖的内核没有 nftables、没有 TPROXY，MeowX 会自动改用 iptables 后端，透明代理照样能用，区别见[防火墙后端](#防火墙后端)。

## 威联通（QTS / QuTS hero）

1. **确认有 TUN**：SSH 里 `ls -l /dev/net/tun`；没有的话 `sudo modprobe tun`（或 `insmod` 系统里的 `tun.ko`）。开机自动加载要靠 `autorun.sh`（先在「控制台 → 硬件 → 常规设置」里允许运行用户自定义的进程）。
2. **导入镜像**（能连 ghcr.io 的可以跳过）：Container Station → 映像 → 导入 → 选下载好的 `.tar`。
3. **建应用**：Container Station → 应用程序 → 创建，粘贴 compose 内容；`./data` 改成绝对路径（如 `/share/Container/meowx/data`），`MEOWX_PLATFORM` 写 `qnap`。
4. 浏览器打开 `http://<NAS 的地址>:7899`。

## 绿联（UGOS Pro）

1. UGOS Pro 基于较新的 Debian 内核，一般自带 TUN 与 nftables（MeowX 的透明代理同飞牛版）。可以在 SSH 里 `ls -l /dev/net/tun` 确认。
2. **导入镜像**（能连 ghcr.io 的可以跳过）：Docker 应用 → 镜像 → 本地镜像 → 导入。
3. **建项目**：Docker 应用 → 项目 → 创建，粘贴 compose 内容；数据目录改成共享文件夹里的路径，`MEOWX_PLATFORM` 写 `ugreen`。
4. 浏览器打开 `http://<NAS 的地址>:7899`。

## 其它装了 Docker 的 Linux

```sh
mkdir -p ~/meowx && cd ~/meowx
curl -fLO https://raw.githubusercontent.com/mmwx-group/meowx-fnos/main/docker/docker-compose.yml
docker compose up -d
```

连不上 ghcr.io 时先导入离线镜像：`docker load -i meowx-docker-<版本>-amd64.tar`。

## 开始使用

之后的用法同飞牛 NAS 版：在「订阅」页登录主控账户（NAS 上没法扫码，用面板里「复制登录链接」）或粘贴订阅链接，再到「概览」启动。

- **代理端口**：局域网里的设备把 HTTP / SOCKS5 代理设成 `<NAS 的地址>:7890` 即可，局域网与 NAS 本机免密，从外网连进来要密码（账号在「混入设置」里）。
- **透明代理**：在「透明代理」页分别打开 NAS 本机、其它容器、局域网设备（旁路由：把设备的网关和 DNS 都改成 NAS 的地址，只代理 IPv4）。打开或改动后有几分钟试用期，确认网络正常后点「保留设置」，没点就自动关掉并撤掉全部规则。
- **喵窝**：用管理员或开放了喵窝的账号登录主控后可以入网，并开放 NAS 所在的局域网，见[喵窝](/docs/meownest#飞牛-nas-入网)。

管理页面缺省没有密码，NAS 的 7899 端口会开放到外网时，请在「设置」里设一个网页密码。忘了密码：停掉容器，把数据目录里 `settings.json` 的 `"web"` 下 `"password"` 改成空字符串，再启动。

容器用宿主网络，下面的端口直接占在 NAS 上，别和 NAS 上别的服务撞：

| 端口 | 用途 |
|---|---|
| 7899/tcp | 管理页面（`MEOWX_UI_PORT` 可改） |
| 7890/tcp | HTTP / SOCKS5 混合代理端口（「混入设置」里可改） |
| 7891/tcp | redir 端口（透明代理，iptables 后端用） |
| 7892/tcp+udp | tproxy 端口（旁路由，nftables 后端用） |
| 1053/tcp+udp | 内核的 DNS（透明代理劫持 DNS 时用） |
| 127.0.0.1:9090 | 内核的控制接口（只听本机） |
| 41641/udp | 喵窝 |

## 环境变量

| 变量 | 缺省 | 说明 |
|---|---|---|
| `MEOWX_PLATFORM` | `docker` | `docker` / `synology` / `qnap` / `ugreen`：管理页面上的版本名、报给主控的系统名、订阅 UA 里的系统名 |
| `MEOWX_UI_PORT` | `7899` | 管理页面端口 |
| `TZ` | `Asia/Shanghai` | 时区 |
| `MEOWX_FIREWALL` | 自动 | `nftables` / `iptables`：强制防火墙后端 |
| `MEOWX_IPTABLES` | 自动 | iptables 后端用 `legacy` 还是 `nft`；自动时跟着 NAS 上已有规则多的那套（Docker 自己的规则在哪套就用哪套） |
| `MEOWX_POLICY_ROUTING` | 自动 | `off` = 当作没有策略路由，透明代理不用 TUN（排查用，见[常见问题](#常见问题)） |

## 升级

管理页面「设置」里会检查新版本，有新版时显示新版本号、「更新内容」、「下载离线镜像」和镜像名，但**不能一键更新**：容器换不了自己的镜像。升级方法：

- **离线镜像**：下载新的 `.tar` 照上面导入（会把 `ghcr.io/mmwx-group/meowx-docker:latest` 指向新版），再在 Docker 界面的「项目」里重新构建（或在 compose 目录里 `docker compose up -d`）。
- **能连 ghcr.io**：在 compose 目录里执行 `docker compose pull && docker compose up -d`。

数据目录不动，设置、订阅、主控账户和喵窝的设备身份都保留，NAS 在喵窝里还是同一台设备。

## 卸载

在 Docker 界面里停掉并删除项目（或容器），命令行是 `docker compose down`。MeowX 停止时会撤掉透明代理与喵窝的全部规则和路由，NAS 的网络恢复原样；用了代理端口或把网关、DNS 指向 NAS 的设备记得改回来。

要彻底清除：NAS 在喵窝里、又想让它从主控里消失的，先在「喵窝」页点「退出喵窝」；然后删除项目 / 容器与镜像，再删掉数据目录。群晖上加载 TUN 的开机任务没别的用处也可以删掉。

## 防火墙后端

MeowX 启动时探测一次 NAS 的内核，自动选防火墙后端；控制服务日志里有一行「防火墙：…」，不是 nftables 时「透明代理」页上也会显示。

| 后端 | 什么时候用 | 透明代理怎么走 |
|---|---|---|
| nftables | 内核有 nftables 与策略路由（绿联、多数 Linux、飞牛） | 同飞牛版：NAS 本机与容器走内核的 TUN，旁路由走 TPROXY |
| iptables | 内核没有 nftables（群晖） | NAS 本机与容器照样走 TUN；旁路由的 TCP 用 REDIRECT 交给 redir 端口 7891，UDP 经 TUN（没有 TPROXY） |

iptables 后端的规则都在自己的 `MEOWX_*` 链里，内置链里只有跳转，关掉或容器退出时全部删掉；局域网 ↔ TUN 的转发在 Docker 的 `DOCKER-USER` 链里放行（Docker 默认丢弃转发）。喵窝的映射网段每段最多 /24（256 个地址），再大的会在日志里报错并跳过。

**没有策略路由**（内核不支持，或设了 `MEOWX_POLICY_ROUTING=off`）时内核的 TUN 用不了，透明代理退化成 REDIRECT：NAS 本机、其它容器、旁路由的 TCP 都交给内核，DNS 照样劫持，**UDP 不代理**（QUIC 会回落到 TCP；游戏等纯 UDP 应用直连或不通）。「透明代理」页上会写「没有策略路由」。

## 常见问题

**容器起不来**

- 没有 `/dev/net/tun`：先加载 TUN 模块（群晖 `sudo insmod /lib/modules/tun.ko`），并照上面设成开机自动加载。
- 端口被占用：容器用宿主网络，NAS 上别的程序占了 7899、7890–7892 或 1053 都会起不来。改掉冲突的那个，管理页面端口可以用 `MEOWX_UI_PORT` 换。
- 容器自己的日志在 Docker 界面里看，或 `docker logs meowx`。

**群晖上 NAS 本机的透明代理不正常**

群晖的内核较老，内核 TUN 用到的几条策略路由规则可能不认。在 compose 的环境变量里加 `MEOWX_POLICY_ROUTING=off` 后重建容器，透明代理按「没有策略路由」的方式工作。

**旁路由的设备 UDP 不通**

iptables 后端下，旁路由设备的 UDP 回包从 TUN 进来、源地址是外网，NAS 的反向路径检查（`net.ipv4.conf.all.rp_filter`）是严格模式（1）时会被丢。MeowX 会试着放宽，但在容器里多半改不了，请在 NAS 上执行：

```sh
sudo sysctl -w net.ipv4.conf.all.rp_filter=2
```

群晖可以把这一行加进加载 TUN 的那个开机任务。

**iptables 规则偶尔被覆盖**

iptables（legacy）是「整张表读出来改完再写回」，恰好和 Docker 同时改规则时可能互相覆盖，只在开关透明代理 / 喵窝的那一下有窗口。要彻底避免：先确认 NAS 上 `/run/xtables.lock` 是一个**文件**，再在 compose 的 `volumes` 里加一行 `- /run/xtables.lock:/run/xtables.lock`（文件不存在时 Docker 会建一个同名目录，反而让 NAS 自己的 iptables 报错，所以示例里没加）。关掉功能后留下的空表或已加载的 `iptable_nat` 等模块里没有规则，不影响网络。

## 反馈问题

到 [GitHub](https://github.com/mmwx-group/meowx-fnos/issues) 反馈时请带上：NAS 型号与系统版本、x86 还是 ARM、「设置」页上的版本、「透明代理」页的「防火墙：…」那一行（有的话），以及「日志」页里控制服务与内核的相关几行。日志里可能有地址与域名，发之前看一眼。
