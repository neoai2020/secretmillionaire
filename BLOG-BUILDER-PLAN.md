# Blog Builder ("Empire Builder") — Detailed Implementation Plan & Spec

> Feature for **Secret Millionaire Society (SMS)**: an Initiate enters a hobby they enjoy (or picks a suggestion), the app builds a full blog ("cash asset") about that topic, fills it with AI content + images, applies SEO so it can rank and pull traffic, and weaves the Initiate's DigiStore affiliate links into the content, banners, and CTAs. Training teaches them how to get the affiliate link from DigiStore.

**Status:** Detailed spec for approval (build not started)
**Target app:** `secret-millionaire-society` (Next.js 16 App Router + Supabase + Tailwind v4)
**Approach:** Add ONE feature module to the existing app, reuse code from the sibling apps in `Andrew/`, and match SMS branding + UX conventions exactly.
**No new paid keys:** text + images + scraping all run on keys already in `.env.local` (RapidAPI + ScraperAPI). No OpenAI, no Pexels.

---

## 1. Goal & themed user flow

SMS uses a **three-click protocol** metaphor (the existing extraction feature is Connect → Scan → Extract). The Blog Builder mirrors that so it feels native:

| Click | Themed label | What the Initiate does |
|-------|--------------|------------------------|
| **Click 1** | **Choose Territory** | Type a hobby (e.g. "fly fishing") or pick an AI-suggested niche |
| **Click 2** | **Arm Your Links** | Paste DigiStore affiliate link(s) for the niche |
| **Click 3** | **Deploy Asset** | App generates the blog (pillar + cluster posts), fetches images, weaves in affiliate links + banners, applies SEO, and publishes it live |

After deploy, the Initiate lands on an **Asset Command** page (manage the live site, generate more posts, copy the public URL, view clicks).

Public result: a crawlable blog at `https://<domain>/sites/<site-slug>` with posts at `/sites/<site-slug>/<post-slug>`.

---

## 2. Locked decisions

| Decision | Choice |
|----------|--------|
| Images | **Both: RapidAPI nano-banana (primary) + Pollinations (fallback).** No Pexels, no OpenAI. Requires `blog-images` Storage bucket. |
| Text generation | **RapidAPI ChatGPT-42** (key already present). No OpenAI. |
| Hosting | **DigitalOcean App Platform** (managed; Git-connected; env vars in dashboard) + **Supabase** for DB/storage |
| Public URL | **Same app, subpath** — `/sites/<site-slug>/<post-slug>` |
| Public post reads | **Supabase RLS public-read policy** (status='live') — so **no service-role key required** |
| Sites per Initiate | **One site per Initiate** (`sites.user_id` unique; create-site = upsert) |
| Cluster size | **Default: 1 pillar + 6 cluster posts** |
| Custom domain | **Later** (not in v1) |
| Process | Approve this spec → build in phases → final refactor/dead-code pass |

---

## 3. SMS branding & naming conventions (must follow)

Pulled from `src/config/brand.config.ts` and existing features. **All new UI must match this.**

### Vocabulary (use these words, not generic ones)

| Generic | SMS term |
|---------|----------|
| User / member | **Initiate** |
| Dashboard | **Command Center** |
| Support | **Support** |
| Premium area | **Society Access** |
| A generated blog | **Cash Asset** / **Money Site** |
| Publish | **Deploy** |
| Niche/topic | **Territory** |
| Affiliate links | **Armed Links** |

Tone: secretive, elite, "vault / encrypted / private network", push-button simple. Short, confident copy.

### Colors (use hex arbitrary values, matching existing code)

| Token | Hex | Usage |
|-------|-----|-------|
| Obsidian (page/sidebar) | `#0B0C10` | backgrounds |
| Panel | `#12141a` | cards/panels |
| Primary teal ("encryptedGreen") | `#45A29E` | primary actions, gradients, success |
| Gold ("vaultGold") | `#D4AF37` | step labels, badges, accents, money figures |
| Platinum text | `#C5C6C7` | headings/body |
| Muted text | `#6b7280` | secondary text |

CSS vars also available via `getBrandCssVars()`: `--bg-page`, `--bg-panel`, `--brand-primary`, `--brand-secondary`, `--brand-tint`, `--text-primary`. Utility classes seen in code: `brand-font` (Space Grotesk), `text-text-muted`, `text-accent`.

### Fonts
- `brand-font` class = **Space Grotesk** (headings, money figures).
- Inter for UI body (default).

