---
title: "备份与恢复"
description: "导出、校验并恢复主控数据"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

:::note[新备份不再设置密码]
当前版本导出普通 ZIP，不要求密码。只有历史 .zip.enc 加密备份在恢复时需要原密码。请把备份文件当作敏感数据妥善保存。
:::

## 入口

- **手动备份 / 恢复**：右上角头像菜单 →「备份数据」，可下载完整 ZIP 或上传恢复
- **自动备份**：「系统设置 → 系统 → 自动备份」，定时打包（数据、证书、订阅文件，可选数据库）并上传到远端，按份数保留
- **初始化时恢复**：全新部署首次访问的初始化向导底部有「从备份恢复」，可直接用旧备份完成初始化
- **数据库切换**：「系统设置 → 数据库」在 SQLite 与 PostgreSQL 之间迁移

![用户菜单截图](../../assets/screenshots/user-menu.webp)

头像菜单：备份数据、从妙妙屋迁移、检查更新等入口

![系统设置「系统」选项卡截图](../../assets/screenshots/settings-system.webp)

系统设置 → 系统：自动备份（启用定时备份、备份目标、间隔、远端保留份数、是否包含数据库）

![系统设置「数据库」选项卡截图](../../assets/screenshots/settings-database.webp)

系统设置 → 数据库：查看当前数据库类型，迁移到 PostgreSQL 或迁回 SQLite

## 备份内容

### 数据库

用户、套餐、节点、服务器和系统设置。

### 订阅资源

subscribes 目录及生成订阅所需文件。

### 证书

已签发证书、自签证书与私钥。

## 恢复步骤

1. 在系统菜单下载新备份，并确认浏览器已完整保存 ZIP。
2. 恢复前另存当前数据；上传备份后等待服务完成校验与替换。
3. 重新登录，检查服务器、节点、证书与订阅，并让 Agent 重新连接。

## PostgreSQL 备份

:::caution[ZIP 备份仅适用于 SQLite]
主控切换到 PostgreSQL 后会拒绝生成不包含数据库的 ZIP。数据库使用 pg_dump/pg_restore，data 与 subscribes 目录仍需单独备份；自动备份里勾选「包含数据库」即可把 PostgreSQL 一并打包。
:::

```
# Docker Compose 数据库备份
docker exec miaomiaowux-postgres pg_dump -U mmwx -Fc mmwx > mmwx.dump

# 恢复到空数据库
docker exec -i miaomiaowux-postgres pg_restore -U mmwx -d mmwx --clean --if-exists < mmwx.dump

# 同时备份运行目录
tar czf mmwx-files.tar.gz data subscribes rule_templates
```

## 数据库启动恢复

主控启动时会执行 SQLite 完整性检查；数据库无法打开且存在有效的 mmwx.db.backup 时会尝试恢复。这个应急副本不是正式备份，不要依赖它。

## 自动上传到远端

手工下载的备份和主控在同一台机器上——机器整机挂掉时两份一起没。配置[定时同步备份](/docs/backup-auto-sync)可以把完整备份按间隔自动传到 WebDAV、S3 兼容存储或 Google Drive，并自动清理旧的。
