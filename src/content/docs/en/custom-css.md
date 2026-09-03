---
title: "Custom CSS"
description: "Inject your own styles into every panel page: colors, fonts, hiding elements (PRO)"
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
---

## Overview

Custom CSS lets you inject a stylesheet into **every page** of MiaomiaowuX — to recolor it, change the font, adjust corner radius, or hide elements you don't use. No code changes, no frontend rebuild: save and it applies.

Custom CSS is a PRO feature and shares the `custom_branding` entitlement with Custom Branding — both are the same job, making the panel look like yours. Without that entitlement the content **still saves normally**, it just isn't delivered or applied; once the license covers it, your CSS starts applying automatically with no need to save again.

## Where to configure it

**System Settings → Appearance → Custom CSS**

Type it in and hit save. The current page updates immediately; other pages pick it up on reload.

## Scope

The stylesheet ships with the page HTML, so it covers:

- Every admin panel page
- **The login page** (it applies before anyone signs in)
- User-facing pages

The injection point is a `<style id="mmwx-custom-css">` element at the start of `<body>`. It comes **after** the application's own stylesheet, so at equal specificity your rules win — you usually **don't need `!important`**. You only need extra weight when competing with high-specificity Tailwind utilities.

## What you can hook into

### CSS variables (recommended)

The panel's colors all go through CSS variables. Overriding a variable is far more robust than targeting individual selectors, and survives version upgrades much better. They're defined on `:root` (light) and `.dark` (dark):

| Variable | Purpose |
| --- | --- |
| `--primary` / `--primary-foreground` | Accent color and text on it |
| `--background` / `--foreground` | Page background and body text |
| `--card` / `--card-foreground` | Card background and text |
| `--sidebar` / `--sidebar-foreground` | Sidebar background and text |
| `--border` / `--input` / `--ring` | Borders, input borders, focus ring |
| `--muted` / `--muted-foreground` | Secondary surface and text |
| `--destructive` | Destructive actions (delete, etc.) |
| `--radius` | Global corner radius |
| `--font-sans` | Global font stack |

### Component hooks: `data-slot`

UI components carry a `data-slot` attribute, which is more stable than class names (those are Tailwind-generated and change between versions):

`card`, `card-header`, `card-title`, `card-content`, `button`, `input`, `badge`, `table`, `sidebar-container`, `sidebar-header`, `sidebar-content`, `sidebar-footer`, and others.

Usage: `[data-slot="card"] { ... }`

### Theme classes

The active theme is a class on `<html>`, so you can target just one theme:

| Theme | Class |
| --- | --- |
| Miaomiaowu (pixel, default) | no class |
| Flat | `.theme-flat` |
| Anime | `.theme-anime` |
| Premium black & gold | `.theme-premium` |
| Dark mode | `.dark` (stacks with the above) |

### Overlays render through a Portal

Tooltips, dropdown menus and dialogs are rendered by Radix into `<body>`, **not inside the subtree of the element that triggered them**. So a descendant selector cannot single out one particular tooltip — you can only restyle the whole class of them. Targeting just one requires passing a custom class to that component in code, which custom CSS cannot do.

## Examples

### Switch the accent to blue

Write both light and dark, or the other one gives you away:

```css
:root {
  --primary: #2563eb;
  --primary-foreground: #ffffff;
  --ring: rgba(37, 99, 235, 0.6);
}

.dark {
  --primary: #60a5fa;
  --primary-foreground: #0b1220;
  --ring: rgba(96, 165, 250, 0.6);
}
```

### Square corners

```css
:root {
  --radius: 0;
}
```

### Change the global font

Make sure the font is installed on viewers' machines, or `@import` a web font first:

```css
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap");

:root {
  --font-sans: "Inter", system-ui, sans-serif;
}
```

> `@import` must be at the very **top** of your CSS, with no rules before it, or browsers ignore it.

### Narrow the sidebar

```css
[data-slot="sidebar-container"] {
  width: 200px;
}
```

### Heavier card shadow, no border

```css
[data-slot="card"] {
  border-color: transparent;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
}
```

### Darken the background in dark mode only

```css
.dark {
  --background: #0b0e14;
  --card: #11151d;
}
```

### Target one theme only

```css
/* Only users on the Flat theme see this */
.theme-flat [data-slot="card"] {
  border-radius: 4px;
}
```

### Recolor tooltips (including the arrow)

The tooltip arrow is a square rotated 45°, so **the color you see comes from `background-color`, not the SVG `fill`** — and the component sets both, so override both to be safe:

```css
/* The bubble */
[data-slot="tooltip-content"] {
  background-color: #1f2937;
  color: #f9fafb;
}

/* The arrow: Radix wraps it in an extra positioning span */
[data-slot="tooltip-content"] > span > svg {
  background-color: #1f2937;
  fill: #1f2937;
}
```

> Neither rule needs `!important`. The arrow selector has specificity (0,1,1), beating Tailwind's `.bg-primary` (0,1,0); the bubble rule ties on specificity but custom CSS comes after the app stylesheet, so it wins on order.

Tooltips use `--primary` by default, so if you were going to change the accent anyway, overriding the variable makes bubbles and arrows follow along — at the cost of buttons and selected states changing too. Use the selectors above when you only want the tooltip.

### Hide the sidebar footer on phones

```css
@media (max-width: 640px) {
  [data-slot="sidebar-footer"] {
    display: none;
  }
}
```

### Widen the login card

The login box is itself a card; the simplest way to single it out is by its width class:

```css
[data-slot="card"].max-w-sm {
  max-width: 28rem;
}
```

## Limits

| Limit | Why |
| --- | --- |
| 64 KiB max | This stylesheet ships with **every page**, login page included — large ones are bandwidth every visitor pays on every visit |
| No `</style` | It would end the style block early and the rest would be parsed as HTML. Saving rejects it outright |
| Cannot run scripts | CSS can't execute JS — that's a browser guarantee, not a restriction of this feature |

## Locked yourself out?

Custom CSS can make the interface unclickable or invisible — and fixing it means getting into the panel, which is the exact thing you can't do.

**Escape hatch**: set this environment variable on the master and restart. The injection point is left empty and the panel returns to normal:

```bash
MMWX_DISABLE_CUSTOM_CSS=1
```

For Docker, add it under `environment:` in `docker-compose.yml`; for systemd, add `Environment=MMWX_DISABLE_CUSTOM_CSS=1` to the service file.

**Your content is not lost** — it's just not injected. Fix or clear it in the panel, then remove the variable and restart.

> Sibling escape hatches: `MMWX_FORCE_PUBLIC_ACCESS` (public-access setting locked you out) and `MMWX_DISABLE_CAPTCHA` (misconfigured captcha blocks login). All three are environment-only by design — a panel setting would still require getting into the panel.

## FAQ

### I saved it and nothing happened

Check in order:

1. **Does the license include `custom_branding`?** The card shows a PRO gate notice when it doesn't, and nothing is delivered.
2. **Is `MMWX_DISABLE_CUSTOM_CSS` set?** If so, an amber notice appears at the top of the card.
3. **Other pages need a reload.** Saving only applies instantly to the page you're on.
4. **Your rule lost to an app style.** Open DevTools and look at the computed styles — a struck-through rule means it needs more specificity, or `!important`.

### I changed the accent color but some spots didn't change

Those spots likely don't use `--primary` and have a hardcoded color instead. Inspect the element in DevTools to see which variable or color it actually resolves to, then override that.

### Does this affect subscription delivery?

No. Custom CSS is injected only into panel page HTML. Subscription payloads (YAML / JSON / URI) never pass through it.