---

## 4. UX patterns to reuse (copy these exact structures)

From `src/features/extraction-workflow/pages/ScannerPage.tsx`:

- **Page container:** `<div className="flex flex-col gap-6 sm:gap-8 max-w-4xl w-full">`
- **Step header block:**
```tsx
<p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#D4AF37]">Click 1</p>
<h1 className="brand-font text-2xl sm:text-3xl lg:text-4xl text-[#C5C6C7] tracking-tight">Choose Territory</h1>
<p className="text-[#6b7280] text-sm sm:text-base max-w-2xl leading-relaxed">…subcopy…</p>
```
- **Primary button:** gradient `linear-gradient(135deg, #45A29E 0%, #2d7a76 100%)`, `boxShadow: 0 0 40px rgba(69,162,158,0.35)`, `rounded-xl`, dark text `#0B0C10`, `framer-motion` `whileHover={{ scale: 1.01 }}`, `Loader2` spinner during async.
- **Result/callout card:** `rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/5 p-5 text-center` with gold uppercase label + `brand-font` figure.
- **Animations:** `framer-motion` `initial/animate` fade-up (`opacity:0, y:10` → `opacity:1, y:0`).
- **Icons:** `lucide-react`.
- Mobile-first responsive (`sm:` / `lg:` breakpoints everywhere).

### Code conventions
- Pages are `"use client"`, default-exported PascalCase components in `src/features/<id>/pages/`.
- Route wrappers in `src/app/<route>/page.tsx` wrap the feature page in `<FeatureGuard feature="blog-builder">`.
- Shared state via a React context provider (mirror `ExtractionContext`), persisted to `localStorage` with an `sms_` prefix where useful.
- API routes: guard with `featureApiGuard("blog-builder")`, get user via `getApiUser()`, scope every query by `user_id`.
- TypeScript strict; no `any` where avoidable; small focused components.

---

## 5. Reuse map (port, don't rewrite)

| Piece needed | Source app | File(s) to lift |
|---|---|---|
| Hobby → territory/topic ideas | `click clone profits` | `app/api/find-niche/route.ts` |
| AI article generator (tone/length/format + JSON parse) | `locus` | `src/app/api/generate/route.ts` (`TONE_PROMPTS`, `LENGTH_TOKENS`, `PLATFORM_FORMATS`) |
| Multi-angle cluster posts | `locus` | `src/app/api/generate-posts/route.ts` (`POST_ANGLES`) |
| Long-form chain (outline→chapter) | `click clone profits` | `app/api/generate/{outline,chapter}/route.ts` |
| RapidAPI text client + JSON-from-markdown parsing | `click clone profits` | `lib/ai.ts` |
| AI image gen (nano-banana) → base64 | `Aiwealth` / `BatteryProfits/app3` | `app/api/seed-post-images/route.ts`, `app3 generate-image` |
| Free image fallback (Pollinations URL) | `Aiwealth` | `lib/generate-image.ts` |
| Product/affiliate URL scraping (ground content) | `locus` / `Aiwealth` | `generate/route.ts` scrape fn, `app/api/analyze-url/route.ts` |
| Affiliate link capture + insert into CTA/banners | `azoneempire` | `presentation/features/wizard/components/StepAffiliateLink.tsx`, `app/[slug]/page.tsx` |
| Affiliate Link Vault + click tracking | `robinhood` | `LinkVaultClient.tsx`, `app/api/track-click/route.ts` |
| Publish slug + public page w/ `generateMetadata` | `click clone profits` | `app/api/project/[id]/publish/route.ts`, `app/s/[slug]/page.tsx` |
| Pre-made niche templates (zero-token seed) | `Aiwealth` / `locus` | `lib/dfy-pages.ts`, `(dashboard)/done-for-you/data.ts` |
| Drip/scheduled publishing (extra value) | `Drip autoresponder` | scheduling logic |

**Only real gap = SEO** (every sibling app disabled crawling). We build it fresh; it's small.

---

## 6. Feature module architecture

