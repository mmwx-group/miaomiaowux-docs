import { useEffect } from "react";

declare global {
  interface Window {
    MmwxGridWave?: { mountAll: () => void };
  }
}

const SCRIPT_SRC = "/scripts/grid-wave.js";

// 加载 public/scripts/grid-wave.js(与文档站共用),挂载页面上所有 [data-grid-wave] 元素。
export function GridWave() {
  useEffect(() => {
    if (window.MmwxGridWave) {
      window.MmwxGridWave.mountAll();
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${SCRIPT_SRC}"]`,
    );
    if (existing) {
      existing.addEventListener("load", () => window.MmwxGridWave?.mountAll(), {
        once: true,
      });
      return;
    }
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.defer = true;
    script.addEventListener("load", () => window.MmwxGridWave?.mountAll(), {
      once: true,
    });
    document.head.appendChild(script);
  }, []);
  return null;
}
