import { useEffect } from "react";

declare global {
  interface Window {
    MmwxShapeGrid?: { mountAll: () => void };
  }
}

const SCRIPT_SRC = "/scripts/shape-grid.js";

// 加载 public/scripts/shape-grid.js(与文档站共用),挂载页面上所有 [data-shape-grid] 元素。
export function ShapeGrid() {
  useEffect(() => {
    if (window.MmwxShapeGrid) {
      window.MmwxShapeGrid.mountAll();
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${SCRIPT_SRC}"]`,
    );
    if (existing) {
      existing.addEventListener("load", () => window.MmwxShapeGrid?.mountAll(), {
        once: true,
      });
      return;
    }
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.defer = true;
    script.addEventListener("load", () => window.MmwxShapeGrid?.mountAll(), {
      once: true,
    });
    document.head.appendChild(script);
  }, []);
  return null;
}