```
src/features/blog-builder/
  BlogBuilderProvider.tsx          # context provider (wizard + sites state)
  context/
    BlogBuilderContext.tsx          # hobby, armedLinks, generation status, sites
  pages/
    ChooseTerritoryPage.tsx         # Click 1
    ArmLinksPage.tsx                # Click 2
    DeployAssetPage.tsx             # Click 3 (generate + publish)
    AssetCommandPage.tsx            # manage the Initiate's single live site + posts
    LinkVaultPage.tsx               # manage DigiStore links
  components/
    TerritoryPicker.tsx
    SuggestionGrid.tsx
    ArmedLinkInput.tsx
    GenerationTerminal.tsx          # animated progress (mirror ScanTerminal)
    PostCard.tsx
    AffiliateBlockPreview.tsx
  lib/
    ai.ts                           # RapidAPI text client (port CCP lib/ai.ts)
    images.ts                       # nano-banana → Pollinations fallback
    scrape.ts                       # ScraperAPI helper
    affiliate.ts                    # weave links + render CTA/banner/table HTML
    seo.ts                          # slug, meta, JSON-LD, sitemap helpers
    templates.ts                    # themed post HTML templates
  README.md
```

Route wrappers in `src/app/`:
```
src/app/territory/page.tsx     → <FeatureGuard feature="blog-builder"><ChooseTerritoryPage/>
src/app/arm-links/page.tsx     → ArmLinksPage
src/app/deploy/page.tsx        → DeployAssetPage
src/app/asset/page.tsx         → AssetCommandPage   (single site per Initiate)
src/app/link-vault/page.tsx    → LinkVaultPage
```

Public (NON-gated, crawlable) routes — must live outside the auth/onboarding gate:
```
src/app/sites/[siteSlug]/page.tsx              # blog home (post list)
src/app/sites/[siteSlug]/[postSlug]/page.tsx   # single post (generateMetadata + JSON-LD)
src/app/sites/[siteSlug]/sitemap.xml/route.ts  # per-site sitemap
src/app/sites/[siteSlug]/rss.xml/route.ts      # RSS feed
src/app/robots.ts                              # allow /sites/*
src/app/sitemap.ts                             # sitemap index
```

> Action item: confirm `src/proxy.ts` does NOT redirect `/sites/*` to `/login`. Add a path allowlist for `/sites/` and the public seo routes.

### Wiring into the skeleton
1. `src/config/features.config.ts` → add `"blog-builder"` to `FEATURE_IDS` + `enabledFeatures`.
2. `src/config/navigation.config.ts` → add a themed workflow section (Choose Territory / Arm Links / Deploy) + resource items (My Assets, Link Vault) with `feature: "blog-builder"`.
3. `src/lib/nav-icons.ts` → add any new lucide icon names used (e.g. `Globe`, `Link2`, `Rocket`, `FileText`).
4. Register `BlogBuilderProvider` in `src/components/layout/AppProviders.tsx` (only mounts when feature enabled).

---

## 7. Data model (Supabase)

New migration: `supabase/migrations/<timestamp>_blog_builder.sql`

```sql
-- A live blog ("cash asset")
create table public.sites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,  -- one site per Initiate
  hobby text not null,
  title text not null,
  tagline text,
  slug text unique not null,
  theme text not null default 'obsidian',     -- visual template id
  armed_links jsonb not null default '[]',     -- [{label,url,network:'digistore'}]
  status text not null default 'draft',        -- draft | live
  created_at timestamptz not null default now()
);

-- Individual posts
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  slug text not null,
  html text not null,
  excerpt text,
  meta_description text,
  image_url text,
  image_alt text,
  is_pillar boolean not null default false,
  status text not null default 'draft',        -- draft | scheduled | live
  publish_at timestamptz,
  views int not null default 0,
  created_at timestamptz not null default now(),
  unique (site_id, slug)
);

-- Affiliate click tracking
create table public.affiliate_clicks (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts(id) on delete cascade,
  site_id uuid references public.sites(id) on delete cascade,
  link_url text,
  created_at timestamptz not null default now()
);

alter table public.sites enable row level security;
alter table public.posts enable row level security;
alter table public.affiliate_clicks enable row level security;

-- Owner full access
create policy "own sites"  on public.sites  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own posts"  on public.posts  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Public can read ONLY live content (lets Google crawl without service-role key)
create policy "public live sites" on public.sites for select using (status = 'live');
create policy "public live posts" on public.posts for select using (status = 'live');

-- Anyone can insert a click (anon visitors)
create policy "insert clicks" on public.affiliate_clicks for insert with check (true);
```

Storage (**required** — we use nano-banana): bucket **`blog-images`** (public read; authenticated-insert policy). nano-banana returns base64 → upload to this bucket → public URL. Pollinations URLs are hotlinked directly (no upload). No service-role key needed: uploads use the authenticated Initiate's client; reads are public bucket + public RLS.

