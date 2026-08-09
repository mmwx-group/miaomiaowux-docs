import { Link, useLocation } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Home,
  BookOpen,
  Download,
  Settings,
  Users,
  Zap,
  HelpCircle,
  Network,
  Server,
  Wrench,
  Sparkles,
  Shield,
  Package,
  LayoutTemplate,
  Database,
  FileCode,
  Globe,
  Radio,
  RefreshCw,
  Layers,
  Lock,
  Route,
  GraduationCap,
  Bot,
  Workflow,
  ArrowRightLeft,
  Crown,
  Gauge,
  Ban,
  Box,
  Share2,
  Hammer,
  ShieldCheck,
} from "lucide-react";

export type XNavItem = {
  id: string;
  label: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: XNavItem[];
  badge?: string;
};

type XNavItemDef = {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  badgeKey?: string;
  children?: XNavItemDef[];
};

const xNavStructure: XNavItemDef[] = [
  {
    id: "introduction",
    icon: Home,
    children: [
      { id: "about", href: "/docs/about", icon: BookOpen },
      { id: "comparison", href: "/docs/comparison", icon: ArrowRightLeft },
      { id: "features", href: "/docs/features", icon: Sparkles },
      { id: "quick-start", href: "/docs/quick-start", icon: Zap },
    ],
  },
  {
    id: "installation",
    icon: Download,
    children: [
      { id: "tutorial", href: "/docs/tutorial", icon: GraduationCap },
      { id: "install-direct", href: "/docs/install-direct", icon: Download },
      { id: "install-docker", href: "/docs/install-docker", icon: Download },
      {
        id: "install-agent",
        href: "/docs/install-agent",
        icon: Radio,
        badgeKey: "new",
      },
      {
        id: "upgrade-from-mmw",
        href: "/docs/upgrade-from-mmw",
        icon: ArrowRightLeft,
        badgeKey: "new",
      },
      {
        id: "system-requirements",
        href: "/docs/system-requirements",
        icon: Settings,
      },
      { id: "update", href: "/docs/update", icon: RefreshCw },
    ],
  },
  {
    id: "server-manage",
    icon: Server,
    badgeKey: "core",
    children: [
      { id: "remote-servers", href: "/docs/remote-servers", icon: Globe },
      {
        id: "website-management",
        href: "/docs/website-management",
        icon: Globe,
        badgeKey: "new",
      },
      { id: "xray-service", href: "/docs/xray-service", icon: Server },
      { id: "xray-inbounds", href: "/docs/xray-inbounds", icon: Network },
      { id: "xray-outbounds", href: "/docs/xray-outbounds", icon: Route },
      {
        id: "xray-routing",
        href: "/docs/xray-routing",
        icon: Route,
        badgeKey: "new",
      },
      {
        id: "xray-system-config",
        href: "/docs/xray-system-config",
        icon: Settings,
      },
    ],
  },
  {
    id: "protocol-ref",
    icon: Layers,
    children: [
      { id: "protocol-matrix", href: "/docs/protocol-matrix", icon: Layers },
      { id: "protocol-vless", href: "/docs/protocol-vless", icon: Lock },
      { id: "protocol-vmess", href: "/docs/protocol-vmess", icon: Lock },
      { id: "protocol-trojan", href: "/docs/protocol-trojan", icon: Lock },
      {
        id: "protocol-shadowsocks",
        href: "/docs/protocol-shadowsocks",
        icon: Lock,
      },
      {
        id: "protocol-hysteria2",
        href: "/docs/protocol-hysteria2",
        icon: Lock,
      },
      {
        id: "protocol-anytls",
        href: "/docs/protocol-anytls",
        icon: Lock,
        badgeKey: "new",
      },
      {
        id: "protocol-snell",
        href: "/docs/protocol-snell",
        icon: Lock,
        badgeKey: "new",
      },
    ],
  },
  {
    id: "nodes-subscription",
    icon: Network,
    children: [
      { id: "nodes", href: "/docs/nodes", icon: Network },
      { id: "generator", href: "/docs/generator", icon: Zap },
      { id: "subscribe-files", href: "/docs/subscribe-files", icon: Database },
      { id: "templates", href: "/docs/templates", icon: LayoutTemplate },
    ],
  },
  {
    id: "feature-guide",
    icon: Workflow,
    children: [
      {
        id: "routed-outbound",
        href: "/docs/routed-outbound",
        icon: ArrowRightLeft,
        badgeKey: "new",
      },
      {
        id: "system-settings-guide",
        href: "/docs/system-settings",
        icon: Settings,
      },
    ],
  },
  {
    id: "pro-features",
    icon: Crown,
    badgeKey: "pro",
    children: [
      {
        id: "node-speedtest",
        href: "/docs/node-speedtest",
        icon: Gauge,
        badgeKey: "pro",
      },
      {
        id: "node-ratelimit",
        href: "/docs/node-ratelimit",
        icon: Ban,
        badgeKey: "pro",
      },
      {
        id: "share-server",
        href: "/docs/share-server",
        icon: Share2,
        badgeKey: "pro",
      },
      {
        id: "embedded-xray",
        href: "/docs/embedded-xray",
        icon: Box,
        badgeKey: "pro",
      },
    ],
  },
  {
    id: "certificates",
    icon: Shield,
    children: [
      { id: "certificates", href: "/docs/certificates", icon: Shield },
    ],
  },
  {
    id: "users-packages",
    icon: Users,
    children: [
      { id: "users", href: "/docs/users", icon: Users },
      { id: "packages", href: "/docs/packages", icon: Package },
    ],
  },
  {
    id: "system",
    icon: Wrench,
    children: [
      { id: "custom-rules", href: "/docs/custom-rules", icon: FileCode },
      { id: "backup-restore", href: "/docs/backup-restore", icon: Database },
      {
        id: "probe-api",
        href: "/docs/probe-api",
        icon: Gauge,
        badgeKey: "new",
      },
    ],
  },
  {
    id: "ai",
    icon: Bot,
    children: [{ id: "mcp", href: "/docs/mcp", icon: Bot, badgeKey: "new" }],
  },
  {
    id: "tools",
    icon: Hammer,
    children: [
      {
        id: "tool-mmwx-tgbot",
        href: "/docs/tool-mmwx-tgbot",
        icon: Bot,
        badgeKey: "new",
      },
      {
        id: "tool-cloudflare-turnstile",
        href: "/docs/tool-cloudflare-turnstile",
        icon: ShieldCheck,
        badgeKey: "new",
      },
    ],
  },
  {
    id: "faq",
    icon: HelpCircle,
    children: [
      { id: "faq-carpool", href: "/docs/faq-carpool", icon: HelpCircle },
      {
        id: "faq-node-management",
        href: "/docs/faq-node-management",
        icon: HelpCircle,
      },
      {
        id: "faq-install-deploy",
        href: "/docs/faq-install-deploy",
        icon: HelpCircle,
      },
      { id: "faq-common-ops", href: "/docs/faq-common-ops", icon: HelpCircle },
      {
        id: "faq-server-management",
        href: "/docs/faq-server-management",
        icon: HelpCircle,
      },
      {
        id: "faq-protocol-inbound",
        href: "/docs/faq-protocol-inbound",
        icon: HelpCircle,
      },
      { id: "faq-sub-client", href: "/docs/faq-sub-client", icon: HelpCircle },
      { id: "changelog", href: "/docs/changelog", icon: RefreshCw },
    ],
  },
];

