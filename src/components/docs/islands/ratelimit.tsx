import { RatelimitDemo } from "../ratelimit-demo";
import { DemoShell, type DocDemoProps } from "../demo-shell";

export function DocDemo(props: DocDemoProps) {
  return <DemoShell Demo={RatelimitDemo} {...props} />;
}
