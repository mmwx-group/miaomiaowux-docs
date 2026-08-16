---
title: "外置探针部署"
description: "使用 Cloudflare Workers 部署独立的妙妙屋X服务器探针。"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

## 部署方式

外置探针将静态页面、只读 API 代理和 WebSocket 代理部署到同一个 Cloudflare Worker。访客只访问探针域名，主控访问密钥由 Worker Secret 保管，不会暴露在浏览器中。

## 部署前准备

1.  主控必须具有可由 Cloudflare 访问的公网 HTTPS 地址。
2.  在主控的“系统设置 → 探针”中启用外置探针，并选择需要展示的服务器与指标。
3.  开启“保护探针数据接口”，生成并立即保存独立探针访问密钥。密钥明文只显示一次。
4.  准备一个 Cloudflare 账户，并授权其访问你的 GitHub 账户。

## 1\. 打开一键部署页面

打开 MMWX Probe 仓库，点击 Deploy to Cloudflare。Cloudflare 会引导你连接 GitHub，并创建一个用于持续部署的专用仓库。

[Deploy to Cloudflare](https://deploy.workers.cloudflare.com/?url=https://github.com/mmwx-group/mmwx-probe)

![在 MMWX Probe 项目说明顶部点击 Deploy to Cloudflare。](/images/screenshots/external-probe-deploy-button.svg)

在 MMWX Probe 项目说明顶部点击 Deploy to Cloudflare。

## 2\. 配置 Cloudflare 项目

选择 Git 账户并保持“创建专用 Git 存储库”开启。项目名称可使用 mmwx-probe-xxxx；确认构建命令为 npm run build、部署命令为 npm run deploy，并保持生产分支自动构建。

| 必须填写的变量 | 说明                                                                                             |
| -------------- | ------------------------------------------------------------------------------------------------ |
| MMWX_ORIGIN    | 妙妙屋X主控的公网 HTTPS 地址，例如 https://panel.example.com。不要填写路径，也不要保留末尾斜杠。 |
| PROBE_TOKEN    | 主控“系统设置 → 探针”生成的独立探针访问密钥。请作为 Secret 保存，禁止写入源码或公开仓库。        |

![填写项目名称、MMWX_ORIGIN 与 PROBE_TOKEN 后点击“部署”。](/images/screenshots/external-probe-cloudflare-settings.svg)

填写项目名称、MMWX_ORIGIN 与 PROBE_TOKEN 后点击“部署”。

## 3\. 验证并绑定域名

1.  等待首次构建完成，打开 Cloudflare 提供的 workers.dev 地址。
2.  确认服务器列表、趋势图和实时更新均能正常加载。
3.  如需自定义域名，在 Worker 的 Settings → Domains & Routes 中添加域名。
4.  更新主控地址或轮换密钥后，请同步修改 Worker Variables and Secrets 并重新部署。

## 4\. 启用 fork 自动更新

部署仓库是 MMWX Probe 的 fork。首次启用自动更新前，先确认 fork 已包含最新的 Sync upstream 工作流；之后它会每天北京时间 11:23 合并上游更新，推送成功后 Cloudflare 会自动重新构建。

1.  打开自己 GitHub 账户下的 mmwx-probe 仓库。如果页面提示分支落后，点击 Sync fork → Update branch。不要点击 Discard commits，否则会丢弃 fork 中已有的自定义提交。
2.  进入 Actions 页面。如果 GitHub 提示 fork 工作流尚未启用，点击 I understand my workflows, go ahead and enable them。
3.  在左侧选择 Sync upstream，然后点击 Run workflow，可立即执行一次同步。页面出现绿色成功标记即表示更新已推送。
4.  进入 Settings → Actions → General，在 Workflow permissions 中选择 Read and write permissions 并保存，确保工作流可以把更新推回 main 分支。

![fork 落后时点击 Sync fork → Update branch；不要选择 Discard commits。](/images/screenshots/external-probe-sync-fork.svg)

fork 落后时点击 Sync fork → Update branch；不要选择 Discard commits。

![Actions 页面左侧会显示 Sync upstream；运行成功后会出现绿色状态标记。](/images/screenshots/external-probe-actions.png)

Actions 页面左侧会显示 Sync upstream；运行成功后会出现绿色状态标记。

GitHub 默认关闭公共 fork 的定时工作流，并可能在仓库连续 60 天无活动后再次停用。如果探针长期没有自动更新，请回到 Actions 页面重新启用，或手动运行 Sync upstream。发生合并冲突时工作流会停止，不会强制覆盖用户修改。

## 常见问题

返回 404 通常表示外置探针未启用、未选择服务器或 PROBE_TOKEN 不一致；出现 MMWX_ORIGIN must use HTTPS 时，请检查主控地址是否为公网 HTTPS 地址。
