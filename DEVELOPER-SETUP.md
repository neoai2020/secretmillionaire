# Secret Millionaire Society — Developer Setup

> Branded product built from [product-skeleton](../product-skeleton). This guide applies to SMS; see the skeleton copy for the generic template.

This document is for the developer shipping a new product from **product-skeleton**. It covers environment setup, database steps, config files, and **every link you need from the client** (ads, support, training, partner offers, etc.).

Also read: [SKELETON.md](./SKELETON.md) for architecture and feature modules.

---

## 1. Quick start (local)

```bash
cd product-skeleton
cp .env.local.example .env.local
npm install
npm run dev
```

Open **http://localhost:3000**

For local UI preview without login:

```env
DEV_BYPASS_AUTH=true
```

Remove or set to `false` before production.

---

## 2. Step-by-step: environment

| Step | Action |
|------|--------|
| 1 | Copy `.env.local.example` → `.env.local` |
| 2 | Set `NEXT_PUBLIC_SUPABASE_URL` (from Supabase → Project Settings → API) |
| 3 | Set `NEXT_PUBLIC_SUPABASE_ANON_KEY` (anon / publishable key) |
| 4 | Set `NEXT_PUBLIC_APP_URL` (`http://localhost:3000` locally, production URL on deploy) |
| 5 | Set `NEXT_PUBLIC_PRODUCT_NAME` (display name) |
| 6 | Optional: `WEBHOOK_SIGNUP_URL` for Make.com / Zapier on new signups |
| 7 | Optional feature keys — only if `core-workflow` is enabled (`RAPIDAPI_*`, `SCRAPERAPI_KEY`) |

---

## 3. Step-by-step: database (Supabase)

| Step | Action |
|------|--------|
| 1 | Create or connect to a Supabase project |
| 2 | Ensure `auth.users` is enabled (default) |
| 3 | Apply migration: `supabase/migrations/20260617000000_skeleton_core.sql` |
|    | Adds `users.onboarding_completed_at` and `user_id` columns on feature tables |
| 4 | Confirm `users` profile table exists (id matches `auth.users.id`) |
| 5 | Run auth email setup script (see below) |
| 6 | In Supabase dashboard → **Authentication → URL Configuration**: add `{APP_URL}/auth/callback` |
| 7 | Run **RLS advisors** — ensure no public tables without policies |
| 8 | Smoke test: signup → onboarding → dashboard → logout → forgot password |

### Auth setup script

```bash
PROJECT_REF=your-project-ref \
APP_URL=https://yourdomain.com \
SUPABASE_ACCESS_TOKEN=your-token \
npm run setup:supabase-auth
```

Or use `supabase login` and omit the token.

**Critical:** `NEXT_PUBLIC_APP_URL` must match production so forgot-password emails redirect correctly.

---

## 4. Step-by-step: branding & shell

Edit **only config files** — do not fork Shell/Sidebar unless necessary.

| Order | File | What to change |
|-------|------|----------------|
| 1 | `src/config/brand.config.ts` | Product name, colors, fonts, logo, metadata |
| 2 | `src/config/support.config.ts` | Support email, contact URL, page copy, stats |
| 3 | `src/config/training.config.ts` | Video IDs, training page copy, external training URL |
| 4 | `src/config/promos.config.ts` | All ad/promo placements (see table below) |
| 5 | `src/config/onboarding-content.ts` | Onboarding copy, partner offer URL |
| 6 | `src/config/navigation.config.ts` | Sidebar labels (workflow steps, section titles) |
| 7 | `src/config/social-proof.config.ts` | Fake tickers/stats — keep `enabled: false` unless client approves |
| 8 | `src/config/features.config.ts` | Which product modules are on (see §6) |
| 9 | `public/` | Logo image if using `logo.type: "image"` |

Re-run auth script after changing production domain.

---

## 5. Links you need from the client

Ask the client for these **before go-live**. Each row maps to a config field.

### Core pages (always in sidebar)

| What | Where in code | Field(s) | Example from client |
|------|---------------|----------|---------------------|
| Support email | `support.config.ts` | `email` | `help@theirbrand.com` |
| Support contact link | `support.config.ts` | `contactUrl` | `mailto:help@...` or `https://desk.zoho.com/...` |
| Help center (optional) | `support.config.ts` | `helpCenterUrl` | `https://help.theirbrand.com` |
| Training landing page | `training.config.ts` | `externalTrainingUrl` | `https://training.theirbrand.com` |
| Vimeo video 1 | `training.config.ts` | `videos[0].id` | `1171473195` |
| Vimeo video 2 (optional) | `training.config.ts` | `videos[1].id` | `1171474608` |

### Promo / ad placements

