import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";

const docsRoot = path.resolve("dist/docs");
const htmlFiles = [];

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) await walk(absolute);
    else if (entry.name.endsWith(".html")) htmlFiles.push(absolute);
  }
}

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

function targetsFor(url) {
  const pathname = decodeURIComponent(url.split(/[?#]/, 1)[0]);
  if (pathname === "/docs" || pathname === "/docs/")
    return [path.join(docsRoot, "index.html")];

  const relative = pathname.replace(/^\/docs\/?/, "");
  const direct = path.join(docsRoot, relative);
  if (path.extname(relative)) return [direct];
  return [path.join(direct, "index.html"), `${direct}.html`];
}

await walk(docsRoot);

const broken = [];
for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  const urls = [...html.matchAll(/(?:href|src)=["']([^"']+)["']/g)].map(
    (match) => match[1],
  );
  for (const url of new Set(
    urls.filter((value) => value === "/docs" || value.startsWith("/docs/")),
  )) {
    const candidates = targetsFor(url);
    if (
      !(await Promise.any(
        candidates.map(async (candidate) =>
          (await exists(candidate)) ? candidate : Promise.reject(),
        ),
      ).catch(() => false))
    ) {
      broken.push(`${path.relative(process.cwd(), file)} -> ${url}`);
    }
  }
}

if (broken.length) {
  console.error(
    `Found ${broken.length} broken internal documentation links:\n${broken.join("\n")}`,
  );
  process.exitCode = 1;
} else {
  console.log(
    `Checked ${htmlFiles.length} documentation pages: all internal links resolve.`,
  );
}
