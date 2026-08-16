---
title: "直接安装"
description: "通过二进制文件直接部署妙妙屋X"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

## 一键安装(推荐)

交互选择本机或 Docker Compose，并选择 SQLite 或 PostgreSQL 18；脚本自动安装依赖、创建数据库配置并启动服务。

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

如果需要自定义安装路径或离线部署,也可以按下面的方式手动安装。

SQLite 数据保存在 `/etc/mmwx/data/mmwx.db`。选择 PostgreSQL 后，脚本安装 PostgreSQL 18，并将自动生成的连接配置写入 `/etc/mmwx/data/database.json`（0600 权限）。

## 下载

从 GitHub Releases 下载对应平台的二进制文件(数据会写在二进制所在目录的 data/ 与 subscribes/ 下):

```
# Linux amd64
wget https://github.com/iluobei/miaomiaowux/releases/latest/download/mmwx-linux-amd64
chmod +x mmwx-linux-amd64

# 运行
./mmwx-linux-amd64
```

## 配置

通过环境变量或配置文件调整运行参数。一键安装的数据目录为 /etc/mmwx/data，也可用 MMWX_DATA_DIR 指定:

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

## Systemd 服务

推荐使用 systemd 管理服务：

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

[→ 也可以使用 Docker 安装](/docs/install-docker)
