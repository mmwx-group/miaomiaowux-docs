import { useState, type ComponentType } from "react";
import { createInstance } from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { Toaster } from "sonner";

import enXdocs from "@/i18n/locales/en/xdocs.json";
import zhXdocs from "@/i18n/locales/zh/xdocs.json";

export interface DocDemoProps {
  lang?: "zh" | "en";
}

export function DemoShell({
  Demo,
  lang = "zh",
}: DocDemoProps & { Demo: ComponentType }) {
  const [i18n] = useState(() => {
    const instance = createInstance();
    void instance.use(initReactI18next).init({
      lng: lang,
      fallbackLng: "en",
      supportedLngs: ["zh", "en"],
      defaultNS: "xdocs",
      ns: ["xdocs"],
      resources: {
        zh: { xdocs: zhXdocs },
        en: { xdocs: enXdocs },
      },
      interpolation: { escapeValue: false },
      initAsync: false,
    });
    return instance;
  });

  return (
    <I18nextProvider i18n={i18n}>
      <div className="not-content mmwx-doc-demo">
        <Demo />
        <Toaster
          theme="system"
          position="bottom-right"
          richColors
          closeButton
          toastOptions={{
            style: {
              background: "var(--popover)",
              color: "var(--popover-foreground)",
              borderColor: "var(--border)",
            },
          }}
        />
      </div>
    </I18nextProvider>
  );
}
