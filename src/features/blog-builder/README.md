# blog-builder (Empire Builder)

Secret Millionaire Society three-click money site protocol.

## Routes

| Click | Path | Action |
|-------|------|--------|
| 1 | `/territory` | Choose Territory (hobby / niche) |
| 2 | `/arm-links` | Arm DigiStore affiliate links |
| 3 | `/deploy` | Generate pillar + 6 cluster posts, publish live |

## Resources

- `/asset` — Asset Command (manage live site, copy URL, view clicks)
- `/link-vault` — Store reusable armed links

## Public

- `/sites/[siteSlug]` — Blog home
- `/sites/[siteSlug]/[postSlug]` — Single post (SEO + JSON-LD)
- `/sites/[siteSlug]/sitemap.xml` — Per-site sitemap
- `/sites/[siteSlug]/rss.xml` — RSS feed

## Env vars

- `RAPIDAPI_KEY`, `RAPIDAPI_HOST`, `RAPIDAPI_IMAGE_HOST`
- `SCRAPER_API_KEY`

## State

Wizard progress and Link Vault are stored in **Supabase** (`blog_builder_sessions`, `link_vault`) — not localStorage. See `DATABASE-SETUP.md`.

## API routes (session)
- `GET/PUT/DELETE /api/blog/session` — wizard progress
- `GET/PUT /api/blog/link-vault` — armed links
