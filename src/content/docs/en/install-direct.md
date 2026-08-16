---
title: "Direct Installation"
description: "Deploy MiaoMiaoWu X directly via binary file"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

## One-click install (recommended)

Interactively choose native or Docker Compose installation and SQLite or PostgreSQL 18; the script installs dependencies, configures the database and starts the service.

```
# 安装：脚本中选择“本机安装”，再选择 SQLite 或 PostgreSQL 18
curl -sL https://raw.githubusercontent.com/iluobei/miaomiaowuX/main/install.sh | sudo bash

# 无人值守示例：本机 + PostgreSQL 18
curl -sL https://raw.githubusercontent.com/iluobei/miaomiaowuX/main/install.sh |   sudo MMWX_INSTALL_METHOD=native MMWX_DATABASE_DRIVER=postgres bash

# 更新
curl -sL https://raw.githubusercontent.com/iluobei/miaomiaowuX/main/install.sh | sudo bash -s update

# 卸载
curl -sL https://raw.githubusercontent.com/iluobei/miaomiaowuX/main/install.sh | sudo bash -s uninstall
```

If you need a custom install path or an offline deployment, you can also install manually as shown below.

SQLite 数据保存在 `/etc/mmwx/data/mmwx.db`。选择 PostgreSQL 后，脚本安装 PostgreSQL 18，并将自动生成的连接配置写入 `/etc/mmwx/data/database.json`（0600 权限）。

## Download

Download the binary for your platform from GitHub Releases (data is written to data/ and subscribes/ next to the binary):

```
# Linux amd64
wget https://github.com/iluobei/miaomiaowux/releases/latest/download/mmwx-linux-amd64
chmod +x mmwx-linux-amd64

# 运行
./mmwx-linux-amd64
```

## Configuration

Tune runtime options through environment variables or a config file. One-click installs use /etc/mmwx/data; MMWX_DATA_DIR can override it:

```
# 环境变量
export PORT=12889
export JWT_SECRET=your-secret-key
export LOG_LEVEL=info

# 或使用配置文件
./mmwx-linux-amd64 -c config.yaml

# 数据目录（可通过 MMWX_DATA_DIR 指定）:
#   data/mmwx.db     SQLite 数据库
#   data/database.json PostgreSQL 连接配置
#   data/logs/       日志
#   subscribes/      订阅文件
#   rule_templates/  规则模板
```

## Systemd Service

Recommended to use systemd for service management:

```
[Unit]
Description=MiaomiaoWuX
After=network.target

[Service]
Type=simple
ExecStart=/opt/mmwx/mmwx-linux-amd64
WorkingDirectory=/opt/mmwx
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

[\-> You can also use Docker for installation](/docs/en/install-docker)
