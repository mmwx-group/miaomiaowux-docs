import { UsersDemo } from "../users-demo";
import { DemoShell, type DocDemoProps } from "../demo-shell";

export function DocDemo(props: DocDemoProps) {
  return <DemoShell Demo={UsersDemo} {...props} />;
}
