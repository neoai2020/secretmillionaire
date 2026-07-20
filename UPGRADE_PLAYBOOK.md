# Software Upgrade Playbook

A repeatable, end-to-end guide for applying the same overhaul we did on Profit Loop (modeled on Robinhood) to **any** of the member-area apps. Follow the phases in order. Every phase ends with a verification step so functionality and revenue links are never broken.

---

## Phase 0 — Ground rules + full recon (read before touching anything)

These rules apply to every phase. Violating any of them is a rollback.

1. **Never change revenue links.** Affiliate URLs (JVZoo, Explodely, ClickBank, Digistore, Convertri, custom training funnels) must come out of the process byte-identical. Before starting, capture them:
   ```bash
   grep -rn "jvz\|clickbank\|digistore\|convertri\|explodely\|http" src --include='*.tsx' --include='*.ts' | grep -i "href\|url\|link" > /tmp/links-before.txt
   ```
   Re-run after every phase and diff. Only additions are allowed, never modifications.
2. **Never change video IDs.** Vimeo/YouTube IDs are content, not design. Grep them before and after (`player.vimeo.com/video/\d+`).
3. **Never touch API routes' logic.** Design work stays in components, pages, CSS, and assets. If a page component calls `fetch('/api/...')`, the call signature stays identical.
4. **Typecheck after every phase:** `npx tsc --noEmit`. Zero new errors.
5. **One commit per phase** with a clear message, so any phase can be reverted alone.
6. **Copy patterns, not constants.** When porting from a reference app (e.g. Robinhood), take the structure/JSX/CSS pattern but swap in this app's brand colors, product name, links, and video IDs. Grep for the reference app's affiliate IDs afterward to prove none leaked in.

### 0b. Scour the whole app FIRST — never work from partial knowledge

Before writing a single line, build a complete picture. Half the pushback in past runs came from working on the pages that were mentioned and missing the ones that weren't.

1. **Map every route**: list every folder under the app router (dashboard pages, auth pages, landing/offer pages, onboarding) and every shared component. Dispatch an **explore subagent** to do this — it's cheap and exhaustive.
2. **Run the app on localhost and click through every page, overlay, and state** (logged-out, logged-in, empty data, loaded data, mobile width) before deciding anything. Screenshots of the current state are your "before" set.
3. **Load the relevant design/best-practice skills** before defining anything visual (e.g. a redesign/high-end-design skill, contrast and cognitive-load checklists). If a needed capability is missing (browser screenshots, image tooling), say so up front and plan around it — don't discover it mid-phase.
4. Write the findings down (routes table, component inventory, current inconsistencies). Every later phase quotes this document instead of re-exploring.

---

## Phase 1 — Honest activity data (remove fabricated social proof)

**Problem:** Dashboards show fake "community earnings", fake member counts, fake "X just earned $Y — Verified" toasts with random names and incrementing counters.

**Fix:**
1. Find the component (search for `LiveActivity`, `SocialProof`, hardcoded names arrays, `Math.random()` inside counters).
2. Replace fabricated counters with the signed-in user's **real** usage from the database (e.g. today's leads found / emails generated from a `usage_limits` or equivalent table).
3. Replace fake toasts with either the user's own recent activity (from an `activity_logs` table) or rotating **useful tips**. No fake names, no fake dollar amounts, no "Verified" badges.
4. **Toasts are desktop-only.** Floating corner toasts cover content, thumbnails, and the bottom tab bar on phones — an actively bad experience. Hide passive toasts below `lg` (`hidden lg:flex` on the container). The same information must exist somewhere in-page (e.g. a "Your activity" card) so mobile loses nothing. If a notification is genuinely critical on mobile, use a slim auto-dismissing snackbar at the top — never a card floating over content.
5. Replace any fake "community progress to $1M" bars with a "Next step" nudge card.
6. Add "Individual results vary." where appropriate.

**Verify:** No `Math.random()` driving displayed money. Page renders for a brand-new user (empty state falls back to tips).

