import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const routesDir = path.join(root, "src/routes/docs");
const contentDir = path.join(root, "src/content/docs");
const port = 4178;
const origin = `http://127.0.0.1:${port}`;

const turndown = new TurndownService({
  headingStyle: "atx",
  bulletListMarker: "-",
  codeBlockStyle: "fenced",
  emDelimiter: "*",
  strongDelimiter: "**",
});
turndown.use(gfm);
turndown.addRule("fenced-code-blocks", {
  filter: "pre",
  replacement: (_content, node) => {
    const code = node.textContent?.replace(/\n+$/, "") || "";
    const language =
      node.querySelector("code")?.className.match(/language-([\w-]+)/)?.[1] ||
      "";
    const fence = code.includes("```") ? "````" : "```";
    return `\n\n${fence}${language}\n${code}\n${fence}\n\n`;
  },
});
turndown.addRule("remove-interface-controls", {
  filter: ["button", "input", "textarea"],
  replacement: (content) => (content.trim() ? `**${content.trim()}**` : ""),
});
turndown.addRule("select-options", {
  filter: "select",
  replacement: (_content, node) =>
    [...node.querySelectorAll("option")]
      .map((option) => option.textContent?.trim())
      .filter(Boolean)
      .join(" / "),
});

function yamlString(value) {
  return JSON.stringify(
    String(value || "")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

function normalizeMarkdown(markdown) {
  return markdown
    .replace(/^(\d+)\.\s+(?:\d+\\?\.\s+)+/gm, "$1. ")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+$/gm, "")
    .replace(/^\*\*\s*\*\*$/gm, "")
    .trim();
}

function localizeLinks(markdown, language) {
  if (language !== "en") return markdown;
  return markdown
    .replace(/\]\(\/docs\)/g, "](/docs/en)")
    .replace(/\]\(\/docs\/(?!en(?:\/|\)))/g, "](/docs/en/");
}

async function waitForServer() {
  const deadline = Date.now() + 45_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(origin);
      if (response.ok) return;
    } catch {
      // Vite is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  throw new Error("Timed out waiting for the legacy docs dev server");
}

async function renderPage(page, slug, language) {
  await page.addInitScript((lang) => {
    localStorage.setItem("mmw-lang", lang);
  }, language);
  const route = slug === "index" ? "/docs" : `/docs/${slug}`;
  await page.goto(origin + route, { waitUntil: "networkidle" });
  await page.waitForSelector("main .prose");

  const data = await page.evaluate(() => {
    const main = document.querySelector("main");
    const content = main?.querySelector(".prose")?.cloneNode(true);
    if (!(content instanceof HTMLElement))
      throw new Error("Document body not found");
    content
      .querySelectorAll("svg, script, style")
      .forEach((node) => node.remove());
    content
      .querySelectorAll('[aria-hidden="true"]')
      .forEach((node) => node.remove());
    content.querySelectorAll("h2, h3, h4, h5, h6").forEach((heading) => {
      const parts = Array.from(heading.childNodes)
        .map((node) => node.textContent?.replace(/\s+/g, " ").trim() || "")
        .filter(Boolean);
      heading.textContent = parts.join(" ");
    });
    content.querySelectorAll("img").forEach((image) => {
      if (!image.getAttribute("alt")) image.setAttribute("alt", "文档截图");
    });
    const heading =
      main?.querySelector("h1")?.textContent?.trim() || document.title;
    const description =
      main
        ?.querySelector("h1")
        ?.parentElement?.querySelector("p")
        ?.textContent?.trim() || "";
    return {
      title: heading.replace(/^妙妙屋X\s*-\s*/, ""),
      description,
      html: content.innerHTML,
    };
  });

  let markdown = normalizeMarkdown(turndown.turndown(data.html));
  markdown = localizeLinks(markdown, language);
  const frontmatter = [
    "---",
    `title: ${yamlString(data.title)}`,
    `description: ${yamlString(data.description)}`,
    "tableOfContents:",
    "  minHeadingLevel: 2",
    "  maxHeadingLevel: 3",
    "---",
    "",
  ].join("\n");
  return frontmatter + markdown + "\n";
}

async function main() {
  const files = (await fs.readdir(routesDir))
    .filter((file) => file.endsWith(".tsx"))
    .sort();
  await fs.mkdir(path.join(contentDir, "en"), { recursive: true });

  const server = spawn(
    process.platform === "win32" ? "npm.cmd" : "npm",
    ["run", "dev:landing", "--", "--host", "127.0.0.1", "--port", String(port)],
    {
      cwd: root,
      stdio: ["ignore", "pipe", "pipe"],
      detached: process.platform !== "win32",
    },
  );
  server.stdout.on("data", (chunk) => process.stdout.write(chunk));
  server.stderr.on("data", (chunk) => process.stderr.write(chunk));

  try {
    await waitForServer();
    const browser = await chromium.launch({ headless: true });
    try {
      for (const file of files) {
        const slug = path.basename(file, ".tsx");
        for (const language of ["zh", "en"]) {
          const context = await browser.newContext({
            viewport: { width: 1440, height: 1200 },
          });
          const page = await context.newPage();
          const markdown = await renderPage(page, slug, language);
          const targetDir =
            language === "en" ? path.join(contentDir, "en") : contentDir;
          await fs.writeFile(path.join(targetDir, `${slug}.md`), markdown);
          await context.close();
        }
        process.stdout.write(`Migrated ${slug}\n`);
      }
    } finally {
      await browser.close();
    }
  } finally {
    if (process.platform === "win32") server.kill("SIGTERM");
    else if (server.pid) process.kill(-server.pid, "SIGTERM");
  }
}

await main();
