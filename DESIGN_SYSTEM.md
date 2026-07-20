# Secret Millionaire Society — Design System

Canvas `#070D0D`, accent teal `#45A29E`, gold `#D4AF37`.

## Layout
- Outer container: `max-w-7xl mx-auto` (Shell)
- Page chrome: `PageHeader` (eyebrow + `ds-h1` + `ds-subtitle`)
- Sidebar: `--sidebar-w: 280px` / collapsed `76px` via `html[data-sidebar]`

## Type
- `page-eyebrow` — gold uppercase label
- `ds-h1` / `ds-h2` / `ds-h3` — page and section titles
- `ds-subtitle` — muted body intro

## Buttons
- `btn-primary` — teal/gold gradient, **white text**, min-height 44px

## Surfaces
- `glass-card`, `ds-well`, `card-base`

## Media
- `VideoThumbnailCard` + `thumb-scrim` gradient
- Playback only in `VideoOverlay`

## Ad creatives (do not token-sweep)
- `EarningsBanner` / `WelcomeOfferBanner` — navy `#101726`, amber `#fbbf24`
- Video overlay withdraw bar — emerald/teal `#45A29E`, amount `$214.36`
