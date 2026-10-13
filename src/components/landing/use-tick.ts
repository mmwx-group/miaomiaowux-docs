import { useEffect, useState } from "react";

/** 每隔 intervalMs 加一的计数器,首页的演示用它让数字跳动。 */
export function useTick(intervalMs: number) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTick((n) => n + 1), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return tick;
}
