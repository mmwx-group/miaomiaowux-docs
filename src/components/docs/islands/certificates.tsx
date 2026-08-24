import { CertificatesDemo } from "../certificates-demo";
import { DemoShell, type DocDemoProps } from "../demo-shell";

export function DocDemo(props: DocDemoProps) {
  return <DemoShell Demo={CertificatesDemo} {...props} />;
}
