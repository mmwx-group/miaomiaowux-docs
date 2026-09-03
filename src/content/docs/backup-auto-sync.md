---
title: "定时同步备份"
description: "把完整备份定时上传到 WebDAV、S3 兼容存储或 Google Drive，并自动清理旧备份"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

## 概述

[备份与恢复](/backup-restore/)里的备份需要管理员手工点下载。定时同步备份让主控**按间隔自动打包并上传到远端**，再按份数清理旧的——机器整机挂掉时，本地那份备份也一起没了，异地副本才是真的保险。

产物和手工下载**完全一致**：同一份打包逻辑，不存在「自动备份恢复出来跟手工下载的不一样」。

## 在哪里配置

**系统设置 → 系统 → 自动备份**

| 设置项 | 说明 |
| --- | --- |
| 启用定时备份 | 关掉后不再自动跑，但「立即备份一次」仍可用 |
| 备份目标 | WebDAV / S3 兼容 / Google Drive |
| 间隔（小时） | 1 – 720（30 天）。超出范围会被收敛 |
| 远端保留份数 | 超出份数时删最旧的；填 `0` = 不自动清理 |
| 包含数据库 | 仅 PostgreSQL 部署需要勾。SQLite 的库本来就在 `data/` 里，一定会被带上 |

改完点**保存**。建议先点**测试连接**，再点**立即备份一次**确认整条链通了，最后才打开定时。

## 接入 WebDAV

适用于 Nextcloud、坚果云、群晖 Synology Drive、InfiniCloud 等。

1. 在网盘里**先建好**存备份的目录（本功能不会自动创建目录）。
2. 填目录的完整地址，注意是目录本身、不是网盘根地址：

   ```
   Nextcloud   https://cloud.example.com/remote.php/dav/files/<用户名>/mmwx-backup
   坚果云       https://dav.jianguoyun.com/dav/mmwx-backup
   群晖         https://nas.example.com:5006/mmwx-backup
   ```

3. 用户名填网盘账号。密码建议用**应用专用密码**而不是主密码——坚果云、Nextcloud 都支持单独签发，泄露了也能单独吊销。

## 接入 S3 兼容存储

覆盖 Cloudflare R2、Backblaze B2、MinIO、阿里云 OSS、AWS S3 等所有支持 SigV4 的服务。

| 字段 | 填什么 |
| --- | --- |
| Endpoint | 服务商给的地址。AWS 官方可留空（按 Region 推导） |
| Region | R2 填 `auto`；AWS 填实际区域；其余按服务商文档 |
| Bucket | 桶名 |
| 目录前缀 | 桶内子目录，可留空 |
| Access Key / Secret Key | 访问密钥 |
| 路径风格 | MinIO、自建服务通常要勾；R2 和 AWS **不要**勾 |

各家的典型填法：

```
Cloudflare R2   Endpoint: https://<账号ID>.r2.cloudflarestorage.com
                Region: auto        路径风格: 不勾

MinIO           Endpoint: https://minio.example.com:9000
                Region: us-east-1   路径风格: 勾上

阿里云 OSS       Endpoint: https://oss-cn-hangzhou.aliyuncs.com
                Region: oss-cn-hangzhou
```

> **密钥权限**：给这把密钥的权限够用就好——需要写入、列目录、删除三样。只给读权限的话备份根本传不上去；不给删除权限则备份能传但旧的清理不掉。

## 接入 Google Drive

Google Drive 需要一组 OAuth 凭据。当前版本要自行准备，步骤如下：

1. 打开 [Google Cloud Console](https://console.cloud.google.com/)，新建一个项目。
2. 启用 **Google Drive API**。
3. 配置 OAuth 同意屏幕，把自己的账号加进测试用户。
4. 创建 **OAuth 客户端 ID**，类型选「桌面应用」。记下 client ID 与 client secret。
5. 用它们走一次授权，拿到 **refresh token**（Google 的 OAuth Playground 或任意 OAuth 工具都可以）。
6. 把 client ID、client secret、refresh token 填进面板。文件夹 ID 可留空（传到云盘根目录），要指定目录就填网盘地址栏 `folders/` 后面那段。

> **必须用个人账号的 refresh token，不要用服务账号（service account）。** 服务账号自己的存储配额几乎为 0，上传大备份必然失败，而且报错信息不会直说是配额问题。

## 间隔与保留

- 调度器每 10 分钟醒一次，检查「离上次成功备份是否已超过间隔」。所以**改完配置不用重启**，也不会因为重启而重新等满一个周期。
- 主控启动后 5 分钟内不跑备份——刚起来时数据库和证书都在初始化，这时打包既慢又容易撞上。
- 保留策略**只会删名字以 `miaomiaowux-backup-` 开头、以 `.zip` 结尾的文件**。你放在同一个目录/桶里的其他东西不会被碰。
- 清理失败不算备份失败：备份本身已经安全落地了，清理只影响占用空间，日志里会单独记一条。

## 测试连接做了什么

点「测试连接」时，主控会上传一个小探针文件、列一次目录、再把它删掉。

**只测「能否连上」是不够的**——最常见的配错是*能连但没有写权限*（WebDAV 目录只读、S3 密钥只给了读、Drive 文件夹不属于这个账号）。这类问题如果留到定时任务里才暴露，往往是几天后才发现一份备份都没有。

探针文件的名字不带 `miaomiaowux-backup-` 前缀，所以不会被当成一份真备份计入保留份数。

## 怎么恢复

远端的备份和手工下载的是同一种 ZIP。把它下载回本地，按[备份与恢复](/backup-restore/)里的恢复步骤操作即可。

> 建议**定期真的恢复一次**到测试环境。没验证过的备份不算备份——最常见的是发现 PostgreSQL 部署忘了勾「包含数据库」，备份里只有文件没有库。

## 凭据是怎么存的

填进面板的密码 / 密钥用主控身份密钥派生出的密钥加密后入库，读取接口一律只返回 `********`；保存时把占位符原样提交表示「这一项不修改」。

要说清它的边界：**这层加密防的是「只拿到数据库」那类泄露**——比如把 PostgreSQL dump 发给别人排障、或者数据库有只读账号。它**不防「连 `data/` 目录一起拿走」**，因为密钥就存在 `data/mmwx_master.key` 里。所以远端备份本身仍要当作敏感数据保管。

## 常见问题

### 上传失败：403 / SignatureDoesNotMatch

多半是 S3 的**路径风格**勾错了，或 Region 填错。R2 用 `auto` 且不勾路径风格；MinIO 一般要勾。

### WebDAV 报 411 或 501

服务端不接受分块上传。本功能已显式发送 `Content-Length`，如仍失败，检查中间的反向代理是否改写了请求。

### Google Drive 报「未返回访问令牌」

refresh token 已失效。Google 的测试用户模式下 refresh token 有效期较短（约 7 天），把应用发布状态从「测试」改为「生产」可避免频繁失效。

### 备份传上去了，但旧的一直不清理

检查密钥有没有删除权限，以及「远端保留份数」是不是填了 `0`。也可以点一次「测试连接」——它会把删除权限一起验掉。

### 想确认到底跑没跑

「上次成功」时间显示在卡片说明里。失败会记进定时任务运行记录，日志里搜 `[自动备份]`。