---

## Phase 2 — Green banner (Free Training offer) at generation CTAs

**Problem:** The old promo banner is global (every page) or styled off-brand.

**Target design** (the Robinhood `EarningsBanner` look):
- Dark navy card `bg-gradient-to-b from-[#101726] to-[#0b0f18]`, `border-2 border-[#fbbf24]/50`, `rounded-2xl`, centered text
- Red pill badge "FREE TRAINING"
- Big black-weight uppercase headline with the dollar range in amber `#fbbf24`
- Bold light-blue sub-line, amber gradient CTA button, red "Warning: this will be taken down soon" footer
- Dismiss X in the corner (local state only — no persistence needed)

**Placement rule:** the banner appears **the moment a generation CTA starts loading and stays after the results arrive.** It is only removed when the user clicks its X.

**Implementation pattern:**
```tsx
const [showOfferBanner, setShowOfferBanner] = useState(false)

// inside the CTA handler, before the async work:
setLoading(true)
setShowOfferBanner(true)   // never set back to false on success

// in JSX, right below the form / above the results:
{showOfferBanner && <PromoBanner />}
```

**Where to wire it — every CTA that "generates" something:**
- Find customers / lead search
- Email generation
- Offer/template generation
- Any premium feature that produces results (see Phase 3)

**If the CTA has a real loading phase**, show a loading bar with the banner *inside* it (see `GenerationProgress`): spinner + label + animated bar easing to 95% + `<PromoBanner />` below. When loading finishes, the progress bar goes away, the banner stays.

**If the CTA is instant** (client-side reveal like "show my posts"), add a **fake delay** (3.5–4.5s timeout) so the loading bar + banner get seen, then reveal results. Guard against races: cancel the pending timeout if the user changes inputs (token/ref counter).

**Remove the banner from any global layout** — it must be contextual only.

**Verify:** banner CTA link is this app's own funnel URL. Banner appears on loading, persists after results, X dismisses it.

---

## Phase 3 — Premium features: loading + banner on every CTA

Apply Phase 2's pattern to each premium page (Accelerator/DFY, Recurring Streams, Social Payouts, etc.):

| CTA type | Pattern |
|---|---|
| "Generate my posts" | fake 4.5s → `GenerationProgress` → posts + banner stays |
| "Save & continue" (link save) | fake 4s → progress → unlocked content + banner |
| Niche/category switch | fake 3.5s → progress → filtered results + banner |
| Load more | fake 2.5s → progress → more rows |
| Copy-to-clipboard buttons | **skip** — not generation |

Disable the triggering control while loading. Pages with no generation CTA (e.g. a security/status page) get **no** banner.

---

## Phase 4 — Kill the global popup; put the ad under videos in an overlay

**Problem:** an "Account Verified — You're Eligible To Withdraw $416.34 — Withdraw Now" popup mounts globally on every page.

**Fix (the Robinhood `VideoOverlay` pattern):**
1. **Remove** the popup from the layout (and delete the dead component file once nothing imports it).
2. Create a `VideoOverlay` component:
   - Portal to `document.body`, `z-[120]`, backdrop `bg-black/60`, Esc + backdrop-click close, body scroll lock
   - **The ad must be fully visible without scrolling — this is the whole point.** Build the panel as a flex column: header `shrink-0`, ad bar `shrink-0`, and the video as `flex-1 min-h-0` absorbing the leftover height (the embedded player letterboxes itself). Panel height: `h-[100dvh]` on mobile, `h-[min(92dvh,56rem)]` on desktop. Never use `aspect-video` on the player wrapper inside a capped panel — that's what pushes the ad below the fold.
   - Close button 44×44px inside the safe-area top inset; ad bar gets safe-area bottom padding.
   - Header with title + close, then the iframe (Vimeo/YouTube via a `toEmbedUrl()` helper that adds autoplay params)
   - **Below the video: the withdraw ad bar** — same creative as the old popup (emerald check circle, "ACCOUNT VERIFIED", "Congratulations! You're eligible to withdraw $X", "Available balance from your activity", emerald "Withdraw Now →" CTA) with CSS keyframe animations: drifting blur blobs, emerald pulse, traveling sheen, CTA glow. Keep the animations — they're the attention driver. Keep the bar compact (~120–160px) so it never crowds the video.
