---
title: "Plugin guidelines"
description: "Conventions for MiaomiaowuX plugins: naming and versioning, least privilege, security, performance, UI and localization, logging, compatibility, and a pre-release checklist"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

Plugins run on other people's masters, can see sensitive data such as users, packages and subscriptions, and their frontend runs with admin rights. These conventions exist so admins can install plugins with confidence and nothing goes wrong once they do. Field and API details are in the [plugin reference](/docs/plugin-reference).

## Naming and versioning

- **Never change a plugin id**: data, settings, dev tokens and installations are keyed by it, so a new id is a different plugin. Use a short English word that says what it does — `epay`, `unlock-check`, `monthly-income` — not `test` or `plugin1`.
- **Use semantic versioning**: bump the patch for fixes (1.2.**3**), the minor for features (1.**3**.0), and the major for breaking changes (removed settings, changed response shapes, new permissions). Pre-releases look like `1.3.0-beta.1`.
- **Bump the version for every release** and say what changed.
- Give both `name` (Chinese) and `name_en`; do the same for page `title` / `title_en`.

## Least privilege

- **Request only the permissions you actually use.** Admins see each one when enabling; every unrelated permission costs trust.
- Write **specific domains** for `http:fetch` — `api.example.com`, not `*.example.com`, when you can.
- Prefer read-only permissions to write permissions, and `routes:admin` to `routes:public`.
- New permissions disable installed copies until an admin confirms again — on purpose. Explain why you need them in the release notes.

## Security

**Public endpoints (`routes:public`)**

- Assume anyone can call them: **always verify signatures or origin** (e.g. check the payment provider's signature on callbacks); don't trust parameters alone.
- Make callbacks idempotent: the same order called back twice is processed once (record processed order ids in `mmwx.kv`).
- Never return user lists, subscription URLs or internal ids from public endpoints.

**Secrets**

- Put keys and tokens in **settings** with `"format": "password"`: the panel masks them and they stay out of logs.
- Don't hard-code secrets, and never put them in the frontend — anyone can download frontend code.
- Do third-party API calls in the backend; the frontend only talks to your own backend.

**Input and output**

- Trust no input: validate the type and range of `req.query`, `req.body` and event data.
- Render user data through normal React interpolation — **don't use `dangerouslySetInnerHTML`**.
- Subscription filters change everyone's subscription: touch only what you need, keep the result loadable by clients, and return `null` (no change) on errors instead of a half-built config.

**Data**

- Store only what you need, and nothing outside the plugin that should disappear when a user or the plugin is deleted.
- Uninstalling a plugin deletes all its data and settings; say so in your docs.

## Performance

- **Keep endpoints fast**: the timeout is 10 s, but users won't wait that long. Do slow work in scheduled jobs and have endpoints read the results.
- **Subscription filters have 300 ms** and run on every subscription fetch — don't call external URLs there.
- **Scheduled jobs must be idempotent and tolerate gaps**: a run is skipped if the previous one hasn't finished, and restarts miss runs. Don't assume "exactly once a minute".
- **`mmwx.kv` isn't a database**: ≤ 256 KB per value, ≤ 5 MB in total. Store summaries and state, not event streams; for lists, use prefixed keys (`order:2026-11-20:xxx`) and clean them up.
- `http.fetch` allows 120 calls per minute; batch or cache.
- 5 errors in a row auto-disable a plugin: catch expected failures (external timeouts, bad parameters) and return a clear error instead of letting exceptions bubble up.

## UI

- Use the SDK's `ui.*` components and the panel's Tailwind classes so your UI follows the panel theme, dark mode and corner radius.
- **Prefix all custom CSS** with your plugin (e.g. `.plugin-epay-xxx`); no global selectors like `body` or `button`, and don't restyle the panel's own classes.
- Make it usable at phone width (375 px): tables scroll horizontally, buttons stay on screen.
- Keep dashboard cards light: prefer `size: 'third'`, show a skeleton (`ui.Skeleton`) while loading, and a human sentence instead of a blank on failure.
- Keep row and toolbar button `label`s short (one or two words) and add an `icon`.
- Ask with `confirm()` before destructive actions (delete, change password, charge) and spell out the consequences.

## Localization

- Put every UI string in both `locales/zh-CN.json` and `locales/en.json`, with the same keys.
- Read strings with `useT()` / `ctx.t()` and interpolate counts and names with `{{var}}` — don't concatenate.
- Fill in `name_en`, page `title_en` and setting `title_en` in `plugin.json`.

## Logging

- Logs are for admins troubleshooting: say what you were doing and what happened, e.g. `order 123 callback: signature mismatch`.
- **Never log keys, tokens, passwords or full subscription URLs.**
- Don't log at info level on hot paths (every request, every filter run); each plugin keeps only the last 1000 entries, so spam pushes out what matters.
- Use `mmwx.log.warn / error` for levels.

## Compatibility

- If you rely on something only newer masters have, set `minMaster` in `plugin.json` so older masters refuse to install instead of installing something broken.
- Host API results have the same shapes as the open API (e.g. `mmwx.packages.list()` returns `{ packages: [...] }`); handle missing fields.
- Slot rows only carry their fixed fields; don't depend on anything else from the panel's internals.
- The backend is a single file without a module system: inline third-party libraries when bundling, and make sure they don't need Node- or browser-only APIs.

## Pre-release checklist

- [ ] `version` bumped and changes described
- [ ] Minimal permissions; new ones explained
- [ ] Public endpoints verify signatures and are idempotent
- [ ] Secrets only in `format: password` settings, none in code or the frontend
- [ ] Chinese and English strings complete; `name_en` and `title_en` filled in
- [ ] Checked at phone width and in dark mode
- [ ] Run end to end without `--inspect` (on the master)
- [ ] No sensitive data in logs
- [ ] Uninstalled and reinstalled, still works
- [ ] Package built with `mmwx-plugin pack` installed on a clean test master
