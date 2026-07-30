# Repository Guidelines

## Project Structure & Module Organization

This is the static documentation and landing site for 妙妙屋X. Application code lives in `src/`: TanStack Router pages are under `src/routes/`, reusable components under `src/components/`, translations under `src/i18n/locales/{zh,en}/`, and styles under `src/styles/`. Static images and fonts belong in `public/`; imported assets belong in `src/assets/`. Build helpers are in `scripts/`, while `site.json` controls branding and metadata.

Do not edit `src/routeTree.gen.ts`; the router plugin regenerates it during development and builds. Treat `src/components/ui/` as generated shadcn/ui code and avoid manual changes unless updating the component itself.

## Build, Test, and Development Commands

- `npm install` installs the locked dependency set.
- `npm run dev` generates the search index, then starts Vite locally.
- `npm run build` performs the production pipeline: search indexing, TypeScript checks, Vite build, metadata injection, and per-route HTML generation.
- `npm run build:only` runs type-checking and the core Vite build.
- `npm run lint` checks TypeScript and React code with ESLint.
- `npm run format:check` verifies Prettier formatting; `npm run format` applies it.
- `npm run knip` reports unused files, exports, and dependencies.
- `npm run preview` builds and serves through Wrangler.

## Coding Style & Naming Conventions

Use TypeScript and functional React components. Follow the existing Prettier output and let the import-sorting and Tailwind plugins organize imports/classes. Use kebab-case filenames such as `search-trigger.tsx`; component names use PascalCase and variables use camelCase. Prefer the `@/` alias for imports from `src/`, inline type imports (`import { type Foo }`), and underscore-prefixed names for intentionally unused parameters.

Documentation routes follow `src/routes/docs/<topic>.tsx`. When changing user-facing copy, update both English and Chinese locale files and keep translation keys aligned.

## Testing Guidelines

There is currently no automated test command or coverage threshold. Before submitting, run `npm run lint`, `npm run format:check`, and `npm run build`. Manually verify affected routes, language switching, dark mode, navigation, and search in `npm run dev`. Add focused tests alongside new test infrastructure rather than relying on root-level exploratory scripts.

## Commit & Pull Request Guidelines

History is minimal and uses short, descriptive commit subjects, often in Chinese. Keep commits focused and use imperative summaries. Pull requests should explain the motivation and affected routes, note validation commands, link relevant issues, and include screenshots for visual changes. Do not commit generated `dist/` output; include generated source artifacts only when the build expects them.
