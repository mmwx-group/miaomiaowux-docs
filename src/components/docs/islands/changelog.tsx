import { Changelog as ChangelogList } from "../changelog";

export function Changelog(props: { lang?: "zh" | "en" }) {
  return <ChangelogList {...props} />;
}
