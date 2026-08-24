import { SpeedtestDemo } from "../speedtest-demo";
import { DemoShell, type DocDemoProps } from "../demo-shell";

export function DocDemo(props: DocDemoProps) {
  return <DemoShell Demo={SpeedtestDemo} {...props} />;
}
