import { RoutedOutboundDemo } from "../routed-outbound-demo";
import { DemoShell, type DocDemoProps } from "../demo-shell";

export function DocDemo(props: DocDemoProps) {
  return <DemoShell Demo={RoutedOutboundDemo} {...props} />;
}