export { xNavStructure };

function translateNav(
  structure: XNavItemDef[],
  t: (key: string) => string,
): XNavItem[] {
  return structure.map((item) => ({
    id: item.id,
    label: t(`mmwx.${item.id}`),
    icon: item.icon,
    href: item.href,
    badge: item.badgeKey ? t(`badges.${item.badgeKey}`) : undefined,
    children: item.children ? translateNav(item.children, t) : undefined,
  }));
}

export function useXDocNavItems(): XNavItem[] {
  const { t } = useTranslation("sidebar");
  return useMemo(() => translateNav(xNavStructure, t), [t]);
}

interface XDocSidebarProps {
  className?: string;
}

export function XDocSidebar({ className }: XDocSidebarProps) {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const xNavItems = useXDocNavItems();

  useEffect(() => {
    const currentPath = location.pathname;
    xNavItems.forEach((item) => {
      if (item.children?.some((child) => child.href === currentPath)) {
        setExpandedItems((prev) =>
          prev.includes(item.id) ? prev : [...prev, item.id],
        );
      }
    });
  }, [location.pathname, xNavItems]);

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    return location.pathname === href;
  };

  return (
    <nav className={cn("space-y-1", className)}>
      {xNavItems.map((item) => (
        <div key={item.id}>
          <button
            onClick={() => toggleExpand(item.id)}
            className={cn(
              "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              expandedItems.includes(item.id) && "bg-accent/50",
            )}
          >
            <span className="flex items-center gap-2">
              <item.icon className="size-4" />
              {item.label}
              {item.badge &&
                (item.badge === "PRO" ? (
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 px-2 py-0.5 text-[10px] font-bold text-amber-900 shadow-sm">
                    <svg
                      className="size-2.5"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                    </svg>
                    Pro
                  </span>
                ) : (
                  <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs text-destructive">
                    {item.badge}
                  </span>
                ))}
            </span>
            {expandedItems.includes(item.id) ? (
              <ChevronDown className="size-4" />
            ) : (
              <ChevronRight className="size-4" />
            )}
          </button>

          {expandedItems.includes(item.id) && item.children && (
            <div className="ml-4 mt-1 space-y-1 border-l border-border/50 pl-2">
              {item.children.map((child) => (
                <Link
                  key={child.id}
                  to={child.href || "/docs"}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    isActive(child.href) &&
                      "bg-primary/10 text-primary font-medium",
                  )}
                >
                  <child.icon className="size-4" />
                  {child.label}
                  {child.badge &&
                    (child.badge === "PRO" ? (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 px-1.5 py-0.5 text-[10px] font-bold text-amber-900 shadow-sm">
                        <svg
                          className="size-2.5"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                        </svg>
                        Pro
                      </span>
                    ) : (
                      <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-xs text-primary">
                        {child.badge}
                      </span>
                    ))}
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
    </nav>
  );
}