3. Convert every inline video embed to **thumbnail + play button → opens the overlay**: training page cards, dashboard welcome video, premium page tutorial videos.
4. The ad's URL is this app's **own** withdraw/offer affiliate link — take it from the popup you just removed.

**Verify (in the browser, not just in code):** open the overlay on a laptop-height window (~800px) AND a phone — header, full video, and the complete ad including its CTA must all be on screen with zero scrolling; popup gone from all pages; link identical to the old popup's.

---

## Phase 5 — Dashboard / home redesign

Structure (top to bottom), adapted from Robinhood:

1. **Welcome block:** accent eyebrow ("HOME"), `Welcome to {Product}, {FirstName}` (first name from the `users`/profile table, omit gracefully if missing), 2–3 sentence plain-English explanation of the money loop.
2. **Featured getting-started video** — first thing they see. Thumbnail + play → `VideoOverlay`. Full-width "Open Training Academy" CTA under it.
3. **"Let's get started" / "Here's how it works"** — exactly 3 numbered step cards (number circle, "about N minutes" badge in amber, icon + title, short description, full-height CTA button linking to the actual feature). Close with a reassurance card ("That's it… if you get stuck, Support").
4. **Usage stats** (real daily limits/counters — from Phase 1).
5. **Quick Actions** — 3 cards linking to the core tools.
6. **Support card** — gradient icon tile + "Contact Support" CTA.
7. Right rail (desktop): "Next step" nudge + "Your activity" (honest data).

Steps must describe **this** app's actual workflow. Use `Link`/router links, not `<a>` for internal routes.

---

## Phase 6 — Design system (audit → define → apply)

This phase only works if you audit first. Don't define tokens from memory — count what actually exists.

**6a. Audit every page.** For each route record: h1 classes, eyebrow presence, subtitle style, container max-width, column structure, section-heading styles, every distinct button style, every card background/border/radius, every hardcoded color. Roll up the counts. (On Profit Loop this found **6 different h1 styles, 5 max-widths, ~15 ad-hoc button styles, 3 competing card systems, ~15 off-system colors** — expect similar in every app.) The audit output is your worklist.

**6b. Define the system** as CSS classes + tokens in `globals.css`, documented in `DESIGN_SYSTEM.md`. The system must cover, at minimum:

1. **Color tokens:** app canvas (tinted off-black ~10% lifted from `#000`, e.g. `#0c0a0e`), elevated panel, glass card, one primary accent + one gradient partner, soft-accent for labels, 2 muted text tones, semantic success/danger/warning. **Map every stray color to a token** (all the ad-hoc indigos/blues → the gradient partner; keep only real brand marks like a Facebook icon and semantic states). Ad creatives (promo banner, withdraw bar) keep their own palette on purpose — exclude them from the sweep.
2. **Type scale as reusable classes** — one hierarchy, used by name: `ds-h1` (page title, clamp ~1.75–2.4rem, one per page), `ds-h2` (section), `ds-h3` (card), `ds-h4` (micro uppercase label), `ds-label` (form field), `ds-subtitle`, `page-eyebrow`. Hype/premium pages may add `italic uppercase` *modifiers* but never a different size. Body ≥15px mobile; inputs ≥16px.
3. **A `PageHeader` component** (eyebrow + h1 + subtitle + right-side actions slot, fixed bottom margin) — every page starts with it. This single component kills most heading drift.
4. **Layout templates — ONE container width for the whole app.** Every page uses the same outer container (e.g. `max-w-7xl mx-auto`) so content starts at the exact same x-position on every route; inside it, templates vary: one-column, two-column-with-rail (`grid xl:grid-cols-4`, main `col-span-3`), catalog (filter rail + content), landing moment, auth (`max-w-md`). A page that needs a narrower reading column constrains an *inner* block — never the page container. Verify with `grep -rn "max-w-" app/(protected)/*/page.tsx`: exactly one container class should appear. All templates collapse to one column + full-width CTAs + bottom-nav clearance on mobile.
   **This applies to premium/hype pages too:** they get the same `PageHeader` (eyebrow + title + subtitle) as every other page; their hero cards keep the flavor but the hero's big title becomes an `h2` *below* the standard header. Same header component on 100% of pages — no exceptions, or it isn't a system.
   **Pages with semantic color themes** (e.g. a green "security" page): the semantic color stays only on status pills/checkmarks; stat values, headers, surfaces, and structure use the system tokens.
