import { PackagesDemo } from "../packages-demo";
import { DemoShell, type DocDemoProps } from "../demo-shell";

export function DocDemo(props: DocDemoProps) {
  return <DemoShell Demo={PackagesDemo} {...props} />;
}
