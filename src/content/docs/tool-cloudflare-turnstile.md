---
title: "Cloudflare Turnstile 人机验证"
description: "给妙妙屋X 登录页接入 Cloudflare Turnstile,免费、无干扰的人机验证,防爆破登录。未配置时自动降级跳过,升级用户不强制。"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

## 这是什么

Cloudflare Turnstile 是 CF 推出的人机验证服务,免费、不需要点图、绝大多数用户无感知。它接在登录页前面,后端校验 token 通过后才放行账号密码验证,显著降低暴力破解登录的风险。

妙妙屋X 主控登录页支持 Turnstile,但不强制 — 系统设置里两个 key 都填才启用,任一空自动跳过。升级用户不需要担心被强制配置。

## 前置准备

一个 Cloudflare 账号(免费版即可,不需要给主控域名接入 CF DNS,只用 Turnstile 服务就行)。

## 第一步:在 CF Dashboard 申请 Site

登录 Cloudflare Dashboard,左侧菜单找「Turnstile」,点「Add Site」开始配置。下方表格列出各项推荐填法:

### 1\. 登录 dash.cloudflare.com

用你的 CF 账号登录控制台,如果还没有就注册一个(完全免费)。

### 2\. 进入 Turnstile 页面

在左侧菜单找「Turnstile」(或顶部搜索栏搜 Turnstile),点进去后点「Add Site」。

### 3\. 填写 Site 配置

按下表填,大部分用默认即可:

| 字段          | 推荐值                                                             |
| ------------- | ------------------------------------------------------------------ |
| Site Name     | 随便起一个,如 mmwx,只是给自己看的标识                              |
| Domain        | 填妙妙屋X 主控公网域名(如 mmwx.example.com),可加多行如果有多个域名 |
| Widget Mode   | 选「Managed」(推荐自动判定 — 多数用户无感知,可疑请求才出图形验证)  |
| Pre-clearance | 保持 No(不需要)                                                    |

### 4\. 复制两个 Key

创建后页面会显示「Site Key」(可公开,前端 widget 用)和「Secret Key」(保密,后端 siteverify 用)。两个都复制下来 — Secret Key 只显示一次,务必保存好。

## 第二步:在妙妙屋X 系统设置填入

拿到 Site Key 和 Secret Key 之后,贴回妙妙屋X 管理后台。

### 1\. 进入系统设置

用管理员账号登录妙妙屋X 主控,左侧菜单进「系统设置」。

### 2\. 找到 Cloudflare 人机验证区

滚到「Cloudflare 人机验证」区块(在「自定义安全阈值」下方)。

![Turnstile 卡片未填 Key 截图](/images/screenshots/system-settings-turnstile-empty.webp)

系统设置「Cloudflare 人机验证」区域,两个 key 未填的初始状态

### 3\. 粘贴 Key + 保存

把 Site Key 贴到 Site Key 输入框,把 Secret Key 贴到 Secret Key 输入框,焦点离开输入框自动保存(无须点按钮),即时生效不需要重启主控。

![Turnstile 卡片已配置截图](/images/screenshots/system-settings-turnstile-filled.webp)

填入 Site Key 后明文显示;Secret Key 保存后回显屏蔽 mask

## 第三步:验证生效

![登录页 Turnstile widget 截图](/images/screenshots/login-page-with-widget.webp)

妙妙屋X 登录页,表单底部出现 Cloudflare Turnstile widget(此处用 CF 测试 key 演示,自动判定通过显示「成功」)

- 无痕模式打开主控登录页(确保拿到最新的 captcha config),应该看到表单底部出现 Turnstile 小框,自动判定通常 1-2 秒
- 用正确账号密码登录,通过后正常进入首页,说明前后端打通了
- 故意填错密码,后端应该返 401 invalid credentials,前端 toast 报错;Turnstile widget 会自动 reset 等下次提交

## 常见问题

### 登录页没看到 widget?

1. 检查系统设置 Site Key 是否真的保存了;2) 浏览器 devtools Network 看 /api/captcha/config 响应是不是 enabled:true、site_key 非空;3) 域名跟 CF 注册的不一致会导致 widget 拒绝加载,看浏览器控制台报错。

### 登录被 captcha verification failed 拦截?

Secret Key 填错或 Site Key 跟 Secret Key 不是配对的。回 CF Dashboard 同一 Site 下重新核对两个 key,保证从一个 Site 同时取出。

### Secret Key 怎么替换?

系统设置里 Secret Key 输入框因为安全原因显示 placeholder「已配置」,字段值为空。直接输入新的 Secret Key 覆盖,焦点离开自动保存即可。

### 怎么关闭验证?

把 Site Key 和 Secret Key 任一(或两个)清空保存,后端 Turnstile.Enabled() 立即返 false,login 不再验证,前端登录页也不再渲染 widget。

## 延伸阅读

- [Cloudflare Turnstile 官方文档](https://developers.cloudflare.com/turnstile/)
- [Cloudflare Dashboard · Turnstile](https://dash.cloudflare.com/?to=/:account/turnstile)