5. **Button system** — primary (brand gradient, defined hover: brightness+lift, active: scale .98, accent shadow), secondary (white/5 + border), soft-accent tertiary, ghost, danger, and a `chip` style for tabs/filters (active = solid accent). Three sizes with min-heights (36/44/52px). Ship them **both** as component variants and as plain CSS classes (`.btn .btn-primary .btn-lg`) so raw `<a>`/`<Link>` CTAs render identically to the component. **One primary per screen region** — cognitive-load rule. **Text on filled/gradient CTAs is white, always** — black text on a saturated gradient fails contrast and looks broken; reserve dark text only for very light fills (e.g. solid amber). After the sweep, `grep 'text-black' | grep 'gradient\|btn\|bg-\['` must return only intentional light-fill cases.
6. **Surface system** — one card recipe (glass bg, 1px border, rounded-2xl) plus a `ds-well` class for content boxes *inside* cards. Radius hierarchy: inner elements tighter than containers.
7. **Media rules** — every thumbnail gets a bottom-heavy gradient **scrim** (`~72%→12%` black) under its play button so buttons/captions never fight the artwork (a flat 10% overlay is not enough); one play-button spec; playback only in the shared overlay.
8. **Sidebar spec** — lifted tinted surface (never pitch black), plus a **collapse toggle**: width via a CSS variable (`--sidebar-w: 280px ↔ ~76px`), toggled through `html[data-sidebar]`, persisted in `localStorage`, main pane padding `lg:pl-[var(--sidebar-w)]` with a width transition; collapsed mode is icon-only with `title` tooltips. **The brand name never wraps**: `whitespace-nowrap` (+ `&nbsp;` between words) on the logo text in the sidebar AND the mobile top bar — check it at the collapsed width and at 320px. Size the wordmark so it fits beside the collapse button without squeezing.
9. **UX guardrails** — 4px spacing base, section gap 24px, touch ≥44px, ≥8px between targets, ≤3 choices per decision point, progressive disclosure for multi-step flows, visible focus rings, `prefers-reduced-motion` support, contrast: body copy never darker than mid-gray on card surfaces.

**6c. Apply page by page — in parallel if possible.** Split routes into batches (core tools / premium / content+auth) and sweep each against the audit: PageHeader in, heading classes swapped, buttons onto the system, wells unified, colors mapped. Hard constraints for the sweep: class/JSX-structure edits only, no logic/handler/link/video-ID changes, ad creatives untouched, typecheck after every batch.

**Verify:** re-run the audit greps — h1 styles should be down to 1 (+1 allowed home hero), buttons to the named set, no off-system hex codes outside ad creatives; typecheck clean; links byte-identical to the Phase 0 baseline.

---

## Phase 7 — Training video thumbnails

1. **Generate one image per training video** with AI (16:9 landscape). Consistent style spec:
   - Dark charcoal background, the app's accent color as neon glow (vignette edges)
   - Huge outlined episode number ("01"…) on the left in glowing accent outline
   - Red pill "TRAINING" badge (gold "PREMIUM" for premium videos)
   - Bold condensed italic title, key word in accent gradient
   - Content-specific 3D graphics per topic (envelope for emails, map pin for leads, rocket for accelerator…)
   - Cinematic lighting, depth of field, no watermark, no tiny unreadable text
