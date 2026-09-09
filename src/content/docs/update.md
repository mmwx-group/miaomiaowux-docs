---
title: "版本更新"
description: "如何升级妙妙屋X到最新版本"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

![检查更新对话框截图](../../assets/screenshots/about-dialog.webp)

检查更新对话框 — 显示当前版本，可选稳定版 / 预发布版通道，有新版本时一键升级，也可「强制重新安装」

## 面板内更新（推荐）

一键脚本或二进制部署的主控可以直接在面板里升级：右上角头像菜单 →「检查更新」，选择更新通道后点升级，主控下载新版本、校验签名并自动重启。Docker 部署请用下面的镜像方式更新。

![用户菜单截图](../../assets/screenshots/user-menu.webp)

头像菜单里的「检查更新」与当前版本号

## Docker 更新

推荐使用 Docker Compose 更新，它会沿用现有端口、环境变量和持久化挂载。若使用 docker run 重建容器，必须保持与安装时完全相同的映射。

### Docker Compose（推荐）

```
# 在 docker-compose.yml 所在目录执行
docker compose pull
docker compose up -d
```

### docker run

```
# 拉取最新镜像
docker pull ghcr.io/iluobei/miaomiaowux:latest

# 确保持久化目录存在
mkdir -p data subscribes rule_templates

# 停止并删除旧容器
docker stop miaomiaowux && docker rm miaomiaowux

# 重新运行
docker run -d \
  --name miaomiaowux \
  --restart unless-stopped \
  --network host \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/subscribes:/app/subscribes \
  -v $(pwd)/rule_templates:/app/rule_templates \
  ghcr.io/iluobei/miaomiaowux:latest
```

重建时必须继续使用 host 网络，并保留 data、subscribes、rule_templates 三个目录挂载，否则可能导致动态端口不可达或持久化数据丢失。

## 二进制更新

下载新版本二进制文件替换旧文件，重启服务即可。数据库会自动迁移。

```
# 停止服务
systemctl stop miaomiaowux

# 替换二进制
cp mmwx-linux-amd64-new /opt/mmwx/mmwx-linux-amd64

# 重启
systemctl start miaomiaowux
```

## Agent 更新

Agent 不需要 SSH 到服务器：在「服务管理」里，有新版本的服务器卡片版本徽标会带红点，点它升级这一台；顶部「一键升级 Agent」批量升级所有可升级的服务器。升级过程中 Agent 会重启，服务短暂中断。Agent 与主控端版本建议保持一致。

![升级单台 Agent 确认框截图](../../assets/screenshots/servers-version-menu.webp)

升级单台 Agent

![一键升级 Agent 确认框截图](../../assets/screenshots/servers-upgrade-agents-dialog.webp)

一键升级全部 Agent
