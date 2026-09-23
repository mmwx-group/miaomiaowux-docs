import { ClientDownload as ClientDownloadCards } from "../client-download";

export function ClientDownload(props: { lang?: "zh" | "en" }) {
  return <ClientDownloadCards {...props} />;
}
