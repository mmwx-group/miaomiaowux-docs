---
title: "从妙妙屋迁移到妙妙屋X"
description: "把已有妙妙屋(mmw)数据完整迁移到妙妙屋X，客户端订阅 URL / xray 凭据 / nginx / 证书全部保留，只换主控"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

## 完整迁移向导(演示)

下面是真实主控 /migrate-from-mmw 页面的本地 mock 复刻 — 5 个步骤、所有交互、表单、扫描结果都可点,但全部数据是写死的,不会发任何网络请求。先在文档里走一遍熟悉流程,再去主控真正操作。

演示Mock 数据跟主控 /migrate-from-mmw 一致,但不发任何网络请求

**1概述**

**2备份停服**

**3导入数据**

**4认领节点**

**5验证完成**

欢迎使用迁移向导

开始前请通读以下要点,确认无误后再进入下一步。

迁移保证

- **客户端订阅 URL 不变** — 用户的 Clash / Shadowrocket 不用改
- **xray UUID / password 不变** — 协议层无感切换
- **nginx 配置不动** — 反代继续指向同一个端口
- **SSL 证书不动** — certbot 不需要重新申请
- **mmw 不会被删除** — systemctl 只是停掉服务,失败可回滚

前置要求

- 你已经把妙妙屋X 二进制装好,并通过 systemd 跑在 mmw 同一端口上
- 当前 mmwx 数据库**是空的**(无套餐 / 节点 / 用户) — 否则会被 mmw 数据覆盖
- 具备 root SSH 访问到部署 mmw 的机器
- 所有 mmw 时代的远程节点服务器都已安装 `mmw-agent` 并接入 mmwx 主控

### 迁移流程概览

1.  **停止 mmw 并备份** — 防止数据继续变化 + 失败回滚
2.  **导入 mmw.db** — 上传 / 填路径,主控读取并迁移 schema
3.  **认领节点 / 用户** — 把 xray 现有 client 绑定到 mmwx 用户
4.  **验证并完成** — 测一个客户端订阅 URL 是否仍可用

