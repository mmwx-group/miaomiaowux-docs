---
title: "Backup & Restore"
description: "Export, validate, and restore master data"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

New backups have no password

Current exports are regular ZIP files and require no password. Only legacy encrypted .zip.enc backups require their original password. Treat every backup as sensitive data.

## Included data

### Database

Users, packages, nodes, servers, and system settings.

### Subscription resources

The subscribes directory and files needed to generate subscriptions.

### Certificates

Issued certificates, self-signed certificates, and private keys.

## Restore workflow

1.  Download a fresh backup from the system menu and ensure the ZIP finishes saving.
2.  Keep a separate copy of current data; upload the backup and wait for validation and replacement.
3.  Sign in again, verify servers, nodes, certificates, and subscriptions, then allow Agents to reconnect.

## PostgreSQL 备份

ZIP 备份仅适用于 SQLite

主控切换到 PostgreSQL 后会拒绝生成不包含数据库的 ZIP。数据库使用 pg_dump/pg_restore，data 与 subscribes 目录仍需单独备份。

```
# Docker Compose 数据库备份
docker exec miaomiaowux-postgres pg_dump -U mmwx -Fc mmwx > mmwx.dump

# 恢复到空数据库
docker exec -i miaomiaowux-postgres pg_restore -U mmwx -d mmwx --clean --if-exists < mmwx.dump

# 同时备份运行目录
tar czf mmwx-files.tar.gz data subscribes rule_templates
```

## Startup database recovery

The master checks SQLite integrity on startup and may restore a valid mmwx.db.backup if the database cannot open. The hourly database backup task has been removed, so this emergency copy is not a formal backup; regularly download a complete backup from the UI.
