# Product Skeleton — Developer Guide

This is a **modular white-label app skeleton** extracted from CashTap AI. It ships with auth, onboarding, app shell, and promo slots. Product features are optional modules under `src/features/`.

**Location:** `/Volumes/Transcend/Local Disk/Andrew/product-skeleton`

---

## Architecture

```
src/
  app/              # Thin route wrappers + auth pages
  components/       # Shell, Sidebar, PromoSlotRenderer, onboarding
  config/           # brand, promos, navigation, features, support
  context/          # WorkflowNavContext (optional workflow locking)
  features/         # Pluggable feature modules
  lib/              # supabase, onboarding-gate, api-auth, proxy
  proxy.ts          # Auth + onboarding gate (Next.js 16)
```

### Request flow

1. `src/proxy.ts` — unauthenticated → `/login`; incomplete onboarding → `/onboarding`
2. `Shell.tsx` — strips chrome on auth/onboarding routes
3. `Sidebar.tsx` — reads `navigation.config.ts` + `features.config.ts`
4. `PromoOrchestrator` — renders promos from `promos.config.ts`

---

## Supabase MCP setup checklist

After connecting Supabase MCP to a new project:

| Step | Action |
|------|--------|
| 1 | `get_project_url` + `get_publishable_api_key` → fill `.env.local` |
| 2 | Set `NEXT_PUBLIC_APP_URL` to your production URL |
| 3 | Verify `users` table exists (or add profile trigger from Supabase Auth) |
| 4 | `apply_migration` — run `supabase/migrations/20260617000000_skeleton_core.sql` |
| 5 | Run auth setup script (see below) |
| 6 | `get_advisors` — check RLS on exposed tables |
| 7 | Smoke test: signup → onboarding → dashboard → logout |
| 8 | Smoke test: forgot password → email → `/auth/callback` → reset |

### Auth setup script

```bash
PROJECT_REF=your-project-ref \
APP_URL=https://yourdomain.com \
npm run setup:supabase-auth
```

Requires `SUPABASE_ACCESS_TOKEN` or `supabase login` token.

**Important:** Login uses `window.location.href` (hard redirect) so the proxy sees cookies. Forgot-password `redirectTo` uses `NEXT_PUBLIC_APP_URL` — never hardcode production domains.

---

## Branding change checklist

To rebrand without touching component files:

| File | What to change |
|------|----------------|
| `src/config/brand.config.ts` | Product name, tagline, colors, fonts, metadata |
| `src/config/promos.config.ts` | Promo copy, URLs, enable/disable slots |
| `src/config/support.config.ts` | Support email and stats (reference; footer promo uses promos.config) |
| `src/config/onboarding-content.ts` | Onboarding copy and partner offer URL |
| `src/config/navigation.config.ts` | Sidebar labels and routes |
| `src/config/social-proof.config.ts` | Fake stats/tickers (`enabled: false` by default) |
| `.env.local` | `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_PRODUCT_NAME` |
| Auth script | Re-run with new `APP_URL` |

---

## Feature modules

Enable in `src/config/features.config.ts`:

```typescript
export const enabledFeatures: FeatureId[] = [
  "core-workflow",  // search → analysis → radar → replies
  "training",       // /training + FAQ
  "scale-upsell",   // /scale-training
  "premium-dfy",    // /dfy
  "premium-instant",// /instant
  "premium-autopilot", // /autopilot
  "dopamine",       // sidebar ticker, popups, dashboard widgets
];
```

See `src/config/features.config.example.ts` for a full CashTap-style preset.

### Adding a new feature

1. Create `src/features/my-feature/` with `pages/`, optional `api/`, `README.md`
2. Add `"my-feature"` to `FEATURE_IDS` in `features.config.ts`
3. Add nav item in `navigation.config.ts` with `feature: "my-feature"`
4. Create `src/app/my-route/page.tsx` wrapper with `<FeatureGuard feature="my-feature">`
5. Add env vars to `.env.local.example` if needed

### Module layout

| Module | Routes | Env vars |
|--------|--------|----------|
| `core-workflow` | `/search`, `/analysis`, `/radar`, `/replies` | `RAPIDAPI_*`, `SCRAPERAPI_KEY` |
| `training` | `/training` | — |
| `scale-upsell` | `/scale-training` | — |
| `premium-*` | `/dfy`, `/instant`, `/autopilot` | — |
| `dopamine` | Shell popups + sidebar ticker | — |

API routes in `src/app/api/` use `featureApiGuard()` and `getApiUser()` for auth + per-user data scoping.

---

## Promo slot system

All promos are defined in `src/config/promos.config.ts`:

| Slot ID | Placement | Template |
|---------|-----------|----------|
| `global-top` | Top of main content | horizontal-banner |
| `global-footer` | Bottom of main content | footer-card |
| `sidebar-promo-*` | Sidebar | sidebar-card |
| `modal-training` | Full-screen overlay | modal |
| `toast-withdraw` | Bottom-left | toast |
| `toast-social` | Bottom-left (queue) | toast |

Rendered by `PromoSlotRenderer` + `PromoOrchestrator`. Colors come from `brand.config.ts` (`promoAccent`, `promoCta`).

---

## Onboarding flow

1. **Preparing** — real checklist (account verified, profile created, workspace ready)
2. **Welcome** — product onboarding complete; persists `onboarding_completed` metadata
3. **Partner offer** (optional modal) — dismissible; not a gate

Completion writes:
- `users.onboarding_completed_at`
- `user_metadata.onboarding_completed: true`

---

## Environment variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_PRODUCT_NAME=Product Skeleton
WEBHOOK_SIGNUP_URL=          # optional
```

Feature-only vars documented in `.env.local.example`.

---

## UX decisions baked in

- Config-driven branding end-to-end
- Forgot-password uses `NEXT_PUBLIC_APP_URL`
- Sidebar splits **Workflow** vs **Resources** (not one mixed progress list)
- Locked nav items when workflow prerequisites incomplete
- Social proof disabled by default (`social-proof.config.ts`)
- API routes require authenticated user + scope data by `user_id`
- Skeleton dashboard is minimal (welcome + start CTA)

---

## Deploy

1. Set env vars on Vercel/host
2. Run auth setup script with production `APP_URL`
3. Apply Supabase migrations
4. `npm run build && npm start`
