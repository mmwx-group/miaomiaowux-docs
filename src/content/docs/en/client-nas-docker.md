---
title: "NAS Docker Edition"
description: "Run MeowX with Docker on Synology, QNAP, UGREEN and other NAS (or any Linux machine with Docker): getting the image, install steps for each NAS, environment variables, upgrading and uninstalling, firewall backends and FAQ"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

The Docker edition of MeowX brings the [fnOS NAS edition](/docs/en/client-download#fnos-nas) to other NAS systems: **Synology** (DSM 7, Container Manager), **QNAP** (QTS / QuTS hero, Container Station), **UGREEN** (UGOS Pro), and any Linux machine with Docker.

It is the same program as the fnOS edition, with the same web UI and features: subscriptions and nodes, a proxy port for your LAN, the transparent proxy (the NAS itself, other containers on the NAS, side router), [MeowNest](/docs/en/meownest#fnos-nas) and Extras. Only installing, upgrading and, on NAS systems with older kernels such as Synology, the way the transparent proxy hooks into the firewall are different.

> The Docker edition is new and has been tested with Docker on Linux. If it doesn't work on your NAS, report it on [GitHub](https://github.com/mmwx-group/meowx-fnos/issues) with your NAS model and the details listed under "Reporting problems" below.

## Requirements

- An x86_64 or arm64 NAS (or Linux machine) with Docker and Docker Compose (included in the Docker apps of Synology, QNAP and UGREEN).
- The container needs the **host network**, the `NET_ADMIN` / `NET_RAW` capabilities and the TUN device `/dev/net/tun` (like the official Tailscale container); the compose file below sets all of them. Synology doesn't provide the TUN device by default; the install steps show how to load it.
- The transparent proxy and MeowNest change the NAS's own firewall and routing. MeowX removes everything it added when you turn them off or the container stops.

## Getting the image

The image is `ghcr.io/mmwx-group/meowx-docker`, for x86_64 (amd64) and arm64. Both ways below give you an image with that name, so the same compose file works:

- **Offline image** (recommended when ghcr.io is slow or blocked, e.g. in mainland China): download the file for your NAS's processor, then import it in the NAS's Docker app (see the steps for each NAS):
  - `meowx-docker-<version>-amd64.tar` (Intel / AMD) or `meowx-docker-<version>-arm64.tar` (ARM) from [GitHub Releases](https://github.com/mmwx-group/meowx-fnos/releases);
  - or `https://dl.miaomiaowux.com/meowx/docker/meowx-docker-<version>-amd64.tar` (`-arm64.tar` for ARM).
- **Pull it** (when the NAS can reach ghcr.io): Docker pulls `ghcr.io/mmwx-group/meowx-docker:latest` by itself when creating the container.

## The compose file

Use [`docker/docker-compose.yml`](https://github.com/mmwx-group/meowx-fnos/blob/main/docker/docker-compose.yml) from the repository. Without its comments it is:

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

Keep `network_mode: host`, the two capabilities and the TUN device: without them the transparent proxy and MeowNest don't work. Set `MEOWX_PLATFORM` to your NAS (`synology` / `qnap` / `ugreen`); it only changes the edition name in the web UI and the system name reported to the panel. `./data` is the data folder: settings, subscriptions, the panel account and the MeowNest device identity are all kept there.

## Synology (DSM 7)

1. **Load the TUN module.** Synology has no `/dev/net/tun` by default, and the container can't start without it. Over SSH, run:
   ```sh
   sudo insmod /lib/modules/tun.ko
   ls -l /dev/net/tun
   ```
   If the second command lists the file, you're set.
2. **Load it at boot.** Control Panel → Task Scheduler → Create → Triggered Task → User-defined script; user `root`, event "Boot-up", and this script under "Task Settings":
   ```sh
   [ -e /dev/net/tun ] || insmod /lib/modules/tun.ko
   ```
3. **Import the image** (skip if the NAS can reach ghcr.io): Container Manager → Image → Add → Add from file → choose the `.tar`.
4. **Prepare a folder.** In File Station, create a folder such as `/volume1/docker/meowx`, put `docker-compose.yml` in it, and change `MEOWX_PLATFORM=docker` to `MEOWX_PLATFORM=synology`.
5. **Create the project.** Container Manager → Project → Create; choose that folder as the path and use the existing `docker-compose.yml`. It starts once built.
6. Open `http://<NAS address>:7899` in a browser.

Synology's kernel has no nftables and no TPROXY, so MeowX switches to its iptables backend. The transparent proxy still works; see [Firewall backends](#firewall-backends) for the differences.

## QNAP (QTS / QuTS hero)

1. **Check for TUN.** Over SSH: `ls -l /dev/net/tun`. If it's missing, run `sudo modprobe tun` (or `insmod` the system's `tun.ko`). To load it at boot, use `autorun.sh` (first allow user-defined processes under "Control Panel → Hardware → General").
2. **Import the image** (skip if the NAS can reach ghcr.io): Container Station → Images → Import → choose the `.tar`.
3. **Create the application.** Container Station → Applications → Create, paste the compose file; replace `./data` with an absolute path (e.g. `/share/Container/meowx/data`) and set `MEOWX_PLATFORM` to `qnap`.
4. Open `http://<NAS address>:7899` in a browser.

## UGREEN (UGOS Pro)

1. UGOS Pro uses a recent Debian kernel that usually has TUN and nftables (the transparent proxy works as on fnOS). You can check with `ls -l /dev/net/tun` over SSH.
2. **Import the image** (skip if the NAS can reach ghcr.io): Docker app → Image → Local image → Import.
3. **Create the project.** Docker app → Project → Create, paste the compose file; point the data folder at a path in a shared folder and set `MEOWX_PLATFORM` to `ugreen`.
4. Open `http://<NAS address>:7899` in a browser.

## Other Linux machines with Docker

```sh
mkdir -p ~/meowx && cd ~/meowx
curl -fLO https://raw.githubusercontent.com/mmwx-group/meowx-fnos/main/docker/docker-compose.yml
docker compose up -d
```

Without access to ghcr.io, load the offline image first: `docker load -i meowx-docker-<version>-amd64.tar`.

## Getting started

From here it works like the fnOS edition: on the "Subscriptions" page, sign in to your panel account (NAS boxes can't scan QR codes, so use "Copy login link" in the panel) or paste a subscription link, then start it on "Overview".

- **Proxy port**: devices on your LAN can set their HTTP / SOCKS5 proxy to `<NAS address>:7890`. The LAN and the NAS itself need no password; connections from the internet do (the account is under "Mixin").
- **Transparent proxy**: on the "Transparent proxy" page, turn it on separately for the NAS itself, other containers and LAN devices (side router: set the device's gateway **and** DNS to the NAS address; IPv4 only). After turning it on or changing it there is a trial of a few minutes: click "Keep settings" once the network works. If you don't, it turns itself off and removes all of its rules.
- **MeowNest**: after signing in with an admin account (or one MeowNest is enabled for), you can join the mesh and share the NAS's LAN, see [MeowNest](/docs/en/meownest#fnos-nas).

The web UI has no password by default; if port 7899 of the NAS is reachable from the internet, set one under "Settings". If you forget it: stop the container, set `"password"` under `"web"` in `settings.json` in the data folder to an empty string, and start it again.

The container uses the host network, so these ports are taken on the NAS itself; avoid clashing with other services:

| Port | Used for |
|---|---|
| 7899/tcp | Web UI (change with `MEOWX_UI_PORT`) |
| 7890/tcp | Mixed HTTP / SOCKS5 proxy port (changeable under "Mixin") |
| 7891/tcp | Redirect port (transparent proxy, iptables backend) |
| 7892/tcp+udp | TPROXY port (side router, nftables backend) |
| 1053/tcp+udp | The core's DNS (when the transparent proxy hijacks DNS) |
| 127.0.0.1:9090 | The core's controller (local only) |
| 41641/udp | MeowNest |

## Environment variables

| Variable | Default | Meaning |
|---|---|---|
| `MEOWX_PLATFORM` | `docker` | `docker` / `synology` / `qnap` / `ugreen`: the edition name in the web UI, and the system name reported to the panel and in the subscription UA |
| `MEOWX_UI_PORT` | `7899` | Web UI port |
| `TZ` | `Asia/Shanghai` | Time zone |
| `MEOWX_FIREWALL` | auto | `nftables` / `iptables`: force a firewall backend |
| `MEOWX_IPTABLES` | auto | With the iptables backend, `legacy` or `nft`; auto follows the set the NAS already uses most (where Docker's own rules are) |
| `MEOWX_POLICY_ROUTING` | auto | `off` = act as if there were no policy routing, so the transparent proxy doesn't use TUN (for troubleshooting, see [FAQ](#faq)) |

## Upgrading

"Settings" in the web UI checks for new versions. When one is out it shows the new version, "What's new", "Download offline image" and the image name, but it **can't update in one click**: a container can't replace its own image. To upgrade:

- **Offline image**: download the new `.tar` and import it as above (this points `ghcr.io/mmwx-group/meowx-docker:latest` at the new version), then rebuild the project in the Docker app (or run `docker compose up -d` in the compose folder).
- **With access to ghcr.io**: run `docker compose pull && docker compose up -d` in the compose folder.

The data folder is untouched: settings, subscriptions, the panel account and the MeowNest device identity are kept, and the NAS stays the same device in MeowNest.

## Uninstalling

Stop and delete the project (or container) in the Docker app, or run `docker compose down`. When MeowX stops it removes all of its transparent proxy and MeowNest rules and routes, so the NAS's network goes back to normal; change back any device that uses the proxy port or points its gateway and DNS at the NAS.

To remove everything: if the NAS is in MeowNest and you want it gone from the panel, click "Leave MeowNest" on the MeowNest page first; then delete the project / container and the image, and delete the data folder. On Synology you can also delete the boot task that loads TUN if nothing else needs it.

## Firewall backends

MeowX checks the NAS's kernel once at startup and picks a firewall backend. The control service log has a "Firewall: …" line, and the "Transparent proxy" page shows it when it isn't nftables.

| Backend | When | How the transparent proxy works |
|---|---|---|
| nftables | The kernel has nftables and policy routing (UGREEN, most Linux, fnOS) | As on fnOS: the NAS and containers go through the core's TUN, the side router uses TPROXY |
| iptables | The kernel has no nftables (Synology) | The NAS and containers still go through TUN; the side router's TCP is redirected to the redirect port 7891, UDP goes through TUN (no TPROXY) |

The iptables backend keeps its rules in its own `MEOWX_*` chains with only jumps in the built-in chains, and deletes them all when the feature is turned off or the container exits. Forwarding between the LAN and TUN is allowed in Docker's `DOCKER-USER` chain (Docker drops forwarded traffic by default). MeowNest mapped subnets are limited to a /24 (256 addresses) each; larger ones are skipped with an error in the log.

**Without policy routing** (not supported by the kernel, or `MEOWX_POLICY_ROUTING=off`), the core's TUN can't be used and the transparent proxy falls back to redirection: TCP from the NAS, other containers and the side router goes to the core, DNS is still hijacked, and **UDP is not proxied** (QUIC falls back to TCP; UDP-only apps such as games go out directly or don't work). The "Transparent proxy" page says "no policy routing".

## FAQ

**The container doesn't start**

- No `/dev/net/tun`: load the TUN module first (Synology: `sudo insmod /lib/modules/tun.ko`) and make it load at boot as above.
- A port is in use: with the host network, another program on the NAS using 7899, 7890–7892 or 1053 stops it. Change the conflicting one; the web UI port can be moved with `MEOWX_UI_PORT`.
- See the container's own log in the Docker app, or with `docker logs meowx`.

**The transparent proxy for the NAS itself misbehaves on Synology**

Synology's older kernel may not accept a few of the policy routing rules the core's TUN uses. Add `MEOWX_POLICY_ROUTING=off` to the compose environment and recreate the container; the transparent proxy then works the "without policy routing" way.

**UDP doesn't work for side-router devices**

With the iptables backend, replies to side-router devices' UDP come in through TUN with internet source addresses, and the NAS drops them when its reverse path filter (`net.ipv4.conf.all.rp_filter`) is strict (1). MeowX tries to relax it but usually can't from inside a container. Run this on the NAS:

```sh
sudo sysctl -w net.ipv4.conf.all.rp_filter=2
```

On Synology, add it to the boot task that loads TUN.

**iptables rules occasionally get overwritten**

iptables (legacy) reads a whole table, changes it and writes it back, so if Docker changes its rules at the same moment, one change can overwrite the other. The window is only the moment you toggle the transparent proxy or MeowNest. To rule it out, check that `/run/xtables.lock` on the NAS is a **file**, then add `- /run/xtables.lock:/run/xtables.lock` under `volumes` in the compose file (if the file doesn't exist, Docker creates a directory with that name, which breaks the NAS's own iptables, so the example doesn't include it). Empty tables or loaded modules such as `iptable_nat` left after turning things off contain no rules and don't affect the network.

## Reporting problems

When you report on [GitHub](https://github.com/mmwx-group/meowx-fnos/issues), include: your NAS model and system version, x86 or ARM, the version from "Settings", the "Firewall: …" line from the "Transparent proxy" page (if any), and the relevant lines of the control service and core logs from "Logs". Logs may contain addresses and domain names, so look them over first.
