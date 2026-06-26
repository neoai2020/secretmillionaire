# Database setup (Supabase)

Apply migrations **in order** when you connect the Supabase MCP or run SQL manually.

## Migration order

| # | File | What it creates |
|---|------|-----------------|
| 1 | `supabase/migrations/20260506000000_user_onboarding.sql` | User onboarding columns |
| 2 | `supabase/migrations/20260617000000_skeleton_core.sql` | Core workflow user scoping |
| 3 | `supabase/migrations/20260626120000_blog_builder.sql` | `sites`, `posts`, `affiliate_clicks`, `blog-images` bucket |
| 4 | `supabase/migrations/20260626130000_user_session_state.sql` | `blog_builder_sessions`, `link_vault`, `extraction_sessions` |

## What is stored in the database (not localStorage/cookies)

| Table | Purpose |
|-------|---------|
| `blog_builder_sessions` | Empire Builder wizard progress per Initiate |
| `link_vault` | DigiStore armed links (Link Vault) |
| `extraction_sessions` | Extraction protocol progress (Connect/Scan/Extract) |
| `sites` | Deployed money site metadata + armed links |
| `posts` | Generated blog posts |
| `affiliate_clicks` | Click tracking |

## API routes (all `Cache-Control: no-store`)

| Route | Methods | Persists |
|-------|---------|----------|
| `/api/blog/session` | GET, PUT, DELETE | Wizard state |
| `/api/blog/link-vault` | GET, PUT | Armed links |
| `/api/extraction/session` | GET, PUT, DELETE | Extraction progress |

Auth session cookies from Supabase are still required for login — only **account feature data** moved off localStorage.

## Apply via Supabase MCP (when connected)

```
apply_migration name=blog_builder query=<contents of 20260626120000_blog_builder.sql>
apply_migration name=user_session_state query=<contents of 20260626130000_user_session_state.sql>
```

**Status:** Not applied to production. Use a **dedicated** Supabase project for SMS — do not point `.env.local` at another app's database (e.g. CashTap).

Or paste both migration files into **Supabase Dashboard → SQL Editor → Run** on the SMS project only.

## Local dev with `DEV_BYPASS_AUTH=true`

API routes need a real Supabase user for database writes. Add to `.env.local`:

```env
SUPABASE_SERVICE_ROLE_KEY=<from Supabase Dashboard → Settings → API → service_role>
```

The app auto-creates a dev user (`dev-local@sms.local`) on first API call when the service role key is set.

## RLS

All session tables use owner-only policies (`auth.uid() = user_id`). Public blog content uses separate read policies on `sites`/`posts` where `status = 'live'`.