| Placement (UI location) | Config file | Slot ID | Field(s) | What to ask client for |
|---------------------------|-------------|---------|----------|------------------------|
| Top banner (every page) | `promos.config.ts` | `global-top` | `content.ctaUrl`, `content.headline`, `content.body` | Upsell / free training URL + copy |
| Footer support card | `promos.config.ts` | `global-footer` | Uses `support.config.ts` | Usually auto from support config |
| Sidebar ad #1 | `promos.config.ts` | `sidebar-promo-1` | `content.ctaUrl`, `content.headline` | Affiliate or bonus offer URL |
| Sidebar ad #2 | `promos.config.ts` | `sidebar-promo-2` | `content.ctaUrl`, `content.headline` | Second offer URL |
| Sidebar ad #3 | `promos.config.ts` | `sidebar-promo-3` | `content.ctaUrl`, `content.headline` | Training / fast-cash URL |
| Onboarding partner modal | `onboarding-content.ts` | — | `ONBOARDING_BETA_QUALIFICATION_CTA_URL` | Optional partner program URL |
| Onboarding modal (promo) | `promos.config.ts` | `onboarding-claim` | `content.ctaUrl` | Same or alternate partner URL |
| Free training popup | `promos.config.ts` | `modal-training` | `content.ctaUrl` | Registration / webinar URL |
| Withdraw toast | `promos.config.ts` | `toast-withdraw` | `content.ctaUrl` | Payout / wallet portal URL |
| Social proof toast | `promos.config.ts` | `toast-social` | (no URL) | Enable only if client wants simulated activity |

Set `enabled: false` on any slot the client does not use.

### Integrations

| What | Where | Field | Example |
|------|-------|-------|---------|
| Signup webhook | `.env.local` | `WEBHOOK_SIGNUP_URL` | Make.com webhook URL |
| RapidAPI (workflow) | `.env.local` | `RAPIDAPI_KEY`, hosts | Only if `core-workflow` enabled |
| ScraperAPI (workflow) | `.env.local` | `SCRAPERAPI_KEY` | Only if `core-workflow` enabled |

### Assets

| Asset | Location | Notes |
|-------|----------|-------|
| Logo | `public/logo.png` + `brand.config.ts` | PNG/SVG, ~512px |
| Favicon | `src/app/favicon.ico` | Replace default |
| OG image | `public/og.png` + metadata | Optional |

---

## 6. Feature modules

Edit `src/config/features.config.ts`:

```typescript
export const enabledFeatures: FeatureId[] = [
  "training",        // ON by default — sidebar Training page
  "core-workflow",   // search → analysis → radar → replies
  "dopamine",        // popups, tickers, social proof
  // "scale-upsell", "premium-dfy", "premium-instant", "premium-autopilot",
];
```

**Always visible (no feature flag):** Home, **Training**, **Support** — defined in `navigation.config.ts` → `coreResourceNav`.

**Gated by feature flag:** workflow steps, scale training, premium pages, dopamine widgets.

---

## 7. Sidebar structure (plan)

```
Navigation
  └ Home (/dashboard)

Workflow          ← only if workflow feature enabled
  └ Step 1…4

Resources         ← always on
  ├ Training (/training)
  └ Support (/support)

More Training     ← optional (e.g. scale-upsell)

Premium Features  ← optional upsell routes

[Sidebar promo cards from promos.config.ts]
```

---

## 8. Deploy checklist

| Step | Done |
|------|------|
| All `example.com` URLs replaced | ☐ |
| `DEV_BYPASS_AUTH` removed or `false` | ☐ |
| Production env vars set on host (Vercel, etc.) | ☐ |
| Auth script run with production `APP_URL` | ☐ |
| Supabase redirect URLs include production domain | ☐ |
| Migration applied on production DB | ☐ |
| `npm run build` passes | ☐ |
| Test signup, onboarding, training, support, logout | ☐ |

---

## 9. File reference (config-only changes)

```
src/config/
  brand.config.ts       — colors, name, logo, fonts
  support.config.ts     — support page + footer promo data
  training.config.ts    — videos + external training URL
  promos.config.ts      — all ad/promo slots
  onboarding-content.ts — onboarding + partner CTA
  navigation.config.ts  — sidebar labels & routes
  features.config.ts    — enabled modules
  social-proof.config.ts
  webhooks.config.ts
```

---

## 10. Getting help

- Architecture deep-dive: `SKELETON.md`
- Per-feature notes: `src/features/*/README.md`
- Database + migrations: `DATABASE-SETUP.md`
- Auth dashboard checklist: `SUPABASE_AUTH_SETUP.md`

When handing off to the client, provide: production URL, Supabase project access (if they manage it), and a list of which promo slots are live.
