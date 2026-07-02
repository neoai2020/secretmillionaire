# Secret Millionaire Society

Elite financial extraction terminal — built on the [product-skeleton](../product-skeleton) modular platform.

## Three-Click Protocol

1. **Connect** (`/dashboard`) — Link to the private encrypted server
2. **Scan** (`/scanner`) — Parse retail data streams for unclaimed commissions
3. **Extract** (`/extraction`) — Route located funds to your account

**Sidebar (always on):** Member Training (`/training`) · Support (`/support`)

## Brand

| Token | Value |
|-------|-------|
| Obsidian Black | `#0B0C10` |
| Encrypted Green | `#45A29E` |
| Platinum Silver | `#C5C6C7` |
| Vault Gold | `#D4AF37` |

Fonts: **Space Grotesk** (headings/numbers), **Inter** (body)

Logo: `public/logo.png`

## Setup

```bash
cp .env.local.example .env.local
# Set Supabase URL, anon key, APP_URL
npm install && npm run dev
```

## Customize

- **Branding:** `src/config/brand.config.ts`
- **Copy/voice:** `src/config/onboarding-content.ts`, page components in `src/features/extraction-workflow/`
- **Promos (all slots):** `src/config/promos.config.ts`
- **Promo / offer URLs:** `src/config/offers.config.ts`
- **Support:** `src/config/support.config.ts`
- **Training videos:** `src/config/training.config.ts`
- **Network capacity:** `src/config/social-proof.config.ts`

**Developer handoff:** [DEVELOPER-SETUP.md](./DEVELOPER-SETUP.md) · [SKELETON.md](./SKELETON.md)
