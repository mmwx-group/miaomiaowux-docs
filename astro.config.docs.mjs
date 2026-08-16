import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import starlight from "@astrojs/starlight";

export default defineConfig({
  site: "https://miaomiaowux.com",
  base: "/docs",
  outDir: "./dist/docs",
  publicDir: "./public",
  trailingSlash: "never",
  integrations: [
    react(),
    starlight({
      title: {
        "zh-CN": "妙妙屋X 文档",
        en: "MiaoMiaoWu X Docs",
      },
      description: "妙妙屋X 安装、配置与使用文档",
      favicon: "/images/favicon.ico",
      logo: {
        src: "./public/images/logo.svg",
        alt: "妙妙屋X",
      },
      locales: {
        root: { label: "简体中文", lang: "zh-CN" },
        en: { label: "English", lang: "en" },
      },
      defaultLocale: "root",
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/iluobei/miaomiaowuX",
        },
      ],
      pagefind: true,
      lastUpdated: true,
      pagination: true,
      customCss: ["./src/styles/starlight.css"],
      sidebar: [
        {
          label: "返回产品首页",
          translations: { en: "Product home" },
          link: "/",
        },
        {
          label: "简介",
          translations: { en: "Introduction" },
          items: ["about", "comparison", "features", "quick-start"],
        },
        {
          label: "安装部署",
          translations: { en: "Installation" },
          items: [
            "tutorial",
            "install-direct",
            "install-docker",
            "cloudflare-tunnel",
            "install-agent",
            "install-external-probe",
            "upgrade-from-mmw",
            "system-requirements",
            "update",
          ],
        },
        {
          label: "服务管理",
          translations: { en: "Server management" },
          items: [
            "remote-servers",
            "website-management",
            "xray-service",
            "xray-inbounds",
            "xray-outbounds",
            "xray-routing",
            "xray-system-config",
          ],
        },
        {
          label: "协议参考",
          translations: { en: "Protocol reference" },
          items: [
            "protocol-matrix",
            "protocol-vless",
            "protocol-vmess",
            "protocol-trojan",
            "protocol-shadowsocks",
            "protocol-hysteria2",
            "protocol-anytls",
            "protocol-snell",
          ],
        },
        {
          label: "节点与订阅",
          translations: { en: "Nodes & subscriptions" },
          items: ["nodes", "generator", "subscribe-files", "templates"],
        },
        {
          label: "功能说明",
          translations: { en: "Feature guides" },
          items: ["routed-outbound", "system-settings"],
        },
        {
          label: "PRO 功能",
          translations: { en: "PRO features" },
          items: [
            "node-speedtest",
            "node-ratelimit",
            "share-server",
            "embedded-xray",
          ],
        },
        {
          label: "证书管理",
          translations: { en: "Certificates" },
          items: ["certificates"],
        },
        {
          label: "用户与套餐",
          translations: { en: "Users & packages" },
          items: ["users", "packages"],
        },
        {
          label: "系统配置",
          translations: { en: "System configuration" },
          items: ["custom-rules", "backup-restore", "probe-api"],
        },
        {
          label: "AI 与工具",
          translations: { en: "AI & tools" },
          items: ["mcp", "tool-mmwx-tgbot", "tool-cloudflare-turnstile"],
        },
        {
          label: "常见问题",
          translations: { en: "FAQ" },
          items: [
            "faq",
            "faq-carpool",
            "faq-node-management",
            "faq-install-deploy",
            "faq-common-ops",
            "faq-server-management",
            "faq-protocol-inbound",
            "faq-sub-client",
            "changelog",
          ],
        },
      ],
      head: [
        {
          tag: "meta",
          attrs: { name: "theme-color", content: "#ffffff" },
        },
      ],
    }),
  ],
  vite: {
    resolve: {
      alias: {
        "@": new URL("./src", import.meta.url).pathname,
      },
    },
  },
});
