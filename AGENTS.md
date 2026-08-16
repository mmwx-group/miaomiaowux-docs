# Repository Guidelines

## Project Structure & Module Organization

This repository contains the 妙妙屋X landing page and documentation. Astro Starlight serves the documentation at `/docs`; Markdown sources live in `src/content/docs/`, with English translations in `src/content/docs/en/`. Configure its navigation and theme in `astro.config.docs.mjs` and `src/styles/starlight.css`. The React/TanStack landing page remains in `src/routes/`, with reusable components in `src/components/`. Static images and fonts belong in `public/`; build helpers are in `scripts/`.

Do not edit `src/routeTree.gen.ts`; the router plugin regenerates it during development and builds. Treat `src/components/ui/` as generated shadcn/ui code and avoid manual changes unless updating the component itself.

## Build, Test, and Development Commands

- `npm install` installs the locked dependency set.
- `npm run dev` starts the Starlight documentation site locally.
- `npm run dev:landing` starts the legacy Vite landing page.
- `npm run build` builds the landing page and the `/docs` static site, then validates documentation links.
- `npm run build:docs` builds only Starlight and its Pagefind full-text index.
- `npm run check:docs` checks links in an existing `dist/docs/` build.
- `npm run lint` checks TypeScript and React code with ESLint.
- `npm run format:check` verifies Prettier formatting; `npm run format` applies it.
- `npm run knip` reports unused files, exports, and dependencies.
- `npm run preview` builds and serves through Wrangler.

## Coding Style & Naming Conventions

Write documentation in Markdown or MDX, using kebab-case files such as `install-agent.md`, descriptive headings, fenced code blocks, and root-relative image paths such as `/images/install/example.webp`. Use TypeScript and functional React components for the landing page. Follow Prettier output; component names use PascalCase and variables use camelCase.

Treat `src/content/docs/` as the authoritative documentation source. When content is localized, update both the Chinese file and its matching `en/` file. Keep sidebar entries in `astro.config.docs.mjs` aligned with added, renamed, or removed pages.

## Testing Guidelines

There is no unit-test suite or coverage threshold. Before submitting, run `npm run lint`, `npm run format:check`, and `npm run build`. The build generates Pagefind indexes and checks internal documentation links. Manually verify affected pages, language switching, dark mode, navigation, and search with `npm run dev`.

## Commit & Pull Request Guidelines

History is minimal and uses short, descriptive commit subjects, often in Chinese. Keep commits focused and use imperative summaries. Pull requests should explain the motivation and affected routes, note validation commands, link relevant issues, and include screenshots for visual changes. Do not commit generated `dist/` output; include generated source artifacts only when the build expects them.