2. Save to `public/thumbnails/`, mapped by video ID in a lib:
   ```ts
   export const VIDEO_THUMBNAILS: Record<string, string> = { '<vimeoId>': '/thumbnails/thumb-01-….webp', … }
   export function getVideoThumbnail(videoUrl: string): string | null { /* parse id, lookup */ }
   ```
3. Consume everywhere a video preview shows (training cards, dashboard video, premium pages): `<img>` with a **gradient scrim** (bottom-heavy, ~72%→12% black — not a flat overlay) + play button. Fallback to a gradient block if no thumbnail.
4. **Optimize before committing** — see Phase 9.

---

## Phase 8 — Mobile app behavior

Foundations (once, globally):
- `export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: <bg token> }` in the root layout
- `appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: <Product> }` in metadata
- `app/manifest.ts`: name, `display: 'standalone'`, theme/background = bg token, 192/512 icons → installable PWA
- CSS: `-webkit-tap-highlight-color: transparent`, `overscroll-behavior-y: none` on body, inputs ≥16px, `min-h-dvh` instead of `min-h-screen`
- Shell: content gets `pb-24` on mobile (clearance for tab bar) + `env(safe-area-inset-top)` padding under the top bar

Bottom tab bar (`lg:hidden`, desktop keeps the sidebar):
- Exactly 5 items: Home + the 3 highest-traffic tools + **More**; 64px tall + `env(safe-area-inset-bottom)`
- Icon 24px over an 11px semibold label; active = accent color + 3px gradient bar across the item top; instant `active:` feedback, no animation delays
- **More** opens a bottom sheet (slide up, backdrop dismiss, drag handle): remaining main pages, Premium group, **exclusive offers copied verbatim from the desktop sidebar**, Support, Sign out — rows ≥52px
- Replace the hamburger with a slim ~56px top bar (logo + product name)
- z-order: tab bar `z-50` < sheets `z-[60/70]` < video overlay `z-[120]`

Page passes: stack grids to one column, full-width 48–56px CTAs, dialogs become full-screen `dvh` sheets, video overlay full-screen with the ad bar stacked.

**Verify:** iPhone SE (375px) + Pro Max (430px) + Android (~412px); tab bar never covers the last CTA; no input zoom; overlay sits above the tab bar.

---

## Phase 9 — Cleanup + asset optimization (speed pass)

**Dead code:**
- Components no longer imported anywhere (e.g. the removed popup) → delete the file
- Unused imports/props flagged by `tsc`/ESLint → remove
- On external drives (macOS): delete AppleDouble junk and ignore it:
  ```bash
  printf "\n# macOS AppleDouble files\n._*\n**/._*\n" >> .gitignore
  find . -name "._*" -not -path "./node_modules/*" -not -path "./.git/*" -delete
  ```

**Images** (use `sharp` from node_modules — no extra installs):
- Thumbnails/photos: resize to 1280px wide, convert to **WebP quality 82** → ~2MB PNG becomes ~120–160KB with no visible loss. Delete the original PNGs and update every reference (map lib + any hardcoded paths).
- Logos/icons: resize to display size (a 40px sidebar logo does not need an 800px source), recompress PNG with `palette: true`.
- One-liner shape:
  ```js
  await sharp(src).resize({ width: 1280 }).webp({ quality: 82 }).toFile(out)
  ```
- Add `loading="lazy" decoding="async"` to every below-the-fold `<img>`; keep the hero image eager.
- Budget: whole `public/` folder under ~5MB; single image under ~200KB.

**Security sanity check (read-only):**
- Run the database advisor (e.g. Supabase `get_advisors`) and **report** findings — don't apply migrations to a live DB without explicit approval
- Confirm `.env*` is gitignored and no keys are hardcoded in `src/`
- Confirm service-role keys only appear in server-side code (API routes), never client components

