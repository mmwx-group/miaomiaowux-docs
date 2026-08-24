import { ShareServerDemo } from "../share-server-demo";
import { DemoShell, type DocDemoProps } from "../demo-shell";

export function DocDemo(props: DocDemoProps) {
  return <DemoShell Demo={ShareServerDemo} {...props} />;
}