读完详细文档 →[升级指南完整版](https://miaomiaowux.com/docs/upgrade-from-mmw)

**我已了解,开始**

## 谁需要看这篇

已经在用妙妙屋(mmw)跑订阅 + 节点管理，想升级到妙妙屋X(mmwx)继续用，但不想：

- 让客户端重新加订阅（URL 保持不变）
- 重新申请 SSL 证书 / 改 nginx 反代配置
- 修改 xray 服务器的 UUID / password（协议层无感）
- 手工重建套餐 / 用户 / 节点 / 订阅模板

这套迁移向导就是为你设计的。所有操作只动 mmw 数据库，不碰客户端、不碰 nginx、不碰证书，失败可回滚。

## 迁移保证 vs 前置要求

### ✓ 迁移保证

- 客户端订阅 URL 不变 — Clash / Shadowrocket 等不用动
- xray UUID / password 不变 — 协议层无感
- nginx 配置不动 — 反代继续指向同一端口
- SSL 证书不动 — certbot 不需重新申请
- mmw 服务可回滚 — systemctl 只是停掉，不删除任何文件
- 用户短码 / 订阅短码保留 — 之前发出去的 /x/<code> 短链继续可用

### ! 前置要求

- 已经保存了妙妙屋的完整数据备份
- 已经把 mmwx 二进制装好（直接安装或 Docker），并通过 systemd 跑在 mmw 同一端口
- 当前 mmwx 数据库是空的（刚装好的初始状态，无套餐 / 节点 / 用户），否则会被 mmw 数据覆盖
- 具备 root SSH 访问到部署 mmw 的机器
- 所有 mmw 时代用过的远程节点服务器都已装 mmw-agent 并接入 mmwx 主控，见 Agent 部署
- 客户端在迁移期间会有 1-2 分钟短暂断连（mmw 停 → mmwx 接管订阅生效）

## 入口

用管理员账号登录 mmwx 后，点右上角头像菜单 → 「从妙妙屋迁移」，即可进入 5 步向导。该入口对普通用户不可见，后端 6 个 /api/admin/migrate/\* 接口全部受 RequireAdmin 保护，非管理员调用会返回 403。

总预计耗时 10–30 分钟（主要取决于 mmw 数据规模和 SSH 网络）。

## Step 1 — 概述与前置

向导首页把上述「保证 + 前置」列出来一遍，请认真过一遍 — 特别是「mmwx 数据库必须是空的」这一条，否则继续会失败或覆盖现有数据。确认无误点「我已了解，开始」。

## Step 2 — 停止 mmw + 备份

### 自动模式（推荐）

1.  填写 mmw 主控地址、管理员账号 / 密码
2.  mmwx 主控以该账号登录 mmw，调 mmw 的 /api/admin/backup/download 拉取完整备份 zip（数据库 + 订阅文件）到 mmwx 本地的 /tmp/mmwx-migrate/
3.  解压、记录 db 路径、订阅文件数，展示给你确认
4.  SSH 到 mmw 机器 systemctl stop miaomiaowu 停服，防止迁移过程中 mmw 数据继续变化

### 手动模式

不想给 mmw 账号 / 不能跑 SSH？切到手动模式，向导提供完整命令片段：

```
# 在 mmw 机器上:
systemctl stop miaomiaowu
cd /path/to/miaomiaowu
zip -r /tmp/mmw-backup.zip data/ subscribes/
scp /tmp/mmw-backup.zip 你@mmwx 主控:/tmp/
```

把 zip 拷到 mmwx 主控本地任意路径，下一步告诉向导路径即可。

**失败回滚：** 此步只是 systemctl stop，没删任何文件。任何时候出问题，SSH 上去 systemctl start miaomiaowu 即可恢复 mmw。

## Step 3 — 导入 mmw 数据库

### 支持两种导入

- 自动模式接力：Step 2 已经把备份拉到本地，这里直接显示路径，点「导入」即可
- 上传 zip：浏览器上传整个 mmw 备份 zip（数据库 + subscribes/），后端自动解压

### 导入做了什么

- 用 SQLite ATTACH DATABASE 把 mmw.db 挂为 src，每张表 INSERT OR IGNORE INTO main.X SELECT ... FROM src.X
- 迁移的表：users, user_tokens, nodes, subscribe_files, user_subscriptions, user_settings, templates, custom_rules, override_scripts, external_subscriptions
- 用户短码 + 订阅短码原样保留（从 user_tokens / subscribe_files 带过来），之前分发的 /x/<code> 短链继续生效
- 拷贝 subscribes/ 目录里的 yaml 模板文件到 mmwx subscribes/（同名文件保留 mmwx 现有的，不覆盖）
- 把 subscribe_files / templates 中 created_by 为空的行设为系统第一个 admin 用户名

整个导入在一个 SQLite 事务里，任何一张表失败 → 全部回滚，数据库保持 import 前状态。

## Step 4 — 认领节点 / 用户

mmw 时代的节点配置以 clash_config 形式存在（裸 vless / vmess / trojan / hy2 配置），没有"远程服务器"概念，服务器是手工运维的。mmwx 改成了「服务器 + 入站 + 节点」三层模型，需要把 mmw 节点跟 mmwx 受管 xray 服务器对接起来。这一步做两件事：

1.  添加服务器 — 向导列出所有 mmw 节点指向的去重服务器地址。点旁边的「去添加」自动在 mmwx 创建一台远程服务器（地址 / 名称从节点信息自动填入），生成 agent token，提示你去服务器装 mmw-agent。
2.  接管外部 xray + 扫描补 email — 服务器上 mmw 时代手动起的外置 xray，如果选择以 embedded 模式重新部署，可一键合并 /etc/xray/config.json + /etc/xray/conf/\*.json 到 mmwx 标准路径 /usr/local/etc/xray/config.json（原文件归档为 .before-mmwx-<ts>）。然后扫描这个 xray 配置里所有 inbound 的 client，把 email 补全并绑到管理员的子账户里（mmw 时代没有这个概念，迁移后这些"自定义 client"统一归属 admin）。

### 智能认领，不创建重复节点

扫描完成后，主控会把 xray 入站同步到 mmwx 节点表。如果某个入站的 protocol:port 跟一个已从 mmw 导入的"外部节点"（original_server=''）匹配，会自动 claim 该节点（绑定 server + inbound_tag），而不是新建一个重复节点。结果以 toast 显示：「扫描完成，自动绑定 X 个已有节点，新增 Y 个节点」。

## Step 5 — 验证并完成

### 必做的 3 项验证

1.  客户端订阅可拉取 — 用一个原 mmw 用户的订阅 URL（原样不变）在 Clash 里刷新一下，看节点列表是否还在 + 能不能连上。
2.  节点测速 — 在节点管理打开节点测速工作台，对几个迁移过来的节点测一下，确认实际可用。
3.  用户登录 — 找一个普通用户账号登 mmwx，用原 mmw 密码登录，看个人订阅页能不能进。

三项都通过，迁移完成 ✓。可以把 mmw 二进制 / data 目录留着，确认稳定运行 1-2 周后再清理。

## 常见问题

### 导入提示「INSERT OR IGNORE 跳过 N 行」

说明 mmwx 数据库不是空的，某些主键 / 唯一索引冲突导致行被忽略。建议：停 mmwx → 删 data/mmwx.db → 重启 mmwx（会重新走 setup 创建一个干净库）→ 重跑迁移。

### 家用 mmw 备份接口拉不到

mmw 的 /api/admin/backup/download 需要 mmw v0.7+ 版本。老版本只能走手动模式 scp。

### 接管外部 xray 后某些 inbound 丢了

合并逻辑按 tag 字段去重。两个 confdir 文件里同名 tag 只保留先合并的那个。如果丢失，可以从 /etc/xray/config.json.before-mmwx-<ts> 恢复后手工合并到 /usr/local/etc/xray/config.json。

### 同 server:port 的 mmw 外部节点被新建了两次，没自动绑定

Claim 逻辑用 server + port + protocol 三元组匹配，clash type:ss 跟 xray protocol:shadowsocks 等价已经处理。若仍未匹配，通常是 mmw 节点存的服务器地址跟 mmwx 服务器配置的不一致（例如一个用 IP，一个用域名），可以手工去节点详情页改 original_server / inbound_tag。

### 普通用户能调迁移接口吗？

不能。所有 6 个 /api/admin/migrate/\* 接口都受 RequireAdmin 中间件保护（校验 token + 校验 user.Role == "admin"），非管理员返回 403。前端菜单入口也只对管理员可见，路由 /migrate-from-mmw 的 beforeLoad 守卫会把非管理员重定向到首页。

## 回滚预案

任何一步出错都可以回到 mmw：

1.  SSH 到 mmw 机器：systemctl stop miaomiaowux && systemctl start miaomiaowu
2.  原 nginx 反代配置不需要改 — 它指的是同一个端口，谁起来谁接管
3.  SSL 证书 / 客户端订阅 URL 全部保持原样，客户端无感切回 mmw
4.  清理 mmwx 残留数据：rm /path/to/mmwx/data/mmwx.db（下次重启会重建空库）

因此迁移是个低风险动作：就算搞砸了，30 秒就能切回原状态。
