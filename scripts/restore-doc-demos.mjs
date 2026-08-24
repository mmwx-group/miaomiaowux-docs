import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const docsDir = path.join(root, "src/content/docs");

const demos = {
  "install-agent": {
    kind: "add-server",
    inlineMarker: /^\*\*(?:打开演示|Open demo)\*\*$/m,
  },
  certificates: { kind: "certificates" },
  "embedded-xray": { kind: "embedded-xray" },
  "upgrade-from-mmw": { kind: "migration" },
  packages: { kind: "packages" },
  "node-ratelimit": { kind: "ratelimit" },
  "routed-outbound": { kind: "routed-outbound" },
  "share-server": { kind: "share-server" },
  "node-speedtest": { kind: "speedtest" },
  "system-settings": { kind: "system-settings" },
  users: { kind: "users" },
};

function addImport(source) {
  if (/from ["']@\/components\/docs\/islands\//.test(source)) return source;
  const closingFrontmatter = source.indexOf("\n---", 4);
  if (closingFrontmatter < 0)
    throw new Error("Frontmatter closing delimiter not found");
  const insertAt = closingFrontmatter + 4;
  return `${source.slice(0, insertAt)}\n\nimport { DocDemo } from '@/components/docs/islands/__DEMO_KIND__'${source.slice(insertAt)}`;
}

function replaceRenderedDemo(source, inlineMarker) {
  const island = '<DocDemo lang="__LANG__" client:load />';
  if (source.includes("<DocDemo ")) return source;
  if (inlineMarker) {
    if (!inlineMarker.test(source))
      throw new Error("Inline demo marker not found");
    return source.replace(inlineMarker, island);
  }

  const demoHeading = source.search(
    /^## (?:在线演示|完整迁移向导|Try it|Full migration wizard)/m,
  );
  if (demoHeading < 0) throw new Error("Demo heading not found");
  const headingEnd = source.indexOf("\n", demoHeading);
  const descriptionStart = source.indexOf("\n", headingEnd + 1) + 1;
  const descriptionEnd = source.indexOf("\n\n", descriptionStart);
  const nextHeading = source.indexOf("\n## ", descriptionEnd);
  if (descriptionStart <= 0 || descriptionEnd < 0 || nextHeading < 0) {
    throw new Error("Demo section boundaries not found");
  }
  return `${source.slice(0, descriptionEnd)}\n\n${island}\n${source.slice(nextHeading)}`;
}

function escapeMdxPlaceholders(source) {
  let fenced = false;
  return source
    .split("\n")
    .map((line) => {
      if (/^\s*(```|~~~)/.test(line)) {
        fenced = !fenced;
        return line;
      }
      if (fenced || /^( {4}|\t)/.test(line)) return line;
      return line.replace(/(?<!`)<([^>\n]+)>(?!`)/g, (match, inner) => {
        if (inner === "code") return `\`${match}\``;
        if (
          /^\/?(?:DocDemo|table|thead|tbody|tfoot|tr|th|td|code|kbd|details|summary|br|img|a)\b/.test(
            inner,
          )
        ) {
          return match;
        }
        return `\`${match}\``;
      });
    })
    .join("\n");
}

for (const [slug, demo] of Object.entries(demos)) {
  for (const lang of ["zh", "en"]) {
    const dir = lang === "en" ? path.join(docsDir, "en") : docsDir;
    const markdownPath = path.join(dir, `${slug}.md`);
    const mdxPath = path.join(dir, `${slug}.mdx`);
    let source;
    try {
      source = await fs.readFile(markdownPath, "utf8");
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
      source = await fs.readFile(mdxPath, "utf8");
    }
    source = replaceRenderedDemo(source, demo.inlineMarker).replaceAll(
      "__LANG__",
      lang,
    );
    source = escapeMdxPlaceholders(addImport(source)).replaceAll(
      "__DEMO_KIND__",
      demo.kind,
    );
    await fs.writeFile(mdxPath, source);
    if (markdownPath !== mdxPath) await fs.rm(markdownPath, { force: true });
    process.stdout.write(`Restored ${lang}/${slug}.mdx\n`);
  }
}
