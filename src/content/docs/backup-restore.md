---
title: "备份与恢复"
description: "导出、校验并恢复主控数据"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

新备份不再设置密码

当前版本导出普通 ZIP，不要求密码。只有历史 .zip.enc 加密备份在恢复时需要原密码。请把备份文件当作敏感数据妥善保存。

## 备份内容

### 数据库

用户、套餐、节点、服务器和系统设置。

### 订阅资源

subscribes 目录及生成订阅所需文件。

### 证书

已签发证书、自签证书与私钥。

## 恢复步骤

1.  在系统菜单下载新备份，并确认浏览器已完整保存 ZIP。
2.  恢复前另存当前数据；上传备份后等待服务完成校验与替换。
3.  重新登录，检查服务器、节点、证书与订阅，并让 Agent 重新连接。

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

## 数据库启动恢复

主控启动时会执行 SQLite 完整性检查；数据库无法打开且存在有效的 mmwx.db.backup 时会尝试恢复。项目已移除每小时数据库自动备份任务，因此不要把该应急副本当作正式备份，仍应定期从界面下载完整备份。
