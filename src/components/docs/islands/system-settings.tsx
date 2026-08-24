import { SystemSettingsDemo } from "../system-settings-demo";
import { DemoShell, type DocDemoProps } from "../demo-shell";

export function DocDemo(props: DocDemoProps) {
  return <DemoShell Demo={SystemSettingsDemo} {...props} />;
}