---

## 8. API routes (`src/app/api/blog/*`)

| Route | Method | Purpose | Ported from |
|---|---|---|---|
| `/api/blog/suggest-territories` | POST | hobby → niche/title ideas | CCP `find-niche` |
| `/api/blog/create-site` | POST | insert `sites` row + unique slug | CCP publish slug |
| `/api/blog/generate-post` | POST | topic → blog HTML (tone/length) | `locus` generate |
| `/api/blog/generate-cluster` | POST | hobby → 1 pillar + N supporting posts, interlinked | `locus` generate-posts |
| `/api/blog/image` | POST | nano-banana → Pollinations fallback → URL | `Aiwealth`/`app3` |
| `/api/blog/scrape` | POST | scrape a product/affiliate page (optional grounding) | `locus`/`Aiwealth` |
| `/api/blog/publish` | POST | set site + posts `live`, finalize SEO fields | CCP publish |
| `/api/blog/track-click` | GET | log affiliate click + 302 redirect | `robinhood` track-click |

All authed routes: `featureApiGuard("blog-builder")` + `getApiUser()`; 401 if no user; scope by `user_id`. Add `export const maxDuration = 120` and `export const dynamic = "force-dynamic"` on generation/image routes.

---

## 9. Content generation (RapidAPI ChatGPT-42)

- Port `click clone profits/lib/ai.ts` → `src/features/blog-builder/lib/ai.ts`: `generateWithGPT(prompt, system)` hitting `https://${RAPIDAPI_HOST}/gpt4` with `x-rapidapi-key: RAPIDAPI_KEY`, plus the resilient ```json fenced-block extraction + plain-text fallback.
- Port `locus` prompt scaffolding: `TONE_PROMPTS` (authoritative / conversational / bold), `LENGTH_TOKENS` (short/medium/long), and a blog-specific format prompt that enforces **clean semantic HTML** (`<h2>`, `<p>`, `<ul>`, `<img>` placeholders) — not markdown.
- **SEO content structure (the strategy that ranks):** for each site generate **1 pillar post** ("The Complete Guide to <hobby>") + **6 cluster posts** (e.g. "Best <gear> for Beginners", "<hobby> Mistakes to Avoid", "How to Start <hobby> on a Budget", etc.), all **interlinked** (pillar ↔ clusters). Topical clusters build the authority Google rewards.
- **Zero-token seed option:** allow instant population from ported DFY templates (`Aiwealth/lib/dfy-pages.ts`, `locus done-for-you`) so a site can go live with no AI spend, then enhance on demand.

---

## 10. Images (no Pexels / no OpenAI)

`src/features/blog-builder/lib/images.ts` — **both providers** (decision):
1. **Primary:** RapidAPI **nano-banana** (`RAPIDAPI_IMAGE_HOST=google-nano-banana4.p.rapidapi.com`, same `RAPIDAPI_KEY`) → returns base64 → upload to `blog-images` Storage bucket (authenticated client) → public URL. (Pattern ported from `BatteryProfits/app3 generate-image` + `Aiwealth seed-post-images`.)
2. **Fallback (free, no key):** if nano-banana fails/times out, use Pollinations — `https://image.pollinations.ai/prompt/<encoded>?width=1200&height=800&nologo=true` (direct hotlink URL, no upload).
3. Whitelist BOTH hosts in `next.config.ts` `images.remotePatterns`: `image.pollinations.ai` and the Supabase Storage public host.
4. Auto-generate descriptive **alt text** (from the post title/keywords) for SEO + accessibility.

Provider order lives behind a single switch in `images.ts` so it's easy to tune.

---

## 11. Affiliate handling

- **Capture** in Click 2 (`ArmedLinkInput`, ported from `azoneempire StepAffiliateLink`): label + DigiStore URL, validated, saved to `sites.armed_links`.
- **Insertion** (`lib/affiliate.ts`) into published posts:
  - In-content contextual links on relevant keywords.
  - **CTA buttons** ("Check Today's Price", "Get Instant Access") styled in SMS teal/gold.
  - **Banner blocks** between sections.
  - Optional **comparison table** (highest-converting affiliate format).
- All affiliate hrefs route through `/api/blog/track-click?to=<url>&post=<id>` → logs to `affiliate_clicks` → 302 redirect.
- **Link Vault page** (port `robinhood LinkVaultClient`): manage all DigiStore links in one place; reusable across sites.