**Verify:** `npx tsc --noEmit` clean, `grep` link audit matches Phase 0 baseline, `du -sh public` within budget.

---

## Phase 10 — Verify on localhost BEFORE claiming done

Nothing ships on greps and a typecheck alone. Static checks miss layout bugs: an ad below the fold, a wrapped logo, black text on a gradient, content starting at different x-positions per page — all of these pass `tsc` happily.

1. `npm run dev`, log in with a real test account.
2. Walk **every route** at three widths: desktop (~1440), laptop-height window (~800px tall), phone (375–430 via devtools device mode). Per page check:
   - Header: same eyebrow/title/subtitle pattern, same start position, same container width
   - Buttons: primary CTAs identical (gradient, white text, same radius/height); no black-on-gradient
   - No page with its own colors/structure outside the system
3. Open **every overlay/modal/sheet**: video overlay (ad fully visible without scroll), More sheet, dialogs.
4. Trigger **every generation CTA**: progress bar + banner during, banner stays after, results correct.
5. Mobile specifics: brand name on one line, bottom tabs don't cover the last CTA, no input zoom, top bar clean (no stray hamburger — More lives in the bottom tabs), **no floating toasts/popups covering content** (they must be `hidden` below `lg`).
6. If a browser-automation tool (Chrome DevTools MCP / Playwright) is available, screenshot each route at the three widths and eyeball the set side-by-side; if not, do it by hand. **Do not report "done" until this walk is complete.**
7. Compare against the Phase 0b "before" screenshots — every complaint you catalogued must be visibly fixed, and nothing that worked before may look worse.

## Phase 11 — Ship

```bash
git add -A
git commit -m "<phase summary>"
git push origin main
```

Then re-check the deployed site (desktop + a real phone). Confirm:
1. All revenue links click through to the right offers
2. Videos play in the overlay with the ad bar fully visible
3. Generation CTAs show progress + banner, results still arrive
4. Bottom nav works, nothing hidden behind it
5. Pages load fast (thumbnails are WebP, no multi-MB requests in the network tab)

---

## Appendix — Running this playbook with Cursor agents (model routing + token economy)

The playbook has two kinds of work: **judgment** (audits, system design, review) and **mechanical application** (class sweeps, file-by-file edits). Route them to different models or you'll either waste tokens or ship slop.

### Model routing — phase by phase

| Phase | Work | Model / agent | Why |
|---|---|---|---|
| 0 | Ground rules, link baseline | **Strategy** (frontier reasoning — Fable/Claude thinking tier) | Sets the constraints everything else obeys |
| 0b | Route/component mapping | **Explore subagent(s)**, launched in parallel | Cheap, exhaustive, read-only |
| 0b | Localhost click-through + "before" screenshots | **Strategy** (or you by hand) | Judgment about what's wrong |
| 1–5 | Honest data, banner wiring, overlay, dashboard | **Strategy designs the component once → applier replicates across pages** | The first instance needs taste; copies don't |
| 6a | Design audit (count every h1/button/color/width) | **Explore subagent** with an exhaustive checklist prompt | Mechanical counting, big context |
| 6b | Design-system definition + skill reading | **Strategy** | This is the highest-judgment step in the playbook |
| 6c | Page sweeps | **Applier** (fast — Composer tier), 3–5 similar pages per batch, batches in parallel | Mechanical once the class map exists |
| 7 | Thumbnail prompts + generation | **Strategy** writes the style spec once; images via the image tool | Consistency comes from the spec |
| 8 | Mobile foundations | **Strategy** for the shell (nav/viewport/safe-areas), **applier** for per-page passes | Shell decisions are structural |
| 9 | Cleanup + image optimization | **Applier** with exact commands | Pure mechanics |
| 10 | Browser walk + diff review | **Strategy** | The applier cannot judge its own output |

**Be very detailed in every prompt.** Vague prompts are what cause pushback loops. An applier prompt must read like a work order: exact files, exact old→new mappings, exact forbidden list, exact exit checks. A strategy prompt must include the full findings document from Phase 0b, not a summary of it.

