---
title: "安装与部署"
description: "安装、Agent 部署、与升级常见问答。"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

### 妙妙屋X 和妙妙屋有什么区别？

妙妙屋X 是妙妙屋的扩展版本，增加了远程服务器管理、Xray 入站/出站管理、协议连通性测试等功能。妙妙屋专注于订阅管理和流量监控，妙妙屋X 则提供完整的服务器管理能力。

### 需要什么系统环境？

主控端：Linux x86_64，1 核 512MB 内存即可。Agent 端：Linux x86_64，需要安装 Xray-core。支持 Docker 和二进制两种部署方式。

### 可以在同一台机器上运行主控和 Agent 吗？

可以，但需要使用不同端口。主控默认使用 12889 端口，Agent 需要配置不同的端口。