---

## 12. Public rendering + SEO (built fresh, small)

- `app/sites/[siteSlug]/[postSlug]/page.tsx` — server component, reads live post via anon client (public RLS policy), `force-dynamic`. Implements `generateMetadata()` (title, description, canonical, OpenGraph). Render the stored HTML inside a clean, fast, themed reader layout (light, readable — public blogs should be bright/SEO-friendly, NOT the dark Initiate UI).
- **JSON-LD** `BlogPosting`/`Article` structured data injected per post.
- `app/robots.ts` — **allow** `/sites/*` (sibling apps blocked crawlers — we must not).
- `app/sitemap.ts` (index) + `app/sites/[siteSlug]/sitemap.xml/route.ts` (per-site, lists live posts).
- `app/sites/[siteSlug]/rss.xml/route.ts` — RSS feed (freshness signal).
- Internal links between pillar + cluster posts (auto).
- Clean slugs (kebab, deduped per site). Increment `posts.views` on render.

---

## 13. APIs / keys (final — only what you already have)

**In `.env.local` now — nothing else required to build:**
- `RAPIDAPI_KEY=e58a784d0dmsh8c00f2f58365008p103943jsn729926f8c316` — text (ChatGPT-42) + images (nano-banana).
- `RAPIDAPI_HOST=chatgpt-42.p.rapidapi.com`.
- `SCRAPER_API_KEY=<from ScraperAPI dashboard>` — scrape product/affiliate pages.
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_PRODUCT_NAME`.

**Free, no key:** Pollinations image fallback.

`RAPIDAPI_IMAGE_HOST=google-nano-banana4.p.rapidapi.com` — already added to `.env.local`.

`SUPABASE_SERVICE_ROLE_KEY` is **not** required — public reads use an RLS policy and image uploads use the authenticated Initiate's client. Add it only if we later want admin-side bulk operations.

> ⚠️ `RAPIDAPI_KEY` is a shared/committed reseller key (free tier) used across sibling apps — fine for launch/testing; get a dedicated key before heavy production traffic.

### DigitalOcean App Platform setup
1. Connect the Git repo; App Platform auto-detects Next.js (build `npm run build`, run `npm start`).
2. Set env vars in the App Platform dashboard → Settings → App-Level Environment Variables: `RAPIDAPI_KEY`, `RAPIDAPI_HOST`, `RAPIDAPI_IMAGE_HOST`, `SCRAPER_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_APP_URL` (the production URL), `NEXT_PUBLIC_PRODUCT_NAME`. Remove `DEV_BYPASS_AUTH`.
3. Supabase: apply the migration + create the `blog-images` public bucket + add the production URL to Auth → URL Configuration.
4. Custom domains: skip for v1 (App Platform supports adding them later under Settings → Domains).

---

## 14. Build phases (detailed task lists)

### Phase 0 — Foundations
- [ ] Add `"blog-builder"` to `FEATURE_IDS` + `enabledFeatures`.
- [ ] Create migration `<ts>_blog_builder.sql` (tables + RLS) and apply via Supabase MCP.
- [ ] Add nav items + icons; confirm `proxy.ts` allows `/sites/*` public.
- [ ] Scaffold `src/features/blog-builder/` (folders, README, empty provider/context).

### Phase 1 — Wizard UI (themed, no AI yet)
- [ ] `BlogBuilderProvider` + `BlogBuilderContext` (hobby, armedLinks, status, sites) with `localStorage` persistence.
- [ ] `ChooseTerritoryPage` (Click 1) — input + suggestion grid (static suggestions first).
- [ ] `ArmLinksPage` (Click 2) — `ArmedLinkInput`, validation.
- [ ] `DeployAssetPage` (Click 3) — `GenerationTerminal` (mirror `ScanTerminal`) with mocked progress.
- [ ] Route wrappers + sidebar wiring. Verify flow end-to-end with mock data.

### Phase 2 — Generation engine (RapidAPI)
- [ ] `lib/ai.ts` (port CCP) + `lib/scrape.ts` (ScraperAPI).
- [ ] `/api/blog/suggest-territories`, `/api/blog/generate-post`, `/api/blog/generate-cluster`.
- [ ] `lib/templates.ts` — themed semantic-HTML post templates.
- [ ] Wire Click 1 suggestions + Click 3 real generation. Persist `sites` + `posts` (draft).

### Phase 3 — Images + affiliate
- [ ] `lib/images.ts` (Pollinations first; nano-banana behind switch) + `/api/blog/image`.
- [ ] `lib/affiliate.ts` — weave links, CTA buttons, banners, comparison table.
- [ ] `AffiliateBlockPreview` in Deploy step.

### Phase 4 — Publish + SEO
- [ ] `/api/blog/publish` (flip to live, finalize SEO fields).
- [ ] Public `sites/[siteSlug]` + `[postSlug]` pages with `generateMetadata` + JSON-LD + light reader theme.
- [ ] `robots.ts` (allow), `sitemap.ts`, per-site `sitemap.xml`, `rss.xml`.
- [ ] `/api/blog/track-click` + click counts on Asset Command.
- [ ] `AssetCommandPage` + `LinkVaultPage`.

### Phase 5 — Extra value (optional, see §15)

### Phase 6 — Refactor & dead-code removal (REQUIRED final pass)
See §16.

---

## 15. Extra-value ideas (ranked by value ÷ build cost)

1. **Sitemap + RSS + auto internal linking** — biggest SEO lever, tiny code. *(cheap)*
2. **Pillar + cluster generation** — topical authority that actually ranks hobby blogs. *(cheap, high value)*
3. **Pollinations images** — free, instant, zero token cost. *(cheapest)*
4. **Affiliate comparison tables + "best for beginners" blocks** — highest-converting + rank-friendly. *(cheap)*
5. **Drip / scheduled publishing** — auto-publish 1 post/week (reuse `Drip autoresponder`) so Google sees a fresh, active site. *(medium)*
6. **Custom domain (CNAME)** — own domain ranks better; `sites` already supports a `custom_domain` column if added. *(medium)*
7. **Auto title/meta optimization pass** + regenerate-with-keywords. *(cheap)*

---

## 16. Phase 6 — Refactor & dead-code removal (final pass, required)

After the feature works end-to-end, do a cleanup pass so we don't leave cruft:

1. **Detect unused exports/files:** run `npx ts-prune` and `npx depcheck` to find unused exports and unused dependencies.
2. **Lint:** `ReadLints` on every new/edited file; fix all warnings (unused imports/vars, `any`, etc.). `npm run build` must pass clean.
3. **Remove scaffolding:** delete mock/placeholder code from Phase 1, unused helper functions, commented-out blocks, and any ported-but-unused snippets from the sibling apps (e.g. platform formats we didn't use).
4. **De-duplicate:** consolidate any logic duplicated between `lib/*` files; ensure a single source of truth for slug/SEO helpers.
5. **Prune deps:** if nano-banana/storage path was dropped, remove related deps/env; remove anything `depcheck` flags.
6. **Tighten types:** replace `any`, export shared types from one place.
7. **Docs:** update `src/features/blog-builder/README.md` and this plan's checklist; remove any now-stale notes.
8. **Verify:** full smoke test (Choose → Arm → Deploy → public page crawlable → affiliate click tracked) before declaring done.

> Constraint: only delete code proven unused (grep for references first). Never remove skeleton/shared infra used by other features.

---

## 17. Resolved decisions

1. ✅ Hosting: **DigitalOcean App Platform** + Supabase (DB/storage).
2. ✅ **One site per Initiate** (`sites.user_id` unique; create-site upserts).
3. ✅ Cluster size: **default 1 pillar + 6 cluster posts**.
4. ✅ Images: **both nano-banana (primary) + Pollinations (fallback)** — `blog-images` bucket required.
5. ✅ Custom domains: **later** (not v1).

---

## 18. Deliverables checklist

- [x] `RAPIDAPI_KEY` + `RAPIDAPI_HOST` + `RAPIDAPI_IMAGE_HOST` set
- [x] `SCRAPER_API_KEY` set
- [ ] Supabase migration applied (tables + RLS public-read + `sites.user_id` unique)
- [ ] `blog-images` public Storage bucket created (authenticated-insert policy)
- [ ] `proxy.ts` allows `/sites/*` (crawlable)
- [ ] `robots.txt` + sitemap verified crawlable in production
- [ ] DigiStore affiliate-link training linked in onboarding
- [ ] DigitalOcean App Platform env vars set; `DEV_BYPASS_AUTH` removed
- [ ] Phase 6 refactor/dead-code pass complete; `npm run build` clean