### How to keep the applier from breaking things

The applier fails in predictable ways: inventing its own styles, "improving" logic, touching links, missing files. Every applier prompt must contain:

1. **The exact class map** — old → new, as a table. Never "make it consistent"; say `text-4xl font-bold gradient-text` → `ds-h1` etc.
2. **A forbidden list**: no logic/state/handler/timeout changes, no link/URL edits, no video-ID edits, do-not-touch files by name (ad creatives, API routes).
3. **A scoped file list** — 3–5 similar pages per prompt, never "the whole app".
4. **A required exit command**: `npx tsc --noEmit` must pass; report what changed per file.
5. **A git checkpoint before each batch** so any batch can be reverted alone (`git commit` per phase/batch).
6. After each batch, the **strategy model reviews `git diff --stat` + spot-reads the diff** looking specifically for: new hardcoded colors, black text on filled buttons, changed hrefs, container-width drift, deleted handlers. Then run the Phase 0 link grep and diff against baseline.

### Token economy

- Paste the **audit table** into applier prompts, not source files — the applier reads the files itself.
- Point to `DESIGN_SYSTEM.md` as the single spec; never restate it per prompt.
- Batch pages by similarity (all form pages together, all premium pages together) so one prompt's rules cover the whole batch.
- Ask the applier to verify with **greps, not re-reads** (e.g. `grep -c 'ds-h1' page.tsx` should be 1).
- Do the browser walk yourself (or with one strategy-model session + screenshots) — don't burn applier tokens on "verify visually" they can't do.
- One retry max per applier batch; if it fails twice, the spec was ambiguous — fix the spec with the strategy model instead of re-prompting.

### Known failure modes (each of these caused real pushback — check them explicitly)

This is the "don't make me tell you again" list. Verify every item before reporting done:

1. **Overlay ad below the fold** — the withdraw ad must be fully visible with zero scrolling at laptop height and on phones (flex-column panel, video absorbs leftover height).
2. **Brand wordmark wrapping** to two lines in the sidebar or mobile top bar (`whitespace-nowrap` + check at collapsed width and 320px).
3. **Black text on gradient/saturated CTAs** — filled buttons are white-text; grep for it.
4. **Container width / content start position drifting** between pages — one container class app-wide; grep count must be exactly one value.
5. **Premium/hype pages exempting themselves from the header pattern** — same PageHeader on 100% of pages.
6. **Semantic-theme pages** (security = green etc.) going fully off-system — the theme color stays on status elements only.
7. **Floating toasts on mobile** covering content/thumbnails/tab bar — desktop-only, information duplicated in-page.
8. **Claiming "done" from typecheck + greps alone** — the localhost walk (Phase 10) is mandatory; static checks cannot see layout bugs.
9. **Multi-MB images** shipped unoptimized — WebP ≤200KB each, `public/` ≤5MB, lazy-load below the fold.
10. **The applier "improving" things it wasn't asked to touch** — diff review after every batch; revert anything outside the work order.

---

## Appendix — file inventory created by this playbook

| File | Purpose |
|---|---|
| `components/ui/promo-banner.tsx` | Free Training banner (Robinhood design, app's own link) |
| `components/ui/generation-progress.tsx` | Loading bar + banner combo for generation CTAs |
| `components/ui/video-overlay.tsx` | Full-screen player + withdraw ad bar + `toEmbedUrl` |
| `components/ui/how-it-works.tsx` | 3-step onboarding block for the dashboard |
| `components/ui/bottom-nav.tsx` | Mobile tab bar + More sheet |
| `lib/video-thumbnails.ts` | Video ID → thumbnail map + helpers |
| `app/manifest.ts` | PWA manifest |
| `public/thumbnails/*.webp` | Optimized branded thumbnails |
| `DESIGN_SYSTEM.md` | Token reference for this app |
| `MOBILE_GUIDE.md` | Mobile behavior spec for this app |
