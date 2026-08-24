import { AddServerDemo } from "../add-server-demo";
import { DemoShell, type DocDemoProps } from "../demo-shell";

export function DocDemo(props: DocDemoProps) {
  return <DemoShell Demo={AddServerDemo} {...props} />;
}
