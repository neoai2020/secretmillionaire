-- Facebook posts generated in Accelerator, saved per money site (append-only).

create table if not exists public.site_facebook_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  site_id uuid not null references public.sites(id) on delete cascade,
  body text not null,
  batch_id uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now()
);

create index if not exists site_facebook_posts_site_created_idx
  on public.site_facebook_posts (site_id, created_at desc);

alter table public.site_facebook_posts enable row level security;

drop policy if exists "own site facebook posts" on public.site_facebook_posts;
create policy "own site facebook posts" on public.site_facebook_posts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
