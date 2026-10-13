import { lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { Activity } from "lucide-react";

// 图表库不小,演示又在首屏之下 —— 拆成单独的块,不拖慢首屏
const OverviewDemo = lazy(() => import("./overview-demo"));

export function TrafficDemo() {
  const { t } = useTranslation("landing");
  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Activity className="size-4 animate-pulse" />
            {t("xHome.trafficDemo.live")}
          </div>
          <h2 className="pixel-text text-3xl sm:text-4xl font-bold text-primary mb-3">
            {t("xHome.trafficDemo.heading")}
          </h2>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            {t("xHome.trafficDemo.description")}
          </p>
        </div>
        <Suspense
          fallback={
            <div className="bg-muted/40 h-[640px] animate-pulse rounded-xl border" />
          }
        >
          <OverviewDemo />
        </Suspense>
      </div>
    </section>
  );
}
