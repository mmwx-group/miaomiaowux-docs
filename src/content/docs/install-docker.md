---
title: "Docker 安装"
description: "使用 Docker 快速部署妙妙屋X"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

## 快速部署

```
# 推荐：运行统一安装脚本，然后选择“Docker Compose 安装”
curl -sL https://raw.githubusercontent.com/iluobei/miaomiaowuX/main/install.sh | sudo bash

# 脚本随后让你选择 SQLite 或 PostgreSQL 18，自动创建 Compose、.env 和持久化目录。
# 镜像内置 Nginx，主控可直接申请证书并启用 HTTPS。
```

## 在容器中开启 HTTPS

镜像已内置 Nginx 服务控制

当前镜像不依赖 systemctl：主控可直接启动、重载和停止容器内 Nginx。推荐安装命令统一使用 host 网络，请确认宿主机 80/443 端口未被占用。

步骤:

1.  按照快速部署示例使用 host 网络启动容器。
2.  在证书管理添加 DNS 提供商并申请与主控域名匹配的证书。
3.  部署证书到主控；系统会生成 Nginx 反代配置并直接管理进程。

也可继续使用宿主机已有的 Nginx/Caddy 反代容器的 12889 端口；两种方式只选一种，避免争用 80/443。

## Docker Compose

```
services:
  miaomiaowux:
    image: ghcr.io/iluobei/miaomiaowux:latest
    container_name: miaomiaowux
    restart: unless-stopped
    network_mode: host
    volumes:
      - ./data:/app/data
      - ./subscribes:/app/subscribes
      - ./rule_templates:/app/rule_templates
    environment:
      - PORT=12889
      - LOG_LEVEL=info
  postgres:
    image: postgres:18-alpine
    container_name: miaomiaowux-postgres
    restart: unless-stopped
    profiles: ["postgres"]
    environment:
      POSTGRES_DB: mmwx
      POSTGRES_USER: mmwx
      POSTGRES_PASSWORD: 请替换为强密码
    volumes:
      - ./postgres-data:/var/lib/postgresql
    ports:
      - "127.0.0.1:5432:5432"
```

该示例与仓库 README、docker-compose.yml 一致，统一使用 host 网络；不要再额外配置 12889、80 或 443 的端口映射。

## 使用 PostgreSQL

一键脚本选择 PostgreSQL 后会自动启动 PostgreSQL 18 并配置主控；已有 SQLite 主控可在 “系统设置 → 数据库”测试连接并迁移。迁移前请备份`data`目录，目标数据库必须为空。

主控使用 host 网络，因此数据库主机填写`127.0.0.1`、端口`5432`，不要填写服务名`postgres`。

数据库连接保存在`/app/data/database.json`（权限 0600）， PostgreSQL 数据保存在宿主机`./postgres-data`。不要提交这两个目录或密码。

## 数据持久化

必须持久化 data/、subscribes/、rule_templates/；选择 PostgreSQL 18 时还必须持久化 postgres-data/ 到 /var/lib/postgresql。缺少任一对应挂载都可能在容器重建时丢失数据。

[→ 接下来部署 Agent 到远程服务器](/docs/install-agent)
