---
title: "Docker Installation"
description: "Quickly deploy MiaoMiaoWu X using Docker"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

## Quick Deployment

```
# 推荐：运行统一安装脚本，然后选择“Docker Compose 安装”
curl -sL https://raw.githubusercontent.com/iluobei/miaomiaowuX/main/install.sh | sudo bash

# 脚本随后让你选择 SQLite 或 PostgreSQL 18，自动创建 Compose、.env 和持久化目录。
# 镜像内置 Nginx，主控可直接申请证书并启用 HTTPS。
```

## Enable HTTPS inside the container

The image includes Nginx process control

The current image does not require systemctl: the master can start, reload, and stop Nginx directly. The recommended installation consistently uses host networking; ensure host ports 80/443 are free.

Steps:

1.  Start the container with host networking as shown in Quick Deployment.
2.  Add a DNS provider in Certificate Management and request a certificate matching the master domain.
3.  Deploy the certificate to the master; the system generates the reverse-proxy config and controls Nginx directly.

You may instead keep an existing host Nginx/Caddy proxy to container port 12889. Choose one approach to avoid competing for ports 80/443.

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

This example matches the repository README and docker-compose.yml: it consistently uses host networking. Do not add separate 12889, 80, or 443 port mappings.

## 使用 PostgreSQL

一键脚本选择 PostgreSQL 后会自动启动 PostgreSQL 18 并配置主控；已有 SQLite 主控可在 “系统设置 → 数据库”测试连接并迁移。迁移前请备份`data`目录，目标数据库必须为空。

主控使用 host 网络，因此数据库主机填写`127.0.0.1`、端口`5432`，不要填写服务名`postgres`。

数据库连接保存在`/app/data/database.json`（权限 0600）， PostgreSQL 数据保存在宿主机`./postgres-data`。不要提交这两个目录或密码。

## Data Persistence

Persist data/, subscribes/, and rule_templates/. PostgreSQL 18 deployments must also mount postgres-data/ at /var/lib/postgresql. Missing a required mount can lose data when containers are recreated.

[\-> Next: Deploy Agent to remote servers](/docs/en/install-agent)
