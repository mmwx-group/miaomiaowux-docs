---
title: "Version Update"
description: "How to upgrade MiaoMiaoWu X to the latest version"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

![Check Update dialog screenshot](/images/screenshots/doc-update-dialog.webp)

Check Update dialog — shows current version vs. latest GitHub Release, one-click upgrade

## Docker Update

Docker Compose is recommended because it preserves the existing ports, environment variables, and persistent mounts. If you recreate the container with docker run, use exactly the same mappings as the installation command.

### Docker Compose (recommended)

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

When recreating the container, keep host networking and the data, subscribes, and rule_templates mounts; otherwise dynamic ports may become unreachable or persistent data may be lost.

## Binary Update

Download the new version binary to replace the old file and restart the service. The database will auto-migrate.

```
# 停止服务
systemctl stop miaomiaowux

# 替换二进制
cp mmwx-linux-amd64-new /opt/mmwx/mmwx-linux-amd64

# 重启
systemctl start miaomiaowux
```

## Agent Update

Agent update follows the same process as master. Download the new version, replace, and restart. It's recommended to keep Agent and master versions consistent.
