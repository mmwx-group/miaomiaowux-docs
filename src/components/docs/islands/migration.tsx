import { MigrationDemo } from "../migration-demo";
import { DemoShell, type DocDemoProps } from "../demo-shell";

export function DocDemo(props: DocDemoProps) {
  return <DemoShell Demo={MigrationDemo} {...props} />;
}
