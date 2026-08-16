---
title: "版本更新"
description: "如何升级妙妙屋X到最新版本"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

![检查更新对话框截图](/images/screenshots/doc-update-dialog.webp)

检查更新对话框 — 显示当前版本与最新 GitHub Release,可一键升级

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

Agent 更新方式与主控端相同，下载新版本替换后重启即可。Agent 与主控端版本建议保持一致。
