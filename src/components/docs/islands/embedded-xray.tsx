import { EmbeddedXrayDemo } from "../embedded-xray-demo";
import { DemoShell, type DocDemoProps } from "../demo-shell";

export function DocDemo(props: DocDemoProps) {
  return <DemoShell Demo={EmbeddedXrayDemo} {...props} />;
}
