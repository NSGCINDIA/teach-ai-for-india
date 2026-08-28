# NFR audit — Public site (PRD §13)

_Static review as part of M7. A full Lighthouse/axe pass still needs the app
running in a browser (see "Requires a live run" below)._

## §13.1 Performance (target: FCP < 1.5s on 4G)

Verified statically — all in place:
- **Fonts**: `next/font` (Inter, Plus Jakarta Sans, JetBrains Mono) with
  `display: 'swap'` — no render-blocking font fetch, no FOIT.
- **Images**: every public image uses `next/image` (automatic responsive
  `sizes`, lazy loading, modern formats). Campus hero uses `priority`.
- **Rendering**: all public routes are ISR (`export const revalidate = 300`),
  so pages serve from cache; new campus slugs render on-demand then cache.
- **Data**: public reads degrade gracefully to fallbacks (no blocking on a
  slow/absent backend). Aggregates come from indexed views.
- Raw `<img>` remains only in **authenticated** dashboard components
  (`session-detail`, `evidence-browser`) that load private Supabase **signed
  URLs** — not eligible for `next/image`; both use `loading="lazy"` + `alt`.

Requires a live run: real FCP/LCP/CLS/TBT numbers on throttled 4G.

## §13.2 Accessibility (target: WCAG 2.1 AA)

Verified statically — all in place:
- `<html lang="en">` set in the root layout.
- Interactive filters (gallery campus/date, admin tables) have `aria-label`s;
  decorative images/icons use `aria-hidden` or empty `alt=""`.
- Error messages use `role="alert"`; forms use `<Label htmlFor>` bound inputs.
- Progress rings expose `role="img"` + `aria-label`.
- Heading hierarchy is single-`h1`-per-page with nested `h2`/`h3`.

Requires a live run: automated axe scan, keyboard-trap/focus-order check,
color-contrast measurement against the brand tokens, and screen-reader spot
checks.

## Fixed in M7
- Footer had two dead `href="#"` links (Privacy/Contact) — repointed to real
  pages (`/gallery`, `/contact`); the `Login` link was already present.
